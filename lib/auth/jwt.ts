import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import type { NewUser } from '@/lib/db/schema';

const key = new TextEncoder().encode(process.env.AUTH_SECRET);

export type SessionData = {
  user: { id: number };
  expires: string;
};

export async function signToken(payload: SessionData) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1 day from now')
    .sign(key);
}

export async function verifyToken(input: string): Promise<SessionData | null> {
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ['HS256'],
    });
    return payload as SessionData;
  } catch (err) {
    console.error('Failed to verify token:', err);
    return null; // Return null if verification fails (e.g., expired)
  }
}

export async function getSession(): Promise<SessionData | null> {
  const sessionCookie = (await cookies()).get('session')?.value;
  if (!sessionCookie) return null;
  return await verifyToken(sessionCookie);
}

// Note: NewUser now needs the ID to be optional (`id?: number`) or ensure it's always present before calling.
// Assuming user passed has an ID after creation.
export async function setSession(user: { id: number }) {
  const expiresInOneDay = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const session: SessionData = {
    user: { id: user.id },
    expires: expiresInOneDay.toISOString(),
  };
  const encryptedSession = await signToken(session);
  (await cookies()).set('session', encryptedSession, {
    expires: expiresInOneDay,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Use secure in production
    sameSite: 'lax',
  });
} 