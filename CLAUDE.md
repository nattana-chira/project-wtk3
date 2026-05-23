# CLAUDE.md

Guidance for Claude Code (and other AI coding assistants) working in this repository.

## Project: WTK3 — War of the Three Kingdoms (card game)

WTK3 is an online, multiplayer, turn-based board / card game inspired by the Three Kingdoms era of Chinese history (similar in spirit to "San Guo Sha" / "Sanguosha"). Players sit at numbered seats around a virtual table, are assigned a hidden team role (emperor / protector / rebellion / traitor), pick a warlord (hero) with unique skills, then play cards on their turn to attack, defend, heal, equip items, and trigger spells until one team wins.

UI text in the game is primarily Thai (เทิร์น, ขุนพล, การ์ด, etc.). When editing log messages, modals, or button labels, preserve Thai wording unless told otherwise.

## Tech stack

- **React 18** (Create React App, `react-scripts` 5.0.1) — single-page app, no router
- **Firebase Firestore** as the realtime backend: every room state document lives in the `test2` collection and is synced via `onSnapshot`
- **Bootstrap 5** + **Font Awesome 4.7** loaded from CDN in [public/index.html](public/index.html); no local Bootstrap install. Bootstrap JS bundle is also CDN-loaded — modals are activated by clicking invisible trigger buttons via `useRef`.
- **classnames** for conditional class merging
- **immutable**, **query-string**, **react-html-parser** are in `package.json` but **unused in source**; safe to remove later
- HTML5 `Audio` for SFX/music — see [src/classes/Audio.js](src/classes/Audio.js)
- JavaScript only (no TypeScript), no linter config beyond CRA defaults
- [src/index.css](src/index.css) uses **native CSS nesting** (`.player { .avatar { ... } }`). Requires Chrome ≥112 / Safari ≥16.5 / Firefox ≥117 (April 2023+); CRA's PostCSS does **not** flatten it. Keep this in mind for older browser support requests.

## Commands

```bash
npm install        # install deps
npm start          # dev server on http://localhost:3000
npm run build      # production build into build/
npm test           # CRA test runner — currently BROKEN
```

> [src/App.test.js](src/App.test.js) is the default CRA stub that asserts on a "learn react" link that doesn't exist in this app. `npm test` will fail until that file is deleted or rewritten.

## High-level architecture

The app is intentionally simple: **one giant component (`App`) holds all game state and mutator functions**, persists every change to Firestore, and re-renders when Firestore pushes an update. There is no Redux/Zustand/Context — state is local `useState` synced with a remote document.

### Data flow per action

1. User clicks something in the UI (e.g. play a card, draw, end turn).
2. The matching handler in [src/App.js](src/App.js) builds a local `state = { log, rule, players, deck }` snapshot.
3. Helper mutators (`addCardToTrash`, `playerTakeDamage`, `removeCardFromHand`, etc.) mutate that snapshot in place AND call the corresponding `setX` setter for an optimistic local update.
4. `addLog(state, msg)` appends a Thai log line.
5. `delay(() => updateData(state, mainState, { roomId }))` pushes the new state to Firestore.
6. Every connected client's `onSnapshot` listener fires, refreshing `players`, `deck`, `rule`, `log`.

> The "delay" wrap (`setTimeout` with 20ms in [src/classes/Utils.js](src/classes/Utils.js)) is a real ordering technique here — it lets the synchronous `setX` calls settle before Firestore write. Don't remove it casually.

### Room / session model

- Each game lives in a Firestore document; the URL carries `?roomId=...&sessionId=...`.
- A player without `sessionId` sees the **join screen**, picks a seat (1–8), gets a random 6-digit `sessionId`, and the URL is rewritten with `window.history.replaceState` (no page reload).
- `?user=admin` flips `isAdmin` on and reveals the [DebugTool](src/components/DebugTool.js) panel (ADD DATA = create new room, RESET DATA = wipe current room, SET TURN, CONTROL PLAYER = swap which `sessionId` the URL points at, GIVE CARD 4, DRAW 10).
- `DEV_MODE = true` in [src/classes/_InitSetting.js](src/classes/_InitSetting.js) skips Firebase entirely and uses `initState` from [src/classes/DataInit.js](src/classes/DataInit.js) for local development. `updateData` becomes a no-op (logs only).
- `AUTO_RANDOM_HERO = true` in the same file auto-assigns each player a warlord on init — `initWarlords[78]` is referenced directly, so don't reorder the roster around that index.

### Turn order and team distribution

`randomTeam` in [Player.js](src/classes/Player.js) shuffles players then assigns teams by **shuffle position**, then re-sorts by `sitZone`:

| Players | Teams                                                          |
|---------|----------------------------------------------------------------|
| <4      | No teams assigned — returns the shuffled list as-is            |
| 4       | 1 emperor, 1 protector, 1 rebellion, 1 traitor                 |
| 5       | + 1 more rebellion (= 2 rebels)                                |
| 6       | + 1 more rebellion (= 3 rebels)                                |
| 7       | + 1 more protector (= 2 protectors)                            |
| 8       | + 1 more traitor (= 2 traitors)                                |

`randomTeam` also sets `players[0].hp = 5; players[0].maxHp = 5` for the emperor, but this is **immediately overwritten** when the emperor picks their warlord via `pickWarlordClicked` in App.js: `hp = warlord.maxHp`, then `+1` if `team === "emperor"` AND the warlord isn't a god (god kingdom skips the +1 bonus).

### State shape (Firestore document, also React state)

```
{
  deck:    number[]                     // remaining card IDs (top of deck = index 0)
  players: Player[]                     // see classes/Player.js
  log:     string[]                     // Thai log strings, may contain inline HTML
  rule: {
    playerPhaseSessionId: string        // whose turn it is
    battleZone:           number[]      // card IDs currently played in middle area
    trashDeck:            number[]      // discard pile
    counter:              number
    deathMatch:           boolean       // late-game rule mode
    restartMatch:         boolean       // triggers full room reset
    ramdomToPickWarlords: [             // (note misspelling preserved — used as key)
      { sessionId, warlords: Warlord[] }
    ]
  }
}
```

The `Player` class lives at [src/classes/Player.js](src/classes/Player.js) and includes `hp`, `maxHp`, `cards` (hand, by ID), `fieldCards` (equipment area), `judgementCards` (pending-effect cards in front of player), `sitZone` (1–8), `state` (status flags from [src/classes/State.js](src/classes/State.js)), and `team`.

## Source layout

- [src/App.js](src/App.js) — ~1.7k lines. The whole UI + every game action handler. When adding game mechanics, this is almost always the file you touch.
- [src/index.js](src/index.js), [src/firebase.js](src/firebase.js) — bootstrap and Firebase client.
- [src/classes/](src/classes/) — game data and pure-ish logic:
  - [Card.js](src/classes/Card.js) — `Card` class, the **138-card `masterDeck`**, Thai translations (`masterTrans`), helpers like `mapMasterDeck(id)` and `searchCardAction`.
  - [Warlord.js](src/classes/Warlord.js) — `Warlord` class, the **~80-warlord `initWarlords` roster**, Thai skill text (`warlordTrans`), helpers like `hasSkillButton` / `hasChallengePointButton`.
  - [Player.js](src/classes/Player.js) — `Player` class + `randomTeam(players)` role assignment (emperor gets +1 HP, etc.).
  - [State.js](src/classes/State.js) — player-state flags (chain, acedia, ration, farm, rage, wound, …) with icons and Thai descriptions.
  - [DataInit.js](src/classes/DataInit.js) — builds `initState` (random teams, shuffled deck, warlord pool of 3 per player) and exposes `addInit` / `resetInit` to create or reset a Firestore room.
  - [ApiService.js](src/classes/ApiService.js) — `fetchInitData`, `updateData` thin wrappers over Firestore.
  - [Audio.js](src/classes/Audio.js) — static class of named sound effects sourced from `src/audio/*`.
  - [Utils.js](src/classes/Utils.js) — `delay`, `randomId`, `randomIdOnlynumber`, `sortRandom` (Fisher-Yates shuffle).
  - [_InitSetting.js](src/classes/_InitSetting.js) — `DEV_MODE` and `AUTO_RANDOM_HERO` toggles.
- [src/components/](src/components/) — small presentational components:
  - [CardComponent.js](src/components/CardComponent.js) — renders one card (image from `public/img/card_<action>.png`, hidden as `back_of_card`, swaps to `_2` variants in death-match mode).
  - [PlayerComponent.js](src/components/PlayerComponent.js) — renders an opponent's seat: avatar, HP hearts, status icons, hand (face-down), field cards, and a speech-bubble derived from `lastLog`.
  - [DebugTool.js](src/components/DebugTool.js) — admin-only controls.
- [public/img/](public/img/) — card and hero artwork. **Filenames follow strict conventions** (see below).
- [src/audio/](src/audio/) — sound assets imported by `Audio.js`.

## Conventions to follow

### Asset filename conventions (these are load-bearing)

- Card image: `public/img/card_<action>.png` where `<action>` is the card's `action` field (e.g. `card_attack.png`, `card_peach.png`). Death-match alt art uses `_2` suffix (`card_peach_2.png`). `CardComponent` builds the path from the action string.
- Warlord portrait: `public/img/hero_<warlord_name>.png` (e.g. `hero_cao_cao.png`, `hero_zhuge_liang_god.png`). `App.js` and `PlayerComponent.js` build the path from `warlord.name`.
- When adding a new card or warlord, you **must** add the matching image, or rendering will silently 404.

### Adding a new card

1. Add a `new Card(id, no, symbol, action, type, subtype?)` entry to `masterDeck` in [src/classes/Card.js](src/classes/Card.js) with a unique sequential `id`.
   - `type` must be one of `"basic"`, `"equipment"`, `"spell"`. Constructor enforces:
     - `basic` action ∈ `["attack","peach","dodge","wine"]`
     - `equipment` requires `subtype` (`weapon`/`armor`/`mount`)
     - `spell` actions cannot overlap with basic action names
2. Add a `masterTrans[action] = { name, desc }` entry (Thai). If the action already exists, you can skip this.
3. Drop `card_<action>.png` into [public/img/](public/img/).
4. If it should be playable on the judgement zone, add the action name to `canBeplaceOnJudgement` in [Card.js](src/classes/Card.js).
5. If it needs a sound, map it in `playSoundByAction` in [src/App.js](src/App.js).

### Adding a new warlord

1. `buildWarlord("name", maxHp, kingdom, gender)` entry in `initWarlords` in [src/classes/Warlord.js](src/classes/Warlord.js). `kingdom` ∈ `qun|wu|shu|wei|god`, `gender` ∈ `male|female`.
2. `warlordTrans.<name> = { name, desc }` (Thai skill description, HTML allowed via `dangerouslySetInnerHTML`).
3. Add `hero_<name>.png` to [public/img/](public/img/).
4. If the warlord has an active button-triggered skill, add the name to `Warlord.hasSkillButton` (and `hasChallengePointButton` if it uses 點 duel). Then implement the UI in the "ใช้งานทักษะ" dropdown in `App.js`.
5. If it needs a numeric status counter, add to `defaultPlayerStates` and `stateTypes` in [src/classes/State.js](src/classes/State.js).

### State mutation pattern

Always follow the existing pattern in `App.js`:

```js
const handlerClicked = () => {
  const state = { log, rule, players, deck }   // grab what you need
  // mutate via helpers (they call setX internally)
  removeCardFromHand(selectedCard, me, state)
  playerTakeDamage(targetPlayer, state)
  // log it
  addLog(state, "ใช้การ์ด ...")
  // sync to Firestore
  delay(() => updateData(state, mainState, { roomId }))
}
```

The helper functions both **mutate the passed `state` object in place** AND call `setX` for optimistic local rendering. Don't break this dual-write — Firestore replay depends on both.

### Log messages are also a protocol

Log strings drive UI behavior:

- [PlayerComponent.js](src/components/PlayerComponent.js) `bubbleText()` parses the last log for substrings like `"ใช้การ์ด"`, `"จั่วการ์ด"`, `"จั่วการ์ดตัดสิน"`, `"ทิ้งการ์ด"`, `"ได้รับความเสียหาย"` to render a per-player speech bubble.
- The `useEffect` watching `log` in [App.js](src/App.js) plays sounds and shows win/lose modals based on Thai substrings (`"กบฏได้รับชัยชนะ"` etc.).

When changing log wording, **search for the old phrase first** — UI logic likely depends on it.

### Field-level quirks worth knowing

- `rule.ramdomToPickWarlords` — typo (`ramdom` instead of `random`) is **load-bearing**: it's used as a JSON key in Firestore. Don't rename without a migration.
- React StrictMode is intentionally disabled in [src/index.js](src/index.js).
- Bootstrap modals are driven via `useRef` + invisible trigger/close `<button>` elements rather than Bootstrap's JS API. Pattern: `modalTriggerN.current.click()`.
- The code mixes React `class=` and `className=` — that's a CRA-tolerated wart, not a bug to fix.
- `Card.no` is 1–13; `Card.symbol` ∈ `spade|heart|diamond|club`. `showNo()` renders A/J/Q/K.
- `initDeck` is exported as `fullInitDeck` — all **137** cards (last id `137`). Shuffled by `shuffleDeck` (Fisher-Yates via `sortRandom` in [Utils.js](src/classes/Utils.js)). Note: `randomTeam` and `DataInit.js` use the simpler-but-biased `Math.random() - 0.5` shuffle instead — preserve whichever shuffle is already in place when editing.
- `lu_zhi` warlord exists in `warlordTrans`, `hasSkillButton`, and the App.js skill UI, but is **commented out** of `initWarlords`. The UI code is dead until that line is uncommented.
- The five modal refs in [App.js](src/App.js) map to: `modalTrigger` → `#confirmModal` (play card from hand), `modalTrigger2` → `#detailModal` (inspect card), `modalTrigger3` → `#otherModal` (generic info popup), `modalTrigger4` → `#pickHeroModal` (warlord pick / zuo_ci disguise), `modalTrigger5` → `#endgameModal` (victory/defeat). `modalClose3` is declared but never used.

## Working with this repo

- **Whole files are large.** [src/App.js](src/App.js) is ~1.7k lines and [src/classes/Warlord.js](src/classes/Warlord.js) is ~230 lines with very long Thai HTML descriptions per warlord (read attempts may exceed token limits). Use `Grep`/`offset+limit` reads, not full-file reads.
- **No real tests, no types, no lint enforcement.** Verify changes by running `npm start` and clicking through the flow you touched. The default CRA `App.test.js` exists but is broken — don't trust `npm test` as a CI gate.
- **Firebase config is committed** in [src/firebase.js](src/firebase.js). Treat it as the dev project — don't add secrets that shouldn't be public; if a separate prod project is created later, rotate it through env vars.
- The repository uses CRLF on Windows; preserve existing line endings.
- A stale [build/](build/) directory is committed to disk (gitignored, won't be pushed) — safe to ignore unless you need to test the prod bundle, in which case re-run `npm run build`.
- The five `useEffect` hooks in [App.js](src/App.js) cover: (1) initial Firestore subscription + fetch, (2) death-match drum start, (3) restart-match handling, (4) "it's now my turn" intro audio + auto-judgement modals, (5) the big log-watcher that drives SFX and win/lose detection. When changing log strings, re-read effect #5.

## Further docs

More detailed references live in [docs/](docs/):

- [docs/game-rules.md](docs/game-rules.md) — turn structure, win conditions, status effects, team distribution table.
- [docs/data-model.md](docs/data-model.md) — Firestore document shape and field meanings.
- [docs/cards-and-warlords.md](docs/cards-and-warlords.md) — how to add cards and warlords end-to-end (checklist).
- [docs/firebase.md](docs/firebase.md) — Firestore setup, room lifecycle, admin operations.

Keep this file in sync as the codebase evolves: when conventions change, an architectural seam moves, or new top-level files appear, update CLAUDE.md and the relevant doc.

## Onboarding checklist (for the next agent)

If you're picking up where someone else left off, do this in order:

1. Read this entire CLAUDE.md once.
2. Skim [docs/game-rules.md](docs/game-rules.md) to understand what the user means by "turn", "judgement", "death match", etc.
3. Skim [docs/data-model.md](docs/data-model.md) so you can read a Firestore room dump.
4. Open [src/App.js](src/App.js) and search for the handler that maps to whatever the user is asking about. Naming convention: `<verb>Clicked` (e.g. `endTurnClicked`, `drawClicked`, `judgementActionClicked`).
5. Run `npm start`, open `http://localhost:3000/?roomId=<existing>&sessionId=<some>&user=admin`, and use the ADMIN dropdown to set up a state you can experiment with. There's no seed script besides the DebugTool buttons.
6. Before changing log strings or moving an existing flow, grep for the Thai phrase — it's often parsed elsewhere.
7. After non-trivial changes, click through a full turn cycle in the browser. There are no automated tests to catch regressions.
