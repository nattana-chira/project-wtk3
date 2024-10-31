import { initPlayers, randomTeam } from './Player'
import { initDeck, shuffleDeck } from './Card'
import { collection, addDoc, getDocs, updateDoc, doc } from 'firebase/firestore'
import { db } from './../firebase'
import { initWarlords, randomWarlord } from './Warlord'
import { AUTO_RANDOM_HERO } from './_InitSetting'

let randomPlayers = randomTeam(initPlayers)
const randomDeck = shuffleDeck(initDeck)
const randomWarlords = randomWarlord(initWarlords)
let ramdomToPickWarlords = []

export const randomWarlordPool = 3

// random wardlords to pick
randomPlayers.map((player, i) => {
  const size = randomWarlordPool
  const warlords = randomWarlords.slice(i * size, (i+1) *size)
  
  const warlordForPick = {
    sessionId: player.sessionId,
    warlords
  }

  ramdomToPickWarlords = ramdomToPickWarlords.concat(warlordForPick)

  return player
})

// auto pick warlord
if (AUTO_RANDOM_HERO) {
  randomPlayers = randomPlayers.map((player, i) => {
    player.warlord = randomWarlords[i]
    player.warlord = initWarlords[78]
  
    if (player.warlord.name === "zuo_ci") 
      player.state.zuo_ci_state = true
  
    player.hp = player.warlord.maxHp
    player.maxHp = player.hp
  
    if (player.team === "emperor") {
      player.hp = player.hp + 1
      player.maxHp = player.hp
    }
  
    return player
  })
}

export const initState = {
  deck: randomDeck,
  players: randomPlayers,
  log: [],
  rule: {
    playerPhaseSessionId: randomPlayers.find(_player => _player.team === "emperor")?.sessionId,
    battleZone: [],
    trashDeck: [],
    counter: 1,
    deathMatch: false,
    restartMatch: false,
    ramdomToPickWarlords: ramdomToPickWarlords

    // ramdomToPickWarlords: [
    //   {
    //     sessionId: player.sessionId,
    //     warlords: [
    //       {
    //         name,
    //         maxHp,
    //         kingdom,
    //         gender
    //       }
    //     ]
    //   }
    // ]
  },
}

export const addInit = async () => {
  try {
    const jsonData = JSON.parse(JSON.stringify(initState))
    console.log('addInit', jsonData)

    const docRef = await addDoc(collection(db, "test2"), {
      ...jsonData
    });

    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

export const resetInit = async (roomId, sessionId) => {
  try {
    const _initState = { ...initState, rule: { ...initState.rule, playerPhaseSessionId: sessionId } }

    const jsonData = JSON.parse(JSON.stringify(_initState))
    console.log("before reset ", jsonData)

    await updateDoc(doc(collection(db, "test2"), roomId), { ...jsonData })

    console.log('Document successfully updated!');
  } catch (error) {
    console.error('Error updating document: ', error);
  }
}