# TrustFlow Frontend

TrustFlow is a React and TypeScript interface for blockchain-backed AI content provenance. It provides wallet sign-in, text and image generation, a document knowledge base, and verification by content or transaction hash.

This repository contains the **frontend only**. The API and blockchain services must be supplied separately. The UI does not itself prove that content has been recorded on-chain; it displays results returned by the backend.

## Requirements

- Node.js 20.19+ or 22.12+
- npm
- A compatible backend API, available at `http://localhost:8080` by default
- MetaMask or another compatible browser wallet for sign-in

## Run locally

```bash
npm ci
cp .env.example .env.local
npm run dev
```

On Windows PowerShell, use `Copy-Item .env.example .env.local` instead of `cp` if needed. Set `VITE_API_BASE_URL` in `.env.local` to the backend origin, without `/api/v1`. For example:

```dotenv
VITE_API_BASE_URL=http://localhost:8080
```

The backend must allow requests from the frontend origin. When deploying over HTTPS, use an HTTPS backend URL as well.

## Checks

```bash
npm run build
npm run lint
```

## Public repository and security notes

- Never put API keys, wallet private keys, seed phrases, production credentials, or real user documents in this repository or in `VITE_` environment variables. Vite embeds those variables in browser code.
- Local `.env` files and build output are ignored by Git. `.env.example` contains only a public development URL.
- Wallet signatures are sent to the backend for authentication and are not logged by the frontend. Authentication state is stored in browser session storage and cleared when the tab session ends or the user signs out.
- The backend must validate wallet signatures, nonces, authorization, uploads, and provenance claims. Client-side route checks are only a user interface convenience.
- The original project history is available at [LUOLUO277/trustflow-frontend](https://github.com/LUOLUO277/trustflow-frontend). This public snapshot starts with a fresh Git history so earlier commit metadata and files are not republished here.

## Stack

React 19, TypeScript, Vite, Ant Design, Axios, ethers, Zustand, and React Router.
