# Firebase

WTK3 uses Firebase Firestore (no Auth, no Functions, no Storage) as a realtime shared whiteboard for room state.

## Configuration

[src/firebase.js](../src/firebase.js) hardcodes the dev project config:

```
projectId:        wtk-game
authDomain:       wtk-game.firebaseapp.com
storageBucket:    wtk-game.appspot.com
messagingSenderId 71061308659
```

The API key in the file is a Firebase web key (public by design — it identifies the project, it does not grant secret access). Real access control would have to come from Firestore Security Rules, which this repo does not manage.

If you need a separate prod project, switch `firebaseConfig` to env vars (`process.env.REACT_APP_*`) before deploying.

## Collections

- `test2/<roomId>` — one document per game room. Schema documented in [data-model.md](data-model.md).

That's the entire schema. No subcollections, no auth records.

## Realtime sync

```js
// src/App.js
onSnapshot(doc(collection(db, "test2"), roomId), (snapshot) => {
  const data = snapshot.data()
  setPlayers(data.players)
  setDeck(data.deck)
  setRule(data.rule)
  setLog(data.log)
})
```

Every connected client subscribes to the same document. When any client calls `updateData(...)`, Firestore fans out the change to all subscribers within ~100ms.

## Write path

[`updateData`](../src/classes/ApiService.js) is the single chokepoint:

```js
updateDoc(doc(collection(db, "test2"), roomId), { deck, players, rule, log, ...override })
```

There is no field-level patch — every write rewrites the four top-level arrays/objects. This is fine because the document is small (a few KB) and traffic is low (1 active room at a time during a game).

Note: `updateData` does nothing when `DEV_MODE = true` — useful for local UI iteration without polluting Firestore.

## Room lifecycle

### Active dev room

```
roomId: sOKEaOTdjxYxsMDqLaqs
URL:    http://localhost:3000/?roomId=sOKEaOTdjxYxsMDqLaqs&user=admin
```

### Create a room

The [DebugTool](../src/components/DebugTool.js) `ADD DATA` button calls `addInit()` from [DataInit.js](../src/classes/DataInit.js) which `addDoc`s a fresh `initState` into `test2`. The new document id becomes the `roomId` players use in the URL.

```js
const docRef = await addDoc(collection(db, "test2"), { ...jsonData })
console.log("Document written with ID: ", docRef.id)
```

Currently the new `roomId` is only logged to console — copy it from there and share the URL `?roomId=<id>` with friends.

### Reset a room

`RESET DATA <roomId>` in DebugTool sets `rule.restartMatch = true`. Every client picks that up in a `useEffect`, alerts "ROOM RESTART", clears their `?sessionId`, and reloads. The admin's `useEffect` then calls `resetInit(roomId, sessionId)` which overwrites the document with a fresh `initState`.

### Manual edits

You can edit a room directly in the Firebase Console (Firestore Data tab) — useful for debugging stuck states. The next `setX` from any client will overwrite your edit, so make changes when all clients are paused on a modal.

## Local-only dev

Set `DEV_MODE = true` in [src/classes/_InitSetting.js](../src/classes/_InitSetting.js):

- `App.js` skips the `onSnapshot` subscription
- `updateData` becomes a no-op (logs only)
- `initState` from `DataInit.js` is loaded directly into React state
- Fake players (Drink, Somchai, C0, BOSS) are pre-seated via `initPlayers`

This lets you iterate on UI/logic without round-tripping through Firestore. Remember to flip it back to `false` before committing.

## Security

There are **no Firestore security rules in this repo**. The Firebase Console defaults vary by project; if the project is in "test mode", anyone with the project id can read/write all data — fine for a hobby game played with friends, not fine for anything sensitive.

If hardening becomes necessary, write rules that constrain:

- `request.resource.data.players[i].sessionId` not impersonating another player
- Only the current `playerPhaseSessionId` (or an admin) can mutate turn-advancing fields

That would require client-side auth (Firebase Anonymous Auth is the easiest fit) and is not currently in scope.
