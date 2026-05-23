# Data Model

The whole game state for a room is a single Firestore document inside the `test2` collection (yes, the collection is named `test2`).

```text
firestore/
  test2/
    <roomId>/
      deck    : number[]      // card ids remaining
      players : Player[]      // see below
      log     : string[]      // Thai log entries; may contain inline HTML
      rule    : Rule          // see below
```

## Player

Source: [src/classes/Player.js](../src/classes/Player.js)

```ts
Player {
  name:            string
  sessionId:       string          // unique per player; mapped to URL ?sessionId
  warlord:         Warlord | {}    // {} before pick
  team:            "emperor" | "protector" | "rebellion" | "traitor" | ""
  hp:              number
  maxHp:           number
  cards:           number[]        // card IDs in hand
  fieldCards:      number[]        // equipped/zoned cards (weapon/armor/horse/treasure)
  judgementCards:  number[]        // pending-effect cards (acedia/lightning/ration/know_enemy)
  sitZone:         number          // 1..8 around the table
  state:           PlayerState     // see State.js / defaultPlayerStates
  logDrawCardIds:  number[]        // tally for the endgame stats screen
}
```

### PlayerState

Source: [src/classes/State.js](../src/classes/State.js). Boolean flags default to `false`, numeric counters to `0`. Adding a new state requires updating:

1. `stateTypes` (array, drives UI icons)
2. `stateTrans` (Thai display name + description)
3. `defaultPlayerStates` (default value)

## Warlord

Source: [src/classes/Warlord.js](../src/classes/Warlord.js)

```ts
Warlord {
  name:    string          // lowercase snake_case, matches public/img/hero_<name>.png
  maxHp:   number
  kingdom: "qun" | "wu" | "shu" | "wei" | "god"
  gender:  "male" | "female"
}
```

Skills live as Thai HTML strings in `warlordTrans[name].desc` — rendered with `dangerouslySetInnerHTML`. The roster (`initWarlords`) is index-stable: changing the order will alter the `AUTO_RANDOM_HERO` debug behavior (`initWarlords[78]` is referenced directly there).

## Card

Source: [src/classes/Card.js](../src/classes/Card.js)

```ts
Card {
  id:      number          // unique sequential, 1..138
  no:      1..13           // playing-card rank
  symbol:  "spade" | "heart" | "diamond" | "club"
  action:  string          // e.g. "attack", "peach", "horse_atk"
  type:    "basic" | "equipment" | "spell"
  subtype: "weapon" | "armor" | "mount" | null   // required for equipment
}
```

Constructor enforces:
- `basic` action ∈ `["attack","peach","dodge","wine"]`
- `equipment` actions cannot be basic action names and must have a subtype
- `spell` actions cannot be basic action names

Card IDs map directly to `masterDeck` index via `mapMasterDeck(id) === masterDeck[id-1]`. The current deck has **137 cards** (ids 1–137). Don't reorder `masterDeck` without rewriting any saved Firestore rooms — every active room references the existing ids.

## Rule

```ts
Rule {
  playerPhaseSessionId: string        // current player's sessionId
  battleZone:           number[]      // card ids currently in play
  trashDeck:            number[]      // discard pile
  counter:              number        // session-rev counter; bumped by admin tools
  deathMatch:           boolean       // late-game mode (see game-rules.md)
  restartMatch:         boolean       // triggers all clients to reset URL + state
  ramdomToPickWarlords: Array<{       // misspelling preserved (load-bearing key)
    sessionId: string,
    warlords:  Warlord[]              // size = randomWarlordPool (3)
  }>
}
```

### Important: `ramdomToPickWarlords`

The misspelling (`ramdom` instead of `random`) is **persisted as a Firestore document key**. Renaming it without a data migration will silently break every existing room. If you want to fix it, write a migration script and bump existing documents.

## Lifecycle write path

Every state change in the UI flows through `updateData(state, mainState, { roomId })` in [ApiService.js](../src/classes/ApiService.js), which calls `updateDoc(doc(collection(db, "test2"), roomId), { deck, players, rule, log })`.

Other clients receive the update via the `onSnapshot` subscription set up in [App.js](../src/App.js) inside the initial `useEffect`. There is no diff/patch — every write rewrites the whole document.

## Initialization

`addInit()` from [DataInit.js](../src/classes/DataInit.js) creates a fresh room document using:

- `randomTeam(initPlayers)` — if `DEV_MODE` is on, `initPlayers` is 4 hardcoded players; otherwise empty (real players join via the UI).
- `shuffleDeck(initDeck)` — Fisher-Yates over the 138-card deck.
- `randomWarlord(initWarlords)` — sliced into pools of 3 per player.

`resetInit(roomId, sessionId)` overwrites the existing document with a fresh one, keeping `roomId` and starting with `sessionId` as the emperor.
