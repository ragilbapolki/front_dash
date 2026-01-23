// src/utils/index.js

/**
 * Format timestamp to custom string
 * @param {string} format - e.g. 'yyyy-MM-dd hh:mm:ss'
 * @param {number} timestamp - optional
 * @returns {string}
 */
export function formatDate(format, timestamp) {
  const d = timestamp ? new Date(timestamp) : new Date()
  const o = {
    'M+': d.getMonth() + 1, // month
    'd+': d.getDate(),      // day
    'h+': d.getHours(),     // hour
    'm+': d.getMinutes(),   // minute
    's+': d.getSeconds(),   // second
    'q+': Math.floor((d.getMonth() + 3) / 3), // quarter
    'S': d.getMilliseconds() // millisecond
  }

  if (/(y+)/.test(format)) {
    format = format.replace(RegExp.$1, (d.getFullYear() + '').substring(4 - RegExp.$1.length))
  }

  for (let k in o) {
    if (new RegExp('(' + k + ')').test(format)) {
      format = format.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : ('00' + o[k]).slice(-('' + o[k]).length))
    }
  }

  return format
}

/**
 * Copy text to clipboard
 * @param {string|number} text
 * @param {Function} success - optional callback
 */
export function copyText(text, success) {
  const textString = text.toString()
  let input = document.querySelector('#copy-input')
  if (!input) {
    input = document.createElement('input')
    input.id = 'copy-input'
    input.readOnly = true
    input.style.position = 'fixed'
    input.style.left = '-1000px'
    input.style.zIndex = '-1000'
    document.body.appendChild(input)
  }
  input.value = textString
  selectText(input, 0, textString.length)

  if (document.execCommand('copy')) {
    document.execCommand('copy')
    if (success) success(textString)
    else alert('已复制到粘贴板')
  } else {
    console.log('Browser not compatible')
  }

  input.blur()

  function selectText(textbox, startIndex, stopIndex) {
    if (textbox.createTextRange) { // IE
      const range = textbox.createTextRange()
      range.collapse(true)
      range.moveStart('character', startIndex)
      range.moveEnd('character', stopIndex - startIndex)
      range.select()
    } else { // modern browsers
      textbox.setSelectionRange(startIndex, stopIndex)
      textbox.focus()
    }
  }
}

/**
 * Debounce function
 * @param {Function} fn
 * @param {number} delay - milliseconds
 * @returns {Function}
 */
export function debounce(fn, delay = 300) {
  let timer
  return function (...args) {
    clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), delay)
  }
}
