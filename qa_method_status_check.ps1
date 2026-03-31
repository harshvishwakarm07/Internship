$base = 'http://localhost:5000/api'
$admin = (Invoke-RestMethod -Method Post -Uri "$base/auth/login" -ContentType 'application/json' -Body (@{email='qa_admin_1774955744@test.com';password='Pass@1234'} | ConvertTo-Json)).token
$headers = @{ Authorization = "Bearer $admin" }

function Check($name, $method, $uri, $body) {
  try {
    if ($null -ne $body) {
      Invoke-RestMethod -Method $method -Uri $uri -Headers $headers -ContentType 'application/json' -Body ($body | ConvertTo-Json) | Out-Null
      Write-Output "DATA|$name|200"
    } else {
      Invoke-RestMethod -Method $method -Uri $uri -Headers $headers | Out-Null
      Write-Output "DATA|$name|200"
    }
  } catch {
    Write-Output "DATA|$name|$($_.Exception.Response.StatusCode.value__)"
    if ($_.ErrorDetails.Message) { Write-Output "DATA|$name-message|$($_.ErrorDetails.Message)" }
  }
}

Check 'adminCreateUserMethod' 'Post' "$base/admin/users" @{name='x';email='x3@test.com';password='Pass@1234';role='student'}
Check 'adminUpdateUserMethod' 'Put' "$base/admin/users/123" @{name='y'}
Check 'adminDeleteUserMethod' 'Delete' "$base/admin/users/123" $null
Check 'facultyFeedbackMethod' 'Put' "$base/reports/69cbace1e9470c11c1bcf8ed/feedback" @{feedback='good';status='Reviewed'}
