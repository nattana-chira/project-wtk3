import Player, { randomTeam } from '../classes/Player'
import Warlord, { initWarlords, randomWarlord } from '../classes/Warlord'
import { mapMasterDeck, searchCardAction } from '../classes/Card'
import { stateTrans } from '../classes/State'
import { randomWarlordPool } from '../classes/DataInit'
import { updateData } from '../classes/ApiService'
import { delay, randomIdOnlynumber, sortRandom } from '../classes/Utils'
import PlayAudio from '../classes/Audio'
import playSoundByAction from '../classes/playSoundByAction'

export default function useGameActions(deps) {
  const {
    log, rule, players, deck,
    me, mainState, selectedCard,
    taoyinCard, pointCard, luZhiMaster,
    yourName, isMyTurn, isJoJu,
    roomId, queryParams,
    isPlayerSitAt,
    setLog, setRule, setPlayers, setDeck,
    selectCard, viewCard, setDetailText,
    setOtherText,
    setTaoyinCard, setPointCard, setXuYouCards, setLuZhiMaster,
    setYourname,
    modalTrigger, modalTrigger2, modalTrigger3,
    modalClose, modalClose2, modalClose4,
  } = deps

  const logDeathMatch = (state) => {
    state.rule.deathMatch = true
    setRule(state.rule)
    addLog(state, `<span class='red bold'> DEATH MATCH !!! [การ์ด "เสบียง" ไม่สามารใช้ฟื้นฟูพลังชีวิตได้อีกต่อไป แต่สามารถใช้แทนการ์ด "โจมตี" หรือ การ์ด "หลบหลึก"ได้. <br />การ์ด "สุรา" ไม่สามารถใช้ฟื้นฟูพลังชีวิตได้]</span`)
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

  // Cards that can be drag-targeted to a specific player
  const DRAG_TARGETABLE = ["attack", "duel", "steal", "burn_bridge", "acedia", "brotherhood"]

  const isCardDragTargetable = (card) => card && DRAG_TARGETABLE.includes(card.action)

  const dragAttackHandler = (targetPlayer, card) => {
    const state = {
      log: log,
      rule: rule,
      players: players,
    }

    playSoundByAction(card.action)
    state.rule.battleZone = [...state.rule.battleZone, card.id]
    setRule(state.rule)

    removeCardFromHand(card, me, state)
    resetSelector()

    addLog(state, `ใช้การ์ด ${card.showFullName()} เลือกเป้าหมาย ${Player.showRoleName(targetPlayer)}`)

    const dragAttack = { fromSessionId: me.sessionId, toSessionId: targetPlayer.sessionId }
    delay(() => updateData(state, mainState, { roomId, dragAttack }))
  }

  return {
    showViewCard,
    cardClicked,
    cancelActionClicked,
    confirmActionClicked,
    putEquipmentClicked,
    endTurnClicked,
    drawClicked,
    drawJudgementClicked,
    takeHealClicked,
    takeDamageClicked,
    addToTrashClicked,
    pickCardClicked,
    harvestActionClicked,
    judgementActionClicked,
    woodenOxActionClicked,
    giveCardClicked,
    deadClicked,
    shuffleDeckClicked,
    pickFromTrashClicked,
    avatarClicked,
    pickWarlordClicked,
    sitDownClicked,
    onYourNameInputChange,
    joinGameClicked,
    playerStateToggleClicked,
    playerStateChangeClicked,
    randomTeamClicked,
    taoyinCardClicked,
    taoyinCardReveal,
    pointCardClicked,
    pointCardRevealed,
    disguiseRandomClicked,
    peekTop2CardClicked,
    xuYouCardReveal,
    luZhiMasterClick,
    luZhiMasterReveal,
    dragAttackHandler,
    isCardDragTargetable,
  }
}
