import Player from '../../classes/Player'
import CardComponent from '../CardComponent'

export default function ConfirmCardModal({
  closeRef,
  selectedCard,
  rule,
  otherPlayers,
  onConfirm,
  onPutEquipment,
  onGive,
  onDiscard,
  onCancel,
}) {
  return (
    <div class="modal" id="confirmModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true" data-bs-backdrop="static">
      <div class="modal-dialog">
        <div class="modal-content">
          <button ref={closeRef} type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          <div class="modal-body">
            {selectedCard && <CardComponent classes="card-block-lg" card={selectedCard} deathMatch={rule?.deathMatch} />}
          </div>
          <div class="modal-footer">
            <div>
              <h5 class="footer-text" id="exampleModalLabel">
                <div><strong>{selectedCard?.transName()}</strong> </div>
                <div dangerouslySetInnerHTML={{ __html: selectedCard?.showDesc() }}></div>
              </h5>
              <hr />
              <div class="d-grid gap-2 footer-button">
                <button onClick={onConfirm} type="button" class="btn btn-primary">{selectedCard?.type === "equipment" ? "สวมใส่" : "ใช้งาน"}</button>
                {selectedCard?.type === "equipment" && (
                  <button onClick={onPutEquipment} type="button" class="btn btn-primary">วางการ์ด</button>
                )}

                <div class="btn-group" role="group">
                  <button id="btnGroupDrop1" type="button" class="btn btn-warning dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                    มอบให้ผู้เล่นอื่น
                  </button>
                  <ul class="dropdown-menu" aria-labelledby="btnGroupDrop1">
                    {otherPlayers.map(player => (
                      <li><a class="dropdown-item" href="#" onClick={() => onGive(selectedCard, player)}>{Player.showRoleName(player)}</a></li>
                    ))}
                  </ul>
                </div>

                <div class="btn-group" role="group">
                  <button id="btnDiscard" type="button" class="btn btn-danger dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                    ทิ้งการ์ด
                  </button>
                  <ul class="dropdown-menu" aria-labelledby="btnDiscard">
                    <li><a class="dropdown-item" href="#" onClick={() => onDiscard(selectedCard)}>ยืนยัน</a></li>
                  </ul>
                </div>

                <button onClick={onCancel} type="button" class="btn btn-secondary" data-bs-dismiss="modal">ยกเลิก</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
