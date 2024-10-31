import { delay } from "../classes/Utils"
import { updateData } from "../classes/ApiService"
import { resetInit, addInit } from "../classes/DataInit"
import Player from '../classes/Player'

const DebugTool = (props) => {
  const { rule, setTest, setRule, mainState, drawButtonClicked, players, log, test, me } = props

  const queryParams = new URLSearchParams(window.location.search)
  const sessionId = queryParams.get("sessionId")
  const roomId = queryParams.get("roomId")

  const setTurn = (player) => {
    const _rule = { ...rule, playerPhaseSessionId: player.sessionId }

    setRule(_rule)
    delay(() => updateData({ rule: _rule }, mainState, { roomId }))
  }

  const controlPlayer = (player) => {
    if (!player)
      queryParams.delete("sessionId")
    else 
      queryParams.set("sessionId", player.sessionId)
    
    const newUrl = "?" + queryParams.toString()
    window.history.replaceState({ path: newUrl }, '', newUrl)
    setTest(test + 2)
    setRule({ ...rule, counter: rule.counter + 2 })
  }

  const doRestartMatch = () => {
    const state = {
      rule: rule,
    }
    state.rule = { ...state.rule, restartMatch: true }
    updateData({ rule: state.rule }, mainState, { roomId })
  }


  return (
    <div className="d-grid gap-2 dev-tool-wrapper">
      <div class="btn-group" role="group">
        <button id="btnDev4" type="button" class="btn btn-secondary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
          ADMIN {test}
        </button>
        <ul class="dropdown-menu" aria-labelledby="btnDev4">
          <li><a class="dropdown-item" href="#" onClick={addInit}>ADD DATA</a></li>
          <li><a class="dropdown-item" href="#" onClick={doRestartMatch}>RESET DATA {roomId}</a></li>
        </ul>
      </div>

      <div class="btn-group" role="group">
        <button id="btnDev2" type="button" class="btn btn-secondary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
          SET TURN
        </button>
        <ul class="dropdown-menu" aria-labelledby="btnDev2">
          {players.map(player => (
            <li><a class="dropdown-item" href="#" onClick={() => setTurn(player)}>{Player.showFullname(player)}</a></li>
          ))}
        </ul>
      </div>

      <div class="btn-group" role="group">
        <button id="btnDev3" type="button" class="btn btn-secondary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
          CONTROL PLAYER
        </button>
        <ul class="dropdown-menu" aria-labelledby="btnDev3">
          {players.map(player => (
            <li><a class="dropdown-item" href="#" onClick={() => controlPlayer(player)}>{Player.showFullname(player)}</a></li>
          ))}
           <li><a class="dropdown-item" href="#" onClick={() => controlPlayer(null)}>FREE CONTROL</a></li>
        </ul>
      </div>

      <div class="btn-group" role="group">
        <button id="btnDev1" type="button" class="btn btn-secondary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
          GIVE CARD 4
        </button>
        <ul class="dropdown-menu" aria-labelledby="btnDev1">
          {players.map(player => (
            <li><a class="dropdown-item" href="#" onClick={() => drawButtonClicked(4, player)}>{Player.showFullname(player)}</a></li>
          ))}
        </ul>
      </div>

      <button onClick={() => drawButtonClicked(10, me)} type="button" class="btn btn-secondary btn-sm btn-block">
        DRAW 10
      </button>

      <hr />
    </div>
  )
}

export default DebugTool