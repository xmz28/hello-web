# Deterministic regressions for incremental importing; no network requests.
$ErrorActionPreference = 'Stop'
$testRoot = Join-Path ([System.IO.Path]::GetTempPath()) ('bili-update-test-' + [Guid]::NewGuid().ToString('N'))
$testTools = Join-Path $testRoot 'tools'
$null = New-Item -ItemType Directory -Path $testTools
$updater = Join-Path $testTools 'update-bilibili-videos.ps1'
Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'update-bilibili-videos.ps1') -Destination $updater
$target = Join-Path $testRoot 'blog-videos.js'
$global:biliTest = @{ requests = @(); failPage = 0; duplicate = $false; wrongOwner = $false; videos = @() }
for ($i = 1; $i -le 150; $i++) {
    $global:biliTest.videos += [pscustomobject]@{
        bvid = ('BVTEST{0:D6}' -f $i); mid = 338302827; created = (1800000000 - $i * 100)
        title = "Video $i"; description = ''; pic = 'https://example.com/cover.jpg'; play = $i
    }
}
function Invoke-RestMethod {
    param($Uri, $Headers, $TimeoutSec)
    $global:biliTest.requests += $Uri
    if ($Uri -match 'bvid=(BV[A-Za-z0-9]+)') {
        $v = $global:biliTest.videos | Where-Object bvid -eq $Matches[1] | Select-Object -First 1
        return @{ code = 0; data = @{ bvid = $v.bvid; owner = @{ mid = 338302827 }; pubdate = $v.created; title = $v.title; pic = $v.pic; stat = @{ view = 1 } } }
    }
    if ($Uri -notmatch 'pn=(\d+)&ps=(\d+)') { throw 'Unexpected list URL' }
    $pn = [int]$Matches[1]; $ps = [int]$Matches[2]
    if ($global:biliTest.failPage -eq $pn) { throw 'Simulated API failure' }
    $batch = @($global:biliTest.videos | Select-Object -Skip (($pn - 1) * $ps) -First $ps)
    if ($global:biliTest.duplicate -and $pn -eq 2) { $batch[0] = $global:biliTest.videos[0] }
    if ($global:biliTest.wrongOwner) { $batch[0] = [pscustomobject]@{ bvid = 'BVWrong'; mid = 1 } }
    return @{ code = 0; data = @{ list = @{ vlist = $batch } } }
}
function Start-Sleep { param($Seconds) }
function Assert($Condition, $Message) { if (-not $Condition) { throw "FAILED: $Message" } }
function Read-Snapshot {
    $raw = [System.IO.File]::ReadAllText($target)
    return ($raw.Substring('window.blogVideoSnapshot = '.Length).Trim().TrimEnd(';') | ConvertFrom-Json)
}
function Expect-Failure($Action) {
    $before = [System.IO.File]::ReadAllText($target)
    $failed = $false
    try { & $Action } catch { $failed = $true }
    Assert $failed 'Expected updater to fail'
    Assert ($before -ceq [System.IO.File]::ReadAllText($target)) 'Failure must preserve snapshot bytes'
}
try {
    & $updater -Count 60
    Assert ((Read-Snapshot).posts.Count -eq 60) 'Initial import'
    $initial = [System.IO.File]::ReadAllText($target)
    $global:biliTest.requests = @()
    & $updater
    Assert ($global:biliTest.requests.Count -eq 1) 'Unchanged feed needs only one list page'
    Assert ($initial -ceq [System.IO.File]::ReadAllText($target)) 'Unchanged run must not rewrite'
    & $updater -Backfill -Count 60
    $snapshot = Read-Snapshot
    Assert ($snapshot.posts.Count -eq 120) 'Backfill must append 60 and retain 60'
    Assert ($snapshot.posts[-1].id -eq 'video-BVTEST000120') 'Backfill boundary'
    Assert (@($snapshot.posts.id | Select-Object -Unique).Count -eq 120) 'Merged IDs unique'
    $global:biliTest.requests = @()
    & $updater -Bvid @('BVTEST000120')
    Assert ($global:biliTest.requests.Count -eq 0) 'Known IDs need no detail requests'
    # More new videos than Count: keep paging to the known boundary.
    $global:biliTest.videos = @([pscustomobject]@{ bvid = 'BVNewA'; mid = 338302827; created = 1800000200; title = 'New A'; description = ''; pic = 'https://example.com/a.jpg'; play = 1 }, [pscustomobject]@{ bvid = 'BVNewB'; mid = 338302827; created = 1800000100; title = 'New B'; description = ''; pic = 'https://example.com/b.jpg'; play = 1 }) + $global:biliTest.videos
    & $updater -Count 1
    Assert ((Read-Snapshot).posts.Count -eq 122) 'Import all new videos through known boundary'
    Assert ((Read-Snapshot).posts[0].id -eq 'video-BVNewA') 'Newest first even on the same day'
    $extra = @(for ($i = 1; $i -le 55; $i++) {
        [pscustomobject]@{ bvid = ('BVEXTRA{0:D6}' -f $i); mid = 338302827; created = (1800010000 - $i * 10); title = "Extra $i"; description = ''; pic = 'https://example.com/extra.jpg'; play = 1 }
    })
    $global:biliTest.videos = $extra + $global:biliTest.videos
    $global:biliTest.requests = @()
    & $updater -Count 1
    Assert ((Read-Snapshot).posts.Count -eq 177) 'New uploads spanning multiple pages must all be imported'
    Assert ($global:biliTest.requests.Count -eq 2) 'Incremental scan continues until overlap on second page'
    & $updater -Bvid @('BVTEST000150')
    Assert ((Read-Snapshot).posts.Count -eq 178) 'Manual selection appends without deleting history'
    Assert (-not (Read-Snapshot).complete) 'Manual selection must not claim continuous latest coverage'
    $global:biliTest.failPage = 2
    Expect-Failure { & $updater -Backfill -Count 5 }
    $global:biliTest.failPage = 0
    $global:biliTest.duplicate = $true
    Expect-Failure { & $updater -Backfill -Count 5 }
    $global:biliTest.duplicate = $false
    $global:biliTest.wrongOwner = $true
    Expect-Failure { & $updater }
    $global:biliTest.wrongOwner = $false
    $global:biliTest.videos = @($global:biliTest.videos | Where-Object bvid -ne 'BVTEST000120')
    Expect-Failure { & $updater -Backfill -Count 5 }
    Write-Output 'Passed: initial import, incremental overlap, same-day ordering, 60-video backfill, no-op reruns, known-ID skip, API failure, pagination duplicates, owner mismatch, missing anchor.'
} finally {
    Remove-Variable biliTest -Scope Global
    Get-ChildItem -LiteralPath $testTools -File | Remove-Item
    Get-ChildItem -LiteralPath $testRoot -File | Remove-Item
    Remove-Item -LiteralPath $testTools
    Remove-Item -LiteralPath $testRoot
}
