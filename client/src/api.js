/**
 * NYAY-NOW FRONTEND API LAYER
 * Single source of truth for all backend calls
 */

const API_BASE = import.meta.env.VITE_API_URL || "https://nyaysathi-main.onrender.com/api";

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
    },
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
    },
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
    },
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
 * Fetch messages for a lawyer
 * GET /api/messages?lawyer=NAME
 */
export async function fetchMessages(lawyerName) {
  const res = await fetch(
    `${API_BASE}/messages?lawyer=${encodeURIComponent(lawyerName)}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch messages");
  }

  return res.json();
}

/**
 * Send message
 * POST /api/messages
 */
export async function sendMessage(message) {
  const res = await fetch(`${API_BASE}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
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
    body: formData,
  });

  if (!res.ok) {
    throw new Error("File upload failed");
  }

  return res.json();
}
