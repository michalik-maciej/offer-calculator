import { type GenericSchema, safeParse } from "valibot"

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

type ApiContract<_, TResponse> = {
  method: HttpMethod
  path: string
  response?: GenericSchema<TResponse>
}

type Input<T> = T extends undefined ? void : { data: T }

export function createApiMethod<TOutput>(
  contract: ApiContract<undefined, TOutput>,
): () => Promise<TOutput>
export function createApiMethod<TData, TOutput>(
  contract: ApiContract<TData, TOutput>,
): (input: { data: TData }) => Promise<TOutput>
export function createApiMethod<TData = undefined, TOutput = unknown>(
  contract: ApiContract<TData, TOutput>,
) {
  return async (input?: Input<TData>): Promise<TOutput> => {
    const body =
      input && typeof input === "object" && "data" in input
        ? JSON.stringify((input as { data: unknown }).data)
        : undefined

    const res = await fetch(contract.path, {
      method: contract.method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body,
    })

    if (!res.ok) {
      const errorBody = await res.text().catch(() => "")
      throw new Error(
        `HTTP ${res.status} ${res.statusText}${errorBody ? `: ${errorBody}` : ""}`,
      )
    }

    // 204 No Content
    if (res.status === 204) {
      return undefined as TOutput
    }

    const text = await res.text()
    const json = text ? (JSON.parse(text) as unknown) : undefined

    if (!contract.response) {
      return json as TOutput
    }

    const parsed = safeParse(contract.response, json)
    if (!parsed.success) {
      throw new Error("Invalid API response")
    }
    return parsed.output
  }
}
