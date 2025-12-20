/**
 * Edge-compatible password hashing using PBKDF2 via Web Crypto API
 * Replaces bcryptjs which doesn't work on Cloudflare Workers
 */

const ITERATIONS = 100000;
const HASH_LENGTH = 32; // 256 bits
const SALT_LENGTH = 16; // 128 bits

/**
 * Convert ArrayBuffer to hex string
 */
function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Convert hex string to ArrayBuffer
 */
function hexToBuffer(hex: string): ArrayBuffer {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes.buffer;
}

/**
 * Generate a random salt
 */
function generateSalt(): ArrayBuffer {
  return crypto.getRandomValues(new Uint8Array(SALT_LENGTH)).buffer;
}

/**
 * Derive a key using PBKDF2
 */
async function deriveKey(password: string, salt: ArrayBuffer): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  // Import the password as a key
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveBits']
  );

  // Derive bits using PBKDF2
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    HASH_LENGTH * 8 // bits
  );

  return derivedBits;
}

/**
 * Hash a password
 * Returns: salt:hash (both in hex)
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = generateSalt();
  const hash = await deriveKey(password, salt);
  return `${bufferToHex(salt)}:${bufferToHex(hash)}`;
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [saltHex, hashHex] = storedHash.split(':');
  
  if (!saltHex || !hashHex) {
    return false;
  }

  const salt = hexToBuffer(saltHex);
  const hash = await deriveKey(password, salt);
  const computedHashHex = bufferToHex(hash);

  // Constant-time comparison
  if (hashHex.length !== computedHashHex.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < hashHex.length; i++) {
    result |= hashHex.charCodeAt(i) ^ computedHashHex.charCodeAt(i);
  }

  return result === 0;
}
