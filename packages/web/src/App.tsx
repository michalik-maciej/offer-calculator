import { useState } from "react"

const DEFAULT_PAYLOAD = {
  title: "Test offer",
  discountPercentage: 10,
  layouts: [],
}

export default function App() {
  const [payload, setPayload] = useState(
    JSON.stringify(DEFAULT_PAYLOAD, null, 2),
  )
  const [response, setResponse] = useState<unknown>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    setLoading(true)
    setError(null)
    setResponse(null)

    try {
      const res = await fetch("http://localhost:8000/api/offers/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(JSON.stringify(data, null, 2))
      }

      setResponse(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h2>Offer Preview API tester</h2>

      <textarea
        rows={16}
        style={{ width: "100%", fontFamily: "monospace" }}
        value={payload}
        onChange={(e) => setPayload(e.target.value)}
      />

      <button onClick={handleSubmit} disabled={loading}>
        {loading ? "Sending..." : "Send request"}
      </button>

      {error && <pre style={{ color: "red", marginTop: 16 }}>{error}</pre>}

      {!!response && (
        <pre style={{ marginTop: 16 }}>{JSON.stringify(response, null, 2)}</pre>
      )}
    </div>
  )
}
