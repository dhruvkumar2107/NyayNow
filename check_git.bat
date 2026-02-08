@echo off
git status > status_log.txt 2>&1
git remote -v >> status_log.txt 2>&1
type status_log.txt
