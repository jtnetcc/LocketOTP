let base32 = require("base32")
let jsSHA = require("hmac")

const DEFAULT_INTERVAL = 30
const DEFAULT_DIGITS = 6

function generate(timenow, token) {
  let hmacObj = new jsSHA("SHA-1", "BYTES")
  hmacObj.setHMACKey(byte_secret(token), "BYTES")
  hmacObj.update(int_to_bytestring(timenow))
  let hmac = hmacObj.getHMAC("BYTES")
  let hmac_a = hmac.split("")
  let offset = hmac_a[hmac_a.length - 1].charCodeAt() & 0xf
  let code = ((hmac_a[offset].charCodeAt() & 0x7f) << 24 | (hmac_a[offset + 1].charCodeAt() & 0xff) << 16 | (hmac_a[offset + 2].charCodeAt() & 0xff) << 8 | (hmac_a[offset + 3].charCodeAt() & 0xff))
  let digits = DEFAULT_DIGITS
  let str_code = (code % Math.pow(10, digits)).toString()
  str_code = rjust(str_code, digits)
  return str_code
}

function timecode(time) {
  let time_str = Date.parse(time).toString()
  let format_time = time_str.substring(0, time_str.length - 3)
  let interval = DEFAULT_INTERVAL
  return parseInt(parseInt(format_time) / interval)
}

function rjust(num, n) {
  var len = num.toString().length;
  while (len < n) {
    num = "0" + num;
    len++;
  }
  return num;
}

function arr_rjust(arr, n) {
  if (arr.length >= n) {
    arr = arr.splice(arr.length - 1 - n)
    return arr
  } else {
    let diff = n - arr.length
    for (let i = 0; i < diff; i++) {
      arr.unshift(String.fromCharCode(0))
    }
    return arr
  }
}

function int_to_bytestring(i, padding = 8) {
  let result = []
  while (i != 0) {
    result.push(String.fromCharCode(i & 0xFF))
    i >>= 8
  }
  result = result.reverse()
  result = arr_rjust(result, padding).join("")
  return result
}

function byte_secret(token) {
  return base32.decode(token.toUpperCase())
}

function now(token) {
  let timenow = timecode(new Date())
  if (token.indexOf("0") >= 0 || token.indexOf("1") >= 0 || token.indexOf("8") >= 0 || token.indexOf("9") >= 0) {
    return null
  } else {
    let digit = generate(timenow, token)
    return digit
  }
}

module.exports = {
  now: now
}