const http = require("http");
const { route } = require("./router");
const { json } = require("./security");

const PORT = process.env.PORT || 4000;
const HOST = "0.0.0.0";

const server = http.createServer((request, response) => {
  route(request, response).catch((error) => {
    json(response, 500, {
      error: "Internal server error",
      detail: error.message
    });
  });
});

server.listen(PORT, HOST, () => {
  console.log(`SafeSouq full-stack server listening on http://${HOST}:${PORT}`);
});
