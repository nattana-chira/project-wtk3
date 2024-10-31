import './App.css'
import Player, { randomTeam } from './classes/Player'
import { mapMasterDeck, masterDeck, renderSymbolColor, replaceTrans, searchCardAction } from './classes/Card'
import { useState, useEffect, useRef, Fragment } from "react"
import { initState, randomWarlordPool, resetInit } from './classes/DataInit'
import { DEV_MODE } from './classes/_InitSetting'
import classNames from "classnames"
import { fetchInitData, updateData } from './classes/ApiService'
import { delay, randomIdOnlynumber, sortRandom } from './classes/Utils'
import CardComponent from './components/CardComponent'
import DebugTool from './components/DebugTool'
import PlayAudio from './classes/Audio'
import PlayerComponent from './components/PlayerComponent'
import { collection, doc, onSnapshot } from "firebase/firestore"
import { db } from './firebase'
import { masterTrans } from './classes/Card'
import Warlord, { initWarlords, randomWarlord } from './classes/Warlord'
import { stateTrans } from './classes/State'

function App() {
  const [test, setTest] = useState(0)

  const queryParams = new URLSearchParams(window.location.search)
  const sessionId = queryParams.get("sessionId")
  const roomId = queryParams.get("roomId")
  const isAdmin = queryParams.get("user") === "admin"

  const [rule, setRule] = useState(null)
  const [players, setPlayers] = useState([])
  const [deck, setDeck] = useState([])
  const [log, setLog] = useState([])

  const [viewedCard, viewCard] = useState(null)
  const [detailText, setDetailText] = useState(null)
  const [selectedCard, selectCard] = useState(null)
  const [otherText, setOtherText] = useState([])
  const [lastAudioLog, setLastAudioLog] = useState("")
  const [yourName, setYourname] = useState("")
  const [endgameText, setEndgameText] = useState("")
  const [taoyinCard, setTaoyinCard] = useState(null)
  const [pointCard, setPointCard] = useState(null)
  const [xuYouCards, setXuYouCards] = useState([])
  const [luZhiMaster, setLuZhiMaster] = useState(null)

  const modalTrigger = useRef()
  const modalClose = useRef()
  const modalTrigger2 = useRef()
  const modalClose2 = useRef()
  const modalTrigger3 = useRef()
  const modalClose3 = useRef()
  const modalTrigger4 = useRef()
  const modalClose4 = useRef()
  const modalTrigger5 = useRef()

  const mainState = { rule, players, deck, log }
  const me = players.find(player => player.sessionId === sessionId)
  const phasePlayer = players.find(player => player.sessionId === rule?.playerPhaseSessionId)
  const myCards = me?.cards?.map(mapMasterDeck) || []
  const otherPlayers = players.filter(player => player.sessionId !== me?.sessionId)
  const warlordForPick = rule?.ramdomToPickWarlords.find(warlordForPick => warlordForPick.sessionId === me?.sessionId) || []
  const isJoJu = me?.state.zuo_ci_state

  const isMyTurn = me && me?.sessionId === rule?.playerPhaseSessionId
  const [lastLog] = log.slice(-1)
  const canViewCard = viewedCard && (
    me?.cards.includes(viewedCard.id) ||
    players?.find(_player => _player.fieldCards.includes(viewedCard.id)) ||
    players?.find(_player => _player.judgementCards.includes(viewedCard.id)) ||
    rule?.battleZone.includes(viewedCard.id)
  )
  const isDying = me?.hp <= 0 && (me?.cards.length > 0 || me?.fieldCards.length > 0 || me?.judgementCards.length > 0)
  const isWarlordPicked = me && me?.warlord?.name
  const isPlayerSitAt = (sitZone) => players.find(_player => _player.sitZone === sitZone)
  const notLoggedIn = !sessionId || !me

  const allPlayersPickedWarlord = players.every(_player => _player.warlord?.name)

  useEffect(() => {
    if (DEV_MODE) {
      setPlayers(initState.players)
      setDeck(initState.deck)
      setRule(initState.rule)
      setLog(initState.log)
    } else {
      onSnapshot(doc(collection(db, "test2"), roomId), (snapshot) => {
        console.log({ snapshot })
        console.log(snapshot.data())
        const data = snapshot.data()

        setPlayers(data.players)
        setDeck(data.deck)
        setRule(data.rule)
        setLog(data.log)
      })

      fetchInitData({ roomId }).then((data) => {
        setPlayers(data.players)
        setDeck(data.deck)
        setRule(data.rule)
        setLog(data.log)
      })
    }

  }, [])

  useEffect(() => {
    if (rule?.deathMatch) {
      PlayAudio.drumSong()
    }
  }, [rule?.deathMatch])

  useEffect(() => {
    if (rule?.restartMatch && isAdmin) {
      resetInit(roomId, sessionId)
    }
    
    if (rule?.restartMatch) {
      alert("ROOM RESTART")
      delay(() => {
        queryParams.delete("sessionId");
        const newUrl = "?" + queryParams.toString()
        window.location.replace(newUrl)
      }, 2000)
    }
  }, [rule?.restartMatch])

  useEffect(() => {
    if (isMyTurn) {
      PlayAudio.warDrum()

      if (me?.judgementCards.length > rule?.battleZone.length) {
        let msg = me?.judgementCards.map(mapMasterDeck).map(card => card.transName()).join(", ")
        setOtherText(`<h2>จั่วการ์ดตัดสิน ${msg}<h3>`)
        modalTrigger3.current.click()
      }
      else if (me?.state) {
        let msg = ``
        let states = []
        Object.keys(me.state).forEach(function (key) {
          if (me.state[key] && (key === "acedia_state" || key === "ration_state"))
            states = [...states, stateTrans[key].name]
        })

        if (states.length) {
          msg = states.join(", ")
          setOtherText(`<h2>จั่วการ์ดตัดสิน ${msg}<h3>`)
          modalTrigger3.current.click()
        }
      }
    }
  }, [isMyTurn])

  useEffect(() => {
    let lastLog = log[log.length - 1]
    if (!lastLog) return () => { }
    if (lastLog === lastAudioLog) return () => { }

    const findLog = (txt, depth) => {
      return log.slice(depth).find(_log => _log.includes(txt))
    }

    setLastAudioLog(lastLog)

    if (lastLog.includes("ใช้การ์ด") && !lastLog.includes(Player.showRoleName(me))) 
      playSoundByAction(replaceTrans(lastLog))
    
    if (lastLog.includes("จั่วการ์ด") && !lastLog.includes(Player.showRoleName(me))) 
      PlayAudio.drawCard()

    if (lastLog.includes("ได้รับความเสียหาย") && !lastLog.includes(Player.showRoleName(me))) 
      PlayAudio.attack()
    
    if (lastLog.includes("ได้รับการฟื้นฟูพลังชีวิต") && !lastLog.includes(Player.showRoleName(me))) 
      PlayAudio.heal()
    
    if (findLog("ตายอย่างเวทนา", -2) && !findLog(Player.showRoleName(me), -2)) {
      PlayAudio.dead()
    }
    else if ((findLog("ตายอย่างเวทนา", -3) && findLog("ได้รับชัยชนะ", -3)) && !findLog(Player.showRoleName(me), -2)) {
      PlayAudio.dead()
    }

    if (!me) return () => {}
    if (lastLog.includes("กบฏได้รับชัยชนะ")) {
      const msg = "กบฏได้รับชัยชนะ"
      if (me.team === "rebellion")
        showVictory(msg)
      else
        showGameOver(msg)
    }
    else if (lastLog.includes("จักรพรรดิและผู้ภัคดีได้รับชัยชนะ")) {
      const msg = "จักรพรรดิและผู้ภัคดีได้รับชัยชนะ"
      if (me.team === "emperor" || me.team === "protector")
        showVictory(msg)
      else
        showGameOver(msg)
    }
    else if (lastLog.includes("คนทรยศได้รับชัยชนะ")) {
      const msg = "คนทรยศได้รับชัยชนะ"
      if (me.team === "traitor")
        showVictory(msg)
      else
        showGameOver(msg)
    }
  }, [log])

  const logDeathMatch = (state) => {
    state.rule.deathMatch = true
    setRule(state.rule)
    addLog(state, `<span class='red bold'> DEATH MATCH !!! [การ์ด "เสบียง" ไม่สามารใช้ฟื้นฟูพลังชีวิตได้อีกต่อไป แต่สามารถใช้แทนการ์ด "โจมตี" หรือ การ์ด "หลบหลึก"ได้. <br />การ์ด "สุรา" ไม่สามารถใช้ฟื้นฟูพลังชีวิตได้]</span`)
  }

  const showVictory = () => {
    PlayAudio.victory()
    let msg = `<span class="green">VICTORY</span>`
    setEndgameText(msg)
    modalTrigger5.current.click()
  }

  const showGameOver = () => {
    PlayAudio.gameOver()
    let msg = `<span class="red">DEFEAT</span>`
    setEndgameText(msg)
    modalTrigger5.current.click()
  }

  const showViewCard = (card) => {
    viewCard(card)
    setDetailText(null)
    return modalTrigger2.current.click()
  }

  const cardClicked = (card) => {
    // Unselect Card
    if (selectedCard?.id === card.id) {
      return resetSelector()
    }

    selectCard(card)

    PlayAudio.click()
    modalTrigger.current.click()
  }

  const cancelActionClicked = () => {
    resetSelector()
    PlayAudio.click()

    modalClose.current.click()
  }

  const addLog = (state, msg) => {
    let actor = me ? `<span class="bold">${Player.showRoleName(me)}</span>:` : ""
    let card1 = (selectedCard && selectedCard?.showFullName()) || ""

    let equipMsg = (selectedCard?.type === "equipment") ? "ติดตั้งอุปกรณ์" : ""

    if (msg) {
      state.log = [...state.log, `${actor} ${msg}`]
      setLog(state.log)
      return state.log
    }
    state.log = [...state.log, `${actor} ${equipMsg} ใช้การ์ด ${card1}`]
    setLog(state.log)
  }

  const addCardToTrash = (card, state) => {
    state.rule = { ...state.rule, trashDeck: [...state.rule.trashDeck, card.id] }
    setRule(state.rule)
  }

  const addCardToFieldZone = (card, player, state) => {
    state.players = state.players.map(_player => {
      if (_player.sessionId === player.sessionId) {
        _player.fieldCards = [..._player.fieldCards, card.id]
      }
      return _player
    })
    setPlayers(state.players)
  }

  const addCardToJudgementZone = (card, player, state) => {
    state.players = state.players.map(_player => {
      if (_player.sessionId === player.sessionId) {
        _player.judgementCards = [..._player.judgementCards, card.id]
      }
      return _player
    })
    setPlayers(state.players)
  }

  const drawCard = (number, player, state) => {
    if (state.deck.length < number) return false;
    let drawnCards = []

    if (player.warlord?.name === "xu_you") {
      drawnCards = state.deck.slice(-number);
      state.deck = state.deck.slice(0, state.deck.length - number)
    }
    else {
      drawnCards = state.deck.slice(0, number);
      state.deck = state.deck.slice(number)
    }

    setDeck(state.deck)
    const cards = [...player.cards, ...drawnCards]
    setPlayerCards(cards, player, state)
    return drawnCards
  }

  const addCardToPlayer = (card, player, state) => {
    state.players = state.players.map(_player => {
      if (_player.sessionId === player.sessionId) {
        _player.cards = [..._player.cards, card.id]
      }
      return _player
    })
    setPlayers(state.players)
  }

  const playerEquipItem = (player, card, state) => {
    state.players = state.players.map(_player => {
      if (_player.sessionId === player.sessionId) {
        // Remove Duplicate Type Item
        _player.fieldCards = _player.fieldCards.map(mapMasterDeck).filter((_card) => {
          if (
            (_card.subtype === "weapon" && card.subtype === "weapon") ||
            (_card.subtype === "armor" && card.subtype === "armor") ||
            (_card.action === "horse_atk" && card.action === "horse_atk") ||
            (_card.action === "horse_def" && card.action === "horse_def")
          ) {
            addCardToTrash(_card, state)
            return false
          }

          return true
        }).map(_card => _card.id)

        _player.fieldCards = [..._player.fieldCards, card.id]
      }
      return _player
    })
    setPlayers(state.players)
  }

  const playerTakeDamage = (player, state) => {
    state.players = state.players.map(_player => {
      if (_player.sessionId === player.sessionId) {
        _player.hp = _player.hp - 1
      }
      return _player
    })
    setPlayers(state.players)
  }

  const playerTakeHeal = (player, state) => {
    state.players = state.players.map(_player => {
      if (_player.sessionId === player.sessionId) {
        if (_player.hp < _player.maxHp)
          _player.hp = _player.hp + 1
      }
      return _player
    })
    setPlayers(state.players)
  }

  const setPlayerCards = (cards, player, state) => {
    state.players = state.players.map(_player => {
      if (_player.sessionId === player.sessionId) {
        _player.cards = cards
      }
      return _player
    })
    setPlayers(state.players)
  }

  const endTurn = (state) => {
    const alivePlayer = state.players.filter(_player => _player.hp > 0)
    let nextPlayer;

    alivePlayer.map((player, i) => {
      if (player.sessionId === me.sessionId) {
        nextPlayer = alivePlayer[i + 1] || alivePlayer[0]
        const nextSessionId = nextPlayer?.sessionId
        state.rule = { ...state.rule, playerPhaseSessionId: nextSessionId }
        setRule(state.rule)
      }
    })

    return nextPlayer
  }

  // ==========================================

  const resetSelector = () => {
    selectCard(null)
    modalClose.current.click()
    modalClose2.current.click()
    return false
  }

  const removeCardFromBattleZone = (card, state) => {
    state.rule.battleZone = state.rule.battleZone.filter(cardId => cardId !== card.id)
    setRule(state.rule)
  }

  const removeCardFromPlayers = (card, state) => {
    state.players = state.players.map(_player => {
      const filterCardOut = (cardId) => cardId !== card.id
      _player.cards = _player.cards.filter(filterCardOut)
      _player.fieldCards = _player.fieldCards.filter(filterCardOut)
      _player.judgementCards = _player.judgementCards.filter(filterCardOut)

      return _player
    })
    setPlayers(state.players)
  }

  const removeCardFromHand = (card, player, state) => {
    const cards = player.cards.filter((cardId) =>
      cardId !== card.id
    )
    setPlayerCards(cards, player, state)
  }

  const playSoundByAction = (action) => {
    if (action.includes("peach")) PlayAudio.heal()
    else if (action.includes("dodge")) PlayAudio.reflect()
    else if (action.includes("barbarian")) PlayAudio.warCry()
    else if (action.includes("raining_arrows")) PlayAudio.bow()
    else if (action.includes("steal")) PlayAudio.sheep()
    else if (action.includes("attack_by_fire")) PlayAudio.move4()
    else if (action.includes("attack")) PlayAudio.attack()
    else if (action.includes("negation")) PlayAudio.skillSuccess()
    else if (action.includes("lightning")) PlayAudio.thunder()
    else if (action.includes("burn_bridge")) PlayAudio.broken()
    else if (action.includes("harvest")) PlayAudio.harvest()
    else if (action.includes("brotherhood")) PlayAudio.cheer()
    else if (action.includes("greed")) PlayAudio.greed()
    else if (action.includes("acedia")) PlayAudio.fire()
    else if (action.includes("borrowed_sword")) PlayAudio.sword()
    else if (action.includes("horse_atk")) PlayAudio.equipHorse()
    else if (action.includes("horse_def")) PlayAudio.equipHorse()
    else if (action.includes("equip_item")) PlayAudio.equipItem()
    else if (action.includes("weapon")) PlayAudio.equipItem()
    else if (action.includes("wine")) PlayAudio.drinking()
    else if (action.includes("rest")) PlayAudio.marchDrum()
    else if (action.includes("ration")) PlayAudio.ice2()
    else if (action.includes("duel")) PlayAudio.duel()
    else if (action.includes("chain")) PlayAudio.chain()
    else if (action.includes("carrier")) PlayAudio.cow()
    else if (action.includes("alliance")) PlayAudio.fanfare()
    else if (action.includes("know_enemy")) PlayAudio.shock()
    else if (action.includes("trick_state")) PlayAudio.confuse()
  }

  const confirmActionClicked = () => {
    const state = {
      log: log,
      rule: rule,
      players: players
    }

    if (selectedCard.type === "equipment") {
      playerEquipItem(me, selectedCard, state)
      if (selectedCard.subtype === "weapon" || selectedCard.subtype === "armor")
        PlayAudio.equipItem()
      else
        playSoundByAction(selectedCard.action)
    } else {
      playSoundByAction(selectedCard.action)
      state.rule.battleZone = [...state.rule.battleZone, selectedCard.id]
      setRule(state.rule)
    }

    removeCardFromHand(selectedCard, me, state)
    resetSelector()

    addLog(state)
    delay(() => updateData(state, mainState, { roomId }))
  }

  const putEquipmentClicked = () => {
    const state = {
      log: log,
      rule: rule,
      players: players
    }

    playSoundByAction(selectedCard.action)
    state.rule.battleZone = [...state.rule.battleZone, selectedCard.id]
    setRule(state.rule)

    removeCardFromHand(selectedCard, me, state)
    resetSelector()

    addLog(state)
    delay(() => updateData(state, mainState, { roomId }))
  }

  const endTurnClicked = () => {
    const state = {
      log: log,
      players: players,
      rule: rule
    }

    state.rule.trashDeck = [...state.rule.trashDeck, ...state.rule.battleZone]
    state.rule.battleZone = []
    setRule(state.rule)

    const nextPlayer = endTurn(state)

    state.players.map(_player => {
      if (_player.sessionId === me.sessionId) {
        if (_player.judgementCards.length) {
          const acediaCard = searchCardAction(_player.judgementCards, "acedia")
          const lightningCard = searchCardAction(_player.judgementCards, "lightning")
          const rationCard = searchCardAction(_player.judgementCards, "ration")
          const nextPlayer = state.players.find(_player => _player.sessionId === state.rule.playerPhaseSessionId)

          if (acediaCard) {
            removeCardFromPlayers(acediaCard, state)
            addCardToTrash(acediaCard, state)
          }

          if (lightningCard) {
            removeCardFromPlayers(lightningCard, state)
            addCardToJudgementZone(lightningCard, nextPlayer, state)
          }

          if (acediaCard) {
            removeCardFromPlayers(acediaCard, state)
            addCardToTrash(acediaCard, state)
          }

          if (rationCard) {
            removeCardFromPlayers(rationCard, state)
            addCardToTrash(rationCard, state)
          }
        }
        _player.state.acedia_state = false
        _player.state.ration_state = false
      }
    })

    setPlayers(state.players)

    resetSelector()
    setXuYouCards([])
    PlayAudio.click()

    let maxHandCard = me.hp
    if (me.state.card_down_state) 
      maxHandCard--
    
    if (me.cards.length > maxHandCard) {
      setOtherText(`<h2>จำนวนการ์ดบนมือ (${me.cards.length}) มากกว่าพลังชีวิตปัจจุบัน (${maxHandCard})<h3>`)
      modalTrigger3.current.click()
    }

    addLog(state, "จบเทิร์น")
    addLog(state, `เทิร์นของ ${Player.showRoleName(nextPlayer)}`)
    delay(() => updateData(state, mainState, { roomId }))
  }

  const drawClicked = (number = 1, player) => {
    const state = {
      log: log,
      deck: deck,
      players: players,
      rule: rule
    }

    const drawCardIds = drawCard(number, player, state)
    if (!drawCardIds)
      return PlayAudio.open()

    PlayAudio.drawCard()

    // save log draw card
    state.players = state.players.map(_player => {
      if (_player.sessionId === player.sessionId) {
        _player.logDrawCardIds = [..._player.logDrawCardIds, ...drawCardIds]
      }
      return _player
    })
    setPlayers(state.players)

    addLog(state, "จั่วการ์ด")
    delay(() => updateData(state, mainState, { roomId }))
  }

  const drawJudgementClicked = (player) => {
    const state = {
      log: log,
      rule: rule,
      deck: deck
    }

    if (state.deck.length < 1) return false;

    const drawnCards = state.deck.slice(0, 1);
    const cardId = drawnCards[0]
    state.deck = state.deck.slice(1)
    setDeck(state.deck)

    state.rule.battleZone = [...state.rule.battleZone, cardId]
    setRule(state.rule)
    PlayAudio.drawCard()

    addLog(state, "<span class='orange'>จั่วการ์ดตัดสิน</span> " + mapMasterDeck(cardId).showFullName())
    delay(() => updateData(state, mainState, { roomId }))
  }

  const takeHealClicked = () => {
    const state = {
      log: log,
      rule: rule,
      players: players
    }

    playerTakeHeal(me, state)
    PlayAudio.heal()

    addLog(state, "ได้รับการฟื้นฟูพลังชีวิต")
    delay(() => updateData(state, mainState, { roomId }))
  }

  const takeDamageClicked = () => {
    const state = {
      log: log,
      rule: rule,
      players: players
    }

    playerTakeDamage(me, state)
    PlayAudio.attack()

    addLog(state, "ได้รับความเสียหาย")
    delay(() => updateData(state, mainState, { roomId }))
  }

  const addToTrashClicked = (card) => {
    const state = {
      log: log,
      rule: rule,
      players: players
    }

    removeCardFromPlayers(card, state)
    removeCardFromBattleZone(card, state)
    addCardToTrash(card, state)

    resetSelector()
    PlayAudio.click()

    addLog(state, "ทิ้งการ์ด " + card.showFullName())
    delay(() => updateData(state, mainState, { roomId }))
  }

  const pickCardClicked = (card) => {
    const state = {
      log: log,
      rule: rule,
      players: players
    }

    let _log = ""
    const targetedPlayer = state.players.find(_player => {
      const a = _player.cards.find(cardId => cardId === card.id)
      const b = _player.fieldCards.find(cardId => cardId === card.id)
      console.log({ a, b })
      return a || b
    })
    if (targetedPlayer)
      _log = `เลือกเป้าหมาย ${Player.showRoleName(targetedPlayer)} หยิบการ์ด`
    else
      _log = "หยิบการ์ด " + card.showFullName()

    removeCardFromPlayers(card, state)
    removeCardFromBattleZone(card, state)
    addCardToPlayer(card, me, state)

    // Shuffle cards on hand harvest/steal card is played
    const needToShuffleHandCards = state.rule.battleZone.map(mapMasterDeck).find(card => card.action === "harvest" || card.action === "steal")
    if (needToShuffleHandCards) {
      state.players = state.players.map(_player => {
        if (_player.sessionId === me.sessionId) {
          _player.cards = _player.cards.sort(() => Math.random() - 0.5)
        }
        return _player
      })
      setPlayers(state.players)
    }

    resetSelector()
    PlayAudio.click()

    addLog(state, _log)
    delay(() => updateData(state, mainState, { roomId }))
  }

  const harvestActionClicked = (card) => {
    const state = {
      log: log,
      rule: rule,
      deck: deck
    }

    const number = players.filter(_player => _player.hp > 0).length

    if (state.deck.length < number) return false;

    const drawnCards = state.deck.slice(0, number);
    state.deck = state.deck.slice(number)
    setDeck(state.deck)

    state.rule.battleZone = [...state.rule.battleZone, ...drawnCards]
    setRule(state.rule)

    resetSelector()
    PlayAudio.click()

    addLog(state)
    delay(() => updateData(state, mainState, { roomId }))
  }

  const judgementActionClicked = (card, player) => {
    const state = {
      log: log,
      rule: rule,
      players: players
    }

    removeCardFromPlayers(card, state)
    removeCardFromBattleZone(card, state)

    if (card.action === "know_enemy") 
      alert(`${Player.showRoleName(player)} ${Player.showTeam(player)}`)
    else 
      addCardToJudgementZone(card, player, state)
    

    resetSelector()
    PlayAudio.click()

    addLog(state, `ใช้การ์ด ${card.showFullName()} ใส่เป้าหมาย ${Player.showRoleName(player)}`)
    delay(() => updateData(state, mainState, { roomId }))
  }

  const woodenOxActionClicked = (card, player) => {
    const state = {
      log: log,
      rule: rule,
      players: players
    }

    removeCardFromPlayers(card, state)
    removeCardFromBattleZone(card, state)
    addCardToFieldZone(card, player, state)

    resetSelector()
    PlayAudio.click()

    addLog(state, `ใช้การ์ด ${card.showFullName()} ใส่เป้าหมาย ${Player.showRoleName(player)}`)
    delay(() => updateData(state, mainState, { roomId }))
  }

  const giveCardClicked = (card, player) => {
    const state = {
      log: log,
      players: players
    }

    removeCardFromPlayers(card, state)
    addCardToPlayer(card, player, state)

    resetSelector()
    PlayAudio.click()

    addLog(state, "มอบการ์ดให้ " + Player.showRoleName(player))
    delay(() => updateData(state, mainState, { roomId }))
  }

  const deadClicked = () => {
    const state = {
      log: log,
      players: players,
      rule: rule
    }

    state.players = state.players.map(_player => {
      if (_player.sessionId === me.sessionId) {
        _player.hp = _player.hp + 1
      }
      return _player
    })

    if (isMyTurn)
      endTurn(state)

    state.players = state.players.map(_player => {
      if (_player.sessionId === me.sessionId) {
        const toTrashCards = [..._player.cards, ..._player.fieldCards, ..._player.judgementCards]
        state.rule = { ...state.rule, trashDeck: [...state.rule.trashDeck, ...toTrashCards] }
        setRule(state.rule)

        _player.cards = []
        _player.fieldCards = []
        _player.judgementCards = []
        _player.hp = 0
      }
      return _player
    })
    setPlayers(state.players)

    resetSelector()
    PlayAudio.click()

    addLog(state, `<span class='red'>ตายอย่างเวทนา</span>`)

    const isPlayerRoleAlive = (role) => {
      return state.players.find(_player => _player.team === role && _player.hp > 0)
    }

    const deathMatchCheck = () => {
      const alivePlayers = state.players.filter(_player => _player.hp > 0)

      if (alivePlayers.length === 3) {
        if (isPlayerRoleAlive("traitor") && isPlayerRoleAlive("rebellion") && isPlayerRoleAlive("emperor")) {
          logDeathMatch(state)
        }
      } else if (alivePlayers.length === 2) {
        if (
          (isPlayerRoleAlive("traitor") && isPlayerRoleAlive("emperor")) ||
          (isPlayerRoleAlive("traitor") && isPlayerRoleAlive("protector")) ||
          (isPlayerRoleAlive("rebellion") && isPlayerRoleAlive("emperor"))
        ) {
          logDeathMatch(state)
        }
      }
    }

    if (me.team === "protector") {
      addLog(state, `คือ <span class='orange'>${Player.showTeam(me)}</span> !! [หากจักรพรรดิสังหารผู้ภัคดี เขาจะเสียการ์ดของตัวเองทั้งหมด]`)

      if (!isPlayerRoleAlive("emperor") && !isPlayerRoleAlive("rebellion") && isPlayerRoleAlive("traitor")) {
        addLog(state, `<span class='green bold'>ทุกคนโดนหักหลัง คนทรยศได้รับชัยชนะ </span> !!`)
      }
    }

    if (me.team === "traitor") {
      addLog(state, `คือ <span class='blue'>${Player.showTeam(me)}</span> !!`)

      if (!isPlayerRoleAlive("rebellion") && !isPlayerRoleAlive("traitor")) {
        addLog(state, `<span class='green bold'>กบฏและคนทรยศถูกประหารหมดจนสิ้น จักรพรรดิและผู้ภัคดีได้รับชัยชนะ </span> !!`)
      }
    }

    if (me.team === "rebellion") {
      addLog(state, `คือ <span class='green'>${Player.showTeam(me)}</span> !! [ผู้สังหารกบฏ จะได้จั่วการ์ด 3 ใบ]`)

      if (!isPlayerRoleAlive("rebellion") && !isPlayerRoleAlive("traitor")) {
        addLog(state, `<span class='green bold'>กบฏและคนทรยศถูกประหารจนหมดสิ้น จักรพรรดิและผู้ภัคดีได้รับชัยชนะ </span> !!`)
      }
    }

    if (me.team === "emperor") {
      addLog(state, `<span class='red'>จักรพรรดิถูกสังหาร</span> !!`)

      if (isPlayerRoleAlive("rebellion")) {
        addLog(state, `<span class='green bold'>จักรพรรดิถูกโค่น กบฏได้รับชัยชนะ </span> !!`)
      }
      else if (isPlayerRoleAlive("traitor") && !isPlayerRoleAlive("protector")) {
        addLog(state, `<span class='green bold'>ทุกคนโดนหักหลัง คนทรยศได้รับชัยชนะ </span> !!`)
      }
    }

    deathMatchCheck()

    PlayAudio.dead()
    delay(() => updateData(state, mainState, { roomId }))
  }

  const shuffleDeckClicked = () => {
    const state = {
      log: log,
      deck: deck,
      rule: rule
    }

    const newDeck = [...state.deck, ...state.rule.trashDeck].sort(() => Math.random() - 0.5)
    state.rule.trashDeck = []
    state.deck = newDeck
    setRule(state.rule)
    setDeck(state.deck)
    logDeathMatch(state)

    resetSelector()
    PlayAudio.click()

    addLog(state, "สลับกองไพ่")
    delay(() => updateData(state, mainState, { roomId }))
  }

  const pickFromTrashClicked = () => {
    const state = {
      log: log,
      rule: rule
    }

    const lastTrashCardId = state.rule.trashDeck.slice(-1)[0]
    if (!lastTrashCardId) return false

    state.rule.trashDeck.splice(-1)
    state.rule.battleZone = [...state.rule.battleZone, lastTrashCardId]
    setRule(state.rule)
    PlayAudio.click()

    addLog(state, "หยิบการ์ดจากกองทิ้ง")
    delay(() => updateData(state, mainState, { roomId }))
  }

  const avatarClicked = (player) => {
    setOtherText(`
      <img class="warlord-img" src="img/hero_${player.warlord.name}.png" /> 
      <div class="warlord-title">${Warlord.showName(player.warlord)}</div> 
      <div class="warlord-kingdom">(${Warlord.showKingdom(player.warlord)})</div> 
      <div class="warlord-desc">${Warlord.showDesc(player.warlord)}</div>
    `)
    modalTrigger3.current.click()
  }

  const pickWarlordClicked = (warlord) => {
    const state = {
      log: log,
      players: players
    }

    state.players = state.players.map(_player => {
      if (_player.sessionId === me.sessionId) {
        _player.warlord = warlord

        if (isJoJu) return _player

        _player.hp = warlord.maxHp
        _player.maxHp = _player.hp

        if (warlord.name === "zuo_ci")
          _player.state.zuo_ci_state = true

        if (_player.team === "emperor" && !warlord.name.includes("god")) {
          _player.hp = _player.hp + 1
          _player.maxHp = _player.hp
        }
      }
      return _player
    })
    setPlayers(state.players)

    resetSelector()
    PlayAudio.warDrum()
    modalClose4.current.click()

    addLog(state, `เลือกขุนพล ${Warlord.showName(warlord)}`)
    delay(() => updateData(state, mainState, { roomId }))
  }

  const sitDownClicked = (player, sitZone) => {
    const state = {
      log: log,
      players: players
    }

    if (isPlayerSitAt(sitZone))
      return false

    state.players = state.players.map(_player => {
      if (_player.sessionId === player.sessionId) {
        _player.sitZone = sitZone
      }
      return _player
    })
    state.players = state.players.sort((a, b) => a.sitZone - b.sitZone)

    setPlayers(state.players)
    PlayAudio.open()

    delay(() => updateData(state, mainState, { roomId }))
  }

  const onYourNameInputChange = (e) => {
    setYourname(e.target.value)
  }

  const joinGameClicked = (e) => {
    const state = {
      rule: rule,
      log: log,
      players: players
    }

    const freeSitZones = [...Array(9).keys()].slice(1).filter((sitZone) => {
      return !state.players.some(_player => _player.sitZone === sitZone)
    })
    let newPlayer = new Player(yourName, randomIdOnlynumber(6), {}, "", 5, freeSitZones[0])
    newPlayer = JSON.parse(JSON.stringify(newPlayer))
    state.players = [...state.players, newPlayer]
    state.players = randomTeam(state.players)
    setPlayers(state.players)

    queryParams.set("sessionId", newPlayer.sessionId)
    const newUrl = "?" + queryParams.toString()
    window.history.replaceState({ path: newUrl }, '', newUrl)

    let emporerSessionId = state.players.find(_player => _player.team === "emperor")?.sessionId
    if (!emporerSessionId) emporerSessionId = null

    state.rule = { ...state.rule, playerPhaseSessionId: emporerSessionId, counter: state.rule.counter + 2 }
    setRule(state.rule)

    const randomWarlords = randomWarlord(initWarlords)
    const pickedWarlords = rule.ramdomToPickWarlords.flatMap(_ramdomToPickWarlord => _ramdomToPickWarlord.warlords)
    const notPickedWarlords = randomWarlords.filter(_initWarlord => !pickedWarlords.map(_pickedWarlord => _pickedWarlord.name).includes(_initWarlord.name))

    state.players.map((player, i) => {
      if (player.sessionId === newPlayer.sessionId) {
        const warlords = notPickedWarlords.slice(0, randomWarlordPool)

        const _warlordForPick = {
          sessionId: newPlayer.sessionId,
          warlords
        }
        state.rule.ramdomToPickWarlords = state.rule.ramdomToPickWarlords.concat(_warlordForPick)
      }
    })
    setRule(state.rule)
    PlayAudio.open()

    addLog(state, `${Player.showFullname(newPlayer)} ผู้เล่นเข้าร่วมเกมส์`)
    delay(() => updateData(state, mainState, { roomId }))
  }

  const playerStateToggleClicked = (player, stateName) => {
    const state = {
      log: log,
      players: players
    }

    let stateChange;

    state.players = state.players.map((_player, i) => {
      if (_player.sessionId === player.sessionId) {
        _player.state[stateName] = !_player.state[stateName]
        stateChange = _player.state[stateName]
      }
      return _player
    })

    stateChange = stateChange ? "+" : "-"
    PlayAudio.click()

    addLog(state, stateChange + " สถานะ " + stateTrans[stateName].name)
    delay(() => updateData(state, mainState, { roomId }))
  }

  const playerStateChangeClicked = (player, stateName, operator) => {
    const state = {
      log: log,
      players: players
    }

    state.players = state.players.map((_player, i) => {
      if (_player.sessionId === player.sessionId) {
        if (operator === "+")
          _player.state[stateName]++
        if (operator === "-" && _player.state[stateName] > 0)
          _player.state[stateName]--
      }
      return _player
    })

    PlayAudio.click()

    addLog(state, operator + " สถานะ " + stateTrans[stateName].name)
    delay(() => updateData(state, mainState, { roomId }))
  }

  const randomTeamClicked = () => {
    const state = {
      log: log,
      rule: rule,
      players: players
    }

    state.players = randomTeam(state.players)
    setPlayers(state.players)

    let emporerSessionId = state.players.find(_player => _player.team === "emperor")?.sessionId
    if (!emporerSessionId) emporerSessionId = null

    state.rule = { ...state.rule, playerPhaseSessionId: emporerSessionId }
    setRule(state.rule)

    addLog(state, "สุ่มทีม")
    delay(() => updateData(state, mainState, { roomId }))
  }

  const taoyinCardClicked = (card) => {
    const state = {
      log: log
    }

    setTaoyinCard(card)
    PlayAudio.confuse()

    addLog(state, `<span class="purple">ใช้ทักษะ "สะกดจิต" หมอบการ์ด 1 ใบ</span>`)
    delay(() => updateData(state, mainState, { roomId }))
  }

  const taoyinCardReveal = () => {
    const state = {
      log: log,
      rule: rule,
      players: players
    }

    removeCardFromHand(taoyinCard, me, state)
    state.rule.battleZone = [...state.rule.battleZone, taoyinCard.id]
    setRule(state.rule)

    setTaoyinCard(null)
    PlayAudio.confuse()

    addLog(state, `<span class="pink">เผยการ์ดสะกดจิต "${taoyinCard.transName()}"</span>`)
    delay(() => updateData(state, mainState, { roomId }))
  }

  const pointCardClicked = (card) => {
    const state = {
      log: log
    }

    setPointCard(card)
    PlayAudio.drawCard()

    addLog(state, `<span class="purple">ใช้ทักษะท้าสู้แต้ม หมอบการ์ด 1 ใบ</span>`)
    delay(() => updateData(state, mainState, { roomId }))
  }

  const pointCardRevealed = () => {
    const state = {
      log: log,
      rule: rule,
      players: players
    }

    removeCardFromHand(pointCard, me, state)
    state.rule.battleZone = [...state.rule.battleZone, pointCard.id]
    setRule(state.rule)

    setPointCard(null)
    PlayAudio.drawCard()

    addLog(state, `<span class="pink">เผยการ์ดท้าสู้แต้ม</span> ${pointCard.showFullName()}`)
    delay(() => updateData(state, mainState, { roomId }))
  }

  const disguiseRandomClicked = () => {
    const state = {
      log: log,
      rule: rule,
      players: players
    }

    let warlords = randomWarlord(initWarlords)
    state.players.map(player => player.warlord).map(playerWarlord => {
      warlords = warlords.filter(_warlord => _warlord.name !== playerWarlord.name)
    })

    state.rule.ramdomToPickWarlords = state.rule.ramdomToPickWarlords.map(ramdomToPickWarlord => {
      if (ramdomToPickWarlord.sessionId === me.sessionId) {
        ramdomToPickWarlord.warlords = sortRandom(ramdomToPickWarlord.warlords)
        ramdomToPickWarlord.warlords[0] = warlords[0]
      }
      return ramdomToPickWarlord
    })
    setRule(state.rule)

    setTaoyinCard(null)
    PlayAudio.confuse()

    addLog(state, `<span class="pink">ใช้ทักษะ "สุ่มร่างปลอม"</span>`)
    delay(() => updateData(state, mainState, { roomId }))
  }

  const peekTop2CardClicked = () => {
    const state = { log: log }
    if (deck.length < 2) return false;

    const drawnCards = deck.slice(0, 2)
    setXuYouCards(drawnCards.map(mapMasterDeck))

    PlayAudio.confuse()

    addLog(state, `<span class="pink">ใช้ทักษะ "ความสามารถล้วนๆ"</span>`)
    delay(() => updateData(state, mainState, { roomId }))
  }

  const xuYouCardReveal = (card) => {
    const state = {
      log: log,
      rule: rule,
      deck: deck
    }

    state.deck = state.deck.filter(cardId => cardId !== card.id)
    setDeck(state.deck)
    state.rule.battleZone = [...state.rule.battleZone, card.id]
    setRule(state.rule)

    setXuYouCards([])
    PlayAudio.confuse()

    addLog(state, `<span class="pink">เผยการ์ดจากทักษะ "ความสามารถล้วนๆ"</span>`)
    delay(() => updateData(state, mainState, { roomId }))
  }


  const luZhiMasterClick = (player) => {
    const state = {
      log: log
    }

    setLuZhiMaster(player)
    PlayAudio.confuse()

    addLog(state, `<span class="pink">ใช้ทักษะ "ภัคดีตลอดไป"</span>`)
    delay(() => updateData(state, mainState, { roomId }))
  }

  const luZhiMasterReveal = () => {
    const state = {
      log: log
    }

    PlayAudio.confuse()

    addLog(state, `<span class="pink">เผยความจริงว่า ภัคดีต่อ ${Player.showRoleName(luZhiMaster)} "</span>`)
    delay(() => updateData(state, mainState, { roomId }))
  }

  console.log("INIT", {
    sessionId,
    me,
    test,
    deck,
    players,
    rule,
    log,
  })

  const renderPlayerComponent = (zone) => {
    return <PlayerComponent
      lastLog={lastLog} rule={rule} players={players} zone={zone} me={me} selectedCard={selectedCard}
      showViewCard={showViewCard} avatarClicked={avatarClicked}
    />
  }

  const renderGeneral = () => {
    return isWarlordPicked ? <img class="img" src={`img/hero_${me.warlord?.name}.png`} alt={me.warlord?.name} onClick={() => avatarClicked(me)} /> : <img class="img" src="img/card_back_of_general.png" alt="" />
  }

  const renderLog = (msg) => {
    if (!msg) return null
    msg = renderSymbolColor(msg)
    msg = msg.replace("ได้รับการฟื้นฟูพลังชีวิต", "<span class='green'>ได้รับการฟื้นฟูพลังชีวิต</span>")
    msg = msg.replace("ได้รับความเสียหาย", "<span class='red'>ได้รับความเสียหาย</span>")

    return <div dangerouslySetInnerHTML={{ __html: `<div>- ${msg}</div>` }}></div>
  }

  const renderEndgameStats = () => {
    return players.map(player => {
      return (
        <div className="player player-endgame">
          <div className={`player-wrapper`}>
            <div class="avatar">
              <img class="avatar-img" alt={player.warlord.name} src={`img/hero_${player.warlord.name}.png`} />
            </div>
            <div class="player-detail">
              <div class={"player-name"}>{Player.showRoleName(player)}</div>
              <div class={"player-name"}>[{Player.showTeam(player)}]</div>
            </div>
          </div>
          <div>
            {player.logDrawCardIds.map(mapMasterDeck).map(card => <CardComponent isHidden={false} classes="card-block-sm" card={card} />)}
          </div>
        </div>
      )
    })
  }

  return (
    <div className="App">
      <div class="body">

        <button ref={modalTrigger} type="button" class="btn btn-sm btn-primary modalTrigger" data-bs-toggle="modal" data-bs-target="#confirmModal" ></button>
        <button ref={modalTrigger2} type="button" class="btn btn-sm btn-primary modalTrigger" data-bs-toggle="modal" data-bs-target="#detailModal" ></button>
        <button ref={modalTrigger3} type="button" class="btn btn-sm btn-primary modalTrigger" data-bs-toggle="modal" data-bs-target="#otherModal" ></button>
        <button ref={modalTrigger5} type="button" class="btn btn-sm btn-primary modalTrigger" data-bs-toggle="modal" data-bs-target="#endgameModal" ></button>

        {/* ACTION MODAL */}
        <div class="modal" id="confirmModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true" data-bs-backdrop="static">
          <div class="modal-dialog">
            <div class="modal-content">
              <button ref={modalClose} type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              <div class="modal-body">
                {selectedCard && <CardComponent classes="card-block-lg" card={selectedCard} deathMatch={rule.deathMatch} />}
              </div>
              <div class="modal-footer">
                <div>
                  <h5 class="footer-text" id="exampleModalLabel">
                    <div><strong>{selectedCard?.transName()}</strong> </div>
                    <div dangerouslySetInnerHTML={{ __html: selectedCard?.showDesc() }}></div>
                  </h5>
                  <hr />
                  <div class="d-grid gap-2 footer-button">
                    <button onClick={confirmActionClicked} type="button" class="btn btn-primary">{selectedCard?.type === "equipment" ? "สวมใส่" : "ใช้งาน"}</button>
                    {selectedCard?.type === "equipment" && (
                      <button onClick={putEquipmentClicked} type="button" class="btn btn-primary">วางการ์ด</button>
                    )}

                    <div class="btn-group" role="group">
                      <button id="btnGroupDrop1" type="button" class="btn btn-warning dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                        มอบให้ผู้เล่นอื่น
                      </button>
                      <ul class="dropdown-menu" aria-labelledby="btnGroupDrop1">
                        {otherPlayers.map(player => (
                          <li><a class="dropdown-item" href="#" onClick={() => giveCardClicked(selectedCard, player)}>{Player.showRoleName(player)}</a></li>
                        ))}
                      </ul>
                    </div>

                    <div class="btn-group" role="group">
                      <button id="btnDiscard" type="button" class="btn btn-danger dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                        ทิ้งการ์ด
                      </button>
                      <ul class="dropdown-menu" aria-labelledby="btnDiscard">
                        <li><a class="dropdown-item" href="#" onClick={() => addToTrashClicked(selectedCard)}>ยืนยัน</a></li>
                      </ul>
                    </div>

                    <button onClick={cancelActionClicked} type="button" class="btn btn-secondary" data-bs-dismiss="modal">ยกเลิก</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* VIEW MODAL */}
        <div class="modal fade" id="detailModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLabel">รายละเอียด</h5>
                <button ref={modalClose2} type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                {viewedCard && <CardComponent isHidden={!canViewCard} classes="card-block-lg" card={viewedCard} deathMatch={rule.deathMatch} />}
                <div>{detailText}</div>
              </div>

              <div class="modal-footer">
                <div>
                  <h5 class="footer-text" id="exampleModalLabel">
                    {canViewCard && (
                      <Fragment>
                        <div><strong>{viewedCard?.transName()}</strong> </div>
                        <div dangerouslySetInnerHTML={{ __html: viewedCard?.showDesc() }}></div>
                      </Fragment>
                    )}
                  </h5>
                  <div class="d-grid gap-2 footer-button">
                    {canViewCard && viewedCard?.action === "harvest" &&
                      <button onClick={() => harvestActionClicked(viewedCard)} type="button" class="btn btn-primary">เก็บเกี่ยวยุ้งฉาง</button>
                    }
                    {canViewCard && (viewedCard?.canBeplaceOnJudgement() || viewedCard?.action === "carrier") && (
                      <div class="btn-group" role="group">
                        <button id="btnGroupDrop1" type="button" class="btn btn-primary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                          {viewedCard?.transName()}
                        </button>
                        <ul class="dropdown-menu" aria-labelledby="btnGroupDrop1">
                          {players.map(player => (
                            viewedCard?.action === "carrier"
                              ? <li><a class="dropdown-item" href="#" onClick={() => woodenOxActionClicked(viewedCard, player)}>{Player.showRoleName(player)}</a></li>
                              : <li><a class="dropdown-item" href="#" onClick={() => judgementActionClicked(viewedCard, player)}>{Player.showRoleName(player)}</a></li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <button onClick={() => pickCardClicked(viewedCard)} type="button" class="btn btn-warning">หยิบการ์ด</button>
                    <div class="btn-group" role="group">
                      <button id="btnDiscard2" type="button" class="btn btn-danger dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                        ทิ้งการ์ด
                      </button>
                      <ul class="dropdown-menu" aria-labelledby="btnDiscard2">
                        <li><a class="dropdown-item" href="#" onClick={() => addToTrashClicked(viewedCard)}>ยืนยัน</a></li>
                      </ul>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* OTHER MODAL */}
        <div class="modal" id="otherModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
          <div class="modal-dialog">
            <div class="modal-content">
              <button ref={modalClose3} type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              <div class="modal-body">
                <div dangerouslySetInnerHTML={{ __html: otherText }}></div>

                {/* {me && !me.warlord?.name ({})} */}
              </div>
            </div>
          </div>
        </div>

        {/* PICK HERO MODAL */}
        <div class="modal" id="pickHeroModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true" {...(isJoJu ? { "data-bs-backdrop": "static" } : {})}>
          <div class="modal-dialog modal-xl">
            <div class="modal-content">
              <button ref={modalClose4} type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              <div class="modal-body">
                <div className="warlord-pick-wrapper">
                  {warlordForPick.warlords?.map(warlord => (
                    <div>
                      <div className="warlord-pick-inner-wrapper">
                        <div>
                          <img class="warlord-img" src={`img/hero_${warlord.name}.png`} />
                          <div class="warlord-title">{Warlord.showName(warlord)}</div>
                          <div class="warlord-kingdom">({Warlord.showKingdom(warlord)})</div>
                          <div class="warlord-hp">{[...Array(warlord.maxHp).keys()].map(i => <i class="fa fa-heart"></i>)}</div>
                          <div class="warlord-desc" dangerouslySetInnerHTML={{ __html: Warlord.showDesc(warlord) }}></div>
                        </div>
                        <button onClick={() => pickWarlordClicked(warlord)} type="button" class="btn btn-primary btn-lg btn-block pick-warlord-btn">เลือกขุนพล</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ENDGAME MODAL */}
        <div class="modal" id="endgameModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
          <div class="modal-dialog modal-xl">
            <div class="modal-content">
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              <div class="modal-body">
                <div class="endgame-title" dangerouslySetInnerHTML={{ __html: endgameText }} ></div><hr />
                <div>
                  {renderEndgameStats()}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="row row-cols-3">
          <div class="col-2 left-col">
            <div class="log-wrapper">
              {log.slice(Math.max(log.length - 20, 0)).map(renderLog)}
            </div>
            <div>CARD IN DECK: {deck?.length}</div>
            <div>CARD IN TRASH: {rule?.trashDeck?.length}</div>
            <br />
            {isAdmin && (
              <Fragment>
                <DebugTool test={test} rule={rule} setTest={setTest} setRule={setRule} mainState={mainState}
                  drawButtonClicked={drawClicked}
                  players={players} log={log} me={me}
                />
                <div className="d-grid gap-2 dev-tool-wrapper">
                  <button onClick={randomTeamClicked} type="button" class="btn btn-primary btn-md btn-block">RANDOM TEAM</button>
                </div>
              </Fragment>
            )}
          </div>

          <div class="col-8">
            <div class="row row-cols-1">
              <div class="col zone">
                <div className="announcer-block">
                  {!isMyTurn && <h1>เทิร์นของ {phasePlayer?.name} </h1>}
                  {isMyTurn && <h1 className="blink_me_few_sec">เทิร์นของ {phasePlayer?.name} </h1>}
                  <h5>
                    {renderLog(lastLog)}
                  </h5>
                </div>

                <div class="row row-cols-3">
                  <div class="col zone1 test">{renderPlayerComponent(1)}</div>
                  <div class="col zone2 test">{renderPlayerComponent(2)}</div>
                  <div class="col zone3 test">{renderPlayerComponent(3)}</div>
                  <div class="col zone4 test">{renderPlayerComponent(8)}</div>
                  <div class="col zone5 battle-zone test">
                    {rule?.battleZone.map(mapMasterDeck).map(card =>
                      <CardComponent classes="card-block-md blink_me_sec" card={card} selectedCard={selectedCard} onClick={showViewCard} deathMatch={rule.deathMatch} />
                    )}
                  </div>
                  <div class="col zone6 test">{renderPlayerComponent(4)}</div>
                  <div class="col zone7 test">{renderPlayerComponent(7)}</div>
                  <div class="col zone8 test">{renderPlayerComponent(6)}</div>
                  <div class="col zone9 test">{renderPlayerComponent(5)}</div>
                </div>
              </div>
              <div class={classNames("col my-hand", { "my-turn": isMyTurn })}>
                {myCards.map((card) => (
                  <CardComponent card={card} classes="blink_me_sec" selectedCard={selectedCard} onClick={cardClicked} deathMatch={rule.deathMatch} />
                ))}
              </div>
            </div>
          </div>

          <div class="col-2 right-col">
            <div class="card-general">
              {renderGeneral()}
              {me?.warlord && (
                <Fragment>
                  <div class="warlord-title">{Warlord.showName(me?.warlord)}</div>
                  <div class="warlord-kingdom">({Warlord.showKingdom(me?.warlord)})</div>
                  <div class="warlord-desc" dangerouslySetInnerHTML={{ __html: Warlord.showDesc(me?.warlord) }}></div>
                </Fragment>
              )}
              <hr />
            </div>

            <div class="d-grid gap-1 player-action-buttons">

              {/* SIT ZONE PICK */}
              {me && !allPlayersPickedWarlord && !isWarlordPicked && (
                <div class="btn-group" role="group">
                  <button id="btnGroupDrop1" type="button" class="btn btn-success btn-lg dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                    เลือกที่นั่ง
                  </button>
                  <ul class="dropdown-menu" aria-labelledby="btnGroupDrop1">
                    {[...Array(9).keys()].slice(1).map((sitZone) => (
                      <li>
                        <a className={classNames("dropdown-item", { "disabled": isPlayerSitAt(sitZone) })}
                          href="#" onClick={() => sitDownClicked(me, sitZone)}>
                          {sitZone} {isPlayerSitAt(sitZone) && Player.showFullname(isPlayerSitAt(sitZone))}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {notLoggedIn && (
                <Fragment>
                  <input type="text" class="form-control your-name-input blink_me_few_sec" placeholder='YOUR NAME...'
                    value={yourName}
                    onChange={onYourNameInputChange}
                  />
                  <button type="button" class="btn btn-primary btn-md btn-block" onClick={joinGameClicked}>
                    เข้าร่วมเกมส์
                  </button>
                </Fragment>
              )}

              {me && (!isWarlordPicked) && (
                <button ref={modalTrigger4} type="button" class="btn btn-lg btn-primary btn-lg btn-block blink_me" data-bs-toggle="modal" data-bs-target="#pickHeroModal" >
                  เลือกขุนพล
                </button>
              )}
              {isWarlordPicked && (
                <Fragment>
                  {endgameText && (
                    <button data-bs-toggle="modal" data-bs-target="#endgameModal" type="button" class="btn btn-primary btn-lg btn-block blink_me">ตารางคะแนน</button>
                  )}
                  <button onClick={() => drawClicked(1, me)} type="button" class="btn btn-primary btn-lg btn-block">จั่วการ์ด</button>
                  {isMyTurn && <button onClick={endTurnClicked} type="button" class="btn btn-secondary btn-lg btn-block">จบเทิร์น</button>}
                  <hr />

                  {(Warlord.hasSkillButton(me.warlord) || isJoJu) && (
                    <div class="btn-group" role="group">
                      <button id="btnSkill" type="button" class="btn btn-primary btn-md btn-block dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                        ใช้งานทักษะ
                      </button>
                      <ul class="dropdown-menu" aria-labelledby="btnSkill">

                        {me.warlord.name === "tao_yin" && (
                          <Fragment>
                            {!taoyinCard && (me?.cards.map(mapMasterDeck).map(card =>
                              <li><a class="dropdown-item" href="#" onClick={() => taoyinCardClicked(card)}
                                dangerouslySetInnerHTML={{ __html: renderSymbolColor(card.showFullName()) }}></a></li>
                            ))}
                            {taoyinCard &&
                              <li><a class="dropdown-item" href="#" onClick={() => taoyinCardReveal()}> เผยการ์ดสะกิดจิต </a></li>
                            }
                          </Fragment>
                        )}

                        {isJoJu && (
                          <Fragment>
                            <li ref={modalTrigger4} data-bs-toggle="modal" data-bs-target="#pickHeroModal"><a class="dropdown-item" href="#"> แปลงกาย </a></li>
                            <li ref={modalTrigger4} data-bs-toggle="modal" data-bs-target="#pickHeroModal"><a class="dropdown-item" href="#" onClick={disguiseRandomClicked}> สุ่มร่างปลอม </a></li>
                          </Fragment>
                        )}

                        {me.warlord.name === "deng_ai" && (
                          <Fragment>
                            <li><a class="dropdown-item" href="#" onClick={() => playerStateChangeClicked(me, "farm_state", "+")}> เพิ่ม “ไร่นา” </a></li>
                            <li><a class="dropdown-item" href="#" onClick={() => playerStateChangeClicked(me, "farm_state", "-")}> ลด “ไร่นา” </a></li>
                          </Fragment>
                        )}

                        {me.warlord.name === "lubu_god" && (
                          <Fragment>
                            <li><a class="dropdown-item" href="#" onClick={() => playerStateChangeClicked(me, "rage_state", "+")}> เพิ่ม “เกรี้ยวกราด” </a></li>
                            <li><a class="dropdown-item" href="#" onClick={() => playerStateChangeClicked(me, "rage_state", "-")}> ลด “เกรี้ยวกราด” </a></li>
                          </Fragment>
                        )}

                        {me.warlord.name === "guan_yu_god" && (
                          <Fragment>
                            <li><a class="dropdown-item" href="#" onClick={() => playerStateChangeClicked(me, "nightmare_state", "+")}> เพิ่ม “ฝันร้าย” </a></li>
                            <li><a class="dropdown-item" href="#" onClick={() => playerStateChangeClicked(me, "nightmare_state", "-")}> ลด “ฝันร้าย” </a></li>
                          </Fragment>
                        )}

                        {me.warlord.name === "zhou_tai" && (
                          <Fragment>
                            <li><a class="dropdown-item" href="#" onClick={() => playerStateChangeClicked(me, "wound_state", "+")}> เพิ่ม “บาดแผล” </a></li>
                            <li><a class="dropdown-item" href="#" onClick={() => playerStateChangeClicked(me, "wound_state", "-")}> ลด “บาดแผล” </a></li>
                          </Fragment>
                        )}

                        {me.warlord.name === "lu_ji" && (
                          <Fragment>
                            <li><a class="dropdown-item" href="#" onClick={() => playerStateChangeClicked(me, "grateful_state", "+")}> เพิ่ม “กตัญญู” </a></li>
                            <li><a class="dropdown-item" href="#" onClick={() => playerStateChangeClicked(me, "grateful_state", "-")}> ลด “กตัญญู” </a></li>
                          </Fragment>
                        )}

                        {me.warlord.name === "guanqiu_jian" && (
                          <Fragment>
                            <li><a class="dropdown-item" href="#" onClick={() => playerStateChangeClicked(me, "honor_state", "+")}> เพิ่ม “เกียรติยศ” </a></li>
                            <li><a class="dropdown-item" href="#" onClick={() => playerStateChangeClicked(me, "honor_state", "-")}> ลด “เกียรติยศ” </a></li>
                          </Fragment>
                        )}

                        {me.warlord.name === "lu_zhi" && (
                          <Fragment>
                            {!luZhiMaster && (
                              players.map(player => (
                                <li><a class="dropdown-item" href="#" onClick={() => luZhiMasterClick(player)}>รับใช้ {Player.showRoleName(player)}</a></li>
                              ))
                            )}
                            {luZhiMaster && (    
                              <li><a class="dropdown-item" href="#" onClick={luZhiMasterReveal}>เผยความจริง</a></li>
                            )}
                          </Fragment>
                        )}

                        {me.warlord.name === "xu_you" && (
                          <Fragment>
                            {xuYouCards.length === 0 && (
                              <li><a class="dropdown-item" href="#" onClick={() => peekTop2CardClicked()}> ความสามารถล้วนๆ </a></li>
                            )}
                            {xuYouCards.map(card => 
                              <li><a class="dropdown-item" href="#" onClick={() => xuYouCardReveal(card)} 
                                dangerouslySetInnerHTML={{ __html: renderSymbolColor(card.showFullName()) }}></a></li>
                            )}
                          </Fragment>
                        )}

                        {Warlord.hasChallengePointButton(me.warlord) && (
                          <Fragment>
                            {!pointCard && (me?.cards.map(mapMasterDeck).map(card =>
                              <li><a class="dropdown-item" href="#" onClick={() => pointCardClicked(card)} 
                                dangerouslySetInnerHTML={{ __html: renderSymbolColor(card.showFullName()) }}></a></li>
                            ))}
                            {pointCard &&
                              <li><a class="dropdown-item" href="#" onClick={() => pointCardRevealed()}> เผยการ์ดท้าสู้แต้ม </a></li>
                            }
                          </Fragment>
                        )}

                      </ul>
                    </div>
                  )}

                  <button onClick={takeHealClicked} type="button" class="btn btn-success btn-md btn-block">+ พลังชีวิต</button>
                  <button onClick={takeDamageClicked} type="button" class="btn btn-danger btn-md btn-block">- พลังชีวิต</button>
                  <button
                    onClick={() => drawJudgementClicked(1)} type="button"
                    class={classNames("btn btn-warning btn-md btn-block", { "blink_me": isMyTurn && me?.judgementCards.length > rule?.battleZone.length })}
                  >
                    จั่วการ์ดตัดสิน
                  </button>
                </Fragment>
              )}
              {isDying && (
                <button onClick={deadClicked} type="button" class="btn btn-danger blink_me btn-md btn-block">ตาย</button>
              )}
            </div>
            <hr />

            {me && isWarlordPicked && (
              <div className="d-grid gap-1 player-action-buttons">
                <div class="btn-group" role="group">
                  <button id="btnOption" type="button" class="btn btn-secondary btn-md btn-block dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                    สถานะผู้เล่น
                  </button>
                  <ul class="dropdown-menu" aria-labelledby="btnOption">
                    <li><a class="dropdown-item" href="#" onClick={() => playerStateToggleClicked(me, "chain_state")}> +/- กลยุทธ์ลูกโซ่</a></li>
                    <li><a class="dropdown-item" href="#" onClick={() => playerStateToggleClicked(me, "acedia_state")}> +/- มีสุขลืมเมือง</a></li>
                    <li><a class="dropdown-item" href="#" onClick={() => playerStateToggleClicked(me, "ration_state")}> +/- ตัดเสบียง</a></li>
                    <li><a class="dropdown-item" href="#" onClick={() => playerStateToggleClicked(me, "card_down_state")}> +/- อ่อนแรง</a></li>
                    <li><a class="dropdown-item" href="#" onClick={() => playerStateToggleClicked(me, "trick_state")}> +/- สะกดจิต</a></li>
                    <li><a class="dropdown-item" href="#" onClick={() => playerStateToggleClicked(me, "grateful_state")}> +/- กตัญญู</a></li>
                  </ul>
                </div>
                <div class="btn-group" role="group">
                  <button id="btnPickFromTrash" type="button" class="btn btn-secondary btn-md btn-block dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                    หยิบการ์ดจากกองทิ้ง
                  </button>
                  <ul class="dropdown-menu" aria-labelledby="btnPickFromTrash">
                    <li><a class="dropdown-item" href="#" onClick={pickFromTrashClicked}>ยืนยัน</a></li>
                  </ul>
                </div>
                <div class="btn-group" role="group">
                  <button id="btnShuffle" type="button" class="btn btn-secondary btn-md btn-block dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                    สลับกองไพ่
                  </button>
                  <ul class="dropdown-menu" aria-labelledby="btnShuffle">
                    <li><a class="dropdown-item" href="#" onClick={shuffleDeckClicked}>ยืนยัน</a></li>
                  </ul>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
