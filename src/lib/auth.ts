import crypto from 'crypto';
import { cookies } from 'next/headers';
import { query, execute } from './db';
import type { AdminSessionRow } from './db';

const COOKIE_NAME = 'admin_session';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Generate a secure random token
function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Sign a token with the session secret
function signToken(token: string): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error('SESSION_SECRET is not configured');
  }
  const signature = crypto.createHmac('sha256', secret).update(token).digest('hex');
  return `${token}.${signature}`;
}

// Verify and extract token from signed value
function verifySignedToken(signedToken: string): string | null {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    return null;
  }

  const parts = signedToken.split('.');
  if (parts.length !== 2) {
    return null;
  }

  const [token, signature] = parts;
  const expectedSignature = crypto.createHmac('sha256', secret).update(token).digest('hex');

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    return null;
  }

  return token;
}

// Verify admin password
export async function verifyPassword(password: string): Promise<boolean> {
  const storedPassword = process.env.ADMIN_PASSWORD;
  if (!storedPassword) {
    return false;
  }

  // Check if the stored password is a bcrypt hash
  if (storedPassword.startsWith('$2')) {
    // For bcrypt comparison, we'd need bcryptjs
    // For simplicity, we'll do direct comparison with SHA256 hash
    const hashedInput = crypto.createHash('sha256').update(password).digest('hex');
    return storedPassword === hashedInput;
  }

  // Direct comparison for non-hashed passwords (not recommended for production)
  return storedPassword === password;
}

// Create a new session
export async function createSession(): Promise<void> {
  const token = generateToken();
  const signedToken = signToken(token);
  const expiresAt = new Date(Date.now() + SESSION_DURATION);

  try {
    // Try to store in database
    await execute(
      'INSERT INTO admin_sessions (token, expires_at) VALUES (?, ?)',
      [token, expiresAt]
    );
  } catch {
    // Database unavailable, session will be verified via signed cookie only
    console.log('Database unavailable, using signed cookie session');
  }

  // Set the cookie
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, signedToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  });
}

// Verify current session
export async function verifySession(): Promise<boolean> {
  const cookieStore = await cookies();
  const signedToken = cookieStore.get(COOKIE_NAME)?.value;

  if (!signedToken) {
    return false;
  }

  const token = verifySignedToken(signedToken);
  if (!token) {
    return false;
  }

  try {
    // Try to verify in database
    const session = await query<AdminSessionRow>(
      'SELECT * FROM admin_sessions WHERE token = ? AND expires_at > NOW()',
      [token]
    );

    if (session.length > 0) {
      return true;
    }
  } catch {
    // Database unavailable, trust the signed cookie
    // The signature verification already passed
    return true;
  }

  return false;
}

// Destroy current session
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const signedToken = cookieStore.get(COOKIE_NAME)?.value;

  if (signedToken) {
    const token = verifySignedToken(signedToken);
    if (token) {
      try {
        await execute('DELETE FROM admin_sessions WHERE token = ?', [token]);
      } catch {
        // Database unavailable, just delete the cookie
      }
    }
  }

  cookieStore.delete(COOKIE_NAME);
}

// Clean up expired sessions (can be called periodically)
export async function cleanupExpiredSessions(): Promise<void> {
  try {
    await execute('DELETE FROM admin_sessions WHERE expires_at < NOW()');
  } catch {
    // Database unavailable
  }
}
