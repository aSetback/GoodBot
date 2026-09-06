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

const SIGNUP_MESSAGE =
  "*If you do not see a sign-up below this message, please enable embeds on discord.*";

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

// Mirrors the last few lines of functions/raid.js's createRaidChannel() --
// the initial pinned sign-up message (with the Yes/No/Maybe buttons) that
// client.embed.update() then edits in place with the real embed content.
// Used both for brand-new raids and for "dupe", since a duped raid is just
// a second channel/DB-record pair that also needs this same initial state.
async function initEmbed(client, channelID) {
  const channel = await client.channels.fetch(channelID);
  const botMsg = await channel.send({
    content: SIGNUP_MESSAGE,
    components: [client.buttonRow],
  });
  await botMsg.pin();
  await client.embed.update(client, channel);
}

// Mirrors slashcommands/raid/ping.js (types "raid"/"confirmed") and
// slashcommands/reserves/noreserve.js. "unsigned" isn't covered -- it
// compares against a second, caller-specified raid/channel (see
// client.notify.getUnsigned), which the website has no UI for yet.
async function pingRaid(client, channelID, type) {
  const channel = await client.channels.fetch(channelID);
  const raid = await client.raid.get(client, channel);
  if (!raid) {
    throw new Error("Channel is not a raid channel.");
  }

  let names = [];
  if (type === "all") {
    names = raid.signups.filter((s) => s.signup === "yes").map((s) => s.character.name);
  } else if (type === "confirmed") {
    names = raid.signups
      .filter((s) => s.signup === "yes" && s.confirmed == 1)
      .map((s) => s.character.name);
  } else if (type === "noreserve") {
    if (!raid.softreserve) {
      throw new Error("Soft reserve is not currently enabled for this raid.");
    }
    const raidReserves = await client.models.raidReserve.findAll({
      where: { raidID: raid.id },
      include: [{ model: client.models.signup, as: "signup", foreignKey: "signupID" }],
    });
    const hasReserve = raidReserves.filter((r) => r.signup).map((r) => r.signup.player);
    names = raid.signups
      .filter((s) => s.signup === "yes" && s.confirmed == 1 && !hasReserve.includes(s.player))
      .map((s) => s.character.name);
  } else {
    throw new Error(`Unknown ping type: ${type}`);
  }

  if (names.length === 0) {
    await channel.send("No players were found.");
    return;
  }
  const notifications = await client.notify.makeList(client, channel.guild, names);
  if (type === "noreserve") {
    await channel.send("Please set your reserve!");
  }
  await channel.send(notifications);
}

// Mirrors slashcommands/utility/archive.js.
async function archiveRaid(client, channelID) {
  const channel = await client.channels.fetch(channelID);
  const result = await client.raid.archive(client, channel);
  if (!result.success) {
    throw new Error(result.message || "Failed to archive.");
  }
}

module.exports = {
  run: (client) => {
    const server = http.createServer(async (req, res) => {
      try {
        if (req.headers.authorization !== `Bearer ${client.config.internalApiSecret}`) {
          res.writeHead(401).end();
          return;
        }

        const body = req.method === "POST" ? await readJsonBody(req) : {};

        if (req.method === "POST" && req.url === "/embed/refresh") {
          if (!body.channelID) return res.writeHead(400).end("channelID is required");
          await client.embed.update(client, body.channelID);
          return res.writeHead(200).end("ok");
        }

        if (req.method === "POST" && req.url === "/embed/init") {
          if (!body.channelID) return res.writeHead(400).end("channelID is required");
          await initEmbed(client, body.channelID);
          return res.writeHead(200).end("ok");
        }

        if (req.method === "POST" && req.url === "/raid/ping") {
          if (!body.channelID || !body.type) {
            return res.writeHead(400).end("channelID and type are required");
          }
          await pingRaid(client, body.channelID, body.type);
          return res.writeHead(200).end("ok");
        }

        if (req.method === "POST" && req.url === "/raid/archive") {
          if (!body.channelID) return res.writeHead(400).end("channelID is required");
          await archiveRaid(client, body.channelID);
          return res.writeHead(200).end("ok");
        }

        res.writeHead(404).end();
      } catch (error) {
        console.error("internalApi error", error);
        res.writeHead(500).end(String((error && error.message) || error));
      }
    });

    server.listen(PORT, "127.0.0.1", () => {
      console.log(`-- Internal API listening on 127.0.0.1:${PORT}`);
    });
  },
};
