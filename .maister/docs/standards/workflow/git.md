## Git Workflow

### The Agent Never Stages, Commits or Pushes

Changes are left unstaged in the working tree so the maintainer can review them file by file and
stage what they accept. `git add` is not run. Committing and pushing stay with the maintainer
without exception, tooling bookkeeping included, and that is enforced rather than trusted: the
`PreToolUse` hook `.claude/hooks/block-agent-commits.mjs` blocks every `git commit` the agent
attempts.

Subagents from plugins are covered by the same hook, but they can still run `git add`. When a tool
stages something on its own, unstage it with `git reset` and say so.

### Everything Happens on main

There are no task branches and no pull requests. One maintainer works on one branch and commits land
directly on `main`. A branch appears only when the maintainer asks for one, for something
speculative that should not touch `main` until it works.

CI runs on push to `main`, so it reports on code that is already there. It is a safety net, not a
gate: `pnpm validate` and `pnpm vitest run` before the commit are the gate.

### Conventional Commit Messages

`{type}: {short description}`, where type is one of `feat`, `fix`, `refactor`, `test`, `chore`,
`docs`. When a commit is due, propose the message and wait rather than acting.

```
feat: add gondola layout calculation
fix: adjust calculation logic for gondola shelves
```

### Never Reach for a Destructive Shortcut

`git reset --hard`, `git checkout -- .`, `git clean`, `git stash` on someone else's work and force
pushes are not tools for getting past an obstacle. If the working tree is in an unexpected state,
report it and stop.
