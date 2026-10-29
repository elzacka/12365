// Stdio relay for the Microsoft Release Communications MCP server. The server
// answers 400 to an MCP-Protocol-Version header it does not support; without
// the header it negotiates down to its own version in the initialize reply.
import { createInterface } from 'node:readline'

const ENDPOINT = 'https://www.microsoft.com/releasecommunications/mcp'
let sessionId

async function relay(line) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json, text/event-stream',
      ...(sessionId && { 'Mcp-Session-Id': sessionId }),
    },
    body: line,
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  sessionId = res.headers.get('mcp-session-id') ?? sessionId
  const text = await res.text()
  const messages = res.headers.get('content-type')?.includes('text/event-stream')
    ? text.split('\n').filter((l) => l.startsWith('data:')).map((l) => l.slice(5).trim())
    : [text.trim()]
  for (const message of messages) if (message) process.stdout.write(message + '\n')
}

createInterface({ input: process.stdin }).on('line', (line) => {
  if (!line.trim()) return
  relay(line).catch((err) => {
    const { id } = JSON.parse(line)
    if (id === undefined) return
    const error = { code: -32000, message: String(err) }
    process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id, error }) + '\n')
  })
})
