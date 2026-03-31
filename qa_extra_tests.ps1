$base = 'http://localhost:5000/api'
$student = (Invoke-RestMethod -Method Post -Uri "$base/auth/login" -ContentType 'application/json' -Body (@{email='qa_student_1774955744@test.com';password='Pass@1234'} | ConvertTo-Json)).token
$faculty = (Invoke-RestMethod -Method Post -Uri "$base/auth/login" -ContentType 'application/json' -Body (@{email='qa_faculty_1774955744@test.com';password='Pass@1234'} | ConvertTo-Json)).token
$admin = (Invoke-RestMethod -Method Post -Uri "$base/auth/login" -ContentType 'application/json' -Body (@{email='qa_admin_1774955744@test.com';password='Pass@1234'} | ConvertTo-Json)).token
$internId = '69cbace1e9470c11c1bcf8de'

$noFileInternCode = curl.exe -s -o NUL -w "%{http_code}" -X POST "$base/internships" -H "Authorization: Bearer $student" -F "companyName=NoFile Corp" -F "role=Intern" -F "startDate=2026-03-01" -F "endDate=2026-09-01"
Write-Output "DATA|internshipWithoutFileStatus|$noFileInternCode"

$reportNoFileCode = curl.exe -s -o NUL -w "%{http_code}" -X POST "$base/reports" -H "Authorization: Bearer $student" -F "internship=$internId" -F "weekNumber=2" -F "content=No file report"
Write-Output "DATA|reportWithoutFileStatus|$reportNoFileCode"

$reportBadTypeCode = curl.exe -s -o NUL -w "%{http_code}" -X POST "$base/reports" -H "Authorization: Bearer $student" -F "internship=$internId" -F "weekNumber=3" -F "content=Bad file report" -F "attachment=@d:/InternShip/backend/uploads/qa_test_invalid.txt"
Write-Output "DATA|reportInvalidFileTypeStatus|$reportBadTypeCode"

$certUploadCode = curl.exe -s -o NUL -w "%{http_code}" -X POST "$base/internships/$internId/certificate" -H "Authorization: Bearer $student" -F "certificate=@d:/InternShip/backend/uploads/qa_test_valid.pdf"
Write-Output "DATA|certificateUploadEndpointStatus|$certUploadCode"

$feedbackCode = curl.exe -s -o NUL -w "%{http_code}" -X PUT "$base/reports/69cbace1e9470c11c1bcf8ed/feedback" -H "Authorization: Bearer $faculty" -H "Content-Type: application/json" -d '{"feedback":"Looks good","status":"Reviewed"}'
Write-Output "DATA|facultyFeedbackEndpointStatus|$feedbackCode"

$adminCreateCode = curl.exe -s -o NUL -w "%{http_code}" -X POST "$base/admin/users" -H "Authorization: Bearer $admin" -H "Content-Type: application/json" -d '{"name":"X","email":"x@test.com","password":"Pass@1234","role":"student"}'
$adminUpdateCode = curl.exe -s -o NUL -w "%{http_code}" -X PUT "$base/admin/users/123" -H "Authorization: Bearer $admin" -H "Content-Type: application/json" -d '{"name":"Y"}'
$adminDeleteCode = curl.exe -s -o NUL -w "%{http_code}" -X DELETE "$base/admin/users/123" -H "Authorization: Bearer $admin"
Write-Output "DATA|adminCreateUserStatus|$adminCreateCode"
Write-Output "DATA|adminUpdateUserStatus|$adminUpdateCode"
Write-Output "DATA|adminDeleteUserStatus|$adminDeleteCode"
