import jwt, { JwtPayload } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_EXPIRY = "7d";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not set");
}

export interface TokenPayload {
  organizationId: string;
  userId: string;
  email: string;
  role?: string;
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET as string, { expiresIn: TOKEN_EXPIRY });
}

export function verifyToken(token: string): TokenPayload & JwtPayload {
  try {
    return jwt.verify(token, JWT_SECRET as string) as TokenPayload & JwtPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error("Token has expired");
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error("Invalid token");
    }
    throw new Error("Token verification failed");
  }
}