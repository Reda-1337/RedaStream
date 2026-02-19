# Website Functionality Test Script
Write-Host "Testing Website Functionality..." -ForegroundColor Cyan

# Test Homepage
Write-Host "`n1. Testing Homepage..." -ForegroundColor Yellow
try {
    $homepage = Invoke-WebRequest -Uri "http://localhost:3005/" -UseBasicParsing
    if ($homepage.StatusCode -eq 200) {
        Write-Host "   Homepage loads successfully" -ForegroundColor Green
    } else {
        Write-Host "   Homepage failed with status: $($homepage.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "   Homepage error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test Search API
Write-Host "`n2. Testing Search API..." -ForegroundColor Yellow
try {
    $search = Invoke-WebRequest -Uri "http://localhost:3005/api/search?q=batman" -UseBasicParsing
    if ($search.StatusCode -eq 200) {
        $data = $search.Content | ConvertFrom-Json
        if ($data.results -and $data.results.Count -gt 0) {
            Write-Host "   Search API returns $($data.results.Count) results" -ForegroundColor Green
        } else {
            Write-Host "   Search API returns empty results" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   Search API failed with status: $($search.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "   Search API error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nWebsite testing completed!" -ForegroundColor Cyan