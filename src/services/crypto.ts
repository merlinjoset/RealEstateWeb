/**
 * Client-side password encryption using the server's RSA public key.
 *
 * Why: keeps the password ciphertext-only on the wire AND in DevTools'
 * Network tab, so a casual screen-share or shoulder-surf during login
 * never reveals "Admin@123".
 *
 * Flow:
 *   1. fetchPublicKey() — GET /api/auth/public-key (cached in module state)
 *   2. encryptPassword(pw) — RSA-OAEP-SHA256 encrypt with the cached key,
 *      return base64 ciphertext
 *
 * The key is rotated whenever the server restarts, so we always pull a
 * fresh copy on first use of each session.
 */

import api from './api'

interface PublicJwk {
  kty: string
  alg: string
  use: string
  n: string
  e: string
}

let cachedKey: CryptoKey | null = null
let inflight: Promise<CryptoKey> | null = null

async function fetchPublicKey(): Promise<CryptoKey> {
  if (cachedKey) return cachedKey
  if (inflight) return inflight

  inflight = (async () => {
    const { data } = await api.get<PublicJwk>('/auth/public-key')
    const key = await crypto.subtle.importKey(
      'jwk',
      {
        kty: data.kty,
        alg: data.alg,
        use: data.use,
        n: data.n,
        e: data.e,
        ext: true,
      },
      { name: 'RSA-OAEP', hash: 'SHA-256' },
      false,                       // not extractable — the key only lives in WebCrypto
      ['encrypt'],
    )
    cachedKey = key
    return key
  })()

  try {
    return await inflight
  } finally {
    inflight = null
  }
}

/**
 * Encrypts a password with the server's RSA public key.
 * Returns base64 ciphertext suitable for the `encryptedPassword` field
 * on POST /api/auth/login.
 */
export async function encryptPassword(plaintext: string): Promise<string> {
  const key = await fetchPublicKey()
  const buffer = await crypto.subtle.encrypt(
    { name: 'RSA-OAEP' },
    key,
    new TextEncoder().encode(plaintext),
  )
  // Base64-encode the ciphertext bytes for transport
  let binary = ''
  const bytes = new Uint8Array(buffer)
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

/**
 * Reset the cached public key — call after a known key rotation
 * (e.g. server restart) or to force a refresh on next login.
 */
export function clearPublicKeyCache() {
  cachedKey = null
  inflight = null
}
