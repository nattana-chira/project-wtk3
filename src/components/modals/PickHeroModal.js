import Warlord from '../../classes/Warlord'

export default function PickHeroModal({
  closeRef,
  isJoJu,
  warlordForPick,
  onPick,
}) {
  return (
    <div class="modal" id="pickHeroModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true" {...(isJoJu ? { "data-bs-backdrop": "static" } : {})}>
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <button ref={closeRef} type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
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
                    <button onClick={() => onPick(warlord)} type="button" class="btn btn-primary btn-lg btn-block pick-warlord-btn">เลือกขุนพล</button>
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
