#!/usr/bin/env node
//
// PreToolUse hook (Bash). Blocks every agent-initiated `git commit` and `git push`,
// tooling bookkeeping included. The same rule is written in CLAUDE.md, but a long
// session can forget an instruction and cannot forget a hook.

const blocked = {
  commit: [
    "Commit blocked: committing is the maintainer's step, never the agent's.",
    "Leave the changes unstaged in the working tree and hand the diff back.",
  ],
  push: [
    "Push blocked: publishing is the maintainer's step, never the agent's.",
    "Say what is ready to go out and let the maintainer push it.",
  ],
}

const payload = await readStdin()
const command = payload?.tool_input?.command ?? ""

if (!/commit|push/.test(command)) process.exit(0)

const attempted = command
  .split(/&&|\|\||;|\||\n/)
  .map(subcommandOf)
  .find((name) => name !== null && Object.hasOwn(blocked, name))

if (attempted === undefined) process.exit(0)

console.error(blocked[attempted].join("\n"))

process.exit(2)

function subcommandOf(segment) {
  const tokens = tokenize(segment)
  if (tokens[0] !== "git") return null

  const optionsTakingValue = new Set([
    "-C",
    "-c",
    "--git-dir",
    "--work-tree",
    "--namespace",
    "--exec-path",
  ])

  for (let index = 1; index < tokens.length; index++) {
    const token = tokens[index]
    if (optionsTakingValue.has(token)) {
      index++
      continue
    }
    if (!token.startsWith("-")) return token
  }

  return null
}

function tokenize(text) {
  const tokens = []
  const pattern = /"((?:[^"\\]|\\.)*)"|'([^']*)'|(\S+)/g
  let match
  while ((match = pattern.exec(text)) !== null) {
    tokens.push(match[1] ?? match[2] ?? match[3])
  }
  return tokens
}

function readStdin() {
  return new Promise((resolve) => {
    let data = ""
    process.stdin.setEncoding("utf8")
    process.stdin.on("data", (chunk) => (data += chunk))
    process.stdin.on("end", () => {
      try {
        resolve(JSON.parse(data))
      } catch {
        resolve(null)
      }
    })
  })
}
