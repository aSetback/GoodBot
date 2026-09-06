const http = require("http");

// A tiny localhost-only HTTP API the website (goodbot-web, running on the
// same box) calls to trigger bot actions directly, instead of posting "+"
// prefix text commands into the raid channel -- those commands were fully
// removed from the message handler during the slash-command rewrite
// (events/messageCreate.js was deleted; functions/messages.js's handle() is
// an empty stub), so anything that used to rely on them silently did
// nothing. Bound to 127.0.0.1 so it's never reachable from outside this box
// regardless of the shared-secret check below.
const PORT = 3900;

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => {
      if (!data) return resolve({});
      try {
        resolve(JSON.parse(data));
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

module.exports = {
  run: (client) => {
    const server = http.createServer(async (req, res) => {
      try {
        if (req.headers.authorization !== `Bearer ${client.config.internalApiSecret}`) {
          res.writeHead(401).end();
          return;
        }

        if (req.method === "POST" && req.url === "/embed/refresh") {
          const { channelID } = await readJsonBody(req);
          if (!channelID) {
            res.writeHead(400).end("channelID is required");
            return;
          }
          await client.embed.update(client, channelID);
          res.writeHead(200).end("ok");
          return;
        }

        res.writeHead(404).end();
      } catch (error) {
        console.error("internalApi error", error);
        res.writeHead(500).end("internal error");
      }
    });

    server.listen(PORT, "127.0.0.1", () => {
      console.log(`-- Internal API listening on 127.0.0.1:${PORT}`);
    });
  },
};
