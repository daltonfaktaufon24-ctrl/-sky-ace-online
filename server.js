
const http = require("http");
const fs = require("fs");
const path = require("path");
const { WebSocketServer, WebSocket } = require("ws");

const rooms = new Map();

const server = http.createServer((req, res) => {
  const url = new URL(req.url, "http://localhost");

  const files = {
    "/": "index.html",
    "/index.html": "index.html",
    "/classic": "classic.html",
    "/classic.html": "classic.html"
  };

  const filename = files[url.pathname];

  if (!filename) {
    res.writeHead(404);
    return res.end("Not found");
  }

  const filePath = path.join(__dirname, filename);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      console.error("Cannot load:", filePath, err.message);
      res.writeHead(500);
      return res.end("Game file unavailable");
    }

    res.writeHead(200, {
      "Content-Type": "text/html; charset=utf-8"
    });
    res.end(data);
  });
});

const wss = new WebSocketServer({
  server,
  path: "/ws"
});

function send(ws, data) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  }
}

function opponent(room, ws) {
  return room.players.find(player => player !== ws);
}

function leaveRoom(ws) {
  const room = ws.room;
  if (!room) return;

  room.players = room.players.filter(player => player !== ws);
  ws.room = null;

  for (const player of room.players) {
    send(player, { type: "left" });
  }

  if (room.players.length === 0) {
    rooms.delete(room.id);
  }
}

wss.on("connection", ws => {
  ws.on("message", raw => {
    if (raw.length > 2048) return;

    let message;

    try {
      message = JSON.parse(raw.toString());
    } catch {
      return;
    }

    if (!message || typeof message !== "object") return;

    if (message.type === "join") {
      leaveRoom(ws);

      const id = String(message.room || "")
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, 12);

      if (!id) {
        send(ws, { type: "error", message: "Enter a room code" });
        return;
      }

      let room = rooms.get(id);

      if (!room) {
        room = { id, players: [] };
        rooms.set(id, room);
      }

      if (room.players.length >= 2) {
        send(ws, { type: "full" });
        return;
      }

      room.players.push(ws);
      ws.room = room;

      send(ws, {
        type: "joined",
        room: id,
        player: room.players.length
      });

      if (room.players.length === 2) {
        for (const player of room.players) {
          send(player, { type: "start" });
        }
      }

      return;
    }

    if (!ws.room) return;

    const peer = opponent(ws.room, ws);

    if (peer) {
      send(peer, message);
    }
  });

  ws.on("close", () => leaveRoom(ws));
  ws.on("error", () => leaveRoom(ws));
});

const PORT = Number(process.env.PORT) || 3000;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`SKY ACE server running on port ${PORT}`);
});
