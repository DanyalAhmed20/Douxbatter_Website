import { cookies } from 'next/headers';
import { createHmac, randomBytes } from 'crypto';

const SESSION_COOKIE_NAME = 'admin_session';
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

// Check if database is configured
function isDatabaseConfigured(): boolean {
  return !!(process.env.MYSQL_HOST && process.env.MYSQL_DATABASE);
}

// Create a signed token for cookie-based sessions (no database required)
function createSignedToken(): string {
  const secret = process.env.ADMIN_PASSWORD || 'fallback-secret';
  const timestamp = Date.now();
  const nonce = randomBytes(16).toString('hex');
  const data = `${timestamp}:${nonce}`;
  const signature = createHmac('sha256', secret).update(data).digest('hex');
  return `${data}:${signature}`;
}

// Verify a signed token
function verifySignedToken(token: string): boolean {
  const secret = process.env.ADMIN_PASSWORD || 'fallback-secret';
  const parts = token.split(':');
  if (parts.length !== 3) return false;

  const [timestamp, nonce, signature] = parts;
  const data = `${timestamp}:${nonce}`;
  const expectedSignature = createHmac('sha256', secret).update(data).digest('hex');

  if (signature !== expectedSignature) return false;

  // Check if token is expired
  const tokenTime = parseInt(timestamp, 10);
  if (isNaN(tokenTime)) return false;
  if (Date.now() - tokenTime > SESSION_DURATION_MS) return false;

  return true;
}

export async function createSession(): Promise<string> {
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  if (isDatabaseConfigured()) {
    // Use database for session storage
    const pool = (await import('./db')).default;
    const token = randomBytes(32).toString('hex');

    await pool.execute(
      'INSERT INTO admin_sessions (token, expires_at) VALUES (?, ?)',
      [token, expiresAt]
    );

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
      path: '/',
    });

    return token;
  } else {
    // Use signed cookie for session (no database)
    const token = createSignedToken();

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
      path: '/',
    });

    return token;
  }
}

export async function verifySession(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return false;
  }

  if (isDatabaseConfigured()) {
    // Verify against database
    const pool = (await import('./db')).default;

    const [rows] = await pool.execute<any[]>(
      'SELECT * FROM admin_sessions WHERE token = ? AND expires_at > NOW()',
      [token]
    );

    return rows.length > 0;
  } else {
    // Verify signed token
    return verifySignedToken(token);
  }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token && isDatabaseConfigured()) {
    const pool = (await import('./db')).default;
    await pool.execute('DELETE FROM admin_sessions WHERE token = ?', [token]);
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function cleanupExpiredSessions(): Promise<void> {
  if (isDatabaseConfigured()) {
    const pool = (await import('./db')).default;
    await pool.execute('DELETE FROM admin_sessions WHERE expires_at < NOW()');
  }
  // No cleanup needed for signed tokens - they self-expire
}

export function verifyPassword(password: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    console.error('[Auth] ADMIN_PASSWORD environment variable is not set');
    return false;
  }

  const isValid = password === adminPassword;

  if (!isValid) {
    console.error('[Auth] Password verification failed', {
      providedLength: password.length,
      expectedLength: adminPassword.length,
      providedTrimmedLength: password.trim().length,
      expectedTrimmedLength: adminPassword.trim().length,
    });
  }

  return isValid;
}
