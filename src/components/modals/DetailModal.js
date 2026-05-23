import { Fragment } from 'react'
import Player from '../../classes/Player'
import CardComponent from '../CardComponent'

export default function DetailModal({
  closeRef,
  viewedCard,
  canViewCard,
  rule,
  detailText,
  players,
  onHarvest,
  onJudgement,
  onCarrier,
  onPickCard,
  onDiscard,
}) {
  return (
    <div class="modal fade" id="detailModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel">รายละเอียด</h5>
            <button ref={closeRef} type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            {viewedCard && <CardComponent isHidden={!canViewCard} classes="card-block-lg" card={viewedCard} deathMatch={rule?.deathMatch} />}
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
                  <button onClick={() => onHarvest(viewedCard)} type="button" class="btn btn-primary">เก็บเกี่ยวยุ้งฉาง</button>
                }
                {canViewCard && (viewedCard?.canBeplaceOnJudgement() || viewedCard?.action === "carrier") && (
                  <div class="btn-group" role="group">
                    <button id="btnGroupDrop1" type="button" class="btn btn-primary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                      {viewedCard?.transName()}
                    </button>
                    <ul class="dropdown-menu" aria-labelledby="btnGroupDrop1">
                      {players.map(player => (
                        viewedCard?.action === "carrier"
                          ? <li><a class="dropdown-item" href="#" onClick={() => onCarrier(viewedCard, player)}>{Player.showRoleName(player)}</a></li>
                          : <li><a class="dropdown-item" href="#" onClick={() => onJudgement(viewedCard, player)}>{Player.showRoleName(player)}</a></li>
                      ))}
                    </ul>
                  </div>
                )}
                <button onClick={() => onPickCard(viewedCard)} type="button" class="btn btn-warning">หยิบการ์ด</button>
                <div class="btn-group" role="group">
                  <button id="btnDiscard2" type="button" class="btn btn-danger dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                    ทิ้งการ์ด
                  </button>
                  <ul class="dropdown-menu" aria-labelledby="btnDiscard2">
                    <li><a class="dropdown-item" href="#" onClick={() => onDiscard(viewedCard)}>ยืนยัน</a></li>
                  </ul>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
