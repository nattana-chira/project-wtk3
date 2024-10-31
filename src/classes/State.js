import { warlordTrans } from "./Warlord"

export const stateTypes = [
  { state: "chain_state", icon: "fa fa-chain" },
  { state: "acedia_state", icon: "fa fa-gratipay" },
  { state: "ration_state", icon: "fa fa-asterisk" },
  { state: "trick_state", icon: "fa fa-low-vision" },
  { state: "zuo_ci_state", icon: "fa fa-odnoklassniki-square" },
  { state: "farm_state", icon: "fa fa-leaf", isNumeric: true },
  { state: "rage_state", icon: "fa fa-rebel", isNumeric: true },
  { state: "nightmare_state", icon: "fa fa-first-order", isNumeric: true },
  { state: "card_down_state", icon: "fa fa-angle-double-down" },
  { state: "wound_state", icon: "fa fa-tint", isNumeric: true },
  { state: "grateful_state", icon: "fa fa-shield", isNumeric: true },
  { state: "honor_state", icon: "fa fa-ge", isNumeric: true },
]

export const stateTrans = {
  chain_state: { name: "กลยุทธ์ลูกโซ่", desc: "เมื่อขุนผลที่ถูกผูกโซ่เอาไว้ได้รับความเสียหายจากการ์ด “โจมตี” ขุนพลคนนั้นต้องจั่วการ์ดตัดสิน ถ้าเปิดได้สัญลักษณ์ 2-9 (♠) ขุนพลทุกคนอื่นที่ถูกผูกโซ่ตรวนเอาไว้จะได้รับความเสียหายด้วย" },
  acedia_state: { name: "มีสุขลืมเมือง", desc: "เมื่อถึงรอบขุนพลนั้น เขาจะต้องเปิดการ์ดตัดสิน <br /> 1. ถ้าได้ (<span class='red'>♥</span>) การ์ดใบนี้จะไม่เกิดผล <br />2. ถ้าไม่ใช่ ขุนพลนั้นจะถูกข้ามขั้นตอนการเล่นการ์ด" },
  ration_state: { name: "ตัดเสบียง", desc: "เมื่อถึงรอบขุนพลนั้น เขาจะต้องเปิดการ์ดตัดสิน <br /> 1. ถ้าได้ (♣) การ์ดใบนี้จะไม่เกิดผล <br />2. ถ้าไม่ใช่ ขุนพลนั้นจะถูกข้ามขั้นตอนการจั่วการ์ด" },
  trick_state: { name: "สะกดจิต", desc: "เมื่อใดที่ เต๋าหยิน ใช้ทักษะ “สะกดจิต” คุณจะต้องเชื่อเขาเสมอ และหากพลังชีวิตเหลือ 1 คุณจะไม่สามารถใช้ทักษะขุนพลได้ (ยกเว้นทักษะติดตัว)" },
  zuo_ci_state: { name: "แปลงกาย", desc: warlordTrans.zuo_ci.desc },
  farm_state: { name: "ไร่นา", desc: "ระยะทางระหว่างคุณกับขุนพลอื่นจะเพิ่มขึ้นตามจำนวน “ไร่นา” ที่มี" },
  rage_state: { name: "เกรี้ยวกราด", desc: "ทุกครั้งที่คุณได้รับหรือสร้างความเสียหาย คุณจะได้รับสถานะ “เกรี้ยวกราด”" },
  nightmare_state: { name: "ฝันร้าย", desc: "ทุกครั้งที่คุณได้รับความเสียหาย คุณจะได้รับสถานะ “ฝันร้าย”" },
  card_down_state: { name: "อ่อนแรง", desc: "ขีดจำกัดการถือการ์ดบนมือ -1" },
  wound_state: { name: "บาดแผล", desc: "บาดแผลลูกผู้ชาย ได้รับทุกครั้งหลังจากที่รอดตายมาได้" },
  grateful_state: { name: "โล่กตัญญู", desc: "ในขั้นตอนการจั่วการ์ด ได้จั่วการ์ดเพิ่มขึ้น 1 ใบ สามารถทิ้ง “กตัญญู” 1 หน่วย เพื่อป้องกันความเสียหายได้ 1 หน่วย" },
  honor_state: { name: "เกียรติยศ", desc: "ทุกครั้งที่ใช้การ์ดเลขคู่กับขุนพลอื่น คุณจะได้รับสถานะ “เกียรติยศ”" },
}

export const defaultPlayerStates = {
  zuo_ci_state: false,
  chain_state: false,
  acedia_state: false,
  ration_state: false,
  trick_state: false,
  farm_state: 0,
  rage_state: 0,
  nightmare_state: 0,
  card_down_state: false,
  wound_state: 0,
  grateful_state: 0,
  honor_state: 0
}

export const replaceStateTrans = (msg) => {
  Object.keys(stateTrans).forEach(function(key) {
    msg = msg.replace(stateTrans[key].name, key)
  })

  return msg
}