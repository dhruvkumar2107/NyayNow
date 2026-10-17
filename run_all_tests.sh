#!/bin/bash
set -e

echo "========================================================"
echo "  NyayNow Industry-Grade Test Suite Runner"
echo "========================================================"

BACKEND_FAILED=0
PYTHON_FAILED=0
PLAYWRIGHT_FAILED=0

echo -e "\n[1/3] Running Express Backend API Tests (Jest)..."
echo "--------------------------------------------------------"
cd server
if npm test; then
    echo "[SUCCESS] Express Backend API tests passed!"
else
    BACKEND_FAILED=1
    echo "[ERROR] Express Backend API tests failed!"
fi
cd ..

echo -e "\n[2/3] Running Python AI Service Tests (pytest)..."
echo "--------------------------------------------------------"
if python3 -m pytest "python service"; then
    echo "[SUCCESS] Python AI Service tests passed!"
else
    PYTHON_FAILED=1
    echo "[ERROR] Python AI Service tests failed!"
fi

echo -e "\n[3/3] Running Playwright E2E Verification Tests..."
echo "--------------------------------------------------------"
if npx playwright test; then
    echo "[SUCCESS] Playwright E2E verification tests passed!"
else
    PLAYWRIGHT_FAILED=1
    echo "[ERROR] Playwright E2E verification tests failed!"
fi

echo -e "\n========================================================"
echo "  Test Execution Summary"
echo "======================================================="
if [ $BACKEND_FAILED -eq 0 ]; then
    echo "  [PASS] Backend API Layer"
else
    echo "  [FAIL] Backend API Layer"
fi

if [ $PYTHON_FAILED -eq 0 ]; then
    echo "  [PASS] Python AI Service Layer"
else
    echo "  [FAIL] Python AI Service Layer"
fi

if [ $PLAYWRIGHT_FAILED -eq 0 ]; then
    echo "  [PASS] Playwright E2E Layer"
else
    echo "  [FAIL] Playwright E2E Layer"
fi
echo "========================================================"

if [ $BACKEND_FAILED -ne 0 ] || [ $PYTHON_FAILED -ne 0 ] || [ $PLAYWRIGHT_FAILED -ne 0 ]; then
    exit 1
fi

echo -e "\nAll NyayNow test suites passed successfully!"
exit 0
