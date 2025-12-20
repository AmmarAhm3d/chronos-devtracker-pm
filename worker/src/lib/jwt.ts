/**
 * Edge-compatible JWT implementation using Web Crypto API
 * Replaces jsonwebtoken which doesn't work on Cloudflare Workers
 */

export interface JWTPayload {
  userId: string;
  email: string;
}

interface JWTHeader {
  alg: string;
  typ: string;
}

interface JWTClaims extends JWTPayload {
  iat: number;
  exp: number;
}

/**
 * Base64URL encode
 */
function base64UrlEncode(buffer: ArrayBuffer): string {
  const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Base64URL decode
 */
function base64UrlDecode(str: string): ArrayBuffer {
  // Add padding
  const padding = '='.repeat((4 - (str.length % 4)) % 4);
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/') + padding;
  
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Generate HMAC signature using Web Crypto API
 */
async function sign(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(data);

  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, messageData);
  return base64UrlEncode(signature);
}

/**
 * Verify HMAC signature
 */
async function verify(data: string, signature: string, secret: string): Promise<boolean> {
  const expectedSignature = await sign(data, secret);
  
  // Constant-time comparison
  if (signature.length !== expectedSignature.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < signature.length; i++) {
    result |= signature.charCodeAt(i) ^ expectedSignature.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Generate a JWT token
 */
export async function generateToken(payload: JWTPayload, secret: string, expiresIn: number = 7 * 24 * 60 * 60): Promise<string> {
  const header: JWTHeader = {
    alg: 'HS256',
    typ: 'JWT',
  };

  const now = Math.floor(Date.now() / 1000);
  const claims: JWTClaims = {
    ...payload,
    iat: now,
    exp: now + expiresIn,
  };

  const encoder = new TextEncoder();
  const headerB64 = base64UrlEncode(encoder.encode(JSON.stringify(header)).buffer);
  const payloadB64 = base64UrlEncode(encoder.encode(JSON.stringify(claims)).buffer);

  const message = `${headerB64}.${payloadB64}`;
  const signature = await sign(message, secret);

  return `${message}.${signature}`;
}

/**
 * Verify and decode a JWT token
 */
export async function verifyToken(token: string, secret: string): Promise<JWTPayload> {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid token format');
  }

  const [headerB64, payloadB64, signature] = parts;
  const message = `${headerB64}.${payloadB64}`;

  // Verify signature
  const isValid = await verify(message, signature, secret);
  if (!isValid) {
    throw new Error('Invalid signature');
  }

  // Decode and validate payload
  const payloadBuffer = base64UrlDecode(payloadB64);
  const payloadStr = new TextDecoder().decode(payloadBuffer);
  const claims: JWTClaims = JSON.parse(payloadStr);

  // Check expiration
  const now = Math.floor(Date.now() / 1000);
  if (claims.exp && claims.exp < now) {
    throw new Error('Token expired');
  }

  return {
    userId: claims.userId,
    email: claims.email,
  };
}
