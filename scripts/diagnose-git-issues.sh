#!/bin/bash

# Git Diagnostic Script
# Helps identify why files might be reverting

echo "=== Git Status Check ==="
git status --short

echo ""
echo "=== Recent Commits ==="
git log --oneline -10

echo ""
echo "=== Local vs Remote Differences ==="
git diff HEAD origin/main --stat

echo ""
echo "=== Uncommitted Changes ==="
git diff --stat

echo ""
echo "=== Branch Information ==="
git branch -vv

echo ""
echo "=== Checking for merge conflicts ==="
git diff --check

echo ""
echo "=== Files that differ from remote ==="
git diff --name-only origin/main

