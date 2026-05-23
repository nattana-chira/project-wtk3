import Player from '../../classes/Player'
import { mapMasterDeck } from '../../classes/Card'
import CardComponent from '../CardComponent'

export default function EndgameModal({ endgameText, players }) {
  return (
    <div class="modal" id="endgameModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          <div class="modal-body">
            <div class="endgame-title" dangerouslySetInnerHTML={{ __html: endgameText }} ></div><hr />
            <div>
              {players.map(player => (
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
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
