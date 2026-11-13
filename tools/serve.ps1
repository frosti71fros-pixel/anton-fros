param([string]$Root, [int]$Port = 8765)
$l = New-Object System.Net.HttpListener
$l.Prefixes.Add("http://localhost:$Port/")
$l.Start()
Write-Host "Serving $Root on http://localhost:$Port/"
while ($l.IsListening) {
  $ctx = $l.GetContext()
  try {
    $p = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath.TrimStart('/'))
    if ($p -eq '') { $p = 'index.html' }
    $f = Join-Path $Root $p
    if (Test-Path $f -PathType Leaf) {
      $b = [IO.File]::ReadAllBytes($f)
      if ($f -like '*.html') { $ctx.Response.ContentType = 'text/html; charset=utf-8' }
      $ctx.Response.ContentLength64 = $b.Length
      if ($ctx.Request.HttpMethod -ne 'HEAD') { $ctx.Response.OutputStream.Write($b, 0, $b.Length) }
    } else { $ctx.Response.StatusCode = 404 }
  } catch {
    # a dropped connection or HEAD request must not kill the server
  } finally {
    try { $ctx.Response.Close() } catch {}
  }
}
