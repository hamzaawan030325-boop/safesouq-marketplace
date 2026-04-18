# Public Deployment Guide

SafeSouq ko public internet par lane ke liye Render sab se simple option hai, kyun ke ye static frontend aur Node backend dono ko ek hi web service me run kar sakta hai.

## Render par deploy

Official Render docs ke mutabiq web services public URL deti hain aur Node apps ko Git repo se build/start karti hain. Har web service ko public requests receive karne ke liye port par listen karna hota hai, aur custom domain bhi add kiya ja sakta hai. Sources:

- [Render Web Services](https://render.com/docs/web-services)
- [Render Deploys](https://render.com/docs/deploys/)

### Steps

1. Is project folder ko GitHub repo me upload karein.
2. Render account banayein aur dashboard me `New > Web Service` open karein.
3. GitHub repo connect karein.
4. Render agar `render.yaml` detect kare to use confirm karein.
5. Agar manually fields bharni hon:
   - Environment: `Node`
   - Build Command: leave empty
   - Start Command: `node backend/src/server.js`
6. Deploy complete hone ke baad Render aapko public `onrender.com` URL de dega.
7. Apna domain chahen to Render settings me custom domain add karein.

## Important note

- `backend/data/store.json` demo persistence ke liye hai.
- Render docs ke mutabiq default filesystem ephemeral hota hai, is liye real production me PostgreSQL ya external database use karein.
- Login aur seller data abhi demo-friendly hai, production security ke liye hashed passwords, real auth tokens, payment gateway aur managed database add karna hoga.
