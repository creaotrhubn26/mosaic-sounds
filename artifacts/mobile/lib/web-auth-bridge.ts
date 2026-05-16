export type WebAuthFlow = "youtube";

const WEB_AUTH_MESSAGE_TYPE = "mosaicbeats:web-auth-result";
const WEB_AUTH_STORAGE_PREFIX = "mosaicbeats:web-auth-result:";

type WebAuthResultMessage = {
  type: typeof WEB_AUTH_MESSAGE_TYPE;
  flow: WebAuthFlow;
  url: string;
};

type StoredWebAuthResult = {
  flow: WebAuthFlow;
  url: string;
  createdAt: number;
};

export function getWebAuthStorageKey(flow: WebAuthFlow): string {
  return `${WEB_AUTH_STORAGE_PREFIX}${flow}`;
}

export function clearWebAuthResult(flow: WebAuthFlow): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(getWebAuthStorageKey(flow));
}

export function consumeWebAuthResult(flow: WebAuthFlow): string | null {
  if (typeof window === "undefined") return null;

  const key = getWebAuthStorageKey(flow);
  const raw = window.localStorage.getItem(key);
  if (!raw) {
    return null;
  }

  window.localStorage.removeItem(key);

  try {
    const parsed = JSON.parse(raw) as Partial<StoredWebAuthResult>;
    return parsed.flow === flow && typeof parsed.url === "string" ? parsed.url : null;
  } catch {
    return null;
  }
}

export function publishWebAuthResult(flow: WebAuthFlow, url: string): void {
  if (typeof window === "undefined") return;

  const payload: StoredWebAuthResult = {
    flow,
    url,
    createdAt: Date.now(),
  };

  window.localStorage.setItem(getWebAuthStorageKey(flow), JSON.stringify(payload));

  try {
    if (window.opener && window.opener !== window) {
      const message: WebAuthResultMessage = {
        type: WEB_AUTH_MESSAGE_TYPE,
        flow,
        url,
      };
      window.opener.postMessage(message, window.location.origin);
    }
  } catch {
    // Ignore cross-window messaging failures and rely on storage fallback.
  }
}

export function isWebAuthResultMessage(
  value: unknown,
  flow: WebAuthFlow,
): value is WebAuthResultMessage {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Record<string, unknown>;
  return (
    record.type === WEB_AUTH_MESSAGE_TYPE &&
    record.flow === flow &&
    typeof record.url === "string"
  );
}
