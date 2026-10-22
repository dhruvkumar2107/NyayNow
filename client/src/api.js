import { API_BASE } from "./config";

// Auth is handled by httpOnly cookie (withCredentials below).
// CSRF header is required by the server on all mutating requests.
const MUTATING_HEADERS = {
  "Content-Type": "application/json",
  "X-CSRF-Protection": "1",
};

export class ApiError extends Error {
  constructor(message, { status, code, data } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.data = data;
  }
}

async function readJson(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

/* =====================================================
   AI FEATURES
===================================================== */

/**
 * AI Legal Assistant
 * POST /api/ai/assistant
 *
 * Accepts either a question string (legacy) or an options object:
 * { question, history, language, caseContext }
 */
export async function askAssistant(input) {
  const options = typeof input === "string" ? { question: input } : (input || {});
  const { question, history, language, caseContext } = options;

  if (typeof question !== "string" || !question.trim()) {
    throw new ApiError("Please enter a legal question.", { status: 400 });
  }

  const body = { question: question.trim() };
  if (Array.isArray(history) && history.length > 0) body.history = history;
  if (language) body.language = language;
  if (caseContext) body.caseContext = caseContext;

  const res = await fetch(`${API_BASE}/ai/assistant`, {
    method: "POST",
    headers: {
      ...MUTATING_HEADERS,
    },
    credentials: "include",
    body: JSON.stringify(body),
  });

  const data = await readJson(res);

  if (!res.ok) {
    throw new ApiError(
      data?.error || "The AI assistant is temporarily unavailable. Please try again.",
      { status: res.status, code: data?.code, data }
    );
  }

  return data;
}

/**
 * Legal Issue Analyzer
 * POST /api/ai/case-analysis
 */
export async function analyzeIssue(text) {
  const res = await fetch(`${API_BASE}/ai/case-analysis`, {
    method: "POST",
    headers: {
      ...MUTATING_HEADERS,
    },
    credentials: "include",
    body: JSON.stringify({ text }),
  });

  const data = await readJson(res);
  if (!res.ok) {
    throw new ApiError(data?.error || "Failed to analyze legal issue", {
      status: res.status,
      code: data?.code,
      data,
    });
  }

  return data;
}

/**
 * Agreement Analyzer
 * POST /api/ai/agreement
 */
export async function analyzeAgreement(text) {
  const res = await fetch(`${API_BASE}/ai/agreement`, {
    method: "POST",
    headers: {
      ...MUTATING_HEADERS,
    },
    credentials: "include",
    body: JSON.stringify({ text }),
  });

  const data = await readJson(res);
  if (!res.ok) {
    throw new ApiError(data?.error || "Failed to analyze agreement", {
      status: res.status,
      code: data?.code,
      data,
    });
  }

  return data;
}

/* =====================================================
   NEWSLETTER
===================================================== */

/**
 * Subscribe to the NyayNow newsletter
 * POST /api/newsletter/subscribe
 */
export async function subscribeNewsletter(email) {
  const res = await fetch(`${API_BASE}/newsletter/subscribe`, {
    method: "POST",
    headers: {
      ...MUTATING_HEADERS,
    },
    credentials: "include",
    body: JSON.stringify({ email }),
  });

  const data = await readJson(res);
  if (!res.ok) {
    throw new ApiError(data?.error || "Could not subscribe right now.", {
      status: res.status,
      code: data?.code,
      data,
    });
  }

  return data;
}

/* =====================================================
   LAWYER MARKETPLACE
===================================================== */

/**
 * Fetch all lawyers
 * GET /api/lawyers
 */
export async function fetchLawyers() {
  const res = await fetch(`${API_BASE}/lawyers`);

  if (!res.ok) {
    throw new Error("Failed to fetch lawyers");
  }

  return res.json();
}

/* =====================================================
   NEARBY LEGAL HELP
===================================================== */

/**
 * Fetch nearby police stations, courts, lawyers
 * GET /api/nearby?lat=&lng=
 */
export async function fetchNearby(lat, lng) {
  const res = await fetch(
    `${API_BASE}/nearby?lat=${lat}&lng=${lng}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch nearby legal help");
  }

  return res.json();
}

/* =====================================================
   CHAT / MESSAGES
===================================================== */

/**
 * Fetch messages for a conversation
 * GET /api/messages/:otherUserId
 */
export async function fetchMessages(otherUserId) {
  const res = await fetch(`${API_BASE}/messages/${otherUserId}`, {
    headers: { "X-CSRF-Protection": "1" },
    credentials: "include"
  });

  if (!res.ok) {
    throw new Error("Failed to fetch messages");
  }

  return res.json();
}

/**
 * Send message
 * POST /api/messages/send
 */
export async function sendMessage(recipientId, content) {
  const res = await fetch(`${API_BASE}/messages/send`, {
    method: "POST",
    headers: {
      ...MUTATING_HEADERS,
    },
    credentials: "include",
    body: JSON.stringify({ recipientId, content }),
  });

  if (!res.ok) {
    throw new Error("Failed to send message");
  }

  return res.json();
}

/* =====================================================
   FILE UPLOADS (OPTIONAL / FUTURE)
===================================================== */

/**
 * Upload a document
 * POST /api/uploads
 */
export async function uploadFile(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/uploads`, {
    method: "POST",
    headers: { "X-CSRF-Protection": "1" },
    credentials: "include",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("File upload failed");
  }

  return res.json();
}
