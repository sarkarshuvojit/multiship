# AGENTS.PM.md - Project Manager Agent

This document provides guidance for AI agents acting as a project manager for the Multiship project, using GitHub CLI and GitHub Projects for tracking.

## Role Overview

The PM agent orchestrates development across both `multiship-backend` (Go) and `multiship-ui` (React) codebases. Responsibilities include:

- Tracking project progress via GitHub Projects
- Managing issues and milestones
- Coordinating cross-cutting features
- Maintaining project visibility

## Repository Info

- **Owner:** sarkarshuvojit
- **Repo:** multiship
- **Type:** Full-stack multiplayer Battleship game

## GitHub CLI Quick Reference

### Authentication

```bash
# Check auth status
gh auth status

# Add project scope if needed
gh auth refresh -s project
```

### Project Management

```bash
# List all projects
gh project list --owner sarkarshuvojit

# View project details
gh project view <project-number> --owner sarkarshuvojit

# Create new project
gh project create --owner sarkarshuvojit --title "Multiship Roadmap"

# List project fields (columns/status)
gh project field-list <project-number> --owner sarkarshuvojit

# List items in project
gh project item-list <project-number> --owner sarkarshuvojit
```

### Project Items

```bash
# Create draft issue in project
gh project item-create <project-number> --owner sarkarshuvojit \
  --title "Task title" \
  --body "Task description"

# Add existing issue/PR to project
gh project item-add <project-number> --owner sarkarshuvojit \
  --url https://github.com/sarkarshuvojit/multiship/issues/123

# Edit item field (e.g., status)
gh project item-edit --id <item-id> \
  --field-id <field-id> \
  --project-id <project-id> \
  --single-select-option-id <option-id>

# Archive completed item
gh project item-archive <project-number> --owner sarkarshuvojit --id <item-id>
```

### Issue Management

```bash
# List open issues
gh issue list

# List issues with labels
gh issue list --label "backend"
gh issue list --label "frontend"

# Create issue
gh issue create --title "Issue title" --body "Description" --label "enhancement"

# View issue
gh issue view <issue-number>

# Close issue
gh issue close <issue-number>

# Add comment
gh issue comment <issue-number> --body "Comment text"
```

### Pull Request Tracking

```bash
# List open PRs
gh pr list

# View PR status
gh pr view <pr-number>

# Check PR checks status
gh pr checks <pr-number>
```

## Project Structure

```
multiship/
├── CLAUDE.md              # Main project instructions
├── AGENTS.PM.md           # This file (PM agent guidance)
├── multiship-backend/     # Go WebSocket server
│   └── AGENTS.md          # Backend agent guidance
└── multiship-ui/          # React frontend
    └── AGENTS.md          # Frontend agent guidance
```

## Suggested Labels

| Label | Description | Color |
|-------|-------------|-------|
| `backend` | Go backend tasks | blue |
| `frontend` | React UI tasks | green |
| `websocket` | WebSocket/real-time | purple |
| `game-logic` | Core game mechanics | orange |
| `infra` | Infrastructure/DevOps | gray |
| `bug` | Bug fixes | red |
| `enhancement` | New features | cyan |
| `blocked` | Waiting on dependency | yellow |

## Status Workflow

Typical project board columns:

1. **Backlog** - Planned but not started
2. **Ready** - Ready to be picked up
3. **In Progress** - Currently being worked on
4. **In Review** - PR open, awaiting review
5. **Done** - Completed and merged

## Common PM Tasks

### Check Overall Status

```bash
# Get high-level view
gh issue list --state all --limit 20
gh pr list --state all --limit 10
gh project item-list <project-number> --owner sarkarshuvojit --format json
```

### Create Feature Epic

```bash
# Create parent issue
gh issue create \
  --title "[Epic] Feature Name" \
  --body "## Overview\n\nDescription\n\n## Tasks\n- [ ] Backend: ...\n- [ ] Frontend: ..." \
  --label "enhancement"
```

### Track Sprint Progress

```bash
# List in-progress items
gh project item-list <project-number> --owner sarkarshuvojit --format json \
  | jq '.items[] | select(.status == "In Progress")'
```

### Generate Status Report

```bash
# Combine issue and PR status
echo "=== Open Issues ==="
gh issue list
echo ""
echo "=== Open PRs ==="
gh pr list
echo ""
echo "=== Recent Commits ==="
git log --oneline -10
```

## Cross-Cutting Concerns

Features that span both codebases:

| Feature | Backend | Frontend |
|---------|---------|----------|
| New Event Type | `events/`, `handlers/` | `types/wsevents.ts`, `ws/` |
| Game State | `game/`, `jobs/` | Redux slices |
| Room Management | `repo/room.go` | Room components |
| Player Actions | Handler + Job | Actions + UI |

## Integration Points

When coordinating work:

1. **Event Contract First** - Define event types before implementation
2. **Backend Before Frontend** - API/events should exist before UI consumes them
3. **Shared Types** - Keep `InboundEventType`/`OutboundEventType` in sync
4. **Test Coverage** - Backend E2E tests, frontend manual testing

## Milestone Tracking

Suggested milestones:

1. **MVP** - Basic 3-player game flow
   - Signup, room creation, room joining
   - Board submission and validation
   - Game start transition

2. **Gameplay** - Core game mechanics
   - Turn-based hit/miss system
   - Board updates and state sync
   - Win condition detection

3. **Polish** - User experience
   - Animations and transitions
   - Error handling and feedback
   - Mobile responsiveness

## Useful Queries

```bash
# Issues needing attention (no assignee, open)
gh issue list --assignee "" --state open

# Stale PRs (open > 7 days)
gh pr list --state open --json number,title,createdAt \
  | jq '[.[] | select((now - (.createdAt | fromdateiso8601)) > 604800)]'

# Issues by label count
gh issue list --json labels --jq '[.[].labels[].name] | group_by(.) | map({label: .[0], count: length})'
```

## Notes

- Always check `gh auth status` before project operations
- Project operations require `project` scope
- Use `--format json` for programmatic access
- Draft issues in projects don't appear in repo issue list until converted
