#!/usr/bin/env node
//
// PreToolUse hook (Bash). Blocks every agent-initiated `git commit`, including
// commits of tooling bookkeeping such as Maister's task artifacts. The same
// rule is written in CLAUDE.md, but a long session can forget an instruction
// and cannot forget a hook.

const payload = await readStdin()
const command = payload?.tool_input?.command ?? ""

if (!command.includes("commit")) process.exit(0)

const commits = command.split(/&&|\|\||;|\||\n/).some((segment) => {
  const parts = tokenize(segment)
  return parts[0] === "git" && parts[1] === "commit"
})

if (!commits) process.exit(0)

console.error(
  [
    "Commit blocked: committing is the maintainer's step, never the agent's.",
    "Leave the changes unstaged in the working tree and hand the diff back.",
  ].join("\n"),
)

process.exit(2)

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
