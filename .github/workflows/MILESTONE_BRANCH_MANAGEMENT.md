# Milestone Branch Management Workflow

This document outlines the implementation details for the Milestone Branch Management workflow.

## Overview

This workflow manages milestone branches and their associated release PRs. It automatically generates changesets for PRs merged into milestone branches and maintains a release PR that tracks all changes that will be included in the milestone.

## Triggers

The workflow is triggered by:

1. When a pull request is merged to any `milestone/*` branch, using the `pull_request_target` event
2. Manually via the GitHub Actions UI using the workflow_dispatch event
   - Go to Actions > Manage Milestone Branches > Run workflow
   - Enter the PR number and milestone branch name
   - Click "Run workflow"

## Implementation

This workflow works in conjunction with the Changeset Generation workflow but specifically handles:
- Milestone branch changesets
- Release PR management from milestone branches to develop
- Release notes generation for milestone changes

## Workflow Jobs

### 1. Debug Event (debug-event)
- Runs for pull_request_target events
- Logs important event details for debugging:
  - Event name
  - Action
  - PR merged status
  - Base and head refs
  - PR number and title

### 2. Generate Changeset (generate-changeset)
Runs when:
- A PR is merged to a milestone branch
- Manually triggered via workflow_dispatch

This job:
1. Checks out the milestone branch
2. Sets up Node.js
3. Installs dependencies
4. Extracts PR information
5. Manages changesets:
   - Checks for existing changesets
   - Removes duplicates if found
   - Generates updated changeset
6. Generates release notes
7. Checks for @since tag updates
8. Manages the release PR:
   - Updates existing PR if found
   - Creates new PR if needed

## Release PR Format

The release PR follows this format:
- Title: `milestone: {milestone-name} 🏁`
- Target: from `milestone/*` to `develop`
- Content:
  ```md
  ## Upcoming Changes

  {Generated changelog from changesets}

  ### 🔄 Pending @since Tag Updates (if any)
  {List of files needing version updates}

  This PR contains all changes that will be included in the next release ({milestone-name}).
  It is automatically updated when new changesets are added to the milestone/* branch.
  ```

## Environment Variables

The workflow uses:
- `REPO_URL`: Set to `https://github.com/${{ github.repository }}`
- `GITHUB_TOKEN`: The default GitHub token provided by Actions

## Prerequisites

The workflow requires:
- Default `GITHUB_TOKEN` with permissions:
  - `contents: write`
  - `pull-requests: write`
- Node.js and npm for running scripts
- Milestone branches following the pattern `milestone/*`

## Error Handling

The workflow includes error handling for:
- PR information extraction
- Changeset management
- Release PR creation/updates
- API responses

All errors are logged with detailed information for debugging purposes.

## Relationship with Changeset Generation

While the Changeset Generation workflow handles changes going into `develop`, this workflow:
- Manages changes in milestone branches
- Creates staging PRs for milestone releases
- Ensures changes are properly tracked before merging to develop

This separation allows for better organization of features and changes that should be released together. 