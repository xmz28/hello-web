param(
    [string[]]$Bvid,
    [switch]$Latest30FromProfile
)

$ErrorActionPreference = 'Stop'
$mid = 338302827
$headers = @{
    Referer = "https://space.bilibili.com/$mid/video"
    'User-Agent' = 'Mozilla/5.0'
}
if ($Latest30FromProfile -and @($Bvid).Count -ne 30) { throw 'Profile snapshot requires exactly 30 BVIDs' }
$source = if ($Latest30FromProfile) { 'profile-page-latest-30' } elseif ($Bvid) { 'verified-selection' } else { 'latest-30' }

if ($Bvid) {
    $videos = foreach ($id in $Bvid) {
        if ($id -notmatch '^BV[A-Za-z0-9]+$') { throw "Invalid BVID: $id" }
        $result = Invoke-RestMethod -Uri "https://api.bilibili.com/x/web-interface/view?bvid=$id" -Headers $headers -TimeoutSec 20
        if ($result.code -ne 0 -or $result.data.owner.mid -ne $mid) { throw "BVID does not belong to $mid`: $id" }
        $result.data
    }
} else {
    $url = "https://api.bilibili.com/x/space/arc/search?mid=$mid&ps=30&pn=1&order=pubdate"
    $result = Invoke-RestMethod -Uri $url -Headers $headers -TimeoutSec 20
    if ($result.code -ne 0) { throw "Bilibili list API: $($result.code) $($result.message)" }
    $videos = @($result.data.list.vlist)
    if ($videos.Count -ne 30) { throw "Expected 30 videos, received $($videos.Count)" }
    if (@($videos | Where-Object { $_.mid -ne $mid }).Count) { throw 'Video owner mismatch' }
}

$posts = @($videos | Sort-Object { if ($_.pubdate) { $_.pubdate } else { $_.created } } -Descending | ForEach-Object {
    $video = $_
    $id = [string]$video.bvid
    if ($id -notmatch '^BV[A-Za-z0-9]+$') { throw "Invalid BVID in response: $id" }
    $timestamp = if ($video.pubdate) { [long]$video.pubdate } else { [long]$video.created }
    $date = [DateTimeOffset]::FromUnixTimeSeconds($timestamp).ToOffset([TimeSpan]::FromHours(8)).ToString('yyyy-MM-dd')
    $description = if ($video.desc) { [string]$video.desc } else { [string]$video.description }
    $description = ($description -replace '\s+', ' ').Trim()
    if ($description -in @('-', '--')) { $description = '' }
    if ($description.Length -gt 150) { $description = $description.Substring(0, 150) + '…' }
    $cover = if ($video.pic) { [string]$video.pic } else { [string]$video.cover }
    $cover = $cover -replace '^http:', 'https:'
    if ($cover -notmatch '^https://') { throw "Invalid cover for $id" }
    $views = if ($video.stat) { [long]$video.stat.view } else { [long]$video.play }
    [ordered]@{
        id = "video-$id"
        title = [string]$video.title
        summary = if ($description) { $description } else { '来自小米周的 B 站视频' }
        category = '视频'
        date = $date
        views = $views
        image = $cover
        url = "https://www.bilibili.com/video/$id/"
        content = @('点击下方按钮前往 B 站观看完整视频。')
    }
})

$snapshot = [ordered]@{
    mid = $mid
    updatedAt = (Get-Date).ToString('yyyy-MM-dd')
    source = $source
    complete = ($source -eq 'latest-30' -or $source -eq 'profile-page-latest-30')
    posts = $posts
}
$output = 'window.blogVideoSnapshot = ' + ($snapshot | ConvertTo-Json -Depth 8 -Compress) + ';'
$destination = Join-Path (Split-Path $PSScriptRoot -Parent) 'blog-videos.js'
[System.IO.File]::WriteAllText($destination, $output + "`n", [System.Text.UTF8Encoding]::new($false))
Write-Output "Wrote $($posts.Count) verified videos to $destination"
