import { db } from './../firebase'
import { collection, addDoc, getDocs, updateDoc, doc, onSnapshot } from "firebase/firestore"
import { DEV_MODE } from './_InitSetting'

export const fetchInitData = async ({ roomId }) => {
	return getDocs(collection(db, "test2"))
		.then((querySnapshot) => {
			const newData = querySnapshot.docs
				.map((doc) => ({ ...doc.data(), id: doc.id }))

			return newData.find(data => data.id === roomId)
		})
}

export const updateData = async (data = {}, { deck, players, rule, log }, { roomId }) => {
	try {
		const update = {
			deck,
			players,
			rule,
			log, 
			...data
		}

		console.log("BEFORE UPDATE ", update)
		if (!DEV_MODE) updateDoc(doc(collection(db, "test2"), roomId), { ...update })
		console.log('Document successfully updated!');
	} catch (error) {
		console.error('Error updating document: ', error);
	}
};