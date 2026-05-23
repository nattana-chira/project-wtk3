import { useEffect } from 'react'
import { collection, doc, onSnapshot } from "firebase/firestore"
import { db } from '../firebase'
import { fetchInitData } from '../classes/ApiService'
import { initState } from '../classes/DataInit'
import { DEV_MODE } from '../classes/_InitSetting'

export default function useRoomSync({ roomId, setPlayers, setDeck, setRule, setLog }) {
  useEffect(() => {
    if (DEV_MODE) {
      setPlayers(initState.players)
      setDeck(initState.deck)
      setRule(initState.rule)
      setLog(initState.log)
      return
    }

    onSnapshot(doc(collection(db, "test2"), roomId), (snapshot) => {
      console.log({ snapshot })
      console.log(snapshot.data())
      const data = snapshot.data()

      setPlayers(data.players)
      setDeck(data.deck)
      setRule(data.rule)
      setLog(data.log)
    })

    fetchInitData({ roomId }).then((data) => {
      setPlayers(data.players)
      setDeck(data.deck)
      setRule(data.rule)
      setLog(data.log)
    })
  }, [])
}
