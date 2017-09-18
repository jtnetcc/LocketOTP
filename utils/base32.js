var LocketOTP = function (options) {
  var construct, pad, dataBits, codeBits, keyString, arrayData, mask, group, max, gcd, translate, encode, decode;
  construct = function () {
    var i, mag, prev;
    pad = options.pad || '';
    dataBits = options.dataBits;
    codeBits = options.codeBits;
    keyString = options.keyString;
    arrayData = options.arrayData;
    mag = Math.max(dataBits, codeBits);
    prev = 0;
    mask = [];
    for (i = 0; i < mag; i += 1) {
      mask.push(prev);
      prev += prev + 1
    }
    max = prev;
    group = dataBits / gcd(dataBits, codeBits)
  };
  gcd = function (a, b) {
    var t;
    while (b !== 0) {
      t = b;
      b = a % b;
      a = t
    }
    return a
  };
  translate = function (input, bitsIn, bitsOut, decoding) {
    var i, len, chr, byteIn, buffer, size, output, write;
    write = function (n) {
      if (!decoding) {
        output.push(keyString.charAt(n))
      } else if (arrayData) {
        output.push(n)
      } else {
        output.push(String.fromCharCode(n))
      }
    };
    buffer = 0;
    size = 0;
    output = [];
    len = input.length;
    for (i = 0; i < len; i += 1) {
      size += bitsIn;
      if (decoding) {
        chr = input.charAt(i);
        byteIn = keyString.indexOf(chr);
        if (chr === pad) {
          break
        } else if (byteIn < 0) {
          throw 'the character "' + chr + '" is not a member of ' + keyString;
        }
      } else {
        if (arrayData) {
          byteIn = input[i]
        } else {
          byteIn = input.charCodeAt(i)
        }
        if ((byteIn | max) !== max) {
          throw byteIn + " is outside the range 0-" + max;
        }
      }
      buffer = (buffer << bitsIn) | byteIn;
      while (size >= bitsOut) {
        size -= bitsOut;
        write(buffer >> size);
        buffer &= mask[size]
      }
    }
    if (!decoding && size > 0) {
      write(buffer << (bitsOut - size));
      len = output.length % group;
      for (i = 0; i < len; i += 1) {
        output.push(pad)
      }
    }
    return (arrayData && decoding) ? output : output.join('')
  };
  encode = function (input) {
    return translate(input, dataBits, codeBits, false)
  };
  decode = function (input) {
    return translate(input, codeBits, dataBits, true)
  };
  this.encode = encode;
  this.decode = decode;
  construct()
};
var Base32 = new LocketOTP({
  dataBits: 8,
  codeBits: 5,
  keyString: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567',
  pad: '='
});
var Base64 = new LocketOTP({
  dataBits: 8,
  codeBits: 6,
  keyString: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
  pad: '='
});
module.exports = {
  encode: Base32.encode,
  decode: Base32.decode
}