# SKY ACE Online 1v1 — early multiplayer prototype

This package contains a standalone multiplayer prototype (`index.html`) and the existing single-player game (`classic.html`). It is **not** yet a production-secure competitive game. Hit detection is client-reported; players can cheat. Opponent bullets are not yet visualized. The multiplayer map is simplified relative to the classic game.

## Deploy on Render
1. Create a GitHub repository and upload the package files to the repository root.
2. At render.com, create a **New Web Service** connected to that repository.
3. Runtime: Node. Build command: `npm install`. Start command: `npm start`.
4. After deployment, open the public Render URL on two devices, enter the same room code, and press JOIN ROOM.
5. The service must stay active to support live matches. Free hosting may sleep and have limits.

## Run locally
`npm install && npm start` then open `http://localhost:3000` on two browser tabs.

Classic single-player is at `/classic`. Requires an internet connection to load Three.js CDN.
