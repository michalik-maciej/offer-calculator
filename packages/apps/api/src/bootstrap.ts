import { addAliases } from "module-alias"
import path from "node:path"

addAliases({
  "@/domain": path.join(__dirname, "../../../domain/dist"),
  "@/schemas": path.join(__dirname, "../../../schemas/dist"),
})

// Must be loaded after aliases are registered
import("./server").catch(console.error)
