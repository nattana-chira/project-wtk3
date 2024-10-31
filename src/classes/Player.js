import Warlord from "./Warlord"
import { DEV_MODE } from "./_InitSetting"
import { defaultPlayerStates } from './State'

export default class Player {
  name = null
  sessionId = null
  warlord = {}
  team = null
  hp = 1
  maxHp = 1
  cards = []
  fieldCards = []
  judgementCards = []
  sitZone = null
  state = {...defaultPlayerStates}
  logDrawCardIds = []

  constructor(name, sessionId, warlord, team, hp, sitZone) {
    this.name = name
    this.sessionId = sessionId
    this.warlord = warlord
    this.team = team
    this.hp = hp
    this.maxHp = hp
    this.sitZone = sitZone
  }

  static showFullname(player) {
    return `${player?.name} (${player?.sessionId})`
  }

  static showRoleName(player) {
    return `${player?.name} (${Warlord.showName(player?.warlord)})`
  }

  static showTeam(player) {
    switch(player.team) {
      case "emperor": return "จักรพรรดิ"
      case "protector": return "ผู้ภักดี"
      case "rebellion": return "กบฏ"
      case "traitor": return "คนทรยศ"
      default: return "???"
    }
  }
}

const _initPlayers = [
  new Player("Drink", "254686", {}, "", 4, 1),
  new Player("Somchai", "874957", {}, "", 3, 3),
  new Player("C0", "632001", {}, "", 5, 5),
  new Player("BOSS", "440426", {}, "", 6, 7)
]

export const initPlayers = DEV_MODE ? _initPlayers : []

export const randomTeam = (_players) => {
  let players = [..._players].sort(() => Math.random() - 0.5)
  if (_players.length < 4)
    return players

  players[0].team = "emperor"
  players[0].hp = 5
  players[0].maxHp = 5
  players[1].team = "protector"
  players[2].team = "rebellion"
  players[3].team = "traitor"

  if (players.length >= 5) 
    players[4].team = "rebellion"

  if (players.length >= 6) 
    players[5].team = "rebellion"

  if (players.length >= 7)
    players[6].team = "protector"

  if (players.length >= 8)
    players[7].team = "traitor"

  players = players.sort((a, b) => a.sitZone - b.sitZone)

  return players
}
