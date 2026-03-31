$base = 'http://localhost:5000/api'
$admin = (Invoke-RestMethod -Method Post -Uri "$base/auth/login" -ContentType 'application/json' -Body (@{email='qa_admin_1774955744@test.com';password='Pass@1234'} | ConvertTo-Json)).token

Write-Output '---POST /admin/users---'
curl.exe -i -X POST "$base/admin/users" -H "Authorization: Bearer $admin" -H "Content-Type: application/json" -d '{"name":"X","email":"x2@test.com","password":"Pass@1234","role":"student"}'

Write-Output '---PUT /reports/:id/feedback---'
curl.exe -i -X PUT "$base/reports/69cbace1e9470c11c1bcf8ed/feedback" -H "Authorization: Bearer $admin" -H "Content-Type: application/json" -d '{"feedback":"Looks good"}'

Write-Output '---PUT /admin/users/123---'
curl.exe -i -X PUT "$base/admin/users/123" -H "Authorization: Bearer $admin" -H "Content-Type: application/json" -d '{"name":"Y"}'
