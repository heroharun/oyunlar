// Kendi PeerJS sinyal sunucumuz — bağlantı kurulumu artık bize ait
// (PeerJS'in public bulutuna bağımlılık yok → "arada yavaş/kopuk" azalır).
//
//   npm install
//   node peerserver.js
//
// Ardından index.html içinde:
//   const SIGNAL = { host:'sumo.ornek.com', port:443, secure:true, path:'/peer' };
//
// Not: prod'da bir reverse proxy (Caddy/Nginx) ile TLS terminate edip
// bu servisi 443'ün /peer path'ine yönlendir. WebSocket upgrade'e izin ver.

const { PeerServer } = require('peer');

const PORT = process.env.PORT || 9000;
const PATH = process.env.PEER_PATH || '/peer';

const server = PeerServer({
  port: PORT,
  path: PATH,
  proxied: true,            // reverse proxy arkasında gerçek IP için
  allow_discovery: false,
  // İstersen basit bir anahtar zorunlu kıl (index.html SIGNAL'e key ekle):
  // key: process.env.PEER_KEY || 'peerjs',
});

server.on('connection', (c) => console.log('[peer+]', c.getId()));
server.on('disconnect', (c) => console.log('[peer-]', c.getId()));
console.log(`PeerServer çalışıyor :${PORT}${PATH}`);
