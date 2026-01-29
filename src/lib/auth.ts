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

// Verify admin password (plain text comparison)
export async function verifyPassword(password: string): Promise<boolean> {
  const storedPassword = process.env.ADMIN_PASSWORD;
  if (!storedPassword) {
    return false;
  }

  return storedPassword === password;
}

// Create a new session
export async function createSession(): Promise<void> {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + SESSION_DURATION);

  try {
    // Store in database
    await execute(
      'INSERT INTO admin_sessions (token, expires_at) VALUES ($1, $2)',
      [token, expiresAt]
    );
  } catch {
    console.log('Database unavailable for session storage');
  }

  // Set the cookie
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
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
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return false;
  }

  try {
    // Verify in database
    const session = await query<AdminSessionRow>(
      'SELECT * FROM admin_sessions WHERE token = $1 AND expires_at > NOW()',
      [token]
    );

    return session.length > 0;
  } catch {
    // Database unavailable
    return false;
  }
}

// Destroy current session
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (token) {
    try {
      await execute('DELETE FROM admin_sessions WHERE token = $1', [token]);
    } catch {
      // Database unavailable
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
