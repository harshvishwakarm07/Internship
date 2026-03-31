$ErrorActionPreference = 'Continue'
$base = 'http://localhost:5000/api'
$ts = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$studentEmail = "qa_student_$ts@test.com"
$facultyEmail = "qa_faculty_$ts@test.com"
$adminEmail = "qa_admin_$ts@test.com"
$pwd = 'Pass@1234'

function PrintResult($name, $ok, $detail) {
  if ($ok) { Write-Output "PASS|$name|$detail" }
  else { Write-Output "FAIL|$name|$detail" }
}

# Register valid users
$studentReg = Invoke-RestMethod -Method Post -Uri "$base/auth/register" -ContentType 'application/json' -Body (@{name='QA Student';email=$studentEmail;password=$pwd;role='student'} | ConvertTo-Json)
$facultyReg = Invoke-RestMethod -Method Post -Uri "$base/auth/register" -ContentType 'application/json' -Body (@{name='QA Faculty';email=$facultyEmail;password=$pwd;role='faculty'} | ConvertTo-Json)
$adminReg = Invoke-RestMethod -Method Post -Uri "$base/auth/register" -ContentType 'application/json' -Body (@{name='QA Admin';email=$adminEmail;password=$pwd;role='admin'} | ConvertTo-Json)
PrintResult 'Register valid student/faculty/admin' ($studentReg.token -and $facultyReg.token -and $adminReg.token) 'Tokens returned'

# Duplicate user
try {
  Invoke-RestMethod -Method Post -Uri "$base/auth/register" -ContentType 'application/json' -Body (@{name='Dup';email=$studentEmail;password=$pwd;role='student'} | ConvertTo-Json) | Out-Null
  PrintResult 'Duplicate registration blocked' $false 'No error thrown'
} catch {
  PrintResult 'Duplicate registration blocked' ($_.Exception.Response.StatusCode.value__ -eq 400) $_.ErrorDetails.Message
}

# Invalid register missing fields
try {
  Invoke-RestMethod -Method Post -Uri "$base/auth/register" -ContentType 'application/json' -Body (@{email="bad_$ts@test.com"} | ConvertTo-Json) | Out-Null
  PrintResult 'Invalid registration missing fields' $false 'No validation error'
} catch {
  PrintResult 'Invalid registration missing fields' $true $_.ErrorDetails.Message
}

# Login valid/invalid
$studentLogin = Invoke-RestMethod -Method Post -Uri "$base/auth/login" -ContentType 'application/json' -Body (@{email=$studentEmail;password=$pwd} | ConvertTo-Json)
PrintResult 'Login with correct credentials' ($studentLogin.token) 'Token issued'
try {
  Invoke-RestMethod -Method Post -Uri "$base/auth/login" -ContentType 'application/json' -Body (@{email=$studentEmail;password='Wrong123'} | ConvertTo-Json) | Out-Null
  PrintResult 'Login invalid credentials' $false 'No error thrown'
} catch {
  PrintResult 'Login invalid credentials' ($_.Exception.Response.StatusCode.value__ -eq 401) $_.ErrorDetails.Message
}

$studentToken = $studentLogin.token
$facultyToken = (Invoke-RestMethod -Method Post -Uri "$base/auth/login" -ContentType 'application/json' -Body (@{email=$facultyEmail;password=$pwd} | ConvertTo-Json)).token
$adminToken = (Invoke-RestMethod -Method Post -Uri "$base/auth/login" -ContentType 'application/json' -Body (@{email=$adminEmail;password=$pwd} | ConvertTo-Json)).token

# Protected route no token
try {
  Invoke-RestMethod -Method Get -Uri "$base/internships" | Out-Null
  PrintResult 'Unauthorized access blocked (no token)' $false 'No error thrown'
} catch {
  PrintResult 'Unauthorized access blocked (no token)' ($_.Exception.Response.StatusCode.value__ -eq 401) $_.ErrorDetails.Message
}

# Invalid token
try {
  Invoke-RestMethod -Method Get -Uri "$base/internships" -Headers @{Authorization='Bearer badtoken'} | Out-Null
  PrintResult 'Unauthorized access blocked (invalid token)' $false 'No error thrown'
} catch {
  PrintResult 'Unauthorized access blocked (invalid token)' ($_.Exception.Response.StatusCode.value__ -eq 401) $_.ErrorDetails.Message
}

# Role access checks
try {
  Invoke-RestMethod -Method Get -Uri "$base/admin/users" -Headers @{Authorization="Bearer $studentToken"} | Out-Null
  PrintResult 'Student blocked from admin route' $false 'Student accessed admin'
} catch {
  PrintResult 'Student blocked from admin route' ($_.Exception.Response.StatusCode.value__ -eq 403) $_.ErrorDetails.Message
}
try {
  Invoke-RestMethod -Method Get -Uri "$base/admin/users" -Headers @{Authorization="Bearer $facultyToken"} | Out-Null
  PrintResult 'Faculty blocked from admin route' $false 'Faculty accessed admin'
} catch {
  PrintResult 'Faculty blocked from admin route' ($_.Exception.Response.StatusCode.value__ -eq 403) $_.ErrorDetails.Message
}
$adminUsers = Invoke-RestMethod -Method Get -Uri "$base/admin/users" -Headers @{Authorization="Bearer $adminToken"}
PrintResult 'Admin can access admin users' ($adminUsers.Count -ge 3) "User count=$($adminUsers.Count)"

# Create internship with valid PDF upload
$uploadOut = curl.exe -s -X POST "$base/internships" -H "Authorization: Bearer $studentToken" -F "companyName=QA Corp" -F "role=Intern" -F "startDate=2026-03-01" -F "endDate=2026-09-01" -F "offerLetter=@d:/InternShip/backend/uploads/qa_test_valid.pdf"
$intern = $uploadOut | ConvertFrom-Json
$internId = $intern._id
PrintResult 'Student add internship with offer letter' (![string]::IsNullOrEmpty($internId) -and $intern.offerLetter) "internshipId=$internId offer=$($intern.offerLetter)"

# Invalid file type
$badUpload = curl.exe -s -o NUL -w "%{http_code}" -X POST "$base/internships" -H "Authorization: Bearer $studentToken" -F "companyName=Bad Corp" -F "role=Intern" -F "startDate=2026-03-01" -F "endDate=2026-09-01" -F "offerLetter=@d:/InternShip/backend/uploads/qa_test_invalid.txt"
PrintResult 'Invalid file type rejected' ($badUpload -eq '500') "status=$badUpload (expected validation error)"

# Missing required field internship
$missingUpload = curl.exe -s -o NUL -w "%{http_code}" -X POST "$base/internships" -H "Authorization: Bearer $studentToken" -F "role=Intern" -F "startDate=2026-03-01" -F "endDate=2026-09-01"
PrintResult 'Missing required internship field rejected' ($missingUpload -eq '400') "status=$missingUpload"

# Fetch internships
$myInternships = Invoke-RestMethod -Method Get -Uri "$base/internships" -Headers @{Authorization="Bearer $studentToken"}
PrintResult 'Student can view own internships' ($myInternships.Count -ge 1) "count=$($myInternships.Count)"

# File accessible publicly
$offerUrl = "http://localhost:5000$($intern.offerLetter)"
$offerStatus = curl.exe -s -o NUL -w "%{http_code}" "$offerUrl"
PrintResult 'Uploaded file accessible via /uploads URL' ($offerStatus -eq '200') "status=$offerStatus url=$offerUrl"

# Faculty view all internships
$allIntern = Invoke-RestMethod -Method Get -Uri "$base/internships/all" -Headers @{Authorization="Bearer $facultyToken"}
PrintResult 'Faculty can view all internships' ($allIntern.Count -ge 1) "count=$($allIntern.Count)"

# Faculty approve internship
$updated = Invoke-RestMethod -Method Put -Uri "$base/internships/$internId/status" -Headers @{Authorization="Bearer $facultyToken"} -ContentType 'application/json' -Body (@{status='Approved'} | ConvertTo-Json)
PrintResult 'Faculty can approve internship' ($updated.status -eq 'Approved') "status=$($updated.status)"

# Student blocked from status update
try {
  Invoke-RestMethod -Method Put -Uri "$base/internships/$internId/status" -Headers @{Authorization="Bearer $studentToken"} -ContentType 'application/json' -Body (@{status='Rejected'} | ConvertTo-Json) | Out-Null
  PrintResult 'Student blocked from status update' $false 'Student changed status'
} catch {
  PrintResult 'Student blocked from status update' ($_.Exception.Response.StatusCode.value__ -eq 403) $_.ErrorDetails.Message
}

# Submit report with attachment
$reportOut = curl.exe -s -X POST "$base/reports" -H "Authorization: Bearer $studentToken" -F "internship=$internId" -F "weekNumber=1" -F "content=Weekly QA report" -F "attachment=@d:/InternShip/backend/uploads/qa_test_valid.pdf"
$report = $reportOut | ConvertFrom-Json
PrintResult 'Student submit report' (![string]::IsNullOrEmpty($report._id)) "reportId=$($report._id)"

# Get reports by internship as faculty
$reports = Invoke-RestMethod -Method Get -Uri "$base/reports/$internId" -Headers @{Authorization="Bearer $facultyToken"}
PrintResult 'Faculty can view internship reports' ($reports.Count -ge 1) "count=$($reports.Count)"

# Admin stats and mentor assign
$stats = Invoke-RestMethod -Method Get -Uri "$base/admin/stats" -Headers @{Authorization="Bearer $adminToken"}
PrintResult 'Admin stats endpoint works' ($stats.totalUsers -ge 3 -and $stats.totalInternships -ge 1) "users=$($stats.totalUsers) internships=$($stats.totalInternships)"
$studentUser = $adminUsers | Where-Object { $_.email -eq $studentEmail } | Select-Object -First 1
$facultyUser = $adminUsers | Where-Object { $_.email -eq $facultyEmail } | Select-Object -First 1
$assign = Invoke-RestMethod -Method Put -Uri "$base/admin/assign-mentor/$($studentUser._id)" -Headers @{Authorization="Bearer $adminToken"} -ContentType 'application/json' -Body (@{facultyId=$facultyUser._id} | ConvertTo-Json)
PrintResult 'Admin can assign mentor' ($assign.count -ge 1) "modified=$($assign.count)"

# JWT decode check for exp
$parts = $studentToken.Split('.')
$payload = $parts[1].Replace('-','+').Replace('_','/')
switch ($payload.Length % 4) {
  2 { $payload += '==' }
  3 { $payload += '=' }
}
$json = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($payload))
$obj = $json | ConvertFrom-Json
PrintResult 'JWT contains expiration claim' ($obj.exp -gt $obj.iat) "iat=$($obj.iat) exp=$($obj.exp)"

# Basic response-time test
$dur = Measure-Command {
  1..20 | ForEach-Object {
    Invoke-RestMethod -Method Get -Uri "$base/internships" -Headers @{Authorization="Bearer $studentToken"} | Out-Null
  }
}
$avgMs = [math]::Round($dur.TotalMilliseconds / 20, 2)
PrintResult 'Basic performance avg GET /internships under 500ms' ($avgMs -lt 500) "avgMs=$avgMs"

# Unsupported method smoke
$delStatus = curl.exe -s -o NUL -w "%{http_code}" -X DELETE "$base/internships" -H "Authorization: Bearer $studentToken"
PrintResult 'Unsupported DELETE /internships returns non-2xx' ($delStatus -ge '400') "status=$delStatus"

# Expose runtime variables for follow-up checks
Write-Output "DATA|studentEmail|$studentEmail"
Write-Output "DATA|facultyEmail|$facultyEmail"
Write-Output "DATA|adminEmail|$adminEmail"
Write-Output "DATA|internshipId|$internId"
Write-Output "DATA|offerLetterPath|$($intern.offerLetter)"
