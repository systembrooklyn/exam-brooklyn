# SDD Features Index

## Navigation

- [Project Overview](00-overview.md)
- [Agent Manual](../.cursor/commands/_shared/agent-manual.md)

## Feature Status Dashboard

### Active Features (In Development)

| Task ID | Feature | Status | Created |
|---------|---------|--------|---------|
| employee-notice-period | Employee notice period flag | Active | 2026-09-12 |
| notice-staff-badge | Notice staff badge | Active | 2026-09-12 |

### Completed Features

| Task ID | Feature | Completed |
|---------|---------|-----------|
| freelancer-payroll | Freelancer management & payroll | 2026-09-23 |
| job-request-prefill | Job request prefill + capacity guard | 2026-09-14 |
| route-persist-on-refresh | Stay on same page after refresh | 2026-09-13 |
| feat-001-sdd-commands | SDD commands bootstrap | — |

### Backlog Features

| Task ID | Feature | Priority |
|---------|---------|----------|
| *none* | — | — |

## Quick Actions

- Create new feature: `/brief [task-id] [description]`
- Full project roadmap: `/sdd-full-plan [project-id] [description]`
- View active specs: `specs/active/`
- View roadmaps: `specs/todo-roadmap/`

## How Specs Are Created

Each command writes to `specs/active/[task-id]/`:

| Command | Creates |
|---------|---------|
| `/brief` | `feature-brief.md` |
| `/research` | `research.md` |
| `/specify` | `spec.md` |
| `/plan` | `plan.md` |
| `/tasks` | `tasks.md` |
| `/implement` | `todo-list.md` + code |
| `/evolve` | Updates existing spec files |
| `/audit` | Audit report (in chat, not saved) |

Project roadmaps go to `specs/todo-roadmap/[project-id]/`.

---
**Version:** SDD 6.0
