$base = 'http://localhost:5000/api'
$users = @(
  @{email='qa_student_1774955744@test.com';password='Pass@1234'},
  @{email='qa_faculty_1774955744@test.com';password='Pass@1234'},
  @{email='qa_admin_1774955744@test.com';password='Pass@1234'}
)

$tokens = @()
foreach ($u in $users) {
  $tokens += (Invoke-RestMethod -Method Post -Uri "$base/auth/login" -ContentType 'application/json' -Body ($u | ConvertTo-Json)).token
}

$sw = [System.Diagnostics.Stopwatch]::StartNew()
$jobs = @()
for ($i = 0; $i -lt 30; $i++) {
  $tk = $tokens[$i % $tokens.Count]
  $jobs += Start-Job -ScriptBlock {
    param($b, $t)
    try {
      Invoke-RestMethod -Method Get -Uri "$b/internships" -Headers @{ Authorization = "Bearer $t" } | Out-Null
      'OK'
    } catch {
      'ERR'
    }
  } -ArgumentList $base, $tk
}

$results = $jobs | Wait-Job | Receive-Job
$sw.Stop()

$ok = ($results | Where-Object { $_ -eq 'OK' }).Count
$err = ($results | Where-Object { $_ -eq 'ERR' }).Count

Write-Output "DATA|concurrentRequests|30"
Write-Output "DATA|concurrentOk|$ok"
Write-Output "DATA|concurrentErr|$err"
Write-Output "DATA|concurrentTotalMs|$([math]::Round($sw.Elapsed.TotalMilliseconds, 2))"
