import { useLayoutEffect, useRef, useState } from "react"
import Warlord from "../classes/Warlord"

export default function WarlordTooltip({ warlord, player, children }) {
  const [hovered, setHovered] = useState(false)
  const [tipStyle, setTipStyle] = useState({})
  const wrapRef = useRef()
  const tipRef = useRef()

  if (!warlord?.name) return children

  useLayoutEffect(() => {
    if (!hovered || !wrapRef.current || !tipRef.current) return
    const rect = wrapRef.current.getBoundingClientRect()
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
    <div ref={wrapRef} className="warlord-tip-wrapper"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
      <div ref={tipRef} className={`warlord-hover-tip${hovered ? " warlord-hover-tip--visible" : ""}`} style={tipStyle}>
        <img src={`img/hero_${warlord.name}.png`} alt={warlord.name} />
        <div class="warlord-hover-tip-name">{Warlord.showName(warlord)}</div>
        <div class="warlord-hover-tip-kingdom">
          {Warlord.showKingdom(warlord)} |
          {player && [...Array(Math.max(0, player.hp))].map((_, i) => <i key={i} class="fa fa-heart" style={{color:'red'}} />)}
          {player && [...Array(Math.max(0, player.maxHp - player.hp))].map((_, i) => <i key={i} class="fa fa-heart-o" style={{color:'red'}} />)}
        </div>
        <div class="warlord-hover-tip-desc" dangerouslySetInnerHTML={{ __html: Warlord.showDesc(warlord) }} />
      </div>
    </div>
  )
}
