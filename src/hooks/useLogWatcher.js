import { useEffect, useState } from 'react'
import PlayAudio from '../classes/Audio'
import Player from '../classes/Player'
import { replaceTrans } from '../classes/Card'
import playSoundByAction from '../classes/playSoundByAction'

export default function useLogWatcher({
  log,
  me,
  setEndgameText,
  modalTrigger5,
}) {
  const [lastAudioLog, setLastAudioLog] = useState("")

  useEffect(() => {
    const lastLog = log[log.length - 1]
    if (!lastLog) return
    if (lastLog === lastAudioLog) return

    const findLog = (txt, depth) => log.slice(depth).find(_log => _log.includes(txt))

    setLastAudioLog(lastLog)

    if (lastLog.includes("ใช้การ์ด") && !lastLog.includes(Player.showRoleName(me)))
      playSoundByAction(replaceTrans(lastLog))

    if (lastLog.includes("จั่วการ์ด") && !lastLog.includes(Player.showRoleName(me)))
      PlayAudio.drawCard()

    if (lastLog.includes("ได้รับความเสียหาย") && !lastLog.includes(Player.showRoleName(me)))
      PlayAudio.attack()

    if (lastLog.includes("ได้รับการฟื้นฟูพลังชีวิต") && !lastLog.includes(Player.showRoleName(me)))
      PlayAudio.heal()

    if (findLog("ตายอย่างเวทนา", -2) && !findLog(Player.showRoleName(me), -2)) {
      PlayAudio.dead()
    }
    else if ((findLog("ตายอย่างเวทนา", -3) && findLog("ได้รับชัยชนะ", -3)) && !findLog(Player.showRoleName(me), -2)) {
      PlayAudio.dead()
    }

    if (!me) return

    const showVictory = () => {
      PlayAudio.victory()
      setEndgameText(`<span class="green">VICTORY</span>`)
      modalTrigger5.current.click()
    }

    const showGameOver = () => {
      PlayAudio.gameOver()
      setEndgameText(`<span class="red">DEFEAT</span>`)
      modalTrigger5.current.click()
    }

    if (lastLog.includes("กบฏได้รับชัยชนะ")) {
      if (me.team === "rebellion") showVictory()
      else showGameOver()
    }
    else if (lastLog.includes("จักรพรรดิและผู้ภัคดีได้รับชัยชนะ")) {
      if (me.team === "emperor" || me.team === "protector") showVictory()
      else showGameOver()
    }
    else if (lastLog.includes("คนทรยศได้รับชัยชนะ")) {
      if (me.team === "traitor") showVictory()
      else showGameOver()
    }
  }, [log])
}
