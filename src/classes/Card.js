import { sortRandom } from "./Utils"
import { warlordTrans } from "./Warlord"

const basicAction =  ["attack", "peach", "dodge", "wine"]

export default class Card {
  id = null
  no = null
  symbol = null
  action = null
  type = null
  subtype = null

  constructor(id, no, symbol, action, type, subtype = null) {
    this.id = id
    this.no = no
    this.symbol = symbol
    this.action = action
    this.type = type
    this.subtype = subtype

    if (type === "basic" && !basicAction.includes(action)) throw Error("card type incorrect")
    if (type === "equipment" && basicAction.includes(action)) throw Error("card type incorrect")
    if (type === "equipment" && !subtype) throw Error("card type incorrect")
    if (type === "spell" && basicAction.includes(action)) throw Error("card type incorrect")
  }

  showSymbol() {
    switch (this.symbol) {
      case "spade": return "♠"
      case "heart": return "♥"
      case "diamond": return "♦"
      case "club": return "♣"
      default: return "??"
    }
  }

  showNo() {
    if (this.no === 1) return "A"
    if (this.no <= 10) return this.no
    if (this.no === 11) return "J"
    if (this.no === 12) return "Q"
    if (this.no === 13) return "K"

    return "??"
  }

  canBeplaceOnJudgement() {
    const cards = [
      "acedia",  "lightning", "ration", "know_enemy"
    ]

    return cards.includes(this.action)
  }

  showFullName() {
    return `${this.showNo()}${this.showSymbol()} ${this.transName()}`
  }

  transName() {
    return masterTrans[this.action]?.name
  }

  showDesc() {
    return masterTrans[this.action]?.desc
  }

  showAlt() {
    return `${this.id}+${this.no}+${this.symbol}+${this.action}+${this.type}+${this.subtype}`
  }
}

export const renderSymbolColor = (msg) => {
  msg = msg.replace("♦", "<span class='red'>♦</span>")
  msg = msg.replace("♥", "<span class='red'>♥</span>")

  return msg
}

export const replaceTrans = (msg) => {
  Object.keys(masterTrans).forEach(function(key) {
    msg = msg.replace(masterTrans[key].name, key)
  })

  return msg
}

export const masterTrans = {
  equip_item: { name: "ติดตั้งอุปกรณ์", desc: null },
  ration: { name: "ตัดเสบียง", desc: "ติดตั้งการ์ดใบนี้ไว้บนพื้นที่ตัดสินของขุนพลอื่น ในระยะ 1 หน่วย เมื่อถึงรอบขุนพลนั้น เขาจะต้องเปิดการ์ดตัดสิน 1. ถ้าได้สัญลักษณ์ (♣) การ์ดใบนี้จะไม่เกิดผล 2. ถ้าไม่ใช่ ขุนพลนั้นจะถูกข้ามขั้นตอนการจั่วการ์ด" },
  peach: { name: "เสบียง", desc: "ใช้ในเทิร์นเพื่อฟื้นฟูพลังชีวิตให้ตัวเอง 1 หน่วย หรือใช้นอกเทิร์นช่วยเหลือขุนผลที่พลังชีวิตเหลือ 0 เท่านั้น" },
  lightning: { name: "ฟ้าลงโทษ", desc: "ติดตั้งการ์ดใบนี้ไว้บนพื้นที่ตรวจสอบของตน เมื่อถึงรอบถัดไปให้เปิดการ์ดตัดสิน ถ้าเปิดได้สัญลักษณ์ 2-9 (♠) คุณและขุนพลทุกคนที่ถูก “กลยุทธ์ลูกโซ่” ต้องเสียพลังชีวิต 3 หน่วย ถ้าไม่ใช่ การ์ดใบนี้จะย้ายไปอยู่หน้าขุนพลคนถัดไป การ์ดใบนี้จะหายไปเมื่อเกิดผลแล้วเท่านั้น" },
  duel: { name: "ท้าสู้", desc: "ท้าสู้ขุนผลอื่น 1 คน ทั้งสองฝ่ายต้องผลัดกันใช้การ์ด “โจมตี” โดยขุนพลที่ถูกท้าสู้เป็นฝ่ายเริ่มก่อน หากฝ่ายใดไม่สามารถใช้การ์ด “โจมตี” ได้ ต้องเสียพลังชีวิต 1 หน่วย" },
  eight_gates: { name: "ค่ายกลแปดทิศ", desc: "เมื่อคุณต้องการใช้การ์ด “หลบหลีก” คุณสามารถทำการเปิดการ์ดตัดสิน หากออกมาเป็นสีแดง (<span class='red'>❤</span>/<span class='red'>◆</span>) จะส่งผลเช่นเดียวกับการใช้การ์ด “หลบหลีก”" },
  frost_blade: { name: "ดาบน้ำแข็ง", desc: "เมื่อคุณโจมตีเป้าหมายสำเร็จ คุณสามารถเลือกได้ว่าจะ สร้างความเสียหาย หรือ ทิ้งการ์ดบนมือเป้าหมาย 2 ใบแทน" },
  yin_yang_swords: { name: "กระบี่ซวงกู่เจี้ยน", desc: "ก่อนที่คุณจะใช้การ์ดโจมตีใส่ขุนพลที่ไม่ใช่เพศเดียวกับคุณ เป้าหมายเลือกได้หนึ่งอย่าง 1.ทิ้งการ์ดในมือเขา 1 ใบ หรือ 2.ให้คุณจั่วการ์ด 1 ใบ" },
  burn_bridge: { name: "เผาสะพาน", desc: "คุณสามารถทิ้งการ์ดได้ 1 ใบ ของขุนพลอื่น (การ์ดบนมือ, การ์ดอุปกรณ์ หรือการ์ดบนพื่นที่ตัดสิน)" },
  steal: { name: "ขโมยแกะ", desc: "คุณสามารถขโมยการ์ด 1 ใบของขุนพลอื่น ในระยะ 1 หน่วย (การ์ดบนมือ, การ์ดอุปกรณ์ หรือการ์ดบนพื่นที่ตัดสิน)" },
  horse_atk: { name: "เซ็กเธาว์", desc: "ลดระยะทาง 1 หน่วย <br /> ยอดคนต้องลิโป้ ยอดอาชาต้องเซ็กส์เทา" },
  horse_def: { name: "เจ่าหยิง", desc: "เพิ่มระยะทาง 1 หน่วย <br > เจ่าหยิงยอดม้าหมื่นลี้แห่งวุ่ยก๊ก" },
  green_dragon_blade: { name: "ง้าวมังกรเขียว", desc: "หากเป้าหมาย “หลบ” การโจมตึคุณได้ คุณสามารถใช้การ์ดโจมตีได้อีก 1 ใบใส่เป้าหมายเดิม" },
  blue_blade: { name: "กระบี่ชิงกัง", desc: "เมื่อโจมตี เกราะของเป้าหมายจะไร้ผล" },
  acedia: { name: "มีสุขลืมเมือง", desc: "ติดตั้งการ์ดใบนี้ไว้บนพื้นที่ตัดสินของขุนพลอื่น เมื่อถึงรอบขุนพลนั้น เขาจะต้องเปิดการ์ดตัดสิน 1. ถ้าได้สัญลักษณ์ (<span class='red'>♥</span>) การ์ดใบนี้จะไม่เกิดผล 2. ถ้าไม่ใช่ ขุนพลนั้นจะได้จั่วการ์ด 2 ใบและจบเทิร์นทันที" },
  barbarian: { name: "คนเถื่อนบุกรุก", desc: "ขุนพลอื่นทุกคนในสนามรบต้องใช้การ์ด “โจมตี” เพื่อโจมตีคนเถื่อน หากขุนพลคนใดไม่สามารถใช้การ์ด “โจมตี” ได้ ต้องเสียพลังชีวิต 1 หน่วย" },
  negation: { name: "คงกระพันชาตรี", desc: "สามารถยกเลิกผลของการ์ดอุบายทุกชนิดที่ส่งผลต่อผู้เล่นคนใดก็ได้ 1 คน (สามารถยกเลิกผลของการ์ด “คงกระพันชาตรี” ได้ด้วย) หากใช้การ์ดใบนี้กับการ์ด “ฟ้าลงโทษ” ผู้เล่นไม่ต้องเปิดการ์ดตัดสินในเทิร์นนั้น" },
  serpent_spear: { name: "ทวนอสรพิษ", desc: "คุณสามารถใช้การ์ดในมือ 2 ใบแทนการ์ดโจมตี" },
  brotherhood: { name: "ร่วมสาบาน", desc: "ขุนพลทั้งหมดในสนามรบ ฟื้นฟูค่าพลังชีวิตของตัวเอง 1 หน่วย" },
  raining_arrows: { name: "เกาทัณฑ์พันดอก", desc: "ยิงเกาทัณฑ์ใส่ขุนพลอื่นทุกคนในสนามรบขุนพล ทุกคนต้องใช้การ์ด “หลบหลีก” เพื่อหลบเกาทัณฑ์ตามลำดับ หากขุนพลคนใดไม่สามารถใช้การ์ด “หลบหลีก” ได้ ต้องเสียพลังชีวิต 1 หน่วย " },
  harvest: { name: "เก็บเกี่ยวยุ้งฉาง", desc: "เปิดการ์ดจากกองการ์ดให้เท่ากับจำนวนขุนพลที่เหลืออยู่ทั้งหมดในสนามรบ ขุนพลทุกคนผลัดกันหยิบการ์ด 1 ใบตามลำดับ" },
  kirin_bow: { name: "ธนูกิเลน", desc: "เมื่อคุณใช้การ์ดโจมตีเป้าหมายสำเร็จ คุณสามารถทิ้งการ์ดพาหนะ 1 ใบ ของเป้าหมายได้" },
  greed: { name: "ปีศาจจอมละโมบ", desc: "คุณสามารถจั่วการ์ดได้ 2 ใบ" },
  crossbow: { name: "หน้าไม้กล", desc: "คุณสามารถใช้การ์ดโจมตีได้โดยไม่จำกัดจำนวนครั้ง" },
  rock_axe: { name: "ขวานผ่าศิลา", desc: "หากเป้าหมายสามารถหลบการโจมตีของคุณได้ คุณสามารถทิ้งการ์ดบนมือ 2 ใบ เพื่อให้การโจมตีสำเร็จ" },
  trident: { name: "ทวนกรีดนภา", desc: "หากการ์ด “โจมตี” เป็นการ์ดใบสุดท้ายบนมือคุณ คุณสามารถเลือกเป้าหมายของการโจมตีนั้นเพิ่มได้อีก 2 คน" },
  nio_shield: { name: "โล่จักรพรรดิ", desc: "การ์ด “โจมตี” (♠/♣) ที่เป็นสีดำ ไม่มีผลกับคุณ" },
  borrowed_sword: { name: "ยืมดาบฆ่าคน", desc: "ออกคำสั่งขุนพลที่ติดตั้งอาวุธ ให้ใช้การ์ด “โจมตี” ใส่ขุนพลอื่นที่คุณเลือก (ขุนพลคนนั้นจะต้องอยู่ในขอบเขตการโจมตีของขุนพลที่ถูกยืมมือ) หากไม่สามารถใช้การ์ด “โจมตี” ได้ (หรือไม่ต้องการใช้) เขาจะต้องมอบอาวุธที่ติดตั้งอยู่ให้คุณ" },
  silver_lion_helmet: { name: "หมวกรบราชสีเงิน", desc: "ในรอบของขุนพลอื่น ขุนพลอื่นจะสร้างความเสียหายให้แก่คุณได้เพียง 1 หน่วยในเท่านั้นในรอบของเขา และเมื่อการ์ดนี้ถูกนำออกจากพื้นที่ของคุณ คุณจะได้รับการฟื้นฟู 1 หน่วย" },
  rattan_armor: { name: "เกราะหวาย", desc: "ความเสียหายจากการ์ด “คนเถื่อนบุกรุก” และ “เกาทัณฑ์พันดอก” และ “สุรา” ไม่มีผลกับคุณ" },
  wine: { name: "สุรา", desc: "ใช้การ์ดใบนี้ในรอบของคุณ เพื่อเพิ่มความเสียหายจากการโจมตีครั้งถัดไป 1 หน่วย หรือใช้ฟื้นฟูพลังชีวิตเมื่อพลังชีวิตของคุณเหลือ 0 เท่านั้น (ใช้ได้รอบละ 1 ครั้ง)" },
  six_swords: { name: "ดาบหกคม", desc: "ระยะโจมตีขุนพลจากอาณาจักรเดียวกันเพิ่มขึ้น 1 หน่วย" },
  fan: { name: "พัดขนนก", desc: "เมื่อคุณโจมตีขุนพลที่ถูกโซ่ผูกเอาไว้จากการ์ด “กลยุทธ์ลูกโซ่” สำเร็จ ความสามารถของ “กลยุทธ์ลูกโซ่” จะทำงานทันทีโดยที่ไม่ต้องจั่วการ์ดตัดสิน" },
  attack_by_fire: { name: "ไฟพิฆาต", desc: "เลือกขุนพลให้เขาแสดงการ์ดบนมือ 1 ใบ คุณสามารถเลือกทิ้งการ์ดในมือคุณ 1 ใบ ที่มีสัญลักษณ์ตรงกับการ์ดที่ขุนผลเป้าหมายแสดง เพื่อสร้างความเสียหาย 1 หน่วย" },
  rest: { name: "จัดกระบวนทัพ", desc: "ขุนผลทุกคนที่อยู่อาณาจักรเดียวกันกับคุณ <br /> ได้จั่วการ์ด 2 ใบและเลือกทิ้งการ์ด 2 ใบ" },
  attack: { name: "โจมตี", desc: null },
  dodge: { name: "หลบหลีก", desc: null },
  chain: { name: "กลยุทธ์ลูกโซ่", desc: "1. ในขั้นตอนเล่นการ์ด เลือกขุนพลไม่เกิน 2 คน เพื่อผูกหรือทำลายโซ่ตรวนเอาไว้ เมื่อขุนผลที่ถูกผูกโซ่เอาไว้ได้รับความเสียหายจากการ์ด “โจมตี” ขุนพลคนนั้นต้องจั่วการ์ดตัดสิน ถ้าเปิดได้สัญลักษณ์ 2-9 (♠) ขุนพลอื่นทุกคนที่ถูกผูกโซ่ตรวนเอาไว้จะได้รับความเสียหายด้วย <br /> 2. ทิ้งการ์ดใบนี้เพื่อจั่วการ์ด 1 ใบ" },
  alliance: { name: "พันธมิตร", desc: "เลือกขุนผลเป้าหมาย 1 คนที่ไม่ได้อยู่อาณาจักรเดียวกันกับคุณ เป้าหมายจั่วการ์ด 1 ใบ และคุณได้จั่วการ์ด 3 ใบ" },
  ancient_sword: { name: "ดาบมาร", desc: "การ์ด “โจมตี” ของคุณสร้างความเสียหายเพิ่ม 1 หน่วย หากขุนพลเป้าหมายไม่มีการ์ดบนมือ" },
  carrier: { name: "วัวไม้ ม้าเลื่อน", desc: "เพิ่มขีดจำกัดการถือไพ่บนมือได้ 2 ใบ หากขุนพลอื่นขโมยหรือทิ้งการ์ดใบนี้ ผู้เล่นจะเสียการ์ดที่เกินขีดจำกัดไพ่บนมือไปด้วย <br />  ในเทิร์นการเล่นคุณสามารถเลือกย้ายการ์ดใบนี้ไปติดตั้งบนพื่นที่ของขุนพลอื่นได้พร้อมกับสามารถส่งการ์ดให้กับขุนพลคนนั้นได้ (ไม่เกิน 3 ใบ)" },
  know_enemy: { name: "ความจริงปรากฏ", desc: "1. คุณสามารถมาส่องการ์ดบนมือ หรือบทบาทของขุนพลอื่นได้ 1 คน <br />2. ทิ้งการ์ดใบนี้เพื่อจั่วการ์ด 1 ใบ" },
}

export const masterDeck = [
  new Card(1, 1, "spade", "lightning", "spell"),
  new Card(2, 1, "spade", "duel", "spell"),
  new Card(3, 2, "spade", "eight_gates", "equipment", "armor"),
  new Card(4, 2, "spade", "frost_blade", "equipment", "weapon"),
  new Card(5, 2, "spade", "yin_yang_swords", "equipment", "weapon"),
  new Card(6, 3, "spade", "burn_bridge", "spell"),
  new Card(7, 3, "spade", "steal", "spell"),
  new Card(8, 4, "spade", "steal", "spell"),
  new Card(9, 4, "spade", "burn_bridge", "spell"),
  new Card(10, 5, "spade", "horse_def", "equipment", "mount"),
  new Card(11, 5, "spade", "green_dragon_blade", "equipment", "weapon"),
  new Card(12, 6, "spade", "blue_blade", "equipment", "weapon"),
  new Card(13, 6, "spade", "acedia", "spell"),
  new Card(14, 7, "spade", "attack", "basic"),
  new Card(15, 7, "spade", "barbarian", "spell"),
  new Card(16, 8, "spade", "attack", "basic"),
  new Card(17, 8, "spade", "attack", "basic"),
  new Card(18, 9, "spade", "attack", "basic"),
  new Card(19, 9, "spade", "attack", "basic"),
  new Card(20, 10, "spade", "attack", "basic"),
  new Card(21, 10, "spade", "attack", "basic"),
  new Card(22, 11, "spade", "steal", "spell"),
  new Card(23, 11, "spade", "negation", "spell"),
  new Card(24, 12, "spade", "burn_bridge", "spell"),
  new Card(25, 12, "spade", "serpent_spear", "equipment", "weapon"),
  new Card(26, 13, "spade", "barbarian", "spell"),
  new Card(27, 13, "spade", "horse_atk", "equipment", "mount"),

  new Card(28, 1, "heart", "brotherhood", "spell"),
  new Card(29, 1, "heart", "raining_arrows", "spell"),
  new Card(30, 2, "heart", "dodge", "basic"),
  new Card(31, 2, "heart", "dodge", "basic"),
  new Card(32, 3, "heart", "peach", "basic"),
  new Card(33, 3, "heart", "harvest", "spell"),
  new Card(34, 4, "heart", "harvest", "spell"),
  new Card(35, 4, "heart", "peach", "basic"),
  new Card(36, 5, "heart", "horse_atk", "equipment", "mount"),
  new Card(37, 5, "heart", "kirin_bow", "equipment", "weapon"),
  new Card(38, 6, "heart", "peach", "basic"),
  new Card(39, 6, "heart", "acedia", "spell"),
  new Card(40, 7, "heart", "greed", "spell"),
  new Card(41, 7, "heart", "peach", "basic"),
  new Card(42, 8, "heart", "greed", "spell"),
  new Card(43, 8, "heart", "peach", "basic"),
  new Card(44, 9, "heart", "greed", "spell"),
  new Card(45, 9, "heart", "peach", "basic"),
  new Card(46, 10, "heart", "attack", "basic"),
  new Card(47, 10, "heart", "attack", "basic"),
  new Card(48, 11, "heart", "attack", "basic"),
  new Card(49, 11, "heart", "greed", "spell"),
  new Card(50, 12, "heart", "peach", "basic"),
  new Card(51, 12, "heart", "lightning", "spell"),
  new Card(52, 12, "heart", "burn_bridge", "spell"),
  new Card(53, 13, "heart", "horse_def", "equipment", "mount"),
  new Card(54, 13, "heart", "dodge", "basic"),

  new Card(55, 1, "diamond", "crossbow", "equipment", "weapon"),
  new Card(56, 1, "diamond", "duel", "spell"),
  new Card(57, 2, "diamond", "dodge", "basic"),
  new Card(58, 2, "diamond", "dodge", "basic"),
  new Card(59, 3, "diamond", "steal", "spell"),
  new Card(60, 3, "diamond", "dodge", "basic"),
  new Card(61, 4, "diamond", "steal", "spell"),
  new Card(62, 4, "diamond", "dodge", "basic"),
  new Card(63, 5, "diamond", "rock_axe", "equipment", "weapon"),
  new Card(64, 5, "diamond", "dodge", "basic"),
  new Card(65, 6, "diamond", "attack", "basic"),
  new Card(66, 6, "diamond", "dodge", "basic"),
  new Card(67, 7, "diamond", "attack", "basic"),
  new Card(68, 7, "diamond", "dodge", "basic"),
  new Card(69, 8, "diamond", "attack", "basic"),
  new Card(70, 8, "diamond", "dodge", "basic"),
  new Card(71, 9, "diamond", "attack", "basic"),
  new Card(72, 9, "diamond", "wine", "basic"),
  new Card(73, 10, "diamond", "wine", "basic"),
  new Card(74, 10, "diamond", "dodge", "basic"),
  new Card(75, 11, "diamond", "dodge", "basic"),
  new Card(76, 11, "diamond", "dodge", "basic"),
  new Card(77, 12, "diamond", "negation", "spell"),
  new Card(78, 12, "diamond", "peach", "basic"),
  new Card(79, 12, "diamond", "trident", "equipment", "weapon"),
  new Card(80, 13, "diamond", "horse_atk", "equipment", "mount"),
  new Card(81, 13, "diamond", "attack", "basic"),

  new Card(82, 1, "club", "crossbow", "equipment", "weapon"),
  new Card(83, 1, "club", "duel", "spell"),
  new Card(84, 2, "club", "nio_shield", "equipment", "armor"),
  new Card(85, 2, "club", "attack", "basic"),
  new Card(86, 2, "club", "eight_gates", "equipment", "armor"),
  new Card(87, 3, "club", "attack", "basic"),
  new Card(88, 3, "club", "burn_bridge", "spell"),
  new Card(89, 4, "club", "attack", "basic"),
  new Card(90, 4, "club", "burn_bridge", "spell"),
  new Card(91, 5, "club", "attack", "basic"),
  new Card(92, 5, "club", "horse_def", "equipment", "mount"),
  new Card(93, 6, "club", "attack", "basic"),
  new Card(94, 6, "club", "acedia", "spell"),
  new Card(95, 7, "club", "attack", "basic"),
  new Card(96, 7, "club", "barbarian", "spell"),
  new Card(97, 8, "club", "attack", "basic"),
  new Card(98, 8, "club", "attack", "basic"),
  new Card(99, 9, "club", "attack", "basic"),
  new Card(100, 9, "club", "attack", "basic"),
  new Card(101, 10, "club", "attack", "basic"),
  new Card(102, 10, "club", "attack", "basic"),
  new Card(103, 11, "club", "attack", "basic"),
  new Card(104, 11, "club", "attack", "basic"),
  new Card(105, 12, "club", "borrowed_sword", "spell"),
  new Card(106, 12, "club", "negation", "spell"),
  new Card(107, 13, "club", "borrowed_sword", "spell"),
  new Card(108, 13, "club", "negation", "spell"),

  new Card(109, 1, "club", "silver_lion_helmet", "equipment", "armor"),
  new Card(110, 2, "club", "rattan_armor", "equipment", "armor"),
  new Card(111, 6, "diamond", "six_swords", "equipment", "weapon"),
  new Card(112, 1, "diamond", "fan", "equipment", "weapon"),
  new Card(113, 11, "diamond", "rest", "spell"),
  new Card(114, 10, "spade", "ration", "spell"),
  new Card(115, 4, "club", "ration", "spell"),
  new Card(116, 2, "heart", "attack_by_fire", "spell"),
  new Card(117, 3, "heart", "attack_by_fire", "spell"),
  new Card(118, 5, "diamond", "carrier", "equipment", "mount"),
  new Card(119, 1, "heart", "negation", "spell"),
  new Card(120, 13, "spade", "negation", "spell"),
  new Card(121, 9, "heart", "alliance", "spell"),
  new Card(122, 9, "club", "wine", "basic"),
  new Card(123, 3, "spade", "wine", "basic"),
  new Card(124, 9, "spade", "wine", "basic"),
  new Card(125, 13, "diamond", "horse_def", "equipment", "mount"),
  new Card(126, 1, "spade", "ancient_sword", "equipment", "weapon"),
  new Card(127, 10, "club", "chain", "spell"),
  new Card(128, 11, "club", "chain", "spell"),
  new Card(129, 12, "club", "chain", "spell"),
  new Card(130, 13, "club", "chain", "spell"),

  new Card(131, 3, "heart", "know_enemy", "spell"),

  new Card(132, 5, "spade", "attack", "basic"),
  new Card(133, 8, "spade", "attack", "basic"),
  new Card(134, 4, "heart", "attack", "basic"),
  new Card(135, 11, "diamond", "dodge", "basic"),
  new Card(136, 6, "diamond", "dodge", "basic"),
  new Card(137, 6, "heart", "peach", "basic"),

]

export const mapMasterDeck = (cardId) => masterDeck[cardId-1]

export const searchCardAction = (cardIds, action) => cardIds.map(mapMasterDeck).find(card => card.action === action)

export const shuffleDeck = (deck) => {
  return sortRandom(deck)
}

export const fullInitDeck = masterDeck.map((card) => card.id)

export const initDeck = fullInitDeck
