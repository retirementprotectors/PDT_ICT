#!/bin/bash

# Backup the current state
echo "Creating backup branch..."
git checkout -b backup_before_cleanup

# Remove large files from Git history
echo "Removing large files from Git history..."
git filter-branch --force --index-filter '
  git rm -r --cached --ignore-unmatch \
    .backups/* \
    .refactor-backup/* \
    *.tar.gz \
    *.zip \
    node_modules/* \
    dist/* \
    build/* \
    coverage/* \
    .DS_Store \
    **/*.pdf \
    **/*.docx \
    **/*.xlsx \
    **/*.pptx \
    **/*.mp4 \
    **/*.mov
' --prune-empty --tag-name-filter cat -- --all

# Remove the original refs
echo "Cleaning up refs..."
git for-each-ref --format="%(refname)" refs/original/ | xargs -n 1 git update-ref -d

# Cleanup and optimize the repository
echo "Running garbage collection..."
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push changes
echo "Ready to force push changes."
echo "Review the changes and then run:"
echo "git push origin --force --all"
echo "git push origin --force --tags" 