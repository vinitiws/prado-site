---
name: gitpush
description: Push changes to GitHub and create a pull request with a short description of the changes. Use when the user wants to push commits, create a PR, or uses the /gitpush command. Always asks for confirmation and target branch before pushing.
---

# Git Push & PR

## Overview

This skill automates the process of pushing changes to GitHub and creating a pull request with a concise description. It handles uncommitted changes, generates commit messages, and creates PRs using the GitHub CLI.

## Workflow

1. Check repository status for uncommitted changes or unpushed commits
2. Stage and commit changes if needed
3. Generate a short description of the changes
4. Ask user for confirmation and target branch
5. Push changes to GitHub
6. Create a pull request with the description

## Step-by-Step Instructions

### 1. Check Repository Status

Run `git status` to check for:
- Uncommitted changes (modified, added, or deleted files)
- Unpushed commits on the current branch

### 2. Handle Uncommitted Changes

If there are uncommitted changes:
- Run `git add .` to stage all changes
- Generate a concise commit message based on the changes (use `git diff --cached` to see what changed)
- Run `git commit -m "message"` with the generated message

If there are no uncommitted changes but unpushed commits exist, proceed to the next step.

### 3. Generate PR Description

Create a short description (2-4 sentences) summarizing:
- What was changed
- Why it was changed (if obvious from the changes)
- Key files or components affected

Keep it concise and informative. Use `git log origin/$(git branch --show-current)..HEAD --oneline` to see unpushed commits.

### 4. Ask for Confirmation

Present to the user:
- The current branch name
- The short description of changes
- Ask: "Do you want to push these changes and create a PR?"
- Ask: "Which branch should this PR target?" (suggest `main` or `master` as default)

Wait for user confirmation before proceeding.

### 5. Push Changes

Once confirmed:
- Get the current branch name: `git branch --show-current`
- Push to GitHub: `git push origin <current-branch>`
- If the branch doesn't exist on remote, use: `git push -u origin <current-branch>`

### 6. Create Pull Request

Use GitHub CLI to create the PR:
```bash
gh pr create --title "Brief title" --body "Short description" --base <target-branch>
```

Where:
- `--title`: A concise title (50 chars or less) summarizing the changes
- `--body`: The short description generated in step 3
- `--base`: The target branch specified by the user

If `gh` is not installed, inform the user and provide the GitHub web URL to create the PR manually.

## Error Handling

- If `git` commands fail, show the error and ask the user to resolve it
- If `gh` is not installed, provide instructions to install it or create the PR manually
- If there are no changes to push, inform the user
- If the user declines, stop the workflow without making any changes

## Requirements

- Git must be installed and the directory must be a git repository
- GitHub CLI (`gh`) must be installed and authenticated for PR creation
- User must have push permissions to the repository
