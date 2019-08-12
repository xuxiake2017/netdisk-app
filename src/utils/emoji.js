import data from '../data/emoji-data.js'
let emojiData = {}
Object.values(data.emojiData).forEach(item => {
  emojiData = { ...emojiData, ...item }
})

/**
 *
 *
 * @export
 * @param {string} value
 * @returns {string}
 */

export function emojiConvert (value) {
  if (!value) return
  Object.keys(emojiData).forEach(item => {
    value = value.replace(new RegExp(item, 'g'), createIcon(item))
  })
  return value
}

function createIcon (item) {
  const value = emojiData[item]
  const path = './static/emoji/'
  return `<img src=${path}${value} width="16px" height="16px">`
}

export function parseToUnicode (value) {
  let emojiChar = value
  if (!value) {
    return
  }
  value = value.replace(/[:]/g, '')
  for (let i = 0; i < data.emojiList.length; i++) {
    const item = data.emojiList[i]
    if (item.aliases.indexOf(value) !== -1) {
      emojiChar = item.emojiChar
      break;
    }
  }
  return emojiChar
}
