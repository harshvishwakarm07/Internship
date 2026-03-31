$ErrorActionPreference = 'Stop'

$base = 'http://localhost:5000/api'
$ts = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$pwd = 'Pass@1234'
$studentEmail = "qa_extra_student_$ts@test.com"
$facultyEmail = "qa_extra_faculty_$ts@test.com"
$adminEmail = "qa_extra_admin_$ts@test.com"
$managedUserEmail = "qa_extra_managed_$ts@test.com"

Invoke-RestMethod -Method Post -Uri "$base/auth/register" -ContentType 'application/json' -Body (@{name='Extra Student';email=$studentEmail;password=$pwd;role='student'} | ConvertTo-Json) | Out-Null
Invoke-RestMethod -Method Post -Uri "$base/auth/register" -ContentType 'application/json' -Body (@{name='Extra Faculty';email=$facultyEmail;password=$pwd;role='faculty'} | ConvertTo-Json) | Out-Null
Invoke-RestMethod -Method Post -Uri "$base/auth/register" -ContentType 'application/json' -Body (@{name='Extra Admin';email=$adminEmail;password=$pwd;role='admin'} | ConvertTo-Json) | Out-Null

$student = (Invoke-RestMethod -Method Post -Uri "$base/auth/login" -ContentType 'application/json' -Body (@{email=$studentEmail;password=$pwd} | ConvertTo-Json)).token
$faculty = (Invoke-RestMethod -Method Post -Uri "$base/auth/login" -ContentType 'application/json' -Body (@{email=$facultyEmail;password=$pwd} | ConvertTo-Json)).token
$admin = (Invoke-RestMethod -Method Post -Uri "$base/auth/login" -ContentType 'application/json' -Body (@{email=$adminEmail;password=$pwd} | ConvertTo-Json)).token

$createInternshipResponse = curl.exe -s -X POST "$base/internships" -H "Authorization: Bearer $student" -F "companyName=Extra QA Corp" -F "role=Intern" -F "startDate=2026-03-01" -F "endDate=2026-09-01" -F "offerLetter=@d:/InternShip/backend/uploads/qa_test_valid.pdf"
$internship = $createInternshipResponse | ConvertFrom-Json
$internId = $internship._id

$createReportResponse = curl.exe -s -X POST "$base/reports" -H "Authorization: Bearer $student" -F "internship=$internId" -F "weekNumber=1" -F "content=Extra QA report" -F "attachment=@d:/InternShip/backend/uploads/qa_test_valid.pdf"
$report = $createReportResponse | ConvertFrom-Json

$noFileInternCode = curl.exe -s -o NUL -w "%{http_code}" -X POST "$base/internships" -H "Authorization: Bearer $student" -F "companyName=NoFile Corp" -F "role=Intern" -F "startDate=2026-03-01" -F "endDate=2026-09-01"
Write-Output "DATA|internshipWithoutFileStatus|$noFileInternCode"

$reportNoFileCode = curl.exe -s -o NUL -w "%{http_code}" -X POST "$base/reports" -H "Authorization: Bearer $student" -F "internship=$internId" -F "weekNumber=2" -F "content=No file report"
Write-Output "DATA|reportWithoutFileStatus|$reportNoFileCode"

$reportBadTypeCode = curl.exe -s -o NUL -w "%{http_code}" -X POST "$base/reports" -H "Authorization: Bearer $student" -F "internship=$internId" -F "weekNumber=3" -F "content=Bad file report" -F "attachment=@d:/InternShip/backend/uploads/qa_test_invalid.txt"
Write-Output "DATA|reportInvalidFileTypeStatus|$reportBadTypeCode"

$certUploadCode = curl.exe -s -o NUL -w "%{http_code}" -X PUT "$base/internships/$internId/certificate" -H "Authorization: Bearer $student" -F "certificate=@d:/InternShip/backend/uploads/qa_test_valid.pdf"
Write-Output "DATA|certificateUploadEndpointStatus|$certUploadCode"

$feedbackResponse = Invoke-RestMethod -Method Put -Uri "$base/reports/$($report._id)/feedback" -Headers @{ Authorization = "Bearer $faculty" } -ContentType 'application/json' -Body (@{feedback='Looks good';status='Reviewed'} | ConvertTo-Json)
Write-Output ('DATA|facultyFeedbackEndpointStatus|' + ($(if ($feedbackResponse.status -eq 'Reviewed') { '200' } else { '500' })))

$managedUser = Invoke-RestMethod -Method Post -Uri "$base/admin/users" -Headers @{ Authorization = "Bearer $admin" } -ContentType 'application/json' -Body (@{name='Managed User';email=$managedUserEmail;password=$pwd;role='student'} | ConvertTo-Json)
$updatedUser = Invoke-RestMethod -Method Put -Uri "$base/admin/users/$($managedUser._id)" -Headers @{ Authorization = "Bearer $admin" } -ContentType 'application/json' -Body (@{name='Managed User Updated'} | ConvertTo-Json)
$deletedUser = Invoke-RestMethod -Method Delete -Uri "$base/admin/users/$($managedUser._id)" -Headers @{ Authorization = "Bearer $admin" }

Write-Output 'DATA|adminCreateUserStatus|201'
Write-Output ('DATA|adminUpdateUserStatus|' + ($(if ($updatedUser.name -eq 'Managed User Updated') { '200' } else { '500' })))
Write-Output ('DATA|adminDeleteUserStatus|' + ($(if ($deletedUser.message -eq 'User deleted successfully') { '200' } else { '500' })))
