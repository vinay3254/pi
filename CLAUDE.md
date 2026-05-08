# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**EtherXMeet** — a Web3-powered video conferencing platform. Real video runs via a Jitsi 8x8.vc iframe; meeting lifecycle (create/join/end) is optionally recorded on the **Polygon blockchain** via a `MeetingRegistry` smart contract. After a meeting ends, metadata is pinned to IPFS via Pinata and an NFT receipt is minted.

Branch `polygon-integration` is where all blockchain integration lives.

## Commands

All commands run from the `frontend/` directory.

```bash
# Frontend dev server (port 3000)
npm run dev

# 100ms token server (port 4000) — needed for HMS video features
npm run server

# Production build
npm run build
```

There is no test suite and no lint script configured.

## Architecture

### Two-server setup
- **Vite dev server** (`localhost:3000`): serves the React SPA
- **Express token server** (`localhost:4000`, `frontend/server/index.js`): issues 100ms auth tokens for room creation/joining. Separate from the main backend.
- **Backend API** (`localhost:5000`): handles auth (JWT + Google OAuth), recordings upload (`POST /api/recordings/upload`). Not in this repo — `VITE_API_BASE_URL` points to it.

### Context provider stack (App.jsx, outermost → innermost)
```
BrowserRouter → WalletProvider → AnimationProvider → UserProvider → UIProvider → MeetingProvider
```
- `WalletProvider` — MetaMask connection, chain switching (Polygon mainnet/Amoy/localhost), exposes `account`, `signer`, `provider`, `chainId`, `balance`
- `AnimationProvider` — prefers-reduced-motion, global animation toggle
- `UserProvider` / `UIProvider` / `MeetingProvider` — app state from the original mock-based build

`VideoBackground` and `CommandPalette` / `ToastSystem` are mounted globally outside the route tree.

### Web3 layer (`src/`)
- `hooks/useMeetingContract.js` — ethers.js v6 hook wrapping `MeetingRegistry`. Functions: `createMeeting`, `joinMeeting`, `sendMessage`, `endMeeting`, `pollEvents`, `getMeeting`, `getMeetingsByHost`, `hashNotes`. Requires a connected signer from `WalletContext`.
- `hooks/useMeetingNFT.js` — mints an NFT receipt after meeting end
- `utils/ipfs.js` — `pinJSON(obj)` → CID via Pinata; `fetchJSON(cid)` with one retry
- `components/web3/` — `ChainHUD`, `ChainProofBadge`, `MeetingReceiptModal`, `OnChainConfirmModal`, `WalletBanner`
- `contracts/MeetingRegistry.json` and `contracts/MeetingNFT.json` — compiled ABI + deployed address. Default address `0x5FbDB2315678afecb367f032d93F642f64180aa3` is a Hardhat local address.

### Meeting flow
1. **Join/Create** (`src/pages/Join.jsx`): real camera/mic preview via `useMediaDevices`. If wallet connected, triggers an on-chain tx before navigating to the room. Sets `sessionStorage.etherx_host_room` and `etherx_meet_start`.
2. **Room** (`src/pages/Room.jsx`): Jitsi iframe for actual video (`https://8x8.vc/vpaas-magic-cookie-…/{code}`). Host-only controls: screen recording via `getDisplayMedia` + `MediaRecorder` (uploads `.webm` to `/api/recordings/upload`), and "End Meeting" button that calls `endMeeting` on-chain → pins IPFS → mints NFT → shows `MeetingReceiptModal`.
3. **Auth**: `ProtectedRoute` wraps all non-auth routes. Backend issues JWT stored in localStorage via `src/utils/auth.js`. `apiClient.js` attaches it as `Authorization: Bearer <token>`.

### Feature panels (demo/mock)
`src/components/features/` contains 15 interactive UI modules (AI Assistant, Whiteboard, Breakout Rooms, Analytics Overlay, etc.). These use mock data from `src/data/*.js` and are not wired to real services.

## Environment Variables

Create `frontend/.env`:

```
VITE_API_BASE_URL=http://localhost:5000
VITE_NETWORK=localhost          # or "amoy" or "mainnet"
VITE_PINATA_JWT=<your-jwt>
VITE_PINATA_GATEWAY=https://gateway.pinata.cloud/ipfs
VITE_100MS_APP_KEY=<key>
VITE_100MS_APP_SECRET=<secret>
VITE_100MS_TEMPLATE_ID=<id>
VITE_100MS_DEFAULT_ROLE=host
```

`VITE_NETWORK` controls which chain `WalletContext` prompts MetaMask to switch to:
- `localhost` → chainId `0x7A69` (Hardhat)
- `amoy` → chainId `0x13882` (Polygon Amoy testnet)
- `mainnet` → chainId `0x89` (Polygon)

The `MeetingRegistry` contract address in `src/contracts/MeetingRegistry.json` must match the deployed address for the chosen network.

## Key Conventions

- **Wallet is optional** — features degrade gracefully when no wallet is connected. Never crash on missing `signer`.
- **ethers.js v6** — API differs from v5: `BrowserProvider` instead of `Web3Provider`, `ethers.ZeroHash`, `ethers.id()`, `tx.wait(1)` returns a receipt object.
- **`sessionStorage`** drives host detection in the room: `etherx_host_room` stores the room code set by the creator; `etherx_meet_start` stores Unix ms timestamp for duration calculation.
- **Framer Motion v12** — page transitions use `AnimatePresence mode="wait"` in App.jsx; per-page variants are in `src/utils/animationVariants.js`.
- Route constants are in `src/utils/constants.js` (`ROUTES`). Always import from there rather than hardcoding paths.
