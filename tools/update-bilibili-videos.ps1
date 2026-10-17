param(
    [string[]]$Bvid,
    [switch]$Backfill,
    [ValidateRange(1, 1000)]
    [int]$Count = 60,
    [switch]$Latest30FromProfile,
    [switch]$Latest60FromProfile
)

$ErrorActionPreference = 'Stop'
$mid = 338302827
$destination = Join-Path (Split-Path $PSScriptRoot -Parent) 'blog-videos.js'
$headers = @{
    Referer = "https://space.bilibili.com/$mid/video"
    'User-Agent' = 'Mozilla/5.0'
}
if ($Latest30FromProfile -and $Latest60FromProfile) { throw 'Choose only one profile snapshot size' }
if ($Latest30FromProfile -and @($Bvid).Count -ne 30) { throw 'Profile snapshot requires exactly 30 BVIDs' }
if ($Latest60FromProfile -and @($Bvid).Count -ne 60) { throw 'Profile snapshot requires exactly 60 BVIDs' }
if ($Backfill -and $Bvid) { throw 'Use either -Backfill or -Bvid' }

# Read JSON only; never execute the JavaScript snapshot.
$existing = @()
$previous = $null
if (Test-Path -LiteralPath $destination) {
    $raw = [System.IO.File]::ReadAllText($destination)
    if ($raw -notmatch '(?s)^\s*window\.blogVideoSnapshot\s*=\s*(\{.*\})\s*;\s*$') { throw 'Invalid existing snapshot' }
    $previous = $Matches[1] | ConvertFrom-Json
    if ($previous.mid -ne $mid) { throw 'Existing snapshot owner mismatch' }
    $existing = @($previous.posts)
}
$known = @{}
foreach ($post in $existing) {
    if ($post.id -notmatch '^video-(BV[A-Za-z0-9]+)$') { throw 'Invalid existing video ID' }
    $id = $Matches[1]
    if ($known.ContainsKey($id)) { throw "Duplicate existing BVID: $id" }
    if ($post.url -ne "https://www.bilibili.com/video/$id/") { throw "Existing URL mismatch: $id" }
    $known[$id] = $true
}
if ($Backfill -and -not $existing.Count) { throw 'Import an initial snapshot before using -Backfill' }

function Get-BiliData([string]$Uri) {
    for ($attempt = 1; $attempt -le 3; $attempt++) {
        try {
            $response = Invoke-RestMethod -Uri $Uri -Headers $headers -TimeoutSec 20
            if ($response.code -ne 0) { throw "Bilibili API: $($response.code) $($response.message)" }
            return $response.data
        } catch {
            if ($attempt -eq 3) { throw }
            Start-Sleep -Seconds (3 * $attempt)
        }
    }
}

$videos = @()
$verifiedProfile = $Latest30FromProfile -or $Latest60FromProfile
if ($Bvid) {
    $inputIds = @{}
    foreach ($id in $Bvid) {
        if ($id -notmatch '^BV[A-Za-z0-9]+$') { throw "Invalid BVID: $id" }
        if ($inputIds.ContainsKey($id)) { throw "Duplicate input BVID: $id" }
        $inputIds[$id] = $true
        # Already imported videos do not need another detail request.
        if ($known.ContainsKey($id)) { continue }
        $video = Get-BiliData "https://api.bilibili.com/x/web-interface/view?bvid=$id"
        if ($video.owner.mid -ne $mid -or $video.bvid -ne $id) { throw "BVID does not belong to $mid or response ID mismatch: $id" }
        $videos += $video
    }
} else {
    $anchor = if ($Backfill) { $existing[-1].id.Substring(6) } else { $null }
    $foundAnchor = $false
    $done = $false
    $seen = @{}
    $lastTimestamp = [long]::MaxValue
    $pageSize = 50
    for ($page = 1; -not $done; $page++) {
        if ($page -gt 1) { Start-Sleep -Seconds 3 }
        $data = Get-BiliData "https://api.bilibili.com/x/space/arc/search?mid=$mid&pn=$page&ps=$pageSize&order=pubdate"
        $batch = @($data.list.vlist)
        if (-not $batch.Count) { break }
        foreach ($video in $batch) {
            $id = [string]$video.bvid
            if ($id -notmatch '^BV[A-Za-z0-9]+$' -or $video.mid -ne $mid) { throw 'Invalid video or owner in list response' }
            if ($seen.ContainsKey($id)) { throw 'List changed during pagination; retry without changing the snapshot' }
            $seen[$id] = $true
            $timestamp = [long]$video.created
            if ($timestamp -le 0 -or $timestamp -gt $lastTimestamp) { throw 'List is not ordered by publication time' }
            $lastTimestamp = $timestamp
            if ($Backfill -and -not $foundAnchor) {
                if ($id -eq $anchor) { $foundAnchor = $true }
                continue
            }
            if ($known.ContainsKey($id)) {
                if (-not $Backfill) { $foundAnchor = $true; $done = $true; break }
                continue
            }
            $videos += $video
            # Incremental updates with an existing snapshot must reach an overlap,
            # even when more than Count new videos have been published.
            if (($Backfill -or -not $existing.Count) -and $videos.Count -ge $Count) { $done = $true; break }
        }
        if ($batch.Count -lt $pageSize) { break }
    }
    if ($existing.Count -and -not $foundAnchor) { throw 'Could not locate the previous snapshot in the current list; original snapshot preserved' }
}

if (-not $videos.Count) {
    Write-Output "No new videos; kept $($existing.Count) imported videos."
    return
}
$newPosts = @($videos | ForEach-Object {
    $video = $_
    $id = [string]$video.bvid
    $timestamp = if ($video.pubdate) { [long]$video.pubdate } else { [long]$video.created }
    if ($timestamp -le 0) { throw "Invalid publication time: $id" }
    $date = [DateTimeOffset]::FromUnixTimeSeconds($timestamp).ToOffset([TimeSpan]::FromHours(8)).ToString('yyyy-MM-dd')
    $description = if ($video.desc) { [string]$video.desc } else { [string]$video.description }
    $description = ($description -replace '\s+', ' ').Trim()
    if ($description -in @('-', '--')) { $description = '' }
    if ($description.Length -gt 150) { $description = $description.Substring(0, 150) + '…' }
    $cover = if ($video.pic) { [string]$video.pic } else { [string]$video.cover }
    $cover = $cover -replace '^http:', 'https:'
    if ($cover -notmatch '^https://') { throw "Invalid cover for $id" }
    $views = if ($video.stat) { [long]$video.stat.view } else { [long]$video.play }
    [pscustomobject][ordered]@{
        id = "video-$id"
        title = [string]$video.title
        summary = if ($description) { $description } else { '来自小米周的 B 站视频' }
        category = '视频'
        date = $date
        publishedAt = $timestamp
        views = $views
        image = $cover
        url = "https://www.bilibili.com/video/$id/"
        content = @('点击下方按钮前往 B 站观看完整视频。')
    }
})
# Date is the common key for legacy snapshots; preserve source order on ties.
$newPosts = @($newPosts | Sort-Object -Property publishedAt -Descending)
$merged = if ($Backfill) { @($existing) + @($newPosts) } else { @($newPosts) + @($existing) }
$indexed = for ($i = 0; $i -lt $merged.Count; $i++) {
    [pscustomobject]@{ post = $merged[$i]; index = $i }
}
$posts = @($indexed | Sort-Object @{ Expression = { $_.post.date }; Descending = $true }, index | ForEach-Object { $_.post })
if (@($posts.id | Select-Object -Unique).Count -ne $posts.Count) { throw 'Duplicate BVIDs in merged snapshot' }
$snapshot = [ordered]@{
    mid = $mid
    updatedAt = [DateTimeOffset]::UtcNow.ToOffset([TimeSpan]::FromHours(8)).ToString('yyyy-MM-dd')
    source = if ($Bvid) { 'incremental-verified-selection' } else { 'incremental-pubdate-list' }
    complete = if ($Bvid) { [bool]($verifiedProfile -and (-not $previous -or $previous.complete)) } else { [bool](-not $previous -or $previous.complete) }
    posts = $posts
}
$output = 'window.blogVideoSnapshot = ' + ($snapshot | ConvertTo-Json -Depth 8 -Compress) + ';'
# Stage the complete result before replacing the previous snapshot.
$staging = "$destination.$([Guid]::NewGuid().ToString('N')).tmp"
try {
    [System.IO.File]::WriteAllText($staging, $output + "`n", [System.Text.UTF8Encoding]::new($false))
    Move-Item -LiteralPath $staging -Destination $destination -Force
} finally {
    if (Test-Path -LiteralPath $staging) { Remove-Item -LiteralPath $staging }
}
Write-Output "Imported $($newPosts.Count) new videos; $($posts.Count) videos total in $destination"
