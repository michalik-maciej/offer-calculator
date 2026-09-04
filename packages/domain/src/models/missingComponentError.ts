import type { ComponentCategory } from "./component"

export type MissingComponentQuery = {
  category?: ComponentCategory
  depth?: number
  height?: number
  id?: string
  width?: number
}

export class MissingComponentError extends Error {
  name = "MissingComponentError" as const
  readonly query: MissingComponentQuery

  constructor(message: string, query: MissingComponentQuery) {
    super(message)
    this.query = query
  }
}

export function isMissingComponentError(
  error: unknown,
): error is MissingComponentError {
  return error instanceof MissingComponentError
}
