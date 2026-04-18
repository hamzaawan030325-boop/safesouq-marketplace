const fs = require("fs");
const path = require("path");

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8"
};

function json(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PATCH,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  });
  response.end(JSON.stringify(payload, null, 2));
}

function text(response, statusCode, payload, contentType) {
  response.writeHead(statusCode, { "Content-Type": contentType });
  response.end(payload);
}

function parseBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk;
    });

    request.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(new Error("Invalid JSON body"));
      }
    });
  });
}

function writeAudit(message) {
  return {
    audited: true,
    message,
    at: new Date().toISOString()
  };
}

function safeStaticPath(rootDir, pathname) {
  const requested = pathname === "/" ? "/index.html" : pathname;
  const normalized = path.normalize(requested).replace(/^(\.\.[/\\])+/, "");
  const resolved = path.join(rootDir, normalized);

  if (!resolved.startsWith(rootDir)) {
    return null;
  }

  return resolved;
}

function serveFile(response, filePath) {
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    return false;
  }

  const ext = path.extname(filePath).toLowerCase();
  text(response, 200, fs.readFileSync(filePath), MIME_TYPES[ext] || "application/octet-stream");
  return true;
}

function notFound(response) {
  json(response, 404, { error: "Not found" });
}

module.exports = {
  json,
  notFound,
  parseBody,
  safeStaticPath,
  serveFile,
  writeAudit
};
