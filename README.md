# Match Minton 🏸

A real-time badminton session manager. Organises players into courts each round, tracks how many rounds each person has played, and handles substitutions when players arrive late or leave early.

Built for club organisers who run multi-court sessions and want fair rotation without the spreadsheet.

## Features

**Setup**
- Configure the number of courts, session length, and max player count
- Add players one at a time or bulk-paste a numbered list from Line/Chat
- Toggle each player between Bench (ready) and Waiting (not arrived yet)

**Live Session**
- Smart court matching — players with fewer rounds played are prioritised
- Four tabs: Courts · Bench · Waiting · Done
- 15-minute countdown timer per round with start / pause / reset
- One-tap "Leave" button substitutes the next eligible bench player instantly
- Fill empty courts mid-round from the bench
- Round history panel showing every previous court assignment

**Summary**
- Rounds played, total players, average rounds, MVP
- Per-player progress bar showing participation rate

**Real-time sync**
- Firestore `onSnapshot` keeps every connected device in sync — admin phone and projector screen update simultaneously with no refresh

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite |
| Styling | Tailwind CSS v4 |
| Database | Firebase Firestore |
| Hosting | Vercel |
| Tests | Vitest + Testing Library |

## Local Setup

**1. Install dependencies**
```bash
npm install
```

**2. Create a Firebase project**
- Go to [Firebase Console](https://console.firebase.google.com)
- Create a new project
- Enable **Firestore Database** (test mode is fine for development)
- Register a Web App and copy the config

**3. Configure environment variables**
```bash
cp .env.example .env
```

Fill in your Firebase values in `.env`:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
```

**4. Run the dev server**
```bash
npm run dev
```

## Deploy to Vercel

**1. Install Vercel CLI and log in**
```bash
npm install -g vercel
vercel login
```

**2. Deploy**
```bash
vercel
```

**3. Add environment variables**
```bash
vercel env add VITE_FIREBASE_API_KEY
vercel env add VITE_FIREBASE_AUTH_DOMAIN
vercel env add VITE_FIREBASE_PROJECT_ID
vercel env add VITE_FIREBASE_STORAGE_BUCKET
vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID
vercel env add VITE_FIREBASE_APP_ID
vercel env add VITE_FIREBASE_MEASUREMENT_ID
```

**4. Redeploy with env vars**
```bash
vercel --prod
```

After the initial setup, every push to `main` triggers an automatic redeploy.

## Tests

```bash
npm run test        # watch mode
npm run test:run    # single run (CI)
```

81 tests across four files:

| File | What it covers |
|---|---|
| `src/models/index.test.js` | `computeConfig`, `createPlayer`, constants |
| `src/services/matching.test.js` | `generateRound`, `findBestSub` |
| `src/hooks/useTimer.test.jsx` | Timer start / pause / reset / expiry |
| `src/hooks/useAppState.test.jsx` | All state actions with Firebase mocked |

## Project Structure

```
src/
├── components/
│   ├── setup/          # SetupScreen, SessionConfig, AddPlayer, PlayerList
│   ├── session/        # SessionScreen, CourtCard, tabs (Courts/Bench/Waiting/Done)
│   ├── summary/        # SummaryScreen
│   └── shared/         # PlayerPill, RoundTimer, SkillBadge
├── hooks/
│   ├── useAppState.js  # All Firestore state and actions
│   └── useTimer.js     # Countdown timer
├── models/
│   └── index.js        # Player factory, config calculator, constants
├── services/
│   ├── firebase.js     # Firestore initialisation
│   └── matching.js     # Court generation and substitution logic
└── test/
    └── setup.js        # jest-dom matchers
```

## Firestore Data Model

```
session/current
  ├── config            { courts, sessionHours, roundMinutes, maxPlayers, ... }
  ├── currentRound      number
  ├── screen            "setup" | "session" | "summary"
  ├── courts[]          [{ id, teamA: [playerId], teamB: [playerId] }]
  └── history[]         [{ round, courts: [{ teamA, teamB }] }]

players/{id}
  ├── name              string
  ├── skill             "S" | "A" | "B" | "C"
  ├── status            "waiting" | "bench" | "playing" | "done" | "leave"
  └── roundsPlayed      number
```

## Matching Algorithm

`generateRound` groups bench players by `roundsPlayed`, shuffles within each group, then fills courts from the front of that list — players who have played the fewest rounds are always selected first. When bench count falls short of filling all courts, done players are pulled in using the same priority.

`findBestSub` picks the bench player with the lowest `roundsPlayed` for instant substitution when someone leaves mid-round. Falls back to done players if the bench is empty.
