import classNames from "classnames"
import { Fragment, useLayoutEffect, useRef, useState } from "react"

export default function CardComponent({ card, deathMatch, selectedCard, isHidden, classes="" , onClick = () => {}}) {
  let imgSrc = isHidden ? "back_of_card" : card?.action
  const deathMatchCards = ["peach", "wine", "brotherhood"]
  const [hovered, setHovered] = useState(false)
  const [tipStyle, setTipStyle] = useState({})
  const cardRef = useRef()
  const tipRef = useRef()

  if (deathMatch && deathMatchCards.includes(imgSrc))
    imgSrc = imgSrc + "_2"

  useLayoutEffect(() => {
    if (!hovered || !cardRef.current || !tipRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const TW = tipRef.current.offsetWidth
    const TH = tipRef.current.offsetHeight
    let x = rect.right + 8
    let y = rect.top + rect.height / 2 - TH / 2
    if (x + TW > window.innerWidth - 8) x = rect.left - TW - 8
    if (y < 8) y = 8
    if (y + TH > window.innerHeight - 8) y = window.innerHeight - TH - 8
    setTipStyle({ left: x, top: y })
  }, [hovered])

  return (
    <div
      ref={cardRef}
      className={classNames("card-block d-inline-block " + classes, {
        "card-selected": card?.id === selectedCard?.id,
        "font-red": card?.symbol === "heart" || card?.symbol === "diamond"
      })}
      onClick={() => onClick(card)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <img class="img" src={"img/card_" + imgSrc + ".png"} alt={card?.showAlt()} />

      {!isHidden && (
        <Fragment>
          <div className={classNames("card-no", { "fix-10-card": card?.no === 10})}>{card?.showNo()}</div>
          <div class="card-symbol">{card?.showSymbol()}</div>
          <div ref={tipRef} className={classNames("card-hover-tip", { "card-hover-tip--visible": hovered })} style={tipStyle}>
            <div className={classNames("card-block card-block-lg d-inline-block card-hover-tip-card", {
              "font-red": card?.symbol === "heart" || card?.symbol === "diamond"
            })}>
              <img class="img" src={"img/card_" + imgSrc + ".png"} alt={card?.showAlt()} />
              <div className={classNames("card-no", { "fix-10-card": card?.no === 10})}>{card?.showNo()}</div>
              <div class="card-symbol">{card?.showSymbol()}</div>
            </div>
            <div class="card-hover-tip-name">{card?.transName()}</div>
            <div class="card-hover-tip-desc" dangerouslySetInnerHTML={{ __html: card?.showDesc() }} />
          </div>
        </Fragment>
      )}
    </div>
  )
}
