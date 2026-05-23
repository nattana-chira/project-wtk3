# Adding Cards and Warlords

This is the most common type of change. Follow these checklists end-to-end — missing a step usually shows up as a 404 image, an "undefined" Thai name, or a card that can't be triggered.

## Add a new card

### 1. Image

Drop `card_<action>.png` into [public/img/](../public/img/). The filename `<action>` must match the `action` field you'll use in step 2.

If the card behaves differently in death-match mode and needs different art, also add `card_<action>_2.png`. [CardComponent](../src/components/CardComponent.js) auto-swaps to the `_2` variant when `deathMatch && deathMatchCards.includes(action)`. Currently only `peach`, `wine`, `brotherhood` are in `deathMatchCards`.

### 2. Translation

Add a `masterTrans[action]` entry in [src/classes/Card.js](../src/classes/Card.js):

```js
my_new_card: {
  name: "ชื่อไทย",
  desc: "คำอธิบายภาษาไทย … (อนุญาตให้ใช้ HTML inline ได้ เช่น <strong>, <br />, <span class='red'>)"
}
```

If the card shares an `action` with an existing one (e.g. another `attack`), skip this — translations are keyed by action, not by card id.

### 3. Add it to `masterDeck`

Append `new Card(id, no, symbol, action, type, subtype?)` to `masterDeck` in [Card.js](../src/classes/Card.js):

```js
new Card(138, 7, "spade", "my_new_card", "spell")  // next free id after the current 137
```

Rules enforced by the `Card` constructor:

| `type`     | `action` must be ...                     | `subtype` required |
|------------|------------------------------------------|--------------------|
| basic      | one of `attack`/`peach`/`dodge`/`wine`   | no                 |
| equipment  | NOT a basic action                       | yes (weapon/armor/mount) |
| spell      | NOT a basic action                       | no                 |

**The card id MUST be unique and sequential**, because `mapMasterDeck(id) = masterDeck[id-1]`. Always append, never insert.

### 4. Judgement-zone targeting

If your card is placed in front of another player and resolved next turn (like `acedia`, `lightning`, `ration`, `know_enemy`), add the action to the array in `Card.canBeplaceOnJudgement`.

### 5. Sound effect

Add a case for the action in `playSoundByAction` in [App.js](../src/App.js):

```js
else if (action.includes("my_new_card")) PlayAudio.skillSuccess()
```

If you need a new SFX, import it in [Audio.js](../src/classes/Audio.js) and add a static method, then drop the audio file in [src/audio/](../src/audio/).

### 6. Special handling

Cards like `harvest`, `wooden ox (carrier)`, and `borrowed_sword` have bespoke flows wired in [App.js](../src/App.js):

- `harvestActionClicked` — deals N cards face-up into the battle zone for players to grab
- `woodenOxActionClicked` — installs `carrier` on another player's field
- The "VIEW MODAL" footer in `App.js` conditionally shows `harvest` / judgement / carrier action buttons

If your new card needs special multi-step UI, add a handler in `App.js` and wire it into the appropriate modal footer.

## Add a new warlord

### 1. Image

Drop `hero_<name>.png` into [public/img/](../public/img/). `<name>` is the snake_case key you'll use below.

### 2. Roster entry

Append to `initWarlords` in [src/classes/Warlord.js](../src/classes/Warlord.js):

```js
buildWarlord("my_new_hero", 4, "wei", "male"),
```

- `maxHp`: typically 3 or 4 (8 for Dong Zhou)
- `kingdom`: `qun` (independent), `wu`, `shu`, `wei`, or `god`
- `gender`: `male` or `female` (matters for cards like `yin_yang_swords` and Diao Chan's skill)

> Be careful not to mutate the indexes used by `AUTO_RANDOM_HERO` in [DataInit.js](../src/classes/DataInit.js) (`initWarlords[78]`). When in doubt, append.

### 3. Skill description

Add to `warlordTrans` in [Warlord.js](../src/classes/Warlord.js):

```js
my_new_hero: {
  name: "ชื่อไทย",
  desc: "<strong>1. ทักษะที่ 1</strong> คำอธิบาย <br /><strong>2. ทักษะที่ 2</strong> ..."
}
```

Convention: bold the skill name with `<strong>`, separate skills with `<br />`. Symbols can be colorized via `<span class='red'>♥</span>` etc.

### 4. Active skill button

If the warlord has an active skill (not just passive), register it in `Warlord.hasSkillButton`:

```js
const warlords = ["tao_yin", "zuo_ci", ..., "my_new_hero"]
```

Then add the UI inside the "ใช้งานทักษะ" dropdown in [App.js](../src/App.js) (search for `me.warlord.name === "tao_yin"` as a template). For numeric-counter skills (like rage/wound/honor), use `playerStateChangeClicked(me, "<state>", "+" or "-")`.

### 5. New status state (if needed)

If the warlord introduces a new counter/flag, update [State.js](../src/classes/State.js):

```js
// stateTypes
{ state: "my_new_state", icon: "fa fa-star", isNumeric: true },

// stateTrans
my_new_state: { name: "ชื่อสถานะ", desc: "คำอธิบาย" },

// defaultPlayerStates
my_new_state: 0,
```

`isNumeric: true` makes it render as a counter; omit it for boolean flags.

### 6. Point-duel (ท้าสู้แต้ม) skills

If the warlord uses the point-duel mechanic, add to `Warlord.hasChallengePointButton`:

```js
const warlords = ["taishi_ci", "xun_yu", "zhu_rong", "my_new_hero"]
```

The existing `pointCardClicked` / `pointCardRevealed` flow will then surface for that warlord.

## Verification

1. `npm start` and load the app with `?roomId=<existing>&sessionId=<yours>&user=admin`.
2. Use the ADMIN → ADD DATA / RESET DATA tools to create or reset a room.
3. Use GIVE CARD 4 and DRAW 10 to load cards into hand.
4. Check that:
   - The new card's image renders (no broken image icon)
   - The card's Thai name and description show in the modal
   - The sound effect plays when used
   - End-of-turn cleanup still works
