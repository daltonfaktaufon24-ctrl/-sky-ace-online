const http=require('http'),fs=require('fs'),path=require('path'),{WebSocketServer,WebSocket}=require('ws');
const server=http.createServer((req,res)=>{const file=req.url==='/'?'index.html':req.url==='/classic'?'classic.html':null;if(!file){res.writeHead(404);return res.end('Not found')}res.setHeader('Content-Type','text/html; charset=utf-8');fs.createReadStream(path.join(__dirname,file)).pipe(res)});
const wss=new WebSocketServer({server,path:'/ws'});const rooms=new Map();
function send(ws,obj){if(ws.readyState===WebSocket.OPEN)ws.send(JSON.stringify(obj))}
function other(room,ws){return room.players.find(p=>p!==ws)}
function endRoom(ws){const room=ws.room;if(!room)return;room.players=room.players.filter(p=>p!==ws);const p=other(room,ws)||room.players[0];if(p)send(p,{type:'left'});if(!room.players.length)rooms.delete(room.id);ws.room=null}
wss.on('connection',ws=>{ws.on('message',raw=>{if(raw.length>2048)return;let
