import drawCard from '../audio/drawcard.m4a'
import Cursor1 from '../audio/Cursor1.m4a'
import Equip1 from '../audio/Equip1.m4a'
import Horse from '../audio/Horse.m4a'
import Sheep from '../audio/Sheep.m4a'
import Item3 from '../audio/Item3.m4a'
import Blow1 from '../audio/Blow1.m4a'
import Absorb1 from '../audio/Absorb1.m4a'
import Skill3 from '../audio/Skill3.m4a'
import WarDrum from '../audio/WarDrum.mp3'
import Bow from '../audio/Bow.ogg'
import BattleCry from '../audio/BattleCry.mp3'
import Thunder from '../audio/ZeusUlti.mp3'
import Paralyze from '../audio/Paralyze3.ogg'
import Broken from '../audio/Broken.ogg'
import Cheer from '../audio/Cheer.ogg'
import Move from '../audio/Move.ogg'
import Shop from '../audio/Shop2.m4a'
import Greed from '../audio/Greed.mp3'
import Fire from '../audio/Fire.ogg'
import Sword from '../audio/Sword.ogg'
import Open1 from '../audio/Open1.m4a'
import Drinking from '../audio/Drinking.mp3'
import MarchDrum from '../audio/MarchDrum.mp3'
import Dead from '../audio/Dead.mp3'
import Move4 from '../audio/Move4.mp3'
import Duel from '../audio/Duel.mp3'
import Ice2 from '../audio/Ice2.ogg'
import Earth2 from '../audio/Earth2.m4a'
import Cow from '../audio/Cow.m4a'
import Fanfare from '../audio/Fanfare.mp3'
import Gameover from '../audio/Gameover2.m4a'
import Victory from '../audio/Victory1.m4a'
import Confuse from '../audio/Heal3.m4a'
import DrumSong from '../audio/DrumThemeSong.mp3'
import Shock from '../audio/Shock.mp3'

const volume = 0.27

export default class PlayAudio {
  static drawCard = () => {
    PlayAudio.play(drawCard)
  }

  static click = () => {
    PlayAudio.play(Cursor1)
  }

  static equipItem = () => {
    PlayAudio.play(Equip1)
  }

  static equipHorse = () => {
    PlayAudio.play(Horse)
  }

  static sheep = () => {
    PlayAudio.play(Sheep)
  }

  static heal = () => {
    PlayAudio.play(Item3)
  }

  static attack = () => {
    PlayAudio.play(Blow1)
  }

  static reflect = () => {
    PlayAudio.play(Absorb1)
  }

  static skillSuccess = () => {
    PlayAudio.play(Skill3)
  }

  static warCry = () => {
    PlayAudio.play(BattleCry)
  }

  static bow = () => {
    PlayAudio.play(Bow)
  }

  static warDrum = () => {
    PlayAudio.play(WarDrum)
  }

  static thunder = () => {
    PlayAudio.play(Paralyze)
  }

  static broken = () => {
    PlayAudio.play(Broken)
  }

  static cheer = () => {
    PlayAudio.play(Cheer)
  }

  static harvest = () => {
    PlayAudio.play(Move)
  }

  static money = () => {
    PlayAudio.play(Shop)
  }

  static greed = () => {
    PlayAudio.play(Greed)
  }

  static fire = () => {
    PlayAudio.play(Fire)
  }

  static sword = () => {
    PlayAudio.play(Sword)
  }

  static open = () => {
    PlayAudio.play(Open1)
  }

  static drinking = () => {
    PlayAudio.play(Drinking)
  }

  static marchDrum = () => {
    PlayAudio.play(MarchDrum)
  }

  static ice2 = () => {
    PlayAudio.play(Ice2)
  }

  static move4 = () => {
    PlayAudio.play(Move4)
  }

  static dead = () => {
    PlayAudio.play(Dead)
  }

  static duel = () => {
    PlayAudio.play(Duel)
  }

  static chain = () => {
    PlayAudio.play(Earth2)
  }

  static cow = () => {
    PlayAudio.play(Cow)
  }

  static fanfare = () => {
    PlayAudio.play(Fanfare)
  }

  static gameOver = () => {
    PlayAudio.play(Gameover)
  }

  static victory = () => {
    PlayAudio.play(Victory)
  }

  static confuse = () => {
    PlayAudio.play(Confuse)
  }

  static shock = () => {
    PlayAudio.play(Shock)
  }

  static drumSong = () => {
    try {
      const sound = new Audio(DrumSong);
      const _sound = sound.cloneNode(true)
      _sound.volume = volume
      _sound.loop = true
      _sound.play().catch(error => console.error('Error playing audio: ', error))
    } catch (error) {
      console.error('Error playing audio: ', error);
    }
  }

  static play(soundFile, loop = false) {
    try {
      const sound = new Audio(soundFile);
      const _sound = sound.cloneNode(true)
      _sound.volume = volume
      _sound.loop = loop
      _sound.play().catch(error => console.error('Error playing audio: ', error))
    } catch (error) {
      console.error('Error playing audio: ', error);
    }
  }
}