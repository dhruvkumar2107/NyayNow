@echo off
setlocal enabledelayedexpansion

echo ========================================================
echo   NyayNow Industry-Grade Test Suite Runner
echo ========================================================

set BACKEND_FAILED=0
set PYTHON_FAILED=0
set PLAYWRIGHT_FAILED=0

echo.
echo [1/3] Running Express Backend API Tests (Jest)...
echo --------------------------------------------------------
cd server
call npm test
if %errorlevel% neq 0 (
    set BACKEND_FAILED=1
    echo [ERROR] Express Backend API tests failed!
) else (
    echo [SUCCESS] Express Backend API tests passed!
)
cd ..

echo.
echo [2/3] Running Python AI Service Tests (pytest)...
echo --------------------------------------------------------
python -m pytest "python service"
if %errorlevel% neq 0 (
    set PYTHON_FAILED=1
    echo [ERROR] Python AI Service tests failed!
) else (
    echo [SUCCESS] Python AI Service tests passed!
)

echo.
echo [3/3] Running Playwright E2E Verification Tests...
echo --------------------------------------------------------
call npx playwright test
if %errorlevel% neq 0 (
    set PLAYWRIGHT_FAILED=1
    echo [ERROR] Playwright E2E verification tests failed!
) else (
    echo [SUCCESS] Playwright E2E verification tests passed!
)

echo.
echo ========================================================
echo   Test Execution Summary
echo ========================================================
if !BACKEND_FAILED! equ 0 (
    echo   [PASS] Backend API Layer
) else (
    echo   [FAIL] Backend API Layer
)

if !PYTHON_FAILED! equ 0 (
    echo   [PASS] Python AI Service Layer
) else (
    echo   [FAIL] Python AI Service Layer
)

if !PLAYWRIGHT_FAILED! equ 0 (
    echo   [PASS] Playwright E2E Layer
) else (
    echo   [FAIL] Playwright E2E Layer
)
echo ========================================================

if !BACKEND_FAILED! equ 1 exit /b 1
if !PYTHON_FAILED! equ 1 exit /b 1
if !PLAYWRIGHT_FAILED! equ 1 exit /b 1

echo.
echo All NyayNow test suites passed successfully!
exit /b 0
