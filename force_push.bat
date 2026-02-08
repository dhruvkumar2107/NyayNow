@echo off
echo Starting Git Operation > push_debug.log
echo [1/3] Adding files... >> push_debug.log
git add . >> push_debug.log 2>&1
echo [2/3] Committing... >> push_debug.log
git commit -m "Rebrand to NyayNow" >> push_debug.log 2>&1
echo [3/3] Pushing... >> push_debug.log
git push origin main >> push_debug.log 2>&1
echo Done. >> push_debug.log
