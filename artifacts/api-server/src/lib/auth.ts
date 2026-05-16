import { verifyToken, createClerkClient, type ClerkClient } from "@clerk/express";
import { InvalidRequestError } from "./app-state";

export class AuthenticationError extends Error {}

export type AuthenticatedAccount = {
  accountId: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
};

let cachedClerk: ClerkClient | null = null;

function getClerk(): ClerkClient {
  if (!cachedClerk) {
    const secretKey = process.env.CLERK_SECRET_KEY?.trim();
    if (!secretKey) {
      throw new Error("CLERK_SECRET_KEY must be set");
    }
    cachedClerk = createClerkClient({ secretKey });
  }
  return cachedClerk;
}

function parseBearerToken(authorizationHeader: string | undefined): string | null {
  if (!authorizationHeader) return null;
  const [scheme, token] = authorizationHeader.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token?.trim()) {
    throw new AuthenticationError("Invalid authorization header");
  }
  return token.trim();
}

function isValidRedirectProtocol(protocol: string): boolean {
  return /^[a-z][a-z0-9+.-]*:$/.test(protocol) && protocol !== "javascript:";
}

export function resolveAuthRedirectUri(value: unknown): string {
  const redirectUri = typeof value === "string" ? value.trim() : "";
  if (!redirectUri || redirectUri.length > 500) {
    throw new InvalidRequestError("Invalid redirect uri");
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(redirectUri);
  } catch {
    throw new InvalidRequestError("Invalid redirect uri");
  }

  if (!isValidRedirectProtocol(parsedUrl.protocol)) {
    throw new InvalidRequestError("Invalid redirect uri");
  }

  return parsedUrl.toString();
}

async function loadAccountFromClerkUser(userId: string): Promise<AuthenticatedAccount> {
  const user = await getClerk().users.getUser(userId);
  const primaryEmail =
    user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress ??
    user.emailAddresses[0]?.emailAddress ??
    null;

  if (!primaryEmail) {
    throw new AuthenticationError("Clerk user has no email");
  }

  const displayName =
    [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
    user.username ||
    null;

  return {
    accountId: user.id,
    email: primaryEmail,
    displayName: displayName || null,
    avatarUrl: user.imageUrl ?? null,
  };
}

export async function getAccountFromAuthorizationHeader(
  authorizationHeader: string | undefined,
): Promise<AuthenticatedAccount | null> {
  const token = parseBearerToken(authorizationHeader);
  if (!token) return null;

  const secretKey = process.env.CLERK_SECRET_KEY?.trim();
  if (!secretKey) {
    throw new Error("CLERK_SECRET_KEY must be set");
  }

  let payload: { sub?: string };
  try {
    payload = await verifyToken(token, { secretKey });
  } catch {
    throw new AuthenticationError("Invalid or expired session");
  }

  if (!payload.sub) {
    throw new AuthenticationError("Invalid or expired session");
  }

  return loadAccountFromClerkUser(payload.sub);
}
