import './App.css'
import Player from './classes/Player'
import { mapMasterDeck, renderSymbolColor } from './classes/Card'
import { useState, useEffect, useRef, Fragment } from "react"
import { resetInit } from './classes/DataInit'
import classNames from "classnames"
import { delay } from './classes/Utils'
import CardComponent from './components/CardComponent'
import DebugTool from './components/DebugTool'
import PlayAudio from './classes/Audio'
import PlayerComponent from './components/PlayerComponent'
import ConfirmCardModal from './components/modals/ConfirmCardModal'
import DetailModal from './components/modals/DetailModal'
import OtherModal from './components/modals/OtherModal'
import PickHeroModal from './components/modals/PickHeroModal'
import EndgameModal from './components/modals/EndgameModal'
import useRoomSync from './hooks/useRoomSync'
import useLogWatcher from './hooks/useLogWatcher'
import useGameActions from './hooks/useGameActions'
import Warlord from './classes/Warlord'
import WarlordTooltip from './components/WarlordTooltip'
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

  useRoomSync({ roomId, setPlayers, setDeck, setRule, setLog })

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

  useLogWatcher({ log, me, setEndgameText, modalTrigger5 })

  const {
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
  } = useGameActions({
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
  })

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
    return isWarlordPicked
      ? <WarlordTooltip warlord={me.warlord} player={me}><img class="img" src={`img/hero_${me.warlord?.name}.png`} alt={me.warlord?.name} onClick={() => avatarClicked(me)} /></WarlordTooltip>
      : <img class="img" src="img/card_back_of_general.png" alt="" />
  }

  const renderLog = (msg) => {
    if (!msg) return null
    msg = renderSymbolColor(msg)
    msg = msg.replace("ได้รับการฟื้นฟูพลังชีวิต", "<span class='green'>ได้รับการฟื้นฟูพลังชีวิต</span>")
    msg = msg.replace("ได้รับความเสียหาย", "<span class='red'>ได้รับความเสียหาย</span>")

    return <div dangerouslySetInnerHTML={{ __html: `<div>- ${msg}</div>` }}></div>
  }

  return (
    <div className="App">
      <div class="body">

        <button ref={modalTrigger} type="button" class="btn btn-sm btn-primary modalTrigger" data-bs-toggle="modal" data-bs-target="#confirmModal" ></button>
        <button ref={modalTrigger2} type="button" class="btn btn-sm btn-primary modalTrigger" data-bs-toggle="modal" data-bs-target="#detailModal" ></button>
        <button ref={modalTrigger3} type="button" class="btn btn-sm btn-primary modalTrigger" data-bs-toggle="modal" data-bs-target="#otherModal" ></button>
        <button ref={modalTrigger5} type="button" class="btn btn-sm btn-primary modalTrigger" data-bs-toggle="modal" data-bs-target="#endgameModal" ></button>

        {/* ACTION MODAL */}
        <ConfirmCardModal
          closeRef={modalClose}
          selectedCard={selectedCard}
          rule={rule}
          otherPlayers={otherPlayers}
          onConfirm={confirmActionClicked}
          onPutEquipment={putEquipmentClicked}
          onGive={giveCardClicked}
          onDiscard={addToTrashClicked}
          onCancel={cancelActionClicked}
        />

        {/* VIEW MODAL */}
        <DetailModal
          closeRef={modalClose2}
          viewedCard={viewedCard}
          canViewCard={canViewCard}
          rule={rule}
          detailText={detailText}
          players={players}
          onHarvest={harvestActionClicked}
          onJudgement={judgementActionClicked}
          onCarrier={woodenOxActionClicked}
          onPickCard={pickCardClicked}
          onDiscard={addToTrashClicked}
        />

        {/* OTHER MODAL */}
        <OtherModal closeRef={modalClose3} otherText={otherText} />

        {/* PICK HERO MODAL */}
        <PickHeroModal
          closeRef={modalClose4}
          isJoJu={isJoJu}
          warlordForPick={warlordForPick}
          onPick={pickWarlordClicked}
        />

        {/* ENDGAME MODAL */}
        <EndgameModal endgameText={endgameText} players={players} />

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
