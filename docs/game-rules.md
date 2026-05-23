# Game Rules — WTK3

WTK3 is an online turn-based card game in the style of San Guo Sha (Sanguosha) / War of the Three Kingdoms. This doc summarizes the rules **as currently encoded in the code**, not the official tabletop rules — there are simplifications.

## Setup

1. Players join a room via URL: `?roomId=<id>&sessionId=<id>` (or click "เข้าร่วมเกมส์" to be assigned a new session id).
2. Each player picks a seat (sitZone 1–8).
3. Teams are randomly assigned by [`randomTeam`](../src/classes/Player.js). Distribution by player count:

   | Players | Emperor | Protector | Rebellion | Traitor |
   |---------|---------|-----------|-----------|---------|
   | <4      | (no team assignment — game cannot start)                  |
   | 4       | 1       | 1         | 1         | 1       |
   | 5       | 1       | 1         | 2         | 1       |
   | 6       | 1       | 1         | 3         | 1       |
   | 7       | 1       | 2         | 3         | 1       |
   | 8       | 1       | 2         | 3         | 2       |

   - **emperor** (จักรพรรดิ) — public, +1 HP bonus from `pickWarlordClicked` (unless warlord is a god), starts first
   - **protector** (ผู้ภักดี) — hidden, wins with emperor
   - **rebellion** (กบฏ) — hidden, wins by killing emperor
   - **traitor** (คนทรยศ) — hidden, wins by being last alive in the right scenario
4. Each player is offered a pool of `randomWarlordPool = 3` warlords (see [DataInit.js](../src/classes/DataInit.js)) and picks one. The warlord sets max HP, kingdom (qun/wu/shu/wei/god), and gender.
5. A **137-card** deck (see `masterDeck` in [Card.js](../src/classes/Card.js), ids 1–137) is shuffled.

## Turn structure

The current player (`rule.playerPhaseSessionId`) plays a turn loosely consisting of:

1. **Preparation / judgement** — if the player has cards in their judgement zone (acedia, lightning, ration, know_enemy), they draw judgement cards to resolve them. The app prompts via a modal.
2. **Draw** — usually 2 cards (`จั่วการ์ด` button). Some warlords modify this.
3. **Play** — click cards in hand to use them; click cards in the battle zone or on other players to target/pick/discard. There is no automatic targeting — the human players agree verbally and click the right buttons.
4. **Discard** — at end of turn, hand size must be ≤ `me.hp` (or `me.hp - 1` if `card_down_state`). The app pops a modal warning when the limit is exceeded.
5. **End turn** — `จบเทิร์น` button. Battle-zone cards move to trash, lightning shifts to the next player, the turn pointer advances to the next alive player.

> A lot of rule enforcement is **manual** — the app gives players the buttons they need but does not automatically validate "is this card legal to play right now". Trust between players matters.

## Damage and death

- HP can be set via `+ พลังชีวิต` / `- พลังชีวิต` buttons (calls `playerTakeHeal` / `playerTakeDamage`).
- When `hp <= 0` with cards still owned, the player enters **dying** state; the `ตาย` (die) button appears.
- Dying players can be saved by `peach` cards (manually played by anyone). If saved, players use the `+ พลังชีวิต` button.
- On confirmed death, all cards go to the trash and the team affiliation is revealed in the log.

## Win conditions

Checked by string matching on the latest log entry inside `useEffect([log])` in [App.js](../src/App.js):

- `"กบฏได้รับชัยชนะ"` — rebellion wins (emperor dies, rebellion alive)
- `"จักรพรรดิและผู้ภัคดีได้รับชัยชนะ"` — emperor + protectors win (all rebels + traitors dead)
- `"คนทรยศได้รับชัยชนะ"` — traitor wins (traitor is the last one alive with the emperor scenario)

`showVictory` / `showGameOver` plays the appropriate sound and opens the endgame modal.

## Death Match mode

`rule.deathMatch = true` is set when only 2–3 specific role combinations remain (see `deathMatchCheck` in [App.js](../src/App.js)):

- 3 alive: traitor + rebellion + emperor
- 2 alive: traitor+emperor, traitor+protector, or rebellion+emperor

Effects:
- `peach` and `wine` switch to `_2` art and can no longer heal (only substitute for attack/dodge).
- `DrumThemeSong.mp3` starts looping.
- Players are expected to play more aggressively.

## Status states

Defined in [State.js](../src/classes/State.js). Some are boolean toggles, some are numeric counters:

| State            | Type    | Meaning (short)                                                                |
|------------------|---------|--------------------------------------------------------------------------------|
| `chain_state`    | bool    | Chained — damage from "attack" cascades to other chained players on ♠ 2–9      |
| `acedia_state`   | bool    | Has "acedia" judgement card — may skip play phase                              |
| `ration_state`   | bool    | Has "ration" judgement card — may skip draw phase                              |
| `trick_state`    | bool    | "Tao Yin's hypnosis" — forced to believe Tao Yin's bluff                       |
| `zuo_ci_state`   | bool    | "Zuo Ci's disguise" — can reroll warlord identity                              |
| `farm_state`     | number  | Deng Ai's farms — increase distance to others                                  |
| `rage_state`     | number  | Lubu God's rage tokens — spent for skills                                      |
| `nightmare_state`| number  | Guan Yu God's nightmare tokens                                                 |
| `card_down_state`| bool    | Hand limit -1                                                                  |
| `wound_state`    | number  | Zhou Tai's wound markers — +1 hand limit each                                  |
| `grateful_state` | number  | Lu Ji's filial-piety tokens — +1 draw, can spend to block damage               |
| `honor_state`    | number  | Guanqiu Jian's honor tokens                                                    |

The status icon row on a player avatar uses Font Awesome icon classes defined in `stateTypes`.

## Special skill triggers (UI surfaces)

Warlords listed in `Warlord.hasSkillButton` get a "ใช้งานทักษะ" dropdown:

- `tao_yin` — face-down hypnosis card + reveal
- `zuo_ci` — random disguise / re-pick warlord
- `taishi_ci`, `xun_yu`, `zhu_rong` — point duel (`pointCard`) flow
- `deng_ai` — `farm_state` +/-
- `lubu_god` — `rage_state` +/-
- `guan_yu_god` — `nightmare_state` +/-
- `zhou_tai` — `wound_state` +/-
- `lu_ji` — `grateful_state` +/-
- `guanqiu_jian` — `honor_state` +/-
- `xu_you` — peek top 2 cards
- `lu_zhi` — secretly pick a master, then reveal (**warlord is currently commented out of `initWarlords`**; UI is dead code unless re-enabled)

When adding a new active skill, extend this dropdown rather than inventing a new UI pattern.
