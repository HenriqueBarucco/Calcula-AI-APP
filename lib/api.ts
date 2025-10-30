import { API_URL } from "./config";

export type Price = {
  id: string;
  name: string | null;
  value: number | null;
  quantity: number;
  status: string;
};

export type SessionDetails = {
  id: string;
  total: number;
  prices: Price[];
};

export async function createSession(): Promise<string> {
  const res = await fetch(`${API_URL}/sessions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ has_club: true })
  })

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Falha ao criar sessão (${res.status}): ${text}`);
  }
  const data = await parseJsonSafe<{ id: string }>(res);
  if (!data || !data.id) throw new Error("Resposta inválida do servidor ao criar sessão");
  return data.id;
}

export async function getSession(sessionId: string): Promise<SessionDetails> {
  const res = await fetch(`${API_URL}/sessions`, {
    method: "GET",
    headers: {
      session: sessionId,
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Falha ao buscar sessão (${res.status}): ${text}`);
  }
  const data = await parseJsonSafe<SessionDetails>(res);
  if (!data) throw new Error("Resposta vazia do servidor ao buscar sessão");
  return data;
}

export async function uploadPriceImage(params: {
  sessionId: string;
  fileUri: string;
  filename?: string;
  quantity?: number;
  mimeType?: string;
}): Promise<SessionDetails> {
  const { sessionId, fileUri, filename = "photo.jpg", quantity = 1, mimeType = "image/jpeg" } = params;

  const formData = new FormData();
  (formData as any).append("file", {
    uri: fileUri,
    name: filename,
    type: mimeType,
  });
  formData.append("quantity", String(quantity));

  const res = await fetch(`${API_URL}/sessions/prices`, {
    method: "POST",
    headers: {
      session: sessionId,
    } as any,
    body: formData as any,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Falha ao enviar imagem (${res.status}): ${text}`);
  }
  const parsed = await parseJsonSafe<SessionDetails>(res);
  if (parsed) return parsed;
  return await getSession(sessionId);
}

export async function createPrice(params: {
  sessionId: string;
  quantity: number;
  name: string;
  value: number;
}): Promise<SessionDetails> {
  const { sessionId, quantity, name, value } = params;
  const formData = new FormData();
  formData.append("quantity", String(quantity));
  formData.append("name", name);
  formData.append("value", String(value));

  const res = await fetch(`${API_URL}/sessions/prices`, {
    method: "POST",
    headers: {
      session: sessionId,
    } as any,
    body: formData as any,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Falha ao criar preço (${res.status}): ${text}`);
  }
  const parsed = await parseJsonSafe<SessionDetails>(res);
  if (parsed) return parsed;
  return await getSession(sessionId);
}

export async function deletePrice(params: { sessionId: string; priceId: string }): Promise<void> {
  const { sessionId, priceId } = params;
  const res = await fetch(`${API_URL}/sessions/prices/${priceId}`, {
    method: "DELETE",
    headers: {
      session: sessionId,
    } as any,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Falha ao deletar preço (${res.status}): ${text}`);
  }
}

export async function getPricePhoto(params: { sessionId: string; priceId: string }): Promise<{ uri: string; contentType: string } | null> {
  const { sessionId, priceId } = params;
  const res = await fetch(`${API_URL}/sessions/prices/${priceId}/photo`, {
    method: "GET",
    headers: {
      session: sessionId,
    } as any,
  });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Falha ao buscar foto (${res.status}): ${text}`);
  }

  const contentType = res.headers.get("Content-Type") ?? "image/jpeg";
  const arrayBuffer = await res.arrayBuffer();
  if (!arrayBuffer.byteLength) {
    return null;
  }

  const base64 = arrayBufferToBase64(arrayBuffer);
  return {
    uri: `data:${contentType};base64,${base64}`,
    contentType,
  };
}

async function parseJsonSafe<T>(res: Response): Promise<T | null> {
  if (res.status === 204 || res.status === 205) return null;
  try {
    const text = await res.text();
    if (!text || !text.trim()) return null;
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

const BASE64_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const len = bytes.length;
  let base64 = "";

  for (let offset = 0; offset < len; offset += 3) {
    const chunk = (bytes[offset] << 16) | ((bytes[offset + 1] ?? 0) << 8) | (bytes[offset + 2] ?? 0);
    const a = (chunk >> 18) & 63;
    const b = (chunk >> 12) & 63;
    const c = (chunk >> 6) & 63;
    const d = chunk & 63;

    base64 +=
      BASE64_ALPHABET[a] +
      BASE64_ALPHABET[b] +
      (offset + 1 < len ? BASE64_ALPHABET[c] : "=") +
      (offset + 2 < len ? BASE64_ALPHABET[d] : "=");
  }

  return base64;
}
