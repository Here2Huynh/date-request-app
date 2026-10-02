# yeah, maybe

## Run locally

Install dependencies, then start the local app server:

```bash
npm install
npm run dev
```

The server stores requests in `data/requests.json`, binds to all local network
interfaces, and prints both the local and shared-network URLs. Open the network
URL on the sender device so the copied recipient link uses an address other
devices can reach.

For a production-style local run:

```bash
npm run build
npm start
```

The app and API are served from the same origin, so no separate backend or CORS
configuration is needed.
