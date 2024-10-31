import classNames from "classnames"
import { Fragment } from "react"

export default function CardComponent({ card, deathMatch, selectedCard, isHidden, classes="" , onClick = () => {}}) {
  let imgSrc = isHidden ? "back_of_card" : card?.action
  const deathMatchCards = ["peach", "wine", "brotherhood"]

  if (deathMatch && deathMatchCards.includes(imgSrc))
    imgSrc = imgSrc + "_2"

  return (
    <div
      className={classNames("card-block d-inline-block " + classes, {
        "card-selected": card?.id === selectedCard?.id,
        "font-red": card?.symbol === "heart" || card?.symbol === "diamond"
      })}
      onClick={() => onClick(card)}
    >
      <img class="img" src={"img/card_" + imgSrc + ".png"} alt={card?.showAlt()} />

      {!isHidden && (
        <Fragment>
          <div className={classNames("card-no", { "fix-10-card": card?.no === 10})}>{card?.showNo()}</div>
          <div class="card-symbol">{card?.showSymbol()}</div>
        </Fragment>
      )}
    </div>      
  )
}