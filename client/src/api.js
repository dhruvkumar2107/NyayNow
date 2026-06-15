import { API_BASE } from "./config";

/**
 * Helper to get Auth headers
 */
function getAuthHeader() {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return token ? { "Authorization": `Bearer ${token}` } : {};
}

/* =====================================================
   AI FEATURES
===================================================== */

/**
 * AI Legal Assistant
 * POST /api/ai/assistant
 */
export async function askAssistant(question) {
  const res = await fetch(`${API_BASE}/ai/assistant`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader()
    },
    credentials: "include",
    body: JSON.stringify({ question }),
  });

  if (!res.ok) {
    throw new Error("Failed to get AI assistant response");
  }

  return res.json();
}

/**
 * Legal Issue Analyzer
 * POST /api/ai/analyze
 */
export async function analyzeIssue(text) {
  const res = await fetch(`${API_BASE}/ai/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader()
    },
    credentials: "include",
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    throw new Error("Failed to analyze legal issue");
  }

  return res.json();
}

/**
 * Agreement Analyzer
 * POST /api/ai/agreement
 */
export async function analyzeAgreement(text) {
  const res = await fetch(`${API_BASE}/ai/agreement`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader()
    },
    credentials: "include",
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    throw new Error("Failed to analyze agreement");
  }

  return res.json();
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
    headers: getAuthHeader(),
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
      "Content-Type": "application/json",
      ...getAuthHeader()
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
    headers: getAuthHeader(),
    credentials: "include",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("File upload failed");
  }

  return res.json();
}
