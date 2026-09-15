import { createApp } from "./app"
import { parseEnv } from "./env"

try {
  const { PORT } = parseEnv()

  createApp().listen(PORT, () => {
    console.log(`API running on port ${PORT}`)
  })
} catch (error) {
  console.error(
    "Startup failed:",
    error instanceof Error ? error.message : error,
  )
  process.exit(1)
}
