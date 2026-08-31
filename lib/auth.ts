export const SESSION_COOKIE = 'pingodemeio_session'
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7 // 7 dias

const encoder = new TextEncoder()

function toHex(buffer: ArrayBuffer) {
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false
  let result = 0
  for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return result === 0
}

async function getKey() {
  const secret = process.env.AUTH_SECRET
  if (!secret) throw new Error('AUTH_SECRET não configurado no .env')
  return crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
}

export function checkCredentials(username: string, password: string) {
  return username === process.env.AUTH_USERNAME && password === process.env.AUTH_PASSWORD
}

export async function createSessionToken() {
  const expires = Date.now() + SESSION_TTL_MS
  const payload = String(expires)
  const key = await getKey()
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload))
  return `${payload}.${toHex(signature)}`
}

export async function verifySessionToken(token: string | undefined | null) {
  if (!token) return false
  const [payload, signatureHex] = token.split('.')
  if (!payload || !signatureHex) return false

  const expires = Number(payload)
  if (!Number.isFinite(expires) || Date.now() > expires) return false

  const key = await getKey()
  const expectedSignature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload))
  return timingSafeEqual(toHex(expectedSignature), signatureHex)
}
