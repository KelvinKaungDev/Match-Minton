# Match Minton

Badminton session manager with smart court matching. Organises players into courts each round, tracks rounds played, and handles substitutions when players arrive late or leave early.

## Stack

- React 19 + Vite
- Tailwind CSS v4
- Firebase Firestore (real-time state sync)
- Firebase Hosting

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create a Firebase project**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Create a new project
   - Enable **Firestore Database** (start in test mode for development)
   - Register a Web App and copy the config

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Fill in your Firebase config values in `.env`.

4. **Run the dev server**
   ```bash
   npm run dev
   ```

## Deploy to Firebase Hosting

```bash
npm run build
npx firebase deploy --only hosting
```

## Firestore Structure

```
session/current        — session config, currentRound, screen, courts[]
players/{id}           — name, skill, status, roundsPlayed
```

## Features

- **Setup screen** — configure courts and hours, add players individually or via bulk paste
- **Live session** — Courts / Bench / Waiting / Done tabs, 15-min countdown timer, instant sub on leave
- **Summary screen** — round stats, MVP, per-player progress bars
- Real-time sync via Firestore `onSnapshot` — admin phone and display screen stay in sync automatically
# Match-Minton
