import classNames from "classnames"
import Player from '../classes/Player'
import { mapMasterDeck, replaceTrans } from '../classes/Card'
import CardComponent from './CardComponent'
import { replaceStateTrans, stateTrans, stateTypes } from "../classes/State"

export default function PlayerComponent({ players, rule, zone, me, selectedCard, showViewCard, avatarClicked, lastLog }) {
  const player = players.find(_player => _player.sitZone === zone)
  const isTheirTurn = player && player?.sessionId === rule?.playerPhaseSessionId

  if (!player)
    return null

  const isMe = player.sessionId === me?.sessionId
  const isDying = player.hp <= 0
  const isDead = player.hp <= 0 && (player?.cards.length === 0 && player.fieldCards.length === 0 && player.judgementCards.length === 0)
  const isMeDead = me && me.hp <= 0 && (me?.cards.length === 0 && me.fieldCards.length === 0 && me.judgementCards.length === 0)
  let _avatar = player.warlord?.name ? <img class="avatar-img" alt={player.warlord.name} src={`img/hero_${player.warlord.name}.png`} /> : <i class="fa fa-user"></i>
  let avatar = isDying ? <img class="avatar-img" src="img/dead_icon.png" /> : _avatar
  
  const teamText = isMe || isDead || player.team === "emperor" ? `[${Player.showTeam(player)}]` : ""

  const hpIconCount = player.hp < 0 ? 0 : player.hp
  const renderHp = [...Array(hpIconCount).keys()].map(i => <i class="fa fa-heart"></i>)

  const maxHpIconCount = player.maxHp - player.hp < 0 ? 0 : player.maxHp - player.hp
  const renderMaxHp = [...Array(maxHpIconCount).keys()].map(i => <i class="fa fa-heart-o"></i>)

  const renderState = () => {
    const renderTooltip = (transName) => `<div class="bold">${stateTrans[transName].name}</div> ${stateTrans[transName].desc}`

    const renderStateToolTip = (stateType) => (
      <div className="tooltip1">
          <span class="tooltiptext" dangerouslySetInnerHTML={{ __html: renderTooltip(stateType.state) }} ></span>
        <i class={stateType.icon}></i>
        {stateType.isNumeric && <span class="state-numeric">{player.state[stateType.state]}</span>}
      </div>
    )

    return stateTypes.map(stateType => 
      (
        player.state[stateType.state] === true || 
        player.state[stateType.state] > 0
      )
      && renderStateToolTip(stateType)
    )
  }

  const bubbleText = () => {
    if (!lastLog) return null
    const backCardElement = `<img class="card-block-sm" src="img/card_back_of_card.png" />`

    if (lastLog.includes(" สถานะ ")) {
      const index = lastLog.indexOf("สถานะ")
      let stateName = lastLog.substr(index + 6).trim()
      stateName = replaceStateTrans(stateName)
      const state = stateTypes.find(type => type.state === stateName)

      if (lastLog.includes("+ สถานะ ")) return `<span class="bubble-text"><i class="${state?.icon}"></i></span>`
      if (lastLog.includes("- สถานะ ")) return `<img class="red-cross" src="img/red-cross.png" alt="red-cross" /><span class="bubble-text"><i class="${state?.icon}"></i></span>`
    }

    if (lastLog.includes("ได้รับการฟื้นฟูพลังชีวิต")) return `<span class="take-heal green">+<i class="fa fa-heart"></i></span>`
    if (lastLog.includes("ได้รับความเสียหาย")) return `<span class="take-damage red">-<i class="fa fa-heart"></i></span>`

    if (lastLog?.includes("จั่วการ์ดตัดสิน")) {
      const index = lastLog.indexOf("จั่วการ์ดตัดสิน")
      let cardNo = lastLog.substr(index + 23, 3).trim()
      cardNo = cardNo.replace("♦", "<span class='red'>♦</span>")
      cardNo = cardNo.replace("♥", "<span class='red'>♥</span>")

      return `<span class="bubble-text-sm">${cardNo}</span>`
    }
    
    if (lastLog.includes("จั่วการ์ด")) return backCardElement

    if (lastLog.includes("ใช้การ์ด")) {
      const transLog = replaceTrans(lastLog)
      const index = transLog.indexOf("ใช้การ์ด")
      let cardName = transLog.substr(index + 12).trim()

      if (lastLog.includes("ใส่เป้าหมาย")) 
        cardName = cardName.substr(0, cardName.indexOf(" ใส่เป้าหมาย"))
      
      if (!cardName) return false
      return `<img class="card-block-sm" src="img/card_${cardName}.png" />`
    }

    if (lastLog.includes("ทิ้งการ์ด") || lastLog?.includes(`เลือกเป้าหมาย ${Player.showRoleName(player)} หยิบการ์ด`)) {
      return `<img class="card-block-sm" src="img/card_back_of_card_lose.png" />`
    } 
    else if (lastLog?.includes("หยิบการ์ดจากกองทิ้ง")) {
      return backCardElement
    }
    else if (lastLog?.includes("หยิบการ์ด")) {
      const transLog = replaceTrans(lastLog)
      const index = transLog.indexOf("หยิบการ์ด")
      const cardName = transLog.substr(index + 13).trim()
      if (!cardName) return backCardElement
      return `<img class="card-block-sm" src="img/card_${cardName}.png" />`
    }

    return false
  } 

  return (
    <div className={classNames(`player arrow ${arrowClasses(zone)[0]}`, { "is-me": isMe })}>
      {lastLog?.includes(Player.showRoleName(player)) && bubbleText() && (
        <div className="bubble right" dangerouslySetInnerHTML={{ __html: bubbleText() }}></div>
      )}
      <div className={classNames(`player-wrapper arrow ${arrowClasses(zone)[1]}`)}>
        <div class="avatar" onClick={() => avatarClicked(player)}>
          {avatar}
        </div>
        <div class="player-detail">
          <div>
            <span class="player-hp">{renderHp}{renderMaxHp}</span> {renderState()} {teamText}
          </div>
          <div class={classNames("player-name", { green: isMe, red: player.warlord?.kingdom === "god" })}>{Player.showRoleName(player)} {isTheirTurn && <img class="fa-cards blink_me" src="img/cards.png" />}</div>
        </div>
      </div>

      <div className="hand-card-zone">
        {player.cards.map(mapMasterDeck).map(card =>
          <CardComponent classes="card-block-sm blink_me_sec" isHidden={player.sessionId !== me?.sessionId && !isMeDead} 
            card={card} selectedCard={selectedCard} onClick={showViewCard} />
        )}
      </div>
      <div className="field-card-zone">
        {[...player.fieldCards, ...player.judgementCards].map(mapMasterDeck).map(card =>
          <CardComponent classes="card-block-sm blink_me_sec" card={card} selectedCard={selectedCard} 
            onClick={showViewCard} deathMatch={rule?.deathMatch} />
        )}
      </div>
    </div>
  )
}

const arrowClasses = (zone) => {
  switch(zone) {
    case 1: return ["arrow-bottom", "arrow-right"]
    case 2: return ["arrow-left", "arrow-right"]
    case 3: return ["arrow-bottom", "arrow-left"]
    case 4: return ["arrow-top", "arrow-bottom"]
    case 5: return ["arrow-top", "arrow-left"]
    case 6: return ["arrow-left", "arrow-right"]
    case 7: return ["arrow-top", "arrow-right"]
    case 8: return ["arrow-top", "arrow-bottom"]
    default: return ""
  }
}

