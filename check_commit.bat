@echo off
git log -1 > last_commit.txt 2>&1
type last_commit.txt
git status > git_status.txt 2>&1
type git_status.txt
