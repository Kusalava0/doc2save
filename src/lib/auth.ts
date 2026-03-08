import { SignJWT, jwtVerify } from 'jose';

export interface SessionPayload {
  userId: string;
  firebaseUid: string;
  phone?: string;
  email?: string;
  role: 'USER' | 'ADMIN';
  iat?: number;
  exp?: number;
}

const getSecret = () => new TextEncoder().encode(process.env.SESSION_SECRET!);

export async function createSession(
  payload: Omit<SessionPayload, 'iat' | 'exp'>
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecret());
}

export async function verifySession(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}
