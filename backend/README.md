# SafeSouq Backend Starter

Ye folder production backend ke liye lightweight starter structure deta hai. Isme pure Node.js built-in modules ke sath demo API server likha gaya hai taa ke dependencies ke baghair architecture samajh aaye.

## Structure

- `src/server.js` main HTTP server
- `src/router.js` route matching
- `src/store.js` in-memory data store
- `src/security.js` simple auth and audit helpers
- `db/schema.sql` PostgreSQL starter schema

## Run

Jab Node runtime available ho:

```bash
node src/server.js
