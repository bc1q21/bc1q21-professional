(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __commonJS = (cb, mod2) => function __require() {
    return mod2 || (0, cb[__getOwnPropNames(cb)[0]])((mod2 = { exports: {} }).exports, mod2), mod2.exports;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod2, isNodeMode, target) => (target = mod2 != null ? __create(__getProtoOf(mod2)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod2 || !mod2.__esModule ? __defProp(target, "default", { value: mod2, enumerable: true }) : target,
    mod2
  ));
  var __toCommonJS = (mod2) => __copyProps(__defProp({}, "__esModule", { value: true }), mod2);

  // node_modules/esbuild-plugin-polyfill-node/polyfills/__dirname.js
  var init_dirname = __esm({
    "node_modules/esbuild-plugin-polyfill-node/polyfills/__dirname.js"() {
    }
  });

  // node_modules/@jspm/core/nodelibs/browser/process.js
  function Item(fun, array) {
    this.fun = fun;
    this.array = array;
  }
  function hrtime(previousTimestamp) {
    var baseNow = Math.floor((Date.now() - _performance.now()) * 1e-3);
    var clocktime = _performance.now() * 1e-3;
    var seconds = Math.floor(clocktime) + baseNow;
    var nanoseconds = Math.floor(clocktime % 1 * 1e9);
    if (previousTimestamp) {
      seconds = seconds - previousTimestamp[0];
      nanoseconds = nanoseconds - previousTimestamp[1];
      if (nanoseconds < 0) {
        seconds--;
        nanoseconds += nanoPerSec;
      }
    }
    return [seconds, nanoseconds];
  }
  var env, _performance, nowOffset, nanoPerSec;
  var init_process = __esm({
    "node_modules/@jspm/core/nodelibs/browser/process.js"() {
      init_dirname();
      init_buffer2();
      init_process2();
      Item.prototype.run = function() {
        this.fun.apply(null, this.array);
      };
      env = {
        PATH: "/usr/bin",
        LANG: typeof navigator !== "undefined" ? navigator.language + ".UTF-8" : void 0,
        PWD: "/",
        HOME: "/home",
        TMP: "/tmp"
      };
      _performance = {
        now: typeof performance !== "undefined" ? performance.now.bind(performance) : void 0,
        timing: typeof performance !== "undefined" ? performance.timing : void 0
      };
      if (_performance.now === void 0) {
        nowOffset = Date.now();
        if (_performance.timing && _performance.timing.navigationStart) {
          nowOffset = _performance.timing.navigationStart;
        }
        _performance.now = () => Date.now() - nowOffset;
      }
      nanoPerSec = 1e9;
      hrtime.bigint = function(time) {
        var diff = hrtime(time);
        if (typeof BigInt === "undefined") {
          return diff[0] * nanoPerSec + diff[1];
        }
        return BigInt(diff[0] * nanoPerSec) + BigInt(diff[1]);
      };
    }
  });

  // node_modules/esbuild-plugin-polyfill-node/polyfills/process.js
  var init_process2 = __esm({
    "node_modules/esbuild-plugin-polyfill-node/polyfills/process.js"() {
      init_process();
    }
  });

  // node_modules/@jspm/core/nodelibs/browser/chunk-DtuTasat.js
  function dew$2() {
    if (_dewExec$2) return exports$2;
    _dewExec$2 = true;
    exports$2.byteLength = byteLength;
    exports$2.toByteArray = toByteArray;
    exports$2.fromByteArray = fromByteArray;
    var lookup = [];
    var revLookup = [];
    var Arr = typeof Uint8Array !== "undefined" ? Uint8Array : Array;
    var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    for (var i = 0, len = code.length; i < len; ++i) {
      lookup[i] = code[i];
      revLookup[code.charCodeAt(i)] = i;
    }
    revLookup["-".charCodeAt(0)] = 62;
    revLookup["_".charCodeAt(0)] = 63;
    function getLens(b64) {
      var len2 = b64.length;
      if (len2 % 4 > 0) {
        throw new Error("Invalid string. Length must be a multiple of 4");
      }
      var validLen = b64.indexOf("=");
      if (validLen === -1) validLen = len2;
      var placeHoldersLen = validLen === len2 ? 0 : 4 - validLen % 4;
      return [validLen, placeHoldersLen];
    }
    function byteLength(b64) {
      var lens = getLens(b64);
      var validLen = lens[0];
      var placeHoldersLen = lens[1];
      return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
    }
    function _byteLength(b64, validLen, placeHoldersLen) {
      return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
    }
    function toByteArray(b64) {
      var tmp;
      var lens = getLens(b64);
      var validLen = lens[0];
      var placeHoldersLen = lens[1];
      var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen));
      var curByte = 0;
      var len2 = placeHoldersLen > 0 ? validLen - 4 : validLen;
      var i2;
      for (i2 = 0; i2 < len2; i2 += 4) {
        tmp = revLookup[b64.charCodeAt(i2)] << 18 | revLookup[b64.charCodeAt(i2 + 1)] << 12 | revLookup[b64.charCodeAt(i2 + 2)] << 6 | revLookup[b64.charCodeAt(i2 + 3)];
        arr[curByte++] = tmp >> 16 & 255;
        arr[curByte++] = tmp >> 8 & 255;
        arr[curByte++] = tmp & 255;
      }
      if (placeHoldersLen === 2) {
        tmp = revLookup[b64.charCodeAt(i2)] << 2 | revLookup[b64.charCodeAt(i2 + 1)] >> 4;
        arr[curByte++] = tmp & 255;
      }
      if (placeHoldersLen === 1) {
        tmp = revLookup[b64.charCodeAt(i2)] << 10 | revLookup[b64.charCodeAt(i2 + 1)] << 4 | revLookup[b64.charCodeAt(i2 + 2)] >> 2;
        arr[curByte++] = tmp >> 8 & 255;
        arr[curByte++] = tmp & 255;
      }
      return arr;
    }
    function tripletToBase64(num) {
      return lookup[num >> 18 & 63] + lookup[num >> 12 & 63] + lookup[num >> 6 & 63] + lookup[num & 63];
    }
    function encodeChunk(uint8, start, end) {
      var tmp;
      var output = [];
      for (var i2 = start; i2 < end; i2 += 3) {
        tmp = (uint8[i2] << 16 & 16711680) + (uint8[i2 + 1] << 8 & 65280) + (uint8[i2 + 2] & 255);
        output.push(tripletToBase64(tmp));
      }
      return output.join("");
    }
    function fromByteArray(uint8) {
      var tmp;
      var len2 = uint8.length;
      var extraBytes = len2 % 3;
      var parts = [];
      var maxChunkLength = 16383;
      for (var i2 = 0, len22 = len2 - extraBytes; i2 < len22; i2 += maxChunkLength) {
        parts.push(encodeChunk(uint8, i2, i2 + maxChunkLength > len22 ? len22 : i2 + maxChunkLength));
      }
      if (extraBytes === 1) {
        tmp = uint8[len2 - 1];
        parts.push(lookup[tmp >> 2] + lookup[tmp << 4 & 63] + "==");
      } else if (extraBytes === 2) {
        tmp = (uint8[len2 - 2] << 8) + uint8[len2 - 1];
        parts.push(lookup[tmp >> 10] + lookup[tmp >> 4 & 63] + lookup[tmp << 2 & 63] + "=");
      }
      return parts.join("");
    }
    return exports$2;
  }
  function dew$1() {
    if (_dewExec$1) return exports$1;
    _dewExec$1 = true;
    exports$1.read = function(buffer, offset, isLE, mLen, nBytes) {
      var e, m;
      var eLen = nBytes * 8 - mLen - 1;
      var eMax = (1 << eLen) - 1;
      var eBias = eMax >> 1;
      var nBits = -7;
      var i = isLE ? nBytes - 1 : 0;
      var d = isLE ? -1 : 1;
      var s = buffer[offset + i];
      i += d;
      e = s & (1 << -nBits) - 1;
      s >>= -nBits;
      nBits += eLen;
      for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {
      }
      m = e & (1 << -nBits) - 1;
      e >>= -nBits;
      nBits += mLen;
      for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {
      }
      if (e === 0) {
        e = 1 - eBias;
      } else if (e === eMax) {
        return m ? NaN : (s ? -1 : 1) * Infinity;
      } else {
        m = m + Math.pow(2, mLen);
        e = e - eBias;
      }
      return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
    };
    exports$1.write = function(buffer, value, offset, isLE, mLen, nBytes) {
      var e, m, c;
      var eLen = nBytes * 8 - mLen - 1;
      var eMax = (1 << eLen) - 1;
      var eBias = eMax >> 1;
      var rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
      var i = isLE ? 0 : nBytes - 1;
      var d = isLE ? 1 : -1;
      var s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
      value = Math.abs(value);
      if (isNaN(value) || value === Infinity) {
        m = isNaN(value) ? 1 : 0;
        e = eMax;
      } else {
        e = Math.floor(Math.log(value) / Math.LN2);
        if (value * (c = Math.pow(2, -e)) < 1) {
          e--;
          c *= 2;
        }
        if (e + eBias >= 1) {
          value += rt / c;
        } else {
          value += rt * Math.pow(2, 1 - eBias);
        }
        if (value * c >= 2) {
          e++;
          c /= 2;
        }
        if (e + eBias >= eMax) {
          m = 0;
          e = eMax;
        } else if (e + eBias >= 1) {
          m = (value * c - 1) * Math.pow(2, mLen);
          e = e + eBias;
        } else {
          m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
          e = 0;
        }
      }
      for (; mLen >= 8; buffer[offset + i] = m & 255, i += d, m /= 256, mLen -= 8) {
      }
      e = e << mLen | m;
      eLen += mLen;
      for (; eLen > 0; buffer[offset + i] = e & 255, i += d, e /= 256, eLen -= 8) {
      }
      buffer[offset + i - d] |= s * 128;
    };
    return exports$1;
  }
  function dew() {
    if (_dewExec) return exports;
    _dewExec = true;
    const base64 = dew$2();
    const ieee754 = dew$1();
    const customInspectSymbol = typeof Symbol === "function" && typeof Symbol["for"] === "function" ? Symbol["for"]("nodejs.util.inspect.custom") : null;
    exports.Buffer = Buffer3;
    exports.SlowBuffer = SlowBuffer;
    exports.INSPECT_MAX_BYTES = 50;
    const K_MAX_LENGTH = 2147483647;
    exports.kMaxLength = K_MAX_LENGTH;
    Buffer3.TYPED_ARRAY_SUPPORT = typedArraySupport();
    if (!Buffer3.TYPED_ARRAY_SUPPORT && typeof console !== "undefined" && typeof console.error === "function") {
      console.error("This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support.");
    }
    function typedArraySupport() {
      try {
        const arr = new Uint8Array(1);
        const proto = {
          foo: function() {
            return 42;
          }
        };
        Object.setPrototypeOf(proto, Uint8Array.prototype);
        Object.setPrototypeOf(arr, proto);
        return arr.foo() === 42;
      } catch (e) {
        return false;
      }
    }
    Object.defineProperty(Buffer3.prototype, "parent", {
      enumerable: true,
      get: function() {
        if (!Buffer3.isBuffer(this)) return void 0;
        return this.buffer;
      }
    });
    Object.defineProperty(Buffer3.prototype, "offset", {
      enumerable: true,
      get: function() {
        if (!Buffer3.isBuffer(this)) return void 0;
        return this.byteOffset;
      }
    });
    function createBuffer(length) {
      if (length > K_MAX_LENGTH) {
        throw new RangeError('The value "' + length + '" is invalid for option "size"');
      }
      const buf = new Uint8Array(length);
      Object.setPrototypeOf(buf, Buffer3.prototype);
      return buf;
    }
    function Buffer3(arg, encodingOrOffset, length) {
      if (typeof arg === "number") {
        if (typeof encodingOrOffset === "string") {
          throw new TypeError('The "string" argument must be of type string. Received type number');
        }
        return allocUnsafe(arg);
      }
      return from(arg, encodingOrOffset, length);
    }
    Buffer3.poolSize = 8192;
    function from(value, encodingOrOffset, length) {
      if (typeof value === "string") {
        return fromString(value, encodingOrOffset);
      }
      if (ArrayBuffer.isView(value)) {
        return fromArrayView(value);
      }
      if (value == null) {
        throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof value);
      }
      if (isInstance(value, ArrayBuffer) || value && isInstance(value.buffer, ArrayBuffer)) {
        return fromArrayBuffer(value, encodingOrOffset, length);
      }
      if (typeof SharedArrayBuffer !== "undefined" && (isInstance(value, SharedArrayBuffer) || value && isInstance(value.buffer, SharedArrayBuffer))) {
        return fromArrayBuffer(value, encodingOrOffset, length);
      }
      if (typeof value === "number") {
        throw new TypeError('The "value" argument must not be of type number. Received type number');
      }
      const valueOf = value.valueOf && value.valueOf();
      if (valueOf != null && valueOf !== value) {
        return Buffer3.from(valueOf, encodingOrOffset, length);
      }
      const b = fromObject(value);
      if (b) return b;
      if (typeof Symbol !== "undefined" && Symbol.toPrimitive != null && typeof value[Symbol.toPrimitive] === "function") {
        return Buffer3.from(value[Symbol.toPrimitive]("string"), encodingOrOffset, length);
      }
      throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof value);
    }
    Buffer3.from = function(value, encodingOrOffset, length) {
      return from(value, encodingOrOffset, length);
    };
    Object.setPrototypeOf(Buffer3.prototype, Uint8Array.prototype);
    Object.setPrototypeOf(Buffer3, Uint8Array);
    function assertSize(size) {
      if (typeof size !== "number") {
        throw new TypeError('"size" argument must be of type number');
      } else if (size < 0) {
        throw new RangeError('The value "' + size + '" is invalid for option "size"');
      }
    }
    function alloc(size, fill, encoding) {
      assertSize(size);
      if (size <= 0) {
        return createBuffer(size);
      }
      if (fill !== void 0) {
        return typeof encoding === "string" ? createBuffer(size).fill(fill, encoding) : createBuffer(size).fill(fill);
      }
      return createBuffer(size);
    }
    Buffer3.alloc = function(size, fill, encoding) {
      return alloc(size, fill, encoding);
    };
    function allocUnsafe(size) {
      assertSize(size);
      return createBuffer(size < 0 ? 0 : checked(size) | 0);
    }
    Buffer3.allocUnsafe = function(size) {
      return allocUnsafe(size);
    };
    Buffer3.allocUnsafeSlow = function(size) {
      return allocUnsafe(size);
    };
    function fromString(string, encoding) {
      if (typeof encoding !== "string" || encoding === "") {
        encoding = "utf8";
      }
      if (!Buffer3.isEncoding(encoding)) {
        throw new TypeError("Unknown encoding: " + encoding);
      }
      const length = byteLength(string, encoding) | 0;
      let buf = createBuffer(length);
      const actual = buf.write(string, encoding);
      if (actual !== length) {
        buf = buf.slice(0, actual);
      }
      return buf;
    }
    function fromArrayLike(array) {
      const length = array.length < 0 ? 0 : checked(array.length) | 0;
      const buf = createBuffer(length);
      for (let i = 0; i < length; i += 1) {
        buf[i] = array[i] & 255;
      }
      return buf;
    }
    function fromArrayView(arrayView) {
      if (isInstance(arrayView, Uint8Array)) {
        const copy = new Uint8Array(arrayView);
        return fromArrayBuffer(copy.buffer, copy.byteOffset, copy.byteLength);
      }
      return fromArrayLike(arrayView);
    }
    function fromArrayBuffer(array, byteOffset, length) {
      if (byteOffset < 0 || array.byteLength < byteOffset) {
        throw new RangeError('"offset" is outside of buffer bounds');
      }
      if (array.byteLength < byteOffset + (length || 0)) {
        throw new RangeError('"length" is outside of buffer bounds');
      }
      let buf;
      if (byteOffset === void 0 && length === void 0) {
        buf = new Uint8Array(array);
      } else if (length === void 0) {
        buf = new Uint8Array(array, byteOffset);
      } else {
        buf = new Uint8Array(array, byteOffset, length);
      }
      Object.setPrototypeOf(buf, Buffer3.prototype);
      return buf;
    }
    function fromObject(obj) {
      if (Buffer3.isBuffer(obj)) {
        const len = checked(obj.length) | 0;
        const buf = createBuffer(len);
        if (buf.length === 0) {
          return buf;
        }
        obj.copy(buf, 0, 0, len);
        return buf;
      }
      if (obj.length !== void 0) {
        if (typeof obj.length !== "number" || numberIsNaN(obj.length)) {
          return createBuffer(0);
        }
        return fromArrayLike(obj);
      }
      if (obj.type === "Buffer" && Array.isArray(obj.data)) {
        return fromArrayLike(obj.data);
      }
    }
    function checked(length) {
      if (length >= K_MAX_LENGTH) {
        throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + K_MAX_LENGTH.toString(16) + " bytes");
      }
      return length | 0;
    }
    function SlowBuffer(length) {
      if (+length != length) {
        length = 0;
      }
      return Buffer3.alloc(+length);
    }
    Buffer3.isBuffer = function isBuffer2(b) {
      return b != null && b._isBuffer === true && b !== Buffer3.prototype;
    };
    Buffer3.compare = function compare(a, b) {
      if (isInstance(a, Uint8Array)) a = Buffer3.from(a, a.offset, a.byteLength);
      if (isInstance(b, Uint8Array)) b = Buffer3.from(b, b.offset, b.byteLength);
      if (!Buffer3.isBuffer(a) || !Buffer3.isBuffer(b)) {
        throw new TypeError('The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array');
      }
      if (a === b) return 0;
      let x = a.length;
      let y = b.length;
      for (let i = 0, len = Math.min(x, y); i < len; ++i) {
        if (a[i] !== b[i]) {
          x = a[i];
          y = b[i];
          break;
        }
      }
      if (x < y) return -1;
      if (y < x) return 1;
      return 0;
    };
    Buffer3.isEncoding = function isEncoding(encoding) {
      switch (String(encoding).toLowerCase()) {
        case "hex":
        case "utf8":
        case "utf-8":
        case "ascii":
        case "latin1":
        case "binary":
        case "base64":
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return true;
        default:
          return false;
      }
    };
    Buffer3.concat = function concat(list, length) {
      if (!Array.isArray(list)) {
        throw new TypeError('"list" argument must be an Array of Buffers');
      }
      if (list.length === 0) {
        return Buffer3.alloc(0);
      }
      let i;
      if (length === void 0) {
        length = 0;
        for (i = 0; i < list.length; ++i) {
          length += list[i].length;
        }
      }
      const buffer = Buffer3.allocUnsafe(length);
      let pos = 0;
      for (i = 0; i < list.length; ++i) {
        let buf = list[i];
        if (isInstance(buf, Uint8Array)) {
          if (pos + buf.length > buffer.length) {
            if (!Buffer3.isBuffer(buf)) buf = Buffer3.from(buf);
            buf.copy(buffer, pos);
          } else {
            Uint8Array.prototype.set.call(buffer, buf, pos);
          }
        } else if (!Buffer3.isBuffer(buf)) {
          throw new TypeError('"list" argument must be an Array of Buffers');
        } else {
          buf.copy(buffer, pos);
        }
        pos += buf.length;
      }
      return buffer;
    };
    function byteLength(string, encoding) {
      if (Buffer3.isBuffer(string)) {
        return string.length;
      }
      if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
        return string.byteLength;
      }
      if (typeof string !== "string") {
        throw new TypeError('The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type ' + typeof string);
      }
      const len = string.length;
      const mustMatch = arguments.length > 2 && arguments[2] === true;
      if (!mustMatch && len === 0) return 0;
      let loweredCase = false;
      for (; ; ) {
        switch (encoding) {
          case "ascii":
          case "latin1":
          case "binary":
            return len;
          case "utf8":
          case "utf-8":
            return utf8ToBytes2(string).length;
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return len * 2;
          case "hex":
            return len >>> 1;
          case "base64":
            return base64ToBytes(string).length;
          default:
            if (loweredCase) {
              return mustMatch ? -1 : utf8ToBytes2(string).length;
            }
            encoding = ("" + encoding).toLowerCase();
            loweredCase = true;
        }
      }
    }
    Buffer3.byteLength = byteLength;
    function slowToString(encoding, start, end) {
      let loweredCase = false;
      if (start === void 0 || start < 0) {
        start = 0;
      }
      if (start > this.length) {
        return "";
      }
      if (end === void 0 || end > this.length) {
        end = this.length;
      }
      if (end <= 0) {
        return "";
      }
      end >>>= 0;
      start >>>= 0;
      if (end <= start) {
        return "";
      }
      if (!encoding) encoding = "utf8";
      while (true) {
        switch (encoding) {
          case "hex":
            return hexSlice(this, start, end);
          case "utf8":
          case "utf-8":
            return utf8Slice(this, start, end);
          case "ascii":
            return asciiSlice(this, start, end);
          case "latin1":
          case "binary":
            return latin1Slice(this, start, end);
          case "base64":
            return base64Slice(this, start, end);
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return utf16leSlice(this, start, end);
          default:
            if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
            encoding = (encoding + "").toLowerCase();
            loweredCase = true;
        }
      }
    }
    Buffer3.prototype._isBuffer = true;
    function swap(b, n, m) {
      const i = b[n];
      b[n] = b[m];
      b[m] = i;
    }
    Buffer3.prototype.swap16 = function swap16() {
      const len = this.length;
      if (len % 2 !== 0) {
        throw new RangeError("Buffer size must be a multiple of 16-bits");
      }
      for (let i = 0; i < len; i += 2) {
        swap(this, i, i + 1);
      }
      return this;
    };
    Buffer3.prototype.swap32 = function swap32() {
      const len = this.length;
      if (len % 4 !== 0) {
        throw new RangeError("Buffer size must be a multiple of 32-bits");
      }
      for (let i = 0; i < len; i += 4) {
        swap(this, i, i + 3);
        swap(this, i + 1, i + 2);
      }
      return this;
    };
    Buffer3.prototype.swap64 = function swap64() {
      const len = this.length;
      if (len % 8 !== 0) {
        throw new RangeError("Buffer size must be a multiple of 64-bits");
      }
      for (let i = 0; i < len; i += 8) {
        swap(this, i, i + 7);
        swap(this, i + 1, i + 6);
        swap(this, i + 2, i + 5);
        swap(this, i + 3, i + 4);
      }
      return this;
    };
    Buffer3.prototype.toString = function toString() {
      const length = this.length;
      if (length === 0) return "";
      if (arguments.length === 0) return utf8Slice(this, 0, length);
      return slowToString.apply(this, arguments);
    };
    Buffer3.prototype.toLocaleString = Buffer3.prototype.toString;
    Buffer3.prototype.equals = function equals(b) {
      if (!Buffer3.isBuffer(b)) throw new TypeError("Argument must be a Buffer");
      if (this === b) return true;
      return Buffer3.compare(this, b) === 0;
    };
    Buffer3.prototype.inspect = function inspect2() {
      let str = "";
      const max = exports.INSPECT_MAX_BYTES;
      str = this.toString("hex", 0, max).replace(/(.{2})/g, "$1 ").trim();
      if (this.length > max) str += " ... ";
      return "<Buffer " + str + ">";
    };
    if (customInspectSymbol) {
      Buffer3.prototype[customInspectSymbol] = Buffer3.prototype.inspect;
    }
    Buffer3.prototype.compare = function compare(target, start, end, thisStart, thisEnd) {
      if (isInstance(target, Uint8Array)) {
        target = Buffer3.from(target, target.offset, target.byteLength);
      }
      if (!Buffer3.isBuffer(target)) {
        throw new TypeError('The "target" argument must be one of type Buffer or Uint8Array. Received type ' + typeof target);
      }
      if (start === void 0) {
        start = 0;
      }
      if (end === void 0) {
        end = target ? target.length : 0;
      }
      if (thisStart === void 0) {
        thisStart = 0;
      }
      if (thisEnd === void 0) {
        thisEnd = this.length;
      }
      if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
        throw new RangeError("out of range index");
      }
      if (thisStart >= thisEnd && start >= end) {
        return 0;
      }
      if (thisStart >= thisEnd) {
        return -1;
      }
      if (start >= end) {
        return 1;
      }
      start >>>= 0;
      end >>>= 0;
      thisStart >>>= 0;
      thisEnd >>>= 0;
      if (this === target) return 0;
      let x = thisEnd - thisStart;
      let y = end - start;
      const len = Math.min(x, y);
      const thisCopy = this.slice(thisStart, thisEnd);
      const targetCopy = target.slice(start, end);
      for (let i = 0; i < len; ++i) {
        if (thisCopy[i] !== targetCopy[i]) {
          x = thisCopy[i];
          y = targetCopy[i];
          break;
        }
      }
      if (x < y) return -1;
      if (y < x) return 1;
      return 0;
    };
    function bidirectionalIndexOf(buffer, val, byteOffset, encoding, dir) {
      if (buffer.length === 0) return -1;
      if (typeof byteOffset === "string") {
        encoding = byteOffset;
        byteOffset = 0;
      } else if (byteOffset > 2147483647) {
        byteOffset = 2147483647;
      } else if (byteOffset < -2147483648) {
        byteOffset = -2147483648;
      }
      byteOffset = +byteOffset;
      if (numberIsNaN(byteOffset)) {
        byteOffset = dir ? 0 : buffer.length - 1;
      }
      if (byteOffset < 0) byteOffset = buffer.length + byteOffset;
      if (byteOffset >= buffer.length) {
        if (dir) return -1;
        else byteOffset = buffer.length - 1;
      } else if (byteOffset < 0) {
        if (dir) byteOffset = 0;
        else return -1;
      }
      if (typeof val === "string") {
        val = Buffer3.from(val, encoding);
      }
      if (Buffer3.isBuffer(val)) {
        if (val.length === 0) {
          return -1;
        }
        return arrayIndexOf(buffer, val, byteOffset, encoding, dir);
      } else if (typeof val === "number") {
        val = val & 255;
        if (typeof Uint8Array.prototype.indexOf === "function") {
          if (dir) {
            return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset);
          } else {
            return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset);
          }
        }
        return arrayIndexOf(buffer, [val], byteOffset, encoding, dir);
      }
      throw new TypeError("val must be string, number or Buffer");
    }
    function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
      let indexSize = 1;
      let arrLength = arr.length;
      let valLength = val.length;
      if (encoding !== void 0) {
        encoding = String(encoding).toLowerCase();
        if (encoding === "ucs2" || encoding === "ucs-2" || encoding === "utf16le" || encoding === "utf-16le") {
          if (arr.length < 2 || val.length < 2) {
            return -1;
          }
          indexSize = 2;
          arrLength /= 2;
          valLength /= 2;
          byteOffset /= 2;
        }
      }
      function read(buf, i2) {
        if (indexSize === 1) {
          return buf[i2];
        } else {
          return buf.readUInt16BE(i2 * indexSize);
        }
      }
      let i;
      if (dir) {
        let foundIndex = -1;
        for (i = byteOffset; i < arrLength; i++) {
          if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
            if (foundIndex === -1) foundIndex = i;
            if (i - foundIndex + 1 === valLength) return foundIndex * indexSize;
          } else {
            if (foundIndex !== -1) i -= i - foundIndex;
            foundIndex = -1;
          }
        }
      } else {
        if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;
        for (i = byteOffset; i >= 0; i--) {
          let found = true;
          for (let j = 0; j < valLength; j++) {
            if (read(arr, i + j) !== read(val, j)) {
              found = false;
              break;
            }
          }
          if (found) return i;
        }
      }
      return -1;
    }
    Buffer3.prototype.includes = function includes(val, byteOffset, encoding) {
      return this.indexOf(val, byteOffset, encoding) !== -1;
    };
    Buffer3.prototype.indexOf = function indexOf(val, byteOffset, encoding) {
      return bidirectionalIndexOf(this, val, byteOffset, encoding, true);
    };
    Buffer3.prototype.lastIndexOf = function lastIndexOf(val, byteOffset, encoding) {
      return bidirectionalIndexOf(this, val, byteOffset, encoding, false);
    };
    function hexWrite(buf, string, offset, length) {
      offset = Number(offset) || 0;
      const remaining = buf.length - offset;
      if (!length) {
        length = remaining;
      } else {
        length = Number(length);
        if (length > remaining) {
          length = remaining;
        }
      }
      const strLen = string.length;
      if (length > strLen / 2) {
        length = strLen / 2;
      }
      let i;
      for (i = 0; i < length; ++i) {
        const parsed = parseInt(string.substr(i * 2, 2), 16);
        if (numberIsNaN(parsed)) return i;
        buf[offset + i] = parsed;
      }
      return i;
    }
    function utf8Write(buf, string, offset, length) {
      return blitBuffer(utf8ToBytes2(string, buf.length - offset), buf, offset, length);
    }
    function asciiWrite(buf, string, offset, length) {
      return blitBuffer(asciiToBytes(string), buf, offset, length);
    }
    function base64Write(buf, string, offset, length) {
      return blitBuffer(base64ToBytes(string), buf, offset, length);
    }
    function ucs2Write(buf, string, offset, length) {
      return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length);
    }
    Buffer3.prototype.write = function write(string, offset, length, encoding) {
      if (offset === void 0) {
        encoding = "utf8";
        length = this.length;
        offset = 0;
      } else if (length === void 0 && typeof offset === "string") {
        encoding = offset;
        length = this.length;
        offset = 0;
      } else if (isFinite(offset)) {
        offset = offset >>> 0;
        if (isFinite(length)) {
          length = length >>> 0;
          if (encoding === void 0) encoding = "utf8";
        } else {
          encoding = length;
          length = void 0;
        }
      } else {
        throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");
      }
      const remaining = this.length - offset;
      if (length === void 0 || length > remaining) length = remaining;
      if (string.length > 0 && (length < 0 || offset < 0) || offset > this.length) {
        throw new RangeError("Attempt to write outside buffer bounds");
      }
      if (!encoding) encoding = "utf8";
      let loweredCase = false;
      for (; ; ) {
        switch (encoding) {
          case "hex":
            return hexWrite(this, string, offset, length);
          case "utf8":
          case "utf-8":
            return utf8Write(this, string, offset, length);
          case "ascii":
          case "latin1":
          case "binary":
            return asciiWrite(this, string, offset, length);
          case "base64":
            return base64Write(this, string, offset, length);
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return ucs2Write(this, string, offset, length);
          default:
            if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
            encoding = ("" + encoding).toLowerCase();
            loweredCase = true;
        }
      }
    };
    Buffer3.prototype.toJSON = function toJSON() {
      return {
        type: "Buffer",
        data: Array.prototype.slice.call(this._arr || this, 0)
      };
    };
    function base64Slice(buf, start, end) {
      if (start === 0 && end === buf.length) {
        return base64.fromByteArray(buf);
      } else {
        return base64.fromByteArray(buf.slice(start, end));
      }
    }
    function utf8Slice(buf, start, end) {
      end = Math.min(buf.length, end);
      const res = [];
      let i = start;
      while (i < end) {
        const firstByte = buf[i];
        let codePoint = null;
        let bytesPerSequence = firstByte > 239 ? 4 : firstByte > 223 ? 3 : firstByte > 191 ? 2 : 1;
        if (i + bytesPerSequence <= end) {
          let secondByte, thirdByte, fourthByte, tempCodePoint;
          switch (bytesPerSequence) {
            case 1:
              if (firstByte < 128) {
                codePoint = firstByte;
              }
              break;
            case 2:
              secondByte = buf[i + 1];
              if ((secondByte & 192) === 128) {
                tempCodePoint = (firstByte & 31) << 6 | secondByte & 63;
                if (tempCodePoint > 127) {
                  codePoint = tempCodePoint;
                }
              }
              break;
            case 3:
              secondByte = buf[i + 1];
              thirdByte = buf[i + 2];
              if ((secondByte & 192) === 128 && (thirdByte & 192) === 128) {
                tempCodePoint = (firstByte & 15) << 12 | (secondByte & 63) << 6 | thirdByte & 63;
                if (tempCodePoint > 2047 && (tempCodePoint < 55296 || tempCodePoint > 57343)) {
                  codePoint = tempCodePoint;
                }
              }
              break;
            case 4:
              secondByte = buf[i + 1];
              thirdByte = buf[i + 2];
              fourthByte = buf[i + 3];
              if ((secondByte & 192) === 128 && (thirdByte & 192) === 128 && (fourthByte & 192) === 128) {
                tempCodePoint = (firstByte & 15) << 18 | (secondByte & 63) << 12 | (thirdByte & 63) << 6 | fourthByte & 63;
                if (tempCodePoint > 65535 && tempCodePoint < 1114112) {
                  codePoint = tempCodePoint;
                }
              }
          }
        }
        if (codePoint === null) {
          codePoint = 65533;
          bytesPerSequence = 1;
        } else if (codePoint > 65535) {
          codePoint -= 65536;
          res.push(codePoint >>> 10 & 1023 | 55296);
          codePoint = 56320 | codePoint & 1023;
        }
        res.push(codePoint);
        i += bytesPerSequence;
      }
      return decodeCodePointsArray(res);
    }
    const MAX_ARGUMENTS_LENGTH = 4096;
    function decodeCodePointsArray(codePoints) {
      const len = codePoints.length;
      if (len <= MAX_ARGUMENTS_LENGTH) {
        return String.fromCharCode.apply(String, codePoints);
      }
      let res = "";
      let i = 0;
      while (i < len) {
        res += String.fromCharCode.apply(String, codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH));
      }
      return res;
    }
    function asciiSlice(buf, start, end) {
      let ret = "";
      end = Math.min(buf.length, end);
      for (let i = start; i < end; ++i) {
        ret += String.fromCharCode(buf[i] & 127);
      }
      return ret;
    }
    function latin1Slice(buf, start, end) {
      let ret = "";
      end = Math.min(buf.length, end);
      for (let i = start; i < end; ++i) {
        ret += String.fromCharCode(buf[i]);
      }
      return ret;
    }
    function hexSlice(buf, start, end) {
      const len = buf.length;
      if (!start || start < 0) start = 0;
      if (!end || end < 0 || end > len) end = len;
      let out = "";
      for (let i = start; i < end; ++i) {
        out += hexSliceLookupTable[buf[i]];
      }
      return out;
    }
    function utf16leSlice(buf, start, end) {
      const bytes = buf.slice(start, end);
      let res = "";
      for (let i = 0; i < bytes.length - 1; i += 2) {
        res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
      }
      return res;
    }
    Buffer3.prototype.slice = function slice(start, end) {
      const len = this.length;
      start = ~~start;
      end = end === void 0 ? len : ~~end;
      if (start < 0) {
        start += len;
        if (start < 0) start = 0;
      } else if (start > len) {
        start = len;
      }
      if (end < 0) {
        end += len;
        if (end < 0) end = 0;
      } else if (end > len) {
        end = len;
      }
      if (end < start) end = start;
      const newBuf = this.subarray(start, end);
      Object.setPrototypeOf(newBuf, Buffer3.prototype);
      return newBuf;
    };
    function checkOffset(offset, ext, length) {
      if (offset % 1 !== 0 || offset < 0) throw new RangeError("offset is not uint");
      if (offset + ext > length) throw new RangeError("Trying to access beyond buffer length");
    }
    Buffer3.prototype.readUintLE = Buffer3.prototype.readUIntLE = function readUIntLE(offset, byteLength2, noAssert) {
      offset = offset >>> 0;
      byteLength2 = byteLength2 >>> 0;
      if (!noAssert) checkOffset(offset, byteLength2, this.length);
      let val = this[offset];
      let mul = 1;
      let i = 0;
      while (++i < byteLength2 && (mul *= 256)) {
        val += this[offset + i] * mul;
      }
      return val;
    };
    Buffer3.prototype.readUintBE = Buffer3.prototype.readUIntBE = function readUIntBE(offset, byteLength2, noAssert) {
      offset = offset >>> 0;
      byteLength2 = byteLength2 >>> 0;
      if (!noAssert) {
        checkOffset(offset, byteLength2, this.length);
      }
      let val = this[offset + --byteLength2];
      let mul = 1;
      while (byteLength2 > 0 && (mul *= 256)) {
        val += this[offset + --byteLength2] * mul;
      }
      return val;
    };
    Buffer3.prototype.readUint8 = Buffer3.prototype.readUInt8 = function readUInt8(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 1, this.length);
      return this[offset];
    };
    Buffer3.prototype.readUint16LE = Buffer3.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 2, this.length);
      return this[offset] | this[offset + 1] << 8;
    };
    Buffer3.prototype.readUint16BE = Buffer3.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 2, this.length);
      return this[offset] << 8 | this[offset + 1];
    };
    Buffer3.prototype.readUint32LE = Buffer3.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 4, this.length);
      return (this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16) + this[offset + 3] * 16777216;
    };
    Buffer3.prototype.readUint32BE = Buffer3.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 4, this.length);
      return this[offset] * 16777216 + (this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3]);
    };
    Buffer3.prototype.readBigUInt64LE = defineBigIntMethod(function readBigUInt64LE(offset) {
      offset = offset >>> 0;
      validateNumber(offset, "offset");
      const first = this[offset];
      const last = this[offset + 7];
      if (first === void 0 || last === void 0) {
        boundsError(offset, this.length - 8);
      }
      const lo = first + this[++offset] * 2 ** 8 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 24;
      const hi = this[++offset] + this[++offset] * 2 ** 8 + this[++offset] * 2 ** 16 + last * 2 ** 24;
      return BigInt(lo) + (BigInt(hi) << BigInt(32));
    });
    Buffer3.prototype.readBigUInt64BE = defineBigIntMethod(function readBigUInt64BE(offset) {
      offset = offset >>> 0;
      validateNumber(offset, "offset");
      const first = this[offset];
      const last = this[offset + 7];
      if (first === void 0 || last === void 0) {
        boundsError(offset, this.length - 8);
      }
      const hi = first * 2 ** 24 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + this[++offset];
      const lo = this[++offset] * 2 ** 24 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + last;
      return (BigInt(hi) << BigInt(32)) + BigInt(lo);
    });
    Buffer3.prototype.readIntLE = function readIntLE(offset, byteLength2, noAssert) {
      offset = offset >>> 0;
      byteLength2 = byteLength2 >>> 0;
      if (!noAssert) checkOffset(offset, byteLength2, this.length);
      let val = this[offset];
      let mul = 1;
      let i = 0;
      while (++i < byteLength2 && (mul *= 256)) {
        val += this[offset + i] * mul;
      }
      mul *= 128;
      if (val >= mul) val -= Math.pow(2, 8 * byteLength2);
      return val;
    };
    Buffer3.prototype.readIntBE = function readIntBE(offset, byteLength2, noAssert) {
      offset = offset >>> 0;
      byteLength2 = byteLength2 >>> 0;
      if (!noAssert) checkOffset(offset, byteLength2, this.length);
      let i = byteLength2;
      let mul = 1;
      let val = this[offset + --i];
      while (i > 0 && (mul *= 256)) {
        val += this[offset + --i] * mul;
      }
      mul *= 128;
      if (val >= mul) val -= Math.pow(2, 8 * byteLength2);
      return val;
    };
    Buffer3.prototype.readInt8 = function readInt8(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 1, this.length);
      if (!(this[offset] & 128)) return this[offset];
      return (255 - this[offset] + 1) * -1;
    };
    Buffer3.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 2, this.length);
      const val = this[offset] | this[offset + 1] << 8;
      return val & 32768 ? val | 4294901760 : val;
    };
    Buffer3.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 2, this.length);
      const val = this[offset + 1] | this[offset] << 8;
      return val & 32768 ? val | 4294901760 : val;
    };
    Buffer3.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 4, this.length);
      return this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16 | this[offset + 3] << 24;
    };
    Buffer3.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 4, this.length);
      return this[offset] << 24 | this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3];
    };
    Buffer3.prototype.readBigInt64LE = defineBigIntMethod(function readBigInt64LE(offset) {
      offset = offset >>> 0;
      validateNumber(offset, "offset");
      const first = this[offset];
      const last = this[offset + 7];
      if (first === void 0 || last === void 0) {
        boundsError(offset, this.length - 8);
      }
      const val = this[offset + 4] + this[offset + 5] * 2 ** 8 + this[offset + 6] * 2 ** 16 + (last << 24);
      return (BigInt(val) << BigInt(32)) + BigInt(first + this[++offset] * 2 ** 8 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 24);
    });
    Buffer3.prototype.readBigInt64BE = defineBigIntMethod(function readBigInt64BE(offset) {
      offset = offset >>> 0;
      validateNumber(offset, "offset");
      const first = this[offset];
      const last = this[offset + 7];
      if (first === void 0 || last === void 0) {
        boundsError(offset, this.length - 8);
      }
      const val = (first << 24) + // Overflow
      this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + this[++offset];
      return (BigInt(val) << BigInt(32)) + BigInt(this[++offset] * 2 ** 24 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + last);
    });
    Buffer3.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 4, this.length);
      return ieee754.read(this, offset, true, 23, 4);
    };
    Buffer3.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 4, this.length);
      return ieee754.read(this, offset, false, 23, 4);
    };
    Buffer3.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 8, this.length);
      return ieee754.read(this, offset, true, 52, 8);
    };
    Buffer3.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 8, this.length);
      return ieee754.read(this, offset, false, 52, 8);
    };
    function checkInt(buf, value, offset, ext, max, min) {
      if (!Buffer3.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance');
      if (value > max || value < min) throw new RangeError('"value" argument is out of bounds');
      if (offset + ext > buf.length) throw new RangeError("Index out of range");
    }
    Buffer3.prototype.writeUintLE = Buffer3.prototype.writeUIntLE = function writeUIntLE(value, offset, byteLength2, noAssert) {
      value = +value;
      offset = offset >>> 0;
      byteLength2 = byteLength2 >>> 0;
      if (!noAssert) {
        const maxBytes = Math.pow(2, 8 * byteLength2) - 1;
        checkInt(this, value, offset, byteLength2, maxBytes, 0);
      }
      let mul = 1;
      let i = 0;
      this[offset] = value & 255;
      while (++i < byteLength2 && (mul *= 256)) {
        this[offset + i] = value / mul & 255;
      }
      return offset + byteLength2;
    };
    Buffer3.prototype.writeUintBE = Buffer3.prototype.writeUIntBE = function writeUIntBE(value, offset, byteLength2, noAssert) {
      value = +value;
      offset = offset >>> 0;
      byteLength2 = byteLength2 >>> 0;
      if (!noAssert) {
        const maxBytes = Math.pow(2, 8 * byteLength2) - 1;
        checkInt(this, value, offset, byteLength2, maxBytes, 0);
      }
      let i = byteLength2 - 1;
      let mul = 1;
      this[offset + i] = value & 255;
      while (--i >= 0 && (mul *= 256)) {
        this[offset + i] = value / mul & 255;
      }
      return offset + byteLength2;
    };
    Buffer3.prototype.writeUint8 = Buffer3.prototype.writeUInt8 = function writeUInt8(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value, offset, 1, 255, 0);
      this[offset] = value & 255;
      return offset + 1;
    };
    Buffer3.prototype.writeUint16LE = Buffer3.prototype.writeUInt16LE = function writeUInt16LE(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value, offset, 2, 65535, 0);
      this[offset] = value & 255;
      this[offset + 1] = value >>> 8;
      return offset + 2;
    };
    Buffer3.prototype.writeUint16BE = Buffer3.prototype.writeUInt16BE = function writeUInt16BE(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value, offset, 2, 65535, 0);
      this[offset] = value >>> 8;
      this[offset + 1] = value & 255;
      return offset + 2;
    };
    Buffer3.prototype.writeUint32LE = Buffer3.prototype.writeUInt32LE = function writeUInt32LE(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value, offset, 4, 4294967295, 0);
      this[offset + 3] = value >>> 24;
      this[offset + 2] = value >>> 16;
      this[offset + 1] = value >>> 8;
      this[offset] = value & 255;
      return offset + 4;
    };
    Buffer3.prototype.writeUint32BE = Buffer3.prototype.writeUInt32BE = function writeUInt32BE(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value, offset, 4, 4294967295, 0);
      this[offset] = value >>> 24;
      this[offset + 1] = value >>> 16;
      this[offset + 2] = value >>> 8;
      this[offset + 3] = value & 255;
      return offset + 4;
    };
    function wrtBigUInt64LE(buf, value, offset, min, max) {
      checkIntBI(value, min, max, buf, offset, 7);
      let lo = Number(value & BigInt(4294967295));
      buf[offset++] = lo;
      lo = lo >> 8;
      buf[offset++] = lo;
      lo = lo >> 8;
      buf[offset++] = lo;
      lo = lo >> 8;
      buf[offset++] = lo;
      let hi = Number(value >> BigInt(32) & BigInt(4294967295));
      buf[offset++] = hi;
      hi = hi >> 8;
      buf[offset++] = hi;
      hi = hi >> 8;
      buf[offset++] = hi;
      hi = hi >> 8;
      buf[offset++] = hi;
      return offset;
    }
    function wrtBigUInt64BE(buf, value, offset, min, max) {
      checkIntBI(value, min, max, buf, offset, 7);
      let lo = Number(value & BigInt(4294967295));
      buf[offset + 7] = lo;
      lo = lo >> 8;
      buf[offset + 6] = lo;
      lo = lo >> 8;
      buf[offset + 5] = lo;
      lo = lo >> 8;
      buf[offset + 4] = lo;
      let hi = Number(value >> BigInt(32) & BigInt(4294967295));
      buf[offset + 3] = hi;
      hi = hi >> 8;
      buf[offset + 2] = hi;
      hi = hi >> 8;
      buf[offset + 1] = hi;
      hi = hi >> 8;
      buf[offset] = hi;
      return offset + 8;
    }
    Buffer3.prototype.writeBigUInt64LE = defineBigIntMethod(function writeBigUInt64LE(value, offset = 0) {
      return wrtBigUInt64LE(this, value, offset, BigInt(0), BigInt("0xffffffffffffffff"));
    });
    Buffer3.prototype.writeBigUInt64BE = defineBigIntMethod(function writeBigUInt64BE(value, offset = 0) {
      return wrtBigUInt64BE(this, value, offset, BigInt(0), BigInt("0xffffffffffffffff"));
    });
    Buffer3.prototype.writeIntLE = function writeIntLE(value, offset, byteLength2, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) {
        const limit = Math.pow(2, 8 * byteLength2 - 1);
        checkInt(this, value, offset, byteLength2, limit - 1, -limit);
      }
      let i = 0;
      let mul = 1;
      let sub = 0;
      this[offset] = value & 255;
      while (++i < byteLength2 && (mul *= 256)) {
        if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
          sub = 1;
        }
        this[offset + i] = (value / mul >> 0) - sub & 255;
      }
      return offset + byteLength2;
    };
    Buffer3.prototype.writeIntBE = function writeIntBE(value, offset, byteLength2, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) {
        const limit = Math.pow(2, 8 * byteLength2 - 1);
        checkInt(this, value, offset, byteLength2, limit - 1, -limit);
      }
      let i = byteLength2 - 1;
      let mul = 1;
      let sub = 0;
      this[offset + i] = value & 255;
      while (--i >= 0 && (mul *= 256)) {
        if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
          sub = 1;
        }
        this[offset + i] = (value / mul >> 0) - sub & 255;
      }
      return offset + byteLength2;
    };
    Buffer3.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value, offset, 1, 127, -128);
      if (value < 0) value = 255 + value + 1;
      this[offset] = value & 255;
      return offset + 1;
    };
    Buffer3.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value, offset, 2, 32767, -32768);
      this[offset] = value & 255;
      this[offset + 1] = value >>> 8;
      return offset + 2;
    };
    Buffer3.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value, offset, 2, 32767, -32768);
      this[offset] = value >>> 8;
      this[offset + 1] = value & 255;
      return offset + 2;
    };
    Buffer3.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value, offset, 4, 2147483647, -2147483648);
      this[offset] = value & 255;
      this[offset + 1] = value >>> 8;
      this[offset + 2] = value >>> 16;
      this[offset + 3] = value >>> 24;
      return offset + 4;
    };
    Buffer3.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value, offset, 4, 2147483647, -2147483648);
      if (value < 0) value = 4294967295 + value + 1;
      this[offset] = value >>> 24;
      this[offset + 1] = value >>> 16;
      this[offset + 2] = value >>> 8;
      this[offset + 3] = value & 255;
      return offset + 4;
    };
    Buffer3.prototype.writeBigInt64LE = defineBigIntMethod(function writeBigInt64LE(value, offset = 0) {
      return wrtBigUInt64LE(this, value, offset, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
    });
    Buffer3.prototype.writeBigInt64BE = defineBigIntMethod(function writeBigInt64BE(value, offset = 0) {
      return wrtBigUInt64BE(this, value, offset, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
    });
    function checkIEEE754(buf, value, offset, ext, max, min) {
      if (offset + ext > buf.length) throw new RangeError("Index out of range");
      if (offset < 0) throw new RangeError("Index out of range");
    }
    function writeFloat(buf, value, offset, littleEndian, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) {
        checkIEEE754(buf, value, offset, 4);
      }
      ieee754.write(buf, value, offset, littleEndian, 23, 4);
      return offset + 4;
    }
    Buffer3.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
      return writeFloat(this, value, offset, true, noAssert);
    };
    Buffer3.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
      return writeFloat(this, value, offset, false, noAssert);
    };
    function writeDouble(buf, value, offset, littleEndian, noAssert) {
      value = +value;
      offset = offset >>> 0;
      if (!noAssert) {
        checkIEEE754(buf, value, offset, 8);
      }
      ieee754.write(buf, value, offset, littleEndian, 52, 8);
      return offset + 8;
    }
    Buffer3.prototype.writeDoubleLE = function writeDoubleLE(value, offset, noAssert) {
      return writeDouble(this, value, offset, true, noAssert);
    };
    Buffer3.prototype.writeDoubleBE = function writeDoubleBE(value, offset, noAssert) {
      return writeDouble(this, value, offset, false, noAssert);
    };
    Buffer3.prototype.copy = function copy(target, targetStart, start, end) {
      if (!Buffer3.isBuffer(target)) throw new TypeError("argument should be a Buffer");
      if (!start) start = 0;
      if (!end && end !== 0) end = this.length;
      if (targetStart >= target.length) targetStart = target.length;
      if (!targetStart) targetStart = 0;
      if (end > 0 && end < start) end = start;
      if (end === start) return 0;
      if (target.length === 0 || this.length === 0) return 0;
      if (targetStart < 0) {
        throw new RangeError("targetStart out of bounds");
      }
      if (start < 0 || start >= this.length) throw new RangeError("Index out of range");
      if (end < 0) throw new RangeError("sourceEnd out of bounds");
      if (end > this.length) end = this.length;
      if (target.length - targetStart < end - start) {
        end = target.length - targetStart + start;
      }
      const len = end - start;
      if (this === target && typeof Uint8Array.prototype.copyWithin === "function") {
        this.copyWithin(targetStart, start, end);
      } else {
        Uint8Array.prototype.set.call(target, this.subarray(start, end), targetStart);
      }
      return len;
    };
    Buffer3.prototype.fill = function fill(val, start, end, encoding) {
      if (typeof val === "string") {
        if (typeof start === "string") {
          encoding = start;
          start = 0;
          end = this.length;
        } else if (typeof end === "string") {
          encoding = end;
          end = this.length;
        }
        if (encoding !== void 0 && typeof encoding !== "string") {
          throw new TypeError("encoding must be a string");
        }
        if (typeof encoding === "string" && !Buffer3.isEncoding(encoding)) {
          throw new TypeError("Unknown encoding: " + encoding);
        }
        if (val.length === 1) {
          const code = val.charCodeAt(0);
          if (encoding === "utf8" && code < 128 || encoding === "latin1") {
            val = code;
          }
        }
      } else if (typeof val === "number") {
        val = val & 255;
      } else if (typeof val === "boolean") {
        val = Number(val);
      }
      if (start < 0 || this.length < start || this.length < end) {
        throw new RangeError("Out of range index");
      }
      if (end <= start) {
        return this;
      }
      start = start >>> 0;
      end = end === void 0 ? this.length : end >>> 0;
      if (!val) val = 0;
      let i;
      if (typeof val === "number") {
        for (i = start; i < end; ++i) {
          this[i] = val;
        }
      } else {
        const bytes = Buffer3.isBuffer(val) ? val : Buffer3.from(val, encoding);
        const len = bytes.length;
        if (len === 0) {
          throw new TypeError('The value "' + val + '" is invalid for argument "value"');
        }
        for (i = 0; i < end - start; ++i) {
          this[i + start] = bytes[i % len];
        }
      }
      return this;
    };
    const errors = {};
    function E(sym, getMessage, Base) {
      errors[sym] = class NodeError extends Base {
        constructor() {
          super();
          Object.defineProperty(this, "message", {
            value: getMessage.apply(this, arguments),
            writable: true,
            configurable: true
          });
          this.name = `${this.name} [${sym}]`;
          this.stack;
          delete this.name;
        }
        get code() {
          return sym;
        }
        set code(value) {
          Object.defineProperty(this, "code", {
            configurable: true,
            enumerable: true,
            value,
            writable: true
          });
        }
        toString() {
          return `${this.name} [${sym}]: ${this.message}`;
        }
      };
    }
    E("ERR_BUFFER_OUT_OF_BOUNDS", function(name) {
      if (name) {
        return `${name} is outside of buffer bounds`;
      }
      return "Attempt to access memory outside buffer bounds";
    }, RangeError);
    E("ERR_INVALID_ARG_TYPE", function(name, actual) {
      return `The "${name}" argument must be of type number. Received type ${typeof actual}`;
    }, TypeError);
    E("ERR_OUT_OF_RANGE", function(str, range, input) {
      let msg = `The value of "${str}" is out of range.`;
      let received = input;
      if (Number.isInteger(input) && Math.abs(input) > 2 ** 32) {
        received = addNumericalSeparator(String(input));
      } else if (typeof input === "bigint") {
        received = String(input);
        if (input > BigInt(2) ** BigInt(32) || input < -(BigInt(2) ** BigInt(32))) {
          received = addNumericalSeparator(received);
        }
        received += "n";
      }
      msg += ` It must be ${range}. Received ${received}`;
      return msg;
    }, RangeError);
    function addNumericalSeparator(val) {
      let res = "";
      let i = val.length;
      const start = val[0] === "-" ? 1 : 0;
      for (; i >= start + 4; i -= 3) {
        res = `_${val.slice(i - 3, i)}${res}`;
      }
      return `${val.slice(0, i)}${res}`;
    }
    function checkBounds(buf, offset, byteLength2) {
      validateNumber(offset, "offset");
      if (buf[offset] === void 0 || buf[offset + byteLength2] === void 0) {
        boundsError(offset, buf.length - (byteLength2 + 1));
      }
    }
    function checkIntBI(value, min, max, buf, offset, byteLength2) {
      if (value > max || value < min) {
        const n = typeof min === "bigint" ? "n" : "";
        let range;
        {
          if (min === 0 || min === BigInt(0)) {
            range = `>= 0${n} and < 2${n} ** ${(byteLength2 + 1) * 8}${n}`;
          } else {
            range = `>= -(2${n} ** ${(byteLength2 + 1) * 8 - 1}${n}) and < 2 ** ${(byteLength2 + 1) * 8 - 1}${n}`;
          }
        }
        throw new errors.ERR_OUT_OF_RANGE("value", range, value);
      }
      checkBounds(buf, offset, byteLength2);
    }
    function validateNumber(value, name) {
      if (typeof value !== "number") {
        throw new errors.ERR_INVALID_ARG_TYPE(name, "number", value);
      }
    }
    function boundsError(value, length, type) {
      if (Math.floor(value) !== value) {
        validateNumber(value, type);
        throw new errors.ERR_OUT_OF_RANGE("offset", "an integer", value);
      }
      if (length < 0) {
        throw new errors.ERR_BUFFER_OUT_OF_BOUNDS();
      }
      throw new errors.ERR_OUT_OF_RANGE("offset", `>= ${0} and <= ${length}`, value);
    }
    const INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g;
    function base64clean(str) {
      str = str.split("=")[0];
      str = str.trim().replace(INVALID_BASE64_RE, "");
      if (str.length < 2) return "";
      while (str.length % 4 !== 0) {
        str = str + "=";
      }
      return str;
    }
    function utf8ToBytes2(string, units) {
      units = units || Infinity;
      let codePoint;
      const length = string.length;
      let leadSurrogate = null;
      const bytes = [];
      for (let i = 0; i < length; ++i) {
        codePoint = string.charCodeAt(i);
        if (codePoint > 55295 && codePoint < 57344) {
          if (!leadSurrogate) {
            if (codePoint > 56319) {
              if ((units -= 3) > -1) bytes.push(239, 191, 189);
              continue;
            } else if (i + 1 === length) {
              if ((units -= 3) > -1) bytes.push(239, 191, 189);
              continue;
            }
            leadSurrogate = codePoint;
            continue;
          }
          if (codePoint < 56320) {
            if ((units -= 3) > -1) bytes.push(239, 191, 189);
            leadSurrogate = codePoint;
            continue;
          }
          codePoint = (leadSurrogate - 55296 << 10 | codePoint - 56320) + 65536;
        } else if (leadSurrogate) {
          if ((units -= 3) > -1) bytes.push(239, 191, 189);
        }
        leadSurrogate = null;
        if (codePoint < 128) {
          if ((units -= 1) < 0) break;
          bytes.push(codePoint);
        } else if (codePoint < 2048) {
          if ((units -= 2) < 0) break;
          bytes.push(codePoint >> 6 | 192, codePoint & 63 | 128);
        } else if (codePoint < 65536) {
          if ((units -= 3) < 0) break;
          bytes.push(codePoint >> 12 | 224, codePoint >> 6 & 63 | 128, codePoint & 63 | 128);
        } else if (codePoint < 1114112) {
          if ((units -= 4) < 0) break;
          bytes.push(codePoint >> 18 | 240, codePoint >> 12 & 63 | 128, codePoint >> 6 & 63 | 128, codePoint & 63 | 128);
        } else {
          throw new Error("Invalid code point");
        }
      }
      return bytes;
    }
    function asciiToBytes(str) {
      const byteArray = [];
      for (let i = 0; i < str.length; ++i) {
        byteArray.push(str.charCodeAt(i) & 255);
      }
      return byteArray;
    }
    function utf16leToBytes(str, units) {
      let c, hi, lo;
      const byteArray = [];
      for (let i = 0; i < str.length; ++i) {
        if ((units -= 2) < 0) break;
        c = str.charCodeAt(i);
        hi = c >> 8;
        lo = c % 256;
        byteArray.push(lo);
        byteArray.push(hi);
      }
      return byteArray;
    }
    function base64ToBytes(str) {
      return base64.toByteArray(base64clean(str));
    }
    function blitBuffer(src, dst, offset, length) {
      let i;
      for (i = 0; i < length; ++i) {
        if (i + offset >= dst.length || i >= src.length) break;
        dst[i + offset] = src[i];
      }
      return i;
    }
    function isInstance(obj, type) {
      return obj instanceof type || obj != null && obj.constructor != null && obj.constructor.name != null && obj.constructor.name === type.name;
    }
    function numberIsNaN(obj) {
      return obj !== obj;
    }
    const hexSliceLookupTable = (function() {
      const alphabet = "0123456789abcdef";
      const table = new Array(256);
      for (let i = 0; i < 16; ++i) {
        const i16 = i * 16;
        for (let j = 0; j < 16; ++j) {
          table[i16 + j] = alphabet[i] + alphabet[j];
        }
      }
      return table;
    })();
    function defineBigIntMethod(fn) {
      return typeof BigInt === "undefined" ? BufferBigIntNotDefined : fn;
    }
    function BufferBigIntNotDefined() {
      throw new Error("BigInt not supported");
    }
    return exports;
  }
  var exports$2, _dewExec$2, exports$1, _dewExec$1, exports, _dewExec;
  var init_chunk_DtuTasat = __esm({
    "node_modules/@jspm/core/nodelibs/browser/chunk-DtuTasat.js"() {
      init_dirname();
      init_buffer2();
      init_process2();
      exports$2 = {};
      _dewExec$2 = false;
      exports$1 = {};
      _dewExec$1 = false;
      exports = {};
      _dewExec = false;
    }
  });

  // node_modules/@jspm/core/nodelibs/browser/buffer.js
  var buffer_exports = {};
  __export(buffer_exports, {
    Buffer: () => Buffer2,
    INSPECT_MAX_BYTES: () => INSPECT_MAX_BYTES,
    default: () => exports2,
    kMaxLength: () => kMaxLength
  });
  var exports2, Buffer2, INSPECT_MAX_BYTES, kMaxLength;
  var init_buffer = __esm({
    "node_modules/@jspm/core/nodelibs/browser/buffer.js"() {
      init_dirname();
      init_buffer2();
      init_process2();
      init_chunk_DtuTasat();
      exports2 = dew();
      exports2["Buffer"];
      exports2["SlowBuffer"];
      exports2["INSPECT_MAX_BYTES"];
      exports2["kMaxLength"];
      Buffer2 = exports2.Buffer;
      INSPECT_MAX_BYTES = exports2.INSPECT_MAX_BYTES;
      kMaxLength = exports2.kMaxLength;
    }
  });

  // node_modules/esbuild-plugin-polyfill-node/polyfills/buffer.js
  var init_buffer2 = __esm({
    "node_modules/esbuild-plugin-polyfill-node/polyfills/buffer.js"() {
      init_buffer();
    }
  });

  // node_modules/@noble/hashes/esm/crypto.js
  var crypto;
  var init_crypto = __esm({
    "node_modules/@noble/hashes/esm/crypto.js"() {
      init_dirname();
      init_buffer2();
      init_process2();
      crypto = typeof globalThis === "object" && "crypto" in globalThis ? globalThis.crypto : void 0;
    }
  });

  // node_modules/@noble/hashes/esm/utils.js
  function isBytes(a) {
    return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array";
  }
  function anumber(n) {
    if (!Number.isSafeInteger(n) || n < 0)
      throw new Error("positive integer expected, got " + n);
  }
  function abytes(b, ...lengths) {
    if (!isBytes(b))
      throw new Error("Uint8Array expected");
    if (lengths.length > 0 && !lengths.includes(b.length))
      throw new Error("Uint8Array expected of length " + lengths + ", got length=" + b.length);
  }
  function ahash(h) {
    if (typeof h !== "function" || typeof h.create !== "function")
      throw new Error("Hash should be wrapped by utils.createHasher");
    anumber(h.outputLen);
    anumber(h.blockLen);
  }
  function aexists(instance, checkFinished = true) {
    if (instance.destroyed)
      throw new Error("Hash instance has been destroyed");
    if (checkFinished && instance.finished)
      throw new Error("Hash#digest() has already been called");
  }
  function aoutput(out, instance) {
    abytes(out);
    const min = instance.outputLen;
    if (out.length < min) {
      throw new Error("digestInto() expects output buffer of length at least " + min);
    }
  }
  function clean(...arrays) {
    for (let i = 0; i < arrays.length; i++) {
      arrays[i].fill(0);
    }
  }
  function createView(arr) {
    return new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
  }
  function rotr(word, shift) {
    return word << 32 - shift | word >>> shift;
  }
  function bytesToHex(bytes) {
    abytes(bytes);
    if (hasHexBuiltin)
      return bytes.toHex();
    let hex = "";
    for (let i = 0; i < bytes.length; i++) {
      hex += hexes[bytes[i]];
    }
    return hex;
  }
  function asciiToBase16(ch) {
    if (ch >= asciis._0 && ch <= asciis._9)
      return ch - asciis._0;
    if (ch >= asciis.A && ch <= asciis.F)
      return ch - (asciis.A - 10);
    if (ch >= asciis.a && ch <= asciis.f)
      return ch - (asciis.a - 10);
    return;
  }
  function hexToBytes(hex) {
    if (typeof hex !== "string")
      throw new Error("hex string expected, got " + typeof hex);
    if (hasHexBuiltin)
      return Uint8Array.fromHex(hex);
    const hl = hex.length;
    const al = hl / 2;
    if (hl % 2)
      throw new Error("hex string expected, got unpadded hex of length " + hl);
    const array = new Uint8Array(al);
    for (let ai = 0, hi = 0; ai < al; ai++, hi += 2) {
      const n1 = asciiToBase16(hex.charCodeAt(hi));
      const n2 = asciiToBase16(hex.charCodeAt(hi + 1));
      if (n1 === void 0 || n2 === void 0) {
        const char = hex[hi] + hex[hi + 1];
        throw new Error('hex string expected, got non-hex character "' + char + '" at index ' + hi);
      }
      array[ai] = n1 * 16 + n2;
    }
    return array;
  }
  function utf8ToBytes(str) {
    if (typeof str !== "string")
      throw new Error("string expected");
    return new Uint8Array(new TextEncoder().encode(str));
  }
  function toBytes(data) {
    if (typeof data === "string")
      data = utf8ToBytes(data);
    abytes(data);
    return data;
  }
  function concatBytes(...arrays) {
    let sum = 0;
    for (let i = 0; i < arrays.length; i++) {
      const a = arrays[i];
      abytes(a);
      sum += a.length;
    }
    const res = new Uint8Array(sum);
    for (let i = 0, pad = 0; i < arrays.length; i++) {
      const a = arrays[i];
      res.set(a, pad);
      pad += a.length;
    }
    return res;
  }
  function createHasher(hashCons) {
    const hashC = (msg) => hashCons().update(toBytes(msg)).digest();
    const tmp = hashCons();
    hashC.outputLen = tmp.outputLen;
    hashC.blockLen = tmp.blockLen;
    hashC.create = () => hashCons();
    return hashC;
  }
  function randomBytes(bytesLength = 32) {
    if (crypto && typeof crypto.getRandomValues === "function") {
      return crypto.getRandomValues(new Uint8Array(bytesLength));
    }
    if (crypto && typeof crypto.randomBytes === "function") {
      return Uint8Array.from(crypto.randomBytes(bytesLength));
    }
    throw new Error("crypto.getRandomValues must be defined");
  }
  var hasHexBuiltin, hexes, asciis, Hash;
  var init_utils = __esm({
    "node_modules/@noble/hashes/esm/utils.js"() {
      init_dirname();
      init_buffer2();
      init_process2();
      init_crypto();
      hasHexBuiltin = /* @__PURE__ */ (() => (
        // @ts-ignore
        typeof Uint8Array.from([]).toHex === "function" && typeof Uint8Array.fromHex === "function"
      ))();
      hexes = /* @__PURE__ */ Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, "0"));
      asciis = { _0: 48, _9: 57, A: 65, F: 70, a: 97, f: 102 };
      Hash = class {
      };
    }
  });

  // node_modules/@noble/hashes/esm/_md.js
  function setBigUint64(view, byteOffset, value, isLE) {
    if (typeof view.setBigUint64 === "function")
      return view.setBigUint64(byteOffset, value, isLE);
    const _32n2 = BigInt(32);
    const _u32_max = BigInt(4294967295);
    const wh = Number(value >> _32n2 & _u32_max);
    const wl = Number(value & _u32_max);
    const h = isLE ? 4 : 0;
    const l = isLE ? 0 : 4;
    view.setUint32(byteOffset + h, wh, isLE);
    view.setUint32(byteOffset + l, wl, isLE);
  }
  function Chi(a, b, c) {
    return a & b ^ ~a & c;
  }
  function Maj(a, b, c) {
    return a & b ^ a & c ^ b & c;
  }
  var HashMD, SHA256_IV, SHA224_IV, SHA512_IV;
  var init_md = __esm({
    "node_modules/@noble/hashes/esm/_md.js"() {
      init_dirname();
      init_buffer2();
      init_process2();
      init_utils();
      HashMD = class extends Hash {
        constructor(blockLen, outputLen, padOffset, isLE) {
          super();
          this.finished = false;
          this.length = 0;
          this.pos = 0;
          this.destroyed = false;
          this.blockLen = blockLen;
          this.outputLen = outputLen;
          this.padOffset = padOffset;
          this.isLE = isLE;
          this.buffer = new Uint8Array(blockLen);
          this.view = createView(this.buffer);
        }
        update(data) {
          aexists(this);
          data = toBytes(data);
          abytes(data);
          const { view, buffer, blockLen } = this;
          const len = data.length;
          for (let pos = 0; pos < len; ) {
            const take = Math.min(blockLen - this.pos, len - pos);
            if (take === blockLen) {
              const dataView = createView(data);
              for (; blockLen <= len - pos; pos += blockLen)
                this.process(dataView, pos);
              continue;
            }
            buffer.set(data.subarray(pos, pos + take), this.pos);
            this.pos += take;
            pos += take;
            if (this.pos === blockLen) {
              this.process(view, 0);
              this.pos = 0;
            }
          }
          this.length += data.length;
          this.roundClean();
          return this;
        }
        digestInto(out) {
          aexists(this);
          aoutput(out, this);
          this.finished = true;
          const { buffer, view, blockLen, isLE } = this;
          let { pos } = this;
          buffer[pos++] = 128;
          clean(this.buffer.subarray(pos));
          if (this.padOffset > blockLen - pos) {
            this.process(view, 0);
            pos = 0;
          }
          for (let i = pos; i < blockLen; i++)
            buffer[i] = 0;
          setBigUint64(view, blockLen - 8, BigInt(this.length * 8), isLE);
          this.process(view, 0);
          const oview = createView(out);
          const len = this.outputLen;
          if (len % 4)
            throw new Error("_sha2: outputLen should be aligned to 32bit");
          const outLen = len / 4;
          const state = this.get();
          if (outLen > state.length)
            throw new Error("_sha2: outputLen bigger than state");
          for (let i = 0; i < outLen; i++)
            oview.setUint32(4 * i, state[i], isLE);
        }
        digest() {
          const { buffer, outputLen } = this;
          this.digestInto(buffer);
          const res = buffer.slice(0, outputLen);
          this.destroy();
          return res;
        }
        _cloneInto(to) {
          to || (to = new this.constructor());
          to.set(...this.get());
          const { blockLen, buffer, length, finished, destroyed, pos } = this;
          to.destroyed = destroyed;
          to.finished = finished;
          to.length = length;
          to.pos = pos;
          if (length % blockLen)
            to.buffer.set(buffer);
          return to;
        }
        clone() {
          return this._cloneInto();
        }
      };
      SHA256_IV = /* @__PURE__ */ Uint32Array.from([
        1779033703,
        3144134277,
        1013904242,
        2773480762,
        1359893119,
        2600822924,
        528734635,
        1541459225
      ]);
      SHA224_IV = /* @__PURE__ */ Uint32Array.from([
        3238371032,
        914150663,
        812702999,
        4144912697,
        4290775857,
        1750603025,
        1694076839,
        3204075428
      ]);
      SHA512_IV = /* @__PURE__ */ Uint32Array.from([
        1779033703,
        4089235720,
        3144134277,
        2227873595,
        1013904242,
        4271175723,
        2773480762,
        1595750129,
        1359893119,
        2917565137,
        2600822924,
        725511199,
        528734635,
        4215389547,
        1541459225,
        327033209
      ]);
    }
  });

  // node_modules/@noble/hashes/esm/_u64.js
  function fromBig(n, le = false) {
    if (le)
      return { h: Number(n & U32_MASK64), l: Number(n >> _32n & U32_MASK64) };
    return { h: Number(n >> _32n & U32_MASK64) | 0, l: Number(n & U32_MASK64) | 0 };
  }
  function split(lst, le = false) {
    const len = lst.length;
    let Ah = new Uint32Array(len);
    let Al = new Uint32Array(len);
    for (let i = 0; i < len; i++) {
      const { h, l } = fromBig(lst[i], le);
      [Ah[i], Al[i]] = [h, l];
    }
    return [Ah, Al];
  }
  function add(Ah, Al, Bh, Bl) {
    const l = (Al >>> 0) + (Bl >>> 0);
    return { h: Ah + Bh + (l / 2 ** 32 | 0) | 0, l: l | 0 };
  }
  var U32_MASK64, _32n, shrSH, shrSL, rotrSH, rotrSL, rotrBH, rotrBL, add3L, add3H, add4L, add4H, add5L, add5H;
  var init_u64 = __esm({
    "node_modules/@noble/hashes/esm/_u64.js"() {
      init_dirname();
      init_buffer2();
      init_process2();
      U32_MASK64 = /* @__PURE__ */ BigInt(2 ** 32 - 1);
      _32n = /* @__PURE__ */ BigInt(32);
      shrSH = (h, _l, s) => h >>> s;
      shrSL = (h, l, s) => h << 32 - s | l >>> s;
      rotrSH = (h, l, s) => h >>> s | l << 32 - s;
      rotrSL = (h, l, s) => h << 32 - s | l >>> s;
      rotrBH = (h, l, s) => h << 64 - s | l >>> s - 32;
      rotrBL = (h, l, s) => h >>> s - 32 | l << 64 - s;
      add3L = (Al, Bl, Cl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0);
      add3H = (low, Ah, Bh, Ch) => Ah + Bh + Ch + (low / 2 ** 32 | 0) | 0;
      add4L = (Al, Bl, Cl, Dl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0);
      add4H = (low, Ah, Bh, Ch, Dh) => Ah + Bh + Ch + Dh + (low / 2 ** 32 | 0) | 0;
      add5L = (Al, Bl, Cl, Dl, El) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0) + (El >>> 0);
      add5H = (low, Ah, Bh, Ch, Dh, Eh) => Ah + Bh + Ch + Dh + Eh + (low / 2 ** 32 | 0) | 0;
    }
  });

  // node_modules/@noble/hashes/esm/sha2.js
  var SHA256_K, SHA256_W, SHA256, SHA224, K512, SHA512_Kh, SHA512_Kl, SHA512_W_H, SHA512_W_L, SHA512, sha256, sha224, sha512;
  var init_sha2 = __esm({
    "node_modules/@noble/hashes/esm/sha2.js"() {
      init_dirname();
      init_buffer2();
      init_process2();
      init_md();
      init_u64();
      init_utils();
      SHA256_K = /* @__PURE__ */ Uint32Array.from([
        1116352408,
        1899447441,
        3049323471,
        3921009573,
        961987163,
        1508970993,
        2453635748,
        2870763221,
        3624381080,
        310598401,
        607225278,
        1426881987,
        1925078388,
        2162078206,
        2614888103,
        3248222580,
        3835390401,
        4022224774,
        264347078,
        604807628,
        770255983,
        1249150122,
        1555081692,
        1996064986,
        2554220882,
        2821834349,
        2952996808,
        3210313671,
        3336571891,
        3584528711,
        113926993,
        338241895,
        666307205,
        773529912,
        1294757372,
        1396182291,
        1695183700,
        1986661051,
        2177026350,
        2456956037,
        2730485921,
        2820302411,
        3259730800,
        3345764771,
        3516065817,
        3600352804,
        4094571909,
        275423344,
        430227734,
        506948616,
        659060556,
        883997877,
        958139571,
        1322822218,
        1537002063,
        1747873779,
        1955562222,
        2024104815,
        2227730452,
        2361852424,
        2428436474,
        2756734187,
        3204031479,
        3329325298
      ]);
      SHA256_W = /* @__PURE__ */ new Uint32Array(64);
      SHA256 = class extends HashMD {
        constructor(outputLen = 32) {
          super(64, outputLen, 8, false);
          this.A = SHA256_IV[0] | 0;
          this.B = SHA256_IV[1] | 0;
          this.C = SHA256_IV[2] | 0;
          this.D = SHA256_IV[3] | 0;
          this.E = SHA256_IV[4] | 0;
          this.F = SHA256_IV[5] | 0;
          this.G = SHA256_IV[6] | 0;
          this.H = SHA256_IV[7] | 0;
        }
        get() {
          const { A, B, C, D, E, F, G, H } = this;
          return [A, B, C, D, E, F, G, H];
        }
        // prettier-ignore
        set(A, B, C, D, E, F, G, H) {
          this.A = A | 0;
          this.B = B | 0;
          this.C = C | 0;
          this.D = D | 0;
          this.E = E | 0;
          this.F = F | 0;
          this.G = G | 0;
          this.H = H | 0;
        }
        process(view, offset) {
          for (let i = 0; i < 16; i++, offset += 4)
            SHA256_W[i] = view.getUint32(offset, false);
          for (let i = 16; i < 64; i++) {
            const W15 = SHA256_W[i - 15];
            const W2 = SHA256_W[i - 2];
            const s0 = rotr(W15, 7) ^ rotr(W15, 18) ^ W15 >>> 3;
            const s1 = rotr(W2, 17) ^ rotr(W2, 19) ^ W2 >>> 10;
            SHA256_W[i] = s1 + SHA256_W[i - 7] + s0 + SHA256_W[i - 16] | 0;
          }
          let { A, B, C, D, E, F, G, H } = this;
          for (let i = 0; i < 64; i++) {
            const sigma1 = rotr(E, 6) ^ rotr(E, 11) ^ rotr(E, 25);
            const T1 = H + sigma1 + Chi(E, F, G) + SHA256_K[i] + SHA256_W[i] | 0;
            const sigma0 = rotr(A, 2) ^ rotr(A, 13) ^ rotr(A, 22);
            const T2 = sigma0 + Maj(A, B, C) | 0;
            H = G;
            G = F;
            F = E;
            E = D + T1 | 0;
            D = C;
            C = B;
            B = A;
            A = T1 + T2 | 0;
          }
          A = A + this.A | 0;
          B = B + this.B | 0;
          C = C + this.C | 0;
          D = D + this.D | 0;
          E = E + this.E | 0;
          F = F + this.F | 0;
          G = G + this.G | 0;
          H = H + this.H | 0;
          this.set(A, B, C, D, E, F, G, H);
        }
        roundClean() {
          clean(SHA256_W);
        }
        destroy() {
          this.set(0, 0, 0, 0, 0, 0, 0, 0);
          clean(this.buffer);
        }
      };
      SHA224 = class extends SHA256 {
        constructor() {
          super(28);
          this.A = SHA224_IV[0] | 0;
          this.B = SHA224_IV[1] | 0;
          this.C = SHA224_IV[2] | 0;
          this.D = SHA224_IV[3] | 0;
          this.E = SHA224_IV[4] | 0;
          this.F = SHA224_IV[5] | 0;
          this.G = SHA224_IV[6] | 0;
          this.H = SHA224_IV[7] | 0;
        }
      };
      K512 = /* @__PURE__ */ (() => split([
        "0x428a2f98d728ae22",
        "0x7137449123ef65cd",
        "0xb5c0fbcfec4d3b2f",
        "0xe9b5dba58189dbbc",
        "0x3956c25bf348b538",
        "0x59f111f1b605d019",
        "0x923f82a4af194f9b",
        "0xab1c5ed5da6d8118",
        "0xd807aa98a3030242",
        "0x12835b0145706fbe",
        "0x243185be4ee4b28c",
        "0x550c7dc3d5ffb4e2",
        "0x72be5d74f27b896f",
        "0x80deb1fe3b1696b1",
        "0x9bdc06a725c71235",
        "0xc19bf174cf692694",
        "0xe49b69c19ef14ad2",
        "0xefbe4786384f25e3",
        "0x0fc19dc68b8cd5b5",
        "0x240ca1cc77ac9c65",
        "0x2de92c6f592b0275",
        "0x4a7484aa6ea6e483",
        "0x5cb0a9dcbd41fbd4",
        "0x76f988da831153b5",
        "0x983e5152ee66dfab",
        "0xa831c66d2db43210",
        "0xb00327c898fb213f",
        "0xbf597fc7beef0ee4",
        "0xc6e00bf33da88fc2",
        "0xd5a79147930aa725",
        "0x06ca6351e003826f",
        "0x142929670a0e6e70",
        "0x27b70a8546d22ffc",
        "0x2e1b21385c26c926",
        "0x4d2c6dfc5ac42aed",
        "0x53380d139d95b3df",
        "0x650a73548baf63de",
        "0x766a0abb3c77b2a8",
        "0x81c2c92e47edaee6",
        "0x92722c851482353b",
        "0xa2bfe8a14cf10364",
        "0xa81a664bbc423001",
        "0xc24b8b70d0f89791",
        "0xc76c51a30654be30",
        "0xd192e819d6ef5218",
        "0xd69906245565a910",
        "0xf40e35855771202a",
        "0x106aa07032bbd1b8",
        "0x19a4c116b8d2d0c8",
        "0x1e376c085141ab53",
        "0x2748774cdf8eeb99",
        "0x34b0bcb5e19b48a8",
        "0x391c0cb3c5c95a63",
        "0x4ed8aa4ae3418acb",
        "0x5b9cca4f7763e373",
        "0x682e6ff3d6b2b8a3",
        "0x748f82ee5defb2fc",
        "0x78a5636f43172f60",
        "0x84c87814a1f0ab72",
        "0x8cc702081a6439ec",
        "0x90befffa23631e28",
        "0xa4506cebde82bde9",
        "0xbef9a3f7b2c67915",
        "0xc67178f2e372532b",
        "0xca273eceea26619c",
        "0xd186b8c721c0c207",
        "0xeada7dd6cde0eb1e",
        "0xf57d4f7fee6ed178",
        "0x06f067aa72176fba",
        "0x0a637dc5a2c898a6",
        "0x113f9804bef90dae",
        "0x1b710b35131c471b",
        "0x28db77f523047d84",
        "0x32caab7b40c72493",
        "0x3c9ebe0a15c9bebc",
        "0x431d67c49c100d4c",
        "0x4cc5d4becb3e42b6",
        "0x597f299cfc657e2a",
        "0x5fcb6fab3ad6faec",
        "0x6c44198c4a475817"
      ].map((n) => BigInt(n))))();
      SHA512_Kh = /* @__PURE__ */ (() => K512[0])();
      SHA512_Kl = /* @__PURE__ */ (() => K512[1])();
      SHA512_W_H = /* @__PURE__ */ new Uint32Array(80);
      SHA512_W_L = /* @__PURE__ */ new Uint32Array(80);
      SHA512 = class extends HashMD {
        constructor(outputLen = 64) {
          super(128, outputLen, 16, false);
          this.Ah = SHA512_IV[0] | 0;
          this.Al = SHA512_IV[1] | 0;
          this.Bh = SHA512_IV[2] | 0;
          this.Bl = SHA512_IV[3] | 0;
          this.Ch = SHA512_IV[4] | 0;
          this.Cl = SHA512_IV[5] | 0;
          this.Dh = SHA512_IV[6] | 0;
          this.Dl = SHA512_IV[7] | 0;
          this.Eh = SHA512_IV[8] | 0;
          this.El = SHA512_IV[9] | 0;
          this.Fh = SHA512_IV[10] | 0;
          this.Fl = SHA512_IV[11] | 0;
          this.Gh = SHA512_IV[12] | 0;
          this.Gl = SHA512_IV[13] | 0;
          this.Hh = SHA512_IV[14] | 0;
          this.Hl = SHA512_IV[15] | 0;
        }
        // prettier-ignore
        get() {
          const { Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl } = this;
          return [Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl];
        }
        // prettier-ignore
        set(Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl) {
          this.Ah = Ah | 0;
          this.Al = Al | 0;
          this.Bh = Bh | 0;
          this.Bl = Bl | 0;
          this.Ch = Ch | 0;
          this.Cl = Cl | 0;
          this.Dh = Dh | 0;
          this.Dl = Dl | 0;
          this.Eh = Eh | 0;
          this.El = El | 0;
          this.Fh = Fh | 0;
          this.Fl = Fl | 0;
          this.Gh = Gh | 0;
          this.Gl = Gl | 0;
          this.Hh = Hh | 0;
          this.Hl = Hl | 0;
        }
        process(view, offset) {
          for (let i = 0; i < 16; i++, offset += 4) {
            SHA512_W_H[i] = view.getUint32(offset);
            SHA512_W_L[i] = view.getUint32(offset += 4);
          }
          for (let i = 16; i < 80; i++) {
            const W15h = SHA512_W_H[i - 15] | 0;
            const W15l = SHA512_W_L[i - 15] | 0;
            const s0h = rotrSH(W15h, W15l, 1) ^ rotrSH(W15h, W15l, 8) ^ shrSH(W15h, W15l, 7);
            const s0l = rotrSL(W15h, W15l, 1) ^ rotrSL(W15h, W15l, 8) ^ shrSL(W15h, W15l, 7);
            const W2h = SHA512_W_H[i - 2] | 0;
            const W2l = SHA512_W_L[i - 2] | 0;
            const s1h = rotrSH(W2h, W2l, 19) ^ rotrBH(W2h, W2l, 61) ^ shrSH(W2h, W2l, 6);
            const s1l = rotrSL(W2h, W2l, 19) ^ rotrBL(W2h, W2l, 61) ^ shrSL(W2h, W2l, 6);
            const SUMl = add4L(s0l, s1l, SHA512_W_L[i - 7], SHA512_W_L[i - 16]);
            const SUMh = add4H(SUMl, s0h, s1h, SHA512_W_H[i - 7], SHA512_W_H[i - 16]);
            SHA512_W_H[i] = SUMh | 0;
            SHA512_W_L[i] = SUMl | 0;
          }
          let { Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl } = this;
          for (let i = 0; i < 80; i++) {
            const sigma1h = rotrSH(Eh, El, 14) ^ rotrSH(Eh, El, 18) ^ rotrBH(Eh, El, 41);
            const sigma1l = rotrSL(Eh, El, 14) ^ rotrSL(Eh, El, 18) ^ rotrBL(Eh, El, 41);
            const CHIh = Eh & Fh ^ ~Eh & Gh;
            const CHIl = El & Fl ^ ~El & Gl;
            const T1ll = add5L(Hl, sigma1l, CHIl, SHA512_Kl[i], SHA512_W_L[i]);
            const T1h = add5H(T1ll, Hh, sigma1h, CHIh, SHA512_Kh[i], SHA512_W_H[i]);
            const T1l = T1ll | 0;
            const sigma0h = rotrSH(Ah, Al, 28) ^ rotrBH(Ah, Al, 34) ^ rotrBH(Ah, Al, 39);
            const sigma0l = rotrSL(Ah, Al, 28) ^ rotrBL(Ah, Al, 34) ^ rotrBL(Ah, Al, 39);
            const MAJh = Ah & Bh ^ Ah & Ch ^ Bh & Ch;
            const MAJl = Al & Bl ^ Al & Cl ^ Bl & Cl;
            Hh = Gh | 0;
            Hl = Gl | 0;
            Gh = Fh | 0;
            Gl = Fl | 0;
            Fh = Eh | 0;
            Fl = El | 0;
            ({ h: Eh, l: El } = add(Dh | 0, Dl | 0, T1h | 0, T1l | 0));
            Dh = Ch | 0;
            Dl = Cl | 0;
            Ch = Bh | 0;
            Cl = Bl | 0;
            Bh = Ah | 0;
            Bl = Al | 0;
            const All = add3L(T1l, sigma0l, MAJl);
            Ah = add3H(All, T1h, sigma0h, MAJh);
            Al = All | 0;
          }
          ({ h: Ah, l: Al } = add(this.Ah | 0, this.Al | 0, Ah | 0, Al | 0));
          ({ h: Bh, l: Bl } = add(this.Bh | 0, this.Bl | 0, Bh | 0, Bl | 0));
          ({ h: Ch, l: Cl } = add(this.Ch | 0, this.Cl | 0, Ch | 0, Cl | 0));
          ({ h: Dh, l: Dl } = add(this.Dh | 0, this.Dl | 0, Dh | 0, Dl | 0));
          ({ h: Eh, l: El } = add(this.Eh | 0, this.El | 0, Eh | 0, El | 0));
          ({ h: Fh, l: Fl } = add(this.Fh | 0, this.Fl | 0, Fh | 0, Fl | 0));
          ({ h: Gh, l: Gl } = add(this.Gh | 0, this.Gl | 0, Gh | 0, Gl | 0));
          ({ h: Hh, l: Hl } = add(this.Hh | 0, this.Hl | 0, Hh | 0, Hl | 0));
          this.set(Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl);
        }
        roundClean() {
          clean(SHA512_W_H, SHA512_W_L);
        }
        destroy() {
          clean(this.buffer);
          this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
        }
      };
      sha256 = /* @__PURE__ */ createHasher(() => new SHA256());
      sha224 = /* @__PURE__ */ createHasher(() => new SHA224());
      sha512 = /* @__PURE__ */ createHasher(() => new SHA512());
    }
  });

  // node_modules/bitcoinjs-lib/src/networks.js
  var require_networks = __commonJS({
    "node_modules/bitcoinjs-lib/src/networks.js"(exports7) {
      "use strict";
      init_dirname();
      init_buffer2();
      init_process2();
      Object.defineProperty(exports7, "__esModule", { value: true });
      exports7.testnet = exports7.regtest = exports7.bitcoin = void 0;
      exports7.bitcoin = {
        /**
         * The message prefix used for signing Bitcoin messages.
         */
        messagePrefix: "Bitcoin Signed Message:\n",
        /**
         * The Bech32 prefix used for Bitcoin addresses.
         */
        bech32: "bc",
        /**
         * The BIP32 key prefixes for Bitcoin.
         */
        bip32: {
          /**
           * The public key prefix for BIP32 extended public keys.
           */
          public: 76067358,
          /**
           * The private key prefix for BIP32 extended private keys.
           */
          private: 76066276
        },
        /**
         * The prefix for Bitcoin public key hashes.
         */
        pubKeyHash: 0,
        /**
         * The prefix for Bitcoin script hashes.
         */
        scriptHash: 5,
        /**
         * The prefix for Bitcoin Wallet Import Format (WIF) private keys.
         */
        wif: 128
      };
      exports7.regtest = {
        messagePrefix: "Bitcoin Signed Message:\n",
        bech32: "bcrt",
        bip32: {
          public: 70617039,
          private: 70615956
        },
        pubKeyHash: 111,
        scriptHash: 196,
        wif: 239
      };
      exports7.testnet = {
        messagePrefix: "Bitcoin Signed Message:\n",
        bech32: "tb",
        bip32: {
          public: 70617039,
          private: 70615956
        },
        pubKeyHash: 111,
        scriptHash: 196,
        wif: 239
      };
    }
  });

  // node_modules/bitcoinjs-lib/src/bip66.js
  var require_bip66 = __commonJS({
    "node_modules/bitcoinjs-lib/src/bip66.js"(exports7) {
      "use strict";
      init_dirname();
      init_buffer2();
      init_process2();
      Object.defineProperty(exports7, "__esModule", { value: true });
      exports7.encode = exports7.decode = exports7.check = void 0;
      function check(buffer) {
        if (buffer.length < 8) return false;
        if (buffer.length > 72) return false;
        if (buffer[0] !== 48) return false;
        if (buffer[1] !== buffer.length - 2) return false;
        if (buffer[2] !== 2) return false;
        const lenR = buffer[3];
        if (lenR === 0) return false;
        if (5 + lenR >= buffer.length) return false;
        if (buffer[4 + lenR] !== 2) return false;
        const lenS = buffer[5 + lenR];
        if (lenS === 0) return false;
        if (6 + lenR + lenS !== buffer.length) return false;
        if (buffer[4] & 128) return false;
        if (lenR > 1 && buffer[4] === 0 && !(buffer[5] & 128)) return false;
        if (buffer[lenR + 6] & 128) return false;
        if (lenS > 1 && buffer[lenR + 6] === 0 && !(buffer[lenR + 7] & 128))
          return false;
        return true;
      }
      exports7.check = check;
      function decode(buffer) {
        if (buffer.length < 8) throw new Error("DER sequence length is too short");
        if (buffer.length > 72) throw new Error("DER sequence length is too long");
        if (buffer[0] !== 48) throw new Error("Expected DER sequence");
        if (buffer[1] !== buffer.length - 2)
          throw new Error("DER sequence length is invalid");
        if (buffer[2] !== 2) throw new Error("Expected DER integer");
        const lenR = buffer[3];
        if (lenR === 0) throw new Error("R length is zero");
        if (5 + lenR >= buffer.length) throw new Error("R length is too long");
        if (buffer[4 + lenR] !== 2) throw new Error("Expected DER integer (2)");
        const lenS = buffer[5 + lenR];
        if (lenS === 0) throw new Error("S length is zero");
        if (6 + lenR + lenS !== buffer.length) throw new Error("S length is invalid");
        if (buffer[4] & 128) throw new Error("R value is negative");
        if (lenR > 1 && buffer[4] === 0 && !(buffer[5] & 128))
          throw new Error("R value excessively padded");
        if (buffer[lenR + 6] & 128) throw new Error("S value is negative");
        if (lenS > 1 && buffer[lenR + 6] === 0 && !(buffer[lenR + 7] & 128))
          throw new Error("S value excessively padded");
        return {
          r: buffer.slice(4, 4 + lenR),
          s: buffer.slice(6 + lenR)
        };
      }
      exports7.decode = decode;
      function encode(r, s) {
        const lenR = r.length;
        const lenS = s.length;
        if (lenR === 0) throw new Error("R length is zero");
        if (lenS === 0) throw new Error("S length is zero");
        if (lenR > 33) throw new Error("R length is too long");
        if (lenS > 33) throw new Error("S length is too long");
        if (r[0] & 128) throw new Error("R value is negative");
        if (s[0] & 128) throw new Error("S value is negative");
        if (lenR > 1 && r[0] === 0 && !(r[1] & 128))
          throw new Error("R value excessively padded");
        if (lenS > 1 && s[0] === 0 && !(s[1] & 128))
          throw new Error("S value excessively padded");
        const signature = Buffer2.allocUnsafe(6 + lenR + lenS);
        signature[0] = 48;
        signature[1] = signature.length - 2;
        signature[2] = 2;
        signature[3] = r.length;
        r.copy(signature, 4);
        signature[4 + lenR] = 2;
        signature[5 + lenR] = s.length;
        s.copy(signature, 6 + lenR);
        return signature;
      }
      exports7.encode = encode;
    }
  });

  // node_modules/bitcoinjs-lib/src/ops.js
  var require_ops = __commonJS({
    "node_modules/bitcoinjs-lib/src/ops.js"(exports7) {
      "use strict";
      init_dirname();
      init_buffer2();
      init_process2();
      Object.defineProperty(exports7, "__esModule", { value: true });
      exports7.REVERSE_OPS = exports7.OPS = void 0;
      var OPS = {
        OP_FALSE: 0,
        OP_0: 0,
        OP_PUSHDATA1: 76,
        OP_PUSHDATA2: 77,
        OP_PUSHDATA4: 78,
        OP_1NEGATE: 79,
        OP_RESERVED: 80,
        OP_TRUE: 81,
        OP_1: 81,
        OP_2: 82,
        OP_3: 83,
        OP_4: 84,
        OP_5: 85,
        OP_6: 86,
        OP_7: 87,
        OP_8: 88,
        OP_9: 89,
        OP_10: 90,
        OP_11: 91,
        OP_12: 92,
        OP_13: 93,
        OP_14: 94,
        OP_15: 95,
        OP_16: 96,
        OP_NOP: 97,
        OP_VER: 98,
        OP_IF: 99,
        OP_NOTIF: 100,
        OP_VERIF: 101,
        OP_VERNOTIF: 102,
        OP_ELSE: 103,
        OP_ENDIF: 104,
        OP_VERIFY: 105,
        OP_RETURN: 106,
        OP_TOALTSTACK: 107,
        OP_FROMALTSTACK: 108,
        OP_2DROP: 109,
        OP_2DUP: 110,
        OP_3DUP: 111,
        OP_2OVER: 112,
        OP_2ROT: 113,
        OP_2SWAP: 114,
        OP_IFDUP: 115,
        OP_DEPTH: 116,
        OP_DROP: 117,
        OP_DUP: 118,
        OP_NIP: 119,
        OP_OVER: 120,
        OP_PICK: 121,
        OP_ROLL: 122,
        OP_ROT: 123,
        OP_SWAP: 124,
        OP_TUCK: 125,
        OP_CAT: 126,
        OP_SUBSTR: 127,
        OP_LEFT: 128,
        OP_RIGHT: 129,
        OP_SIZE: 130,
        OP_INVERT: 131,
        OP_AND: 132,
        OP_OR: 133,
        OP_XOR: 134,
        OP_EQUAL: 135,
        OP_EQUALVERIFY: 136,
        OP_RESERVED1: 137,
        OP_RESERVED2: 138,
        OP_1ADD: 139,
        OP_1SUB: 140,
        OP_2MUL: 141,
        OP_2DIV: 142,
        OP_NEGATE: 143,
        OP_ABS: 144,
        OP_NOT: 145,
        OP_0NOTEQUAL: 146,
        OP_ADD: 147,
        OP_SUB: 148,
        OP_MUL: 149,
        OP_DIV: 150,
        OP_MOD: 151,
        OP_LSHIFT: 152,
        OP_RSHIFT: 153,
        OP_BOOLAND: 154,
        OP_BOOLOR: 155,
        OP_NUMEQUAL: 156,
        OP_NUMEQUALVERIFY: 157,
        OP_NUMNOTEQUAL: 158,
        OP_LESSTHAN: 159,
        OP_GREATERTHAN: 160,
        OP_LESSTHANOREQUAL: 161,
        OP_GREATERTHANOREQUAL: 162,
        OP_MIN: 163,
        OP_MAX: 164,
        OP_WITHIN: 165,
        OP_RIPEMD160: 166,
        OP_SHA1: 167,
        OP_SHA256: 168,
        OP_HASH160: 169,
        OP_HASH256: 170,
        OP_CODESEPARATOR: 171,
        OP_CHECKSIG: 172,
        OP_CHECKSIGVERIFY: 173,
        OP_CHECKMULTISIG: 174,
        OP_CHECKMULTISIGVERIFY: 175,
        OP_NOP1: 176,
        OP_NOP2: 177,
        OP_CHECKLOCKTIMEVERIFY: 177,
        OP_NOP3: 178,
        OP_CHECKSEQUENCEVERIFY: 178,
        OP_NOP4: 179,
        OP_NOP5: 180,
        OP_NOP6: 181,
        OP_NOP7: 182,
        OP_NOP8: 183,
        OP_NOP9: 184,
        OP_NOP10: 185,
        OP_CHECKSIGADD: 186,
        OP_PUBKEYHASH: 253,
        OP_PUBKEY: 254,
        OP_INVALIDOPCODE: 255
      };
      exports7.OPS = OPS;
      var REVERSE_OPS = {};
      exports7.REVERSE_OPS = REVERSE_OPS;
      for (const op of Object.keys(OPS)) {
        const code = OPS[op];
        REVERSE_OPS[code] = op;
      }
    }
  });

  // node_modules/bitcoinjs-lib/src/push_data.js
  var require_push_data = __commonJS({
    "node_modules/bitcoinjs-lib/src/push_data.js"(exports7) {
      "use strict";
      init_dirname();
      init_buffer2();
      init_process2();
      Object.defineProperty(exports7, "__esModule", { value: true });
      exports7.decode = exports7.encode = exports7.encodingLength = void 0;
      var ops_1 = require_ops();
      function encodingLength(i) {
        return i < ops_1.OPS.OP_PUSHDATA1 ? 1 : i <= 255 ? 2 : i <= 65535 ? 3 : 5;
      }
      exports7.encodingLength = encodingLength;
      function encode(buffer, num, offset) {
        const size = encodingLength(num);
        if (size === 1) {
          buffer.writeUInt8(num, offset);
        } else if (size === 2) {
          buffer.writeUInt8(ops_1.OPS.OP_PUSHDATA1, offset);
          buffer.writeUInt8(num, offset + 1);
        } else if (size === 3) {
          buffer.writeUInt8(ops_1.OPS.OP_PUSHDATA2, offset);
          buffer.writeUInt16LE(num, offset + 1);
        } else {
          buffer.writeUInt8(ops_1.OPS.OP_PUSHDATA4, offset);
          buffer.writeUInt32LE(num, offset + 1);
        }
        return size;
      }
      exports7.encode = encode;
      function decode(buffer, offset) {
        const opcode = buffer.readUInt8(offset);
        let num;
        let size;
        if (opcode < ops_1.OPS.OP_PUSHDATA1) {
          num = opcode;
          size = 1;
        } else if (opcode === ops_1.OPS.OP_PUSHDATA1) {
          if (offset + 2 > buffer.length) return null;
          num = buffer.readUInt8(offset + 1);
          size = 2;
        } else if (opcode === ops_1.OPS.OP_PUSHDATA2) {
          if (offset + 3 > buffer.length) return null;
          num = buffer.readUInt16LE(offset + 1);
          size = 3;
        } else {
          if (offset + 5 > buffer.length) return null;
          if (opcode !== ops_1.OPS.OP_PUSHDATA4) throw new Error("Unexpected opcode");
          num = buffer.readUInt32LE(offset + 1);
          size = 5;
        }
        return {
          opcode,
          number: num,
          size
        };
      }
      exports7.decode = decode;
    }
  });

  // node_modules/bitcoinjs-lib/src/script_number.js
  var require_script_number = __commonJS({
    "node_modules/bitcoinjs-lib/src/script_number.js"(exports7) {
      "use strict";
      init_dirname();
      init_buffer2();
      init_process2();
      Object.defineProperty(exports7, "__esModule", { value: true });
      exports7.encode = exports7.decode = void 0;
      function decode(buffer, maxLength, minimal) {
        maxLength = maxLength || 4;
        minimal = minimal === void 0 ? true : minimal;
        const length = buffer.length;
        if (length === 0) return 0;
        if (length > maxLength) throw new TypeError("Script number overflow");
        if (minimal) {
          if ((buffer[length - 1] & 127) === 0) {
            if (length <= 1 || (buffer[length - 2] & 128) === 0)
              throw new Error("Non-minimally encoded script number");
          }
        }
        if (length === 5) {
          const a = buffer.readUInt32LE(0);
          const b = buffer.readUInt8(4);
          if (b & 128) return -((b & ~128) * 4294967296 + a);
          return b * 4294967296 + a;
        }
        let result = 0;
        for (let i = 0; i < length; ++i) {
          result |= buffer[i] << 8 * i;
        }
        if (buffer[length - 1] & 128)
          return -(result & ~(128 << 8 * (length - 1)));
        return result;
      }
      exports7.decode = decode;
      function scriptNumSize(i) {
        return i > 2147483647 ? 5 : i > 8388607 ? 4 : i > 32767 ? 3 : i > 127 ? 2 : i > 0 ? 1 : 0;
      }
      function encode(_number) {
        let value = Math.abs(_number);
        const size = scriptNumSize(value);
        const buffer = Buffer2.allocUnsafe(size);
        const negative = _number < 0;
        for (let i = 0; i < size; ++i) {
          buffer.writeUInt8(value & 255, i);
          value >>= 8;
        }
        if (buffer[size - 1] & 128) {
          buffer.writeUInt8(negative ? 128 : 0, size - 1);
        } else if (negative) {
          buffer[size - 1] |= 128;
        }
        return buffer;
      }
      exports7.encode = encode;
    }
  });

  // node_modules/typeforce/native.js
  var require_native = __commonJS({
    "node_modules/typeforce/native.js"(exports7, module) {
      init_dirname();
      init_buffer2();
      init_process2();
      var types2 = {
        Array: function(value) {
          return value !== null && value !== void 0 && value.constructor === Array;
        },
        Boolean: function(value) {
          return typeof value === "boolean";
        },
        Function: function(value) {
          return typeof value === "function";
        },
        Nil: function(value) {
          return value === void 0 || value === null;
        },
        Number: function(value) {
          return typeof value === "number";
        },
        Object: function(value) {
          return typeof value === "object";
        },
        String: function(value) {
          return typeof value === "string";
        },
        "": function() {
          return true;
        }
      };
      types2.Null = types2.Nil;
      for (typeName in types2) {
        types2[typeName].toJSON = function(t) {
          return t;
        }.bind(null, typeName);
      }
      var typeName;
      module.exports = types2;
    }
  });

  // node_modules/typeforce/errors.js
  var require_errors = __commonJS({
    "node_modules/typeforce/errors.js"(exports7, module) {
      init_dirname();
      init_buffer2();
      init_process2();
      var native = require_native();
      function getTypeName(fn) {
        return fn.name || fn.toString().match(/function (.*?)\s*\(/)[1];
      }
      function getValueTypeName(value) {
        return native.Nil(value) ? "" : getTypeName(value.constructor);
      }
      function getValue(value) {
        if (native.Function(value)) return "";
        if (native.String(value)) return JSON.stringify(value);
        if (value && native.Object(value)) return "";
        return value;
      }
      function captureStackTrace(e, t) {
        if (Error.captureStackTrace) {
          Error.captureStackTrace(e, t);
        }
      }
      function tfJSON(type) {
        if (native.Function(type)) return type.toJSON ? type.toJSON() : getTypeName(type);
        if (native.Array(type)) return "Array";
        if (type && native.Object(type)) return "Object";
        return type !== void 0 ? type : "";
      }
      function tfErrorString(type, value, valueTypeName) {
        var valueJson = getValue(value);
        return "Expected " + tfJSON(type) + ", got" + (valueTypeName !== "" ? " " + valueTypeName : "") + (valueJson !== "" ? " " + valueJson : "");
      }
      function TfTypeError(type, value, valueTypeName) {
        valueTypeName = valueTypeName || getValueTypeName(value);
        this.message = tfErrorString(type, value, valueTypeName);
        captureStackTrace(this, TfTypeError);
        this.__type = type;
        this.__value = value;
        this.__valueTypeName = valueTypeName;
      }
      TfTypeError.prototype = Object.create(Error.prototype);
      TfTypeError.prototype.constructor = TfTypeError;
      function tfPropertyErrorString(type, label, name, value, valueTypeName) {
        var description = '" of type ';
        if (label === "key") description = '" with key type ';
        return tfErrorString('property "' + tfJSON(name) + description + tfJSON(type), value, valueTypeName);
      }
      function TfPropertyTypeError(type, property, label, value, valueTypeName) {
        if (type) {
          valueTypeName = valueTypeName || getValueTypeName(value);
          this.message = tfPropertyErrorString(type, label, property, value, valueTypeName);
        } else {
          this.message = 'Unexpected property "' + property + '"';
        }
        captureStackTrace(this, TfTypeError);
        this.__label = label;
        this.__property = property;
        this.__type = type;
        this.__value = value;
        this.__valueTypeName = valueTypeName;
      }
      TfPropertyTypeError.prototype = Object.create(Error.prototype);
      TfPropertyTypeError.prototype.constructor = TfTypeError;
      function tfCustomError(expected, actual) {
        return new TfTypeError(expected, {}, actual);
      }
      function tfSubError(e, property, label) {
        if (e instanceof TfPropertyTypeError) {
          property = property + "." + e.__property;
          e = new TfPropertyTypeError(
            e.__type,
            property,
            e.__label,
            e.__value,
            e.__valueTypeName
          );
        } else if (e instanceof TfTypeError) {
          e = new TfPropertyTypeError(
            e.__type,
            property,
            label,
            e.__value,
            e.__valueTypeName
          );
        }
        captureStackTrace(e);
        return e;
      }
      module.exports = {
        TfTypeError,
        TfPropertyTypeError,
        tfCustomError,
        tfSubError,
        tfJSON,
        getValueTypeName
      };
    }
  });

  // node_modules/typeforce/extra.js
  var require_extra = __commonJS({
    "node_modules/typeforce/extra.js"(exports7, module) {
      init_dirname();
      init_buffer2();
      init_process2();
      var NATIVE = require_native();
      var ERRORS = require_errors();
      function _Buffer(value) {
        return Buffer2.isBuffer(value);
      }
      function Hex(value) {
        return typeof value === "string" && /^([0-9a-f]{2})+$/i.test(value);
      }
      function _LengthN(type, length) {
        var name = type.toJSON();
        function Length(value) {
          if (!type(value)) return false;
          if (value.length === length) return true;
          throw ERRORS.tfCustomError(name + "(Length: " + length + ")", name + "(Length: " + value.length + ")");
        }
        Length.toJSON = function() {
          return name;
        };
        return Length;
      }
      var _ArrayN = _LengthN.bind(null, NATIVE.Array);
      var _BufferN = _LengthN.bind(null, _Buffer);
      var _HexN = _LengthN.bind(null, Hex);
      var _StringN = _LengthN.bind(null, NATIVE.String);
      function Range(a, b, f) {
        f = f || NATIVE.Number;
        function _range(value, strict2) {
          return f(value, strict2) && value > a && value < b;
        }
        _range.toJSON = function() {
          return `${f.toJSON()} between [${a}, ${b}]`;
        };
        return _range;
      }
      var INT53_MAX = Math.pow(2, 53) - 1;
      function Finite(value) {
        return typeof value === "number" && isFinite(value);
      }
      function Int8(value) {
        return value << 24 >> 24 === value;
      }
      function Int16(value) {
        return value << 16 >> 16 === value;
      }
      function Int32(value) {
        return (value | 0) === value;
      }
      function Int53(value) {
        return typeof value === "number" && value >= -INT53_MAX && value <= INT53_MAX && Math.floor(value) === value;
      }
      function UInt8(value) {
        return (value & 255) === value;
      }
      function UInt16(value) {
        return (value & 65535) === value;
      }
      function UInt32(value) {
        return value >>> 0 === value;
      }
      function UInt53(value) {
        return typeof value === "number" && value >= 0 && value <= INT53_MAX && Math.floor(value) === value;
      }
      var types2 = {
        ArrayN: _ArrayN,
        Buffer: _Buffer,
        BufferN: _BufferN,
        Finite,
        Hex,
        HexN: _HexN,
        Int8,
        Int16,
        Int32,
        Int53,
        Range,
        StringN: _StringN,
        UInt8,
        UInt16,
        UInt32,
        UInt53
      };
      for (typeName in types2) {
        types2[typeName].toJSON = function(t) {
          return t;
        }.bind(null, typeName);
      }
      var typeName;
      module.exports = types2;
    }
  });

  // node_modules/typeforce/index.js
  var require_typeforce = __commonJS({
    "node_modules/typeforce/index.js"(exports7, module) {
      init_dirname();
      init_buffer2();
      init_process2();
      var ERRORS = require_errors();
      var NATIVE = require_native();
      var tfJSON = ERRORS.tfJSON;
      var TfTypeError = ERRORS.TfTypeError;
      var TfPropertyTypeError = ERRORS.TfPropertyTypeError;
      var tfSubError = ERRORS.tfSubError;
      var getValueTypeName = ERRORS.getValueTypeName;
      var TYPES = {
        arrayOf: function arrayOf(type, options) {
          type = compile(type);
          options = options || {};
          function _arrayOf(array, strict2) {
            if (!NATIVE.Array(array)) return false;
            if (NATIVE.Nil(array)) return false;
            if (options.minLength !== void 0 && array.length < options.minLength) return false;
            if (options.maxLength !== void 0 && array.length > options.maxLength) return false;
            if (options.length !== void 0 && array.length !== options.length) return false;
            return array.every(function(value, i) {
              try {
                return typeforce(type, value, strict2);
              } catch (e) {
                throw tfSubError(e, i);
              }
            });
          }
          _arrayOf.toJSON = function() {
            var str = "[" + tfJSON(type) + "]";
            if (options.length !== void 0) {
              str += "{" + options.length + "}";
            } else if (options.minLength !== void 0 || options.maxLength !== void 0) {
              str += "{" + (options.minLength === void 0 ? 0 : options.minLength) + "," + (options.maxLength === void 0 ? Infinity : options.maxLength) + "}";
            }
            return str;
          };
          return _arrayOf;
        },
        maybe: function maybe(type) {
          type = compile(type);
          function _maybe(value, strict2) {
            return NATIVE.Nil(value) || type(value, strict2, maybe);
          }
          _maybe.toJSON = function() {
            return "?" + tfJSON(type);
          };
          return _maybe;
        },
        map: function map(propertyType, propertyKeyType) {
          propertyType = compile(propertyType);
          if (propertyKeyType) propertyKeyType = compile(propertyKeyType);
          function _map(value, strict2) {
            if (!NATIVE.Object(value)) return false;
            if (NATIVE.Nil(value)) return false;
            for (var propertyName in value) {
              try {
                if (propertyKeyType) {
                  typeforce(propertyKeyType, propertyName, strict2);
                }
              } catch (e) {
                throw tfSubError(e, propertyName, "key");
              }
              try {
                var propertyValue = value[propertyName];
                typeforce(propertyType, propertyValue, strict2);
              } catch (e) {
                throw tfSubError(e, propertyName);
              }
            }
            return true;
          }
          if (propertyKeyType) {
            _map.toJSON = function() {
              return "{" + tfJSON(propertyKeyType) + ": " + tfJSON(propertyType) + "}";
            };
          } else {
            _map.toJSON = function() {
              return "{" + tfJSON(propertyType) + "}";
            };
          }
          return _map;
        },
        object: function object(uncompiled) {
          var type = {};
          for (var typePropertyName in uncompiled) {
            type[typePropertyName] = compile(uncompiled[typePropertyName]);
          }
          function _object(value, strict2) {
            if (!NATIVE.Object(value)) return false;
            if (NATIVE.Nil(value)) return false;
            var propertyName;
            try {
              for (propertyName in type) {
                var propertyType = type[propertyName];
                var propertyValue = value[propertyName];
                typeforce(propertyType, propertyValue, strict2);
              }
            } catch (e) {
              throw tfSubError(e, propertyName);
            }
            if (strict2) {
              for (propertyName in value) {
                if (type[propertyName]) continue;
                throw new TfPropertyTypeError(void 0, propertyName);
              }
            }
            return true;
          }
          _object.toJSON = function() {
            return tfJSON(type);
          };
          return _object;
        },
        anyOf: function anyOf() {
          var types2 = [].slice.call(arguments).map(compile);
          function _anyOf(value, strict2) {
            return types2.some(function(type) {
              try {
                return typeforce(type, value, strict2);
              } catch (e) {
                return false;
              }
            });
          }
          _anyOf.toJSON = function() {
            return types2.map(tfJSON).join("|");
          };
          return _anyOf;
        },
        allOf: function allOf() {
          var types2 = [].slice.call(arguments).map(compile);
          function _allOf(value, strict2) {
            return types2.every(function(type) {
              try {
                return typeforce(type, value, strict2);
              } catch (e) {
                return false;
              }
            });
          }
          _allOf.toJSON = function() {
            return types2.map(tfJSON).join(" & ");
          };
          return _allOf;
        },
        quacksLike: function quacksLike(type) {
          function _quacksLike(value) {
            return type === getValueTypeName(value);
          }
          _quacksLike.toJSON = function() {
            return type;
          };
          return _quacksLike;
        },
        tuple: function tuple() {
          var types2 = [].slice.call(arguments).map(compile);
          function _tuple(values, strict2) {
            if (NATIVE.Nil(values)) return false;
            if (NATIVE.Nil(values.length)) return false;
            if (strict2 && values.length !== types2.length) return false;
            return types2.every(function(type, i) {
              try {
                return typeforce(type, values[i], strict2);
              } catch (e) {
                throw tfSubError(e, i);
              }
            });
          }
          _tuple.toJSON = function() {
            return "(" + types2.map(tfJSON).join(", ") + ")";
          };
          return _tuple;
        },
        value: function value(expected) {
          function _value(actual) {
            return actual === expected;
          }
          _value.toJSON = function() {
            return expected;
          };
          return _value;
        }
      };
      TYPES.oneOf = TYPES.anyOf;
      function compile(type) {
        if (NATIVE.String(type)) {
          if (type[0] === "?") return TYPES.maybe(type.slice(1));
          return NATIVE[type] || TYPES.quacksLike(type);
        } else if (type && NATIVE.Object(type)) {
          if (NATIVE.Array(type)) {
            if (type.length !== 1) throw new TypeError("Expected compile() parameter of type Array of length 1");
            return TYPES.arrayOf(type[0]);
          }
          return TYPES.object(type);
        } else if (NATIVE.Function(type)) {
          return type;
        }
        return TYPES.value(type);
      }
      function typeforce(type, value, strict2, surrogate) {
        if (NATIVE.Function(type)) {
          if (type(value, strict2)) return true;
          throw new TfTypeError(surrogate || type, value);
        }
        return typeforce(compile(type), value, strict2);
      }
      for (typeName in NATIVE) {
        typeforce[typeName] = NATIVE[typeName];
      }
      var typeName;
      for (typeName in TYPES) {
        typeforce[typeName] = TYPES[typeName];
      }
      var EXTRA = require_extra();
      for (typeName in EXTRA) {
        typeforce[typeName] = EXTRA[typeName];
      }
      typeforce.compile = compile;
      typeforce.TfTypeError = TfTypeError;
      typeforce.TfPropertyTypeError = TfPropertyTypeError;
      module.exports = typeforce;
    }
  });

  // node_modules/bitcoinjs-lib/src/types.js
  var require_types = __commonJS({
    "node_modules/bitcoinjs-lib/src/types.js"(exports7) {
      "use strict";
      init_dirname();
      init_buffer2();
      init_process2();
      Object.defineProperty(exports7, "__esModule", { value: true });
      exports7.oneOf = exports7.Null = exports7.BufferN = exports7.Function = exports7.UInt32 = exports7.UInt8 = exports7.tuple = exports7.maybe = exports7.Hex = exports7.Buffer = exports7.String = exports7.Boolean = exports7.Array = exports7.Number = exports7.Hash256bit = exports7.Hash160bit = exports7.Buffer256bit = exports7.isTaptree = exports7.isTapleaf = exports7.TAPLEAF_VERSION_MASK = exports7.Satoshi = exports7.isPoint = exports7.stacksEqual = exports7.typeforce = void 0;
      var buffer_1 = (init_buffer(), __toCommonJS(buffer_exports));
      exports7.typeforce = require_typeforce();
      var ZERO32 = buffer_1.Buffer.alloc(32, 0);
      var EC_P = buffer_1.Buffer.from(
        "fffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f",
        "hex"
      );
      function stacksEqual(a, b) {
        if (a.length !== b.length) return false;
        return a.every((x, i) => {
          return x.equals(b[i]);
        });
      }
      exports7.stacksEqual = stacksEqual;
      function isPoint(p) {
        if (!buffer_1.Buffer.isBuffer(p)) return false;
        if (p.length < 33) return false;
        const t = p[0];
        const x = p.slice(1, 33);
        if (x.compare(ZERO32) === 0) return false;
        if (x.compare(EC_P) >= 0) return false;
        if ((t === 2 || t === 3) && p.length === 33) {
          return true;
        }
        const y = p.slice(33);
        if (y.compare(ZERO32) === 0) return false;
        if (y.compare(EC_P) >= 0) return false;
        if (t === 4 && p.length === 65) return true;
        return false;
      }
      exports7.isPoint = isPoint;
      var SATOSHI_MAX = 21 * 1e14;
      function Satoshi(value) {
        return exports7.typeforce.UInt53(value) && value <= SATOSHI_MAX;
      }
      exports7.Satoshi = Satoshi;
      exports7.TAPLEAF_VERSION_MASK = 254;
      function isTapleaf(o) {
        if (!o || !("output" in o)) return false;
        if (!buffer_1.Buffer.isBuffer(o.output)) return false;
        if (o.version !== void 0)
          return (o.version & exports7.TAPLEAF_VERSION_MASK) === o.version;
        return true;
      }
      exports7.isTapleaf = isTapleaf;
      function isTaptree(scriptTree) {
        if (!(0, exports7.Array)(scriptTree)) return isTapleaf(scriptTree);
        if (scriptTree.length !== 2) return false;
        return scriptTree.every((t) => isTaptree(t));
      }
      exports7.isTaptree = isTaptree;
      exports7.Buffer256bit = exports7.typeforce.BufferN(32);
      exports7.Hash160bit = exports7.typeforce.BufferN(20);
      exports7.Hash256bit = exports7.typeforce.BufferN(32);
      exports7.Number = exports7.typeforce.Number;
      exports7.Array = exports7.typeforce.Array;
      exports7.Boolean = exports7.typeforce.Boolean;
      exports7.String = exports7.typeforce.String;
      exports7.Buffer = exports7.typeforce.Buffer;
      exports7.Hex = exports7.typeforce.Hex;
      exports7.maybe = exports7.typeforce.maybe;
      exports7.tuple = exports7.typeforce.tuple;
      exports7.UInt8 = exports7.typeforce.UInt8;
      exports7.UInt32 = exports7.typeforce.UInt32;
      exports7.Function = exports7.typeforce.Function;
      exports7.BufferN = exports7.typeforce.BufferN;
      exports7.Null = exports7.typeforce.Null;
      exports7.oneOf = exports7.typeforce.oneOf;
    }
  });

  // node_modules/bitcoinjs-lib/src/script_signature.js
  var require_script_signature = __commonJS({
    "node_modules/bitcoinjs-lib/src/script_signature.js"(exports7) {
      "use strict";
      init_dirname();
      init_buffer2();
      init_process2();
      Object.defineProperty(exports7, "__esModule", { value: true });
      exports7.encode = exports7.decode = void 0;
      var bip66 = require_bip66();
      var script_1 = require_script();
      var types2 = require_types();
      var { typeforce } = types2;
      var ZERO = Buffer2.alloc(1, 0);
      function toDER(x) {
        let i = 0;
        while (x[i] === 0) ++i;
        if (i === x.length) return ZERO;
        x = x.slice(i);
        if (x[0] & 128) return Buffer2.concat([ZERO, x], 1 + x.length);
        return x;
      }
      function fromDER(x) {
        if (x[0] === 0) x = x.slice(1);
        const buffer = Buffer2.alloc(32, 0);
        const bstart = Math.max(0, 32 - x.length);
        x.copy(buffer, bstart);
        return buffer;
      }
      function decode(buffer) {
        const hashType = buffer.readUInt8(buffer.length - 1);
        if (!(0, script_1.isDefinedHashType)(hashType)) {
          throw new Error("Invalid hashType " + hashType);
        }
        const decoded = bip66.decode(buffer.slice(0, -1));
        const r = fromDER(decoded.r);
        const s = fromDER(decoded.s);
        const signature = Buffer2.concat([r, s], 64);
        return { signature, hashType };
      }
      exports7.decode = decode;
      function encode(signature, hashType) {
        typeforce(
          {
            signature: types2.BufferN(64),
            hashType: types2.UInt8
          },
          { signature, hashType }
        );
        if (!(0, script_1.isDefinedHashType)(hashType)) {
          throw new Error("Invalid hashType " + hashType);
        }
        const hashTypeBuffer = Buffer2.allocUnsafe(1);
        hashTypeBuffer.writeUInt8(hashType, 0);
        const r = toDER(signature.slice(0, 32));
        const s = toDER(signature.slice(32, 64));
        return Buffer2.concat([bip66.encode(r, s), hashTypeBuffer]);
      }
      exports7.encode = encode;
    }
  });

  // node_modules/bitcoinjs-lib/src/script.js
  var require_script = __commonJS({
    "node_modules/bitcoinjs-lib/src/script.js"(exports7) {
      "use strict";
      init_dirname();
      init_buffer2();
      init_process2();
      Object.defineProperty(exports7, "__esModule", { value: true });
      exports7.signature = exports7.number = exports7.isCanonicalScriptSignature = exports7.isDefinedHashType = exports7.isCanonicalPubKey = exports7.toStack = exports7.fromASM = exports7.toASM = exports7.decompile = exports7.compile = exports7.countNonPushOnlyOPs = exports7.isPushOnly = exports7.OPS = void 0;
      var bip66 = require_bip66();
      var ops_1 = require_ops();
      Object.defineProperty(exports7, "OPS", {
        enumerable: true,
        get: function() {
          return ops_1.OPS;
        }
      });
      var pushdata = require_push_data();
      var scriptNumber = require_script_number();
      var scriptSignature = require_script_signature();
      var types2 = require_types();
      var { typeforce } = types2;
      var OP_INT_BASE = ops_1.OPS.OP_RESERVED;
      function isOPInt(value) {
        return types2.Number(value) && (value === ops_1.OPS.OP_0 || value >= ops_1.OPS.OP_1 && value <= ops_1.OPS.OP_16 || value === ops_1.OPS.OP_1NEGATE);
      }
      function isPushOnlyChunk(value) {
        return types2.Buffer(value) || isOPInt(value);
      }
      function isPushOnly(value) {
        return types2.Array(value) && value.every(isPushOnlyChunk);
      }
      exports7.isPushOnly = isPushOnly;
      function countNonPushOnlyOPs(value) {
        return value.length - value.filter(isPushOnlyChunk).length;
      }
      exports7.countNonPushOnlyOPs = countNonPushOnlyOPs;
      function asMinimalOP(buffer) {
        if (buffer.length === 0) return ops_1.OPS.OP_0;
        if (buffer.length !== 1) return;
        if (buffer[0] >= 1 && buffer[0] <= 16) return OP_INT_BASE + buffer[0];
        if (buffer[0] === 129) return ops_1.OPS.OP_1NEGATE;
      }
      function chunksIsBuffer(buf) {
        return Buffer2.isBuffer(buf);
      }
      function chunksIsArray(buf) {
        return types2.Array(buf);
      }
      function singleChunkIsBuffer(buf) {
        return Buffer2.isBuffer(buf);
      }
      function compile(chunks) {
        if (chunksIsBuffer(chunks)) return chunks;
        typeforce(types2.Array, chunks);
        const bufferSize = chunks.reduce((accum, chunk) => {
          if (singleChunkIsBuffer(chunk)) {
            if (chunk.length === 1 && asMinimalOP(chunk) !== void 0) {
              return accum + 1;
            }
            return accum + pushdata.encodingLength(chunk.length) + chunk.length;
          }
          return accum + 1;
        }, 0);
        const buffer = Buffer2.allocUnsafe(bufferSize);
        let offset = 0;
        chunks.forEach((chunk) => {
          if (singleChunkIsBuffer(chunk)) {
            const opcode = asMinimalOP(chunk);
            if (opcode !== void 0) {
              buffer.writeUInt8(opcode, offset);
              offset += 1;
              return;
            }
            offset += pushdata.encode(buffer, chunk.length, offset);
            chunk.copy(buffer, offset);
            offset += chunk.length;
          } else {
            buffer.writeUInt8(chunk, offset);
            offset += 1;
          }
        });
        if (offset !== buffer.length) throw new Error("Could not decode chunks");
        return buffer;
      }
      exports7.compile = compile;
      function decompile(buffer) {
        if (chunksIsArray(buffer)) return buffer;
        typeforce(types2.Buffer, buffer);
        const chunks = [];
        let i = 0;
        while (i < buffer.length) {
          const opcode = buffer[i];
          if (opcode > ops_1.OPS.OP_0 && opcode <= ops_1.OPS.OP_PUSHDATA4) {
            const d = pushdata.decode(buffer, i);
            if (d === null) return null;
            i += d.size;
            if (i + d.number > buffer.length) return null;
            const data = buffer.slice(i, i + d.number);
            i += d.number;
            const op = asMinimalOP(data);
            if (op !== void 0) {
              chunks.push(op);
            } else {
              chunks.push(data);
            }
          } else {
            chunks.push(opcode);
            i += 1;
          }
        }
        return chunks;
      }
      exports7.decompile = decompile;
      function toASM(chunks) {
        if (chunksIsBuffer(chunks)) {
          chunks = decompile(chunks);
        }
        if (!chunks) {
          throw new Error("Could not convert invalid chunks to ASM");
        }
        return chunks.map((chunk) => {
          if (singleChunkIsBuffer(chunk)) {
            const op = asMinimalOP(chunk);
            if (op === void 0) return chunk.toString("hex");
            chunk = op;
          }
          return ops_1.REVERSE_OPS[chunk];
        }).join(" ");
      }
      exports7.toASM = toASM;
      function fromASM(asm) {
        typeforce(types2.String, asm);
        return compile(
          asm.split(" ").map((chunkStr) => {
            if (ops_1.OPS[chunkStr] !== void 0) return ops_1.OPS[chunkStr];
            typeforce(types2.Hex, chunkStr);
            return Buffer2.from(chunkStr, "hex");
          })
        );
      }
      exports7.fromASM = fromASM;
      function toStack(chunks) {
        chunks = decompile(chunks);
        typeforce(isPushOnly, chunks);
        return chunks.map((op) => {
          if (singleChunkIsBuffer(op)) return op;
          if (op === ops_1.OPS.OP_0) return Buffer2.allocUnsafe(0);
          return scriptNumber.encode(op - OP_INT_BASE);
        });
      }
      exports7.toStack = toStack;
      function isCanonicalPubKey(buffer) {
        return types2.isPoint(buffer);
      }
      exports7.isCanonicalPubKey = isCanonicalPubKey;
      function isDefinedHashType(hashType) {
        const hashTypeMod = hashType & ~128;
        return hashTypeMod > 0 && hashTypeMod < 4;
      }
      exports7.isDefinedHashType = isDefinedHashType;
      function isCanonicalScriptSignature(buffer) {
        if (!Buffer2.isBuffer(buffer)) return false;
        if (!isDefinedHashType(buffer[buffer.length - 1])) return false;
        return bip66.check(buffer.slice(0, -1));
      }
      exports7.isCanonicalScriptSignature = isCanonicalScriptSignature;
      exports7.number = scriptNumber;
      exports7.signature = scriptSignature;
    }
  });

  // node_modules/bitcoinjs-lib/src/payments/lazy.js
  var require_lazy = __commonJS({
    "node_modules/bitcoinjs-lib/src/payments/lazy.js"(exports7) {
      "use strict";
      init_dirname();
      init_buffer2();
      init_process2();
      Object.defineProperty(exports7, "__esModule", { value: true });
      exports7.value = exports7.prop = void 0;
      function prop(object, name, f) {
        Object.defineProperty(object, name, {
          configurable: true,
          enumerable: true,
          get() {
            const _value = f.call(this);
            this[name] = _value;
            return _value;
          },
          set(_value) {
            Object.defineProperty(this, name, {
              configurable: true,
              enumerable: true,
              value: _value,
              writable: true
            });
          }
        });
      }
      exports7.prop = prop;
      function value(f) {
        let _value;
        return () => {
          if (_value !== void 0) return _value;
          _value = f();
          return _value;
        };
      }
      exports7.value = value;
    }
  });

  // node_modules/bitcoinjs-lib/src/payments/embed.js
  var require_embed = __commonJS({
    "node_modules/bitcoinjs-lib/src/payments/embed.js"(exports7) {
      "use strict";
      init_dirname();
      init_buffer2();
      init_process2();
      Object.defineProperty(exports7, "__esModule", { value: true });
      exports7.p2data = void 0;
      var networks_1 = require_networks();
      var bscript = require_script();
      var types_1 = require_types();
      var lazy = require_lazy();
      var OPS = bscript.OPS;
      function p2data(a, opts) {
        if (!a.data && !a.output) throw new TypeError("Not enough data");
        opts = Object.assign({ validate: true }, opts || {});
        (0, types_1.typeforce)(
          {
            network: types_1.typeforce.maybe(types_1.typeforce.Object),
            output: types_1.typeforce.maybe(types_1.typeforce.Buffer),
            data: types_1.typeforce.maybe(
              types_1.typeforce.arrayOf(types_1.typeforce.Buffer)
            )
          },
          a
        );
        const network2 = a.network || networks_1.bitcoin;
        const o = { name: "embed", network: network2 };
        lazy.prop(o, "output", () => {
          if (!a.data) return;
          return bscript.compile([OPS.OP_RETURN].concat(a.data));
        });
        lazy.prop(o, "data", () => {
          if (!a.output) return;
          return bscript.decompile(a.output).slice(1);
        });
        if (opts.validate) {
          if (a.output) {
            const chunks = bscript.decompile(a.output);
            if (chunks[0] !== OPS.OP_RETURN) throw new TypeError("Output is invalid");
            if (!chunks.slice(1).every(types_1.typeforce.Buffer))
              throw new TypeError("Output is invalid");
            if (a.data && !(0, types_1.stacksEqual)(a.data, o.data))
              throw new TypeError("Data mismatch");
          }
        }
        return Object.assign(o, a);
      }
      exports7.p2data = p2data;
    }
  });

  // node_modules/bitcoinjs-lib/src/payments/p2ms.js
  var require_p2ms = __commonJS({
    "node_modules/bitcoinjs-lib/src/payments/p2ms.js"(exports7) {
      "use strict";
      init_dirname();
      init_buffer2();
      init_process2();
      Object.defineProperty(exports7, "__esModule", { value: true });
      exports7.p2ms = void 0;
      var networks_1 = require_networks();
      var bscript = require_script();
      var types_1 = require_types();
      var lazy = require_lazy();
      var OPS = bscript.OPS;
      var OP_INT_BASE = OPS.OP_RESERVED;
      function p2ms(a, opts) {
        if (!a.input && !a.output && !(a.pubkeys && a.m !== void 0) && !a.signatures)
          throw new TypeError("Not enough data");
        opts = Object.assign({ validate: true }, opts || {});
        function isAcceptableSignature(x) {
          return bscript.isCanonicalScriptSignature(x) || (opts.allowIncomplete && x === OPS.OP_0) !== void 0;
        }
        (0, types_1.typeforce)(
          {
            network: types_1.typeforce.maybe(types_1.typeforce.Object),
            m: types_1.typeforce.maybe(types_1.typeforce.Number),
            n: types_1.typeforce.maybe(types_1.typeforce.Number),
            output: types_1.typeforce.maybe(types_1.typeforce.Buffer),
            pubkeys: types_1.typeforce.maybe(
              types_1.typeforce.arrayOf(types_1.isPoint)
            ),
            signatures: types_1.typeforce.maybe(
              types_1.typeforce.arrayOf(isAcceptableSignature)
            ),
            input: types_1.typeforce.maybe(types_1.typeforce.Buffer)
          },
          a
        );
        const network2 = a.network || networks_1.bitcoin;
        const o = { network: network2 };
        let chunks = [];
        let decoded = false;
        function decode(output) {
          if (decoded) return;
          decoded = true;
          chunks = bscript.decompile(output);
          o.m = chunks[0] - OP_INT_BASE;
          o.n = chunks[chunks.length - 2] - OP_INT_BASE;
          o.pubkeys = chunks.slice(1, -2);
        }
        lazy.prop(o, "output", () => {
          if (!a.m) return;
          if (!o.n) return;
          if (!a.pubkeys) return;
          return bscript.compile(
            [].concat(
              OP_INT_BASE + a.m,
              a.pubkeys,
              OP_INT_BASE + o.n,
              OPS.OP_CHECKMULTISIG
            )
          );
        });
        lazy.prop(o, "m", () => {
          if (!o.output) return;
          decode(o.output);
          return o.m;
        });
        lazy.prop(o, "n", () => {
          if (!o.pubkeys) return;
          return o.pubkeys.length;
        });
        lazy.prop(o, "pubkeys", () => {
          if (!a.output) return;
          decode(a.output);
          return o.pubkeys;
        });
        lazy.prop(o, "signatures", () => {
          if (!a.input) return;
          return bscript.decompile(a.input).slice(1);
        });
        lazy.prop(o, "input", () => {
          if (!a.signatures) return;
          return bscript.compile([OPS.OP_0].concat(a.signatures));
        });
        lazy.prop(o, "witness", () => {
          if (!o.input) return;
          return [];
        });
        lazy.prop(o, "name", () => {
          if (!o.m || !o.n) return;
          return `p2ms(${o.m} of ${o.n})`;
        });
        if (opts.validate) {
          if (a.output) {
            decode(a.output);
            if (!types_1.typeforce.Number(chunks[0]))
              throw new TypeError("Output is invalid");
            if (!types_1.typeforce.Number(chunks[chunks.length - 2]))
              throw new TypeError("Output is invalid");
            if (chunks[chunks.length - 1] !== OPS.OP_CHECKMULTISIG)
              throw new TypeError("Output is invalid");
            if (o.m <= 0 || o.n > 16 || o.m > o.n || o.n !== chunks.length - 3)
              throw new TypeError("Output is invalid");
            if (!o.pubkeys.every((x) => (0, types_1.isPoint)(x)))
              throw new TypeError("Output is invalid");
            if (a.m !== void 0 && a.m !== o.m) throw new TypeError("m mismatch");
            if (a.n !== void 0 && a.n !== o.n) throw new TypeError("n mismatch");
            if (a.pubkeys && !(0, types_1.stacksEqual)(a.pubkeys, o.pubkeys))
              throw new TypeError("Pubkeys mismatch");
          }
          if (a.pubkeys) {
            if (a.n !== void 0 && a.n !== a.pubkeys.length)
              throw new TypeError("Pubkey count mismatch");
            o.n = a.pubkeys.length;
            if (o.n < o.m) throw new TypeError("Pubkey count cannot be less than m");
          }
          if (a.signatures) {
            if (a.signatures.length < o.m)
              throw new TypeError("Not enough signatures provided");
            if (a.signatures.length > o.m)
              throw new TypeError("Too many signatures provided");
          }
          if (a.input) {
            if (a.input[0] !== OPS.OP_0) throw new TypeError("Input is invalid");
            if (o.signatures.length === 0 || !o.signatures.every(isAcceptableSignature))
              throw new TypeError("Input has invalid signature(s)");
            if (a.signatures && !(0, types_1.stacksEqual)(a.signatures, o.signatures))
              throw new TypeError("Signature mismatch");
            if (a.m !== void 0 && a.m !== a.signatures.length)
              throw new TypeError("Signature count mismatch");
          }
        }
        return Object.assign(o, a);
      }
      exports7.p2ms = p2ms;
    }
  });

  // node_modules/bitcoinjs-lib/src/payments/p2pk.js
  var require_p2pk = __commonJS({
    "node_modules/bitcoinjs-lib/src/payments/p2pk.js"(exports7) {
      "use strict";
      init_dirname();
      init_buffer2();
      init_process2();
      Object.defineProperty(exports7, "__esModule", { value: true });
      exports7.p2pk = void 0;
      var networks_1 = require_networks();
      var bscript = require_script();
      var types_1 = require_types();
      var lazy = require_lazy();
      var OPS = bscript.OPS;
      function p2pk(a, opts) {
        if (!a.input && !a.output && !a.pubkey && !a.input && !a.signature)
          throw new TypeError("Not enough data");
        opts = Object.assign({ validate: true }, opts || {});
        (0, types_1.typeforce)(
          {
            network: types_1.typeforce.maybe(types_1.typeforce.Object),
            output: types_1.typeforce.maybe(types_1.typeforce.Buffer),
            pubkey: types_1.typeforce.maybe(types_1.isPoint),
            signature: types_1.typeforce.maybe(bscript.isCanonicalScriptSignature),
            input: types_1.typeforce.maybe(types_1.typeforce.Buffer)
          },
          a
        );
        const _chunks = lazy.value(() => {
          return bscript.decompile(a.input);
        });
        const network2 = a.network || networks_1.bitcoin;
        const o = { name: "p2pk", network: network2 };
        lazy.prop(o, "output", () => {
          if (!a.pubkey) return;
          return bscript.compile([a.pubkey, OPS.OP_CHECKSIG]);
        });
        lazy.prop(o, "pubkey", () => {
          if (!a.output) return;
          return a.output.slice(1, -1);
        });
        lazy.prop(o, "signature", () => {
          if (!a.input) return;
          return _chunks()[0];
        });
        lazy.prop(o, "input", () => {
          if (!a.signature) return;
          return bscript.compile([a.signature]);
        });
        lazy.prop(o, "witness", () => {
          if (!o.input) return;
          return [];
        });
        if (opts.validate) {
          if (a.output) {
            if (a.output[a.output.length - 1] !== OPS.OP_CHECKSIG)
              throw new TypeError("Output is invalid");
            if (!(0, types_1.isPoint)(o.pubkey))
              throw new TypeError("Output pubkey is invalid");
            if (a.pubkey && !a.pubkey.equals(o.pubkey))
              throw new TypeError("Pubkey mismatch");
          }
          if (a.signature) {
            if (a.input && !a.input.equals(o.input))
              throw new TypeError("Signature mismatch");
          }
          if (a.input) {
            if (_chunks().length !== 1) throw new TypeError("Input is invalid");
            if (!bscript.isCanonicalScriptSignature(o.signature))
              throw new TypeError("Input has invalid signature");
          }
        }
        return Object.assign(o, a);
      }
      exports7.p2pk = p2pk;
    }
  });

  // node_modules/@noble/hashes/crypto.js
  var require_crypto = __commonJS({
    "node_modules/@noble/hashes/crypto.js"(exports7) {
      "use strict";
      init_dirname();
      init_buffer2();
      init_process2();
      Object.defineProperty(exports7, "__esModule", { value: true });
      exports7.crypto = void 0;
      exports7.crypto = typeof globalThis === "object" && "crypto" in globalThis ? globalThis.crypto : void 0;
    }
  });

  // node_modules/@noble/hashes/utils.js
  var require_utils = __commonJS({
    "node_modules/@noble/hashes/utils.js"(exports7) {
      "use strict";
      init_dirname();
      init_buffer2();
      init_process2();
      Object.defineProperty(exports7, "__esModule", { value: true });
      exports7.wrapXOFConstructorWithOpts = exports7.wrapConstructorWithOpts = exports7.wrapConstructor = exports7.Hash = exports7.nextTick = exports7.swap32IfBE = exports7.byteSwapIfBE = exports7.swap8IfBE = exports7.isLE = void 0;
      exports7.isBytes = isBytes2;
      exports7.anumber = anumber2;
      exports7.abytes = abytes2;
      exports7.ahash = ahash2;
      exports7.aexists = aexists2;
      exports7.aoutput = aoutput2;
      exports7.u8 = u8;
      exports7.u32 = u32;
      exports7.clean = clean2;
      exports7.createView = createView2;
      exports7.rotr = rotr2;
      exports7.rotl = rotl;
      exports7.byteSwap = byteSwap;
      exports7.byteSwap32 = byteSwap32;
      exports7.bytesToHex = bytesToHex2;
      exports7.hexToBytes = hexToBytes2;
      exports7.asyncLoop = asyncLoop;
      exports7.utf8ToBytes = utf8ToBytes2;
      exports7.bytesToUtf8 = bytesToUtf82;
      exports7.toBytes = toBytes2;
      exports7.kdfInputToBytes = kdfInputToBytes;
      exports7.concatBytes = concatBytes2;
      exports7.checkOpts = checkOpts;
      exports7.createHasher = createHasher2;
      exports7.createOptHasher = createOptHasher;
      exports7.createXOFer = createXOFer;
      exports7.randomBytes = randomBytes2;
      var crypto_1 = require_crypto();
      function isBytes2(a) {
        return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array";
      }
      function anumber2(n) {
        if (!Number.isSafeInteger(n) || n < 0)
          throw new Error("positive integer expected, got " + n);
      }
      function abytes2(b, ...lengths) {
        if (!isBytes2(b))
          throw new Error("Uint8Array expected");
        if (lengths.length > 0 && !lengths.includes(b.length))
          throw new Error("Uint8Array expected of length " + lengths + ", got length=" + b.length);
      }
      function ahash2(h) {
        if (typeof h !== "function" || typeof h.create !== "function")
          throw new Error("Hash should be wrapped by utils.createHasher");
        anumber2(h.outputLen);
        anumber2(h.blockLen);
      }
      function aexists2(instance, checkFinished = true) {
        if (instance.destroyed)
          throw new Error("Hash instance has been destroyed");
        if (checkFinished && instance.finished)
          throw new Error("Hash#digest() has already been called");
      }
      function aoutput2(out, instance) {
        abytes2(out);
        const min = instance.outputLen;
        if (out.length < min) {
          throw new Error("digestInto() expects output buffer of length at least " + min);
        }
      }
      function u8(arr) {
        return new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength);
      }
      function u32(arr) {
        return new Uint32Array(arr.buffer, arr.byteOffset, Math.floor(arr.byteLength / 4));
      }
      function clean2(...arrays) {
        for (let i = 0; i < arrays.length; i++) {
          arrays[i].fill(0);
        }
      }
      function createView2(arr) {
        return new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
      }
      function rotr2(word, shift) {
        return word << 32 - shift | word >>> shift;
      }
      function rotl(word, shift) {
        return word << shift | word >>> 32 - shift >>> 0;
      }
      exports7.isLE = (() => new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68)();
      function byteSwap(word) {
        return word << 24 & 4278190080 | word << 8 & 16711680 | word >>> 8 & 65280 | word >>> 24 & 255;
      }
      exports7.swap8IfBE = exports7.isLE ? (n) => n : (n) => byteSwap(n);
      exports7.byteSwapIfBE = exports7.swap8IfBE;
      function byteSwap32(arr) {
        for (let i = 0; i < arr.length; i++) {
          arr[i] = byteSwap(arr[i]);
        }
        return arr;
      }
      exports7.swap32IfBE = exports7.isLE ? (u) => u : byteSwap32;
      var hasHexBuiltin2 = /* @__PURE__ */ (() => (
        // @ts-ignore
        typeof Uint8Array.from([]).toHex === "function" && typeof Uint8Array.fromHex === "function"
      ))();
      var hexes2 = /* @__PURE__ */ Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, "0"));
      function bytesToHex2(bytes) {
        abytes2(bytes);
        if (hasHexBuiltin2)
          return bytes.toHex();
        let hex = "";
        for (let i = 0; i < bytes.length; i++) {
          hex += hexes2[bytes[i]];
        }
        return hex;
      }
      var asciis2 = { _0: 48, _9: 57, A: 65, F: 70, a: 97, f: 102 };
      function asciiToBase162(ch) {
        if (ch >= asciis2._0 && ch <= asciis2._9)
          return ch - asciis2._0;
        if (ch >= asciis2.A && ch <= asciis2.F)
          return ch - (asciis2.A - 10);
        if (ch >= asciis2.a && ch <= asciis2.f)
          return ch - (asciis2.a - 10);
        return;
      }
      function hexToBytes2(hex) {
        if (typeof hex !== "string")
          throw new Error("hex string expected, got " + typeof hex);
        if (hasHexBuiltin2)
          return Uint8Array.fromHex(hex);
        const hl = hex.length;
        const al = hl / 2;
        if (hl % 2)
          throw new Error("hex string expected, got unpadded hex of length " + hl);
        const array = new Uint8Array(al);
        for (let ai = 0, hi = 0; ai < al; ai++, hi += 2) {
          const n1 = asciiToBase162(hex.charCodeAt(hi));
          const n2 = asciiToBase162(hex.charCodeAt(hi + 1));
          if (n1 === void 0 || n2 === void 0) {
            const char = hex[hi] + hex[hi + 1];
            throw new Error('hex string expected, got non-hex character "' + char + '" at index ' + hi);
          }
          array[ai] = n1 * 16 + n2;
        }
        return array;
      }
      var nextTick2 = async () => {
      };
      exports7.nextTick = nextTick2;
      async function asyncLoop(iters, tick, cb) {
        let ts = Date.now();
        for (let i = 0; i < iters; i++) {
          cb(i);
          const diff = Date.now() - ts;
          if (diff >= 0 && diff < tick)
            continue;
          await (0, exports7.nextTick)();
          ts += diff;
        }
      }
      function utf8ToBytes2(str) {
        if (typeof str !== "string")
          throw new Error("string expected");
        return new Uint8Array(new TextEncoder().encode(str));
      }
      function bytesToUtf82(bytes) {
        return new TextDecoder().decode(bytes);
      }
      function toBytes2(data) {
        if (typeof data === "string")
          data = utf8ToBytes2(data);
        abytes2(data);
        return data;
      }
      function kdfInputToBytes(data) {
        if (typeof data === "string")
          data = utf8ToBytes2(data);
        abytes2(data);
        return data;
      }
      function concatBytes2(...arrays) {
        let sum = 0;
        for (let i = 0; i < arrays.length; i++) {
          const a = arrays[i];
          abytes2(a);
          sum += a.length;
        }
        const res = new Uint8Array(sum);
        for (let i = 0, pad = 0; i < arrays.length; i++) {
          const a = arrays[i];
          res.set(a, pad);
          pad += a.length;
        }
        return res;
      }
      function checkOpts(defaults, opts) {
        if (opts !== void 0 && {}.toString.call(opts) !== "[object Object]")
          throw new Error("options should be object or undefined");
        const merged = Object.assign(defaults, opts);
        return merged;
      }
      var Hash2 = class {
      };
      exports7.Hash = Hash2;
      function createHasher2(hashCons) {
        const hashC = (msg) => hashCons().update(toBytes2(msg)).digest();
        const tmp = hashCons();
        hashC.outputLen = tmp.outputLen;
        hashC.blockLen = tmp.blockLen;
        hashC.create = () => hashCons();
        return hashC;
      }
      function createOptHasher(hashCons) {
        const hashC = (msg, opts) => hashCons(opts).update(toBytes2(msg)).digest();
        const tmp = hashCons({});
        hashC.outputLen = tmp.outputLen;
        hashC.blockLen = tmp.blockLen;
        hashC.create = (opts) => hashCons(opts);
        return hashC;
      }
      function createXOFer(hashCons) {
        const hashC = (msg, opts) => hashCons(opts).update(toBytes2(msg)).digest();
        const tmp = hashCons({});
        hashC.outputLen = tmp.outputLen;
        hashC.blockLen = tmp.blockLen;
        hashC.create = (opts) => hashCons(opts);
        return hashC;
      }
      exports7.wrapConstructor = createHasher2;
      exports7.wrapConstructorWithOpts = createOptHasher;
      exports7.wrapXOFConstructorWithOpts = createXOFer;
      function randomBytes2(bytesLength = 32) {
        if (crypto_1.crypto && typeof crypto_1.crypto.getRandomValues === "function") {
          return crypto_1.crypto.getRandomValues(new Uint8Array(bytesLength));
        }
        if (crypto_1.crypto && typeof crypto_1.crypto.randomBytes === "function") {
          return Uint8Array.from(crypto_1.crypto.randomBytes(bytesLength));
        }
        throw new Error("crypto.getRandomValues must be defined");
      }
    }
  });

  // node_modules/@noble/hashes/_md.js
  var require_md = __commonJS({
    "node_modules/@noble/hashes/_md.js"(exports7) {
      "use strict";
      init_dirname();
      init_buffer2();
      init_process2();
      Object.defineProperty(exports7, "__esModule", { value: true });
      exports7.SHA512_IV = exports7.SHA384_IV = exports7.SHA224_IV = exports7.SHA256_IV = exports7.HashMD = void 0;
      exports7.setBigUint64 = setBigUint642;
      exports7.Chi = Chi2;
      exports7.Maj = Maj2;
      var utils_ts_1 = require_utils();
      function setBigUint642(view, byteOffset, value, isLE) {
        if (typeof view.setBigUint64 === "function")
          return view.setBigUint64(byteOffset, value, isLE);
        const _32n2 = BigInt(32);
        const _u32_max = BigInt(4294967295);
        const wh = Number(value >> _32n2 & _u32_max);
        const wl = Number(value & _u32_max);
        const h = isLE ? 4 : 0;
        const l = isLE ? 0 : 4;
        view.setUint32(byteOffset + h, wh, isLE);
        view.setUint32(byteOffset + l, wl, isLE);
      }
      function Chi2(a, b, c) {
        return a & b ^ ~a & c;
      }
      function Maj2(a, b, c) {
        return a & b ^ a & c ^ b & c;
      }
      var HashMD2 = class extends utils_ts_1.Hash {
        constructor(blockLen, outputLen, padOffset, isLE) {
          super();
          this.finished = false;
          this.length = 0;
          this.pos = 0;
          this.destroyed = false;
          this.blockLen = blockLen;
          this.outputLen = outputLen;
          this.padOffset = padOffset;
          this.isLE = isLE;
          this.buffer = new Uint8Array(blockLen);
          this.view = (0, utils_ts_1.createView)(this.buffer);
        }
        update(data) {
          (0, utils_ts_1.aexists)(this);
          data = (0, utils_ts_1.toBytes)(data);
          (0, utils_ts_1.abytes)(data);
          const { view, buffer, blockLen } = this;
          const len = data.length;
          for (let pos = 0; pos < len; ) {
            const take = Math.min(blockLen - this.pos, len - pos);
            if (take === blockLen) {
              const dataView = (0, utils_ts_1.createView)(data);
              for (; blockLen <= len - pos; pos += blockLen)
                this.process(dataView, pos);
              continue;
            }
            buffer.set(data.subarray(pos, pos + take), this.pos);
            this.pos += take;
            pos += take;
            if (this.pos === blockLen) {
              this.process(view, 0);
              this.pos = 0;
            }
          }
          this.length += data.length;
          this.roundClean();
          return this;
        }
        digestInto(out) {
          (0, utils_ts_1.aexists)(this);
          (0, utils_ts_1.aoutput)(out, this);
          this.finished = true;
          const { buffer, view, blockLen, isLE } = this;
          let { pos } = this;
          buffer[pos++] = 128;
          (0, utils_ts_1.clean)(this.buffer.subarray(pos));
          if (this.padOffset > blockLen - pos) {
            this.process(view, 0);
            pos = 0;
          }
          for (let i = pos; i < blockLen; i++)
            buffer[i] = 0;
          setBigUint642(view, blockLen - 8, BigInt(this.length * 8), isLE);
          this.process(view, 0);
          const oview = (0, utils_ts_1.createView)(out);
          const len = this.outputLen;
          if (len % 4)
            throw new Error("_sha2: outputLen should be aligned to 32bit");
          const outLen = len / 4;
          const state = this.get();
          if (outLen > state.length)
            throw new Error("_sha2: outputLen bigger than state");
          for (let i = 0; i < outLen; i++)
            oview.setUint32(4 * i, state[i], isLE);
        }
        digest() {
          const { buffer, outputLen } = this;
          this.digestInto(buffer);
          const res = buffer.slice(0, outputLen);
          this.destroy();
          return res;
        }
        _cloneInto(to) {
          to || (to = new this.constructor());
          to.set(...this.get());
          const { blockLen, buffer, length, finished, destroyed, pos } = this;
          to.destroyed = destroyed;
          to.finished = finished;
          to.length = length;
          to.pos = pos;
          if (length % blockLen)
            to.buffer.set(buffer);
          return to;
        }
        clone() {
          return this._cloneInto();
        }
      };
      exports7.HashMD = HashMD2;
      exports7.SHA256_IV = Uint32Array.from([
        1779033703,
        3144134277,
        1013904242,
        2773480762,
        1359893119,
        2600822924,
        528734635,
        1541459225
      ]);
      exports7.SHA224_IV = Uint32Array.from([
        3238371032,
        914150663,
        812702999,
        4144912697,
        4290775857,
        1750603025,
        1694076839,
        3204075428
      ]);
      exports7.SHA384_IV = Uint32Array.from([
        3418070365,
        3238371032,
        1654270250,
        914150663,
        2438529370,
        812702999,
        355462360,
        4144912697,
        1731405415,
        4290775857,
        2394180231,
        1750603025,
        3675008525,
        1694076839,
        1203062813,
        3204075428
      ]);
      exports7.SHA512_IV = Uint32Array.from([
        1779033703,
        4089235720,
        3144134277,
        2227873595,
        1013904242,
        4271175723,
        2773480762,
        1595750129,
        1359893119,
        2917565137,
        2600822924,
        725511199,
        528734635,
        4215389547,
        1541459225,
        327033209
      ]);
    }
  });

  // node_modules/@noble/hashes/legacy.js
  var require_legacy = __commonJS({
    "node_modules/@noble/hashes/legacy.js"(exports7) {
      "use strict";
      init_dirname();
      init_buffer2();
      init_process2();
      Object.defineProperty(exports7, "__esModule", { value: true });
      exports7.ripemd160 = exports7.RIPEMD160 = exports7.md5 = exports7.MD5 = exports7.sha1 = exports7.SHA1 = void 0;
      var _md_ts_1 = require_md();
      var utils_ts_1 = require_utils();
      var SHA1_IV = /* @__PURE__ */ Uint32Array.from([
        1732584193,
        4023233417,
        2562383102,
        271733878,
        3285377520
      ]);
      var SHA1_W = /* @__PURE__ */ new Uint32Array(80);
      var SHA1 = class extends _md_ts_1.HashMD {
        constructor() {
          super(64, 20, 8, false);
          this.A = SHA1_IV[0] | 0;
          this.B = SHA1_IV[1] | 0;
          this.C = SHA1_IV[2] | 0;
          this.D = SHA1_IV[3] | 0;
          this.E = SHA1_IV[4] | 0;
        }
        get() {
          const { A, B, C, D, E } = this;
          return [A, B, C, D, E];
        }
        set(A, B, C, D, E) {
          this.A = A | 0;
          this.B = B | 0;
          this.C = C | 0;
          this.D = D | 0;
          this.E = E | 0;
        }
        process(view, offset) {
          for (let i = 0; i < 16; i++, offset += 4)
            SHA1_W[i] = view.getUint32(offset, false);
          for (let i = 16; i < 80; i++)
            SHA1_W[i] = (0, utils_ts_1.rotl)(SHA1_W[i - 3] ^ SHA1_W[i - 8] ^ SHA1_W[i - 14] ^ SHA1_W[i - 16], 1);
          let { A, B, C, D, E } = this;
          for (let i = 0; i < 80; i++) {
            let F, K2;
            if (i < 20) {
              F = (0, _md_ts_1.Chi)(B, C, D);
              K2 = 1518500249;
            } else if (i < 40) {
              F = B ^ C ^ D;
              K2 = 1859775393;
            } else if (i < 60) {
              F = (0, _md_ts_1.Maj)(B, C, D);
              K2 = 2400959708;
            } else {
              F = B ^ C ^ D;
              K2 = 3395469782;
            }
            const T = (0, utils_ts_1.rotl)(A, 5) + F + E + K2 + SHA1_W[i] | 0;
            E = D;
            D = C;
            C = (0, utils_ts_1.rotl)(B, 30);
            B = A;
            A = T;
          }
          A = A + this.A | 0;
          B = B + this.B | 0;
          C = C + this.C | 0;
          D = D + this.D | 0;
          E = E + this.E | 0;
          this.set(A, B, C, D, E);
        }
        roundClean() {
          (0, utils_ts_1.clean)(SHA1_W);
        }
        destroy() {
          this.set(0, 0, 0, 0, 0);
          (0, utils_ts_1.clean)(this.buffer);
        }
      };
      exports7.SHA1 = SHA1;
      exports7.sha1 = (0, utils_ts_1.createHasher)(() => new SHA1());
      var p32 = /* @__PURE__ */ Math.pow(2, 32);
      var K = /* @__PURE__ */ Array.from({ length: 64 }, (_, i) => Math.floor(p32 * Math.abs(Math.sin(i + 1))));
      var MD5_IV = /* @__PURE__ */ SHA1_IV.slice(0, 4);
      var MD5_W = /* @__PURE__ */ new Uint32Array(16);
      var MD5 = class extends _md_ts_1.HashMD {
        constructor() {
          super(64, 16, 8, true);
          this.A = MD5_IV[0] | 0;
          this.B = MD5_IV[1] | 0;
          this.C = MD5_IV[2] | 0;
          this.D = MD5_IV[3] | 0;
        }
        get() {
          const { A, B, C, D } = this;
          return [A, B, C, D];
        }
        set(A, B, C, D) {
          this.A = A | 0;
          this.B = B | 0;
          this.C = C | 0;
          this.D = D | 0;
        }
        process(view, offset) {
          for (let i = 0; i < 16; i++, offset += 4)
            MD5_W[i] = view.getUint32(offset, true);
          let { A, B, C, D } = this;
          for (let i = 0; i < 64; i++) {
            let F, g, s;
            if (i < 16) {
              F = (0, _md_ts_1.Chi)(B, C, D);
              g = i;
              s = [7, 12, 17, 22];
            } else if (i < 32) {
              F = (0, _md_ts_1.Chi)(D, B, C);
              g = (5 * i + 1) % 16;
              s = [5, 9, 14, 20];
            } else if (i < 48) {
              F = B ^ C ^ D;
              g = (3 * i + 5) % 16;
              s = [4, 11, 16, 23];
            } else {
              F = C ^ (B | ~D);
              g = 7 * i % 16;
              s = [6, 10, 15, 21];
            }
            F = F + A + K[i] + MD5_W[g];
            A = D;
            D = C;
            C = B;
            B = B + (0, utils_ts_1.rotl)(F, s[i % 4]);
          }
          A = A + this.A | 0;
          B = B + this.B | 0;
          C = C + this.C | 0;
          D = D + this.D | 0;
          this.set(A, B, C, D);
        }
        roundClean() {
          (0, utils_ts_1.clean)(MD5_W);
        }
        destroy() {
          this.set(0, 0, 0, 0);
          (0, utils_ts_1.clean)(this.buffer);
        }
      };
      exports7.MD5 = MD5;
      exports7.md5 = (0, utils_ts_1.createHasher)(() => new MD5());
      var Rho160 = /* @__PURE__ */ Uint8Array.from([
        7,
        4,
        13,
        1,
        10,
        6,
        15,
        3,
        12,
        0,
        9,
        5,
        2,
        14,
        11,
        8
      ]);
      var Id160 = /* @__PURE__ */ (() => Uint8Array.from(new Array(16).fill(0).map((_, i) => i)))();
      var Pi160 = /* @__PURE__ */ (() => Id160.map((i) => (9 * i + 5) % 16))();
      var idxLR = /* @__PURE__ */ (() => {
        const L = [Id160];
        const R = [Pi160];
        const res = [L, R];
        for (let i = 0; i < 4; i++)
          for (let j of res)
            j.push(j[i].map((k) => Rho160[k]));
        return res;
      })();
      var idxL = /* @__PURE__ */ (() => idxLR[0])();
      var idxR = /* @__PURE__ */ (() => idxLR[1])();
      var shifts160 = /* @__PURE__ */ [
        [11, 14, 15, 12, 5, 8, 7, 9, 11, 13, 14, 15, 6, 7, 9, 8],
        [12, 13, 11, 15, 6, 9, 9, 7, 12, 15, 11, 13, 7, 8, 7, 7],
        [13, 15, 14, 11, 7, 7, 6, 8, 13, 14, 13, 12, 5, 5, 6, 9],
        [14, 11, 12, 14, 8, 6, 5, 5, 15, 12, 15, 14, 9, 9, 8, 6],
        [15, 12, 13, 13, 9, 5, 8, 6, 14, 11, 12, 11, 8, 6, 5, 5]
      ].map((i) => Uint8Array.from(i));
      var shiftsL160 = /* @__PURE__ */ idxL.map((idx, i) => idx.map((j) => shifts160[i][j]));
      var shiftsR160 = /* @__PURE__ */ idxR.map((idx, i) => idx.map((j) => shifts160[i][j]));
      var Kl160 = /* @__PURE__ */ Uint32Array.from([
        0,
        1518500249,
        1859775393,
        2400959708,
        2840853838
      ]);
      var Kr160 = /* @__PURE__ */ Uint32Array.from([
        1352829926,
        1548603684,
        1836072691,
        2053994217,
        0
      ]);
      function ripemd_f(group, x, y, z) {
        if (group === 0)
          return x ^ y ^ z;
        if (group === 1)
          return x & y | ~x & z;
        if (group === 2)
          return (x | ~y) ^ z;
        if (group === 3)
          return x & z | y & ~z;
        return x ^ (y | ~z);
      }
      var BUF_160 = /* @__PURE__ */ new Uint32Array(16);
      var RIPEMD160 = class extends _md_ts_1.HashMD {
        constructor() {
          super(64, 20, 8, true);
          this.h0 = 1732584193 | 0;
          this.h1 = 4023233417 | 0;
          this.h2 = 2562383102 | 0;
          this.h3 = 271733878 | 0;
          this.h4 = 3285377520 | 0;
        }
        get() {
          const { h0, h1, h2, h3, h4 } = this;
          return [h0, h1, h2, h3, h4];
        }
        set(h0, h1, h2, h3, h4) {
          this.h0 = h0 | 0;
          this.h1 = h1 | 0;
          this.h2 = h2 | 0;
          this.h3 = h3 | 0;
          this.h4 = h4 | 0;
        }
        process(view, offset) {
          for (let i = 0; i < 16; i++, offset += 4)
            BUF_160[i] = view.getUint32(offset, true);
          let al = this.h0 | 0, ar = al, bl = this.h1 | 0, br = bl, cl = this.h2 | 0, cr = cl, dl = this.h3 | 0, dr = dl, el = this.h4 | 0, er = el;
          for (let group = 0; group < 5; group++) {
            const rGroup = 4 - group;
            const hbl = Kl160[group], hbr = Kr160[group];
            const rl = idxL[group], rr = idxR[group];
            const sl = shiftsL160[group], sr = shiftsR160[group];
            for (let i = 0; i < 16; i++) {
              const tl = (0, utils_ts_1.rotl)(al + ripemd_f(group, bl, cl, dl) + BUF_160[rl[i]] + hbl, sl[i]) + el | 0;
              al = el, el = dl, dl = (0, utils_ts_1.rotl)(cl, 10) | 0, cl = bl, bl = tl;
            }
            for (let i = 0; i < 16; i++) {
              const tr = (0, utils_ts_1.rotl)(ar + ripemd_f(rGroup, br, cr, dr) + BUF_160[rr[i]] + hbr, sr[i]) + er | 0;
              ar = er, er = dr, dr = (0, utils_ts_1.rotl)(cr, 10) | 0, cr = br, br = tr;
            }
          }
          this.set(this.h1 + cl + dr | 0, this.h2 + dl + er | 0, this.h3 + el + ar | 0, this.h4 + al + br | 0, this.h0 + bl + cr | 0);
        }
        roundClean() {
          (0, utils_ts_1.clean)(BUF_160);
        }
        destroy() {
          this.destroyed = true;
          (0, utils_ts_1.clean)(this.buffer);
          this.set(0, 0, 0, 0, 0);
        }
      };
      exports7.RIPEMD160 = RIPEMD160;
      exports7.ripemd160 = (0, utils_ts_1.createHasher)(() => new RIPEMD160());
    }
  });

  // node_modules/@noble/hashes/ripemd160.js
  var require_ripemd160 = __commonJS({
    "node_modules/@noble/hashes/ripemd160.js"(exports7) {
      "use strict";
      init_dirname();
      init_buffer2();
      init_process2();
      Object.defineProperty(exports7, "__esModule", { value: true });
      exports7.ripemd160 = exports7.RIPEMD160 = void 0;
      var legacy_ts_1 = require_legacy();
      exports7.RIPEMD160 = legacy_ts_1.RIPEMD160;
      exports7.ripemd160 = legacy_ts_1.ripemd160;
    }
  });

  // node_modules/@noble/hashes/sha1.js
  var require_sha1 = __commonJS({
    "node_modules/@noble/hashes/sha1.js"(exports7) {
      "use strict";
      init_dirname();
      init_buffer2();
      init_process2();
      Object.defineProperty(exports7, "__esModule", { value: true });
      exports7.sha1 = exports7.SHA1 = void 0;
      var legacy_ts_1 = require_legacy();
      exports7.SHA1 = legacy_ts_1.SHA1;
      exports7.sha1 = legacy_ts_1.sha1;
    }
  });

  // node_modules/@noble/hashes/esm/sha256.js
  var sha256_exports = {};
  __export(sha256_exports, {
    SHA224: () => SHA2242,
    SHA256: () => SHA2562,
    sha224: () => sha2242,
    sha256: () => sha2562
  });
  var SHA2562, sha2562, SHA2242, sha2242;
  var init_sha256 = __esm({
    "node_modules/@noble/hashes/esm/sha256.js"() {
      init_dirname();
      init_buffer2();
      init_process2();
      init_sha2();
      SHA2562 = SHA256;
      sha2562 = sha256;
      SHA2242 = SHA224;
      sha2242 = sha224;
    }
  });

  // node_modules/bitcoinjs-lib/src/crypto.js
  var require_crypto2 = __commonJS({
    "node_modules/bitcoinjs-lib/src/crypto.js"(exports7) {
      "use strict";
      init_dirname();
      init_buffer2();
      init_process2();
      Object.defineProperty(exports7, "__esModule", { value: true });
      exports7.taggedHash = exports7.TAGGED_HASH_PREFIXES = exports7.TAGS = exports7.hash256 = exports7.hash160 = exports7.sha256 = exports7.sha1 = exports7.ripemd160 = void 0;
      var ripemd160_1 = require_ripemd160();
      var sha1_1 = require_sha1();
      var sha256_1 = (init_sha256(), __toCommonJS(sha256_exports));
      function ripemd160(buffer) {
        return Buffer2.from((0, ripemd160_1.ripemd160)(Uint8Array.from(buffer)));
      }
      exports7.ripemd160 = ripemd160;
      function sha1(buffer) {
        return Buffer2.from((0, sha1_1.sha1)(Uint8Array.from(buffer)));
      }
      exports7.sha1 = sha1;
      function sha2563(buffer) {
        return Buffer2.from((0, sha256_1.sha256)(Uint8Array.from(buffer)));
      }
      exports7.sha256 = sha2563;
      function hash160(buffer) {
        return Buffer2.from(
          (0, ripemd160_1.ripemd160)((0, sha256_1.sha256)(Uint8Array.from(buffer)))
        );
      }
      exports7.hash160 = hash160;
      function hash256(buffer) {
        return Buffer2.from(
          (0, sha256_1.sha256)((0, sha256_1.sha256)(Uint8Array.from(buffer)))
        );
      }
      exports7.hash256 = hash256;
      exports7.TAGS = [
        "BIP0340/challenge",
        "BIP0340/aux",
        "BIP0340/nonce",
        "TapLeaf",
        "TapBranch",
        "TapSighash",
        "TapTweak",
        "KeyAgg list",
        "KeyAgg coefficient"
      ];
      exports7.TAGGED_HASH_PREFIXES = {
        "BIP0340/challenge": Buffer2.from([
          123,
          181,
          45,
          122,
          159,
          239,
          88,
          50,
          62,
          177,
          191,
          122,
          64,
          125,
          179,
          130,
          210,
          243,
          242,
          216,
          27,
          177,
          34,
          79,
          73,
          254,
          81,
          143,
          109,
          72,
          211,
          124,
          123,
          181,
          45,
          122,
          159,
          239,
          88,
          50,
          62,
          177,
          191,
          122,
          64,
          125,
          179,
          130,
          210,
          243,
          242,
          216,
          27,
          177,
          34,
          79,
          73,
          254,
          81,
          143,
          109,
          72,
          211,
          124
        ]),
        "BIP0340/aux": Buffer2.from([
          241,
          239,
          78,
          94,
          192,
          99,
          202,
          218,
          109,
          148,
          202,
          250,
          157,
          152,
          126,
          160,
          105,
          38,
          88,
          57,
          236,
          193,
          31,
          151,
          45,
          119,
          165,
          46,
          216,
          193,
          204,
          144,
          241,
          239,
          78,
          94,
          192,
          99,
          202,
          218,
          109,
          148,
          202,
          250,
          157,
          152,
          126,
          160,
          105,
          38,
          88,
          57,
          236,
          193,
          31,
          151,
          45,
          119,
          165,
          46,
          216,
          193,
          204,
          144
        ]),
        "BIP0340/nonce": Buffer2.from([
          7,
          73,
          119,
          52,
          167,
          155,
          203,
          53,
          91,
          155,
          140,
          125,
          3,
          79,
          18,
          28,
          244,
          52,
          215,
          62,
          247,
          45,
          218,
          25,
          135,
          0,
          97,
          251,
          82,
          191,
          235,
          47,
          7,
          73,
          119,
          52,
          167,
          155,
          203,
          53,
          91,
          155,
          140,
          125,
          3,
          79,
          18,
          28,
          244,
          52,
          215,
          62,
          247,
          45,
          218,
          25,
          135,
          0,
          97,
          251,
          82,
          191,
          235,
          47
        ]),
        TapLeaf: Buffer2.from([
          174,
          234,
          143,
          220,
          66,
          8,
          152,
          49,
          5,
          115,
          75,
          88,
          8,
          29,
          30,
          38,
          56,
          211,
          95,
          28,
          181,
          64,
          8,
          212,
          211,
          87,
          202,
          3,
          190,
          120,
          233,
          238,
          174,
          234,
          143,
          220,
          66,
          8,
          152,
          49,
          5,
          115,
          75,
          88,
          8,
          29,
          30,
          38,
          56,
          211,
          95,
          28,
          181,
          64,
          8,
          212,
          211,
          87,
          202,
          3,
          190,
          120,
          233,
          238
        ]),
        TapBranch: Buffer2.from([
          25,
          65,
          161,
          242,
          229,
          110,
          185,
          95,
          162,
          169,
          241,
          148,
          190,
          92,
          1,
          247,
          33,
          111,
          51,
          237,
          130,
          176,
          145,
          70,
          52,
          144,
          208,
          91,
          245,
          22,
          160,
          21,
          25,
          65,
          161,
          242,
          229,
          110,
          185,
          95,
          162,
          169,
          241,
          148,
          190,
          92,
          1,
          247,
          33,
          111,
          51,
          237,
          130,
          176,
          145,
          70,
          52,
          144,
          208,
          91,
          245,
          22,
          160,
          21
        ]),
        TapSighash: Buffer2.from([
          244,
          10,
          72,
          223,
          75,
          42,
          112,
          200,
          180,
          146,
          75,
          242,
          101,
          70,
          97,
          237,
          61,
          149,
          253,
          102,
          163,
          19,
          235,
          135,
          35,
          117,
          151,
          198,
          40,
          228,
          160,
          49,
          244,
          10,
          72,
          223,
          75,
          42,
          112,
          200,
          180,
          146,
          75,
          242,
          101,
          70,
          97,
          237,
          61,
          149,
          253,
          102,
          163,
          19,
          235,
          135,
          35,
          117,
          151,
          198,
          40,
          228,
          160,
          49
        ]),
        TapTweak: Buffer2.from([
          232,
          15,
          225,
          99,
          156,
          156,
          160,
          80,
          227,
          175,
          27,
          57,
          193,
          67,
          198,
          62,
          66,
          156,
          188,
          235,
          21,
          217,
          64,
          251,
          181,
          197,
          161,
          244,
          175,
          87,
          197,
          233,
          232,
          15,
          225,
          99,
          156,
          156,
          160,
          80,
          227,
          175,
          27,
          57,
          193,
          67,
          198,
          62,
          66,
          156,
          188,
          235,
          21,
          217,
          64,
          251,
          181,
          197,
          161,
          244,
          175,
          87,
          197,
          233
        ]),
        "KeyAgg list": Buffer2.from([
          72,
          28,
          151,
          28,
          60,
          11,
          70,
          215,
          240,
          178,
          117,
          174,
          89,
          141,
          78,
          44,
          126,
          215,
          49,
          156,
          89,
          74,
          92,
          110,
          199,
          158,
          160,
          212,
          153,
          2,
          148,
          240,
          72,
          28,
          151,
          28,
          60,
          11,
          70,
          215,
          240,
          178,
          117,
          174,
          89,
          141,
          78,
          44,
          126,
          215,
          49,
          156,
          89,
          74,
          92,
          110,
          199,
          158,
          160,
          212,
          153,
          2,
          148,
          240
        ]),
        "KeyAgg coefficient": Buffer2.from([
          191,
          201,
          4,
          3,
          77,
          28,
          136,
          232,
          200,
          14,
          34,
          229,
          61,
          36,
          86,
          109,
          100,
          130,
          78,
          214,
          66,
          114,
          129,
          192,
          145,
          0,
          249,
          77,
          205,
          82,
          201,
          129,
          191,
          201,
          4,
          3,
          77,
          28,
          136,
          232,
          200,
          14,
          34,
          229,
          61,
          36,
          86,
          109,
          100,
          130,
          78,
          214,
          66,
          114,
          129,
          192,
          145,
          0,
          249,
          77,
          205,
          82,
          201,
          129
        ])
      };
      function taggedHash(prefix, data) {
        return sha2563(Buffer2.concat([exports7.TAGGED_HASH_PREFIXES[prefix], data]));
      }
      exports7.taggedHash = taggedHash;
    }
  });

  // node_modules/base-x/src/index.js
  var require_src = __commonJS({
    "node_modules/base-x/src/index.js"(exports7, module) {
      "use strict";
      init_dirname();
      init_buffer2();
      init_process2();
      function base(ALPHABET) {
        if (ALPHABET.length >= 255) {
          throw new TypeError("Alphabet too long");
        }
        var BASE_MAP = new Uint8Array(256);
        for (var j = 0; j < BASE_MAP.length; j++) {
          BASE_MAP[j] = 255;
        }
        for (var i = 0; i < ALPHABET.length; i++) {
          var x = ALPHABET.charAt(i);
          var xc = x.charCodeAt(0);
          if (BASE_MAP[xc] !== 255) {
            throw new TypeError(x + " is ambiguous");
          }
          BASE_MAP[xc] = i;
        }
        var BASE = ALPHABET.length;
        var LEADER = ALPHABET.charAt(0);
        var FACTOR = Math.log(BASE) / Math.log(256);
        var iFACTOR = Math.log(256) / Math.log(BASE);
        function encode(source) {
          if (source instanceof Uint8Array) {
          } else if (ArrayBuffer.isView(source)) {
            source = new Uint8Array(source.buffer, source.byteOffset, source.byteLength);
          } else if (Array.isArray(source)) {
            source = Uint8Array.from(source);
          }
          if (!(source instanceof Uint8Array)) {
            throw new TypeError("Expected Uint8Array");
          }
          if (source.length === 0) {
            return "";
          }
          var zeroes = 0;
          var length = 0;
          var pbegin = 0;
          var pend = source.length;
          while (pbegin !== pend && source[pbegin] === 0) {
            pbegin++;
            zeroes++;
          }
          var size = (pend - pbegin) * iFACTOR + 1 >>> 0;
          var b58 = new Uint8Array(size);
          while (pbegin !== pend) {
            var carry = source[pbegin];
            var i2 = 0;
            for (var it1 = size - 1; (carry !== 0 || i2 < length) && it1 !== -1; it1--, i2++) {
              carry += 256 * b58[it1] >>> 0;
              b58[it1] = carry % BASE >>> 0;
              carry = carry / BASE >>> 0;
            }
            if (carry !== 0) {
              throw new Error("Non-zero carry");
            }
            length = i2;
            pbegin++;
          }
          var it2 = size - length;
          while (it2 !== size && b58[it2] === 0) {
            it2++;
          }
          var str = LEADER.repeat(zeroes);
          for (; it2 < size; ++it2) {
            str += ALPHABET.charAt(b58[it2]);
          }
          return str;
        }
        function decodeUnsafe(source) {
          if (typeof source !== "string") {
            throw new TypeError("Expected String");
          }
          if (source.length === 0) {
            return new Uint8Array();
          }
          var psz = 0;
          var zeroes = 0;
          var length = 0;
          while (source[psz] === LEADER) {
            zeroes++;
            psz++;
          }
          var size = (source.length - psz) * FACTOR + 1 >>> 0;
          var b256 = new Uint8Array(size);
          while (source[psz]) {
            var charCode = source.charCodeAt(psz);
            if (charCode > 255) {
              return;
            }
            var carry = BASE_MAP[charCode];
            if (carry === 255) {
              return;
            }
            var i2 = 0;
            for (var it3 = size - 1; (carry !== 0 || i2 < length) && it3 !== -1; it3--, i2++) {
              carry += BASE * b256[it3] >>> 0;
              b256[it3] = carry % 256 >>> 0;
              carry = carry / 256 >>> 0;
            }
            if (carry !== 0) {
              throw new Error("Non-zero carry");
            }
            length = i2;
            psz++;
          }
          var it4 = size - length;
          while (it4 !== size && b256[it4] === 0) {
            it4++;
          }
          var vch = new Uint8Array(zeroes + (size - it4));
          var j2 = zeroes;
          while (it4 !== size) {
            vch[j2++] = b256[it4++];
          }
          return vch;
        }
        function decode(string) {
          var buffer = decodeUnsafe(string);
          if (buffer) {
            return buffer;
          }
          throw new Error("Non-base" + BASE + " character");
        }
        return {
          encode,
          decodeUnsafe,
          decode
        };
      }
      module.exports = base;
    }
  });

  // node_modules/bs58/index.js
  var require_bs58 = __commonJS({
    "node_modules/bs58/index.js"(exports7, module) {
      init_dirname();
      init_buffer2();
      init_process2();
      var basex = require_src();
      var ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
      module.exports = basex(ALPHABET);
    }
  });

  // node_modules/bs58check/base.js
  var require_base = __commonJS({
    "node_modules/bs58check/base.js"(exports7, module) {
      "use strict";
      init_dirname();
      init_buffer2();
      init_process2();
      var base58 = require_bs58();
      module.exports = function(checksumFn) {
        function encode(payload) {
          var payloadU8 = Uint8Array.from(payload);
          var checksum = checksumFn(payloadU8);
          var length = payloadU8.length + 4;
          var both = new Uint8Array(length);
          both.set(payloadU8, 0);
          both.set(checksum.subarray(0, 4), payloadU8.length);
          return base58.encode(both, length);
        }
        function decodeRaw(buffer) {
          var payload = buffer.slice(0, -4);
          var checksum = buffer.slice(-4);
          var newChecksum = checksumFn(payload);
          if (checksum[0] ^ newChecksum[0] | checksum[1] ^ newChecksum[1] | checksum[2] ^ newChecksum[2] | checksum[3] ^ newChecksum[3]) return;
          return payload;
        }
        function decodeUnsafe(string) {
          var buffer = base58.decodeUnsafe(string);
          if (!buffer) return;
          return decodeRaw(buffer);
        }
        function decode(string) {
          var buffer = base58.decode(string);
          var payload = decodeRaw(buffer, checksumFn);
          if (!payload) throw new Error("Invalid checksum");
          return payload;
        }
        return {
          encode,
          decode,
          decodeUnsafe
        };
      };
    }
  });

  // node_modules/bs58check/index.js
  var require_bs58check = __commonJS({
    "node_modules/bs58check/index.js"(exports7, module) {
      "use strict";
      init_dirname();
      init_buffer2();
      init_process2();
      var { sha256: sha2563 } = (init_sha256(), __toCommonJS(sha256_exports));
      var bs58checkBase = require_base();
      function sha256x2(buffer) {
        return sha2563(sha2563(buffer));
      }
      module.exports = bs58checkBase(sha256x2);
    }
  });

  // node_modules/bitcoinjs-lib/src/payments/p2pkh.js
  var require_p2pkh = __commonJS({
    "node_modules/bitcoinjs-lib/src/payments/p2pkh.js"(exports7) {
      "use strict";
      init_dirname();
      init_buffer2();
      init_process2();
      Object.defineProperty(exports7, "__esModule", { value: true });
      exports7.p2pkh = void 0;
      var bcrypto = require_crypto2();
      var networks_1 = require_networks();
      var bscript = require_script();
      var types_1 = require_types();
      var lazy = require_lazy();
      var bs58check3 = require_bs58check();
      var OPS = bscript.OPS;
      function p2pkh(a, opts) {
        if (!a.address && !a.hash && !a.output && !a.pubkey && !a.input)
          throw new TypeError("Not enough data");
        opts = Object.assign({ validate: true }, opts || {});
        (0, types_1.typeforce)(
          {
            network: types_1.typeforce.maybe(types_1.typeforce.Object),
            address: types_1.typeforce.maybe(types_1.typeforce.String),
            hash: types_1.typeforce.maybe(types_1.typeforce.BufferN(20)),
            output: types_1.typeforce.maybe(types_1.typeforce.BufferN(25)),
            pubkey: types_1.typeforce.maybe(types_1.isPoint),
            signature: types_1.typeforce.maybe(bscript.isCanonicalScriptSignature),
            input: types_1.typeforce.maybe(types_1.typeforce.Buffer)
          },
          a
        );
        const _address = lazy.value(() => {
          const payload = Buffer2.from(bs58check3.decode(a.address));
          const version2 = payload.readUInt8(0);
          const hash = payload.slice(1);
          return { version: version2, hash };
        });
        const _chunks = lazy.value(() => {
          return bscript.decompile(a.input);
        });
        const network2 = a.network || networks_1.bitcoin;
        const o = { name: "p2pkh", network: network2 };
        lazy.prop(o, "address", () => {
          if (!o.hash) return;
          const payload = Buffer2.allocUnsafe(21);
          payload.writeUInt8(network2.pubKeyHash, 0);
          o.hash.copy(payload, 1);
          return bs58check3.encode(payload);
        });
        lazy.prop(o, "hash", () => {
          if (a.output) return a.output.slice(3, 23);
          if (a.address) return _address().hash;
          if (a.pubkey || o.pubkey) return bcrypto.hash160(a.pubkey || o.pubkey);
        });
        lazy.prop(o, "output", () => {
          if (!o.hash) return;
          return bscript.compile([
            OPS.OP_DUP,
            OPS.OP_HASH160,
            o.hash,
            OPS.OP_EQUALVERIFY,
            OPS.OP_CHECKSIG
          ]);
        });
        lazy.prop(o, "pubkey", () => {
          if (!a.input) return;
          return _chunks()[1];
        });
        lazy.prop(o, "signature", () => {
          if (!a.input) return;
          return _chunks()[0];
        });
        lazy.prop(o, "input", () => {
          if (!a.pubkey) return;
          if (!a.signature) return;
          return bscript.compile([a.signature, a.pubkey]);
        });
        lazy.prop(o, "witness", () => {
          if (!o.input) return;
          return [];
        });
        if (opts.validate) {
          let hash = Buffer2.from([]);
          if (a.address) {
            if (_address().version !== network2.pubKeyHash)
              throw new TypeError("Invalid version or Network mismatch");
            if (_address().hash.length !== 20) throw new TypeError("Invalid address");
            hash = _address().hash;
          }
          if (a.hash) {
            if (hash.length > 0 && !hash.equals(a.hash))
              throw new TypeError("Hash mismatch");
            else hash = a.hash;
          }
          if (a.output) {
            if (a.output.length !== 25 || a.output[0] !== OPS.OP_DUP || a.output[1] !== OPS.OP_HASH160 || a.output[2] !== 20 || a.output[23] !== OPS.OP_EQUALVERIFY || a.output[24] !== OPS.OP_CHECKSIG)
              throw new TypeError("Output is invalid");
            const hash2 = a.output.slice(3, 23);
            if (hash.length > 0 && !hash.equals(hash2))
              throw new TypeError("Hash mismatch");
            else hash = hash2;
          }
          if (a.pubkey) {
            const pkh = bcrypto.hash160(a.pubkey);
            if (hash.length > 0 && !hash.equals(pkh))
              throw new TypeError("Hash mismatch");
            else hash = pkh;
          }
          if (a.input) {
            const chunks = _chunks();
            if (chunks.length !== 2) throw new TypeError("Input is invalid");
            if (!bscript.isCanonicalScriptSignature(chunks[0]))
              throw new TypeError("Input has invalid signature");
            if (!(0, types_1.isPoint)(chunks[1]))
              throw new TypeError("Input has invalid pubkey");
            if (a.signature && !a.signature.equals(chunks[0]))
              throw new TypeError("Signature mismatch");
            if (a.pubkey && !a.pubkey.equals(chunks[1]))
              throw new TypeError("Pubkey mismatch");
            const pkh = bcrypto.hash160(chunks[1]);
            if (hash.length > 0 && !hash.equals(pkh))
              throw new TypeError("Hash mismatch");
          }
        }
        return Object.assign(o, a);
      }
      exports7.p2pkh = p2pkh;
    }
  });

  // node_modules/bitcoinjs-lib/src/payments/p2sh.js
  var require_p2sh = __commonJS({
    "node_modules/bitcoinjs-lib/src/payments/p2sh.js"(exports7) {
      "use strict";
      init_dirname();
      init_buffer2();
      init_process2();
      Object.defineProperty(exports7, "__esModule", { value: true });
      exports7.p2sh = void 0;
      var bcrypto = require_crypto2();
      var networks_1 = require_networks();
      var bscript = require_script();
      var types_1 = require_types();
      var lazy = require_lazy();
      var bs58check3 = require_bs58check();
      var OPS = bscript.OPS;
      function p2sh(a, opts) {
        if (!a.address && !a.hash && !a.output && !a.redeem && !a.input)
          throw new TypeError("Not enough data");
        opts = Object.assign({ validate: true }, opts || {});
        (0, types_1.typeforce)(
          {
            network: types_1.typeforce.maybe(types_1.typeforce.Object),
            address: types_1.typeforce.maybe(types_1.typeforce.String),
            hash: types_1.typeforce.maybe(types_1.typeforce.BufferN(20)),
            output: types_1.typeforce.maybe(types_1.typeforce.BufferN(23)),
            redeem: types_1.typeforce.maybe({
              network: types_1.typeforce.maybe(types_1.typeforce.Object),
              output: types_1.typeforce.maybe(types_1.typeforce.Buffer),
              input: types_1.typeforce.maybe(types_1.typeforce.Buffer),
              witness: types_1.typeforce.maybe(
                types_1.typeforce.arrayOf(types_1.typeforce.Buffer)
              )
            }),
            input: types_1.typeforce.maybe(types_1.typeforce.Buffer),
            witness: types_1.typeforce.maybe(
              types_1.typeforce.arrayOf(types_1.typeforce.Buffer)
            )
          },
          a
        );
        let network2 = a.network;
        if (!network2) {
          network2 = a.redeem && a.redeem.network || networks_1.bitcoin;
        }
        const o = { network: network2 };
        const _address = lazy.value(() => {
          const payload = Buffer2.from(bs58check3.decode(a.address));
          const version2 = payload.readUInt8(0);
          const hash = payload.slice(1);
          return { version: version2, hash };
        });
        const _chunks = lazy.value(() => {
          return bscript.decompile(a.input);
        });
        const _redeem = lazy.value(() => {
          const chunks = _chunks();
          const lastChunk = chunks[chunks.length - 1];
          return {
            network: network2,
            output: lastChunk === OPS.OP_FALSE ? Buffer2.from([]) : lastChunk,
            input: bscript.compile(chunks.slice(0, -1)),
            witness: a.witness || []
          };
        });
        lazy.prop(o, "address", () => {
          if (!o.hash) return;
          const payload = Buffer2.allocUnsafe(21);
          payload.writeUInt8(o.network.scriptHash, 0);
          o.hash.copy(payload, 1);
          return bs58check3.encode(payload);
        });
        lazy.prop(o, "hash", () => {
          if (a.output) return a.output.slice(2, 22);
          if (a.address) return _address().hash;
          if (o.redeem && o.redeem.output) return bcrypto.hash160(o.redeem.output);
        });
        lazy.prop(o, "output", () => {
          if (!o.hash) return;
          return bscript.compile([OPS.OP_HASH160, o.hash, OPS.OP_EQUAL]);
        });
        lazy.prop(o, "redeem", () => {
          if (!a.input) return;
          return _redeem();
        });
        lazy.prop(o, "input", () => {
          if (!a.redeem || !a.redeem.input || !a.redeem.output) return;
          return bscript.compile(
            [].concat(bscript.decompile(a.redeem.input), a.redeem.output)
          );
        });
        lazy.prop(o, "witness", () => {
          if (o.redeem && o.redeem.witness) return o.redeem.witness;
          if (o.input) return [];
        });
        lazy.prop(o, "name", () => {
          const nameParts = ["p2sh"];
          if (o.redeem !== void 0 && o.redeem.name !== void 0)
            nameParts.push(o.redeem.name);
          return nameParts.join("-");
        });
        if (opts.validate) {
          let hash = Buffer2.from([]);
          if (a.address) {
            if (_address().version !== network2.scriptHash)
              throw new TypeError("Invalid version or Network mismatch");
            if (_address().hash.length !== 20) throw new TypeError("Invalid address");
            hash = _address().hash;
          }
          if (a.hash) {
            if (hash.length > 0 && !hash.equals(a.hash))
              throw new TypeError("Hash mismatch");
            else hash = a.hash;
          }
          if (a.output) {
            if (a.output.length !== 23 || a.output[0] !== OPS.OP_HASH160 || a.output[1] !== 20 || a.output[22] !== OPS.OP_EQUAL)
              throw new TypeError("Output is invalid");
            const hash2 = a.output.slice(2, 22);
            if (hash.length > 0 && !hash.equals(hash2))
              throw new TypeError("Hash mismatch");
            else hash = hash2;
          }
          const checkRedeem = (redeem) => {
            if (redeem.output) {
              const decompile = bscript.decompile(redeem.output);
              if (!decompile || decompile.length < 1)
                throw new TypeError("Redeem.output too short");
              if (redeem.output.byteLength > 520)
                throw new TypeError(
                  "Redeem.output unspendable if larger than 520 bytes"
                );
              if (bscript.countNonPushOnlyOPs(decompile) > 201)
                throw new TypeError(
                  "Redeem.output unspendable with more than 201 non-push ops"
                );
              const hash2 = bcrypto.hash160(redeem.output);
              if (hash.length > 0 && !hash.equals(hash2))
                throw new TypeError("Hash mismatch");
              else hash = hash2;
            }
            if (redeem.input) {
              const hasInput = redeem.input.length > 0;
              const hasWitness = redeem.witness && redeem.witness.length > 0;
              if (!hasInput && !hasWitness) throw new TypeError("Empty input");
              if (hasInput && hasWitness)
                throw new TypeError("Input and witness provided");
              if (hasInput) {
                const richunks = bscript.decompile(redeem.input);
                if (!bscript.isPushOnly(richunks))
                  throw new TypeError("Non push-only scriptSig");
              }
            }
          };
          if (a.input) {
            const chunks = _chunks();
            if (!chunks || chunks.length < 1) throw new TypeError("Input too short");
            if (!Buffer2.isBuffer(_redeem().output))
              throw new TypeError("Input is invalid");
            checkRedeem(_redeem());
          }
          if (a.redeem) {
            if (a.redeem.network && a.redeem.network !== network2)
              throw new TypeError("Network mismatch");
            if (a.input) {
              const redeem = _redeem();
              if (a.redeem.output && !a.redeem.output.equals(redeem.output))
                throw new TypeError("Redeem.output mismatch");
              if (a.redeem.input && !a.redeem.input.equals(redeem.input))
                throw new TypeError("Redeem.input mismatch");
            }
            checkRedeem(a.redeem);
          }
          if (a.witness) {
            if (a.redeem && a.redeem.witness && !(0, types_1.stacksEqual)(a.redeem.witness, a.witness))
              throw new TypeError("Witness and redeem.witness mismatch");
          }
        }
        return Object.assign(o, a);
      }
      exports7.p2sh = p2sh;
    }
  });

  // node_modules/bech32/dist/index.js
  var require_dist = __commonJS({
    "node_modules/bech32/dist/index.js"(exports7) {
      "use strict";
      init_dirname();
      init_buffer2();
      init_process2();
      Object.defineProperty(exports7, "__esModule", { value: true });
      exports7.bech32m = exports7.bech32 = void 0;
      var ALPHABET = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";
      var ALPHABET_MAP = {};
      for (let z = 0; z < ALPHABET.length; z++) {
        const x = ALPHABET.charAt(z);
        ALPHABET_MAP[x] = z;
      }
      function polymodStep(pre) {
        const b = pre >> 25;
        return (pre & 33554431) << 5 ^ -(b >> 0 & 1) & 996825010 ^ -(b >> 1 & 1) & 642813549 ^ -(b >> 2 & 1) & 513874426 ^ -(b >> 3 & 1) & 1027748829 ^ -(b >> 4 & 1) & 705979059;
      }
      function prefixChk(prefix) {
        let chk = 1;
        for (let i = 0; i < prefix.length; ++i) {
          const c = prefix.charCodeAt(i);
          if (c < 33 || c > 126)
            return "Invalid prefix (" + prefix + ")";
          chk = polymodStep(chk) ^ c >> 5;
        }
        chk = polymodStep(chk);
        for (let i = 0; i < prefix.length; ++i) {
          const v = prefix.charCodeAt(i);
          chk = polymodStep(chk) ^ v & 31;
        }
        return chk;
      }
      function convert(data, inBits, outBits, pad) {
        let value = 0;
        let bits = 0;
        const maxV = (1 << outBits) - 1;
        const result = [];
        for (let i = 0; i < data.length; ++i) {
          value = value << inBits | data[i];
          bits += inBits;
          while (bits >= outBits) {
            bits -= outBits;
            result.push(value >> bits & maxV);
          }
        }
        if (pad) {
          if (bits > 0) {
            result.push(value << outBits - bits & maxV);
          }
        } else {
          if (bits >= inBits)
            return "Excess padding";
          if (value << outBits - bits & maxV)
            return "Non-zero padding";
        }
        return result;
      }
      function toWords(bytes) {
        return convert(bytes, 8, 5, true);
      }
      function fromWordsUnsafe(words) {
        const res = convert(words, 5, 8, false);
        if (Array.isArray(res))
          return res;
      }
      function fromWords(words) {
        const res = convert(words, 5, 8, false);
        if (Array.isArray(res))
          return res;
        throw new Error(res);
      }
      function getLibraryFromEncoding(encoding) {
        let ENCODING_CONST;
        if (encoding === "bech32") {
          ENCODING_CONST = 1;
        } else {
          ENCODING_CONST = 734539939;
        }
        function encode(prefix, words, LIMIT) {
          LIMIT = LIMIT || 90;
          if (prefix.length + 7 + words.length > LIMIT)
            throw new TypeError("Exceeds length limit");
          prefix = prefix.toLowerCase();
          let chk = prefixChk(prefix);
          if (typeof chk === "string")
            throw new Error(chk);
          let result = prefix + "1";
          for (let i = 0; i < words.length; ++i) {
            const x = words[i];
            if (x >> 5 !== 0)
              throw new Error("Non 5-bit word");
            chk = polymodStep(chk) ^ x;
            result += ALPHABET.charAt(x);
          }
          for (let i = 0; i < 6; ++i) {
            chk = polymodStep(chk);
          }
          chk ^= ENCODING_CONST;
          for (let i = 0; i < 6; ++i) {
            const v = chk >> (5 - i) * 5 & 31;
            result += ALPHABET.charAt(v);
          }
          return result;
        }
        function __decode(str, LIMIT) {
          LIMIT = LIMIT || 90;
          if (str.length < 8)
            return str + " too short";
          if (str.length > LIMIT)
            return "Exceeds length limit";
          const lowered = str.toLowerCase();
          const uppered = str.toUpperCase();
          if (str !== lowered && str !== uppered)
            return "Mixed-case string " + str;
          str = lowered;
          const split2 = str.lastIndexOf("1");
          if (split2 === -1)
            return "No separator character for " + str;
          if (split2 === 0)
            return "Missing prefix for " + str;
          const prefix = str.slice(0, split2);
          const wordChars = str.slice(split2 + 1);
          if (wordChars.length < 6)
            return "Data too short";
          let chk = prefixChk(prefix);
          if (typeof chk === "string")
            return chk;
          const words = [];
          for (let i = 0; i < wordChars.length; ++i) {
            const c = wordChars.charAt(i);
            const v = ALPHABET_MAP[c];
            if (v === void 0)
              return "Unknown character " + c;
            chk = polymodStep(chk) ^ v;
            if (i + 6 >= wordChars.length)
              continue;
            words.push(v);
          }
          if (chk !== ENCODING_CONST)
            return "Invalid checksum for " + str;
          return { prefix, words };
        }
        function decodeUnsafe(str, LIMIT) {
          const res = __decode(str, LIMIT);
          if (typeof res === "object")
            return res;
        }
        function decode(str, LIMIT) {
          const res = __decode(str, LIMIT);
          if (typeof res === "object")
            return res;
          throw new Error(res);
        }
        return {
          decodeUnsafe,
          decode,
          encode,
          toWords,
          fromWordsUnsafe,
          fromWords
        };
      }
      exports7.bech32 = getLibraryFromEncoding("bech32");
      exports7.bech32m = getLibraryFromEncoding("bech32m");
    }
  });

  // node_modules/bitcoinjs-lib/src/payments/p2wpkh.js
  var require_p2wpkh = __commonJS({
    "node_modules/bitcoinjs-lib/src/payments/p2wpkh.js"(exports7) {
      "use strict";
      init_dirname();
      init_buffer2();
      init_process2();
      Object.defineProperty(exports7, "__esModule", { value: true });
      exports7.p2wpkh = void 0;
      var bcrypto = require_crypto2();
      var networks_1 = require_networks();
      var bscript = require_script();
      var types_1 = require_types();
      var lazy = require_lazy();
      var bech32_1 = require_dist();
      var OPS = bscript.OPS;
      var EMPTY_BUFFER = Buffer2.alloc(0);
      function p2wpkh(a, opts) {
        if (!a.address && !a.hash && !a.output && !a.pubkey && !a.witness)
          throw new TypeError("Not enough data");
        opts = Object.assign({ validate: true }, opts || {});
        (0, types_1.typeforce)(
          {
            address: types_1.typeforce.maybe(types_1.typeforce.String),
            hash: types_1.typeforce.maybe(types_1.typeforce.BufferN(20)),
            input: types_1.typeforce.maybe(types_1.typeforce.BufferN(0)),
            network: types_1.typeforce.maybe(types_1.typeforce.Object),
            output: types_1.typeforce.maybe(types_1.typeforce.BufferN(22)),
            pubkey: types_1.typeforce.maybe(types_1.isPoint),
            signature: types_1.typeforce.maybe(bscript.isCanonicalScriptSignature),
            witness: types_1.typeforce.maybe(
              types_1.typeforce.arrayOf(types_1.typeforce.Buffer)
            )
          },
          a
        );
        const _address = lazy.value(() => {
          const result = bech32_1.bech32.decode(a.address);
          const version2 = result.words.shift();
          const data = bech32_1.bech32.fromWords(result.words);
          return {
            version: version2,
            prefix: result.prefix,
            data: Buffer2.from(data)
          };
        });
        const network2 = a.network || networks_1.bitcoin;
        const o = { name: "p2wpkh", network: network2 };
        lazy.prop(o, "address", () => {
          if (!o.hash) return;
          const words = bech32_1.bech32.toWords(o.hash);
          words.unshift(0);
          return bech32_1.bech32.encode(network2.bech32, words);
        });
        lazy.prop(o, "hash", () => {
          if (a.output) return a.output.slice(2, 22);
          if (a.address) return _address().data;
          if (a.pubkey || o.pubkey) return bcrypto.hash160(a.pubkey || o.pubkey);
        });
        lazy.prop(o, "output", () => {
          if (!o.hash) return;
          return bscript.compile([OPS.OP_0, o.hash]);
        });
        lazy.prop(o, "pubkey", () => {
          if (a.pubkey) return a.pubkey;
          if (!a.witness) return;
          return a.witness[1];
        });
        lazy.prop(o, "signature", () => {
          if (!a.witness) return;
          return a.witness[0];
        });
        lazy.prop(o, "input", () => {
          if (!o.witness) return;
          return EMPTY_BUFFER;
        });
        lazy.prop(o, "witness", () => {
          if (!a.pubkey) return;
          if (!a.signature) return;
          return [a.signature, a.pubkey];
        });
        if (opts.validate) {
          let hash = Buffer2.from([]);
          if (a.address) {
            if (network2 && network2.bech32 !== _address().prefix)
              throw new TypeError("Invalid prefix or Network mismatch");
            if (_address().version !== 0)
              throw new TypeError("Invalid address version");
            if (_address().data.length !== 20)
              throw new TypeError("Invalid address data");
            hash = _address().data;
          }
          if (a.hash) {
            if (hash.length > 0 && !hash.equals(a.hash))
              throw new TypeError("Hash mismatch");
            else hash = a.hash;
          }
          if (a.output) {
            if (a.output.length !== 22 || a.output[0] !== OPS.OP_0 || a.output[1] !== 20)
              throw new TypeError("Output is invalid");
            if (hash.length > 0 && !hash.equals(a.output.slice(2)))
              throw new TypeError("Hash mismatch");
            else hash = a.output.slice(2);
          }
          if (a.pubkey) {
            const pkh = bcrypto.hash160(a.pubkey);
            if (hash.length > 0 && !hash.equals(pkh))
              throw new TypeError("Hash mismatch");
            else hash = pkh;
            if (!(0, types_1.isPoint)(a.pubkey) || a.pubkey.length !== 33)
              throw new TypeError("Invalid pubkey for p2wpkh");
          }
          if (a.witness) {
            if (a.witness.length !== 2) throw new TypeError("Witness is invalid");
            if (!bscript.isCanonicalScriptSignature(a.witness[0]))
              throw new TypeError("Witness has invalid signature");
            if (!(0, types_1.isPoint)(a.witness[1]) || a.witness[1].length !== 33)
              throw new TypeError("Witness has invalid pubkey");
            if (a.signature && !a.signature.equals(a.witness[0]))
              throw new TypeError("Signature mismatch");
            if (a.pubkey && !a.pubkey.equals(a.witness[1]))
              throw new TypeError("Pubkey mismatch");
            const pkh = bcrypto.hash160(a.witness[1]);
            if (hash.length > 0 && !hash.equals(pkh))
              throw new TypeError("Hash mismatch");
          }
        }
        return Object.assign(o, a);
      }
      exports7.p2wpkh = p2wpkh;
    }
  });

  // node_modules/bitcoinjs-lib/src/payments/p2wsh.js
  var require_p2wsh = __commonJS({
    "node_modules/bitcoinjs-lib/src/payments/p2wsh.js"(exports7) {
      "use strict";
      init_dirname();
      init_buffer2();
      init_process2();
      Object.defineProperty(exports7, "__esModule", { value: true });
      exports7.p2wsh = void 0;
      var bcrypto = require_crypto2();
      var networks_1 = require_networks();
      var bscript = require_script();
      var types_1 = require_types();
      var lazy = require_lazy();
      var bech32_1 = require_dist();
      var OPS = bscript.OPS;
      var EMPTY_BUFFER = Buffer2.alloc(0);
      function chunkHasUncompressedPubkey(chunk) {
        if (Buffer2.isBuffer(chunk) && chunk.length === 65 && chunk[0] === 4 && (0, types_1.isPoint)(chunk)) {
          return true;
        } else {
          return false;
        }
      }
      function p2wsh(a, opts) {
        if (!a.address && !a.hash && !a.output && !a.redeem && !a.witness)
          throw new TypeError("Not enough data");
        opts = Object.assign({ validate: true }, opts || {});
        (0, types_1.typeforce)(
          {
            network: types_1.typeforce.maybe(types_1.typeforce.Object),
            address: types_1.typeforce.maybe(types_1.typeforce.String),
            hash: types_1.typeforce.maybe(types_1.typeforce.BufferN(32)),
            output: types_1.typeforce.maybe(types_1.typeforce.BufferN(34)),
            redeem: types_1.typeforce.maybe({
              input: types_1.typeforce.maybe(types_1.typeforce.Buffer),
              network: types_1.typeforce.maybe(types_1.typeforce.Object),
              output: types_1.typeforce.maybe(types_1.typeforce.Buffer),
              witness: types_1.typeforce.maybe(
                types_1.typeforce.arrayOf(types_1.typeforce.Buffer)
              )
            }),
            input: types_1.typeforce.maybe(types_1.typeforce.BufferN(0)),
            witness: types_1.typeforce.maybe(
              types_1.typeforce.arrayOf(types_1.typeforce.Buffer)
            )
          },
          a
        );
        const _address = lazy.value(() => {
          const result = bech32_1.bech32.decode(a.address);
          const version2 = result.words.shift();
          const data = bech32_1.bech32.fromWords(result.words);
          return {
            version: version2,
            prefix: result.prefix,
            data: Buffer2.from(data)
          };
        });
        const _rchunks = lazy.value(() => {
          return bscript.decompile(a.redeem.input);
        });
        let network2 = a.network;
        if (!network2) {
          network2 = a.redeem && a.redeem.network || networks_1.bitcoin;
        }
        const o = { network: network2 };
        lazy.prop(o, "address", () => {
          if (!o.hash) return;
          const words = bech32_1.bech32.toWords(o.hash);
          words.unshift(0);
          return bech32_1.bech32.encode(network2.bech32, words);
        });
        lazy.prop(o, "hash", () => {
          if (a.output) return a.output.slice(2);
          if (a.address) return _address().data;
          if (o.redeem && o.redeem.output) return bcrypto.sha256(o.redeem.output);
        });
        lazy.prop(o, "output", () => {
          if (!o.hash) return;
          return bscript.compile([OPS.OP_0, o.hash]);
        });
        lazy.prop(o, "redeem", () => {
          if (!a.witness) return;
          return {
            output: a.witness[a.witness.length - 1],
            input: EMPTY_BUFFER,
            witness: a.witness.slice(0, -1)
          };
        });
        lazy.prop(o, "input", () => {
          if (!o.witness) return;
          return EMPTY_BUFFER;
        });
        lazy.prop(o, "witness", () => {
          if (a.redeem && a.redeem.input && a.redeem.input.length > 0 && a.redeem.output && a.redeem.output.length > 0) {
            const stack = bscript.toStack(_rchunks());
            o.redeem = Object.assign({ witness: stack }, a.redeem);
            o.redeem.input = EMPTY_BUFFER;
            return [].concat(stack, a.redeem.output);
          }
          if (!a.redeem) return;
          if (!a.redeem.output) return;
          if (!a.redeem.witness) return;
          return [].concat(a.redeem.witness, a.redeem.output);
        });
        lazy.prop(o, "name", () => {
          const nameParts = ["p2wsh"];
          if (o.redeem !== void 0 && o.redeem.name !== void 0)
            nameParts.push(o.redeem.name);
          return nameParts.join("-");
        });
        if (opts.validate) {
          let hash = Buffer2.from([]);
          if (a.address) {
            if (_address().prefix !== network2.bech32)
              throw new TypeError("Invalid prefix or Network mismatch");
            if (_address().version !== 0)
              throw new TypeError("Invalid address version");
            if (_address().data.length !== 32)
              throw new TypeError("Invalid address data");
            hash = _address().data;
          }
          if (a.hash) {
            if (hash.length > 0 && !hash.equals(a.hash))
              throw new TypeError("Hash mismatch");
            else hash = a.hash;
          }
          if (a.output) {
            if (a.output.length !== 34 || a.output[0] !== OPS.OP_0 || a.output[1] !== 32)
              throw new TypeError("Output is invalid");
            const hash2 = a.output.slice(2);
            if (hash.length > 0 && !hash.equals(hash2))
              throw new TypeError("Hash mismatch");
            else hash = hash2;
          }
          if (a.redeem) {
            if (a.redeem.network && a.redeem.network !== network2)
              throw new TypeError("Network mismatch");
            if (a.redeem.input && a.redeem.input.length > 0 && a.redeem.witness && a.redeem.witness.length > 0)
              throw new TypeError("Ambiguous witness source");
            if (a.redeem.output) {
              const decompile = bscript.decompile(a.redeem.output);
              if (!decompile || decompile.length < 1)
                throw new TypeError("Redeem.output is invalid");
              if (a.redeem.output.byteLength > 3600)
                throw new TypeError(
                  "Redeem.output unspendable if larger than 3600 bytes"
                );
              if (bscript.countNonPushOnlyOPs(decompile) > 201)
                throw new TypeError(
                  "Redeem.output unspendable with more than 201 non-push ops"
                );
              const hash2 = bcrypto.sha256(a.redeem.output);
              if (hash.length > 0 && !hash.equals(hash2))
                throw new TypeError("Hash mismatch");
              else hash = hash2;
            }
            if (a.redeem.input && !bscript.isPushOnly(_rchunks()))
              throw new TypeError("Non push-only scriptSig");
            if (a.witness && a.redeem.witness && !(0, types_1.stacksEqual)(a.witness, a.redeem.witness))
              throw new TypeError("Witness and redeem.witness mismatch");
            if (a.redeem.input && _rchunks().some(chunkHasUncompressedPubkey) || a.redeem.output && (bscript.decompile(a.redeem.output) || []).some(
              chunkHasUncompressedPubkey
            )) {
              throw new TypeError(
                "redeem.input or redeem.output contains uncompressed pubkey"
              );
            }
          }
          if (a.witness && a.witness.length > 0) {
            const wScript = a.witness[a.witness.length - 1];
            if (a.redeem && a.redeem.output && !a.redeem.output.equals(wScript))
              throw new TypeError("Witness and redeem.output mismatch");
            if (a.witness.some(chunkHasUncompressedPubkey) || (bscript.decompile(wScript) || []).some(chunkHasUncompressedPubkey))
              throw new TypeError("Witness contains uncompressed pubkey");
          }
        }
        return Object.assign(o, a);
      }
      exports7.p2wsh = p2wsh;
    }
  });

  // node_modules/bitcoinjs-lib/src/ecc_lib.js
  var require_ecc_lib = __commonJS({
    "node_modules/bitcoinjs-lib/src/ecc_lib.js"(exports7) {
      "use strict";
      init_dirname();
      init_buffer2();
      init_process2();
      Object.defineProperty(exports7, "__esModule", { value: true });
      exports7.getEccLib = exports7.initEccLib = void 0;
      var _ECCLIB_CACHE = {};
      function initEccLib(eccLib, opts) {
        if (!eccLib) {
          _ECCLIB_CACHE.eccLib = eccLib;
        } else if (eccLib !== _ECCLIB_CACHE.eccLib) {
          if (!opts?.DANGER_DO_NOT_VERIFY_ECCLIB)
            verifyEcc(eccLib);
          _ECCLIB_CACHE.eccLib = eccLib;
        }
      }
      exports7.initEccLib = initEccLib;
      function getEccLib() {
        if (!_ECCLIB_CACHE.eccLib)
          throw new Error(
            "No ECC Library provided. You must call initEccLib() with a valid TinySecp256k1Interface instance"
          );
        return _ECCLIB_CACHE.eccLib;
      }
      exports7.getEccLib = getEccLib;
      var h = (hex) => Buffer2.from(hex, "hex");
      function verifyEcc(ecc) {
        assert2(typeof ecc.isXOnlyPoint === "function");
        assert2(
          ecc.isXOnlyPoint(
            h("79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798")
          )
        );
        assert2(
          ecc.isXOnlyPoint(
            h("fffffffffffffffffffffffffffffffffffffffffffffffffffffffeeffffc2e")
          )
        );
        assert2(
          ecc.isXOnlyPoint(
            h("f9308a019258c31049344f85f89d5229b531c845836f99b08601f113bce036f9")
          )
        );
        assert2(
          ecc.isXOnlyPoint(
            h("0000000000000000000000000000000000000000000000000000000000000001")
          )
        );
        assert2(
          !ecc.isXOnlyPoint(
            h("0000000000000000000000000000000000000000000000000000000000000000")
          )
        );
        assert2(
          !ecc.isXOnlyPoint(
            h("fffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f")
          )
        );
        assert2(typeof ecc.xOnlyPointAddTweak === "function");
        tweakAddVectors.forEach((t) => {
          const r = ecc.xOnlyPointAddTweak(h(t.pubkey), h(t.tweak));
          if (t.result === null) {
            assert2(r === null);
          } else {
            assert2(r !== null);
            assert2(r.parity === t.parity);
            assert2(Buffer2.from(r.xOnlyPubkey).equals(h(t.result)));
          }
        });
      }
      function assert2(bool) {
        if (!bool) throw new Error("ecc library invalid");
      }
      var tweakAddVectors = [
        {
          pubkey: "79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798",
          tweak: "fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364140",
          parity: -1,
          result: null
        },
        {
          pubkey: "1617d38ed8d8657da4d4761e8057bc396ea9e4b9d29776d4be096016dbd2509b",
          tweak: "a8397a935f0dfceba6ba9618f6451ef4d80637abf4e6af2669fbc9de6a8fd2ac",
          parity: 1,
          result: "e478f99dab91052ab39a33ea35fd5e6e4933f4d28023cd597c9a1f6760346adf"
        },
        {
          pubkey: "2c0b7cf95324a07d05398b240174dc0c2be444d96b159aa6c7f7b1e668680991",
          tweak: "823c3cd2142744b075a87eade7e1b8678ba308d566226a0056ca2b7a76f86b47",
          parity: 0,
          result: "9534f8dc8c6deda2dc007655981c78b49c5d96c778fbf363462a11ec9dfd948c"
        }
      ];
    }
  });

  // node_modules/safe-buffer/index.js
  var require_safe_buffer = __commonJS({
    "node_modules/safe-buffer/index.js"(exports7, module) {
      init_dirname();
      init_buffer2();
      init_process2();
      var buffer = (init_buffer(), __toCommonJS(buffer_exports));
      var Buffer3 = buffer.Buffer;
      function copyProps(src, dst) {
        for (var key in src) {
          dst[key] = src[key];
        }
      }
      if (Buffer3.from && Buffer3.alloc && Buffer3.allocUnsafe && Buffer3.allocUnsafeSlow) {
        module.exports = buffer;
      } else {
        copyProps(buffer, exports7);
        exports7.Buffer = SafeBuffer;
      }
      function SafeBuffer(arg, encodingOrOffset, length) {
        return Buffer3(arg, encodingOrOffset, length);
      }
      SafeBuffer.prototype = Object.create(Buffer3.prototype);
      copyProps(Buffer3, SafeBuffer);
      SafeBuffer.from = function(arg, encodingOrOffset, length) {
        if (typeof arg === "number") {
          throw new TypeError("Argument must not be a number");
        }
        return Buffer3(arg, encodingOrOffset, length);
      };
      SafeBuffer.alloc = function(size, fill, encoding) {
        if (typeof size !== "number") {
          throw new TypeError("Argument must be a number");
        }
        var buf = Buffer3(size);
        if (fill !== void 0) {
          if (typeof encoding === "string") {
            buf.fill(fill, encoding);
          } else {
            buf.fill(fill);
          }
        } else {
          buf.fill(0);
        }
        return buf;
      };
      SafeBuffer.allocUnsafe = function(size) {
        if (typeof size !== "number") {
          throw new TypeError("Argument must be a number");
        }
        return Buffer3(size);
      };
      SafeBuffer.allocUnsafeSlow = function(size) {
        if (typeof size !== "number") {
          throw new TypeError("Argument must be a number");
        }
        return buffer.SlowBuffer(size);
      };
    }
  });

  // node_modules/varuint-bitcoin/index.js
  var require_varuint_bitcoin = __commonJS({
    "node_modules/varuint-bitcoin/index.js"(exports7, module) {
      "use strict";
      init_dirname();
      init_buffer2();
      init_process2();
      var Buffer3 = require_safe_buffer().Buffer;
      var MAX_SAFE_INTEGER = 9007199254740991;
      function checkUInt53(n) {
        if (n < 0 || n > MAX_SAFE_INTEGER || n % 1 !== 0) throw new RangeError("value out of range");
      }
      function encode(number, buffer, offset) {
        checkUInt53(number);
        if (!buffer) buffer = Buffer3.allocUnsafe(encodingLength(number));
        if (!Buffer3.isBuffer(buffer)) throw new TypeError("buffer must be a Buffer instance");
        if (!offset) offset = 0;
        if (number < 253) {
          buffer.writeUInt8(number, offset);
          encode.bytes = 1;
        } else if (number <= 65535) {
          buffer.writeUInt8(253, offset);
          buffer.writeUInt16LE(number, offset + 1);
          encode.bytes = 3;
        } else if (number <= 4294967295) {
          buffer.writeUInt8(254, offset);
          buffer.writeUInt32LE(number, offset + 1);
          encode.bytes = 5;
        } else {
          buffer.writeUInt8(255, offset);
          buffer.writeUInt32LE(number >>> 0, offset + 1);
          buffer.writeUInt32LE(number / 4294967296 | 0, offset + 5);
          encode.bytes = 9;
        }
        return buffer;
      }
      function decode(buffer, offset) {
        if (!Buffer3.isBuffer(buffer)) throw new TypeError("buffer must be a Buffer instance");
        if (!offset) offset = 0;
        var first = buffer.readUInt8(offset);
        if (first < 253) {
          decode.bytes = 1;
          return first;
        } else if (first === 253) {
          decode.bytes = 3;
          return buffer.readUInt16LE(offset + 1);
        } else if (first === 254) {
          decode.bytes = 5;
          return buffer.readUInt32LE(offset + 1);
        } else {
          decode.bytes = 9;
          var lo = buffer.readUInt32LE(offset + 1);
          var hi = buffer.readUInt32LE(offset + 5);
          var number = hi * 4294967296 + lo;
          checkUInt53(number);
          return number;
        }
      }
      function encodingLength(number) {
        checkUInt53(number);
        return number < 253 ? 1 : number <= 65535 ? 3 : number <= 4294967295 ? 5 : 9;
      }
      module.exports = { encode, decode, encodingLength };
    }
  });

  // node_modules/bitcoinjs-lib/src/bufferutils.js
  var require_bufferutils = __commonJS({
    "node_modules/bitcoinjs-lib/src/bufferutils.js"(exports7) {
      "use strict";
      init_dirname();
      init_buffer2();
      init_process2();
      Object.defineProperty(exports7, "__esModule", { value: true });
      exports7.BufferReader = exports7.BufferWriter = exports7.cloneBuffer = exports7.reverseBuffer = exports7.writeUInt64LE = exports7.readUInt64LE = exports7.varuint = void 0;
      var types2 = require_types();
      var { typeforce } = types2;
      var varuint = require_varuint_bitcoin();
      exports7.varuint = varuint;
      function verifuint(value, max) {
        if (typeof value !== "number")
          throw new Error("cannot write a non-number as a number");
        if (value < 0)
          throw new Error("specified a negative value for writing an unsigned value");
        if (value > max) throw new Error("RangeError: value out of range");
        if (Math.floor(value) !== value)
          throw new Error("value has a fractional component");
      }
      function readUInt64LE(buffer, offset) {
        const a = buffer.readUInt32LE(offset);
        let b = buffer.readUInt32LE(offset + 4);
        b *= 4294967296;
        verifuint(b + a, 9007199254740991);
        return b + a;
      }
      exports7.readUInt64LE = readUInt64LE;
      function writeUInt64LE(buffer, value, offset) {
        verifuint(value, 9007199254740991);
        buffer.writeInt32LE(value & -1, offset);
        buffer.writeUInt32LE(Math.floor(value / 4294967296), offset + 4);
        return offset + 8;
      }
      exports7.writeUInt64LE = writeUInt64LE;
      function reverseBuffer(buffer) {
        if (buffer.length < 1) return buffer;
        let j = buffer.length - 1;
        let tmp = 0;
        for (let i = 0; i < buffer.length / 2; i++) {
          tmp = buffer[i];
          buffer[i] = buffer[j];
          buffer[j] = tmp;
          j--;
        }
        return buffer;
      }
      exports7.reverseBuffer = reverseBuffer;
      function cloneBuffer(buffer) {
        const clone = Buffer2.allocUnsafe(buffer.length);
        buffer.copy(clone);
        return clone;
      }
      exports7.cloneBuffer = cloneBuffer;
      var BufferWriter = class _BufferWriter {
        static withCapacity(size) {
          return new _BufferWriter(Buffer2.alloc(size));
        }
        constructor(buffer, offset = 0) {
          this.buffer = buffer;
          this.offset = offset;
          typeforce(types2.tuple(types2.Buffer, types2.UInt32), [buffer, offset]);
        }
        writeUInt8(i) {
          this.offset = this.buffer.writeUInt8(i, this.offset);
        }
        writeInt32(i) {
          this.offset = this.buffer.writeInt32LE(i, this.offset);
        }
        writeUInt32(i) {
          this.offset = this.buffer.writeUInt32LE(i, this.offset);
        }
        writeUInt64(i) {
          this.offset = writeUInt64LE(this.buffer, i, this.offset);
        }
        writeVarInt(i) {
          varuint.encode(i, this.buffer, this.offset);
          this.offset += varuint.encode.bytes;
        }
        writeSlice(slice) {
          if (this.buffer.length < this.offset + slice.length) {
            throw new Error("Cannot write slice out of bounds");
          }
          this.offset += slice.copy(this.buffer, this.offset);
        }
        writeVarSlice(slice) {
          this.writeVarInt(slice.length);
          this.writeSlice(slice);
        }
        writeVector(vector) {
          this.writeVarInt(vector.length);
          vector.forEach((buf) => this.writeVarSlice(buf));
        }
        end() {
          if (this.buffer.length === this.offset) {
            return this.buffer;
          }
          throw new Error(`buffer size ${this.buffer.length}, offset ${this.offset}`);
        }
      };
      exports7.BufferWriter = BufferWriter;
      var BufferReader = class {
        constructor(buffer, offset = 0) {
          this.buffer = buffer;
          this.offset = offset;
          typeforce(types2.tuple(types2.Buffer, types2.UInt32), [buffer, offset]);
        }
        readUInt8() {
          const result = this.buffer.readUInt8(this.offset);
          this.offset++;
          return result;
        }
        readInt32() {
          const result = this.buffer.readInt32LE(this.offset);
          this.offset += 4;
          return result;
        }
        readUInt32() {
          const result = this.buffer.readUInt32LE(this.offset);
          this.offset += 4;
          return result;
        }
        readUInt64() {
          const result = readUInt64LE(this.buffer, this.offset);
          this.offset += 8;
          return result;
        }
        readVarInt() {
          const vi = varuint.decode(this.buffer, this.offset);
          this.offset += varuint.decode.bytes;
          return vi;
        }
        readSlice(n) {
          if (this.buffer.length < this.offset + n) {
            throw new Error("Cannot read slice out of bounds");
          }
          const result = this.buffer.slice(this.offset, this.offset + n);
          this.offset += n;
          return result;
        }
        readVarSlice() {
          return this.readSlice(this.readVarInt());
        }
        readVector() {
          const count = this.readVarInt();
          const vector = [];
          for (let i = 0; i < count; i++) vector.push(this.readVarSlice());
          return vector;
        }
      };
      exports7.BufferReader = BufferReader;
    }
  });

  // node_modules/bitcoinjs-lib/src/payments/bip341.js
  var require_bip341 = __commonJS({
    "node_modules/bitcoinjs-lib/src/payments/bip341.js"(exports7) {
      "use strict";
      init_dirname();
      init_buffer2();
      init_process2();
      Object.defineProperty(exports7, "__esModule", { value: true });
      exports7.tweakKey = exports7.tapTweakHash = exports7.tapleafHash = exports7.findScriptPath = exports7.toHashTree = exports7.rootHashFromPath = exports7.MAX_TAPTREE_DEPTH = exports7.LEAF_VERSION_TAPSCRIPT = void 0;
      var buffer_1 = (init_buffer(), __toCommonJS(buffer_exports));
      var ecc_lib_1 = require_ecc_lib();
      var bcrypto = require_crypto2();
      var bufferutils_1 = require_bufferutils();
      var types_1 = require_types();
      exports7.LEAF_VERSION_TAPSCRIPT = 192;
      exports7.MAX_TAPTREE_DEPTH = 128;
      var isHashBranch = (ht) => "left" in ht && "right" in ht;
      function rootHashFromPath(controlBlock, leafHash) {
        if (controlBlock.length < 33)
          throw new TypeError(
            `The control-block length is too small. Got ${controlBlock.length}, expected min 33.`
          );
        const m = (controlBlock.length - 33) / 32;
        let kj = leafHash;
        for (let j = 0; j < m; j++) {
          const ej = controlBlock.slice(33 + 32 * j, 65 + 32 * j);
          if (kj.compare(ej) < 0) {
            kj = tapBranchHash(kj, ej);
          } else {
            kj = tapBranchHash(ej, kj);
          }
        }
        return kj;
      }
      exports7.rootHashFromPath = rootHashFromPath;
      function toHashTree(scriptTree) {
        if ((0, types_1.isTapleaf)(scriptTree))
          return { hash: tapleafHash(scriptTree) };
        const hashes = [toHashTree(scriptTree[0]), toHashTree(scriptTree[1])];
        hashes.sort((a, b) => a.hash.compare(b.hash));
        const [left, right] = hashes;
        return {
          hash: tapBranchHash(left.hash, right.hash),
          left,
          right
        };
      }
      exports7.toHashTree = toHashTree;
      function findScriptPath(node, hash) {
        if (isHashBranch(node)) {
          const leftPath = findScriptPath(node.left, hash);
          if (leftPath !== void 0) return [...leftPath, node.right.hash];
          const rightPath = findScriptPath(node.right, hash);
          if (rightPath !== void 0) return [...rightPath, node.left.hash];
        } else if (node.hash.equals(hash)) {
          return [];
        }
        return void 0;
      }
      exports7.findScriptPath = findScriptPath;
      function tapleafHash(leaf) {
        const version2 = leaf.version || exports7.LEAF_VERSION_TAPSCRIPT;
        return bcrypto.taggedHash(
          "TapLeaf",
          buffer_1.Buffer.concat([
            buffer_1.Buffer.from([version2]),
            serializeScript(leaf.output)
          ])
        );
      }
      exports7.tapleafHash = tapleafHash;
      function tapTweakHash(pubKey, h) {
        return bcrypto.taggedHash(
          "TapTweak",
          buffer_1.Buffer.concat(h ? [pubKey, h] : [pubKey])
        );
      }
      exports7.tapTweakHash = tapTweakHash;
      function tweakKey(pubKey, h) {
        if (!buffer_1.Buffer.isBuffer(pubKey)) return null;
        if (pubKey.length !== 32) return null;
        if (h && h.length !== 32) return null;
        const tweakHash = tapTweakHash(pubKey, h);
        const res = (0, ecc_lib_1.getEccLib)().xOnlyPointAddTweak(pubKey, tweakHash);
        if (!res || res.xOnlyPubkey === null) return null;
        return {
          parity: res.parity,
          x: buffer_1.Buffer.from(res.xOnlyPubkey)
        };
      }
      exports7.tweakKey = tweakKey;
      function tapBranchHash(a, b) {
        return bcrypto.taggedHash("TapBranch", buffer_1.Buffer.concat([a, b]));
      }
      function serializeScript(s) {
        const varintLen = bufferutils_1.varuint.encodingLength(s.length);
        const buffer = buffer_1.Buffer.allocUnsafe(varintLen);
        bufferutils_1.varuint.encode(s.length, buffer);
        return buffer_1.Buffer.concat([buffer, s]);
      }
    }
  });

  // node_modules/bitcoinjs-lib/src/payments/p2tr.js
  var require_p2tr = __commonJS({
    "node_modules/bitcoinjs-lib/src/payments/p2tr.js"(exports7) {
      "use strict";
      init_dirname();
      init_buffer2();
      init_process2();
      Object.defineProperty(exports7, "__esModule", { value: true });
      exports7.p2tr = void 0;
      var buffer_1 = (init_buffer(), __toCommonJS(buffer_exports));
      var networks_1 = require_networks();
      var bscript = require_script();
      var types_1 = require_types();
      var ecc_lib_1 = require_ecc_lib();
      var bip341_1 = require_bip341();
      var lazy = require_lazy();
      var bech32_1 = require_dist();
      var address_1 = require_address();
      var OPS = bscript.OPS;
      var TAPROOT_WITNESS_VERSION = 1;
      var ANNEX_PREFIX = 80;
      function p2tr(a, opts) {
        if (!a.address && !a.output && !a.pubkey && !a.internalPubkey && !(a.witness && a.witness.length > 1))
          throw new TypeError("Not enough data");
        opts = Object.assign({ validate: true }, opts || {});
        (0, types_1.typeforce)(
          {
            address: types_1.typeforce.maybe(types_1.typeforce.String),
            input: types_1.typeforce.maybe(types_1.typeforce.BufferN(0)),
            network: types_1.typeforce.maybe(types_1.typeforce.Object),
            output: types_1.typeforce.maybe(types_1.typeforce.BufferN(34)),
            internalPubkey: types_1.typeforce.maybe(types_1.typeforce.BufferN(32)),
            hash: types_1.typeforce.maybe(types_1.typeforce.BufferN(32)),
            pubkey: types_1.typeforce.maybe(types_1.typeforce.BufferN(32)),
            signature: types_1.typeforce.maybe(
              types_1.typeforce.anyOf(
                types_1.typeforce.BufferN(64),
                types_1.typeforce.BufferN(65)
              )
            ),
            witness: types_1.typeforce.maybe(
              types_1.typeforce.arrayOf(types_1.typeforce.Buffer)
            ),
            scriptTree: types_1.typeforce.maybe(types_1.isTaptree),
            redeem: types_1.typeforce.maybe({
              output: types_1.typeforce.maybe(types_1.typeforce.Buffer),
              redeemVersion: types_1.typeforce.maybe(types_1.typeforce.Number),
              witness: types_1.typeforce.maybe(
                types_1.typeforce.arrayOf(types_1.typeforce.Buffer)
              )
            }),
            redeemVersion: types_1.typeforce.maybe(types_1.typeforce.Number)
          },
          a
        );
        const _address = lazy.value(() => {
          return (0, address_1.fromBech32)(a.address);
        });
        const _witness = lazy.value(() => {
          if (!a.witness || !a.witness.length) return;
          if (a.witness.length >= 2 && a.witness[a.witness.length - 1][0] === ANNEX_PREFIX) {
            return a.witness.slice(0, -1);
          }
          return a.witness.slice();
        });
        const _hashTree = lazy.value(() => {
          if (a.scriptTree) return (0, bip341_1.toHashTree)(a.scriptTree);
          if (a.hash) return { hash: a.hash };
          return;
        });
        const network2 = a.network || networks_1.bitcoin;
        const o = { name: "p2tr", network: network2 };
        lazy.prop(o, "address", () => {
          if (!o.pubkey) return;
          const words = bech32_1.bech32m.toWords(o.pubkey);
          words.unshift(TAPROOT_WITNESS_VERSION);
          return bech32_1.bech32m.encode(network2.bech32, words);
        });
        lazy.prop(o, "hash", () => {
          const hashTree = _hashTree();
          if (hashTree) return hashTree.hash;
          const w = _witness();
          if (w && w.length > 1) {
            const controlBlock = w[w.length - 1];
            const leafVersion = controlBlock[0] & types_1.TAPLEAF_VERSION_MASK;
            const script = w[w.length - 2];
            const leafHash = (0, bip341_1.tapleafHash)({
              output: script,
              version: leafVersion
            });
            return (0, bip341_1.rootHashFromPath)(controlBlock, leafHash);
          }
          return null;
        });
        lazy.prop(o, "output", () => {
          if (!o.pubkey) return;
          return bscript.compile([OPS.OP_1, o.pubkey]);
        });
        lazy.prop(o, "redeemVersion", () => {
          if (a.redeemVersion) return a.redeemVersion;
          if (a.redeem && a.redeem.redeemVersion !== void 0 && a.redeem.redeemVersion !== null) {
            return a.redeem.redeemVersion;
          }
          return bip341_1.LEAF_VERSION_TAPSCRIPT;
        });
        lazy.prop(o, "redeem", () => {
          const witness = _witness();
          if (!witness || witness.length < 2) return;
          return {
            output: witness[witness.length - 2],
            witness: witness.slice(0, -2),
            redeemVersion: witness[witness.length - 1][0] & types_1.TAPLEAF_VERSION_MASK
          };
        });
        lazy.prop(o, "pubkey", () => {
          if (a.pubkey) return a.pubkey;
          if (a.output) return a.output.slice(2);
          if (a.address) return _address().data;
          if (o.internalPubkey) {
            const tweakedKey = (0, bip341_1.tweakKey)(o.internalPubkey, o.hash);
            if (tweakedKey) return tweakedKey.x;
          }
        });
        lazy.prop(o, "internalPubkey", () => {
          if (a.internalPubkey) return a.internalPubkey;
          const witness = _witness();
          if (witness && witness.length > 1)
            return witness[witness.length - 1].slice(1, 33);
        });
        lazy.prop(o, "signature", () => {
          if (a.signature) return a.signature;
          const witness = _witness();
          if (!witness || witness.length !== 1) return;
          return witness[0];
        });
        lazy.prop(o, "witness", () => {
          if (a.witness) return a.witness;
          const hashTree = _hashTree();
          if (hashTree && a.redeem && a.redeem.output && a.internalPubkey) {
            const leafHash = (0, bip341_1.tapleafHash)({
              output: a.redeem.output,
              version: o.redeemVersion
            });
            const path = (0, bip341_1.findScriptPath)(hashTree, leafHash);
            if (!path) return;
            const outputKey = (0, bip341_1.tweakKey)(a.internalPubkey, hashTree.hash);
            if (!outputKey) return;
            const controlBock = buffer_1.Buffer.concat(
              [
                buffer_1.Buffer.from([o.redeemVersion | outputKey.parity]),
                a.internalPubkey
              ].concat(path)
            );
            return [a.redeem.output, controlBock];
          }
          if (a.signature) return [a.signature];
        });
        if (opts.validate) {
          let pubkey = buffer_1.Buffer.from([]);
          if (a.address) {
            if (network2 && network2.bech32 !== _address().prefix)
              throw new TypeError("Invalid prefix or Network mismatch");
            if (_address().version !== TAPROOT_WITNESS_VERSION)
              throw new TypeError("Invalid address version");
            if (_address().data.length !== 32)
              throw new TypeError("Invalid address data");
            pubkey = _address().data;
          }
          if (a.pubkey) {
            if (pubkey.length > 0 && !pubkey.equals(a.pubkey))
              throw new TypeError("Pubkey mismatch");
            else pubkey = a.pubkey;
          }
          if (a.output) {
            if (a.output.length !== 34 || a.output[0] !== OPS.OP_1 || a.output[1] !== 32)
              throw new TypeError("Output is invalid");
            if (pubkey.length > 0 && !pubkey.equals(a.output.slice(2)))
              throw new TypeError("Pubkey mismatch");
            else pubkey = a.output.slice(2);
          }
          if (a.internalPubkey) {
            const tweakedKey = (0, bip341_1.tweakKey)(a.internalPubkey, o.hash);
            if (pubkey.length > 0 && !pubkey.equals(tweakedKey.x))
              throw new TypeError("Pubkey mismatch");
            else pubkey = tweakedKey.x;
          }
          if (pubkey && pubkey.length) {
            if (!(0, ecc_lib_1.getEccLib)().isXOnlyPoint(pubkey))
              throw new TypeError("Invalid pubkey for p2tr");
          }
          const hashTree = _hashTree();
          if (a.hash && hashTree) {
            if (!a.hash.equals(hashTree.hash)) throw new TypeError("Hash mismatch");
          }
          if (a.redeem && a.redeem.output && hashTree) {
            const leafHash = (0, bip341_1.tapleafHash)({
              output: a.redeem.output,
              version: o.redeemVersion
            });
            if (!(0, bip341_1.findScriptPath)(hashTree, leafHash))
              throw new TypeError("Redeem script not in tree");
          }
          const witness = _witness();
          if (a.redeem && o.redeem) {
            if (a.redeem.redeemVersion) {
              if (a.redeem.redeemVersion !== o.redeem.redeemVersion)
                throw new TypeError("Redeem.redeemVersion and witness mismatch");
            }
            if (a.redeem.output) {
              if (bscript.decompile(a.redeem.output).length === 0)
                throw new TypeError("Redeem.output is invalid");
              if (o.redeem.output && !a.redeem.output.equals(o.redeem.output))
                throw new TypeError("Redeem.output and witness mismatch");
            }
            if (a.redeem.witness) {
              if (o.redeem.witness && !(0, types_1.stacksEqual)(a.redeem.witness, o.redeem.witness))
                throw new TypeError("Redeem.witness and witness mismatch");
            }
          }
          if (witness && witness.length) {
            if (witness.length === 1) {
              if (a.signature && !a.signature.equals(witness[0]))
                throw new TypeError("Signature mismatch");
            } else {
              const controlBlock = witness[witness.length - 1];
              if (controlBlock.length < 33)
                throw new TypeError(
                  `The control-block length is too small. Got ${controlBlock.length}, expected min 33.`
                );
              if ((controlBlock.length - 33) % 32 !== 0)
                throw new TypeError(
                  `The control-block length of ${controlBlock.length} is incorrect!`
                );
              const m = (controlBlock.length - 33) / 32;
              if (m > 128)
                throw new TypeError(
                  `The script path is too long. Got ${m}, expected max 128.`
                );
              const internalPubkey = controlBlock.slice(1, 33);
              if (a.internalPubkey && !a.internalPubkey.equals(internalPubkey))
                throw new TypeError("Internal pubkey mismatch");
              if (!(0, ecc_lib_1.getEccLib)().isXOnlyPoint(internalPubkey))
                throw new TypeError("Invalid internalPubkey for p2tr witness");
              const leafVersion = controlBlock[0] & types_1.TAPLEAF_VERSION_MASK;
              const script = witness[witness.length - 2];
              const leafHash = (0, bip341_1.tapleafHash)({
                output: script,
                version: leafVersion
              });
              const hash = (0, bip341_1.rootHashFromPath)(controlBlock, leafHash);
              const outputKey = (0, bip341_1.tweakKey)(internalPubkey, hash);
              if (!outputKey)
                throw new TypeError("Invalid outputKey for p2tr witness");
              if (pubkey.length && !pubkey.equals(outputKey.x))
                throw new TypeError("Pubkey mismatch for p2tr witness");
              if (outputKey.parity !== (controlBlock[0] & 1))
                throw new Error("Incorrect parity");
            }
          }
        }
        return Object.assign(o, a);
      }
      exports7.p2tr = p2tr;
    }
  });

  // node_modules/bitcoinjs-lib/src/payments/index.js
  var require_payments = __commonJS({
    "node_modules/bitcoinjs-lib/src/payments/index.js"(exports7) {
      "use strict";
      init_dirname();
      init_buffer2();
      init_process2();
      Object.defineProperty(exports7, "__esModule", { value: true });
      exports7.p2tr = exports7.p2wsh = exports7.p2wpkh = exports7.p2sh = exports7.p2pkh = exports7.p2pk = exports7.p2ms = exports7.embed = void 0;
      var embed_1 = require_embed();
      Object.defineProperty(exports7, "embed", {
        enumerable: true,
        get: function() {
          return embed_1.p2data;
        }
      });
      var p2ms_1 = require_p2ms();
      Object.defineProperty(exports7, "p2ms", {
        enumerable: true,
        get: function() {
          return p2ms_1.p2ms;
        }
      });
      var p2pk_1 = require_p2pk();
      Object.defineProperty(exports7, "p2pk", {
        enumerable: true,
        get: function() {
          return p2pk_1.p2pk;
        }
      });
      var p2pkh_1 = require_p2pkh();
      Object.defineProperty(exports7, "p2pkh", {
        enumerable: true,
        get: function() {
          return p2pkh_1.p2pkh;
        }
      });
      var p2sh_1 = require_p2sh();
      Object.defineProperty(exports7, "p2sh", {
        enumerable: true,
        get: function() {
          return p2sh_1.p2sh;
        }
      });
      var p2wpkh_1 = require_p2wpkh();
      Object.defineProperty(exports7, "p2wpkh", {
        enumerable: true,
        get: function() {
          return p2wpkh_1.p2wpkh;
        }
      });
      var p2wsh_1 = require_p2wsh();
      Object.defineProperty(exports7, "p2wsh", {
        enumerable: true,
        get: function() {
          return p2wsh_1.p2wsh;
        }
      });
      var p2tr_1 = require_p2tr();
      Object.defineProperty(exports7, "p2tr", {
        enumerable: true,
        get: function() {
          return p2tr_1.p2tr;
        }
      });
    }
  });

  // node_modules/bitcoinjs-lib/src/address.js
  var require_address = __commonJS({
    "node_modules/bitcoinjs-lib/src/address.js"(exports7) {
      "use strict";
      init_dirname();
      init_buffer2();
      init_process2();
      Object.defineProperty(exports7, "__esModule", { value: true });
      exports7.toOutputScript = exports7.fromOutputScript = exports7.toBech32 = exports7.toBase58Check = exports7.fromBech32 = exports7.fromBase58Check = void 0;
      var networks = require_networks();
      var payments = require_payments();
      var bscript = require_script();
      var types_1 = require_types();
      var bech32_1 = require_dist();
      var bs58check3 = require_bs58check();
      var FUTURE_SEGWIT_MAX_SIZE = 40;
      var FUTURE_SEGWIT_MIN_SIZE = 2;
      var FUTURE_SEGWIT_MAX_VERSION = 16;
      var FUTURE_SEGWIT_MIN_VERSION = 2;
      var FUTURE_SEGWIT_VERSION_DIFF = 80;
      var FUTURE_SEGWIT_VERSION_WARNING = "WARNING: Sending to a future segwit version address can lead to loss of funds. End users MUST be warned carefully in the GUI and asked if they wish to proceed with caution. Wallets should verify the segwit version from the output of fromBech32, then decide when it is safe to use which version of segwit.";
      function _toFutureSegwitAddress(output, network2) {
        const data = output.slice(2);
        if (data.length < FUTURE_SEGWIT_MIN_SIZE || data.length > FUTURE_SEGWIT_MAX_SIZE)
          throw new TypeError("Invalid program length for segwit address");
        const version2 = output[0] - FUTURE_SEGWIT_VERSION_DIFF;
        if (version2 < FUTURE_SEGWIT_MIN_VERSION || version2 > FUTURE_SEGWIT_MAX_VERSION)
          throw new TypeError("Invalid version for segwit address");
        if (output[1] !== data.length)
          throw new TypeError("Invalid script for segwit address");
        console.warn(FUTURE_SEGWIT_VERSION_WARNING);
        return toBech32(data, version2, network2.bech32);
      }
      function fromBase58Check(address) {
        const payload = Buffer2.from(bs58check3.decode(address));
        if (payload.length < 21) throw new TypeError(address + " is too short");
        if (payload.length > 21) throw new TypeError(address + " is too long");
        const version2 = payload.readUInt8(0);
        const hash = payload.slice(1);
        return { version: version2, hash };
      }
      exports7.fromBase58Check = fromBase58Check;
      function fromBech32(address) {
        let result;
        let version2;
        try {
          result = bech32_1.bech32.decode(address);
        } catch (e) {
        }
        if (result) {
          version2 = result.words[0];
          if (version2 !== 0) throw new TypeError(address + " uses wrong encoding");
        } else {
          result = bech32_1.bech32m.decode(address);
          version2 = result.words[0];
          if (version2 === 0) throw new TypeError(address + " uses wrong encoding");
        }
        const data = bech32_1.bech32.fromWords(result.words.slice(1));
        return {
          version: version2,
          prefix: result.prefix,
          data: Buffer2.from(data)
        };
      }
      exports7.fromBech32 = fromBech32;
      function toBase58Check(hash, version2) {
        (0, types_1.typeforce)(
          (0, types_1.tuple)(types_1.Hash160bit, types_1.UInt8),
          arguments
        );
        const payload = Buffer2.allocUnsafe(21);
        payload.writeUInt8(version2, 0);
        hash.copy(payload, 1);
        return bs58check3.encode(payload);
      }
      exports7.toBase58Check = toBase58Check;
      function toBech32(data, version2, prefix) {
        const words = bech32_1.bech32.toWords(data);
        words.unshift(version2);
        return version2 === 0 ? bech32_1.bech32.encode(prefix, words) : bech32_1.bech32m.encode(prefix, words);
      }
      exports7.toBech32 = toBech32;
      function fromOutputScript(output, network2) {
        network2 = network2 || networks.bitcoin;
        try {
          return payments.p2pkh({ output, network: network2 }).address;
        } catch (e) {
        }
        try {
          return payments.p2sh({ output, network: network2 }).address;
        } catch (e) {
        }
        try {
          return payments.p2wpkh({ output, network: network2 }).address;
        } catch (e) {
        }
        try {
          return payments.p2wsh({ output, network: network2 }).address;
        } catch (e) {
        }
        try {
          return payments.p2tr({ output, network: network2 }).address;
        } catch (e) {
        }
        try {
          return _toFutureSegwitAddress(output, network2);
        } catch (e) {
        }
        throw new Error(bscript.toASM(output) + " has no matching Address");
      }
      exports7.fromOutputScript = fromOutputScript;
      function toOutputScript(address, network2) {
        network2 = network2 || networks.bitcoin;
        let decodeBase58;
        let decodeBech32;
        try {
          decodeBase58 = fromBase58Check(address);
        } catch (e) {
        }
        if (decodeBase58) {
          if (decodeBase58.version === network2.pubKeyHash)
            return payments.p2pkh({ hash: decodeBase58.hash }).output;
          if (decodeBase58.version === network2.scriptHash)
            return payments.p2sh({ hash: decodeBase58.hash }).output;
        } else {
          try {
            decodeBech32 = fromBech32(address);
          } catch (e) {
          }
          if (decodeBech32) {
            if (decodeBech32.prefix !== network2.bech32)
              throw new Error(address + " has an invalid prefix");
            if (decodeBech32.version === 0) {
              if (decodeBech32.data.length === 20)
                return payments.p2wpkh({ hash: decodeBech32.data }).output;
              if (decodeBech32.data.length === 32)
                return payments.p2wsh({ hash: decodeBech32.data }).output;
            } else if (decodeBech32.version === 1) {
              if (decodeBech32.data.length === 32)
                return payments.p2tr({ pubkey: decodeBech32.data }).output;
            } else if (decodeBech32.version >= FUTURE_SEGWIT_MIN_VERSION && decodeBech32.version <= FUTURE_SEGWIT_MAX_VERSION && decodeBech32.data.length >= FUTURE_SEGWIT_MIN_SIZE && decodeBech32.data.length <= FUTURE_SEGWIT_MAX_SIZE) {
              console.warn(FUTURE_SEGWIT_VERSION_WARNING);
              return bscript.compile([
                decodeBech32.version + FUTURE_SEGWIT_VERSION_DIFF,
                decodeBech32.data
              ]);
            }
          }
        }
        throw new Error(address + " has no matching Script");
      }
      exports7.toOutputScript = toOutputScript;
    }
  });

  // node_modules/bitcoinjs-lib/src/merkle.js
  var require_merkle = __commonJS({
    "node_modules/bitcoinjs-lib/src/merkle.js"(exports7) {
      "use strict";
      init_dirname();
      init_buffer2();
      init_process2();
      Object.defineProperty(exports7, "__esModule", { value: true });
      exports7.fastMerkleRoot = void 0;
      function fastMerkleRoot(values, digestFn, mutated) {
        if (!Array.isArray(values)) throw TypeError("Expected values Array");
        if (typeof digestFn !== "function")
          throw TypeError("Expected digest Function");
        let length = values.length;
        const results = values.concat();
        if (mutated) mutated.value = false;
        while (length > 1) {
          let j = 0;
          for (let i = 0; i < length; i += 2, ++j) {
            const left = results[i];
            const right = i + 1 === length ? left : results[i + 1];
            if (mutated && i + 1 < length && left.equals(right)) mutated.value = true;
            const data = Buffer2.concat([left, right]);
            results[j] = digestFn(data);
          }
          length = j;
        }
        return results[0];
      }
      exports7.fastMerkleRoot = fastMerkleRoot;
    }
  });

  // node_modules/bitcoinjs-lib/src/transaction.js
  var require_transaction = __commonJS({
    "node_modules/bitcoinjs-lib/src/transaction.js"(exports7) {
      "use strict";
      init_dirname();
      init_buffer2();
      init_process2();
      Object.defineProperty(exports7, "__esModule", { value: true });
      exports7.Transaction = void 0;
      var bufferutils_1 = require_bufferutils();
      var bcrypto = require_crypto2();
      var bscript = require_script();
      var script_1 = require_script();
      var types2 = require_types();
      var { typeforce } = types2;
      function varSliceSize(someScript) {
        const length = someScript.length;
        return bufferutils_1.varuint.encodingLength(length) + length;
      }
      function vectorSize(someVector) {
        const length = someVector.length;
        return bufferutils_1.varuint.encodingLength(length) + someVector.reduce((sum, witness) => {
          return sum + varSliceSize(witness);
        }, 0);
      }
      var EMPTY_BUFFER = Buffer2.allocUnsafe(0);
      var EMPTY_WITNESS = [];
      var ZERO = Buffer2.from(
        "0000000000000000000000000000000000000000000000000000000000000000",
        "hex"
      );
      var ONE = Buffer2.from(
        "0000000000000000000000000000000000000000000000000000000000000001",
        "hex"
      );
      var VALUE_UINT64_MAX = Buffer2.from("ffffffffffffffff", "hex");
      var BLANK_OUTPUT = {
        script: EMPTY_BUFFER,
        valueBuffer: VALUE_UINT64_MAX
      };
      function isOutput(out) {
        return out.value !== void 0;
      }
      var Transaction = class _Transaction {
        constructor() {
          this.version = 1;
          this.locktime = 0;
          this.ins = [];
          this.outs = [];
        }
        static fromBuffer(buffer, _NO_STRICT) {
          const bufferReader = new bufferutils_1.BufferReader(buffer);
          const tx = new _Transaction();
          tx.version = bufferReader.readInt32();
          const marker = bufferReader.readUInt8();
          const flag = bufferReader.readUInt8();
          let hasWitnesses = false;
          if (marker === _Transaction.ADVANCED_TRANSACTION_MARKER && flag === _Transaction.ADVANCED_TRANSACTION_FLAG) {
            hasWitnesses = true;
          } else {
            bufferReader.offset -= 2;
          }
          const vinLen = bufferReader.readVarInt();
          for (let i = 0; i < vinLen; ++i) {
            tx.ins.push({
              hash: bufferReader.readSlice(32),
              index: bufferReader.readUInt32(),
              script: bufferReader.readVarSlice(),
              sequence: bufferReader.readUInt32(),
              witness: EMPTY_WITNESS
            });
          }
          const voutLen = bufferReader.readVarInt();
          for (let i = 0; i < voutLen; ++i) {
            tx.outs.push({
              value: bufferReader.readUInt64(),
              script: bufferReader.readVarSlice()
            });
          }
          if (hasWitnesses) {
            for (let i = 0; i < vinLen; ++i) {
              tx.ins[i].witness = bufferReader.readVector();
            }
            if (!tx.hasWitnesses())
              throw new Error("Transaction has superfluous witness data");
          }
          tx.locktime = bufferReader.readUInt32();
          if (_NO_STRICT) return tx;
          if (bufferReader.offset !== buffer.length)
            throw new Error("Transaction has unexpected data");
          return tx;
        }
        static fromHex(hex) {
          return _Transaction.fromBuffer(Buffer2.from(hex, "hex"), false);
        }
        static isCoinbaseHash(buffer) {
          typeforce(types2.Hash256bit, buffer);
          for (let i = 0; i < 32; ++i) {
            if (buffer[i] !== 0) return false;
          }
          return true;
        }
        isCoinbase() {
          return this.ins.length === 1 && _Transaction.isCoinbaseHash(this.ins[0].hash);
        }
        addInput(hash, index, sequence, scriptSig) {
          typeforce(
            types2.tuple(
              types2.Hash256bit,
              types2.UInt32,
              types2.maybe(types2.UInt32),
              types2.maybe(types2.Buffer)
            ),
            arguments
          );
          if (types2.Null(sequence)) {
            sequence = _Transaction.DEFAULT_SEQUENCE;
          }
          return this.ins.push({
            hash,
            index,
            script: scriptSig || EMPTY_BUFFER,
            sequence,
            witness: EMPTY_WITNESS
          }) - 1;
        }
        addOutput(scriptPubKey, value) {
          typeforce(types2.tuple(types2.Buffer, types2.Satoshi), arguments);
          return this.outs.push({
            script: scriptPubKey,
            value
          }) - 1;
        }
        hasWitnesses() {
          return this.ins.some((x) => {
            return x.witness.length !== 0;
          });
        }
        stripWitnesses() {
          this.ins.forEach((input) => {
            input.witness = EMPTY_WITNESS;
          });
        }
        weight() {
          const base = this.byteLength(false);
          const total = this.byteLength(true);
          return base * 3 + total;
        }
        virtualSize() {
          return Math.ceil(this.weight() / 4);
        }
        byteLength(_ALLOW_WITNESS = true) {
          const hasWitnesses = _ALLOW_WITNESS && this.hasWitnesses();
          return (hasWitnesses ? 10 : 8) + bufferutils_1.varuint.encodingLength(this.ins.length) + bufferutils_1.varuint.encodingLength(this.outs.length) + this.ins.reduce((sum, input) => {
            return sum + 40 + varSliceSize(input.script);
          }, 0) + this.outs.reduce((sum, output) => {
            return sum + 8 + varSliceSize(output.script);
          }, 0) + (hasWitnesses ? this.ins.reduce((sum, input) => {
            return sum + vectorSize(input.witness);
          }, 0) : 0);
        }
        clone() {
          const newTx = new _Transaction();
          newTx.version = this.version;
          newTx.locktime = this.locktime;
          newTx.ins = this.ins.map((txIn) => {
            return {
              hash: txIn.hash,
              index: txIn.index,
              script: txIn.script,
              sequence: txIn.sequence,
              witness: txIn.witness
            };
          });
          newTx.outs = this.outs.map((txOut) => {
            return {
              script: txOut.script,
              value: txOut.value
            };
          });
          return newTx;
        }
        /**
         * Hash transaction for signing a specific input.
         *
         * Bitcoin uses a different hash for each signed transaction input.
         * This method copies the transaction, makes the necessary changes based on the
         * hashType, and then hashes the result.
         * This hash can then be used to sign the provided transaction input.
         */
        hashForSignature(inIndex, prevOutScript, hashType) {
          typeforce(
            types2.tuple(
              types2.UInt32,
              types2.Buffer,
              /* types.UInt8 */
              types2.Number
            ),
            arguments
          );
          if (inIndex >= this.ins.length) return ONE;
          const ourScript = bscript.compile(
            bscript.decompile(prevOutScript).filter((x) => {
              return x !== script_1.OPS.OP_CODESEPARATOR;
            })
          );
          const txTmp = this.clone();
          if ((hashType & 31) === _Transaction.SIGHASH_NONE) {
            txTmp.outs = [];
            txTmp.ins.forEach((input, i) => {
              if (i === inIndex) return;
              input.sequence = 0;
            });
          } else if ((hashType & 31) === _Transaction.SIGHASH_SINGLE) {
            if (inIndex >= this.outs.length) return ONE;
            txTmp.outs.length = inIndex + 1;
            for (let i = 0; i < inIndex; i++) {
              txTmp.outs[i] = BLANK_OUTPUT;
            }
            txTmp.ins.forEach((input, y) => {
              if (y === inIndex) return;
              input.sequence = 0;
            });
          }
          if (hashType & _Transaction.SIGHASH_ANYONECANPAY) {
            txTmp.ins = [txTmp.ins[inIndex]];
            txTmp.ins[0].script = ourScript;
          } else {
            txTmp.ins.forEach((input) => {
              input.script = EMPTY_BUFFER;
            });
            txTmp.ins[inIndex].script = ourScript;
          }
          const buffer = Buffer2.allocUnsafe(txTmp.byteLength(false) + 4);
          buffer.writeInt32LE(hashType, buffer.length - 4);
          txTmp.__toBuffer(buffer, 0, false);
          return bcrypto.hash256(buffer);
        }
        hashForWitnessV1(inIndex, prevOutScripts, values, hashType, leafHash, annex) {
          typeforce(
            types2.tuple(
              types2.UInt32,
              typeforce.arrayOf(types2.Buffer),
              typeforce.arrayOf(types2.Satoshi),
              types2.UInt32
            ),
            arguments
          );
          if (values.length !== this.ins.length || prevOutScripts.length !== this.ins.length) {
            throw new Error("Must supply prevout script and value for all inputs");
          }
          const outputType = hashType === _Transaction.SIGHASH_DEFAULT ? _Transaction.SIGHASH_ALL : hashType & _Transaction.SIGHASH_OUTPUT_MASK;
          const inputType = hashType & _Transaction.SIGHASH_INPUT_MASK;
          const isAnyoneCanPay = inputType === _Transaction.SIGHASH_ANYONECANPAY;
          const isNone = outputType === _Transaction.SIGHASH_NONE;
          const isSingle = outputType === _Transaction.SIGHASH_SINGLE;
          let hashPrevouts = EMPTY_BUFFER;
          let hashAmounts = EMPTY_BUFFER;
          let hashScriptPubKeys = EMPTY_BUFFER;
          let hashSequences = EMPTY_BUFFER;
          let hashOutputs = EMPTY_BUFFER;
          if (!isAnyoneCanPay) {
            let bufferWriter = bufferutils_1.BufferWriter.withCapacity(
              36 * this.ins.length
            );
            this.ins.forEach((txIn) => {
              bufferWriter.writeSlice(txIn.hash);
              bufferWriter.writeUInt32(txIn.index);
            });
            hashPrevouts = bcrypto.sha256(bufferWriter.end());
            bufferWriter = bufferutils_1.BufferWriter.withCapacity(
              8 * this.ins.length
            );
            values.forEach((value) => bufferWriter.writeUInt64(value));
            hashAmounts = bcrypto.sha256(bufferWriter.end());
            bufferWriter = bufferutils_1.BufferWriter.withCapacity(
              prevOutScripts.map(varSliceSize).reduce((a, b) => a + b)
            );
            prevOutScripts.forEach(
              (prevOutScript) => bufferWriter.writeVarSlice(prevOutScript)
            );
            hashScriptPubKeys = bcrypto.sha256(bufferWriter.end());
            bufferWriter = bufferutils_1.BufferWriter.withCapacity(
              4 * this.ins.length
            );
            this.ins.forEach((txIn) => bufferWriter.writeUInt32(txIn.sequence));
            hashSequences = bcrypto.sha256(bufferWriter.end());
          }
          if (!(isNone || isSingle)) {
            const txOutsSize = this.outs.map((output) => 8 + varSliceSize(output.script)).reduce((a, b) => a + b);
            const bufferWriter = bufferutils_1.BufferWriter.withCapacity(txOutsSize);
            this.outs.forEach((out) => {
              bufferWriter.writeUInt64(out.value);
              bufferWriter.writeVarSlice(out.script);
            });
            hashOutputs = bcrypto.sha256(bufferWriter.end());
          } else if (isSingle && inIndex < this.outs.length) {
            const output = this.outs[inIndex];
            const bufferWriter = bufferutils_1.BufferWriter.withCapacity(
              8 + varSliceSize(output.script)
            );
            bufferWriter.writeUInt64(output.value);
            bufferWriter.writeVarSlice(output.script);
            hashOutputs = bcrypto.sha256(bufferWriter.end());
          }
          const spendType = (leafHash ? 2 : 0) + (annex ? 1 : 0);
          const sigMsgSize = 174 - (isAnyoneCanPay ? 49 : 0) - (isNone ? 32 : 0) + (annex ? 32 : 0) + (leafHash ? 37 : 0);
          const sigMsgWriter = bufferutils_1.BufferWriter.withCapacity(sigMsgSize);
          sigMsgWriter.writeUInt8(hashType);
          sigMsgWriter.writeInt32(this.version);
          sigMsgWriter.writeUInt32(this.locktime);
          sigMsgWriter.writeSlice(hashPrevouts);
          sigMsgWriter.writeSlice(hashAmounts);
          sigMsgWriter.writeSlice(hashScriptPubKeys);
          sigMsgWriter.writeSlice(hashSequences);
          if (!(isNone || isSingle)) {
            sigMsgWriter.writeSlice(hashOutputs);
          }
          sigMsgWriter.writeUInt8(spendType);
          if (isAnyoneCanPay) {
            const input = this.ins[inIndex];
            sigMsgWriter.writeSlice(input.hash);
            sigMsgWriter.writeUInt32(input.index);
            sigMsgWriter.writeUInt64(values[inIndex]);
            sigMsgWriter.writeVarSlice(prevOutScripts[inIndex]);
            sigMsgWriter.writeUInt32(input.sequence);
          } else {
            sigMsgWriter.writeUInt32(inIndex);
          }
          if (annex) {
            const bufferWriter = bufferutils_1.BufferWriter.withCapacity(
              varSliceSize(annex)
            );
            bufferWriter.writeVarSlice(annex);
            sigMsgWriter.writeSlice(bcrypto.sha256(bufferWriter.end()));
          }
          if (isSingle) {
            sigMsgWriter.writeSlice(hashOutputs);
          }
          if (leafHash) {
            sigMsgWriter.writeSlice(leafHash);
            sigMsgWriter.writeUInt8(0);
            sigMsgWriter.writeUInt32(4294967295);
          }
          return bcrypto.taggedHash(
            "TapSighash",
            Buffer2.concat([Buffer2.from([0]), sigMsgWriter.end()])
          );
        }
        hashForWitnessV0(inIndex, prevOutScript, value, hashType) {
          typeforce(
            types2.tuple(types2.UInt32, types2.Buffer, types2.Satoshi, types2.UInt32),
            arguments
          );
          let tbuffer = Buffer2.from([]);
          let bufferWriter;
          let hashOutputs = ZERO;
          let hashPrevouts = ZERO;
          let hashSequence = ZERO;
          if (!(hashType & _Transaction.SIGHASH_ANYONECANPAY)) {
            tbuffer = Buffer2.allocUnsafe(36 * this.ins.length);
            bufferWriter = new bufferutils_1.BufferWriter(tbuffer, 0);
            this.ins.forEach((txIn) => {
              bufferWriter.writeSlice(txIn.hash);
              bufferWriter.writeUInt32(txIn.index);
            });
            hashPrevouts = bcrypto.hash256(tbuffer);
          }
          if (!(hashType & _Transaction.SIGHASH_ANYONECANPAY) && (hashType & 31) !== _Transaction.SIGHASH_SINGLE && (hashType & 31) !== _Transaction.SIGHASH_NONE) {
            tbuffer = Buffer2.allocUnsafe(4 * this.ins.length);
            bufferWriter = new bufferutils_1.BufferWriter(tbuffer, 0);
            this.ins.forEach((txIn) => {
              bufferWriter.writeUInt32(txIn.sequence);
            });
            hashSequence = bcrypto.hash256(tbuffer);
          }
          if ((hashType & 31) !== _Transaction.SIGHASH_SINGLE && (hashType & 31) !== _Transaction.SIGHASH_NONE) {
            const txOutsSize = this.outs.reduce((sum, output) => {
              return sum + 8 + varSliceSize(output.script);
            }, 0);
            tbuffer = Buffer2.allocUnsafe(txOutsSize);
            bufferWriter = new bufferutils_1.BufferWriter(tbuffer, 0);
            this.outs.forEach((out) => {
              bufferWriter.writeUInt64(out.value);
              bufferWriter.writeVarSlice(out.script);
            });
            hashOutputs = bcrypto.hash256(tbuffer);
          } else if ((hashType & 31) === _Transaction.SIGHASH_SINGLE && inIndex < this.outs.length) {
            const output = this.outs[inIndex];
            tbuffer = Buffer2.allocUnsafe(8 + varSliceSize(output.script));
            bufferWriter = new bufferutils_1.BufferWriter(tbuffer, 0);
            bufferWriter.writeUInt64(output.value);
            bufferWriter.writeVarSlice(output.script);
            hashOutputs = bcrypto.hash256(tbuffer);
          }
          tbuffer = Buffer2.allocUnsafe(156 + varSliceSize(prevOutScript));
          bufferWriter = new bufferutils_1.BufferWriter(tbuffer, 0);
          const input = this.ins[inIndex];
          bufferWriter.writeInt32(this.version);
          bufferWriter.writeSlice(hashPrevouts);
          bufferWriter.writeSlice(hashSequence);
          bufferWriter.writeSlice(input.hash);
          bufferWriter.writeUInt32(input.index);
          bufferWriter.writeVarSlice(prevOutScript);
          bufferWriter.writeUInt64(value);
          bufferWriter.writeUInt32(input.sequence);
          bufferWriter.writeSlice(hashOutputs);
          bufferWriter.writeUInt32(this.locktime);
          bufferWriter.writeUInt32(hashType);
          return bcrypto.hash256(tbuffer);
        }
        getHash(forWitness) {
          if (forWitness && this.isCoinbase()) return Buffer2.alloc(32, 0);
          return bcrypto.hash256(this.__toBuffer(void 0, void 0, forWitness));
        }
        getId() {
          return (0, bufferutils_1.reverseBuffer)(this.getHash(false)).toString(
            "hex"
          );
        }
        toBuffer(buffer, initialOffset) {
          return this.__toBuffer(buffer, initialOffset, true);
        }
        toHex() {
          return this.toBuffer(void 0, void 0).toString("hex");
        }
        setInputScript(index, scriptSig) {
          typeforce(types2.tuple(types2.Number, types2.Buffer), arguments);
          this.ins[index].script = scriptSig;
        }
        setWitness(index, witness) {
          typeforce(types2.tuple(types2.Number, [types2.Buffer]), arguments);
          this.ins[index].witness = witness;
        }
        __toBuffer(buffer, initialOffset, _ALLOW_WITNESS = false) {
          if (!buffer) buffer = Buffer2.allocUnsafe(this.byteLength(_ALLOW_WITNESS));
          const bufferWriter = new bufferutils_1.BufferWriter(
            buffer,
            initialOffset || 0
          );
          bufferWriter.writeInt32(this.version);
          const hasWitnesses = _ALLOW_WITNESS && this.hasWitnesses();
          if (hasWitnesses) {
            bufferWriter.writeUInt8(_Transaction.ADVANCED_TRANSACTION_MARKER);
            bufferWriter.writeUInt8(_Transaction.ADVANCED_TRANSACTION_FLAG);
          }
          bufferWriter.writeVarInt(this.ins.length);
          this.ins.forEach((txIn) => {
            bufferWriter.writeSlice(txIn.hash);
            bufferWriter.writeUInt32(txIn.index);
            bufferWriter.writeVarSlice(txIn.script);
            bufferWriter.writeUInt32(txIn.sequence);
          });
          bufferWriter.writeVarInt(this.outs.length);
          this.outs.forEach((txOut) => {
            if (isOutput(txOut)) {
              bufferWriter.writeUInt64(txOut.value);
            } else {
              bufferWriter.writeSlice(txOut.valueBuffer);
            }
            bufferWriter.writeVarSlice(txOut.script);
          });
          if (hasWitnesses) {
            this.ins.forEach((input) => {
              bufferWriter.writeVector(input.witness);
            });
          }
          bufferWriter.writeUInt32(this.locktime);
          if (initialOffset !== void 0)
            return buffer.slice(initialOffset, bufferWriter.offset);
          return buffer;
        }
      };
      exports7.Transaction = Transaction;
      Transaction.DEFAULT_SEQUENCE = 4294967295;
      Transaction.SIGHASH_DEFAULT = 0;
      Transaction.SIGHASH_ALL = 1;
      Transaction.SIGHASH_NONE = 2;
      Transaction.SIGHASH_SINGLE = 3;
      Transaction.SIGHASH_ANYONECANPAY = 128;
      Transaction.SIGHASH_OUTPUT_MASK = 3;
      Transaction.SIGHASH_INPUT_MASK = 128;
      Transaction.ADVANCED_TRANSACTION_MARKER = 0;
      Transaction.ADVANCED_TRANSACTION_FLAG = 1;
    }
  });

  // node_modules/bitcoinjs-lib/src/block.js
  var require_block = __commonJS({
    "node_modules/bitcoinjs-lib/src/block.js"(exports7) {
      "use strict";
      init_dirname();
      init_buffer2();
      init_process2();
      Object.defineProperty(exports7, "__esModule", { value: true });
      exports7.Block = void 0;
      var bufferutils_1 = require_bufferutils();
      var bcrypto = require_crypto2();
      var merkle_1 = require_merkle();
      var transaction_1 = require_transaction();
      var types2 = require_types();
      var { typeforce } = types2;
      var errorMerkleNoTxes = new TypeError(
        "Cannot compute merkle root for zero transactions"
      );
      var errorWitnessNotSegwit = new TypeError(
        "Cannot compute witness commit for non-segwit block"
      );
      var Block = class _Block {
        constructor() {
          this.version = 1;
          this.prevHash = void 0;
          this.merkleRoot = void 0;
          this.timestamp = 0;
          this.witnessCommit = void 0;
          this.bits = 0;
          this.nonce = 0;
          this.transactions = void 0;
        }
        static fromBuffer(buffer) {
          if (buffer.length < 80) throw new Error("Buffer too small (< 80 bytes)");
          const bufferReader = new bufferutils_1.BufferReader(buffer);
          const block = new _Block();
          block.version = bufferReader.readInt32();
          block.prevHash = bufferReader.readSlice(32);
          block.merkleRoot = bufferReader.readSlice(32);
          block.timestamp = bufferReader.readUInt32();
          block.bits = bufferReader.readUInt32();
          block.nonce = bufferReader.readUInt32();
          if (buffer.length === 80) return block;
          const readTransaction = () => {
            const tx = transaction_1.Transaction.fromBuffer(
              bufferReader.buffer.slice(bufferReader.offset),
              true
            );
            bufferReader.offset += tx.byteLength();
            return tx;
          };
          const nTransactions = bufferReader.readVarInt();
          block.transactions = [];
          for (let i = 0; i < nTransactions; ++i) {
            const tx = readTransaction();
            block.transactions.push(tx);
          }
          const witnessCommit = block.getWitnessCommit();
          if (witnessCommit) block.witnessCommit = witnessCommit;
          return block;
        }
        static fromHex(hex) {
          return _Block.fromBuffer(Buffer2.from(hex, "hex"));
        }
        static calculateTarget(bits) {
          const size = bits >>> 24;
          const mantissa = bits & 8388607;
          const target = Buffer2.alloc(32, 0);
          if (size === 0) return target;
          if (size < 3) {
            target.writeUIntBE(mantissa >>> 8 * (3 - size), 32 - size, size);
          } else if (size > 32) {
            target.writeUIntBE(mantissa, 0, 35 - size);
          } else {
            target.writeUIntBE(mantissa, 32 - size, 3);
          }
          return target;
        }
        static calculateMerkleRoot(transactions, forWitness, mutated) {
          typeforce([{ getHash: types2.Function }], transactions);
          if (transactions.length === 0) throw errorMerkleNoTxes;
          if (forWitness && !txesHaveWitnessCommit(transactions))
            throw errorWitnessNotSegwit;
          const hashes = transactions.map(
            (transaction) => transaction.getHash(forWitness)
          );
          const rootHash = (0, merkle_1.fastMerkleRoot)(
            hashes,
            bcrypto.hash256,
            mutated
          );
          return forWitness ? bcrypto.hash256(
            Buffer2.concat([rootHash, transactions[0].ins[0].witness[0]])
          ) : rootHash;
        }
        getWitnessCommit() {
          if (!txesHaveWitnessCommit(this.transactions)) return null;
          const witnessCommits = this.transactions[0].outs.filter(
            (out) => out.script.slice(0, 6).equals(Buffer2.from("6a24aa21a9ed", "hex"))
          ).map((out) => out.script.slice(6, 38));
          if (witnessCommits.length === 0) return null;
          const result = witnessCommits[witnessCommits.length - 1];
          if (!(result instanceof Buffer2 && result.length === 32)) return null;
          return result;
        }
        hasWitnessCommit() {
          if (this.witnessCommit instanceof Buffer2 && this.witnessCommit.length === 32)
            return true;
          if (this.getWitnessCommit() !== null) return true;
          return false;
        }
        hasWitness() {
          return anyTxHasWitness(this.transactions);
        }
        weight() {
          const base = this.byteLength(false, false);
          const total = this.byteLength(false, true);
          return base * 3 + total;
        }
        byteLength(headersOnly, allowWitness = true) {
          if (headersOnly || !this.transactions) return 80;
          return 80 + bufferutils_1.varuint.encodingLength(this.transactions.length) + this.transactions.reduce((a, x) => a + x.byteLength(allowWitness), 0);
        }
        getHash() {
          return bcrypto.hash256(this.toBuffer(true));
        }
        getId() {
          return (0, bufferutils_1.reverseBuffer)(this.getHash()).toString("hex");
        }
        getUTCDate() {
          const date = /* @__PURE__ */ new Date(0);
          date.setUTCSeconds(this.timestamp);
          return date;
        }
        // TODO: buffer, offset compatibility
        toBuffer(headersOnly) {
          const buffer = Buffer2.allocUnsafe(this.byteLength(headersOnly));
          const bufferWriter = new bufferutils_1.BufferWriter(buffer);
          bufferWriter.writeInt32(this.version);
          bufferWriter.writeSlice(this.prevHash);
          bufferWriter.writeSlice(this.merkleRoot);
          bufferWriter.writeUInt32(this.timestamp);
          bufferWriter.writeUInt32(this.bits);
          bufferWriter.writeUInt32(this.nonce);
          if (headersOnly || !this.transactions) return buffer;
          bufferutils_1.varuint.encode(
            this.transactions.length,
            buffer,
            bufferWriter.offset
          );
          bufferWriter.offset += bufferutils_1.varuint.encode.bytes;
          this.transactions.forEach((tx) => {
            const txSize = tx.byteLength();
            tx.toBuffer(buffer, bufferWriter.offset);
            bufferWriter.offset += txSize;
          });
          return buffer;
        }
        toHex(headersOnly) {
          return this.toBuffer(headersOnly).toString("hex");
        }
        checkTxRoots() {
          const hasWitnessCommit = this.hasWitnessCommit();
          if (!hasWitnessCommit && this.hasWitness()) return false;
          return this.__checkMerkleRoot() && (hasWitnessCommit ? this.__checkWitnessCommit() : true);
        }
        /**
         * Checks the hash against a positive, nonzero target that fits in 256 bits.
         * Callers must also enforce the network's target limit and expected difficulty.
         */
        checkProofOfWork() {
          const size = this.bits >>> 24;
          let word = this.bits & 8388607;
          if (size <= 3) word >>>= 8 * (3 - size);
          if (word === 0 || (this.bits & 8388608) !== 0 || size > 34 || word > 255 && size > 33 || word > 65535 && size > 32)
            return false;
          const hash = (0, bufferutils_1.reverseBuffer)(this.getHash());
          const target = _Block.calculateTarget(this.bits);
          return hash.compare(target) <= 0;
        }
        __checkMerkleRoot() {
          if (!this.transactions) throw errorMerkleNoTxes;
          const mutated = { value: false };
          const actualMerkleRoot = _Block.calculateMerkleRoot(
            this.transactions,
            false,
            mutated
          );
          return !mutated.value && this.merkleRoot.compare(actualMerkleRoot) === 0;
        }
        __checkWitnessCommit() {
          if (!this.transactions) throw errorMerkleNoTxes;
          if (!this.hasWitnessCommit()) throw errorWitnessNotSegwit;
          const actualWitnessCommit = _Block.calculateMerkleRoot(
            this.transactions,
            true
          );
          return this.witnessCommit.compare(actualWitnessCommit) === 0;
        }
      };
      exports7.Block = Block;
      function txesHaveWitnessCommit(transactions) {
        return transactions instanceof Array && transactions[0] && transactions[0].ins && transactions[0].ins instanceof Array && transactions[0].ins[0] && transactions[0].ins[0].witness && transactions[0].ins[0].witness instanceof Array && transactions[0].ins[0].witness.length > 0;
      }
      function anyTxHasWitness(transactions) {
        return transactions instanceof Array && transactions.some(
          (tx) => typeof tx === "object" && tx.ins instanceof Array && tx.ins.some(
            (input) => typeof input === "object" && input.witness instanceof Array && input.witness.length > 0
          )
        );
      }
    }
  });

  // node_modules/bip174/src/lib/typeFields.js
  var require_typeFields = __commonJS({
    "node_modules/bip174/src/lib/typeFields.js"(exports7) {
      "use strict";
      init_dirname();
      init_buffer2();
      init_process2();
      Object.defineProperty(exports7, "__esModule", { value: true });
      var GlobalTypes;
      (function(GlobalTypes2) {
        GlobalTypes2[GlobalTypes2["UNSIGNED_TX"] = 0] = "UNSIGNED_TX";
        GlobalTypes2[GlobalTypes2["GLOBAL_XPUB"] = 1] = "GLOBAL_XPUB";
      })(GlobalTypes = exports7.GlobalTypes || (exports7.GlobalTypes = {}));
      exports7.GLOBAL_TYPE_NAMES = ["unsignedTx", "globalXpub"];
      var InputTypes;
      (function(InputTypes2) {
        InputTypes2[InputTypes2["NON_WITNESS_UTXO"] = 0] = "NON_WITNESS_UTXO";
        InputTypes2[InputTypes2["WITNESS_UTXO"] = 1] = "WITNESS_UTXO";
        InputTypes2[InputTypes2["PARTIAL_SIG"] = 2] = "PARTIAL_SIG";
        InputTypes2[InputTypes2["SIGHASH_TYPE"] = 3] = "SIGHASH_TYPE";
        InputTypes2[InputTypes2["REDEEM_SCRIPT"] = 4] = "REDEEM_SCRIPT";
        InputTypes2[InputTypes2["WITNESS_SCRIPT"] = 5] = "WITNESS_SCRIPT";
        InputTypes2[InputTypes2["BIP32_DERIVATION"] = 6] = "BIP32_DERIVATION";
        InputTypes2[InputTypes2["FINAL_SCRIPTSIG"] = 7] = "FINAL_SCRIPTSIG";
        InputTypes2[InputTypes2["FINAL_SCRIPTWITNESS"] = 8] = "FINAL_SCRIPTWITNESS";
        InputTypes2[InputTypes2["POR_COMMITMENT"] = 9] = "POR_COMMITMENT";
        InputTypes2[InputTypes2["TAP_KEY_SIG"] = 19] = "TAP_KEY_SIG";
        InputTypes2[InputTypes2["TAP_SCRIPT_SIG"] = 20] = "TAP_SCRIPT_SIG";
        InputTypes2[InputTypes2["TAP_LEAF_SCRIPT"] = 21] = "TAP_LEAF_SCRIPT";
        InputTypes2[InputTypes2["TAP_BIP32_DERIVATION"] = 22] = "TAP_BIP32_DERIVATION";
        InputTypes2[InputTypes2["TAP_INTERNAL_KEY"] = 23] = "TAP_INTERNAL_KEY";
        InputTypes2[InputTypes2["TAP_MERKLE_ROOT"] = 24] = "TAP_MERKLE_ROOT";
      })(InputTypes = exports7.InputTypes || (exports7.InputTypes = {}));
      exports7.INPUT_TYPE_NAMES = [
        "nonWitnessUtxo",
        "witnessUtxo",
        "partialSig",
        "sighashType",
        "redeemScript",
        "witnessScript",
        "bip32Derivation",
        "finalScriptSig",
        "finalScriptWitness",
        "porCommitment",
        "tapKeySig",
        "tapScriptSig",
        "tapLeafScript",
        "tapBip32Derivation",
        "tapInternalKey",
        "tapMerkleRoot"
      ];
      var OutputTypes;
      (function(OutputTypes2) {
        OutputTypes2[OutputTypes2["REDEEM_SCRIPT"] = 0] = "REDEEM_SCRIPT";
        OutputTypes2[OutputTypes2["WITNESS_SCRIPT"] = 1] = "WITNESS_SCRIPT";
        OutputTypes2[OutputTypes2["BIP32_DERIVATION"] = 2] = "BIP32_DERIVATION";
        OutputTypes2[OutputTypes2["TAP_INTERNAL_KEY"] = 5] = "TAP_INTERNAL_KEY";
        OutputTypes2[OutputTypes2["TAP_TREE"] = 6] = "TAP_TREE";
        OutputTypes2[OutputTypes2["TAP_BIP32_DERIVATION"] = 7] = "TAP_BIP32_DERIVATION";
      })(OutputTypes = exports7.OutputTypes || (exports7.OutputTypes = {}));
      exports7.OUTPUT_TYPE_NAMES = [
        "redeemScript",
        "witnessScript",
        "bip32Derivation",
        "tapInternalKey",
        "tapTree",
        "tapBip32Derivation"
      ];
    }
  });

  // node_modules/bip174/src/lib/converter/global/globalXpub.js
  var require_globalXpub = __commonJS({
    "node_modules/bip174/src/lib/converter/global/globalXpub.js"(exports7) {
      "use strict";
      init_dirname();
      init_buffer2();
      init_process2();
      Object.defineProperty(exports7, "__esModule", { value: true });
      var typeFields_1 = require_typeFields();
      var range = (n) => [...Array(n).keys()];
      function decode(keyVal) {
        if (keyVal.key[0] !== typeFields_1.GlobalTypes.GLOBAL_XPUB) {
          throw new Error(
            "Decode Error: could not decode globalXpub with key 0x" + keyVal.key.toString("hex")
          );
        }
        if (keyVal.key.length !== 79 || ![2, 3].includes(keyVal.key[46])) {
          throw new Error(
            "Decode Error: globalXpub has invalid extended pubkey in key 0x" + keyVal.key.toString("hex")
          );
        }
        if (keyVal.value.length / 4 % 1 !== 0) {
          throw new Error(
            "Decode Error: Global GLOBAL_XPUB value length should be multiple of 4"
          );
        }
        const extendedPubkey = keyVal.key.slice(1);
        const data = {
          masterFingerprint: keyVal.value.slice(0, 4),
          extendedPubkey,
          path: "m"
        };
        for (const i of range(keyVal.value.length / 4 - 1)) {
          const val = keyVal.value.readUInt32LE(i * 4 + 4);
          const isHard = !!(val & 2147483648);
          const idx = val & 2147483647;
          data.path += "/" + idx.toString(10) + (isHard ? "'" : "");
        }
        return data;
      }
      exports7.decode = decode;
      function encode(data) {
        const head = Buffer2.from([typeFields_1.GlobalTypes.GLOBAL_XPUB]);
        const key = Buffer2.concat([head, data.extendedPubkey]);
        const splitPath = data.path.split("/");
        const value = Buffer2.allocUnsafe(splitPath.length * 4);
        data.masterFingerprint.copy(value, 0);
        let offset = 4;
        splitPath.slice(1).forEach((level) => {
          const isHard = level.slice(-1) === "'";
          let num = 2147483647 & parseInt(isHard ? level.slice(0, -1) : level, 10);
          if (isHard) num += 2147483648;
          value.writeUInt32LE(num, offset);
          offset += 4;
        });
        return {
          key,
          value
        };
      }
      exports7.encode = encode;
      exports7.expected = "{ masterFingerprint: Buffer; extendedPubkey: Buffer; path: string; }";
      function check(data) {
        const epk = data.extendedPubkey;
        const mfp = data.masterFingerprint;
        const p = data.path;
        return Buffer2.isBuffer(epk) && epk.length === 78 && [2, 3].indexOf(epk[45]) > -1 && Buffer2.isBuffer(mfp) && mfp.length === 4 && typeof p === "string" && !!p.match(/^m(\/\d+'?)*$/);
      }
      exports7.check = check;
      function canAddToArray(array, item, dupeSet) {
        const dupeString = item.extendedPubkey.toString("hex");
        if (dupeSet.has(dupeString)) return false;
        dupeSet.add(dupeString);
        return array.filter((v) => v.extendedPubkey.equals(item.extendedPubkey)).length === 0;
      }
      exports7.canAddToArray = canAddToArray;
    }
  });

  // node_modules/bip174/src/lib/converter/global/unsignedTx.js
  var require_unsignedTx = __commonJS({
    "node_modules/bip174/src/lib/converter/global/unsignedTx.js"(exports7) {
      "use strict";
      init_dirname();
      init_buffer2();
      init_process2();
      Object.defineProperty(exports7, "__esModule", { value: true });
      var typeFields_1 = require_typeFields();
      function encode(data) {
        return {
          key: Buffer2.from([typeFields_1.GlobalTypes.UNSIGNED_TX]),
          value: data.toBuffer()
        };
      }
      exports7.encode = encode;
    }
  });

  // node_modules/bip174/src/lib/converter/input/finalScriptSig.js
  var require_finalScriptSig = __commonJS({
    "node_modules/bip174/src/lib/converter/input/finalScriptSig.js"(exports7) {
      "use strict";
      init_dirname();
      init_buffer2();
      init_process2();
      Object.defineProperty(exports7, "__esModule", { value: true });
      var typeFields_1 = require_typeFields();
      function decode(keyVal) {
        if (keyVal.key[0] !== typeFields_1.InputTypes.FINAL_SCRIPTSIG) {
          throw new Error(
            "Decode Error: could not decode finalScriptSig with key 0x" + keyVal.key.toString("hex")
          );
        }
        return keyVal.value;
      }
      exports7.decode = decode;
      function encode(data) {
        const key = Buffer2.from([typeFields_1.InputTypes.FINAL_SCRIPTSIG]);
        return {
          key,
          value: data
        };
      }
      exports7.encode = encode;
      exports7.expected = "Buffer";
      function check(data) {
        return Buffer2.isBuffer(data);
      }
      exports7.check = check;
      function canAdd(currentData, newData) {
        return !!currentData && !!newData && currentData.finalScriptSig === void 0;
      }
      exports7.canAdd = canAdd;
    }
  });

  // node_modules/bip174/src/lib/converter/input/finalScriptWitness.js
  var require_finalScriptWitness = __commonJS({
    "node_modules/bip174/src/lib/converter/input/finalScriptWitness.js"(exports7) {
      "use strict";
      init_dirname();
      init_buffer2();
      init_process2();
      Object.defineProperty(exports7, "__esModule", { value: true });
      var typeFields_1 = require_typeFields();
      function decode(keyVal) {
        if (keyVal.key[0] !== typeFields_1.InputTypes.FINAL_SCRIPTWITNESS) {
          throw new Error(
            "Decode Error: could not decode finalScriptWitness with key 0x" + keyVal.key.toString("hex")
          );
        }
        return keyVal.value;
      }
      exports7.decode = decode;
      function encode(data) {
        const key = Buffer2.from([typeFields_1.InputTypes.FINAL_SCRIPTWITNESS]);
        return {
          key,
          value: data
        };
      }
      exports7.encode = encode;
      exports7.expected = "Buffer";
      function check(data) {
        return Buffer2.isBuffer(data);
      }
      exports7.check = check;
      function canAdd(currentData, newData) {
        return !!currentData && !!newData && currentData.finalScriptWitness === void 0;
      }
      exports7.canAdd = canAdd;
    }
  });

  // node_modules/bip174/src/lib/converter/input/nonWitnessUtxo.js
  var require_nonWitnessUtxo = __commonJS({
    "node_modules/bip174/src/lib/converter/input/nonWitnessUtxo.js"(exports7) {
      "use strict";
      init_dirname();
      init_buffer2();
      init_process2();
      Object.defineProperty(exports7, "__esModule", { value: true });
      var typeFields_1 = require_typeFields();
      function decode(keyVal) {
        if (keyVal.key[0] !== typeFields_1.InputTypes.NON_WITNESS_UTXO) {
          throw new Error(
            "Decode Error: could not decode nonWitnessUtxo with key 0x" + keyVal.key.toString("hex")
          );
        }
        return keyVal.value;
      }
      exports7.decode = decode;
      function encode(data) {
        return {
          key: Buffer2.from([typeFields_1.InputTypes.NON_WITNESS_UTXO]),
          value: data
        };
      }
      exports7.encode = encode;
      exports7.expected = "Buffer";
      function check(data) {
        return Buffer2.isBuffer(data);
      }
      exports7.check = check;
      function canAdd(currentData, newData) {
        return !!currentData && !!newData && currentData.nonWitnessUtxo === void 0;
      }
      exports7.canAdd = canAdd;
    }
  });

  // node_modules/bip174/src/lib/converter/input/partialSig.js
  var require_partialSig = __commonJS({
    "node_modules/bip174/src/lib/converter/input/partialSig.js"(exports7) {
      "use strict";
      init_dirname();
      init_buffer2();
      init_process2();
      Object.defineProperty(exports7, "__esModule", { value: true });
      var typeFields_1 = require_typeFields();
      function decode(keyVal) {
        if (keyVal.key[0] !== typeFields_1.InputTypes.PARTIAL_SIG) {
          throw new Error(
            "Decode Error: could not decode partialSig with key 0x" + keyVal.key.toString("hex")
          );
        }
        if (!(keyVal.key.length === 34 || keyVal.key.length === 66) || ![2, 3, 4].includes(keyVal.key[1])) {
          throw new Error(
            "Decode Error: partialSig has invalid pubkey in key 0x" + keyVal.key.toString("hex")
          );
        }
        const pubkey = keyVal.key.slice(1);
        return {
          pubkey,
          signature: keyVal.value
        };
      }
      exports7.decode = decode;
      function encode(pSig) {
        const head = Buffer2.from([typeFields_1.InputTypes.PARTIAL_SIG]);
        return {
          key: Buffer2.concat([head, pSig.pubkey]),
          value: pSig.signature
        };
      }
      exports7.encode = encode;
      exports7.expected = "{ pubkey: Buffer; signature: Buffer; }";
      function check(data) {
        return Buffer2.isBuffer(data.pubkey) && Buffer2.isBuffer(data.signature) && [33, 65].includes(data.pubkey.length) && [2, 3, 4].includes(data.pubkey[0]) && isDerSigWithSighash(data.signature);
      }
      exports7.check = check;
      function isDerSigWithSighash(buf) {
        if (!Buffer2.isBuffer(buf) || buf.length < 9) return false;
        if (buf[0] !== 48) return false;
        if (buf.length !== buf[1] + 3) return false;
        if (buf[2] !== 2) return false;
        const rLen = buf[3];
        if (rLen > 33 || rLen < 1) return false;
        if (buf[3 + rLen + 1] !== 2) return false;
        const sLen = buf[3 + rLen + 2];
        if (sLen > 33 || sLen < 1) return false;
        if (buf.length !== 3 + rLen + 2 + sLen + 2) return false;
        return true;
      }
      function canAddToArray(array, item, dupeSet) {
        const dupeString = item.pubkey.toString("hex");
        if (dupeSet.has(dupeString)) return false;
        dupeSet.add(dupeString);
        return array.filter((v) => v.pubkey.equals(item.pubkey)).length === 0;
      }
      exports7.canAddToArray = canAddToArray;
    }
  });

  // node_modules/bip174/src/lib/converter/input/porCommitment.js
  var require_porCommitment = __commonJS({
    "node_modules/bip174/src/lib/converter/input/porCommitment.js"(exports7) {
      "use strict";
      init_dirname();
      init_buffer2();
      init_process2();
      Object.defineProperty(exports7, "__esModule", { value: true });
      var typeFields_1 = require_typeFields();
      function decode(keyVal) {
        if (keyVal.key[0] !== typeFields_1.InputTypes.POR_COMMITMENT) {
          throw new Error(
            "Decode Error: could not decode porCommitment with key 0x" + keyVal.key.toString("hex")
          );
        }
        return keyVal.value.toString("utf8");
      }
      exports7.decode = decode;
      function encode(data) {
        const key = Buffer2.from([typeFields_1.InputTypes.POR_COMMITMENT]);
        return {
          key,
          value: Buffer2.from(data, "utf8")
        };
      }
      exports7.encode = encode;
      exports7.expected = "string";
      function check(data) {
        return typeof data === "string";
      }
      exports7.check = check;
      function canAdd(currentData, newData) {
        return !!currentData && !!newData && currentData.porCommitment === void 0;
      }
      exports7.canAdd = canAdd;
    }
  });

  // node_modules/bip174/src/lib/converter/input/sighashType.js
  var require_sighashType = __commonJS({
    "node_modules/bip174/src/lib/converter/input/sighashType.js"(exports7) {
      "use strict";
      init_dirname();
      init_buffer2();
      init_process2();
      Object.defineProperty(exports7, "__esModule", { value: true });
      var typeFields_1 = require_typeFields();
      function decode(keyVal) {
        if (keyVal.key[0] !== typeFields_1.InputTypes.SIGHASH_TYPE) {
          throw new Error(
            "Decode Error: could not decode sighashType with key 0x" + keyVal.key.toString("hex")
          );
        }
        return keyVal.value.readUInt32LE(0);
      }
      exports7.decode = decode;
      function encode(data) {
        const key = Buffer2.from([typeFields_1.InputTypes.SIGHASH_TYPE]);
        const value = Buffer2.allocUnsafe(4);
        value.writeUInt32LE(data, 0);
        return {
          key,
          value
        };
      }
      exports7.encode = encode;
      exports7.expected = "number";
      function check(data) {
        return typeof data === "number";
      }
      exports7.check = check;
      function canAdd(currentData, newData) {
        return !!currentData && !!newData && currentData.sighashType === void 0;
      }
      exports7.canAdd = canAdd;
    }
  });

  // node_modules/bip174/src/lib/converter/input/tapKeySig.js
  var require_tapKeySig = __commonJS({
    "node_modules/bip174/src/lib/converter/input/tapKeySig.js"(exports7) {
      "use strict";
      init_dirname();
      init_buffer2();
      init_process2();
      Object.defineProperty(exports7, "__esModule", { value: true });
      var typeFields_1 = require_typeFields();
      function decode(keyVal) {
        if (keyVal.key[0] !== typeFields_1.InputTypes.TAP_KEY_SIG || keyVal.key.length !== 1) {
          throw new Error(
            "Decode Error: could not decode tapKeySig with key 0x" + keyVal.key.toString("hex")
          );
        }
        if (!check(keyVal.value)) {
          throw new Error(
            "Decode Error: tapKeySig not a valid 64-65-byte BIP340 signature"
          );
        }
        return keyVal.value;
      }
      exports7.decode = decode;
      function encode(value) {
        const key = Buffer2.from([typeFields_1.InputTypes.TAP_KEY_SIG]);
        return { key, value };
      }
      exports7.encode = encode;
      exports7.expected = "Buffer";
      function check(data) {
        return Buffer2.isBuffer(data) && (data.length === 64 || data.length === 65);
      }
      exports7.check = check;
      function canAdd(currentData, newData) {
        return !!currentData && !!newData && currentData.tapKeySig === void 0;
      }
      exports7.canAdd = canAdd;
    }
  });

  // node_modules/bip174/src/lib/converter/input/tapLeafScript.js
  var require_tapLeafScript = __commonJS({
    "node_modules/bip174/src/lib/converter/input/tapLeafScript.js"(exports7) {
      "use strict";
      init_dirname();
      init_buffer2();
      init_process2();
      Object.defineProperty(exports7, "__esModule", { value: true });
      var typeFields_1 = require_typeFields();
      function decode(keyVal) {
        if (keyVal.key[0] !== typeFields_1.InputTypes.TAP_LEAF_SCRIPT) {
          throw new Error(
            "Decode Error: could not decode tapLeafScript with key 0x" + keyVal.key.toString("hex")
          );
        }
        if ((keyVal.key.length - 2) % 32 !== 0) {
          throw new Error(
            "Decode Error: tapLeafScript has invalid control block in key 0x" + keyVal.key.toString("hex")
          );
        }
        const leafVersion = keyVal.value[keyVal.value.length - 1];
        if ((keyVal.key[1] & 254) !== leafVersion) {
          throw new Error(
            "Decode Error: tapLeafScript bad leaf version in key 0x" + keyVal.key.toString("hex")
          );
        }
        const script = keyVal.value.slice(0, -1);
        const controlBlock = keyVal.key.slice(1);
        return { controlBlock, script, leafVersion };
      }
      exports7.decode = decode;
      function encode(tScript) {
        const head = Buffer2.from([typeFields_1.InputTypes.TAP_LEAF_SCRIPT]);
        const verBuf = Buffer2.from([tScript.leafVersion]);
        return {
          key: Buffer2.concat([head, tScript.controlBlock]),
          value: Buffer2.concat([tScript.script, verBuf])
        };
      }
      exports7.encode = encode;
      exports7.expected = "{ controlBlock: Buffer; leafVersion: number, script: Buffer; }";
      function check(data) {
        return Buffer2.isBuffer(data.controlBlock) && (data.controlBlock.length - 1) % 32 === 0 && (data.controlBlock[0] & 254) === data.leafVersion && Buffer2.isBuffer(data.script);
      }
      exports7.check = check;
      function canAddToArray(array, item, dupeSet) {
        const dupeString = item.controlBlock.toString("hex");
        if (dupeSet.has(dupeString)) return false;
        dupeSet.add(dupeString);
        return array.filter((v) => v.controlBlock.equals(item.controlBlock)).length === 0;
      }
      exports7.canAddToArray = canAddToArray;
    }
  });

  // node_modules/bip174/src/lib/converter/input/tapMerkleRoot.js
  var require_tapMerkleRoot = __commonJS({
    "node_modules/bip174/src/lib/converter/input/tapMerkleRoot.js"(exports7) {
      "use strict";
      init_dirname();
      init_buffer2();
      init_process2();
      Object.defineProperty(exports7, "__esModule", { value: true });
      var typeFields_1 = require_typeFields();
      function decode(keyVal) {
        if (keyVal.key[0] !== typeFields_1.InputTypes.TAP_MERKLE_ROOT || keyVal.key.length !== 1) {
          throw new Error(
            "Decode Error: could not decode tapMerkleRoot with key 0x" + keyVal.key.toString("hex")
          );
        }
        if (!check(keyVal.value)) {
          throw new Error("Decode Error: tapMerkleRoot not a 32-byte hash");
        }
        return keyVal.value;
      }
      exports7.decode = decode;
      function encode(value) {
        const key = Buffer2.from([typeFields_1.InputTypes.TAP_MERKLE_ROOT]);
        return { key, value };
      }
      exports7.encode = encode;
      exports7.expected = "Buffer";
      function check(data) {
        return Buffer2.isBuffer(data) && data.length === 32;
      }
      exports7.check = check;
      function canAdd(currentData, newData) {
        return !!currentData && !!newData && currentData.tapMerkleRoot === void 0;
      }
      exports7.canAdd = canAdd;
    }
  });

  // node_modules/bip174/src/lib/converter/input/tapScriptSig.js
  var require_tapScriptSig = __commonJS({
    "node_modules/bip174/src/lib/converter/input/tapScriptSig.js"(exports7) {
      "use strict";
      init_dirname();
      init_buffer2();
      init_process2();
      Object.defineProperty(exports7, "__esModule", { value: true });
      var typeFields_1 = require_typeFields();
      function decode(keyVal) {
        if (keyVal.key[0] !== typeFields_1.InputTypes.TAP_SCRIPT_SIG) {
          throw new Error(
            "Decode Error: could not decode tapScriptSig with key 0x" + keyVal.key.toString("hex")
          );
        }
        if (keyVal.key.length !== 65) {
          throw new Error(
            "Decode Error: tapScriptSig has invalid key 0x" + keyVal.key.toString("hex")
          );
        }
        if (keyVal.value.length !== 64 && keyVal.value.length !== 65) {
          throw new Error(
            "Decode Error: tapScriptSig has invalid signature in key 0x" + keyVal.key.toString("hex")
          );
        }
        const pubkey = keyVal.key.slice(1, 33);
        const leafHash = keyVal.key.slice(33);
        return {
          pubkey,
          leafHash,
          signature: keyVal.value
        };
      }
      exports7.decode = decode;
      function encode(tSig) {
        const head = Buffer2.from([typeFields_1.InputTypes.TAP_SCRIPT_SIG]);
        return {
          key: Buffer2.concat([head, tSig.pubkey, tSig.leafHash]),
          value: tSig.signature
        };
      }
      exports7.encode = encode;
      exports7.expected = "{ pubkey: Buffer; leafHash: Buffer; signature: Buffer; }";
      function check(data) {
        return Buffer2.isBuffer(data.pubkey) && Buffer2.isBuffer(data.leafHash) && Buffer2.isBuffer(data.signature) && data.pubkey.length === 32 && data.leafHash.length === 32 && (data.signature.length === 64 || data.signature.length === 65);
      }
      exports7.check = check;
      function canAddToArray(array, item, dupeSet) {
        const dupeString = item.pubkey.toString("hex") + item.leafHash.toString("hex");
        if (dupeSet.has(dupeString)) return false;
        dupeSet.add(dupeString);
        return array.filter(
          (v) => v.pubkey.equals(item.pubkey) && v.leafHash.equals(item.leafHash)
        ).length === 0;
      }
      exports7.canAddToArray = canAddToArray;
    }
  });

  // node_modules/bip174/src/lib/converter/varint.js
  var require_varint = __commonJS({
    "node_modules/bip174/src/lib/converter/varint.js"(exports7) {
      "use strict";
      init_dirname();
      init_buffer2();
      init_process2();
      Object.defineProperty(exports7, "__esModule", { value: true });
      var MAX_SAFE_INTEGER = 9007199254740991;
      function checkUInt53(n) {
        if (n < 0 || n > MAX_SAFE_INTEGER || n % 1 !== 0)
          throw new RangeError("value out of range");
      }
      function encode(_number, buffer, offset) {
        checkUInt53(_number);
        if (!buffer) buffer = Buffer2.allocUnsafe(encodingLength(_number));
        if (!Buffer2.isBuffer(buffer))
          throw new TypeError("buffer must be a Buffer instance");
        if (!offset) offset = 0;
        if (_number < 253) {
          buffer.writeUInt8(_number, offset);
          Object.assign(encode, { bytes: 1 });
        } else if (_number <= 65535) {
          buffer.writeUInt8(253, offset);
          buffer.writeUInt16LE(_number, offset + 1);
          Object.assign(encode, { bytes: 3 });
        } else if (_number <= 4294967295) {
          buffer.writeUInt8(254, offset);
          buffer.writeUInt32LE(_number, offset + 1);
          Object.assign(encode, { bytes: 5 });
        } else {
          buffer.writeUInt8(255, offset);
          buffer.writeUInt32LE(_number >>> 0, offset + 1);
          buffer.writeUInt32LE(_number / 4294967296 | 0, offset + 5);
          Object.assign(encode, { bytes: 9 });
        }
        return buffer;
      }
      exports7.encode = encode;
      function decode(buffer, offset) {
        if (!Buffer2.isBuffer(buffer))
          throw new TypeError("buffer must be a Buffer instance");
        if (!offset) offset = 0;
        const first = buffer.readUInt8(offset);
        if (first < 253) {
          Object.assign(decode, { bytes: 1 });
          return first;
        } else if (first === 253) {
          Object.assign(decode, { bytes: 3 });
          return buffer.readUInt16LE(offset + 1);
        } else if (first === 254) {
          Object.assign(decode, { bytes: 5 });
          return buffer.readUInt32LE(offset + 1);
        } else {
          Object.assign(decode, { bytes: 9 });
          const lo = buffer.readUInt32LE(offset + 1);
          const hi = buffer.readUInt32LE(offset + 5);
          const _number = hi * 4294967296 + lo;
          checkUInt53(_number);
          return _number;
        }
      }
      exports7.decode = decode;
      function encodingLength(_number) {
        checkUInt53(_number);
        return _number < 253 ? 1 : _number <= 65535 ? 3 : _number <= 4294967295 ? 5 : 9;
      }
      exports7.encodingLength = encodingLength;
    }
  });

  // node_modules/bip174/src/lib/converter/tools.js
  var require_tools = __commonJS({
    "node_modules/bip174/src/lib/converter/tools.js"(exports7) {
      "use strict";
      init_dirname();
      init_buffer2();
      init_process2();
      Object.defineProperty(exports7, "__esModule", { value: true });
      var varuint = require_varint();
      exports7.range = (n) => [...Array(n).keys()];
      function reverseBuffer(buffer) {
        if (buffer.length < 1) return buffer;
        let j = buffer.length - 1;
        let tmp = 0;
        for (let i = 0; i < buffer.length / 2; i++) {
          tmp = buffer[i];
          buffer[i] = buffer[j];
          buffer[j] = tmp;
          j--;
        }
        return buffer;
      }
      exports7.reverseBuffer = reverseBuffer;
      function keyValsToBuffer(keyVals) {
        const buffers = keyVals.map(keyValToBuffer);
        buffers.push(Buffer2.from([0]));
        return Buffer2.concat(buffers);
      }
      exports7.keyValsToBuffer = keyValsToBuffer;
      function keyValToBuffer(keyVal) {
        const keyLen = keyVal.key.length;
        const valLen = keyVal.value.length;
        const keyVarIntLen = varuint.encodingLength(keyLen);
        const valVarIntLen = varuint.encodingLength(valLen);
        const buffer = Buffer2.allocUnsafe(
          keyVarIntLen + keyLen + valVarIntLen + valLen
        );
        varuint.encode(keyLen, buffer, 0);
        keyVal.key.copy(buffer, keyVarIntLen);
        varuint.encode(valLen, buffer, keyVarIntLen + keyLen);
        keyVal.value.copy(buffer, keyVarIntLen + keyLen + valVarIntLen);
        return buffer;
      }
      exports7.keyValToBuffer = keyValToBuffer;
      function verifuint(value, max) {
        if (typeof value !== "number")
          throw new Error("cannot write a non-number as a number");
        if (value < 0)
          throw new Error("specified a negative value for writing an unsigned value");
        if (value > max) throw new Error("RangeError: value out of range");
        if (Math.floor(value) !== value)
          throw new Error("value has a fractional component");
      }
      function readUInt64LE(buffer, offset) {
        const a = buffer.readUInt32LE(offset);
        let b = buffer.readUInt32LE(offset + 4);
        b *= 4294967296;
        verifuint(b + a, 9007199254740991);
        return b + a;
      }
      exports7.readUInt64LE = readUInt64LE;
      function writeUInt64LE(buffer, value, offset) {
        verifuint(value, 9007199254740991);
        buffer.writeInt32LE(value & -1, offset);
        buffer.writeUInt32LE(Math.floor(value / 4294967296), offset + 4);
        return offset + 8;
      }
      exports7.writeUInt64LE = writeUInt64LE;
    }
  });

  // node_modules/bip174/src/lib/converter/input/witnessUtxo.js
  var require_witnessUtxo = __commonJS({
    "node_modules/bip174/src/lib/converter/input/witnessUtxo.js"(exports7) {
      "use strict";
      init_dirname();
      init_buffer2();
      init_process2();
      Object.defineProperty(exports7, "__esModule", { value: true });
      var typeFields_1 = require_typeFields();
      var tools_1 = require_tools();
      var varuint = require_varint();
      function decode(keyVal) {
        if (keyVal.key[0] !== typeFields_1.InputTypes.WITNESS_UTXO) {
          throw new Error(
            "Decode Error: could not decode witnessUtxo with key 0x" + keyVal.key.toString("hex")
          );
        }
        const value = tools_1.readUInt64LE(keyVal.value, 0);
        let _offset = 8;
        const scriptLen = varuint.decode(keyVal.value, _offset);
        _offset += varuint.encodingLength(scriptLen);
        const script = keyVal.value.slice(_offset);
        if (script.length !== scriptLen) {
          throw new Error("Decode Error: WITNESS_UTXO script is not proper length");
        }
        return {
          script,
          value
        };
      }
      exports7.decode = decode;
      function encode(data) {
        const { script, value } = data;
        const varintLen = varuint.encodingLength(script.length);
        const result = Buffer2.allocUnsafe(8 + varintLen + script.length);
        tools_1.writeUInt64LE(result, value, 0);
        varuint.encode(script.length, result, 8);
        script.copy(result, 8 + varintLen);
        return {
          key: Buffer2.from([typeFields_1.InputTypes.WITNESS_UTXO]),
          value: result
        };
      }
      exports7.encode = encode;
      exports7.expected = "{ script: Buffer; value: number; }";
      function check(data) {
        return Buffer2.isBuffer(data.script) && typeof data.value === "number";
      }
      exports7.check = check;
      function canAdd(currentData, newData) {
        return !!currentData && !!newData && currentData.witnessUtxo === void 0;
      }
      exports7.canAdd = canAdd;
    }
  });

  // node_modules/bip174/src/lib/converter/output/tapTree.js
  var require_tapTree = __commonJS({
    "node_modules/bip174/src/lib/converter/output/tapTree.js"(exports7) {
      "use strict";
      init_dirname();
      init_buffer2();
      init_process2();
      Object.defineProperty(exports7, "__esModule", { value: true });
      var typeFields_1 = require_typeFields();
      var varuint = require_varint();
      function decode(keyVal) {
        if (keyVal.key[0] !== typeFields_1.OutputTypes.TAP_TREE || keyVal.key.length !== 1) {
          throw new Error(
            "Decode Error: could not decode tapTree with key 0x" + keyVal.key.toString("hex")
          );
        }
        let _offset = 0;
        const data = [];
        while (_offset < keyVal.value.length) {
          const depth = keyVal.value[_offset++];
          const leafVersion = keyVal.value[_offset++];
          const scriptLen = varuint.decode(keyVal.value, _offset);
          _offset += varuint.encodingLength(scriptLen);
          data.push({
            depth,
            leafVersion,
            script: keyVal.value.slice(_offset, _offset + scriptLen)
          });
          _offset += scriptLen;
        }
        return { leaves: data };
      }
      exports7.decode = decode;
      function encode(tree) {
        const key = Buffer2.from([typeFields_1.OutputTypes.TAP_TREE]);
        const bufs = [].concat(
          ...tree.leaves.map((tapLeaf) => [
            Buffer2.of(tapLeaf.depth, tapLeaf.leafVersion),
            varuint.encode(tapLeaf.script.length),
            tapLeaf.script
          ])
        );
        return {
          key,
          value: Buffer2.concat(bufs)
        };
      }
      exports7.encode = encode;
      exports7.expected = "{ leaves: [{ depth: number; leafVersion: number, script: Buffer; }] }";
      function check(data) {
        return Array.isArray(data.leaves) && data.leaves.every(
          (tapLeaf) => tapLeaf.depth >= 0 && tapLeaf.depth <= 128 && (tapLeaf.leafVersion & 254) === tapLeaf.leafVersion && Buffer2.isBuffer(tapLeaf.script)
        );
      }
      exports7.check = check;
      function canAdd(currentData, newData) {
        return !!currentData && !!newData && currentData.tapTree === void 0;
      }
      exports7.canAdd = canAdd;
    }
  });

  // node_modules/bip174/src/lib/converter/shared/bip32Derivation.js
  var require_bip32Derivation = __commonJS({
    "node_modules/bip174/src/lib/converter/shared/bip32Derivation.js"(exports7) {
      "use strict";
      init_dirname();
      init_buffer2();
      init_process2();
      Object.defineProperty(exports7, "__esModule", { value: true });
      var range = (n) => [...Array(n).keys()];
      var isValidDERKey = (pubkey) => pubkey.length === 33 && [2, 3].includes(pubkey[0]) || pubkey.length === 65 && 4 === pubkey[0];
      function makeConverter(TYPE_BYTE, isValidPubkey = isValidDERKey) {
        function decode(keyVal) {
          if (keyVal.key[0] !== TYPE_BYTE) {
            throw new Error(
              "Decode Error: could not decode bip32Derivation with key 0x" + keyVal.key.toString("hex")
            );
          }
          const pubkey = keyVal.key.slice(1);
          if (!isValidPubkey(pubkey)) {
            throw new Error(
              "Decode Error: bip32Derivation has invalid pubkey in key 0x" + keyVal.key.toString("hex")
            );
          }
          if (keyVal.value.length / 4 % 1 !== 0) {
            throw new Error(
              "Decode Error: Input BIP32_DERIVATION value length should be multiple of 4"
            );
          }
          const data = {
            masterFingerprint: keyVal.value.slice(0, 4),
            pubkey,
            path: "m"
          };
          for (const i of range(keyVal.value.length / 4 - 1)) {
            const val = keyVal.value.readUInt32LE(i * 4 + 4);
            const isHard = !!(val & 2147483648);
            const idx = val & 2147483647;
            data.path += "/" + idx.toString(10) + (isHard ? "'" : "");
          }
          return data;
        }
        function encode(data) {
          const head = Buffer2.from([TYPE_BYTE]);
          const key = Buffer2.concat([head, data.pubkey]);
          const splitPath = data.path.split("/");
          const value = Buffer2.allocUnsafe(splitPath.length * 4);
          data.masterFingerprint.copy(value, 0);
          let offset = 4;
          splitPath.slice(1).forEach((level) => {
            const isHard = level.slice(-1) === "'";
            let num = 2147483647 & parseInt(isHard ? level.slice(0, -1) : level, 10);
            if (isHard) num += 2147483648;
            value.writeUInt32LE(num, offset);
            offset += 4;
          });
          return {
            key,
            value
          };
        }
        const expected = "{ masterFingerprint: Buffer; pubkey: Buffer; path: string; }";
        function check(data) {
          return Buffer2.isBuffer(data.pubkey) && Buffer2.isBuffer(data.masterFingerprint) && typeof data.path === "string" && isValidPubkey(data.pubkey) && data.masterFingerprint.length === 4;
        }
        function canAddToArray(array, item, dupeSet) {
          const dupeString = item.pubkey.toString("hex");
          if (dupeSet.has(dupeString)) return false;
          dupeSet.add(dupeString);
          return array.filter((v) => v.pubkey.equals(item.pubkey)).length === 0;
        }
        return {
          decode,
          encode,
          check,
          expected,
          canAddToArray
        };
      }
      exports7.makeConverter = makeConverter;
    }
  });

  // node_modules/bip174/src/lib/converter/shared/checkPubkey.js
  var require_checkPubkey = __commonJS({
    "node_modules/bip174/src/lib/converter/shared/checkPubkey.js"(exports7) {
      "use strict";
      init_dirname();
      init_buffer2();
      init_process2();
      Object.defineProperty(exports7, "__esModule", { value: true });
      function makeChecker(pubkeyTypes) {
        return checkPubkey;
        function checkPubkey(keyVal) {
          let pubkey;
          if (pubkeyTypes.includes(keyVal.key[0])) {
            pubkey = keyVal.key.slice(1);
            if (!(pubkey.length === 33 || pubkey.length === 65) || ![2, 3, 4].includes(pubkey[0])) {
              throw new Error(
                "Format Error: invalid pubkey in key 0x" + keyVal.key.toString("hex")
              );
            }
          }
          return pubkey;
        }
      }
      exports7.makeChecker = makeChecker;
    }
  });

  // node_modules/bip174/src/lib/converter/shared/redeemScript.js
  var require_redeemScript = __commonJS({
    "node_modules/bip174/src/lib/converter/shared/redeemScript.js"(exports7) {
      "use strict";
      init_dirname();
      init_buffer2();
      init_process2();
      Object.defineProperty(exports7, "__esModule", { value: true });
      function makeConverter(TYPE_BYTE) {
        function decode(keyVal) {
          if (keyVal.key[0] !== TYPE_BYTE) {
            throw new Error(
              "Decode Error: could not decode redeemScript with key 0x" + keyVal.key.toString("hex")
            );
          }
          return keyVal.value;
        }
        function encode(data) {
          const key = Buffer2.from([TYPE_BYTE]);
          return {
            key,
            value: data
          };
        }
        const expected = "Buffer";
        function check(data) {
          return Buffer2.isBuffer(data);
        }
        function canAdd(currentData, newData) {
          return !!currentData && !!newData && currentData.redeemScript === void 0;
        }
        return {
          decode,
          encode,
          check,
          expected,
          canAdd
        };
      }
      exports7.makeConverter = makeConverter;
    }
  });

  // node_modules/bip174/src/lib/converter/shared/tapBip32Derivation.js
  var require_tapBip32Derivation = __commonJS({
    "node_modules/bip174/src/lib/converter/shared/tapBip32Derivation.js"(exports7) {
      "use strict";
      init_dirname();
      init_buffer2();
      init_process2();
      Object.defineProperty(exports7, "__esModule", { value: true });
      var varuint = require_varint();
      var bip32Derivation = require_bip32Derivation();
      var isValidBIP340Key = (pubkey) => pubkey.length === 32;
      function makeConverter(TYPE_BYTE) {
        const parent = bip32Derivation.makeConverter(TYPE_BYTE, isValidBIP340Key);
        function decode(keyVal) {
          const nHashes = varuint.decode(keyVal.value);
          const nHashesLen = varuint.encodingLength(nHashes);
          const base = parent.decode({
            key: keyVal.key,
            value: keyVal.value.slice(nHashesLen + nHashes * 32)
          });
          const leafHashes = new Array(nHashes);
          for (let i = 0, _offset = nHashesLen; i < nHashes; i++, _offset += 32) {
            leafHashes[i] = keyVal.value.slice(_offset, _offset + 32);
          }
          return Object.assign({}, base, { leafHashes });
        }
        function encode(data) {
          const base = parent.encode(data);
          const nHashesLen = varuint.encodingLength(data.leafHashes.length);
          const nHashesBuf = Buffer2.allocUnsafe(nHashesLen);
          varuint.encode(data.leafHashes.length, nHashesBuf);
          const value = Buffer2.concat([nHashesBuf, ...data.leafHashes, base.value]);
          return Object.assign({}, base, { value });
        }
        const expected = "{ masterFingerprint: Buffer; pubkey: Buffer; path: string; leafHashes: Buffer[]; }";
        function check(data) {
          return Array.isArray(data.leafHashes) && data.leafHashes.every(
            (leafHash) => Buffer2.isBuffer(leafHash) && leafHash.length === 32
          ) && parent.check(data);
        }
        return {
          decode,
          encode,
          check,
          expected,
          canAddToArray: parent.canAddToArray
        };
      }
      exports7.makeConverter = makeConverter;
    }
  });

  // node_modules/bip174/src/lib/converter/shared/tapInternalKey.js
  var require_tapInternalKey = __commonJS({
    "node_modules/bip174/src/lib/converter/shared/tapInternalKey.js"(exports7) {
      "use strict";
      init_dirname();
      init_buffer2();
      init_process2();
      Object.defineProperty(exports7, "__esModule", { value: true });
      function makeConverter(TYPE_BYTE) {
        function decode(keyVal) {
          if (keyVal.key[0] !== TYPE_BYTE || keyVal.key.length !== 1) {
            throw new Error(
              "Decode Error: could not decode tapInternalKey with key 0x" + keyVal.key.toString("hex")
            );
          }
          if (keyVal.value.length !== 32) {
            throw new Error(
              "Decode Error: tapInternalKey not a 32-byte x-only pubkey"
            );
          }
          return keyVal.value;
        }
        function encode(value) {
          const key = Buffer2.from([TYPE_BYTE]);
          return { key, value };
        }
        const expected = "Buffer";
        function check(data) {
          return Buffer2.isBuffer(data) && data.length === 32;
        }
        function canAdd(currentData, newData) {
          return !!currentData && !!newData && currentData.tapInternalKey === void 0;
        }
        return {
          decode,
          encode,
          check,
          expected,
          canAdd
        };
      }
      exports7.makeConverter = makeConverter;
    }
  });

  // node_modules/bip174/src/lib/converter/shared/witnessScript.js
  var require_witnessScript = __commonJS({
    "node_modules/bip174/src/lib/converter/shared/witnessScript.js"(exports7) {
      "use strict";
      init_dirname();
      init_buffer2();
      init_process2();
      Object.defineProperty(exports7, "__esModule", { value: true });
      function makeConverter(TYPE_BYTE) {
        function decode(keyVal) {
          if (keyVal.key[0] !== TYPE_BYTE) {
            throw new Error(
              "Decode Error: could not decode witnessScript with key 0x" + keyVal.key.toString("hex")
            );
          }
          return keyVal.value;
        }
        function encode(data) {
          const key = Buffer2.from([TYPE_BYTE]);
          return {
            key,
            value: data
          };
        }
        const expected = "Buffer";
        function check(data) {
          return Buffer2.isBuffer(data);
        }
        function canAdd(currentData, newData) {
          return !!currentData && !!newData && currentData.witnessScript === void 0;
        }
        return {
          decode,
          encode,
          check,
          expected,
          canAdd
        };
      }
      exports7.makeConverter = makeConverter;
    }
  });

  // node_modules/bip174/src/lib/converter/index.js
  var require_converter = __commonJS({
    "node_modules/bip174/src/lib/converter/index.js"(exports7) {
      "use strict";
      init_dirname();
      init_buffer2();
      init_process2();
      Object.defineProperty(exports7, "__esModule", { value: true });
      var typeFields_1 = require_typeFields();
      var globalXpub = require_globalXpub();
      var unsignedTx = require_unsignedTx();
      var finalScriptSig = require_finalScriptSig();
      var finalScriptWitness = require_finalScriptWitness();
      var nonWitnessUtxo = require_nonWitnessUtxo();
      var partialSig = require_partialSig();
      var porCommitment = require_porCommitment();
      var sighashType = require_sighashType();
      var tapKeySig = require_tapKeySig();
      var tapLeafScript = require_tapLeafScript();
      var tapMerkleRoot = require_tapMerkleRoot();
      var tapScriptSig = require_tapScriptSig();
      var witnessUtxo = require_witnessUtxo();
      var tapTree = require_tapTree();
      var bip32Derivation = require_bip32Derivation();
      var checkPubkey = require_checkPubkey();
      var redeemScript = require_redeemScript();
      var tapBip32Derivation = require_tapBip32Derivation();
      var tapInternalKey = require_tapInternalKey();
      var witnessScript = require_witnessScript();
      var globals = {
        unsignedTx,
        globalXpub,
        // pass an Array of key bytes that require pubkey beside the key
        checkPubkey: checkPubkey.makeChecker([])
      };
      exports7.globals = globals;
      var inputs = {
        nonWitnessUtxo,
        partialSig,
        sighashType,
        finalScriptSig,
        finalScriptWitness,
        porCommitment,
        witnessUtxo,
        bip32Derivation: bip32Derivation.makeConverter(
          typeFields_1.InputTypes.BIP32_DERIVATION
        ),
        redeemScript: redeemScript.makeConverter(
          typeFields_1.InputTypes.REDEEM_SCRIPT
        ),
        witnessScript: witnessScript.makeConverter(
          typeFields_1.InputTypes.WITNESS_SCRIPT
        ),
        checkPubkey: checkPubkey.makeChecker([
          typeFields_1.InputTypes.PARTIAL_SIG,
          typeFields_1.InputTypes.BIP32_DERIVATION
        ]),
        tapKeySig,
        tapScriptSig,
        tapLeafScript,
        tapBip32Derivation: tapBip32Derivation.makeConverter(
          typeFields_1.InputTypes.TAP_BIP32_DERIVATION
        ),
        tapInternalKey: tapInternalKey.makeConverter(
          typeFields_1.InputTypes.TAP_INTERNAL_KEY
        ),
        tapMerkleRoot
      };
      exports7.inputs = inputs;
      var outputs = {
        bip32Derivation: bip32Derivation.makeConverter(
          typeFields_1.OutputTypes.BIP32_DERIVATION
        ),
        redeemScript: redeemScript.makeConverter(
          typeFields_1.OutputTypes.REDEEM_SCRIPT
        ),
        witnessScript: witnessScript.makeConverter(
          typeFields_1.OutputTypes.WITNESS_SCRIPT
        ),
        checkPubkey: checkPubkey.makeChecker([
          typeFields_1.OutputTypes.BIP32_DERIVATION
        ]),
        tapBip32Derivation: tapBip32Derivation.makeConverter(
          typeFields_1.OutputTypes.TAP_BIP32_DERIVATION
        ),
        tapTree,
        tapInternalKey: tapInternalKey.makeConverter(
          typeFields_1.OutputTypes.TAP_INTERNAL_KEY
        )
      };
      exports7.outputs = outputs;
    }
  });

  // node_modules/bip174/src/lib/parser/fromBuffer.js
  var require_fromBuffer = __commonJS({
    "node_modules/bip174/src/lib/parser/fromBuffer.js"(exports7) {
      "use strict";
      init_dirname();
      init_buffer2();
      init_process2();
      Object.defineProperty(exports7, "__esModule", { value: true });
      var convert = require_converter();
      var tools_1 = require_tools();
      var varuint = require_varint();
      var typeFields_1 = require_typeFields();
      function psbtFromBuffer(buffer, txGetter) {
        let offset = 0;
        function varSlice() {
          const keyLen = varuint.decode(buffer, offset);
          offset += varuint.encodingLength(keyLen);
          const key = buffer.slice(offset, offset + keyLen);
          offset += keyLen;
          return key;
        }
        function readUInt32BE() {
          const num = buffer.readUInt32BE(offset);
          offset += 4;
          return num;
        }
        function readUInt8() {
          const num = buffer.readUInt8(offset);
          offset += 1;
          return num;
        }
        function getKeyValue() {
          const key = varSlice();
          const value = varSlice();
          return {
            key,
            value
          };
        }
        function checkEndOfKeyValPairs() {
          if (offset >= buffer.length) {
            throw new Error("Format Error: Unexpected End of PSBT");
          }
          const isEnd = buffer.readUInt8(offset) === 0;
          if (isEnd) {
            offset++;
          }
          return isEnd;
        }
        if (readUInt32BE() !== 1886610036) {
          throw new Error("Format Error: Invalid Magic Number");
        }
        if (readUInt8() !== 255) {
          throw new Error(
            "Format Error: Magic Number must be followed by 0xff separator"
          );
        }
        const globalMapKeyVals = [];
        const globalKeyIndex = {};
        while (!checkEndOfKeyValPairs()) {
          const keyVal = getKeyValue();
          const hexKey = keyVal.key.toString("hex");
          if (globalKeyIndex[hexKey]) {
            throw new Error(
              "Format Error: Keys must be unique for global keymap: key " + hexKey
            );
          }
          globalKeyIndex[hexKey] = 1;
          globalMapKeyVals.push(keyVal);
        }
        const unsignedTxMaps = globalMapKeyVals.filter(
          (keyVal) => keyVal.key[0] === typeFields_1.GlobalTypes.UNSIGNED_TX
        );
        if (unsignedTxMaps.length !== 1) {
          throw new Error("Format Error: Only one UNSIGNED_TX allowed");
        }
        const unsignedTx = txGetter(unsignedTxMaps[0].value);
        const { inputCount, outputCount } = unsignedTx.getInputOutputCounts();
        const inputKeyVals = [];
        const outputKeyVals = [];
        for (const index of tools_1.range(inputCount)) {
          const inputKeyIndex = {};
          const input = [];
          while (!checkEndOfKeyValPairs()) {
            const keyVal = getKeyValue();
            const hexKey = keyVal.key.toString("hex");
            if (inputKeyIndex[hexKey]) {
              throw new Error(
                "Format Error: Keys must be unique for each input: input index " + index + " key " + hexKey
              );
            }
            inputKeyIndex[hexKey] = 1;
            input.push(keyVal);
          }
          inputKeyVals.push(input);
        }
        for (const index of tools_1.range(outputCount)) {
          const outputKeyIndex = {};
          const output = [];
          while (!checkEndOfKeyValPairs()) {
            const keyVal = getKeyValue();
            const hexKey = keyVal.key.toString("hex");
            if (outputKeyIndex[hexKey]) {
              throw new Error(
                "Format Error: Keys must be unique for each output: output index " + index + " key " + hexKey
              );
            }
            outputKeyIndex[hexKey] = 1;
            output.push(keyVal);
          }
          outputKeyVals.push(output);
        }
        return psbtFromKeyVals(unsignedTx, {
          globalMapKeyVals,
          inputKeyVals,
          outputKeyVals
        });
      }
      exports7.psbtFromBuffer = psbtFromBuffer;
      function checkKeyBuffer(type, keyBuf, keyNum) {
        if (!keyBuf.equals(Buffer2.from([keyNum]))) {
          throw new Error(
            `Format Error: Invalid ${type} key: ${keyBuf.toString("hex")}`
          );
        }
      }
      exports7.checkKeyBuffer = checkKeyBuffer;
      function psbtFromKeyVals(unsignedTx, { globalMapKeyVals, inputKeyVals, outputKeyVals }) {
        const globalMap = {
          unsignedTx
        };
        let txCount = 0;
        for (const keyVal of globalMapKeyVals) {
          switch (keyVal.key[0]) {
            case typeFields_1.GlobalTypes.UNSIGNED_TX:
              checkKeyBuffer(
                "global",
                keyVal.key,
                typeFields_1.GlobalTypes.UNSIGNED_TX
              );
              if (txCount > 0) {
                throw new Error("Format Error: GlobalMap has multiple UNSIGNED_TX");
              }
              txCount++;
              break;
            case typeFields_1.GlobalTypes.GLOBAL_XPUB:
              if (globalMap.globalXpub === void 0) {
                globalMap.globalXpub = [];
              }
              globalMap.globalXpub.push(convert.globals.globalXpub.decode(keyVal));
              break;
            default:
              if (!globalMap.unknownKeyVals) globalMap.unknownKeyVals = [];
              globalMap.unknownKeyVals.push(keyVal);
          }
        }
        const inputCount = inputKeyVals.length;
        const outputCount = outputKeyVals.length;
        const inputs = [];
        const outputs = [];
        for (const index of tools_1.range(inputCount)) {
          const input = {};
          for (const keyVal of inputKeyVals[index]) {
            convert.inputs.checkPubkey(keyVal);
            switch (keyVal.key[0]) {
              case typeFields_1.InputTypes.NON_WITNESS_UTXO:
                checkKeyBuffer(
                  "input",
                  keyVal.key,
                  typeFields_1.InputTypes.NON_WITNESS_UTXO
                );
                if (input.nonWitnessUtxo !== void 0) {
                  throw new Error(
                    "Format Error: Input has multiple NON_WITNESS_UTXO"
                  );
                }
                input.nonWitnessUtxo = convert.inputs.nonWitnessUtxo.decode(keyVal);
                break;
              case typeFields_1.InputTypes.WITNESS_UTXO:
                checkKeyBuffer(
                  "input",
                  keyVal.key,
                  typeFields_1.InputTypes.WITNESS_UTXO
                );
                if (input.witnessUtxo !== void 0) {
                  throw new Error("Format Error: Input has multiple WITNESS_UTXO");
                }
                input.witnessUtxo = convert.inputs.witnessUtxo.decode(keyVal);
                break;
              case typeFields_1.InputTypes.PARTIAL_SIG:
                if (input.partialSig === void 0) {
                  input.partialSig = [];
                }
                input.partialSig.push(convert.inputs.partialSig.decode(keyVal));
                break;
              case typeFields_1.InputTypes.SIGHASH_TYPE:
                checkKeyBuffer(
                  "input",
                  keyVal.key,
                  typeFields_1.InputTypes.SIGHASH_TYPE
                );
                if (input.sighashType !== void 0) {
                  throw new Error("Format Error: Input has multiple SIGHASH_TYPE");
                }
                input.sighashType = convert.inputs.sighashType.decode(keyVal);
                break;
              case typeFields_1.InputTypes.REDEEM_SCRIPT:
                checkKeyBuffer(
                  "input",
                  keyVal.key,
                  typeFields_1.InputTypes.REDEEM_SCRIPT
                );
                if (input.redeemScript !== void 0) {
                  throw new Error("Format Error: Input has multiple REDEEM_SCRIPT");
                }
                input.redeemScript = convert.inputs.redeemScript.decode(keyVal);
                break;
              case typeFields_1.InputTypes.WITNESS_SCRIPT:
                checkKeyBuffer(
                  "input",
                  keyVal.key,
                  typeFields_1.InputTypes.WITNESS_SCRIPT
                );
                if (input.witnessScript !== void 0) {
                  throw new Error("Format Error: Input has multiple WITNESS_SCRIPT");
                }
                input.witnessScript = convert.inputs.witnessScript.decode(keyVal);
                break;
              case typeFields_1.InputTypes.BIP32_DERIVATION:
                if (input.bip32Derivation === void 0) {
                  input.bip32Derivation = [];
                }
                input.bip32Derivation.push(
                  convert.inputs.bip32Derivation.decode(keyVal)
                );
                break;
              case typeFields_1.InputTypes.FINAL_SCRIPTSIG:
                checkKeyBuffer(
                  "input",
                  keyVal.key,
                  typeFields_1.InputTypes.FINAL_SCRIPTSIG
                );
                input.finalScriptSig = convert.inputs.finalScriptSig.decode(keyVal);
                break;
              case typeFields_1.InputTypes.FINAL_SCRIPTWITNESS:
                checkKeyBuffer(
                  "input",
                  keyVal.key,
                  typeFields_1.InputTypes.FINAL_SCRIPTWITNESS
                );
                input.finalScriptWitness = convert.inputs.finalScriptWitness.decode(
                  keyVal
                );
                break;
              case typeFields_1.InputTypes.POR_COMMITMENT:
                checkKeyBuffer(
                  "input",
                  keyVal.key,
                  typeFields_1.InputTypes.POR_COMMITMENT
                );
                input.porCommitment = convert.inputs.porCommitment.decode(keyVal);
                break;
              case typeFields_1.InputTypes.TAP_KEY_SIG:
                checkKeyBuffer(
                  "input",
                  keyVal.key,
                  typeFields_1.InputTypes.TAP_KEY_SIG
                );
                input.tapKeySig = convert.inputs.tapKeySig.decode(keyVal);
                break;
              case typeFields_1.InputTypes.TAP_SCRIPT_SIG:
                if (input.tapScriptSig === void 0) {
                  input.tapScriptSig = [];
                }
                input.tapScriptSig.push(convert.inputs.tapScriptSig.decode(keyVal));
                break;
              case typeFields_1.InputTypes.TAP_LEAF_SCRIPT:
                if (input.tapLeafScript === void 0) {
                  input.tapLeafScript = [];
                }
                input.tapLeafScript.push(convert.inputs.tapLeafScript.decode(keyVal));
                break;
              case typeFields_1.InputTypes.TAP_BIP32_DERIVATION:
                if (input.tapBip32Derivation === void 0) {
                  input.tapBip32Derivation = [];
                }
                input.tapBip32Derivation.push(
                  convert.inputs.tapBip32Derivation.decode(keyVal)
                );
                break;
              case typeFields_1.InputTypes.TAP_INTERNAL_KEY:
                checkKeyBuffer(
                  "input",
                  keyVal.key,
                  typeFields_1.InputTypes.TAP_INTERNAL_KEY
                );
                input.tapInternalKey = convert.inputs.tapInternalKey.decode(keyVal);
                break;
              case typeFields_1.InputTypes.TAP_MERKLE_ROOT:
                checkKeyBuffer(
                  "input",
                  keyVal.key,
                  typeFields_1.InputTypes.TAP_MERKLE_ROOT
                );
                input.tapMerkleRoot = convert.inputs.tapMerkleRoot.decode(keyVal);
                break;
              default:
                if (!input.unknownKeyVals) input.unknownKeyVals = [];
                input.unknownKeyVals.push(keyVal);
            }
          }
          inputs.push(input);
        }
        for (const index of tools_1.range(outputCount)) {
          const output = {};
          for (const keyVal of outputKeyVals[index]) {
            convert.outputs.checkPubkey(keyVal);
            switch (keyVal.key[0]) {
              case typeFields_1.OutputTypes.REDEEM_SCRIPT:
                checkKeyBuffer(
                  "output",
                  keyVal.key,
                  typeFields_1.OutputTypes.REDEEM_SCRIPT
                );
                if (output.redeemScript !== void 0) {
                  throw new Error("Format Error: Output has multiple REDEEM_SCRIPT");
                }
                output.redeemScript = convert.outputs.redeemScript.decode(keyVal);
                break;
              case typeFields_1.OutputTypes.WITNESS_SCRIPT:
                checkKeyBuffer(
                  "output",
                  keyVal.key,
                  typeFields_1.OutputTypes.WITNESS_SCRIPT
                );
                if (output.witnessScript !== void 0) {
                  throw new Error("Format Error: Output has multiple WITNESS_SCRIPT");
                }
                output.witnessScript = convert.outputs.witnessScript.decode(keyVal);
                break;
              case typeFields_1.OutputTypes.BIP32_DERIVATION:
                if (output.bip32Derivation === void 0) {
                  output.bip32Derivation = [];
                }
                output.bip32Derivation.push(
                  convert.outputs.bip32Derivation.decode(keyVal)
                );
                break;
              case typeFields_1.OutputTypes.TAP_INTERNAL_KEY:
                checkKeyBuffer(
                  "output",
                  keyVal.key,
                  typeFields_1.OutputTypes.TAP_INTERNAL_KEY
                );
                output.tapInternalKey = convert.outputs.tapInternalKey.decode(keyVal);
                break;
              case typeFields_1.OutputTypes.TAP_TREE:
                checkKeyBuffer(
                  "output",
                  keyVal.key,
                  typeFields_1.OutputTypes.TAP_TREE
                );
                output.tapTree = convert.outputs.tapTree.decode(keyVal);
                break;
              case typeFields_1.OutputTypes.TAP_BIP32_DERIVATION:
                if (output.tapBip32Derivation === void 0) {
                  output.tapBip32Derivation = [];
                }
                output.tapBip32Derivation.push(
                  convert.outputs.tapBip32Derivation.decode(keyVal)
                );
                break;
              default:
                if (!output.unknownKeyVals) output.unknownKeyVals = [];
                output.unknownKeyVals.push(keyVal);
            }
          }
          outputs.push(output);
        }
        return { globalMap, inputs, outputs };
      }
      exports7.psbtFromKeyVals = psbtFromKeyVals;
    }
  });

  // node_modules/bip174/src/lib/parser/toBuffer.js
  var require_toBuffer = __commonJS({
    "node_modules/bip174/src/lib/parser/toBuffer.js"(exports7) {
      "use strict";
      init_dirname();
      init_buffer2();
      init_process2();
      Object.defineProperty(exports7, "__esModule", { value: true });
      var convert = require_converter();
      var tools_1 = require_tools();
      function psbtToBuffer({ globalMap, inputs, outputs }) {
        const { globalKeyVals, inputKeyVals, outputKeyVals } = psbtToKeyVals({
          globalMap,
          inputs,
          outputs
        });
        const globalBuffer = tools_1.keyValsToBuffer(globalKeyVals);
        const keyValsOrEmptyToBuffer = (keyVals) => keyVals.length === 0 ? [Buffer2.from([0])] : keyVals.map(tools_1.keyValsToBuffer);
        const inputBuffers = keyValsOrEmptyToBuffer(inputKeyVals);
        const outputBuffers = keyValsOrEmptyToBuffer(outputKeyVals);
        const header = Buffer2.allocUnsafe(5);
        header.writeUIntBE(482972169471, 0, 5);
        return Buffer2.concat(
          [header, globalBuffer].concat(inputBuffers, outputBuffers)
        );
      }
      exports7.psbtToBuffer = psbtToBuffer;
      var sortKeyVals = (a, b) => {
        return a.key.compare(b.key);
      };
      function keyValsFromMap(keyValMap, converterFactory) {
        const keyHexSet = /* @__PURE__ */ new Set();
        const keyVals = Object.entries(keyValMap).reduce((result, [key, value]) => {
          if (key === "unknownKeyVals") return result;
          const converter = converterFactory[key];
          if (converter === void 0) return result;
          const encodedKeyVals = (Array.isArray(value) ? value : [value]).map(
            converter.encode
          );
          const keyHexes = encodedKeyVals.map((kv) => kv.key.toString("hex"));
          keyHexes.forEach((hex) => {
            if (keyHexSet.has(hex))
              throw new Error("Serialize Error: Duplicate key: " + hex);
            keyHexSet.add(hex);
          });
          return result.concat(encodedKeyVals);
        }, []);
        const otherKeyVals = keyValMap.unknownKeyVals ? keyValMap.unknownKeyVals.filter((keyVal) => {
          return !keyHexSet.has(keyVal.key.toString("hex"));
        }) : [];
        return keyVals.concat(otherKeyVals).sort(sortKeyVals);
      }
      function psbtToKeyVals({ globalMap, inputs, outputs }) {
        return {
          globalKeyVals: keyValsFromMap(globalMap, convert.globals),
          inputKeyVals: inputs.map((i) => keyValsFromMap(i, convert.inputs)),
          outputKeyVals: outputs.map((o) => keyValsFromMap(o, convert.outputs))
        };
      }
      exports7.psbtToKeyVals = psbtToKeyVals;
    }
  });

  // node_modules/bip174/src/lib/parser/index.js
  var require_parser = __commonJS({
    "node_modules/bip174/src/lib/parser/index.js"(exports7) {
      "use strict";
      init_dirname();
      init_buffer2();
      init_process2();
      function __export2(m) {
        for (var p in m) if (!exports7.hasOwnProperty(p)) exports7[p] = m[p];
      }
      Object.defineProperty(exports7, "__esModule", { value: true });
      __export2(require_fromBuffer());
      __export2(require_toBuffer());
    }
  });

  // node_modules/bip174/src/lib/combiner/index.js
  var require_combiner = __commonJS({
    "node_modules/bip174/src/lib/combiner/index.js"(exports7) {
      "use strict";
      init_dirname();
      init_buffer2();
      init_process2();
      Object.defineProperty(exports7, "__esModule", { value: true });
      var parser_1 = require_parser();
      function combine(psbts) {
        const self2 = psbts[0];
        const selfKeyVals = parser_1.psbtToKeyVals(self2);
        const others = psbts.slice(1);
        if (others.length === 0) throw new Error("Combine: Nothing to combine");
        const selfTx = getTx(self2);
        if (selfTx === void 0) {
          throw new Error("Combine: Self missing transaction");
        }
        const selfGlobalSet = getKeySet(selfKeyVals.globalKeyVals);
        const selfInputSets = selfKeyVals.inputKeyVals.map(getKeySet);
        const selfOutputSets = selfKeyVals.outputKeyVals.map(getKeySet);
        for (const other of others) {
          const otherTx = getTx(other);
          if (otherTx === void 0 || !otherTx.toBuffer().equals(selfTx.toBuffer())) {
            throw new Error(
              "Combine: One of the Psbts does not have the same transaction."
            );
          }
          const otherKeyVals = parser_1.psbtToKeyVals(other);
          const otherGlobalSet = getKeySet(otherKeyVals.globalKeyVals);
          otherGlobalSet.forEach(
            keyPusher(
              selfGlobalSet,
              selfKeyVals.globalKeyVals,
              otherKeyVals.globalKeyVals
            )
          );
          const otherInputSets = otherKeyVals.inputKeyVals.map(getKeySet);
          otherInputSets.forEach(
            (inputSet, idx) => inputSet.forEach(
              keyPusher(
                selfInputSets[idx],
                selfKeyVals.inputKeyVals[idx],
                otherKeyVals.inputKeyVals[idx]
              )
            )
          );
          const otherOutputSets = otherKeyVals.outputKeyVals.map(getKeySet);
          otherOutputSets.forEach(
            (outputSet, idx) => outputSet.forEach(
              keyPusher(
                selfOutputSets[idx],
                selfKeyVals.outputKeyVals[idx],
                otherKeyVals.outputKeyVals[idx]
              )
            )
          );
        }
        return parser_1.psbtFromKeyVals(selfTx, {
          globalMapKeyVals: selfKeyVals.globalKeyVals,
          inputKeyVals: selfKeyVals.inputKeyVals,
          outputKeyVals: selfKeyVals.outputKeyVals
        });
      }
      exports7.combine = combine;
      function keyPusher(selfSet, selfKeyVals, otherKeyVals) {
        return (key) => {
          if (selfSet.has(key)) return;
          const newKv = otherKeyVals.filter((kv) => kv.key.toString("hex") === key)[0];
          selfKeyVals.push(newKv);
          selfSet.add(key);
        };
      }
      function getTx(psbt) {
        return psbt.globalMap.unsignedTx;
      }
      function getKeySet(keyVals) {
        const set = /* @__PURE__ */ new Set();
        keyVals.forEach((keyVal) => {
          const hex = keyVal.key.toString("hex");
          if (set.has(hex))
            throw new Error("Combine: KeyValue Map keys should be unique");
          set.add(hex);
        });
        return set;
      }
    }
  });

  // node_modules/bip174/src/lib/utils.js
  var require_utils2 = __commonJS({
    "node_modules/bip174/src/lib/utils.js"(exports7) {
      "use strict";
      init_dirname();
      init_buffer2();
      init_process2();
      Object.defineProperty(exports7, "__esModule", { value: true });
      var converter = require_converter();
      function checkForInput(inputs, inputIndex) {
        const input = inputs[inputIndex];
        if (input === void 0) throw new Error(`No input #${inputIndex}`);
        return input;
      }
      exports7.checkForInput = checkForInput;
      function checkForOutput(outputs, outputIndex) {
        const output = outputs[outputIndex];
        if (output === void 0) throw new Error(`No output #${outputIndex}`);
        return output;
      }
      exports7.checkForOutput = checkForOutput;
      function checkHasKey(checkKeyVal, keyVals, enumLength) {
        if (checkKeyVal.key[0] < enumLength) {
          throw new Error(
            `Use the method for your specific key instead of addUnknownKeyVal*`
          );
        }
        if (keyVals && keyVals.filter((kv) => kv.key.equals(checkKeyVal.key)).length !== 0) {
          throw new Error(`Duplicate Key: ${checkKeyVal.key.toString("hex")}`);
        }
      }
      exports7.checkHasKey = checkHasKey;
      function getEnumLength(myenum) {
        let count = 0;
        Object.keys(myenum).forEach((val) => {
          if (Number(isNaN(Number(val)))) {
            count++;
          }
        });
        return count;
      }
      exports7.getEnumLength = getEnumLength;
      function inputCheckUncleanFinalized(inputIndex, input) {
        let result = false;
        if (input.nonWitnessUtxo || input.witnessUtxo) {
          const needScriptSig = !!input.redeemScript;
          const needWitnessScript = !!input.witnessScript;
          const scriptSigOK = !needScriptSig || !!input.finalScriptSig;
          const witnessScriptOK = !needWitnessScript || !!input.finalScriptWitness;
          const hasOneFinal = !!input.finalScriptSig || !!input.finalScriptWitness;
          result = scriptSigOK && witnessScriptOK && hasOneFinal;
        }
        if (result === false) {
          throw new Error(
            `Input #${inputIndex} has too much or too little data to clean`
          );
        }
      }
      exports7.inputCheckUncleanFinalized = inputCheckUncleanFinalized;
      function throwForUpdateMaker(typeName, name, expected, data) {
        throw new Error(
          `Data for ${typeName} key ${name} is incorrect: Expected ${expected} and got ${JSON.stringify(data)}`
        );
      }
      function updateMaker(typeName) {
        return (updateData, mainData) => {
          for (const name of Object.keys(updateData)) {
            const data = updateData[name];
            const { canAdd, canAddToArray, check, expected } = (
              // @ts-ignore
              converter[typeName + "s"][name] || {}
            );
            const isArray2 = !!canAddToArray;
            if (check) {
              if (isArray2) {
                if (!Array.isArray(data) || // @ts-ignore
                mainData[name] && !Array.isArray(mainData[name])) {
                  throw new Error(`Key type ${name} must be an array`);
                }
                if (!data.every(check)) {
                  throwForUpdateMaker(typeName, name, expected, data);
                }
                const arr = mainData[name] || [];
                const dupeCheckSet = /* @__PURE__ */ new Set();
                if (!data.every((v) => canAddToArray(arr, v, dupeCheckSet))) {
                  throw new Error("Can not add duplicate data to array");
                }
                mainData[name] = arr.concat(data);
              } else {
                if (!check(data)) {
                  throwForUpdateMaker(typeName, name, expected, data);
                }
                if (!canAdd(mainData, data)) {
                  throw new Error(`Can not add duplicate data to ${typeName}`);
                }
                mainData[name] = data;
              }
            }
          }
        };
      }
      exports7.updateGlobal = updateMaker("global");
      exports7.updateInput = updateMaker("input");
      exports7.updateOutput = updateMaker("output");
      function addInputAttributes(inputs, data) {
        const index = inputs.length - 1;
        const input = checkForInput(inputs, index);
        exports7.updateInput(data, input);
      }
      exports7.addInputAttributes = addInputAttributes;
      function addOutputAttributes(outputs, data) {
        const index = outputs.length - 1;
        const output = checkForOutput(outputs, index);
        exports7.updateOutput(data, output);
      }
      exports7.addOutputAttributes = addOutputAttributes;
      function defaultVersionSetter(version2, txBuf) {
        if (!Buffer2.isBuffer(txBuf) || txBuf.length < 4) {
          throw new Error("Set Version: Invalid Transaction");
        }
        txBuf.writeUInt32LE(version2, 0);
        return txBuf;
      }
      exports7.defaultVersionSetter = defaultVersionSetter;
      function defaultLocktimeSetter(locktime, txBuf) {
        if (!Buffer2.isBuffer(txBuf) || txBuf.length < 4) {
          throw new Error("Set Locktime: Invalid Transaction");
        }
        txBuf.writeUInt32LE(locktime, txBuf.length - 4);
        return txBuf;
      }
      exports7.defaultLocktimeSetter = defaultLocktimeSetter;
    }
  });

  // node_modules/bip174/src/lib/psbt.js
  var require_psbt = __commonJS({
    "node_modules/bip174/src/lib/psbt.js"(exports7) {
      "use strict";
      init_dirname();
      init_buffer2();
      init_process2();
      Object.defineProperty(exports7, "__esModule", { value: true });
      var combiner_1 = require_combiner();
      var parser_1 = require_parser();
      var typeFields_1 = require_typeFields();
      var utils_1 = require_utils2();
      var Psbt = class {
        constructor(tx) {
          this.inputs = [];
          this.outputs = [];
          this.globalMap = {
            unsignedTx: tx
          };
        }
        static fromBase64(data, txFromBuffer) {
          const buffer = Buffer2.from(data, "base64");
          return this.fromBuffer(buffer, txFromBuffer);
        }
        static fromHex(data, txFromBuffer) {
          const buffer = Buffer2.from(data, "hex");
          return this.fromBuffer(buffer, txFromBuffer);
        }
        static fromBuffer(buffer, txFromBuffer) {
          const results = parser_1.psbtFromBuffer(buffer, txFromBuffer);
          const psbt = new this(results.globalMap.unsignedTx);
          Object.assign(psbt, results);
          return psbt;
        }
        toBase64() {
          const buffer = this.toBuffer();
          return buffer.toString("base64");
        }
        toHex() {
          const buffer = this.toBuffer();
          return buffer.toString("hex");
        }
        toBuffer() {
          return parser_1.psbtToBuffer(this);
        }
        updateGlobal(updateData) {
          utils_1.updateGlobal(updateData, this.globalMap);
          return this;
        }
        updateInput(inputIndex, updateData) {
          const input = utils_1.checkForInput(this.inputs, inputIndex);
          utils_1.updateInput(updateData, input);
          return this;
        }
        updateOutput(outputIndex, updateData) {
          const output = utils_1.checkForOutput(this.outputs, outputIndex);
          utils_1.updateOutput(updateData, output);
          return this;
        }
        addUnknownKeyValToGlobal(keyVal) {
          utils_1.checkHasKey(
            keyVal,
            this.globalMap.unknownKeyVals,
            utils_1.getEnumLength(typeFields_1.GlobalTypes)
          );
          if (!this.globalMap.unknownKeyVals) this.globalMap.unknownKeyVals = [];
          this.globalMap.unknownKeyVals.push(keyVal);
          return this;
        }
        addUnknownKeyValToInput(inputIndex, keyVal) {
          const input = utils_1.checkForInput(this.inputs, inputIndex);
          utils_1.checkHasKey(
            keyVal,
            input.unknownKeyVals,
            utils_1.getEnumLength(typeFields_1.InputTypes)
          );
          if (!input.unknownKeyVals) input.unknownKeyVals = [];
          input.unknownKeyVals.push(keyVal);
          return this;
        }
        addUnknownKeyValToOutput(outputIndex, keyVal) {
          const output = utils_1.checkForOutput(this.outputs, outputIndex);
          utils_1.checkHasKey(
            keyVal,
            output.unknownKeyVals,
            utils_1.getEnumLength(typeFields_1.OutputTypes)
          );
          if (!output.unknownKeyVals) output.unknownKeyVals = [];
          output.unknownKeyVals.push(keyVal);
          return this;
        }
        addInput(inputData) {
          this.globalMap.unsignedTx.addInput(inputData);
          this.inputs.push({
            unknownKeyVals: []
          });
          const addKeyVals = inputData.unknownKeyVals || [];
          const inputIndex = this.inputs.length - 1;
          if (!Array.isArray(addKeyVals)) {
            throw new Error("unknownKeyVals must be an Array");
          }
          addKeyVals.forEach(
            (keyVal) => this.addUnknownKeyValToInput(inputIndex, keyVal)
          );
          utils_1.addInputAttributes(this.inputs, inputData);
          return this;
        }
        addOutput(outputData) {
          this.globalMap.unsignedTx.addOutput(outputData);
          this.outputs.push({
            unknownKeyVals: []
          });
          const addKeyVals = outputData.unknownKeyVals || [];
          const outputIndex = this.outputs.length - 1;
          if (!Array.isArray(addKeyVals)) {
            throw new Error("unknownKeyVals must be an Array");
          }
          addKeyVals.forEach(
            (keyVal) => this.addUnknownKeyValToOutput(outputIndex, keyVal)
          );
          utils_1.addOutputAttributes(this.outputs, outputData);
          return this;
        }
        clearFinalizedInput(inputIndex) {
          const input = utils_1.checkForInput(this.inputs, inputIndex);
          utils_1.inputCheckUncleanFinalized(inputIndex, input);
          for (const key of Object.keys(input)) {
            if (![
              "witnessUtxo",
              "nonWitnessUtxo",
              "finalScriptSig",
              "finalScriptWitness",
              "unknownKeyVals"
            ].includes(key)) {
              delete input[key];
            }
          }
          return this;
        }
        combine(...those) {
          const result = combiner_1.combine([this].concat(those));
          Object.assign(this, result);
          return this;
        }
        getTransaction() {
          return this.globalMap.unsignedTx.toBuffer();
        }
      };
      exports7.Psbt = Psbt;
    }
  });

  // node_modules/bitcoinjs-lib/src/psbt/psbtutils.js
  var require_psbtutils = __commonJS({
    "node_modules/bitcoinjs-lib/src/psbt/psbtutils.js"(exports7) {
      "use strict";
      init_dirname();
      init_buffer2();
      init_process2();
      Object.defineProperty(exports7, "__esModule", { value: true });
      exports7.signatureBlocksAction = exports7.checkInputForSig = exports7.pubkeyInScript = exports7.pubkeyPositionInScript = exports7.witnessStackToScriptWitness = exports7.isP2TR = exports7.isP2SHScript = exports7.isP2WSHScript = exports7.isP2WPKH = exports7.isP2PKH = exports7.isP2PK = exports7.isP2MS = void 0;
      var varuint = require_varint();
      var bscript = require_script();
      var transaction_1 = require_transaction();
      var crypto_1 = require_crypto2();
      var payments = require_payments();
      function isPaymentFactory(payment) {
        return (script) => {
          try {
            payment({ output: script });
            return true;
          } catch (err) {
            return false;
          }
        };
      }
      exports7.isP2MS = isPaymentFactory(payments.p2ms);
      exports7.isP2PK = isPaymentFactory(payments.p2pk);
      exports7.isP2PKH = isPaymentFactory(payments.p2pkh);
      exports7.isP2WPKH = isPaymentFactory(payments.p2wpkh);
      exports7.isP2WSHScript = isPaymentFactory(payments.p2wsh);
      exports7.isP2SHScript = isPaymentFactory(payments.p2sh);
      exports7.isP2TR = isPaymentFactory(payments.p2tr);
      function witnessStackToScriptWitness(witness) {
        let buffer = Buffer2.allocUnsafe(0);
        function writeSlice(slice) {
          buffer = Buffer2.concat([buffer, Buffer2.from(slice)]);
        }
        function writeVarInt(i) {
          const currentLen = buffer.length;
          const varintLen = varuint.encodingLength(i);
          buffer = Buffer2.concat([buffer, Buffer2.allocUnsafe(varintLen)]);
          varuint.encode(i, buffer, currentLen);
        }
        function writeVarSlice(slice) {
          writeVarInt(slice.length);
          writeSlice(slice);
        }
        function writeVector(vector) {
          writeVarInt(vector.length);
          vector.forEach(writeVarSlice);
        }
        writeVector(witness);
        return buffer;
      }
      exports7.witnessStackToScriptWitness = witnessStackToScriptWitness;
      function pubkeyPositionInScript(pubkey, script) {
        const pubkeyHash = (0, crypto_1.hash160)(pubkey);
        const pubkeyXOnly = pubkey.slice(1, 33);
        const decompiled = bscript.decompile(script);
        if (decompiled === null) throw new Error("Unknown script error");
        return decompiled.findIndex((element) => {
          if (typeof element === "number") return false;
          return element.equals(pubkey) || element.equals(pubkeyHash) || element.equals(pubkeyXOnly);
        });
      }
      exports7.pubkeyPositionInScript = pubkeyPositionInScript;
      function pubkeyInScript(pubkey, script) {
        return pubkeyPositionInScript(pubkey, script) !== -1;
      }
      exports7.pubkeyInScript = pubkeyInScript;
      function checkInputForSig(input, action) {
        const pSigs = extractPartialSigs(input);
        return pSigs.some(
          (pSig) => signatureBlocksAction(pSig, bscript.signature.decode, action)
        );
      }
      exports7.checkInputForSig = checkInputForSig;
      function signatureBlocksAction(signature, signatureDecodeFn, action) {
        const { hashType } = signatureDecodeFn(signature);
        const whitelist = [];
        const isAnyoneCanPay = hashType & transaction_1.Transaction.SIGHASH_ANYONECANPAY;
        if (isAnyoneCanPay) whitelist.push("addInput");
        const hashMod = hashType & 31;
        switch (hashMod) {
          case transaction_1.Transaction.SIGHASH_ALL:
            break;
          case transaction_1.Transaction.SIGHASH_SINGLE:
          case transaction_1.Transaction.SIGHASH_NONE:
            whitelist.push("addOutput");
            whitelist.push("setInputSequence");
            break;
        }
        if (whitelist.indexOf(action) === -1) {
          return true;
        }
        return false;
      }
      exports7.signatureBlocksAction = signatureBlocksAction;
      function extractPartialSigs(input) {
        let pSigs = [];
        if ((input.partialSig || []).length === 0) {
          if (!input.finalScriptSig && !input.finalScriptWitness) return [];
          pSigs = getPsigsFromInputFinalScripts(input);
        } else {
          pSigs = input.partialSig;
        }
        return pSigs.map((p) => p.signature);
      }
      function getPsigsFromInputFinalScripts(input) {
        const scriptItems = !input.finalScriptSig ? [] : bscript.decompile(input.finalScriptSig) || [];
        const witnessItems = !input.finalScriptWitness ? [] : bscript.decompile(input.finalScriptWitness) || [];
        return scriptItems.concat(witnessItems).filter((item) => {
          return Buffer2.isBuffer(item) && bscript.isCanonicalScriptSignature(item);
        }).map((sig) => ({ signature: sig }));
      }
    }
  });

  // node_modules/bitcoinjs-lib/src/psbt/bip371.js
  var require_bip371 = __commonJS({
    "node_modules/bitcoinjs-lib/src/psbt/bip371.js"(exports7) {
      "use strict";
      init_dirname();
      init_buffer2();
      init_process2();
      Object.defineProperty(exports7, "__esModule", { value: true });
      exports7.checkTaprootInputForSigs = exports7.tapTreeFromList = exports7.tapTreeToList = exports7.tweakInternalPubKey = exports7.checkTaprootOutputFields = exports7.checkTaprootInputFields = exports7.isTaprootOutput = exports7.isTaprootInput = exports7.serializeTaprootSignature = exports7.tapScriptFinalizer = exports7.toXOnly = void 0;
      var types_1 = require_types();
      var transaction_1 = require_transaction();
      var psbtutils_1 = require_psbtutils();
      var bip341_1 = require_bip341();
      var payments_1 = require_payments();
      var psbtutils_2 = require_psbtutils();
      var toXOnly = (pubKey) => pubKey.length === 32 ? pubKey : pubKey.slice(1, 33);
      exports7.toXOnly = toXOnly;
      function tapScriptFinalizer(inputIndex, input, tapLeafHashToFinalize) {
        const tapLeaf = findTapLeafToFinalize(
          input,
          inputIndex,
          tapLeafHashToFinalize
        );
        try {
          const sigs = sortSignatures(input, tapLeaf);
          const witness = sigs.concat(tapLeaf.script).concat(tapLeaf.controlBlock);
          return {
            finalScriptWitness: (0, psbtutils_1.witnessStackToScriptWitness)(witness)
          };
        } catch (err) {
          throw new Error(`Can not finalize taproot input #${inputIndex}: ${err}`);
        }
      }
      exports7.tapScriptFinalizer = tapScriptFinalizer;
      function serializeTaprootSignature(sig, sighashType) {
        const sighashTypeByte = sighashType ? Buffer2.from([sighashType]) : Buffer2.from([]);
        return Buffer2.concat([sig, sighashTypeByte]);
      }
      exports7.serializeTaprootSignature = serializeTaprootSignature;
      function isTaprootInput(input) {
        return input && !!(input.tapInternalKey || input.tapMerkleRoot || input.tapLeafScript && input.tapLeafScript.length || input.tapBip32Derivation && input.tapBip32Derivation.length || input.witnessUtxo && (0, psbtutils_1.isP2TR)(input.witnessUtxo.script));
      }
      exports7.isTaprootInput = isTaprootInput;
      function isTaprootOutput(output, script) {
        return output && !!(output.tapInternalKey || output.tapTree || output.tapBip32Derivation && output.tapBip32Derivation.length || script && (0, psbtutils_1.isP2TR)(script));
      }
      exports7.isTaprootOutput = isTaprootOutput;
      function checkTaprootInputFields(inputData, newInputData, action) {
        checkMixedTaprootAndNonTaprootInputFields(inputData, newInputData, action);
        checkIfTapLeafInTree(inputData, newInputData, action);
      }
      exports7.checkTaprootInputFields = checkTaprootInputFields;
      function checkTaprootOutputFields(outputData, newOutputData, action) {
        checkMixedTaprootAndNonTaprootOutputFields(outputData, newOutputData, action);
        checkTaprootScriptPubkey(outputData, newOutputData);
      }
      exports7.checkTaprootOutputFields = checkTaprootOutputFields;
      function checkTaprootScriptPubkey(outputData, newOutputData) {
        if (!newOutputData.tapTree && !newOutputData.tapInternalKey) return;
        const tapInternalKey = newOutputData.tapInternalKey || outputData.tapInternalKey;
        const tapTree = newOutputData.tapTree || outputData.tapTree;
        if (tapInternalKey) {
          const { script: scriptPubkey } = outputData;
          const script = getTaprootScripPubkey(tapInternalKey, tapTree);
          if (scriptPubkey && !scriptPubkey.equals(script))
            throw new Error("Error adding output. Script or address missmatch.");
        }
      }
      function getTaprootScripPubkey(tapInternalKey, tapTree) {
        const scriptTree = tapTree && tapTreeFromList(tapTree.leaves);
        const { output } = (0, payments_1.p2tr)({
          internalPubkey: tapInternalKey,
          scriptTree
        });
        return output;
      }
      function tweakInternalPubKey(inputIndex, input) {
        const tapInternalKey = input.tapInternalKey;
        const outputKey = tapInternalKey && (0, bip341_1.tweakKey)(tapInternalKey, input.tapMerkleRoot);
        if (!outputKey)
          throw new Error(
            `Cannot tweak tap internal key for input #${inputIndex}. Public key: ${tapInternalKey && tapInternalKey.toString("hex")}`
          );
        return outputKey.x;
      }
      exports7.tweakInternalPubKey = tweakInternalPubKey;
      function tapTreeToList(tree) {
        if (!(0, types_1.isTaptree)(tree))
          throw new Error(
            "Cannot convert taptree to tapleaf list. Expecting a tapree structure."
          );
        return _tapTreeToList(tree);
      }
      exports7.tapTreeToList = tapTreeToList;
      function tapTreeFromList(leaves = []) {
        if (leaves.length === 1 && leaves[0].depth === 0)
          return {
            output: leaves[0].script,
            version: leaves[0].leafVersion
          };
        return instertLeavesInTree(leaves);
      }
      exports7.tapTreeFromList = tapTreeFromList;
      function checkTaprootInputForSigs(input, action) {
        const sigs = extractTaprootSigs(input);
        return sigs.some(
          (sig) => (0, psbtutils_2.signatureBlocksAction)(sig, decodeSchnorrSignature, action)
        );
      }
      exports7.checkTaprootInputForSigs = checkTaprootInputForSigs;
      function decodeSchnorrSignature(signature) {
        return {
          signature: signature.slice(0, 64),
          hashType: signature.slice(64)[0] || transaction_1.Transaction.SIGHASH_DEFAULT
        };
      }
      function extractTaprootSigs(input) {
        const sigs = [];
        if (input.tapKeySig) sigs.push(input.tapKeySig);
        if (input.tapScriptSig)
          sigs.push(...input.tapScriptSig.map((s) => s.signature));
        if (!sigs.length) {
          const finalTapKeySig = getTapKeySigFromWithness(input.finalScriptWitness);
          if (finalTapKeySig) sigs.push(finalTapKeySig);
        }
        return sigs;
      }
      function getTapKeySigFromWithness(finalScriptWitness) {
        if (!finalScriptWitness) return;
        const witness = finalScriptWitness.slice(2);
        if (witness.length === 64 || witness.length === 65) return witness;
      }
      function _tapTreeToList(tree, leaves = [], depth = 0) {
        if (depth > bip341_1.MAX_TAPTREE_DEPTH)
          throw new Error("Max taptree depth exceeded.");
        if (!tree) return [];
        if ((0, types_1.isTapleaf)(tree)) {
          leaves.push({
            depth,
            leafVersion: tree.version || bip341_1.LEAF_VERSION_TAPSCRIPT,
            script: tree.output
          });
          return leaves;
        }
        if (tree[0]) _tapTreeToList(tree[0], leaves, depth + 1);
        if (tree[1]) _tapTreeToList(tree[1], leaves, depth + 1);
        return leaves;
      }
      function instertLeavesInTree(leaves) {
        let tree;
        for (const leaf of leaves) {
          tree = instertLeafInTree(leaf, tree);
          if (!tree) throw new Error(`No room left to insert tapleaf in tree`);
        }
        return tree;
      }
      function instertLeafInTree(leaf, tree, depth = 0) {
        if (depth > bip341_1.MAX_TAPTREE_DEPTH)
          throw new Error("Max taptree depth exceeded.");
        if (leaf.depth === depth) {
          if (!tree)
            return {
              output: leaf.script,
              version: leaf.leafVersion
            };
          return;
        }
        if ((0, types_1.isTapleaf)(tree)) return;
        const leftSide = instertLeafInTree(leaf, tree && tree[0], depth + 1);
        if (leftSide) return [leftSide, tree && tree[1]];
        const rightSide = instertLeafInTree(leaf, tree && tree[1], depth + 1);
        if (rightSide) return [tree && tree[0], rightSide];
      }
      function checkMixedTaprootAndNonTaprootInputFields(inputData, newInputData, action) {
        const isBadTaprootUpdate = isTaprootInput(inputData) && hasNonTaprootFields(newInputData);
        const isBadNonTaprootUpdate = hasNonTaprootFields(inputData) && isTaprootInput(newInputData);
        const hasMixedFields = inputData === newInputData && isTaprootInput(newInputData) && hasNonTaprootFields(newInputData);
        if (isBadTaprootUpdate || isBadNonTaprootUpdate || hasMixedFields)
          throw new Error(
            `Invalid arguments for Psbt.${action}. Cannot use both taproot and non-taproot fields.`
          );
      }
      function checkMixedTaprootAndNonTaprootOutputFields(inputData, newInputData, action) {
        const isBadTaprootUpdate = isTaprootOutput(inputData) && hasNonTaprootFields(newInputData);
        const isBadNonTaprootUpdate = hasNonTaprootFields(inputData) && isTaprootOutput(newInputData);
        const hasMixedFields = inputData === newInputData && isTaprootOutput(newInputData) && hasNonTaprootFields(newInputData);
        if (isBadTaprootUpdate || isBadNonTaprootUpdate || hasMixedFields)
          throw new Error(
            `Invalid arguments for Psbt.${action}. Cannot use both taproot and non-taproot fields.`
          );
      }
      function checkIfTapLeafInTree(inputData, newInputData, action) {
        if (newInputData.tapMerkleRoot) {
          const newLeafsInTree = (newInputData.tapLeafScript || []).every(
            (l) => isTapLeafInTree(l, newInputData.tapMerkleRoot)
          );
          const oldLeafsInTree = (inputData.tapLeafScript || []).every(
            (l) => isTapLeafInTree(l, newInputData.tapMerkleRoot)
          );
          if (!newLeafsInTree || !oldLeafsInTree)
            throw new Error(
              `Invalid arguments for Psbt.${action}. Tapleaf not part of taptree.`
            );
        } else if (inputData.tapMerkleRoot) {
          const newLeafsInTree = (newInputData.tapLeafScript || []).every(
            (l) => isTapLeafInTree(l, inputData.tapMerkleRoot)
          );
          if (!newLeafsInTree)
            throw new Error(
              `Invalid arguments for Psbt.${action}. Tapleaf not part of taptree.`
            );
        }
      }
      function isTapLeafInTree(tapLeaf, merkleRoot) {
        if (!merkleRoot) return true;
        const leafHash = (0, bip341_1.tapleafHash)({
          output: tapLeaf.script,
          version: tapLeaf.leafVersion
        });
        const rootHash = (0, bip341_1.rootHashFromPath)(
          tapLeaf.controlBlock,
          leafHash
        );
        return rootHash.equals(merkleRoot);
      }
      function sortSignatures(input, tapLeaf) {
        const leafHash = (0, bip341_1.tapleafHash)({
          output: tapLeaf.script,
          version: tapLeaf.leafVersion
        });
        return (input.tapScriptSig || []).filter((tss) => tss.leafHash.equals(leafHash)).map((tss) => addPubkeyPositionInScript(tapLeaf.script, tss)).sort((t1, t2) => t2.positionInScript - t1.positionInScript).map((t) => t.signature);
      }
      function addPubkeyPositionInScript(script, tss) {
        return Object.assign(
          {
            positionInScript: (0, psbtutils_1.pubkeyPositionInScript)(
              tss.pubkey,
              script
            )
          },
          tss
        );
      }
      function findTapLeafToFinalize(input, inputIndex, leafHashToFinalize) {
        if (!input.tapScriptSig || !input.tapScriptSig.length)
          throw new Error(
            `Can not finalize taproot input #${inputIndex}. No tapleaf script signature provided.`
          );
        const tapLeaf = (input.tapLeafScript || []).sort((a, b) => a.controlBlock.length - b.controlBlock.length).find(
          (leaf) => canFinalizeLeaf(leaf, input.tapScriptSig, leafHashToFinalize)
        );
        if (!tapLeaf)
          throw new Error(
            `Can not finalize taproot input #${inputIndex}. Signature for tapleaf script not found.`
          );
        return tapLeaf;
      }
      function canFinalizeLeaf(leaf, tapScriptSig, hash) {
        const leafHash = (0, bip341_1.tapleafHash)({
          output: leaf.script,
          version: leaf.leafVersion
        });
        const whiteListedHash = !hash || hash.equals(leafHash);
        return whiteListedHash && tapScriptSig.find((tss) => tss.leafHash.equals(leafHash)) !== void 0;
      }
      function hasNonTaprootFields(io) {
        return io && !!(io.redeemScript || io.witnessScript || io.bip32Derivation && io.bip32Derivation.length);
      }
    }
  });

  // node_modules/bitcoinjs-lib/src/psbt.js
  var require_psbt2 = __commonJS({
    "node_modules/bitcoinjs-lib/src/psbt.js"(exports7) {
      "use strict";
      init_dirname();
      init_buffer2();
      init_process2();
      Object.defineProperty(exports7, "__esModule", { value: true });
      exports7.Psbt = void 0;
      var bip174_1 = require_psbt();
      var varuint = require_varint();
      var utils_1 = require_utils2();
      var address_1 = require_address();
      var bufferutils_1 = require_bufferutils();
      var networks_1 = require_networks();
      var payments = require_payments();
      var bip341_1 = require_bip341();
      var bscript = require_script();
      var transaction_1 = require_transaction();
      var bip371_1 = require_bip371();
      var psbtutils_1 = require_psbtutils();
      var DEFAULT_OPTS = {
        /**
         * A bitcoinjs Network object. This is only used if you pass an `address`
         * parameter to addOutput. Otherwise it is not needed and can be left default.
         */
        network: networks_1.bitcoin,
        /**
         * When extractTransaction is called, the fee rate is checked.
         * THIS IS NOT TO BE RELIED ON.
         * It is only here as a last ditch effort to prevent sending a 500 BTC fee etc.
         */
        maximumFeeRate: 5e3
        // satoshi per byte
      };
      var Psbt = class _Psbt {
        static fromBase64(data, opts = {}) {
          const buffer = Buffer2.from(data, "base64");
          return this.fromBuffer(buffer, opts);
        }
        static fromHex(data, opts = {}) {
          const buffer = Buffer2.from(data, "hex");
          return this.fromBuffer(buffer, opts);
        }
        static fromBuffer(buffer, opts = {}) {
          const psbtBase = bip174_1.Psbt.fromBuffer(buffer, transactionFromBuffer);
          const psbt = new _Psbt(opts, psbtBase);
          checkTxForDupeIns(psbt.__CACHE.__TX, psbt.__CACHE);
          return psbt;
        }
        constructor(opts = {}, data = new bip174_1.Psbt(new PsbtTransaction())) {
          this.data = data;
          this.opts = Object.assign({}, DEFAULT_OPTS, opts);
          this.__CACHE = {
            __NON_WITNESS_UTXO_TX_CACHE: [],
            __NON_WITNESS_UTXO_BUF_CACHE: [],
            __TX_IN_CACHE: {},
            __TX: this.data.globalMap.unsignedTx.tx,
            // Psbt's predecessor (TransactionBuilder - now removed) behavior
            // was to not confirm input values  before signing.
            // Even though we highly encourage people to get
            // the full parent transaction to verify values, the ability to
            // sign non-segwit inputs without the full transaction was often
            // requested. So the only way to activate is to use @ts-ignore.
            // We will disable exporting the Psbt when unsafe sign is active.
            // because it is not BIP174 compliant.
            __UNSAFE_SIGN_NONSEGWIT: false
          };
          if (this.data.inputs.length === 0) this.setVersion(2);
          const dpew = (obj, attr, enumerable, writable) => Object.defineProperty(obj, attr, {
            enumerable,
            writable
          });
          dpew(this, "__CACHE", false, true);
          dpew(this, "opts", false, true);
        }
        get inputCount() {
          return this.data.inputs.length;
        }
        get version() {
          return this.__CACHE.__TX.version;
        }
        set version(version2) {
          this.setVersion(version2);
        }
        get locktime() {
          return this.__CACHE.__TX.locktime;
        }
        set locktime(locktime) {
          this.setLocktime(locktime);
        }
        get txInputs() {
          return this.__CACHE.__TX.ins.map((input) => ({
            hash: (0, bufferutils_1.cloneBuffer)(input.hash),
            index: input.index,
            sequence: input.sequence
          }));
        }
        get txOutputs() {
          return this.__CACHE.__TX.outs.map((output) => {
            let address;
            try {
              address = (0, address_1.fromOutputScript)(
                output.script,
                this.opts.network
              );
            } catch (_) {
            }
            return {
              script: (0, bufferutils_1.cloneBuffer)(output.script),
              value: output.value,
              address
            };
          });
        }
        combine(...those) {
          this.data.combine(...those.map((o) => o.data));
          const c = this.__CACHE;
          c.__FEE = void 0;
          c.__FEE_RATE = void 0;
          c.__EXTRACTED_TX = void 0;
          return this;
        }
        clone() {
          const res = _Psbt.fromBuffer(this.data.toBuffer());
          res.opts = JSON.parse(JSON.stringify(this.opts));
          return res;
        }
        setMaximumFeeRate(satoshiPerByte) {
          check32Bit(satoshiPerByte);
          this.opts.maximumFeeRate = satoshiPerByte;
        }
        setVersion(version2) {
          check32Bit(version2);
          checkInputsForPartialSig(this.data.inputs, "setVersion");
          const c = this.__CACHE;
          c.__TX.version = version2;
          c.__EXTRACTED_TX = void 0;
          return this;
        }
        setLocktime(locktime) {
          check32Bit(locktime);
          checkInputsForPartialSig(this.data.inputs, "setLocktime");
          const c = this.__CACHE;
          c.__TX.locktime = locktime;
          c.__EXTRACTED_TX = void 0;
          return this;
        }
        setInputSequence(inputIndex, sequence) {
          check32Bit(sequence);
          checkInputsForPartialSig(this.data.inputs, "setInputSequence");
          const c = this.__CACHE;
          if (c.__TX.ins.length <= inputIndex) {
            throw new Error("Input index too high");
          }
          c.__TX.ins[inputIndex].sequence = sequence;
          c.__EXTRACTED_TX = void 0;
          return this;
        }
        addInputs(inputDatas) {
          inputDatas.forEach((inputData) => this.addInput(inputData));
          return this;
        }
        addInput(inputData) {
          if (arguments.length > 1 || !inputData || inputData.hash === void 0 || inputData.index === void 0) {
            throw new Error(
              `Invalid arguments for Psbt.addInput. Requires single object with at least [hash] and [index]`
            );
          }
          (0, bip371_1.checkTaprootInputFields)(inputData, inputData, "addInput");
          checkInputsForPartialSig(this.data.inputs, "addInput");
          if (inputData.witnessScript) checkInvalidP2WSH(inputData.witnessScript);
          const c = this.__CACHE;
          this.data.addInput(inputData);
          const txIn = c.__TX.ins[c.__TX.ins.length - 1];
          checkTxInputCache(c, txIn);
          const inputIndex = this.data.inputs.length - 1;
          const input = this.data.inputs[inputIndex];
          if (input.nonWitnessUtxo) {
            addNonWitnessTxCache(this.__CACHE, input, inputIndex);
          }
          c.__FEE = void 0;
          c.__FEE_RATE = void 0;
          c.__EXTRACTED_TX = void 0;
          return this;
        }
        addOutputs(outputDatas) {
          outputDatas.forEach((outputData) => this.addOutput(outputData));
          return this;
        }
        addOutput(outputData) {
          if (arguments.length > 1 || !outputData || outputData.value === void 0 || outputData.address === void 0 && outputData.script === void 0) {
            throw new Error(
              `Invalid arguments for Psbt.addOutput. Requires single object with at least [script or address] and [value]`
            );
          }
          checkInputsForPartialSig(this.data.inputs, "addOutput");
          const { address } = outputData;
          if (typeof address === "string") {
            const { network: network2 } = this.opts;
            const script = (0, address_1.toOutputScript)(address, network2);
            outputData = Object.assign({}, outputData, { script });
          }
          (0, bip371_1.checkTaprootOutputFields)(outputData, outputData, "addOutput");
          const c = this.__CACHE;
          this.data.addOutput(outputData);
          c.__FEE = void 0;
          c.__FEE_RATE = void 0;
          c.__EXTRACTED_TX = void 0;
          return this;
        }
        extractTransaction(disableFeeCheck) {
          if (!this.data.inputs.every(isFinalized)) throw new Error("Not finalized");
          const c = this.__CACHE;
          if (!disableFeeCheck) {
            checkFees(this, c, this.opts);
          }
          if (c.__EXTRACTED_TX) return c.__EXTRACTED_TX;
          const tx = c.__TX.clone();
          inputFinalizeGetAmts(this.data.inputs, tx, c, true);
          return tx;
        }
        getFeeRate() {
          return getTxCacheValue(
            "__FEE_RATE",
            "fee rate",
            this.data.inputs,
            this.__CACHE
          );
        }
        getFee() {
          return getTxCacheValue("__FEE", "fee", this.data.inputs, this.__CACHE);
        }
        finalizeAllInputs() {
          (0, utils_1.checkForInput)(this.data.inputs, 0);
          range(this.data.inputs.length).forEach((idx) => this.finalizeInput(idx));
          return this;
        }
        finalizeInput(inputIndex, finalScriptsFunc) {
          const input = (0, utils_1.checkForInput)(this.data.inputs, inputIndex);
          if ((0, bip371_1.isTaprootInput)(input))
            return this._finalizeTaprootInput(
              inputIndex,
              input,
              void 0,
              finalScriptsFunc
            );
          return this._finalizeInput(inputIndex, input, finalScriptsFunc);
        }
        finalizeTaprootInput(inputIndex, tapLeafHashToFinalize, finalScriptsFunc = bip371_1.tapScriptFinalizer) {
          const input = (0, utils_1.checkForInput)(this.data.inputs, inputIndex);
          if ((0, bip371_1.isTaprootInput)(input))
            return this._finalizeTaprootInput(
              inputIndex,
              input,
              tapLeafHashToFinalize,
              finalScriptsFunc
            );
          throw new Error(`Cannot finalize input #${inputIndex}. Not Taproot.`);
        }
        _finalizeInput(inputIndex, input, finalScriptsFunc = getFinalScripts) {
          const { script, isP2SH, isP2WSH, isSegwit } = getScriptFromInput(
            inputIndex,
            input,
            this.__CACHE
          );
          if (!script) throw new Error(`No script found for input #${inputIndex}`);
          checkPartialSigSighashes(input);
          const { finalScriptSig, finalScriptWitness } = finalScriptsFunc(
            inputIndex,
            input,
            script,
            isSegwit,
            isP2SH,
            isP2WSH
          );
          if (finalScriptSig) this.data.updateInput(inputIndex, { finalScriptSig });
          if (finalScriptWitness)
            this.data.updateInput(inputIndex, { finalScriptWitness });
          if (!finalScriptSig && !finalScriptWitness)
            throw new Error(`Unknown error finalizing input #${inputIndex}`);
          this.data.clearFinalizedInput(inputIndex);
          return this;
        }
        _finalizeTaprootInput(inputIndex, input, tapLeafHashToFinalize, finalScriptsFunc = bip371_1.tapScriptFinalizer) {
          if (!input.witnessUtxo)
            throw new Error(
              `Cannot finalize input #${inputIndex}. Missing withness utxo.`
            );
          if (input.tapKeySig) {
            const payment = payments.p2tr({
              output: input.witnessUtxo.script,
              signature: input.tapKeySig
            });
            const finalScriptWitness = (0, psbtutils_1.witnessStackToScriptWitness)(
              payment.witness
            );
            this.data.updateInput(inputIndex, { finalScriptWitness });
          } else {
            const { finalScriptWitness } = finalScriptsFunc(
              inputIndex,
              input,
              tapLeafHashToFinalize
            );
            this.data.updateInput(inputIndex, { finalScriptWitness });
          }
          this.data.clearFinalizedInput(inputIndex);
          return this;
        }
        getInputType(inputIndex) {
          const input = (0, utils_1.checkForInput)(this.data.inputs, inputIndex);
          const script = getScriptFromUtxo(inputIndex, input, this.__CACHE);
          const result = getMeaningfulScript(
            script,
            inputIndex,
            "input",
            input.redeemScript || redeemFromFinalScriptSig(input.finalScriptSig),
            input.witnessScript || redeemFromFinalWitnessScript(input.finalScriptWitness)
          );
          const type = result.type === "raw" ? "" : result.type + "-";
          const mainType = classifyScript(result.meaningfulScript);
          return type + mainType;
        }
        inputHasPubkey(inputIndex, pubkey) {
          const input = (0, utils_1.checkForInput)(this.data.inputs, inputIndex);
          return pubkeyInInput(pubkey, input, inputIndex, this.__CACHE);
        }
        inputHasHDKey(inputIndex, root) {
          const input = (0, utils_1.checkForInput)(this.data.inputs, inputIndex);
          const derivationIsMine = bip32DerivationIsMine(root);
          return !!input.bip32Derivation && input.bip32Derivation.some(derivationIsMine);
        }
        outputHasPubkey(outputIndex, pubkey) {
          const output = (0, utils_1.checkForOutput)(this.data.outputs, outputIndex);
          return pubkeyInOutput(pubkey, output, outputIndex, this.__CACHE);
        }
        outputHasHDKey(outputIndex, root) {
          const output = (0, utils_1.checkForOutput)(this.data.outputs, outputIndex);
          const derivationIsMine = bip32DerivationIsMine(root);
          return !!output.bip32Derivation && output.bip32Derivation.some(derivationIsMine);
        }
        validateSignaturesOfAllInputs(validator) {
          (0, utils_1.checkForInput)(this.data.inputs, 0);
          const results = range(this.data.inputs.length).map(
            (idx) => this.validateSignaturesOfInput(idx, validator)
          );
          return results.reduce((final, res) => res === true && final, true);
        }
        validateSignaturesOfInput(inputIndex, validator, pubkey) {
          const input = this.data.inputs[inputIndex];
          if ((0, bip371_1.isTaprootInput)(input))
            return this.validateSignaturesOfTaprootInput(
              inputIndex,
              validator,
              pubkey
            );
          return this._validateSignaturesOfInput(inputIndex, validator, pubkey);
        }
        _validateSignaturesOfInput(inputIndex, validator, pubkey) {
          const input = this.data.inputs[inputIndex];
          const partialSig = (input || {}).partialSig;
          if (!input || !partialSig || partialSig.length < 1)
            throw new Error("No signatures to validate");
          if (typeof validator !== "function")
            throw new Error("Need validator function to validate signatures");
          const mySigs = pubkey ? partialSig.filter((sig) => sig.pubkey.equals(pubkey)) : partialSig;
          if (mySigs.length < 1) throw new Error("No signatures for this pubkey");
          const results = [];
          let hashCache;
          let scriptCache;
          let sighashCache;
          for (const pSig of mySigs) {
            const sig = bscript.signature.decode(pSig.signature);
            const { hash, script } = sighashCache !== sig.hashType ? getHashForSig(
              inputIndex,
              Object.assign({}, input, { sighashType: sig.hashType }),
              this.__CACHE,
              true
            ) : { hash: hashCache, script: scriptCache };
            sighashCache = sig.hashType;
            hashCache = hash;
            scriptCache = script;
            checkScriptForPubkey(pSig.pubkey, script, "verify");
            results.push(validator(pSig.pubkey, hash, sig.signature));
          }
          return results.every((res) => res === true);
        }
        validateSignaturesOfTaprootInput(inputIndex, validator, pubkey) {
          const input = this.data.inputs[inputIndex];
          const tapKeySig = (input || {}).tapKeySig;
          const tapScriptSig = (input || {}).tapScriptSig;
          if (!input && !tapKeySig && !(tapScriptSig && !tapScriptSig.length))
            throw new Error("No signatures to validate");
          if (typeof validator !== "function")
            throw new Error("Need validator function to validate signatures");
          pubkey = pubkey && (0, bip371_1.toXOnly)(pubkey);
          const allHashses = pubkey ? getTaprootHashesForSig(
            inputIndex,
            input,
            this.data.inputs,
            pubkey,
            this.__CACHE
          ) : getAllTaprootHashesForSig(
            inputIndex,
            input,
            this.data.inputs,
            this.__CACHE
          );
          if (!allHashses.length) throw new Error("No signatures for this pubkey");
          const tapKeyHash = allHashses.find((h) => !h.leafHash);
          let validationResultCount = 0;
          if (tapKeySig && tapKeyHash) {
            const isValidTapkeySig = validator(
              tapKeyHash.pubkey,
              tapKeyHash.hash,
              trimTaprootSig(tapKeySig)
            );
            if (!isValidTapkeySig) return false;
            validationResultCount++;
          }
          if (tapScriptSig) {
            for (const tapSig of tapScriptSig) {
              const tapSigHash = allHashses.find((h) => tapSig.pubkey.equals(h.pubkey));
              if (tapSigHash) {
                const isValidTapScriptSig = validator(
                  tapSig.pubkey,
                  tapSigHash.hash,
                  trimTaprootSig(tapSig.signature)
                );
                if (!isValidTapScriptSig) return false;
                validationResultCount++;
              }
            }
          }
          return validationResultCount > 0;
        }
        signAllInputsHD(hdKeyPair, sighashTypes = [transaction_1.Transaction.SIGHASH_ALL]) {
          if (!hdKeyPair || !hdKeyPair.publicKey || !hdKeyPair.fingerprint) {
            throw new Error("Need HDSigner to sign input");
          }
          const results = [];
          for (const i of range(this.data.inputs.length)) {
            try {
              this.signInputHD(i, hdKeyPair, sighashTypes);
              results.push(true);
            } catch (err) {
              results.push(false);
            }
          }
          if (results.every((v) => v === false)) {
            throw new Error("No inputs were signed");
          }
          return this;
        }
        signAllInputsHDAsync(hdKeyPair, sighashTypes = [transaction_1.Transaction.SIGHASH_ALL]) {
          return new Promise((resolve, reject) => {
            if (!hdKeyPair || !hdKeyPair.publicKey || !hdKeyPair.fingerprint) {
              return reject(new Error("Need HDSigner to sign input"));
            }
            const results = [];
            const promises = [];
            for (const i of range(this.data.inputs.length)) {
              promises.push(
                this.signInputHDAsync(i, hdKeyPair, sighashTypes).then(
                  () => {
                    results.push(true);
                  },
                  () => {
                    results.push(false);
                  }
                )
              );
            }
            return Promise.all(promises).then(() => {
              if (results.every((v) => v === false)) {
                return reject(new Error("No inputs were signed"));
              }
              resolve();
            });
          });
        }
        signInputHD(inputIndex, hdKeyPair, sighashTypes = [transaction_1.Transaction.SIGHASH_ALL]) {
          if (!hdKeyPair || !hdKeyPair.publicKey || !hdKeyPair.fingerprint) {
            throw new Error("Need HDSigner to sign input");
          }
          const signers = getSignersFromHD(inputIndex, this.data.inputs, hdKeyPair);
          signers.forEach((signer) => this.signInput(inputIndex, signer, sighashTypes));
          return this;
        }
        signInputHDAsync(inputIndex, hdKeyPair, sighashTypes = [transaction_1.Transaction.SIGHASH_ALL]) {
          return new Promise((resolve, reject) => {
            if (!hdKeyPair || !hdKeyPair.publicKey || !hdKeyPair.fingerprint) {
              return reject(new Error("Need HDSigner to sign input"));
            }
            const signers = getSignersFromHD(inputIndex, this.data.inputs, hdKeyPair);
            const promises = signers.map(
              (signer) => this.signInputAsync(inputIndex, signer, sighashTypes)
            );
            return Promise.all(promises).then(() => {
              resolve();
            }).catch(reject);
          });
        }
        signAllInputs(keyPair, sighashTypes) {
          if (!keyPair || !keyPair.publicKey)
            throw new Error("Need Signer to sign input");
          const results = [];
          for (const i of range(this.data.inputs.length)) {
            try {
              this.signInput(i, keyPair, sighashTypes);
              results.push(true);
            } catch (err) {
              results.push(false);
            }
          }
          if (results.every((v) => v === false)) {
            throw new Error("No inputs were signed");
          }
          return this;
        }
        signAllInputsAsync(keyPair, sighashTypes) {
          return new Promise((resolve, reject) => {
            if (!keyPair || !keyPair.publicKey)
              return reject(new Error("Need Signer to sign input"));
            const results = [];
            const promises = [];
            for (const [i] of this.data.inputs.entries()) {
              promises.push(
                this.signInputAsync(i, keyPair, sighashTypes).then(
                  () => {
                    results.push(true);
                  },
                  () => {
                    results.push(false);
                  }
                )
              );
            }
            return Promise.all(promises).then(() => {
              if (results.every((v) => v === false)) {
                return reject(new Error("No inputs were signed"));
              }
              resolve();
            });
          });
        }
        signInput(inputIndex, keyPair, sighashTypes) {
          if (!keyPair || !keyPair.publicKey)
            throw new Error("Need Signer to sign input");
          const input = (0, utils_1.checkForInput)(this.data.inputs, inputIndex);
          if ((0, bip371_1.isTaprootInput)(input)) {
            return this._signTaprootInput(
              inputIndex,
              input,
              keyPair,
              void 0,
              sighashTypes
            );
          }
          return this._signInput(inputIndex, keyPair, sighashTypes);
        }
        signTaprootInput(inputIndex, keyPair, tapLeafHashToSign, sighashTypes) {
          if (!keyPair || !keyPair.publicKey)
            throw new Error("Need Signer to sign input");
          const input = (0, utils_1.checkForInput)(this.data.inputs, inputIndex);
          if ((0, bip371_1.isTaprootInput)(input))
            return this._signTaprootInput(
              inputIndex,
              input,
              keyPair,
              tapLeafHashToSign,
              sighashTypes
            );
          throw new Error(`Input #${inputIndex} is not of type Taproot.`);
        }
        _signInput(inputIndex, keyPair, sighashTypes = [transaction_1.Transaction.SIGHASH_ALL]) {
          const { hash, sighashType } = getHashAndSighashType(
            this.data.inputs,
            inputIndex,
            keyPair.publicKey,
            this.__CACHE,
            sighashTypes
          );
          const partialSig = [
            {
              pubkey: keyPair.publicKey,
              signature: bscript.signature.encode(keyPair.sign(hash), sighashType)
            }
          ];
          this.data.updateInput(inputIndex, { partialSig });
          return this;
        }
        _signTaprootInput(inputIndex, input, keyPair, tapLeafHashToSign, allowedSighashTypes = [transaction_1.Transaction.SIGHASH_DEFAULT]) {
          const hashesForSig = this.checkTaprootHashesForSig(
            inputIndex,
            input,
            keyPair,
            tapLeafHashToSign,
            allowedSighashTypes
          );
          const tapKeySig = hashesForSig.filter((h) => !h.leafHash).map(
            (h) => (0, bip371_1.serializeTaprootSignature)(
              keyPair.signSchnorr(h.hash),
              input.sighashType
            )
          )[0];
          const tapScriptSig = hashesForSig.filter((h) => !!h.leafHash).map((h) => ({
            pubkey: (0, bip371_1.toXOnly)(keyPair.publicKey),
            signature: (0, bip371_1.serializeTaprootSignature)(
              keyPair.signSchnorr(h.hash),
              input.sighashType
            ),
            leafHash: h.leafHash
          }));
          if (tapKeySig) {
            this.data.updateInput(inputIndex, { tapKeySig });
          }
          if (tapScriptSig.length) {
            this.data.updateInput(inputIndex, { tapScriptSig });
          }
          return this;
        }
        signInputAsync(inputIndex, keyPair, sighashTypes) {
          return Promise.resolve().then(() => {
            if (!keyPair || !keyPair.publicKey)
              throw new Error("Need Signer to sign input");
            const input = (0, utils_1.checkForInput)(this.data.inputs, inputIndex);
            if ((0, bip371_1.isTaprootInput)(input))
              return this._signTaprootInputAsync(
                inputIndex,
                input,
                keyPair,
                void 0,
                sighashTypes
              );
            return this._signInputAsync(inputIndex, keyPair, sighashTypes);
          });
        }
        signTaprootInputAsync(inputIndex, keyPair, tapLeafHash, sighashTypes) {
          return Promise.resolve().then(() => {
            if (!keyPair || !keyPair.publicKey)
              throw new Error("Need Signer to sign input");
            const input = (0, utils_1.checkForInput)(this.data.inputs, inputIndex);
            if ((0, bip371_1.isTaprootInput)(input))
              return this._signTaprootInputAsync(
                inputIndex,
                input,
                keyPair,
                tapLeafHash,
                sighashTypes
              );
            throw new Error(`Input #${inputIndex} is not of type Taproot.`);
          });
        }
        _signInputAsync(inputIndex, keyPair, sighashTypes = [transaction_1.Transaction.SIGHASH_ALL]) {
          const { hash, sighashType } = getHashAndSighashType(
            this.data.inputs,
            inputIndex,
            keyPair.publicKey,
            this.__CACHE,
            sighashTypes
          );
          return Promise.resolve(keyPair.sign(hash)).then((signature) => {
            const partialSig = [
              {
                pubkey: keyPair.publicKey,
                signature: bscript.signature.encode(signature, sighashType)
              }
            ];
            this.data.updateInput(inputIndex, { partialSig });
          });
        }
        async _signTaprootInputAsync(inputIndex, input, keyPair, tapLeafHash, sighashTypes = [transaction_1.Transaction.SIGHASH_DEFAULT]) {
          const hashesForSig = this.checkTaprootHashesForSig(
            inputIndex,
            input,
            keyPair,
            tapLeafHash,
            sighashTypes
          );
          const signaturePromises = [];
          const tapKeyHash = hashesForSig.filter((h) => !h.leafHash)[0];
          if (tapKeyHash) {
            const tapKeySigPromise = Promise.resolve(
              keyPair.signSchnorr(tapKeyHash.hash)
            ).then((sig) => {
              return {
                tapKeySig: (0, bip371_1.serializeTaprootSignature)(
                  sig,
                  input.sighashType
                )
              };
            });
            signaturePromises.push(tapKeySigPromise);
          }
          const tapScriptHashes = hashesForSig.filter((h) => !!h.leafHash);
          if (tapScriptHashes.length) {
            const tapScriptSigPromises = tapScriptHashes.map((tsh) => {
              return Promise.resolve(keyPair.signSchnorr(tsh.hash)).then(
                (signature) => {
                  const tapScriptSig = [
                    {
                      pubkey: (0, bip371_1.toXOnly)(keyPair.publicKey),
                      signature: (0, bip371_1.serializeTaprootSignature)(
                        signature,
                        input.sighashType
                      ),
                      leafHash: tsh.leafHash
                    }
                  ];
                  return { tapScriptSig };
                }
              );
            });
            signaturePromises.push(...tapScriptSigPromises);
          }
          return Promise.all(signaturePromises).then((results) => {
            results.forEach((v) => this.data.updateInput(inputIndex, v));
          });
        }
        checkTaprootHashesForSig(inputIndex, input, keyPair, tapLeafHashToSign, allowedSighashTypes) {
          if (typeof keyPair.signSchnorr !== "function")
            throw new Error(
              `Need Schnorr Signer to sign taproot input #${inputIndex}.`
            );
          const hashesForSig = getTaprootHashesForSig(
            inputIndex,
            input,
            this.data.inputs,
            keyPair.publicKey,
            this.__CACHE,
            tapLeafHashToSign,
            allowedSighashTypes
          );
          if (!hashesForSig || !hashesForSig.length)
            throw new Error(
              `Can not sign for input #${inputIndex} with the key ${keyPair.publicKey.toString(
                "hex"
              )}`
            );
          return hashesForSig;
        }
        toBuffer() {
          checkCache(this.__CACHE);
          return this.data.toBuffer();
        }
        toHex() {
          checkCache(this.__CACHE);
          return this.data.toHex();
        }
        toBase64() {
          checkCache(this.__CACHE);
          return this.data.toBase64();
        }
        updateGlobal(updateData) {
          this.data.updateGlobal(updateData);
          return this;
        }
        updateInput(inputIndex, updateData) {
          if (updateData.witnessScript) checkInvalidP2WSH(updateData.witnessScript);
          (0, bip371_1.checkTaprootInputFields)(
            this.data.inputs[inputIndex],
            updateData,
            "updateInput"
          );
          this.data.updateInput(inputIndex, updateData);
          if (updateData.nonWitnessUtxo) {
            addNonWitnessTxCache(
              this.__CACHE,
              this.data.inputs[inputIndex],
              inputIndex
            );
          }
          if (updateData.nonWitnessUtxo || updateData.witnessUtxo) {
            const c = this.__CACHE;
            c.__FEE = void 0;
            c.__FEE_RATE = void 0;
            c.__EXTRACTED_TX = void 0;
          }
          return this;
        }
        updateOutput(outputIndex, updateData) {
          const outputData = this.data.outputs[outputIndex];
          (0, bip371_1.checkTaprootOutputFields)(
            outputData,
            updateData,
            "updateOutput"
          );
          this.data.updateOutput(outputIndex, updateData);
          return this;
        }
        addUnknownKeyValToGlobal(keyVal) {
          this.data.addUnknownKeyValToGlobal(keyVal);
          return this;
        }
        addUnknownKeyValToInput(inputIndex, keyVal) {
          this.data.addUnknownKeyValToInput(inputIndex, keyVal);
          return this;
        }
        addUnknownKeyValToOutput(outputIndex, keyVal) {
          this.data.addUnknownKeyValToOutput(outputIndex, keyVal);
          return this;
        }
        clearFinalizedInput(inputIndex) {
          this.data.clearFinalizedInput(inputIndex);
          return this;
        }
      };
      exports7.Psbt = Psbt;
      var transactionFromBuffer = (buffer) => new PsbtTransaction(buffer);
      var PsbtTransaction = class {
        constructor(buffer = Buffer2.from([2, 0, 0, 0, 0, 0, 0, 0, 0, 0])) {
          this.tx = transaction_1.Transaction.fromBuffer(buffer);
          checkTxEmpty(this.tx);
          Object.defineProperty(this, "tx", {
            enumerable: false,
            writable: true
          });
        }
        getInputOutputCounts() {
          return {
            inputCount: this.tx.ins.length,
            outputCount: this.tx.outs.length
          };
        }
        addInput(input) {
          if (input.hash === void 0 || input.index === void 0 || !Buffer2.isBuffer(input.hash) && typeof input.hash !== "string" || typeof input.index !== "number") {
            throw new Error("Error adding input.");
          }
          const hash = typeof input.hash === "string" ? (0, bufferutils_1.reverseBuffer)(Buffer2.from(input.hash, "hex")) : input.hash;
          this.tx.addInput(hash, input.index, input.sequence);
        }
        addOutput(output) {
          if (output.script === void 0 || output.value === void 0 || !Buffer2.isBuffer(output.script) || typeof output.value !== "number") {
            throw new Error("Error adding output.");
          }
          this.tx.addOutput(output.script, output.value);
        }
        toBuffer() {
          return this.tx.toBuffer();
        }
      };
      function canFinalize(input, script, scriptType) {
        switch (scriptType) {
          case "pubkey":
          case "pubkeyhash":
          case "witnesspubkeyhash":
            return hasSigs(1, input.partialSig);
          case "multisig":
            const p2ms = payments.p2ms({ output: script });
            return hasSigs(p2ms.m, input.partialSig, p2ms.pubkeys);
          default:
            return false;
        }
      }
      function checkCache(cache) {
        if (cache.__UNSAFE_SIGN_NONSEGWIT !== false) {
          throw new Error("Not BIP174 compliant, can not export");
        }
      }
      function hasSigs(neededSigs, partialSig, pubkeys) {
        if (!partialSig) return false;
        let sigs;
        if (pubkeys) {
          sigs = pubkeys.map((pkey) => {
            const pubkey = compressPubkey(pkey);
            return partialSig.find((pSig) => pSig.pubkey.equals(pubkey));
          }).filter((v) => !!v);
        } else {
          sigs = partialSig;
        }
        if (sigs.length > neededSigs) throw new Error("Too many signatures");
        return sigs.length === neededSigs;
      }
      function isFinalized(input) {
        return !!input.finalScriptSig || !!input.finalScriptWitness;
      }
      function bip32DerivationIsMine(root) {
        return (d) => {
          if (!d.masterFingerprint.equals(root.fingerprint)) return false;
          if (!root.derivePath(d.path).publicKey.equals(d.pubkey)) return false;
          return true;
        };
      }
      function check32Bit(num) {
        if (typeof num !== "number" || num !== Math.floor(num) || num > 4294967295 || num < 0) {
          throw new Error("Invalid 32 bit integer");
        }
      }
      function checkFees(psbt, cache, opts) {
        const feeRate = cache.__FEE_RATE || psbt.getFeeRate();
        const vsize = cache.__EXTRACTED_TX.virtualSize();
        const satoshis = feeRate * vsize;
        if (feeRate >= opts.maximumFeeRate) {
          throw new Error(
            `Warning: You are paying around ${(satoshis / 1e8).toFixed(8)} in fees, which is ${feeRate} satoshi per byte for a transaction with a VSize of ${vsize} bytes (segwit counted as 0.25 byte per byte). Use setMaximumFeeRate method to raise your threshold, or pass true to the first arg of extractTransaction.`
          );
        }
      }
      function checkInputsForPartialSig(inputs, action) {
        inputs.forEach((input) => {
          const throws3 = (0, bip371_1.isTaprootInput)(input) ? (0, bip371_1.checkTaprootInputForSigs)(input, action) : (0, psbtutils_1.checkInputForSig)(input, action);
          if (throws3)
            throw new Error("Can not modify transaction, signatures exist.");
        });
      }
      function checkPartialSigSighashes(input) {
        if (!input.sighashType || !input.partialSig) return;
        const { partialSig, sighashType } = input;
        partialSig.forEach((pSig) => {
          const { hashType } = bscript.signature.decode(pSig.signature);
          if (sighashType !== hashType) {
            throw new Error("Signature sighash does not match input sighash type");
          }
        });
      }
      function checkScriptForPubkey(pubkey, script, action) {
        if (!(0, psbtutils_1.pubkeyInScript)(pubkey, script)) {
          throw new Error(
            `Can not ${action} for this input with the key ${pubkey.toString("hex")}`
          );
        }
      }
      function checkTxEmpty(tx) {
        const isEmpty = tx.ins.every(
          (input) => input.script && input.script.length === 0 && input.witness && input.witness.length === 0
        );
        if (!isEmpty) {
          throw new Error("Format Error: Transaction ScriptSigs are not empty");
        }
      }
      function checkTxForDupeIns(tx, cache) {
        tx.ins.forEach((input) => {
          checkTxInputCache(cache, input);
        });
      }
      function checkTxInputCache(cache, input) {
        const key = (0, bufferutils_1.reverseBuffer)(Buffer2.from(input.hash)).toString("hex") + ":" + input.index;
        if (cache.__TX_IN_CACHE[key]) throw new Error("Duplicate input detected.");
        cache.__TX_IN_CACHE[key] = 1;
      }
      function scriptCheckerFactory(payment, paymentScriptName) {
        return (inputIndex, scriptPubKey, redeemScript, ioType) => {
          const redeemScriptOutput = payment({
            redeem: { output: redeemScript }
          }).output;
          if (!scriptPubKey.equals(redeemScriptOutput)) {
            throw new Error(
              `${paymentScriptName} for ${ioType} #${inputIndex} doesn't match the scriptPubKey in the prevout`
            );
          }
        };
      }
      var checkRedeemScript = scriptCheckerFactory(payments.p2sh, "Redeem script");
      var checkWitnessScript = scriptCheckerFactory(
        payments.p2wsh,
        "Witness script"
      );
      function getTxCacheValue(key, name, inputs, c) {
        if (!inputs.every(isFinalized))
          throw new Error(`PSBT must be finalized to calculate ${name}`);
        if (key === "__FEE_RATE" && c.__FEE_RATE) return c.__FEE_RATE;
        if (key === "__FEE" && c.__FEE) return c.__FEE;
        let tx;
        let mustFinalize = true;
        if (c.__EXTRACTED_TX) {
          tx = c.__EXTRACTED_TX;
          mustFinalize = false;
        } else {
          tx = c.__TX.clone();
        }
        inputFinalizeGetAmts(inputs, tx, c, mustFinalize);
        if (key === "__FEE_RATE") return c.__FEE_RATE;
        else if (key === "__FEE") return c.__FEE;
      }
      function getFinalScripts(inputIndex, input, script, isSegwit, isP2SH, isP2WSH) {
        const scriptType = classifyScript(script);
        if (!canFinalize(input, script, scriptType))
          throw new Error(`Can not finalize input #${inputIndex}`);
        return prepareFinalScripts(
          script,
          scriptType,
          input.partialSig,
          isSegwit,
          isP2SH,
          isP2WSH
        );
      }
      function prepareFinalScripts(script, scriptType, partialSig, isSegwit, isP2SH, isP2WSH) {
        let finalScriptSig;
        let finalScriptWitness;
        const payment = getPayment(script, scriptType, partialSig);
        const p2wsh = !isP2WSH ? null : payments.p2wsh({ redeem: payment });
        const p2sh = !isP2SH ? null : payments.p2sh({ redeem: p2wsh || payment });
        if (isSegwit) {
          if (p2wsh) {
            finalScriptWitness = (0, psbtutils_1.witnessStackToScriptWitness)(
              p2wsh.witness
            );
          } else {
            finalScriptWitness = (0, psbtutils_1.witnessStackToScriptWitness)(
              payment.witness
            );
          }
          if (p2sh) {
            finalScriptSig = p2sh.input;
          }
        } else {
          if (p2sh) {
            finalScriptSig = p2sh.input;
          } else {
            finalScriptSig = payment.input;
          }
        }
        return {
          finalScriptSig,
          finalScriptWitness
        };
      }
      function getHashAndSighashType(inputs, inputIndex, pubkey, cache, sighashTypes) {
        const input = (0, utils_1.checkForInput)(inputs, inputIndex);
        const { hash, sighashType, script } = getHashForSig(
          inputIndex,
          input,
          cache,
          false,
          sighashTypes
        );
        checkScriptForPubkey(pubkey, script, "sign");
        return {
          hash,
          sighashType
        };
      }
      function getHashForSig(inputIndex, input, cache, forValidate, sighashTypes) {
        const unsignedTx = cache.__TX;
        const sighashType = input.sighashType || transaction_1.Transaction.SIGHASH_ALL;
        checkSighashTypeAllowed(sighashType, sighashTypes);
        let hash;
        const prevout = getUtxoForInput(inputIndex, input, cache);
        if (!prevout) throw new Error("Need a Utxo input item for signing");
        const { meaningfulScript, type } = getMeaningfulScript(
          prevout.script,
          inputIndex,
          "input",
          input.redeemScript,
          input.witnessScript
        );
        if (["p2sh-p2wsh", "p2wsh"].indexOf(type) >= 0) {
          hash = unsignedTx.hashForWitnessV0(
            inputIndex,
            meaningfulScript,
            prevout.value,
            sighashType
          );
        } else if ((0, psbtutils_1.isP2WPKH)(meaningfulScript)) {
          const signingScript = payments.p2pkh({
            hash: meaningfulScript.slice(2)
          }).output;
          hash = unsignedTx.hashForWitnessV0(
            inputIndex,
            signingScript,
            prevout.value,
            sighashType
          );
        } else {
          if (input.nonWitnessUtxo === void 0 && cache.__UNSAFE_SIGN_NONSEGWIT === false)
            throw new Error(
              `Input #${inputIndex} has witnessUtxo but non-segwit script: ${meaningfulScript.toString("hex")}`
            );
          if (!forValidate && cache.__UNSAFE_SIGN_NONSEGWIT !== false)
            console.warn(
              "Warning: Signing non-segwit inputs without the full parent transaction means there is a chance that a miner could feed you incorrect information to trick you into paying large fees. This behavior is the same as Psbt's predecessor (TransactionBuilder - now removed) when signing non-segwit scripts. You are not able to export this Psbt with toBuffer|toBase64|toHex since it is not BIP174 compliant.\n*********************\nPROCEED WITH CAUTION!\n*********************"
            );
          hash = unsignedTx.hashForSignature(
            inputIndex,
            meaningfulScript,
            sighashType
          );
        }
        return {
          script: meaningfulScript,
          sighashType,
          hash
        };
      }
      function getAllTaprootHashesForSig(inputIndex, input, inputs, cache) {
        const allPublicKeys = [];
        if (input.tapInternalKey) {
          const key = getPrevoutTaprootKey(inputIndex, input, cache);
          if (key) {
            allPublicKeys.push(key);
          }
        }
        if (input.tapScriptSig) {
          const tapScriptPubkeys = input.tapScriptSig.map((tss) => tss.pubkey);
          allPublicKeys.push(...tapScriptPubkeys);
        }
        const allHashes = allPublicKeys.map(
          (pubicKey) => getTaprootHashesForSig(inputIndex, input, inputs, pubicKey, cache)
        );
        return allHashes.flat();
      }
      function getPrevoutTaprootKey(inputIndex, input, cache) {
        const { script } = getScriptAndAmountFromUtxo(inputIndex, input, cache);
        return (0, psbtutils_1.isP2TR)(script) ? script.subarray(2, 34) : null;
      }
      function trimTaprootSig(signature) {
        return signature.length === 64 ? signature : signature.subarray(0, 64);
      }
      function getTaprootHashesForSig(inputIndex, input, inputs, pubkey, cache, tapLeafHashToSign, allowedSighashTypes) {
        const unsignedTx = cache.__TX;
        const sighashType = input.sighashType || transaction_1.Transaction.SIGHASH_DEFAULT;
        checkSighashTypeAllowed(sighashType, allowedSighashTypes);
        const prevOuts = inputs.map(
          (i, index) => getScriptAndAmountFromUtxo(index, i, cache)
        );
        const signingScripts = prevOuts.map((o) => o.script);
        const values = prevOuts.map((o) => o.value);
        const hashes = [];
        if (input.tapInternalKey && !tapLeafHashToSign) {
          const outputKey = getPrevoutTaprootKey(inputIndex, input, cache) || Buffer2.from([]);
          if ((0, bip371_1.toXOnly)(pubkey).equals(outputKey)) {
            const tapKeyHash = unsignedTx.hashForWitnessV1(
              inputIndex,
              signingScripts,
              values,
              sighashType
            );
            hashes.push({ pubkey, hash: tapKeyHash });
          }
        }
        const tapLeafHashes = (input.tapLeafScript || []).filter((tapLeaf) => (0, psbtutils_1.pubkeyInScript)(pubkey, tapLeaf.script)).map((tapLeaf) => {
          const hash = (0, bip341_1.tapleafHash)({
            output: tapLeaf.script,
            version: tapLeaf.leafVersion
          });
          return Object.assign({ hash }, tapLeaf);
        }).filter(
          (tapLeaf) => !tapLeafHashToSign || tapLeafHashToSign.equals(tapLeaf.hash)
        ).map((tapLeaf) => {
          const tapScriptHash = unsignedTx.hashForWitnessV1(
            inputIndex,
            signingScripts,
            values,
            sighashType,
            tapLeaf.hash
          );
          return {
            pubkey,
            hash: tapScriptHash,
            leafHash: tapLeaf.hash
          };
        });
        return hashes.concat(tapLeafHashes);
      }
      function checkSighashTypeAllowed(sighashType, sighashTypes) {
        if (sighashTypes && sighashTypes.indexOf(sighashType) < 0) {
          const str = sighashTypeToString(sighashType);
          throw new Error(
            `Sighash type is not allowed. Retry the sign method passing the sighashTypes array of whitelisted types. Sighash type: ${str}`
          );
        }
      }
      function getPayment(script, scriptType, partialSig) {
        let payment;
        switch (scriptType) {
          case "multisig":
            const sigs = getSortedSigs(script, partialSig);
            payment = payments.p2ms({
              output: script,
              signatures: sigs
            });
            break;
          case "pubkey":
            payment = payments.p2pk({
              output: script,
              signature: partialSig[0].signature
            });
            break;
          case "pubkeyhash":
            payment = payments.p2pkh({
              output: script,
              pubkey: partialSig[0].pubkey,
              signature: partialSig[0].signature
            });
            break;
          case "witnesspubkeyhash":
            payment = payments.p2wpkh({
              output: script,
              pubkey: partialSig[0].pubkey,
              signature: partialSig[0].signature
            });
            break;
        }
        return payment;
      }
      function getScriptFromInput(inputIndex, input, cache) {
        const res = {
          script: null,
          isSegwit: false,
          isP2SH: false,
          isP2WSH: false
        };
        res.isP2SH = !!input.redeemScript;
        res.isP2WSH = !!input.witnessScript;
        if (input.witnessScript) {
          res.script = input.witnessScript;
        } else if (input.redeemScript) {
          res.script = input.redeemScript;
        } else {
          const prevout = getUtxoForInput(inputIndex, input, cache);
          if (prevout) res.script = prevout.script;
        }
        if (input.witnessScript || (0, psbtutils_1.isP2WPKH)(res.script)) {
          res.isSegwit = true;
        }
        return res;
      }
      function getSignersFromHD(inputIndex, inputs, hdKeyPair) {
        const input = (0, utils_1.checkForInput)(inputs, inputIndex);
        if (!input.bip32Derivation || input.bip32Derivation.length === 0) {
          throw new Error("Need bip32Derivation to sign with HD");
        }
        const myDerivations = input.bip32Derivation.map((bipDv) => {
          if (bipDv.masterFingerprint.equals(hdKeyPair.fingerprint)) {
            return bipDv;
          } else {
            return;
          }
        }).filter((v) => !!v);
        if (myDerivations.length === 0) {
          throw new Error(
            "Need one bip32Derivation masterFingerprint to match the HDSigner fingerprint"
          );
        }
        const signers = myDerivations.map((bipDv) => {
          const node = hdKeyPair.derivePath(bipDv.path);
          if (!bipDv.pubkey.equals(node.publicKey)) {
            throw new Error("pubkey did not match bip32Derivation");
          }
          return node;
        });
        return signers;
      }
      function getSortedSigs(script, partialSig) {
        const p2ms = payments.p2ms({ output: script });
        return p2ms.pubkeys.map((pk) => {
          return (partialSig.filter((ps) => {
            return ps.pubkey.equals(pk);
          })[0] || {}).signature;
        }).filter((v) => !!v);
      }
      function scriptWitnessToWitnessStack(buffer) {
        let offset = 0;
        function readSlice(n) {
          offset += n;
          return buffer.slice(offset - n, offset);
        }
        function readVarInt() {
          const vi = varuint.decode(buffer, offset);
          offset += varuint.decode.bytes;
          return vi;
        }
        function readVarSlice() {
          return readSlice(readVarInt());
        }
        function readVector() {
          const count = readVarInt();
          const vector = [];
          for (let i = 0; i < count; i++) vector.push(readVarSlice());
          return vector;
        }
        return readVector();
      }
      function sighashTypeToString(sighashType) {
        let text = sighashType & transaction_1.Transaction.SIGHASH_ANYONECANPAY ? "SIGHASH_ANYONECANPAY | " : "";
        const sigMod = sighashType & 31;
        switch (sigMod) {
          case transaction_1.Transaction.SIGHASH_ALL:
            text += "SIGHASH_ALL";
            break;
          case transaction_1.Transaction.SIGHASH_SINGLE:
            text += "SIGHASH_SINGLE";
            break;
          case transaction_1.Transaction.SIGHASH_NONE:
            text += "SIGHASH_NONE";
            break;
        }
        return text;
      }
      function addNonWitnessTxCache(cache, input, inputIndex) {
        cache.__NON_WITNESS_UTXO_BUF_CACHE[inputIndex] = input.nonWitnessUtxo;
        const tx = transaction_1.Transaction.fromBuffer(input.nonWitnessUtxo);
        cache.__NON_WITNESS_UTXO_TX_CACHE[inputIndex] = tx;
        const self2 = cache;
        const selfIndex = inputIndex;
        delete input.nonWitnessUtxo;
        Object.defineProperty(input, "nonWitnessUtxo", {
          enumerable: true,
          get() {
            const buf = self2.__NON_WITNESS_UTXO_BUF_CACHE[selfIndex];
            const txCache = self2.__NON_WITNESS_UTXO_TX_CACHE[selfIndex];
            if (buf !== void 0) {
              return buf;
            } else {
              const newBuf = txCache.toBuffer();
              self2.__NON_WITNESS_UTXO_BUF_CACHE[selfIndex] = newBuf;
              return newBuf;
            }
          },
          set(data) {
            self2.__NON_WITNESS_UTXO_BUF_CACHE[selfIndex] = data;
          }
        });
      }
      function inputFinalizeGetAmts(inputs, tx, cache, mustFinalize) {
        let inputAmount = 0;
        inputs.forEach((input, idx) => {
          if (mustFinalize && input.finalScriptSig)
            tx.ins[idx].script = input.finalScriptSig;
          if (mustFinalize && input.finalScriptWitness) {
            tx.ins[idx].witness = scriptWitnessToWitnessStack(
              input.finalScriptWitness
            );
          }
          const prevout = getUtxoForInput(idx, input, cache);
          if (!prevout) throw new Error(`Need a Utxo input item for input #${idx}`);
          inputAmount += prevout.value;
        });
        const outputAmount = tx.outs.reduce((total, o) => total + o.value, 0);
        const fee = inputAmount - outputAmount;
        if (fee < 0) {
          throw new Error("Outputs are spending more than Inputs");
        }
        const bytes = tx.virtualSize();
        cache.__FEE = fee;
        cache.__EXTRACTED_TX = tx;
        cache.__FEE_RATE = Math.floor(fee / bytes);
      }
      function nonWitnessUtxoTxFromCache(cache, input, inputIndex) {
        const c = cache.__NON_WITNESS_UTXO_TX_CACHE;
        if (!c[inputIndex]) {
          addNonWitnessTxCache(cache, input, inputIndex);
        }
        return c[inputIndex];
      }
      function getUtxoForInput(inputIndex, input, cache) {
        if (input.nonWitnessUtxo) {
          const nonWitnessUtxoTx = nonWitnessUtxoTxFromCache(
            cache,
            input,
            inputIndex
          );
          const txInput = cache.__TX.ins[inputIndex];
          if (!txInput.hash.equals(nonWitnessUtxoTx.getHash())) {
            throw new Error(
              `Non-witness UTXO hash for input #${inputIndex} doesn't match the hash specified in the prevout`
            );
          }
          const prevout = nonWitnessUtxoTx.outs[txInput.index];
          if (!prevout) {
            throw new Error(
              `Non-witness UTXO for input #${inputIndex} has no output #${txInput.index}`
            );
          }
          if (input.witnessUtxo && (input.witnessUtxo.value !== prevout.value || !input.witnessUtxo.script.equals(prevout.script))) {
            throw new Error(
              `Witness UTXO for input #${inputIndex} doesn't match the non-witness UTXO`
            );
          }
          return prevout;
        }
        return input.witnessUtxo;
      }
      function getScriptFromUtxo(inputIndex, input, cache) {
        const { script } = getScriptAndAmountFromUtxo(inputIndex, input, cache);
        return script;
      }
      function getScriptAndAmountFromUtxo(inputIndex, input, cache) {
        const prevout = getUtxoForInput(inputIndex, input, cache);
        if (!prevout) throw new Error("Can't find pubkey in input without Utxo data");
        return prevout;
      }
      function pubkeyInInput(pubkey, input, inputIndex, cache) {
        const script = getScriptFromUtxo(inputIndex, input, cache);
        const { meaningfulScript } = getMeaningfulScript(
          script,
          inputIndex,
          "input",
          input.redeemScript,
          input.witnessScript
        );
        return (0, psbtutils_1.pubkeyInScript)(pubkey, meaningfulScript);
      }
      function pubkeyInOutput(pubkey, output, outputIndex, cache) {
        const script = cache.__TX.outs[outputIndex].script;
        const { meaningfulScript } = getMeaningfulScript(
          script,
          outputIndex,
          "output",
          output.redeemScript,
          output.witnessScript
        );
        return (0, psbtutils_1.pubkeyInScript)(pubkey, meaningfulScript);
      }
      function redeemFromFinalScriptSig(finalScript) {
        if (!finalScript) return;
        const decomp = bscript.decompile(finalScript);
        if (!decomp) return;
        const lastItem = decomp[decomp.length - 1];
        if (!Buffer2.isBuffer(lastItem) || isPubkeyLike(lastItem) || isSigLike(lastItem))
          return;
        const sDecomp = bscript.decompile(lastItem);
        if (!sDecomp) return;
        return lastItem;
      }
      function redeemFromFinalWitnessScript(finalScript) {
        if (!finalScript) return;
        const decomp = scriptWitnessToWitnessStack(finalScript);
        const lastItem = decomp[decomp.length - 1];
        if (isPubkeyLike(lastItem)) return;
        const sDecomp = bscript.decompile(lastItem);
        if (!sDecomp) return;
        return lastItem;
      }
      function compressPubkey(pubkey) {
        if (pubkey.length === 65) {
          const parity = pubkey[64] & 1;
          const newKey = pubkey.slice(0, 33);
          newKey[0] = 2 | parity;
          return newKey;
        }
        return pubkey.slice();
      }
      function isPubkeyLike(buf) {
        return buf.length === 33 && bscript.isCanonicalPubKey(buf);
      }
      function isSigLike(buf) {
        return bscript.isCanonicalScriptSignature(buf);
      }
      function getMeaningfulScript(script, index, ioType, redeemScript, witnessScript) {
        const isP2SH = (0, psbtutils_1.isP2SHScript)(script);
        const isP2SHP2WSH = isP2SH && redeemScript && (0, psbtutils_1.isP2WSHScript)(redeemScript);
        const isP2WSH = (0, psbtutils_1.isP2WSHScript)(script);
        if (isP2SH && redeemScript === void 0)
          throw new Error("scriptPubkey is P2SH but redeemScript missing");
        if ((isP2WSH || isP2SHP2WSH) && witnessScript === void 0)
          throw new Error(
            "scriptPubkey or redeemScript is P2WSH but witnessScript missing"
          );
        let meaningfulScript;
        if (isP2SHP2WSH) {
          meaningfulScript = witnessScript;
          checkRedeemScript(index, script, redeemScript, ioType);
          checkWitnessScript(index, redeemScript, witnessScript, ioType);
          checkInvalidP2WSH(meaningfulScript);
        } else if (isP2WSH) {
          meaningfulScript = witnessScript;
          checkWitnessScript(index, script, witnessScript, ioType);
          checkInvalidP2WSH(meaningfulScript);
        } else if (isP2SH) {
          meaningfulScript = redeemScript;
          checkRedeemScript(index, script, redeemScript, ioType);
        } else {
          meaningfulScript = script;
        }
        return {
          meaningfulScript,
          type: isP2SHP2WSH ? "p2sh-p2wsh" : isP2SH ? "p2sh" : isP2WSH ? "p2wsh" : "raw"
        };
      }
      function checkInvalidP2WSH(script) {
        if ((0, psbtutils_1.isP2WPKH)(script) || (0, psbtutils_1.isP2SHScript)(script)) {
          throw new Error("P2WPKH or P2SH can not be contained within P2WSH");
        }
      }
      function classifyScript(script) {
        if ((0, psbtutils_1.isP2WPKH)(script)) return "witnesspubkeyhash";
        if ((0, psbtutils_1.isP2PKH)(script)) return "pubkeyhash";
        if ((0, psbtutils_1.isP2MS)(script)) return "multisig";
        if ((0, psbtutils_1.isP2PK)(script)) return "pubkey";
        return "nonstandard";
      }
      function range(n) {
        return [...Array(n).keys()];
      }
    }
  });

  // node_modules/bitcoinjs-lib/src/index.js
  var require_src2 = __commonJS({
    "node_modules/bitcoinjs-lib/src/index.js"(exports7) {
      "use strict";
      init_dirname();
      init_buffer2();
      init_process2();
      Object.defineProperty(exports7, "__esModule", { value: true });
      exports7.initEccLib = exports7.Transaction = exports7.opcodes = exports7.Psbt = exports7.Block = exports7.script = exports7.payments = exports7.networks = exports7.crypto = exports7.address = void 0;
      var address = require_address();
      exports7.address = address;
      var crypto2 = require_crypto2();
      exports7.crypto = crypto2;
      var networks = require_networks();
      exports7.networks = networks;
      var payments = require_payments();
      exports7.payments = payments;
      var script = require_script();
      exports7.script = script;
      var block_1 = require_block();
      Object.defineProperty(exports7, "Block", {
        enumerable: true,
        get: function() {
          return block_1.Block;
        }
      });
      var psbt_1 = require_psbt2();
      Object.defineProperty(exports7, "Psbt", {
        enumerable: true,
        get: function() {
          return psbt_1.Psbt;
        }
      });
      var ops_1 = require_ops();
      Object.defineProperty(exports7, "opcodes", {
        enumerable: true,
        get: function() {
          return ops_1.OPS;
        }
      });
      var transaction_1 = require_transaction();
      Object.defineProperty(exports7, "Transaction", {
        enumerable: true,
        get: function() {
          return transaction_1.Transaction;
        }
      });
      var ecc_lib_1 = require_ecc_lib();
      Object.defineProperty(exports7, "initEccLib", {
        enumerable: true,
        get: function() {
          return ecc_lib_1.initEccLib;
        }
      });
    }
  });

  // ../beneficiary-discovery.worker.mjs
  init_dirname();
  init_buffer2();
  init_process2();

  // ../recovery-proof/public-discovery.mjs
  init_dirname();
  init_buffer2();
  init_process2();

  // node_modules/@jspm/core/nodelibs/browser/assert/strict.js
  init_dirname();
  init_buffer2();
  init_process2();

  // node_modules/@jspm/core/nodelibs/browser/assert.js
  init_dirname();
  init_buffer2();
  init_process2();

  // node_modules/@jspm/core/nodelibs/browser/util.js
  init_dirname();
  init_buffer2();
  init_process2();

  // node_modules/@jspm/core/nodelibs/browser/chunk-DtcTpLWz.js
  init_dirname();
  init_buffer2();
  init_process2();
  var exports$k = {};
  var _dewExec$k = false;
  function dew$k() {
    if (_dewExec$k) return exports$k;
    _dewExec$k = true;
    exports$k = function hasSymbols() {
      if (typeof Symbol !== "function" || typeof Object.getOwnPropertySymbols !== "function") {
        return false;
      }
      if (typeof Symbol.iterator === "symbol") {
        return true;
      }
      var obj = {};
      var sym = Symbol("test");
      var symObj = Object(sym);
      if (typeof sym === "string") {
        return false;
      }
      if (Object.prototype.toString.call(sym) !== "[object Symbol]") {
        return false;
      }
      if (Object.prototype.toString.call(symObj) !== "[object Symbol]") {
        return false;
      }
      var symVal = 42;
      obj[sym] = symVal;
      for (sym in obj) {
        return false;
      }
      if (typeof Object.keys === "function" && Object.keys(obj).length !== 0) {
        return false;
      }
      if (typeof Object.getOwnPropertyNames === "function" && Object.getOwnPropertyNames(obj).length !== 0) {
        return false;
      }
      var syms = Object.getOwnPropertySymbols(obj);
      if (syms.length !== 1 || syms[0] !== sym) {
        return false;
      }
      if (!Object.prototype.propertyIsEnumerable.call(obj, sym)) {
        return false;
      }
      if (typeof Object.getOwnPropertyDescriptor === "function") {
        var descriptor = Object.getOwnPropertyDescriptor(obj, sym);
        if (descriptor.value !== symVal || descriptor.enumerable !== true) {
          return false;
        }
      }
      return true;
    };
    return exports$k;
  }
  var exports$j = {};
  var _dewExec$j = false;
  function dew$j() {
    if (_dewExec$j) return exports$j;
    _dewExec$j = true;
    exports$j = Error;
    return exports$j;
  }
  var exports$i = {};
  var _dewExec$i = false;
  function dew$i() {
    if (_dewExec$i) return exports$i;
    _dewExec$i = true;
    exports$i = EvalError;
    return exports$i;
  }
  var exports$h = {};
  var _dewExec$h = false;
  function dew$h() {
    if (_dewExec$h) return exports$h;
    _dewExec$h = true;
    exports$h = RangeError;
    return exports$h;
  }
  var exports$g = {};
  var _dewExec$g = false;
  function dew$g() {
    if (_dewExec$g) return exports$g;
    _dewExec$g = true;
    exports$g = ReferenceError;
    return exports$g;
  }
  var exports$f = {};
  var _dewExec$f = false;
  function dew$f() {
    if (_dewExec$f) return exports$f;
    _dewExec$f = true;
    exports$f = SyntaxError;
    return exports$f;
  }
  var exports$e = {};
  var _dewExec$e = false;
  function dew$e() {
    if (_dewExec$e) return exports$e;
    _dewExec$e = true;
    exports$e = TypeError;
    return exports$e;
  }
  var exports$d = {};
  var _dewExec$d = false;
  function dew$d() {
    if (_dewExec$d) return exports$d;
    _dewExec$d = true;
    exports$d = URIError;
    return exports$d;
  }
  var exports$c = {};
  var _dewExec$c = false;
  function dew$c() {
    if (_dewExec$c) return exports$c;
    _dewExec$c = true;
    var origSymbol = typeof Symbol !== "undefined" && Symbol;
    var hasSymbolSham = dew$k();
    exports$c = function hasNativeSymbols() {
      if (typeof origSymbol !== "function") {
        return false;
      }
      if (typeof Symbol !== "function") {
        return false;
      }
      if (typeof origSymbol("foo") !== "symbol") {
        return false;
      }
      if (typeof Symbol("bar") !== "symbol") {
        return false;
      }
      return hasSymbolSham();
    };
    return exports$c;
  }
  var exports$b = {};
  var _dewExec$b = false;
  function dew$b() {
    if (_dewExec$b) return exports$b;
    _dewExec$b = true;
    var test = {
      __proto__: null,
      foo: {}
    };
    var $Object = Object;
    exports$b = function hasProto() {
      return {
        __proto__: test
      }.foo === test.foo && !(test instanceof $Object);
    };
    return exports$b;
  }
  var exports$a = {};
  var _dewExec$a = false;
  function dew$a() {
    if (_dewExec$a) return exports$a;
    _dewExec$a = true;
    var ERROR_MESSAGE = "Function.prototype.bind called on incompatible ";
    var toStr = Object.prototype.toString;
    var max = Math.max;
    var funcType = "[object Function]";
    var concatty = function concatty2(a, b) {
      var arr = [];
      for (var i = 0; i < a.length; i += 1) {
        arr[i] = a[i];
      }
      for (var j = 0; j < b.length; j += 1) {
        arr[j + a.length] = b[j];
      }
      return arr;
    };
    var slicy = function slicy2(arrLike, offset) {
      var arr = [];
      for (var i = offset, j = 0; i < arrLike.length; i += 1, j += 1) {
        arr[j] = arrLike[i];
      }
      return arr;
    };
    var joiny = function(arr, joiner) {
      var str = "";
      for (var i = 0; i < arr.length; i += 1) {
        str += arr[i];
        if (i + 1 < arr.length) {
          str += joiner;
        }
      }
      return str;
    };
    exports$a = function bind(that) {
      var target = this;
      if (typeof target !== "function" || toStr.apply(target) !== funcType) {
        throw new TypeError(ERROR_MESSAGE + target);
      }
      var args = slicy(arguments, 1);
      var bound;
      var binder = function() {
        if (this instanceof bound) {
          var result = target.apply(this, concatty(args, arguments));
          if (Object(result) === result) {
            return result;
          }
          return this;
        }
        return target.apply(that, concatty(args, arguments));
      };
      var boundLength = max(0, target.length - args.length);
      var boundArgs = [];
      for (var i = 0; i < boundLength; i++) {
        boundArgs[i] = "$" + i;
      }
      bound = Function("binder", "return function (" + joiny(boundArgs, ",") + "){ return binder.apply(this,arguments); }")(binder);
      if (target.prototype) {
        var Empty = function Empty2() {
        };
        Empty.prototype = target.prototype;
        bound.prototype = new Empty();
        Empty.prototype = null;
      }
      return bound;
    };
    return exports$a;
  }
  var exports$9 = {};
  var _dewExec$9 = false;
  function dew$9() {
    if (_dewExec$9) return exports$9;
    _dewExec$9 = true;
    var implementation = dew$a();
    exports$9 = Function.prototype.bind || implementation;
    return exports$9;
  }
  var exports$8 = {};
  var _dewExec$8 = false;
  function dew$8() {
    if (_dewExec$8) return exports$8;
    _dewExec$8 = true;
    var call = Function.prototype.call;
    var $hasOwn = Object.prototype.hasOwnProperty;
    var bind = dew$9();
    exports$8 = bind.call(call, $hasOwn);
    return exports$8;
  }
  var exports$7 = {};
  var _dewExec$7 = false;
  function dew$7() {
    if (_dewExec$7) return exports$7;
    _dewExec$7 = true;
    var undefined$1;
    var $Error = dew$j();
    var $EvalError = dew$i();
    var $RangeError = dew$h();
    var $ReferenceError = dew$g();
    var $SyntaxError = dew$f();
    var $TypeError = dew$e();
    var $URIError = dew$d();
    var $Function = Function;
    var getEvalledConstructor = function(expressionSyntax) {
      try {
        return $Function('"use strict"; return (' + expressionSyntax + ").constructor;")();
      } catch (e) {
      }
    };
    var $gOPD = Object.getOwnPropertyDescriptor;
    if ($gOPD) {
      try {
        $gOPD({}, "");
      } catch (e) {
        $gOPD = null;
      }
    }
    var throwTypeError = function() {
      throw new $TypeError();
    };
    var ThrowTypeError = $gOPD ? (function() {
      try {
        arguments.callee;
        return throwTypeError;
      } catch (calleeThrows) {
        try {
          return $gOPD(arguments, "callee").get;
        } catch (gOPDthrows) {
          return throwTypeError;
        }
      }
    })() : throwTypeError;
    var hasSymbols = dew$c()();
    var hasProto = dew$b()();
    var getProto = Object.getPrototypeOf || (hasProto ? function(x) {
      return x.__proto__;
    } : null);
    var needsEval = {};
    var TypedArray = typeof Uint8Array === "undefined" || !getProto ? undefined$1 : getProto(Uint8Array);
    var INTRINSICS = {
      __proto__: null,
      "%AggregateError%": typeof AggregateError === "undefined" ? undefined$1 : AggregateError,
      "%Array%": Array,
      "%ArrayBuffer%": typeof ArrayBuffer === "undefined" ? undefined$1 : ArrayBuffer,
      "%ArrayIteratorPrototype%": hasSymbols && getProto ? getProto([][Symbol.iterator]()) : undefined$1,
      "%AsyncFromSyncIteratorPrototype%": undefined$1,
      "%AsyncFunction%": needsEval,
      "%AsyncGenerator%": needsEval,
      "%AsyncGeneratorFunction%": needsEval,
      "%AsyncIteratorPrototype%": needsEval,
      "%Atomics%": typeof Atomics === "undefined" ? undefined$1 : Atomics,
      "%BigInt%": typeof BigInt === "undefined" ? undefined$1 : BigInt,
      "%BigInt64Array%": typeof BigInt64Array === "undefined" ? undefined$1 : BigInt64Array,
      "%BigUint64Array%": typeof BigUint64Array === "undefined" ? undefined$1 : BigUint64Array,
      "%Boolean%": Boolean,
      "%DataView%": typeof DataView === "undefined" ? undefined$1 : DataView,
      "%Date%": Date,
      "%decodeURI%": decodeURI,
      "%decodeURIComponent%": decodeURIComponent,
      "%encodeURI%": encodeURI,
      "%encodeURIComponent%": encodeURIComponent,
      "%Error%": $Error,
      "%eval%": eval,
      // eslint-disable-line no-eval
      "%EvalError%": $EvalError,
      "%Float32Array%": typeof Float32Array === "undefined" ? undefined$1 : Float32Array,
      "%Float64Array%": typeof Float64Array === "undefined" ? undefined$1 : Float64Array,
      "%FinalizationRegistry%": typeof FinalizationRegistry === "undefined" ? undefined$1 : FinalizationRegistry,
      "%Function%": $Function,
      "%GeneratorFunction%": needsEval,
      "%Int8Array%": typeof Int8Array === "undefined" ? undefined$1 : Int8Array,
      "%Int16Array%": typeof Int16Array === "undefined" ? undefined$1 : Int16Array,
      "%Int32Array%": typeof Int32Array === "undefined" ? undefined$1 : Int32Array,
      "%isFinite%": isFinite,
      "%isNaN%": isNaN,
      "%IteratorPrototype%": hasSymbols && getProto ? getProto(getProto([][Symbol.iterator]())) : undefined$1,
      "%JSON%": typeof JSON === "object" ? JSON : undefined$1,
      "%Map%": typeof Map === "undefined" ? undefined$1 : Map,
      "%MapIteratorPrototype%": typeof Map === "undefined" || !hasSymbols || !getProto ? undefined$1 : getProto((/* @__PURE__ */ new Map())[Symbol.iterator]()),
      "%Math%": Math,
      "%Number%": Number,
      "%Object%": Object,
      "%parseFloat%": parseFloat,
      "%parseInt%": parseInt,
      "%Promise%": typeof Promise === "undefined" ? undefined$1 : Promise,
      "%Proxy%": typeof Proxy === "undefined" ? undefined$1 : Proxy,
      "%RangeError%": $RangeError,
      "%ReferenceError%": $ReferenceError,
      "%Reflect%": typeof Reflect === "undefined" ? undefined$1 : Reflect,
      "%RegExp%": RegExp,
      "%Set%": typeof Set === "undefined" ? undefined$1 : Set,
      "%SetIteratorPrototype%": typeof Set === "undefined" || !hasSymbols || !getProto ? undefined$1 : getProto((/* @__PURE__ */ new Set())[Symbol.iterator]()),
      "%SharedArrayBuffer%": typeof SharedArrayBuffer === "undefined" ? undefined$1 : SharedArrayBuffer,
      "%String%": String,
      "%StringIteratorPrototype%": hasSymbols && getProto ? getProto(""[Symbol.iterator]()) : undefined$1,
      "%Symbol%": hasSymbols ? Symbol : undefined$1,
      "%SyntaxError%": $SyntaxError,
      "%ThrowTypeError%": ThrowTypeError,
      "%TypedArray%": TypedArray,
      "%TypeError%": $TypeError,
      "%Uint8Array%": typeof Uint8Array === "undefined" ? undefined$1 : Uint8Array,
      "%Uint8ClampedArray%": typeof Uint8ClampedArray === "undefined" ? undefined$1 : Uint8ClampedArray,
      "%Uint16Array%": typeof Uint16Array === "undefined" ? undefined$1 : Uint16Array,
      "%Uint32Array%": typeof Uint32Array === "undefined" ? undefined$1 : Uint32Array,
      "%URIError%": $URIError,
      "%WeakMap%": typeof WeakMap === "undefined" ? undefined$1 : WeakMap,
      "%WeakRef%": typeof WeakRef === "undefined" ? undefined$1 : WeakRef,
      "%WeakSet%": typeof WeakSet === "undefined" ? undefined$1 : WeakSet
    };
    if (getProto) {
      try {
        null.error;
      } catch (e) {
        var errorProto = getProto(getProto(e));
        INTRINSICS["%Error.prototype%"] = errorProto;
      }
    }
    var doEval = function doEval2(name) {
      var value;
      if (name === "%AsyncFunction%") {
        value = getEvalledConstructor("async function () {}");
      } else if (name === "%GeneratorFunction%") {
        value = getEvalledConstructor("function* () {}");
      } else if (name === "%AsyncGeneratorFunction%") {
        value = getEvalledConstructor("async function* () {}");
      } else if (name === "%AsyncGenerator%") {
        var fn = doEval2("%AsyncGeneratorFunction%");
        if (fn) {
          value = fn.prototype;
        }
      } else if (name === "%AsyncIteratorPrototype%") {
        var gen = doEval2("%AsyncGenerator%");
        if (gen && getProto) {
          value = getProto(gen.prototype);
        }
      }
      INTRINSICS[name] = value;
      return value;
    };
    var LEGACY_ALIASES = {
      __proto__: null,
      "%ArrayBufferPrototype%": ["ArrayBuffer", "prototype"],
      "%ArrayPrototype%": ["Array", "prototype"],
      "%ArrayProto_entries%": ["Array", "prototype", "entries"],
      "%ArrayProto_forEach%": ["Array", "prototype", "forEach"],
      "%ArrayProto_keys%": ["Array", "prototype", "keys"],
      "%ArrayProto_values%": ["Array", "prototype", "values"],
      "%AsyncFunctionPrototype%": ["AsyncFunction", "prototype"],
      "%AsyncGenerator%": ["AsyncGeneratorFunction", "prototype"],
      "%AsyncGeneratorPrototype%": ["AsyncGeneratorFunction", "prototype", "prototype"],
      "%BooleanPrototype%": ["Boolean", "prototype"],
      "%DataViewPrototype%": ["DataView", "prototype"],
      "%DatePrototype%": ["Date", "prototype"],
      "%ErrorPrototype%": ["Error", "prototype"],
      "%EvalErrorPrototype%": ["EvalError", "prototype"],
      "%Float32ArrayPrototype%": ["Float32Array", "prototype"],
      "%Float64ArrayPrototype%": ["Float64Array", "prototype"],
      "%FunctionPrototype%": ["Function", "prototype"],
      "%Generator%": ["GeneratorFunction", "prototype"],
      "%GeneratorPrototype%": ["GeneratorFunction", "prototype", "prototype"],
      "%Int8ArrayPrototype%": ["Int8Array", "prototype"],
      "%Int16ArrayPrototype%": ["Int16Array", "prototype"],
      "%Int32ArrayPrototype%": ["Int32Array", "prototype"],
      "%JSONParse%": ["JSON", "parse"],
      "%JSONStringify%": ["JSON", "stringify"],
      "%MapPrototype%": ["Map", "prototype"],
      "%NumberPrototype%": ["Number", "prototype"],
      "%ObjectPrototype%": ["Object", "prototype"],
      "%ObjProto_toString%": ["Object", "prototype", "toString"],
      "%ObjProto_valueOf%": ["Object", "prototype", "valueOf"],
      "%PromisePrototype%": ["Promise", "prototype"],
      "%PromiseProto_then%": ["Promise", "prototype", "then"],
      "%Promise_all%": ["Promise", "all"],
      "%Promise_reject%": ["Promise", "reject"],
      "%Promise_resolve%": ["Promise", "resolve"],
      "%RangeErrorPrototype%": ["RangeError", "prototype"],
      "%ReferenceErrorPrototype%": ["ReferenceError", "prototype"],
      "%RegExpPrototype%": ["RegExp", "prototype"],
      "%SetPrototype%": ["Set", "prototype"],
      "%SharedArrayBufferPrototype%": ["SharedArrayBuffer", "prototype"],
      "%StringPrototype%": ["String", "prototype"],
      "%SymbolPrototype%": ["Symbol", "prototype"],
      "%SyntaxErrorPrototype%": ["SyntaxError", "prototype"],
      "%TypedArrayPrototype%": ["TypedArray", "prototype"],
      "%TypeErrorPrototype%": ["TypeError", "prototype"],
      "%Uint8ArrayPrototype%": ["Uint8Array", "prototype"],
      "%Uint8ClampedArrayPrototype%": ["Uint8ClampedArray", "prototype"],
      "%Uint16ArrayPrototype%": ["Uint16Array", "prototype"],
      "%Uint32ArrayPrototype%": ["Uint32Array", "prototype"],
      "%URIErrorPrototype%": ["URIError", "prototype"],
      "%WeakMapPrototype%": ["WeakMap", "prototype"],
      "%WeakSetPrototype%": ["WeakSet", "prototype"]
    };
    var bind = dew$9();
    var hasOwn = dew$8();
    var $concat = bind.call(Function.call, Array.prototype.concat);
    var $spliceApply = bind.call(Function.apply, Array.prototype.splice);
    var $replace = bind.call(Function.call, String.prototype.replace);
    var $strSlice = bind.call(Function.call, String.prototype.slice);
    var $exec = bind.call(Function.call, RegExp.prototype.exec);
    var rePropName = /[^%.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|%$))/g;
    var reEscapeChar = /\\(\\)?/g;
    var stringToPath = function stringToPath2(string) {
      var first = $strSlice(string, 0, 1);
      var last = $strSlice(string, -1);
      if (first === "%" && last !== "%") {
        throw new $SyntaxError("invalid intrinsic syntax, expected closing `%`");
      } else if (last === "%" && first !== "%") {
        throw new $SyntaxError("invalid intrinsic syntax, expected opening `%`");
      }
      var result = [];
      $replace(string, rePropName, function(match2, number, quote, subString) {
        result[result.length] = quote ? $replace(subString, reEscapeChar, "$1") : number || match2;
      });
      return result;
    };
    var getBaseIntrinsic = function getBaseIntrinsic2(name, allowMissing) {
      var intrinsicName = name;
      var alias;
      if (hasOwn(LEGACY_ALIASES, intrinsicName)) {
        alias = LEGACY_ALIASES[intrinsicName];
        intrinsicName = "%" + alias[0] + "%";
      }
      if (hasOwn(INTRINSICS, intrinsicName)) {
        var value = INTRINSICS[intrinsicName];
        if (value === needsEval) {
          value = doEval(intrinsicName);
        }
        if (typeof value === "undefined" && !allowMissing) {
          throw new $TypeError("intrinsic " + name + " exists, but is not available. Please file an issue!");
        }
        return {
          alias,
          name: intrinsicName,
          value
        };
      }
      throw new $SyntaxError("intrinsic " + name + " does not exist!");
    };
    exports$7 = function GetIntrinsic(name, allowMissing) {
      if (typeof name !== "string" || name.length === 0) {
        throw new $TypeError("intrinsic name must be a non-empty string");
      }
      if (arguments.length > 1 && typeof allowMissing !== "boolean") {
        throw new $TypeError('"allowMissing" argument must be a boolean');
      }
      if ($exec(/^%?[^%]*%?$/, name) === null) {
        throw new $SyntaxError("`%` may not be present anywhere but at the beginning and end of the intrinsic name");
      }
      var parts = stringToPath(name);
      var intrinsicBaseName = parts.length > 0 ? parts[0] : "";
      var intrinsic = getBaseIntrinsic("%" + intrinsicBaseName + "%", allowMissing);
      var intrinsicRealName = intrinsic.name;
      var value = intrinsic.value;
      var skipFurtherCaching = false;
      var alias = intrinsic.alias;
      if (alias) {
        intrinsicBaseName = alias[0];
        $spliceApply(parts, $concat([0, 1], alias));
      }
      for (var i = 1, isOwn = true; i < parts.length; i += 1) {
        var part = parts[i];
        var first = $strSlice(part, 0, 1);
        var last = $strSlice(part, -1);
        if ((first === '"' || first === "'" || first === "`" || last === '"' || last === "'" || last === "`") && first !== last) {
          throw new $SyntaxError("property names with quotes must have matching quotes");
        }
        if (part === "constructor" || !isOwn) {
          skipFurtherCaching = true;
        }
        intrinsicBaseName += "." + part;
        intrinsicRealName = "%" + intrinsicBaseName + "%";
        if (hasOwn(INTRINSICS, intrinsicRealName)) {
          value = INTRINSICS[intrinsicRealName];
        } else if (value != null) {
          if (!(part in value)) {
            if (!allowMissing) {
              throw new $TypeError("base intrinsic for " + name + " exists, but the property is not available.");
            }
            return void undefined$1;
          }
          if ($gOPD && i + 1 >= parts.length) {
            var desc = $gOPD(value, part);
            isOwn = !!desc;
            if (isOwn && "get" in desc && !("originalValue" in desc.get)) {
              value = desc.get;
            } else {
              value = value[part];
            }
          } else {
            isOwn = hasOwn(value, part);
            value = value[part];
          }
          if (isOwn && !skipFurtherCaching) {
            INTRINSICS[intrinsicRealName] = value;
          }
        }
      }
      return value;
    };
    return exports$7;
  }
  var exports$6 = {};
  var _dewExec$6 = false;
  function dew$6() {
    if (_dewExec$6) return exports$6;
    _dewExec$6 = true;
    var GetIntrinsic = dew$7();
    var $defineProperty = GetIntrinsic("%Object.defineProperty%", true) || false;
    if ($defineProperty) {
      try {
        $defineProperty({}, "a", {
          value: 1
        });
      } catch (e) {
        $defineProperty = false;
      }
    }
    exports$6 = $defineProperty;
    return exports$6;
  }
  var exports$5 = {};
  var _dewExec$5 = false;
  function dew$5() {
    if (_dewExec$5) return exports$5;
    _dewExec$5 = true;
    var GetIntrinsic = dew$7();
    var $gOPD = GetIntrinsic("%Object.getOwnPropertyDescriptor%", true);
    if ($gOPD) {
      try {
        $gOPD([], "length");
      } catch (e) {
        $gOPD = null;
      }
    }
    exports$5 = $gOPD;
    return exports$5;
  }
  var exports$4 = {};
  var _dewExec$4 = false;
  function dew$4() {
    if (_dewExec$4) return exports$4;
    _dewExec$4 = true;
    var $defineProperty = dew$6();
    var $SyntaxError = dew$f();
    var $TypeError = dew$e();
    var gopd = dew$5();
    exports$4 = function defineDataProperty(obj, property, value) {
      if (!obj || typeof obj !== "object" && typeof obj !== "function") {
        throw new $TypeError("`obj` must be an object or a function`");
      }
      if (typeof property !== "string" && typeof property !== "symbol") {
        throw new $TypeError("`property` must be a string or a symbol`");
      }
      if (arguments.length > 3 && typeof arguments[3] !== "boolean" && arguments[3] !== null) {
        throw new $TypeError("`nonEnumerable`, if provided, must be a boolean or null");
      }
      if (arguments.length > 4 && typeof arguments[4] !== "boolean" && arguments[4] !== null) {
        throw new $TypeError("`nonWritable`, if provided, must be a boolean or null");
      }
      if (arguments.length > 5 && typeof arguments[5] !== "boolean" && arguments[5] !== null) {
        throw new $TypeError("`nonConfigurable`, if provided, must be a boolean or null");
      }
      if (arguments.length > 6 && typeof arguments[6] !== "boolean") {
        throw new $TypeError("`loose`, if provided, must be a boolean");
      }
      var nonEnumerable = arguments.length > 3 ? arguments[3] : null;
      var nonWritable = arguments.length > 4 ? arguments[4] : null;
      var nonConfigurable = arguments.length > 5 ? arguments[5] : null;
      var loose = arguments.length > 6 ? arguments[6] : false;
      var desc = !!gopd && gopd(obj, property);
      if ($defineProperty) {
        $defineProperty(obj, property, {
          configurable: nonConfigurable === null && desc ? desc.configurable : !nonConfigurable,
          enumerable: nonEnumerable === null && desc ? desc.enumerable : !nonEnumerable,
          value,
          writable: nonWritable === null && desc ? desc.writable : !nonWritable
        });
      } else if (loose || !nonEnumerable && !nonWritable && !nonConfigurable) {
        obj[property] = value;
      } else {
        throw new $SyntaxError("This environment does not support defining a property as non-configurable, non-writable, or non-enumerable.");
      }
    };
    return exports$4;
  }
  var exports$3 = {};
  var _dewExec$3 = false;
  function dew$3() {
    if (_dewExec$3) return exports$3;
    _dewExec$3 = true;
    var $defineProperty = dew$6();
    var hasPropertyDescriptors = function hasPropertyDescriptors2() {
      return !!$defineProperty;
    };
    hasPropertyDescriptors.hasArrayLengthDefineBug = function hasArrayLengthDefineBug() {
      if (!$defineProperty) {
        return null;
      }
      try {
        return $defineProperty([], "length", {
          value: 1
        }).length !== 1;
      } catch (e) {
        return true;
      }
    };
    exports$3 = hasPropertyDescriptors;
    return exports$3;
  }
  var exports$22 = {};
  var _dewExec$22 = false;
  function dew$22() {
    if (_dewExec$22) return exports$22;
    _dewExec$22 = true;
    var GetIntrinsic = dew$7();
    var define = dew$4();
    var hasDescriptors = dew$3()();
    var gOPD = dew$5();
    var $TypeError = dew$e();
    var $floor = GetIntrinsic("%Math.floor%");
    exports$22 = function setFunctionLength(fn, length) {
      if (typeof fn !== "function") {
        throw new $TypeError("`fn` is not a function");
      }
      if (typeof length !== "number" || length < 0 || length > 4294967295 || $floor(length) !== length) {
        throw new $TypeError("`length` must be a positive 32-bit integer");
      }
      var loose = arguments.length > 2 && !!arguments[2];
      var functionLengthIsConfigurable = true;
      var functionLengthIsWritable = true;
      if ("length" in fn && gOPD) {
        var desc = gOPD(fn, "length");
        if (desc && !desc.configurable) {
          functionLengthIsConfigurable = false;
        }
        if (desc && !desc.writable) {
          functionLengthIsWritable = false;
        }
      }
      if (functionLengthIsConfigurable || functionLengthIsWritable || !loose) {
        if (hasDescriptors) {
          define(
            /** @type {Parameters<define>[0]} */
            fn,
            "length",
            length,
            true,
            true
          );
        } else {
          define(
            /** @type {Parameters<define>[0]} */
            fn,
            "length",
            length
          );
        }
      }
      return fn;
    };
    return exports$22;
  }
  var exports$12 = {};
  var _dewExec$12 = false;
  function dew$12() {
    if (_dewExec$12) return exports$12;
    _dewExec$12 = true;
    var bind = dew$9();
    var GetIntrinsic = dew$7();
    var setFunctionLength = dew$22();
    var $TypeError = dew$e();
    var $apply = GetIntrinsic("%Function.prototype.apply%");
    var $call = GetIntrinsic("%Function.prototype.call%");
    var $reflectApply = GetIntrinsic("%Reflect.apply%", true) || bind.call($call, $apply);
    var $defineProperty = dew$6();
    var $max = GetIntrinsic("%Math.max%");
    exports$12 = function callBind(originalFunction) {
      if (typeof originalFunction !== "function") {
        throw new $TypeError("a function is required");
      }
      var func = $reflectApply(bind, $call, arguments);
      return setFunctionLength(func, 1 + $max(0, originalFunction.length - (arguments.length - 1)), true);
    };
    var applyBind = function applyBind2() {
      return $reflectApply(bind, $apply, arguments);
    };
    if ($defineProperty) {
      $defineProperty(exports$12, "apply", {
        value: applyBind
      });
    } else {
      exports$12.apply = applyBind;
    }
    return exports$12;
  }
  var exports3 = {};
  var _dewExec2 = false;
  function dew2() {
    if (_dewExec2) return exports3;
    _dewExec2 = true;
    var GetIntrinsic = dew$7();
    var callBind = dew$12();
    var $indexOf = callBind(GetIntrinsic("String.prototype.indexOf"));
    exports3 = function callBoundIntrinsic(name, allowMissing) {
      var intrinsic = GetIntrinsic(name, !!allowMissing);
      if (typeof intrinsic === "function" && $indexOf(name, ".prototype.") > -1) {
        return callBind(intrinsic);
      }
      return intrinsic;
    };
    return exports3;
  }

  // node_modules/@jspm/core/nodelibs/browser/chunk-CkFCi-G1.js
  init_dirname();
  init_buffer2();
  init_process2();
  var exports4 = {};
  var _dewExec3 = false;
  function dew3() {
    if (_dewExec3) return exports4;
    _dewExec3 = true;
    if (typeof Object.create === "function") {
      exports4 = function inherits2(ctor, superCtor) {
        if (superCtor) {
          ctor.super_ = superCtor;
          ctor.prototype = Object.create(superCtor.prototype, {
            constructor: {
              value: ctor,
              enumerable: false,
              writable: true,
              configurable: true
            }
          });
        }
      };
    } else {
      exports4 = function inherits2(ctor, superCtor) {
        if (superCtor) {
          ctor.super_ = superCtor;
          var TempCtor = function() {
          };
          TempCtor.prototype = superCtor.prototype;
          ctor.prototype = new TempCtor();
          ctor.prototype.constructor = ctor;
        }
      };
    }
    return exports4;
  }

  // node_modules/@jspm/core/nodelibs/browser/chunk-DEMDiNwt.js
  init_dirname();
  init_buffer2();
  init_process2();
  function unimplemented(name) {
    throw new Error("Node.js process " + name + " is not supported by JSPM core outside of Node.js");
  }
  var queue = [];
  var draining = false;
  var currentQueue;
  var queueIndex = -1;
  function cleanUpNextTick() {
    if (!draining || !currentQueue)
      return;
    draining = false;
    if (currentQueue.length) {
      queue = currentQueue.concat(queue);
    } else {
      queueIndex = -1;
    }
    if (queue.length)
      drainQueue();
  }
  function drainQueue() {
    if (draining)
      return;
    var timeout = setTimeout(cleanUpNextTick, 0);
    draining = true;
    var len = queue.length;
    while (len) {
      currentQueue = queue;
      queue = [];
      while (++queueIndex < len) {
        if (currentQueue)
          currentQueue[queueIndex].run();
      }
      queueIndex = -1;
      len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
  }
  function nextTick(fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
      for (var i = 1; i < arguments.length; i++)
        args[i - 1] = arguments[i];
    }
    queue.push(new Item2(fun, args));
    if (queue.length === 1 && !draining)
      setTimeout(drainQueue, 0);
  }
  function Item2(fun, array) {
    this.fun = fun;
    this.array = array;
  }
  Item2.prototype.run = function() {
    this.fun.apply(null, this.array);
  };
  var title = "browser";
  var arch = "x64";
  var platform = "browser";
  var env2 = {
    PATH: "/usr/bin",
    LANG: navigator.language + ".UTF-8",
    PWD: "/",
    HOME: "/home",
    TMP: "/tmp"
  };
  var argv = ["/usr/bin/node"];
  var execArgv = [];
  var version = "v16.8.0";
  var versions = {};
  var emitWarning = function(message, type) {
    console.warn((type ? type + ": " : "") + message);
  };
  var binding = function(name) {
    unimplemented("binding");
  };
  var umask = function(mask) {
    return 0;
  };
  var cwd = function() {
    return "/";
  };
  var chdir = function(dir) {
  };
  var release = {
    name: "node",
    sourceUrl: "",
    headersUrl: "",
    libUrl: ""
  };
  function noop() {
  }
  var _rawDebug = noop;
  var moduleLoadList = [];
  function _linkedBinding(name) {
    unimplemented("_linkedBinding");
  }
  var domain = {};
  var _exiting = false;
  var config = {};
  function dlopen(name) {
    unimplemented("dlopen");
  }
  function _getActiveRequests() {
    return [];
  }
  function _getActiveHandles() {
    return [];
  }
  var reallyExit = noop;
  var _kill = noop;
  var cpuUsage = function() {
    return {};
  };
  var resourceUsage = cpuUsage;
  var memoryUsage = cpuUsage;
  var kill = noop;
  var exit = noop;
  var openStdin = noop;
  var allowedNodeEnvironmentFlags = {};
  function assert(condition, message) {
    if (!condition) throw new Error(message || "assertion error");
  }
  var features = {
    inspector: false,
    debug: false,
    uv: false,
    ipv6: false,
    tls_alpn: false,
    tls_sni: false,
    tls_ocsp: false,
    tls: false,
    cached_builtins: true
  };
  var _fatalExceptions = noop;
  var setUncaughtExceptionCaptureCallback = noop;
  function hasUncaughtExceptionCaptureCallback() {
    return false;
  }
  var _tickCallback = noop;
  var _debugProcess = noop;
  var _debugEnd = noop;
  var _startProfilerIdleNotifier = noop;
  var _stopProfilerIdleNotifier = noop;
  var stdout = void 0;
  var stderr = void 0;
  var stdin = void 0;
  var abort = noop;
  var pid = 2;
  var ppid = 1;
  var execPath = "/bin/usr/node";
  var debugPort = 9229;
  var argv0 = "node";
  var _preload_modules = [];
  var setSourceMapsEnabled = noop;
  var _performance2 = {
    now: typeof performance !== "undefined" ? performance.now.bind(performance) : void 0,
    timing: typeof performance !== "undefined" ? performance.timing : void 0
  };
  if (_performance2.now === void 0) {
    nowOffset = Date.now();
    if (_performance2.timing && _performance2.timing.navigationStart) {
      nowOffset = _performance2.timing.navigationStart;
    }
    _performance2.now = () => Date.now() - nowOffset;
  }
  var nowOffset;
  function uptime() {
    return _performance2.now() / 1e3;
  }
  var nanoPerSec2 = 1e9;
  function hrtime2(previousTimestamp) {
    var baseNow = Math.floor((Date.now() - _performance2.now()) * 1e-3);
    var clocktime = _performance2.now() * 1e-3;
    var seconds = Math.floor(clocktime) + baseNow;
    var nanoseconds = Math.floor(clocktime % 1 * 1e9);
    if (previousTimestamp) {
      seconds = seconds - previousTimestamp[0];
      nanoseconds = nanoseconds - previousTimestamp[1];
      if (nanoseconds < 0) {
        seconds--;
        nanoseconds += nanoPerSec2;
      }
    }
    return [seconds, nanoseconds];
  }
  hrtime2.bigint = function(time) {
    var diff = hrtime2(time);
    if (typeof BigInt === "undefined") {
      return diff[0] * nanoPerSec2 + diff[1];
    }
    return BigInt(diff[0] * nanoPerSec2) + BigInt(diff[1]);
  };
  var _maxListeners = 10;
  var _events = {};
  var _eventsCount = 0;
  function on() {
    return process;
  }
  var addListener = on;
  var once = on;
  var off = on;
  var removeListener = on;
  var removeAllListeners = on;
  var emit = noop;
  var prependListener = on;
  var prependOnceListener = on;
  function listeners(name) {
    return [];
  }
  var process = {
    version,
    versions,
    arch,
    platform,
    release,
    _rawDebug,
    moduleLoadList,
    binding,
    _linkedBinding,
    _events,
    _eventsCount,
    _maxListeners,
    on,
    addListener,
    once,
    off,
    removeListener,
    removeAllListeners,
    emit,
    prependListener,
    prependOnceListener,
    listeners,
    domain,
    _exiting,
    config,
    dlopen,
    uptime,
    _getActiveRequests,
    _getActiveHandles,
    reallyExit,
    _kill,
    cpuUsage,
    resourceUsage,
    memoryUsage,
    kill,
    exit,
    openStdin,
    allowedNodeEnvironmentFlags,
    assert,
    features,
    _fatalExceptions,
    setUncaughtExceptionCaptureCallback,
    hasUncaughtExceptionCaptureCallback,
    emitWarning,
    nextTick,
    _tickCallback,
    _debugProcess,
    _debugEnd,
    _startProfilerIdleNotifier,
    _stopProfilerIdleNotifier,
    stdout,
    stdin,
    stderr,
    abort,
    umask,
    chdir,
    cwd,
    env: env2,
    title,
    argv,
    execArgv,
    pid,
    ppid,
    execPath,
    debugPort,
    hrtime: hrtime2,
    argv0,
    _preload_modules,
    setSourceMapsEnabled
  };

  // node_modules/@jspm/core/nodelibs/browser/util.js
  var exports$c2 = {};
  var _dewExec$b2 = false;
  function dew$b2() {
    if (_dewExec$b2) return exports$c2;
    _dewExec$b2 = true;
    var hasSymbols = dew$k();
    exports$c2 = function hasToStringTagShams() {
      return hasSymbols() && !!Symbol.toStringTag;
    };
    return exports$c2;
  }
  var exports$b2 = {};
  var _dewExec$a2 = false;
  function dew$a2() {
    if (_dewExec$a2) return exports$b2;
    _dewExec$a2 = true;
    var hasToStringTag = dew$b2()();
    var callBound = dew2();
    var $toString = callBound("Object.prototype.toString");
    var isStandardArguments = function isArguments(value) {
      if (hasToStringTag && value && typeof value === "object" && Symbol.toStringTag in value) {
        return false;
      }
      return $toString(value) === "[object Arguments]";
    };
    var isLegacyArguments = function isArguments(value) {
      if (isStandardArguments(value)) {
        return true;
      }
      return value !== null && typeof value === "object" && typeof value.length === "number" && value.length >= 0 && $toString(value) !== "[object Array]" && $toString(value.callee) === "[object Function]";
    };
    var supportsStandardArguments = (function() {
      return isStandardArguments(arguments);
    })();
    isStandardArguments.isLegacyArguments = isLegacyArguments;
    exports$b2 = supportsStandardArguments ? isStandardArguments : isLegacyArguments;
    return exports$b2;
  }
  var exports$a2 = {};
  var _dewExec$92 = false;
  function dew$92() {
    if (_dewExec$92) return exports$a2;
    _dewExec$92 = true;
    var toStr = Object.prototype.toString;
    var fnToStr = Function.prototype.toString;
    var isFnRegex = /^\s*(?:function)?\*/;
    var hasToStringTag = dew$b2()();
    var getProto = Object.getPrototypeOf;
    var getGeneratorFunc = function() {
      if (!hasToStringTag) {
        return false;
      }
      try {
        return Function("return function*() {}")();
      } catch (e) {
      }
    };
    var GeneratorFunction;
    exports$a2 = function isGeneratorFunction(fn) {
      if (typeof fn !== "function") {
        return false;
      }
      if (isFnRegex.test(fnToStr.call(fn))) {
        return true;
      }
      if (!hasToStringTag) {
        var str = toStr.call(fn);
        return str === "[object GeneratorFunction]";
      }
      if (!getProto) {
        return false;
      }
      if (typeof GeneratorFunction === "undefined") {
        var generatorFunc = getGeneratorFunc();
        GeneratorFunction = generatorFunc ? getProto(generatorFunc) : false;
      }
      return getProto(fn) === GeneratorFunction;
    };
    return exports$a2;
  }
  var exports$92 = {};
  var _dewExec$82 = false;
  function dew$82() {
    if (_dewExec$82) return exports$92;
    _dewExec$82 = true;
    var fnToStr = Function.prototype.toString;
    var reflectApply = typeof Reflect === "object" && Reflect !== null && Reflect.apply;
    var badArrayLike;
    var isCallableMarker;
    if (typeof reflectApply === "function" && typeof Object.defineProperty === "function") {
      try {
        badArrayLike = Object.defineProperty({}, "length", {
          get: function() {
            throw isCallableMarker;
          }
        });
        isCallableMarker = {};
        reflectApply(function() {
          throw 42;
        }, null, badArrayLike);
      } catch (_) {
        if (_ !== isCallableMarker) {
          reflectApply = null;
        }
      }
    } else {
      reflectApply = null;
    }
    var constructorRegex = /^\s*class\b/;
    var isES6ClassFn = function isES6ClassFunction(value) {
      try {
        var fnStr = fnToStr.call(value);
        return constructorRegex.test(fnStr);
      } catch (e) {
        return false;
      }
    };
    var tryFunctionObject = function tryFunctionToStr(value) {
      try {
        if (isES6ClassFn(value)) {
          return false;
        }
        fnToStr.call(value);
        return true;
      } catch (e) {
        return false;
      }
    };
    var toStr = Object.prototype.toString;
    var objectClass = "[object Object]";
    var fnClass = "[object Function]";
    var genClass = "[object GeneratorFunction]";
    var ddaClass = "[object HTMLAllCollection]";
    var ddaClass2 = "[object HTML document.all class]";
    var ddaClass3 = "[object HTMLCollection]";
    var hasToStringTag = typeof Symbol === "function" && !!Symbol.toStringTag;
    var isIE68 = !(0 in [,]);
    var isDDA = function isDocumentDotAll() {
      return false;
    };
    if (typeof document === "object") {
      var all = document.all;
      if (toStr.call(all) === toStr.call(document.all)) {
        isDDA = function isDocumentDotAll(value) {
          if ((isIE68 || !value) && (typeof value === "undefined" || typeof value === "object")) {
            try {
              var str = toStr.call(value);
              return (str === ddaClass || str === ddaClass2 || str === ddaClass3 || str === objectClass) && value("") == null;
            } catch (e) {
            }
          }
          return false;
        };
      }
    }
    exports$92 = reflectApply ? function isCallable(value) {
      if (isDDA(value)) {
        return true;
      }
      if (!value) {
        return false;
      }
      if (typeof value !== "function" && typeof value !== "object") {
        return false;
      }
      try {
        reflectApply(value, null, badArrayLike);
      } catch (e) {
        if (e !== isCallableMarker) {
          return false;
        }
      }
      return !isES6ClassFn(value) && tryFunctionObject(value);
    } : function isCallable(value) {
      if (isDDA(value)) {
        return true;
      }
      if (!value) {
        return false;
      }
      if (typeof value !== "function" && typeof value !== "object") {
        return false;
      }
      if (hasToStringTag) {
        return tryFunctionObject(value);
      }
      if (isES6ClassFn(value)) {
        return false;
      }
      var strClass = toStr.call(value);
      if (strClass !== fnClass && strClass !== genClass && !/^\[object HTML/.test(strClass)) {
        return false;
      }
      return tryFunctionObject(value);
    };
    return exports$92;
  }
  var exports$82 = {};
  var _dewExec$72 = false;
  function dew$72() {
    if (_dewExec$72) return exports$82;
    _dewExec$72 = true;
    var isCallable = dew$82();
    var toStr = Object.prototype.toString;
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    var forEachArray = function forEachArray2(array, iterator, receiver) {
      for (var i = 0, len = array.length; i < len; i++) {
        if (hasOwnProperty.call(array, i)) {
          if (receiver == null) {
            iterator(array[i], i, array);
          } else {
            iterator.call(receiver, array[i], i, array);
          }
        }
      }
    };
    var forEachString = function forEachString2(string, iterator, receiver) {
      for (var i = 0, len = string.length; i < len; i++) {
        if (receiver == null) {
          iterator(string.charAt(i), i, string);
        } else {
          iterator.call(receiver, string.charAt(i), i, string);
        }
      }
    };
    var forEachObject = function forEachObject2(object, iterator, receiver) {
      for (var k in object) {
        if (hasOwnProperty.call(object, k)) {
          if (receiver == null) {
            iterator(object[k], k, object);
          } else {
            iterator.call(receiver, object[k], k, object);
          }
        }
      }
    };
    var forEach = function forEach2(list, iterator, thisArg) {
      if (!isCallable(iterator)) {
        throw new TypeError("iterator must be a function");
      }
      var receiver;
      if (arguments.length >= 3) {
        receiver = thisArg;
      }
      if (toStr.call(list) === "[object Array]") {
        forEachArray(list, iterator, receiver);
      } else if (typeof list === "string") {
        forEachString(list, iterator, receiver);
      } else {
        forEachObject(list, iterator, receiver);
      }
    };
    exports$82 = forEach;
    return exports$82;
  }
  var exports$72 = {};
  var _dewExec$62 = false;
  function dew$62() {
    if (_dewExec$62) return exports$72;
    _dewExec$62 = true;
    exports$72 = ["Float32Array", "Float64Array", "Int8Array", "Int16Array", "Int32Array", "Uint8Array", "Uint8ClampedArray", "Uint16Array", "Uint32Array", "BigInt64Array", "BigUint64Array"];
    return exports$72;
  }
  var exports$62 = {};
  var _dewExec$52 = false;
  var _global$2 = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : global;
  function dew$52() {
    if (_dewExec$52) return exports$62;
    _dewExec$52 = true;
    var possibleNames = dew$62();
    var g = typeof globalThis === "undefined" ? _global$2 : globalThis;
    exports$62 = function availableTypedArrays() {
      var out = [];
      for (var i = 0; i < possibleNames.length; i++) {
        if (typeof g[possibleNames[i]] === "function") {
          out[out.length] = possibleNames[i];
        }
      }
      return out;
    };
    return exports$62;
  }
  var exports$52 = {};
  var _dewExec$42 = false;
  var _global$1 = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : global;
  function dew$42() {
    if (_dewExec$42) return exports$52;
    _dewExec$42 = true;
    var forEach = dew$72();
    var availableTypedArrays = dew$52();
    var callBind = dew$12();
    var callBound = dew2();
    var gOPD = dew$5();
    var $toString = callBound("Object.prototype.toString");
    var hasToStringTag = dew$b2()();
    var g = typeof globalThis === "undefined" ? _global$1 : globalThis;
    var typedArrays = availableTypedArrays();
    var $slice = callBound("String.prototype.slice");
    var getPrototypeOf = Object.getPrototypeOf;
    var $indexOf = callBound("Array.prototype.indexOf", true) || function indexOf(array, value) {
      for (var i = 0; i < array.length; i += 1) {
        if (array[i] === value) {
          return i;
        }
      }
      return -1;
    };
    var cache = {
      __proto__: null
    };
    if (hasToStringTag && gOPD && getPrototypeOf) {
      forEach(typedArrays, function(typedArray) {
        var arr = new g[typedArray]();
        if (Symbol.toStringTag in arr) {
          var proto = getPrototypeOf(arr);
          var descriptor = gOPD(proto, Symbol.toStringTag);
          if (!descriptor) {
            var superProto = getPrototypeOf(proto);
            descriptor = gOPD(superProto, Symbol.toStringTag);
          }
          cache["$" + typedArray] = callBind(descriptor.get);
        }
      });
    } else {
      forEach(typedArrays, function(typedArray) {
        var arr = new g[typedArray]();
        var fn = arr.slice || arr.set;
        if (fn) {
          cache["$" + typedArray] = callBind(fn);
        }
      });
    }
    var tryTypedArrays = function tryAllTypedArrays(value) {
      var found = false;
      forEach(
        // eslint-disable-next-line no-extra-parens
        /** @type {Record<`\$${TypedArrayName}`, Getter>} */
        /** @type {any} */
        cache,
        /** @type {(getter: Getter, name: `\$${import('.').TypedArrayName}`) => void} */
        function(getter, typedArray) {
          if (!found) {
            try {
              if ("$" + getter(value) === typedArray) {
                found = $slice(typedArray, 1);
              }
            } catch (e) {
            }
          }
        }
      );
      return found;
    };
    var trySlices = function tryAllSlices(value) {
      var found = false;
      forEach(
        // eslint-disable-next-line no-extra-parens
        /** @type {Record<`\$${TypedArrayName}`, Getter>} */
        /** @type {any} */
        cache,
        /** @type {(getter: typeof cache, name: `\$${import('.').TypedArrayName}`) => void} */
        function(getter, name) {
          if (!found) {
            try {
              getter(value);
              found = $slice(name, 1);
            } catch (e) {
            }
          }
        }
      );
      return found;
    };
    exports$52 = function whichTypedArray(value) {
      if (!value || typeof value !== "object") {
        return false;
      }
      if (!hasToStringTag) {
        var tag = $slice($toString(value), 8, -1);
        if ($indexOf(typedArrays, tag) > -1) {
          return tag;
        }
        if (tag !== "Object") {
          return false;
        }
        return trySlices(value);
      }
      if (!gOPD) {
        return null;
      }
      return tryTypedArrays(value);
    };
    return exports$52;
  }
  var exports$42 = {};
  var _dewExec$32 = false;
  function dew$32() {
    if (_dewExec$32) return exports$42;
    _dewExec$32 = true;
    var whichTypedArray = dew$42();
    exports$42 = function isTypedArray(value) {
      return !!whichTypedArray(value);
    };
    return exports$42;
  }
  var exports$32 = {};
  var _dewExec$23 = false;
  function dew$23() {
    if (_dewExec$23) return exports$32;
    _dewExec$23 = true;
    var isArgumentsObject = dew$a2();
    var isGeneratorFunction = dew$92();
    var whichTypedArray = dew$42();
    var isTypedArray = dew$32();
    function uncurryThis(f) {
      return f.call.bind(f);
    }
    var BigIntSupported = typeof BigInt !== "undefined";
    var SymbolSupported = typeof Symbol !== "undefined";
    var ObjectToString = uncurryThis(Object.prototype.toString);
    var numberValue = uncurryThis(Number.prototype.valueOf);
    var stringValue = uncurryThis(String.prototype.valueOf);
    var booleanValue = uncurryThis(Boolean.prototype.valueOf);
    if (BigIntSupported) {
      var bigIntValue = uncurryThis(BigInt.prototype.valueOf);
    }
    if (SymbolSupported) {
      var symbolValue = uncurryThis(Symbol.prototype.valueOf);
    }
    function checkBoxedPrimitive(value, prototypeValueOf) {
      if (typeof value !== "object") {
        return false;
      }
      try {
        prototypeValueOf(value);
        return true;
      } catch (e) {
        return false;
      }
    }
    exports$32.isArgumentsObject = isArgumentsObject;
    exports$32.isGeneratorFunction = isGeneratorFunction;
    exports$32.isTypedArray = isTypedArray;
    function isPromise(input) {
      return typeof Promise !== "undefined" && input instanceof Promise || input !== null && typeof input === "object" && typeof input.then === "function" && typeof input.catch === "function";
    }
    exports$32.isPromise = isPromise;
    function isArrayBufferView(value) {
      if (typeof ArrayBuffer !== "undefined" && ArrayBuffer.isView) {
        return ArrayBuffer.isView(value);
      }
      return isTypedArray(value) || isDataView(value);
    }
    exports$32.isArrayBufferView = isArrayBufferView;
    function isUint8Array(value) {
      return whichTypedArray(value) === "Uint8Array";
    }
    exports$32.isUint8Array = isUint8Array;
    function isUint8ClampedArray(value) {
      return whichTypedArray(value) === "Uint8ClampedArray";
    }
    exports$32.isUint8ClampedArray = isUint8ClampedArray;
    function isUint16Array(value) {
      return whichTypedArray(value) === "Uint16Array";
    }
    exports$32.isUint16Array = isUint16Array;
    function isUint32Array(value) {
      return whichTypedArray(value) === "Uint32Array";
    }
    exports$32.isUint32Array = isUint32Array;
    function isInt8Array(value) {
      return whichTypedArray(value) === "Int8Array";
    }
    exports$32.isInt8Array = isInt8Array;
    function isInt16Array(value) {
      return whichTypedArray(value) === "Int16Array";
    }
    exports$32.isInt16Array = isInt16Array;
    function isInt32Array(value) {
      return whichTypedArray(value) === "Int32Array";
    }
    exports$32.isInt32Array = isInt32Array;
    function isFloat32Array(value) {
      return whichTypedArray(value) === "Float32Array";
    }
    exports$32.isFloat32Array = isFloat32Array;
    function isFloat64Array(value) {
      return whichTypedArray(value) === "Float64Array";
    }
    exports$32.isFloat64Array = isFloat64Array;
    function isBigInt64Array(value) {
      return whichTypedArray(value) === "BigInt64Array";
    }
    exports$32.isBigInt64Array = isBigInt64Array;
    function isBigUint64Array(value) {
      return whichTypedArray(value) === "BigUint64Array";
    }
    exports$32.isBigUint64Array = isBigUint64Array;
    function isMapToString(value) {
      return ObjectToString(value) === "[object Map]";
    }
    isMapToString.working = typeof Map !== "undefined" && isMapToString(/* @__PURE__ */ new Map());
    function isMap(value) {
      if (typeof Map === "undefined") {
        return false;
      }
      return isMapToString.working ? isMapToString(value) : value instanceof Map;
    }
    exports$32.isMap = isMap;
    function isSetToString(value) {
      return ObjectToString(value) === "[object Set]";
    }
    isSetToString.working = typeof Set !== "undefined" && isSetToString(/* @__PURE__ */ new Set());
    function isSet(value) {
      if (typeof Set === "undefined") {
        return false;
      }
      return isSetToString.working ? isSetToString(value) : value instanceof Set;
    }
    exports$32.isSet = isSet;
    function isWeakMapToString(value) {
      return ObjectToString(value) === "[object WeakMap]";
    }
    isWeakMapToString.working = typeof WeakMap !== "undefined" && isWeakMapToString(/* @__PURE__ */ new WeakMap());
    function isWeakMap(value) {
      if (typeof WeakMap === "undefined") {
        return false;
      }
      return isWeakMapToString.working ? isWeakMapToString(value) : value instanceof WeakMap;
    }
    exports$32.isWeakMap = isWeakMap;
    function isWeakSetToString(value) {
      return ObjectToString(value) === "[object WeakSet]";
    }
    isWeakSetToString.working = typeof WeakSet !== "undefined" && isWeakSetToString(/* @__PURE__ */ new WeakSet());
    function isWeakSet(value) {
      return isWeakSetToString(value);
    }
    exports$32.isWeakSet = isWeakSet;
    function isArrayBufferToString(value) {
      return ObjectToString(value) === "[object ArrayBuffer]";
    }
    isArrayBufferToString.working = typeof ArrayBuffer !== "undefined" && isArrayBufferToString(new ArrayBuffer());
    function isArrayBuffer(value) {
      if (typeof ArrayBuffer === "undefined") {
        return false;
      }
      return isArrayBufferToString.working ? isArrayBufferToString(value) : value instanceof ArrayBuffer;
    }
    exports$32.isArrayBuffer = isArrayBuffer;
    function isDataViewToString(value) {
      return ObjectToString(value) === "[object DataView]";
    }
    isDataViewToString.working = typeof ArrayBuffer !== "undefined" && typeof DataView !== "undefined" && isDataViewToString(new DataView(new ArrayBuffer(1), 0, 1));
    function isDataView(value) {
      if (typeof DataView === "undefined") {
        return false;
      }
      return isDataViewToString.working ? isDataViewToString(value) : value instanceof DataView;
    }
    exports$32.isDataView = isDataView;
    var SharedArrayBufferCopy = typeof SharedArrayBuffer !== "undefined" ? SharedArrayBuffer : void 0;
    function isSharedArrayBufferToString(value) {
      return ObjectToString(value) === "[object SharedArrayBuffer]";
    }
    function isSharedArrayBuffer(value) {
      if (typeof SharedArrayBufferCopy === "undefined") {
        return false;
      }
      if (typeof isSharedArrayBufferToString.working === "undefined") {
        isSharedArrayBufferToString.working = isSharedArrayBufferToString(new SharedArrayBufferCopy());
      }
      return isSharedArrayBufferToString.working ? isSharedArrayBufferToString(value) : value instanceof SharedArrayBufferCopy;
    }
    exports$32.isSharedArrayBuffer = isSharedArrayBuffer;
    function isAsyncFunction(value) {
      return ObjectToString(value) === "[object AsyncFunction]";
    }
    exports$32.isAsyncFunction = isAsyncFunction;
    function isMapIterator(value) {
      return ObjectToString(value) === "[object Map Iterator]";
    }
    exports$32.isMapIterator = isMapIterator;
    function isSetIterator(value) {
      return ObjectToString(value) === "[object Set Iterator]";
    }
    exports$32.isSetIterator = isSetIterator;
    function isGeneratorObject(value) {
      return ObjectToString(value) === "[object Generator]";
    }
    exports$32.isGeneratorObject = isGeneratorObject;
    function isWebAssemblyCompiledModule(value) {
      return ObjectToString(value) === "[object WebAssembly.Module]";
    }
    exports$32.isWebAssemblyCompiledModule = isWebAssemblyCompiledModule;
    function isNumberObject(value) {
      return checkBoxedPrimitive(value, numberValue);
    }
    exports$32.isNumberObject = isNumberObject;
    function isStringObject(value) {
      return checkBoxedPrimitive(value, stringValue);
    }
    exports$32.isStringObject = isStringObject;
    function isBooleanObject(value) {
      return checkBoxedPrimitive(value, booleanValue);
    }
    exports$32.isBooleanObject = isBooleanObject;
    function isBigIntObject(value) {
      return BigIntSupported && checkBoxedPrimitive(value, bigIntValue);
    }
    exports$32.isBigIntObject = isBigIntObject;
    function isSymbolObject(value) {
      return SymbolSupported && checkBoxedPrimitive(value, symbolValue);
    }
    exports$32.isSymbolObject = isSymbolObject;
    function isBoxedPrimitive(value) {
      return isNumberObject(value) || isStringObject(value) || isBooleanObject(value) || isBigIntObject(value) || isSymbolObject(value);
    }
    exports$32.isBoxedPrimitive = isBoxedPrimitive;
    function isAnyArrayBuffer(value) {
      return typeof Uint8Array !== "undefined" && (isArrayBuffer(value) || isSharedArrayBuffer(value));
    }
    exports$32.isAnyArrayBuffer = isAnyArrayBuffer;
    ["isProxy", "isExternal", "isModuleNamespaceObject"].forEach(function(method) {
      Object.defineProperty(exports$32, method, {
        enumerable: false,
        value: function() {
          throw new Error(method + " is not supported in userland");
        }
      });
    });
    return exports$32;
  }
  var exports$23 = {};
  var _dewExec$13 = false;
  function dew$13() {
    if (_dewExec$13) return exports$23;
    _dewExec$13 = true;
    exports$23 = function isBuffer2(arg) {
      return arg && typeof arg === "object" && typeof arg.copy === "function" && typeof arg.fill === "function" && typeof arg.readUInt8 === "function";
    };
    return exports$23;
  }
  var exports$13 = {};
  var _dewExec4 = false;
  var _global = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : global;
  function dew4() {
    if (_dewExec4) return exports$13;
    _dewExec4 = true;
    var process$1 = process;
    var getOwnPropertyDescriptors = Object.getOwnPropertyDescriptors || function getOwnPropertyDescriptors2(obj) {
      var keys = Object.keys(obj);
      var descriptors = {};
      for (var i = 0; i < keys.length; i++) {
        descriptors[keys[i]] = Object.getOwnPropertyDescriptor(obj, keys[i]);
      }
      return descriptors;
    };
    var formatRegExp = /%[sdj%]/g;
    exports$13.format = function(f) {
      if (!isString2(f)) {
        var objects = [];
        for (var i = 0; i < arguments.length; i++) {
          objects.push(inspect2(arguments[i]));
        }
        return objects.join(" ");
      }
      var i = 1;
      var args = arguments;
      var len = args.length;
      var str = String(f).replace(formatRegExp, function(x2) {
        if (x2 === "%%") return "%";
        if (i >= len) return x2;
        switch (x2) {
          case "%s":
            return String(args[i++]);
          case "%d":
            return Number(args[i++]);
          case "%j":
            try {
              return JSON.stringify(args[i++]);
            } catch (_) {
              return "[Circular]";
            }
          default:
            return x2;
        }
      });
      for (var x = args[i]; i < len; x = args[++i]) {
        if (isNull2(x) || !isObject2(x)) {
          str += " " + x;
        } else {
          str += " " + inspect2(x);
        }
      }
      return str;
    };
    exports$13.deprecate = function(fn, msg) {
      if (typeof process$1 !== "undefined" && process$1.noDeprecation === true) {
        return fn;
      }
      if (typeof process$1 === "undefined") {
        return function() {
          return exports$13.deprecate(fn, msg).apply(this || _global, arguments);
        };
      }
      var warned = false;
      function deprecated() {
        if (!warned) {
          if (process$1.throwDeprecation) {
            throw new Error(msg);
          } else if (process$1.traceDeprecation) {
            console.trace(msg);
          } else {
            console.error(msg);
          }
          warned = true;
        }
        return fn.apply(this || _global, arguments);
      }
      return deprecated;
    };
    var debugs = {};
    var debugEnvRegex = /^$/;
    if (process$1.env.NODE_DEBUG) {
      var debugEnv = process$1.env.NODE_DEBUG;
      debugEnv = debugEnv.replace(/[|\\{}()[\]^$+?.]/g, "\\$&").replace(/\*/g, ".*").replace(/,/g, "$|^").toUpperCase();
      debugEnvRegex = new RegExp("^" + debugEnv + "$", "i");
    }
    exports$13.debuglog = function(set) {
      set = set.toUpperCase();
      if (!debugs[set]) {
        if (debugEnvRegex.test(set)) {
          var pid2 = process$1.pid;
          debugs[set] = function() {
            var msg = exports$13.format.apply(exports$13, arguments);
            console.error("%s %d: %s", set, pid2, msg);
          };
        } else {
          debugs[set] = function() {
          };
        }
      }
      return debugs[set];
    };
    function inspect2(obj, opts) {
      var ctx = {
        seen: [],
        stylize: stylizeNoColor
      };
      if (arguments.length >= 3) ctx.depth = arguments[2];
      if (arguments.length >= 4) ctx.colors = arguments[3];
      if (isBoolean2(opts)) {
        ctx.showHidden = opts;
      } else if (opts) {
        exports$13._extend(ctx, opts);
      }
      if (isUndefined2(ctx.showHidden)) ctx.showHidden = false;
      if (isUndefined2(ctx.depth)) ctx.depth = 2;
      if (isUndefined2(ctx.colors)) ctx.colors = false;
      if (isUndefined2(ctx.customInspect)) ctx.customInspect = true;
      if (ctx.colors) ctx.stylize = stylizeWithColor;
      return formatValue(ctx, obj, ctx.depth);
    }
    exports$13.inspect = inspect2;
    inspect2.colors = {
      "bold": [1, 22],
      "italic": [3, 23],
      "underline": [4, 24],
      "inverse": [7, 27],
      "white": [37, 39],
      "grey": [90, 39],
      "black": [30, 39],
      "blue": [34, 39],
      "cyan": [36, 39],
      "green": [32, 39],
      "magenta": [35, 39],
      "red": [31, 39],
      "yellow": [33, 39]
    };
    inspect2.styles = {
      "special": "cyan",
      "number": "yellow",
      "boolean": "yellow",
      "undefined": "grey",
      "null": "bold",
      "string": "green",
      "date": "magenta",
      // "name": intentionally not styling
      "regexp": "red"
    };
    function stylizeWithColor(str, styleType) {
      var style = inspect2.styles[styleType];
      if (style) {
        return "\x1B[" + inspect2.colors[style][0] + "m" + str + "\x1B[" + inspect2.colors[style][1] + "m";
      } else {
        return str;
      }
    }
    function stylizeNoColor(str, styleType) {
      return str;
    }
    function arrayToHash(array) {
      var hash = {};
      array.forEach(function(val, idx) {
        hash[val] = true;
      });
      return hash;
    }
    function formatValue(ctx, value, recurseTimes) {
      if (ctx.customInspect && value && isFunction2(value.inspect) && // Filter out the util module, it's inspect function is special
      value.inspect !== exports$13.inspect && // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
        var ret = value.inspect(recurseTimes, ctx);
        if (!isString2(ret)) {
          ret = formatValue(ctx, ret, recurseTimes);
        }
        return ret;
      }
      var primitive = formatPrimitive(ctx, value);
      if (primitive) {
        return primitive;
      }
      var keys = Object.keys(value);
      var visibleKeys = arrayToHash(keys);
      if (ctx.showHidden) {
        keys = Object.getOwnPropertyNames(value);
      }
      if (isError2(value) && (keys.indexOf("message") >= 0 || keys.indexOf("description") >= 0)) {
        return formatError(value);
      }
      if (keys.length === 0) {
        if (isFunction2(value)) {
          var name = value.name ? ": " + value.name : "";
          return ctx.stylize("[Function" + name + "]", "special");
        }
        if (isRegExp2(value)) {
          return ctx.stylize(RegExp.prototype.toString.call(value), "regexp");
        }
        if (isDate2(value)) {
          return ctx.stylize(Date.prototype.toString.call(value), "date");
        }
        if (isError2(value)) {
          return formatError(value);
        }
      }
      var base = "", array = false, braces = ["{", "}"];
      if (isArray2(value)) {
        array = true;
        braces = ["[", "]"];
      }
      if (isFunction2(value)) {
        var n = value.name ? ": " + value.name : "";
        base = " [Function" + n + "]";
      }
      if (isRegExp2(value)) {
        base = " " + RegExp.prototype.toString.call(value);
      }
      if (isDate2(value)) {
        base = " " + Date.prototype.toUTCString.call(value);
      }
      if (isError2(value)) {
        base = " " + formatError(value);
      }
      if (keys.length === 0 && (!array || value.length == 0)) {
        return braces[0] + base + braces[1];
      }
      if (recurseTimes < 0) {
        if (isRegExp2(value)) {
          return ctx.stylize(RegExp.prototype.toString.call(value), "regexp");
        } else {
          return ctx.stylize("[Object]", "special");
        }
      }
      ctx.seen.push(value);
      var output;
      if (array) {
        output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
      } else {
        output = keys.map(function(key) {
          return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
        });
      }
      ctx.seen.pop();
      return reduceToSingleString(output, base, braces);
    }
    function formatPrimitive(ctx, value) {
      if (isUndefined2(value)) return ctx.stylize("undefined", "undefined");
      if (isString2(value)) {
        var simple = "'" + JSON.stringify(value).replace(/^"|"$/g, "").replace(/'/g, "\\'").replace(/\\"/g, '"') + "'";
        return ctx.stylize(simple, "string");
      }
      if (isNumber2(value)) return ctx.stylize("" + value, "number");
      if (isBoolean2(value)) return ctx.stylize("" + value, "boolean");
      if (isNull2(value)) return ctx.stylize("null", "null");
    }
    function formatError(value) {
      return "[" + Error.prototype.toString.call(value) + "]";
    }
    function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
      var output = [];
      for (var i = 0, l = value.length; i < l; ++i) {
        if (hasOwnProperty(value, String(i))) {
          output.push(formatProperty(ctx, value, recurseTimes, visibleKeys, String(i), true));
        } else {
          output.push("");
        }
      }
      keys.forEach(function(key) {
        if (!key.match(/^\d+$/)) {
          output.push(formatProperty(ctx, value, recurseTimes, visibleKeys, key, true));
        }
      });
      return output;
    }
    function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
      var name, str, desc;
      desc = Object.getOwnPropertyDescriptor(value, key) || {
        value: value[key]
      };
      if (desc.get) {
        if (desc.set) {
          str = ctx.stylize("[Getter/Setter]", "special");
        } else {
          str = ctx.stylize("[Getter]", "special");
        }
      } else {
        if (desc.set) {
          str = ctx.stylize("[Setter]", "special");
        }
      }
      if (!hasOwnProperty(visibleKeys, key)) {
        name = "[" + key + "]";
      }
      if (!str) {
        if (ctx.seen.indexOf(desc.value) < 0) {
          if (isNull2(recurseTimes)) {
            str = formatValue(ctx, desc.value, null);
          } else {
            str = formatValue(ctx, desc.value, recurseTimes - 1);
          }
          if (str.indexOf("\n") > -1) {
            if (array) {
              str = str.split("\n").map(function(line) {
                return "  " + line;
              }).join("\n").slice(2);
            } else {
              str = "\n" + str.split("\n").map(function(line) {
                return "   " + line;
              }).join("\n");
            }
          }
        } else {
          str = ctx.stylize("[Circular]", "special");
        }
      }
      if (isUndefined2(name)) {
        if (array && key.match(/^\d+$/)) {
          return str;
        }
        name = JSON.stringify("" + key);
        if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
          name = name.slice(1, -1);
          name = ctx.stylize(name, "name");
        } else {
          name = name.replace(/'/g, "\\'").replace(/\\"/g, '"').replace(/(^"|"$)/g, "'");
          name = ctx.stylize(name, "string");
        }
      }
      return name + ": " + str;
    }
    function reduceToSingleString(output, base, braces) {
      var length = output.reduce(function(prev, cur) {
        if (cur.indexOf("\n") >= 0) ;
        return prev + cur.replace(/\u001b\[\d\d?m/g, "").length + 1;
      }, 0);
      if (length > 60) {
        return braces[0] + (base === "" ? "" : base + "\n ") + " " + output.join(",\n  ") + " " + braces[1];
      }
      return braces[0] + base + " " + output.join(", ") + " " + braces[1];
    }
    exports$13.types = dew$23();
    function isArray2(ar) {
      return Array.isArray(ar);
    }
    exports$13.isArray = isArray2;
    function isBoolean2(arg) {
      return typeof arg === "boolean";
    }
    exports$13.isBoolean = isBoolean2;
    function isNull2(arg) {
      return arg === null;
    }
    exports$13.isNull = isNull2;
    function isNullOrUndefined2(arg) {
      return arg == null;
    }
    exports$13.isNullOrUndefined = isNullOrUndefined2;
    function isNumber2(arg) {
      return typeof arg === "number";
    }
    exports$13.isNumber = isNumber2;
    function isString2(arg) {
      return typeof arg === "string";
    }
    exports$13.isString = isString2;
    function isSymbol2(arg) {
      return typeof arg === "symbol";
    }
    exports$13.isSymbol = isSymbol2;
    function isUndefined2(arg) {
      return arg === void 0;
    }
    exports$13.isUndefined = isUndefined2;
    function isRegExp2(re) {
      return isObject2(re) && objectToString(re) === "[object RegExp]";
    }
    exports$13.isRegExp = isRegExp2;
    exports$13.types.isRegExp = isRegExp2;
    function isObject2(arg) {
      return typeof arg === "object" && arg !== null;
    }
    exports$13.isObject = isObject2;
    function isDate2(d) {
      return isObject2(d) && objectToString(d) === "[object Date]";
    }
    exports$13.isDate = isDate2;
    exports$13.types.isDate = isDate2;
    function isError2(e) {
      return isObject2(e) && (objectToString(e) === "[object Error]" || e instanceof Error);
    }
    exports$13.isError = isError2;
    exports$13.types.isNativeError = isError2;
    function isFunction2(arg) {
      return typeof arg === "function";
    }
    exports$13.isFunction = isFunction2;
    function isPrimitive2(arg) {
      return arg === null || typeof arg === "boolean" || typeof arg === "number" || typeof arg === "string" || typeof arg === "symbol" || // ES6 symbol
      typeof arg === "undefined";
    }
    exports$13.isPrimitive = isPrimitive2;
    exports$13.isBuffer = dew$13();
    function objectToString(o) {
      return Object.prototype.toString.call(o);
    }
    function pad(n) {
      return n < 10 ? "0" + n.toString(10) : n.toString(10);
    }
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    function timestamp() {
      var d = /* @__PURE__ */ new Date();
      var time = [pad(d.getHours()), pad(d.getMinutes()), pad(d.getSeconds())].join(":");
      return [d.getDate(), months[d.getMonth()], time].join(" ");
    }
    exports$13.log = function() {
      console.log("%s - %s", timestamp(), exports$13.format.apply(exports$13, arguments));
    };
    exports$13.inherits = dew3();
    exports$13._extend = function(origin, add2) {
      if (!add2 || !isObject2(add2)) return origin;
      var keys = Object.keys(add2);
      var i = keys.length;
      while (i--) {
        origin[keys[i]] = add2[keys[i]];
      }
      return origin;
    };
    function hasOwnProperty(obj, prop) {
      return Object.prototype.hasOwnProperty.call(obj, prop);
    }
    var kCustomPromisifiedSymbol = typeof Symbol !== "undefined" ? Symbol("util.promisify.custom") : void 0;
    exports$13.promisify = function promisify2(original) {
      if (typeof original !== "function") throw new TypeError('The "original" argument must be of type Function');
      if (kCustomPromisifiedSymbol && original[kCustomPromisifiedSymbol]) {
        fn = original[kCustomPromisifiedSymbol];
        if (typeof fn !== "function") {
          throw new TypeError('The "util.promisify.custom" argument must be of type Function');
        }
        Object.defineProperty(fn, kCustomPromisifiedSymbol, {
          value: fn,
          enumerable: false,
          writable: false,
          configurable: true
        });
        return fn;
      }
      function fn() {
        var promiseResolve, promiseReject;
        var promise = new Promise(function(resolve, reject) {
          promiseResolve = resolve;
          promiseReject = reject;
        });
        var args = [];
        for (var i = 0; i < arguments.length; i++) {
          args.push(arguments[i]);
        }
        args.push(function(err, value) {
          if (err) {
            promiseReject(err);
          } else {
            promiseResolve(value);
          }
        });
        try {
          original.apply(this || _global, args);
        } catch (err) {
          promiseReject(err);
        }
        return promise;
      }
      Object.setPrototypeOf(fn, Object.getPrototypeOf(original));
      if (kCustomPromisifiedSymbol) Object.defineProperty(fn, kCustomPromisifiedSymbol, {
        value: fn,
        enumerable: false,
        writable: false,
        configurable: true
      });
      return Object.defineProperties(fn, getOwnPropertyDescriptors(original));
    };
    exports$13.promisify.custom = kCustomPromisifiedSymbol;
    function callbackifyOnRejected(reason, cb) {
      if (!reason) {
        var newReason = new Error("Promise was rejected with a falsy value");
        newReason.reason = reason;
        reason = newReason;
      }
      return cb(reason);
    }
    function callbackify2(original) {
      if (typeof original !== "function") {
        throw new TypeError('The "original" argument must be of type Function');
      }
      function callbackified() {
        var args = [];
        for (var i = 0; i < arguments.length; i++) {
          args.push(arguments[i]);
        }
        var maybeCb = args.pop();
        if (typeof maybeCb !== "function") {
          throw new TypeError("The last argument must be of type Function");
        }
        var self2 = this || _global;
        var cb = function() {
          return maybeCb.apply(self2, arguments);
        };
        original.apply(this || _global, args).then(function(ret) {
          process$1.nextTick(cb.bind(null, null, ret));
        }, function(rej) {
          process$1.nextTick(callbackifyOnRejected.bind(null, rej, cb));
        });
      }
      Object.setPrototypeOf(callbackified, Object.getPrototypeOf(original));
      Object.defineProperties(callbackified, getOwnPropertyDescriptors(original));
      return callbackified;
    }
    exports$13.callbackify = callbackify2;
    return exports$13;
  }
  var exports5 = dew4();
  exports5["format"];
  exports5["deprecate"];
  exports5["debuglog"];
  exports5["inspect"];
  exports5["types"];
  exports5["isArray"];
  exports5["isBoolean"];
  exports5["isNull"];
  exports5["isNullOrUndefined"];
  exports5["isNumber"];
  exports5["isString"];
  exports5["isSymbol"];
  exports5["isUndefined"];
  exports5["isRegExp"];
  exports5["isObject"];
  exports5["isDate"];
  exports5["isError"];
  exports5["isFunction"];
  exports5["isPrimitive"];
  exports5["isBuffer"];
  exports5["log"];
  exports5["inherits"];
  exports5["_extend"];
  exports5["promisify"];
  exports5["callbackify"];
  var _extend = exports5._extend;
  var callbackify = exports5.callbackify;
  var debuglog = exports5.debuglog;
  var deprecate = exports5.deprecate;
  var format = exports5.format;
  var inherits = exports5.inherits;
  var inspect = exports5.inspect;
  var isArray = exports5.isArray;
  var isBoolean = exports5.isBoolean;
  var isBuffer = exports5.isBuffer;
  var isDate = exports5.isDate;
  var isError = exports5.isError;
  var isFunction = exports5.isFunction;
  var isNull = exports5.isNull;
  var isNullOrUndefined = exports5.isNullOrUndefined;
  var isNumber = exports5.isNumber;
  var isObject = exports5.isObject;
  var isPrimitive = exports5.isPrimitive;
  var isRegExp = exports5.isRegExp;
  var isString = exports5.isString;
  var isSymbol = exports5.isSymbol;
  var isUndefined = exports5.isUndefined;
  var log = exports5.log;
  var promisify = exports5.promisify;
  var types = exports5.types;
  var TextEncoder2 = exports5.TextEncoder = globalThis.TextEncoder;
  var TextDecoder2 = exports5.TextDecoder = globalThis.TextDecoder;

  // node_modules/@jspm/core/nodelibs/browser/assert.js
  var exports$i2 = {};
  var _dewExec$h2 = false;
  function dew$h2() {
    if (_dewExec$h2) return exports$i2;
    _dewExec$h2 = true;
    function _typeof(o) {
      "@babel/helpers - typeof";
      return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
        return typeof o2;
      } : function(o2) {
        return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
      }, _typeof(o);
    }
    function _createClass(Constructor, protoProps, staticProps) {
      Object.defineProperty(Constructor, "prototype", {
        writable: false
      });
      return Constructor;
    }
    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }
    function _inherits(subClass, superClass) {
      if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function");
      }
      subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
          value: subClass,
          writable: true,
          configurable: true
        }
      });
      Object.defineProperty(subClass, "prototype", {
        writable: false
      });
      if (superClass) _setPrototypeOf(subClass, superClass);
    }
    function _setPrototypeOf(o, p) {
      _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf2(o2, p2) {
        o2.__proto__ = p2;
        return o2;
      };
      return _setPrototypeOf(o, p);
    }
    function _createSuper(Derived) {
      var hasNativeReflectConstruct = _isNativeReflectConstruct();
      return function _createSuperInternal() {
        var Super = _getPrototypeOf(Derived), result;
        if (hasNativeReflectConstruct) {
          var NewTarget = _getPrototypeOf(this).constructor;
          result = Reflect.construct(Super, arguments, NewTarget);
        } else {
          result = Super.apply(this, arguments);
        }
        return _possibleConstructorReturn(this, result);
      };
    }
    function _possibleConstructorReturn(self2, call) {
      if (call && (_typeof(call) === "object" || typeof call === "function")) {
        return call;
      } else if (call !== void 0) {
        throw new TypeError("Derived constructors may only return object or undefined");
      }
      return _assertThisInitialized(self2);
    }
    function _assertThisInitialized(self2) {
      if (self2 === void 0) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
      }
      return self2;
    }
    function _isNativeReflectConstruct() {
      if (typeof Reflect === "undefined" || !Reflect.construct) return false;
      if (Reflect.construct.sham) return false;
      if (typeof Proxy === "function") return true;
      try {
        Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
        }));
        return true;
      } catch (e) {
        return false;
      }
    }
    function _getPrototypeOf(o) {
      _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf2(o2) {
        return o2.__proto__ || Object.getPrototypeOf(o2);
      };
      return _getPrototypeOf(o);
    }
    var codes = {};
    var assert2;
    var util;
    function createErrorType(code, message, Base) {
      if (!Base) {
        Base = Error;
      }
      function getMessage(arg1, arg2, arg3) {
        if (typeof message === "string") {
          return message;
        } else {
          return message(arg1, arg2, arg3);
        }
      }
      var NodeError = /* @__PURE__ */ (function(_Base) {
        _inherits(NodeError2, _Base);
        var _super = _createSuper(NodeError2);
        function NodeError2(arg1, arg2, arg3) {
          var _this;
          _classCallCheck(this, NodeError2);
          _this = _super.call(this, getMessage(arg1, arg2, arg3));
          _this.code = code;
          return _this;
        }
        return _createClass(NodeError2);
      })(Base);
      codes[code] = NodeError;
    }
    function oneOf(expected, thing) {
      if (Array.isArray(expected)) {
        var len = expected.length;
        expected = expected.map(function(i) {
          return String(i);
        });
        if (len > 2) {
          return "one of ".concat(thing, " ").concat(expected.slice(0, len - 1).join(", "), ", or ") + expected[len - 1];
        } else if (len === 2) {
          return "one of ".concat(thing, " ").concat(expected[0], " or ").concat(expected[1]);
        } else {
          return "of ".concat(thing, " ").concat(expected[0]);
        }
      } else {
        return "of ".concat(thing, " ").concat(String(expected));
      }
    }
    function startsWith(str, search, pos) {
      return str.substr(0, search.length) === search;
    }
    function endsWith(str, search, this_len) {
      if (this_len === void 0 || this_len > str.length) {
        this_len = str.length;
      }
      return str.substring(this_len - search.length, this_len) === search;
    }
    function includes(str, search, start) {
      if (typeof start !== "number") {
        start = 0;
      }
      if (start + search.length > str.length) {
        return false;
      } else {
        return str.indexOf(search, start) !== -1;
      }
    }
    createErrorType("ERR_AMBIGUOUS_ARGUMENT", 'The "%s" argument is ambiguous. %s', TypeError);
    createErrorType("ERR_INVALID_ARG_TYPE", function(name, expected, actual) {
      if (assert2 === void 0) assert2 = dew5();
      assert2(typeof name === "string", "'name' must be a string");
      var determiner;
      if (typeof expected === "string" && startsWith(expected, "not ")) {
        determiner = "must not be";
        expected = expected.replace(/^not /, "");
      } else {
        determiner = "must be";
      }
      var msg;
      if (endsWith(name, " argument")) {
        msg = "The ".concat(name, " ").concat(determiner, " ").concat(oneOf(expected, "type"));
      } else {
        var type = includes(name, ".") ? "property" : "argument";
        msg = 'The "'.concat(name, '" ').concat(type, " ").concat(determiner, " ").concat(oneOf(expected, "type"));
      }
      msg += ". Received type ".concat(_typeof(actual));
      return msg;
    }, TypeError);
    createErrorType("ERR_INVALID_ARG_VALUE", function(name, value) {
      var reason = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "is invalid";
      if (util === void 0) util = exports5;
      var inspected = util.inspect(value);
      if (inspected.length > 128) {
        inspected = "".concat(inspected.slice(0, 128), "...");
      }
      return "The argument '".concat(name, "' ").concat(reason, ". Received ").concat(inspected);
    }, TypeError);
    createErrorType("ERR_INVALID_RETURN_VALUE", function(input, name, value) {
      var type;
      if (value && value.constructor && value.constructor.name) {
        type = "instance of ".concat(value.constructor.name);
      } else {
        type = "type ".concat(_typeof(value));
      }
      return "Expected ".concat(input, ' to be returned from the "').concat(name, '"') + " function but got ".concat(type, ".");
    }, TypeError);
    createErrorType("ERR_MISSING_ARGS", function() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      if (assert2 === void 0) assert2 = dew5();
      assert2(args.length > 0, "At least one arg needs to be specified");
      var msg = "The ";
      var len = args.length;
      args = args.map(function(a) {
        return '"'.concat(a, '"');
      });
      switch (len) {
        case 1:
          msg += "".concat(args[0], " argument");
          break;
        case 2:
          msg += "".concat(args[0], " and ").concat(args[1], " arguments");
          break;
        default:
          msg += args.slice(0, len - 1).join(", ");
          msg += ", and ".concat(args[len - 1], " arguments");
          break;
      }
      return "".concat(msg, " must be specified");
    }, TypeError);
    exports$i2.codes = codes;
    return exports$i2;
  }
  var exports$h2 = {};
  var _dewExec$g2 = false;
  function dew$g2() {
    if (_dewExec$g2) return exports$h2;
    _dewExec$g2 = true;
    var process$1 = process;
    function ownKeys(e, r) {
      var t = Object.keys(e);
      if (Object.getOwnPropertySymbols) {
        var o = Object.getOwnPropertySymbols(e);
        r && (o = o.filter(function(r2) {
          return Object.getOwnPropertyDescriptor(e, r2).enumerable;
        })), t.push.apply(t, o);
      }
      return t;
    }
    function _objectSpread(e) {
      for (var r = 1; r < arguments.length; r++) {
        var t = null != arguments[r] ? arguments[r] : {};
        r % 2 ? ownKeys(Object(t), true).forEach(function(r2) {
          _defineProperty(e, r2, t[r2]);
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function(r2) {
          Object.defineProperty(e, r2, Object.getOwnPropertyDescriptor(t, r2));
        });
      }
      return e;
    }
    function _defineProperty(obj, key, value) {
      key = _toPropertyKey(key);
      if (key in obj) {
        Object.defineProperty(obj, key, {
          value,
          enumerable: true,
          configurable: true,
          writable: true
        });
      } else {
        obj[key] = value;
      }
      return obj;
    }
    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }
    function _defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
      }
    }
    function _createClass(Constructor, protoProps, staticProps) {
      if (protoProps) _defineProperties(Constructor.prototype, protoProps);
      Object.defineProperty(Constructor, "prototype", {
        writable: false
      });
      return Constructor;
    }
    function _toPropertyKey(arg) {
      var key = _toPrimitive(arg, "string");
      return _typeof(key) === "symbol" ? key : String(key);
    }
    function _toPrimitive(input, hint) {
      if (_typeof(input) !== "object" || input === null) return input;
      var prim = input[Symbol.toPrimitive];
      if (prim !== void 0) {
        var res = prim.call(input, hint || "default");
        if (_typeof(res) !== "object") return res;
        throw new TypeError("@@toPrimitive must return a primitive value.");
      }
      return (hint === "string" ? String : Number)(input);
    }
    function _inherits(subClass, superClass) {
      if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function");
      }
      subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
          value: subClass,
          writable: true,
          configurable: true
        }
      });
      Object.defineProperty(subClass, "prototype", {
        writable: false
      });
      if (superClass) _setPrototypeOf(subClass, superClass);
    }
    function _createSuper(Derived) {
      var hasNativeReflectConstruct = _isNativeReflectConstruct();
      return function _createSuperInternal() {
        var Super = _getPrototypeOf(Derived), result;
        if (hasNativeReflectConstruct) {
          var NewTarget = _getPrototypeOf(this).constructor;
          result = Reflect.construct(Super, arguments, NewTarget);
        } else {
          result = Super.apply(this, arguments);
        }
        return _possibleConstructorReturn(this, result);
      };
    }
    function _possibleConstructorReturn(self2, call) {
      if (call && (_typeof(call) === "object" || typeof call === "function")) {
        return call;
      } else if (call !== void 0) {
        throw new TypeError("Derived constructors may only return object or undefined");
      }
      return _assertThisInitialized(self2);
    }
    function _assertThisInitialized(self2) {
      if (self2 === void 0) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
      }
      return self2;
    }
    function _wrapNativeSuper(Class) {
      var _cache = typeof Map === "function" ? /* @__PURE__ */ new Map() : void 0;
      _wrapNativeSuper = function _wrapNativeSuper2(Class2) {
        if (Class2 === null || !_isNativeFunction(Class2)) return Class2;
        if (typeof Class2 !== "function") {
          throw new TypeError("Super expression must either be null or a function");
        }
        if (typeof _cache !== "undefined") {
          if (_cache.has(Class2)) return _cache.get(Class2);
          _cache.set(Class2, Wrapper);
        }
        function Wrapper() {
          return _construct(Class2, arguments, _getPrototypeOf(this).constructor);
        }
        Wrapper.prototype = Object.create(Class2.prototype, {
          constructor: {
            value: Wrapper,
            enumerable: false,
            writable: true,
            configurable: true
          }
        });
        return _setPrototypeOf(Wrapper, Class2);
      };
      return _wrapNativeSuper(Class);
    }
    function _construct(Parent, args, Class) {
      if (_isNativeReflectConstruct()) {
        _construct = Reflect.construct.bind();
      } else {
        _construct = function _construct2(Parent2, args2, Class2) {
          var a = [null];
          a.push.apply(a, args2);
          var Constructor = Function.bind.apply(Parent2, a);
          var instance = new Constructor();
          if (Class2) _setPrototypeOf(instance, Class2.prototype);
          return instance;
        };
      }
      return _construct.apply(null, arguments);
    }
    function _isNativeReflectConstruct() {
      if (typeof Reflect === "undefined" || !Reflect.construct) return false;
      if (Reflect.construct.sham) return false;
      if (typeof Proxy === "function") return true;
      try {
        Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
        }));
        return true;
      } catch (e) {
        return false;
      }
    }
    function _isNativeFunction(fn) {
      return Function.toString.call(fn).indexOf("[native code]") !== -1;
    }
    function _setPrototypeOf(o, p) {
      _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf2(o2, p2) {
        o2.__proto__ = p2;
        return o2;
      };
      return _setPrototypeOf(o, p);
    }
    function _getPrototypeOf(o) {
      _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf2(o2) {
        return o2.__proto__ || Object.getPrototypeOf(o2);
      };
      return _getPrototypeOf(o);
    }
    function _typeof(o) {
      "@babel/helpers - typeof";
      return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
        return typeof o2;
      } : function(o2) {
        return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
      }, _typeof(o);
    }
    var _require = exports5, inspect2 = _require.inspect;
    var _require2 = dew$h2(), ERR_INVALID_ARG_TYPE = _require2.codes.ERR_INVALID_ARG_TYPE;
    function endsWith(str, search, this_len) {
      if (this_len === void 0 || this_len > str.length) {
        this_len = str.length;
      }
      return str.substring(this_len - search.length, this_len) === search;
    }
    function repeat(str, count) {
      count = Math.floor(count);
      if (str.length == 0 || count == 0) return "";
      var maxCount = str.length * count;
      count = Math.floor(Math.log(count) / Math.log(2));
      while (count) {
        str += str;
        count--;
      }
      str += str.substring(0, maxCount - str.length);
      return str;
    }
    var blue = "";
    var green = "";
    var red = "";
    var white = "";
    var kReadableOperator = {
      deepStrictEqual: "Expected values to be strictly deep-equal:",
      strictEqual: "Expected values to be strictly equal:",
      strictEqualObject: 'Expected "actual" to be reference-equal to "expected":',
      deepEqual: "Expected values to be loosely deep-equal:",
      equal: "Expected values to be loosely equal:",
      notDeepStrictEqual: 'Expected "actual" not to be strictly deep-equal to:',
      notStrictEqual: 'Expected "actual" to be strictly unequal to:',
      notStrictEqualObject: 'Expected "actual" not to be reference-equal to "expected":',
      notDeepEqual: 'Expected "actual" not to be loosely deep-equal to:',
      notEqual: 'Expected "actual" to be loosely unequal to:',
      notIdentical: "Values identical but not reference-equal:"
    };
    var kMaxShortLength = 10;
    function copyError(source) {
      var keys = Object.keys(source);
      var target = Object.create(Object.getPrototypeOf(source));
      keys.forEach(function(key) {
        target[key] = source[key];
      });
      Object.defineProperty(target, "message", {
        value: source.message
      });
      return target;
    }
    function inspectValue(val) {
      return inspect2(val, {
        compact: false,
        customInspect: false,
        depth: 1e3,
        maxArrayLength: Infinity,
        // Assert compares only enumerable properties (with a few exceptions).
        showHidden: false,
        // Having a long line as error is better than wrapping the line for
        // comparison for now.
        // TODO(BridgeAR): `breakLength` should be limited as soon as soon as we
        // have meta information about the inspected properties (i.e., know where
        // in what line the property starts and ends).
        breakLength: Infinity,
        // Assert does not detect proxies currently.
        showProxy: false,
        sorted: true,
        // Inspect getters as we also check them when comparing entries.
        getters: true
      });
    }
    function createErrDiff(actual, expected, operator) {
      var other = "";
      var res = "";
      var lastPos = 0;
      var end = "";
      var skipped = false;
      var actualInspected = inspectValue(actual);
      var actualLines = actualInspected.split("\n");
      var expectedLines = inspectValue(expected).split("\n");
      var i = 0;
      var indicator = "";
      if (operator === "strictEqual" && _typeof(actual) === "object" && _typeof(expected) === "object" && actual !== null && expected !== null) {
        operator = "strictEqualObject";
      }
      if (actualLines.length === 1 && expectedLines.length === 1 && actualLines[0] !== expectedLines[0]) {
        var inputLength = actualLines[0].length + expectedLines[0].length;
        if (inputLength <= kMaxShortLength) {
          if ((_typeof(actual) !== "object" || actual === null) && (_typeof(expected) !== "object" || expected === null) && (actual !== 0 || expected !== 0)) {
            return "".concat(kReadableOperator[operator], "\n\n") + "".concat(actualLines[0], " !== ").concat(expectedLines[0], "\n");
          }
        } else if (operator !== "strictEqualObject") {
          var maxLength = process$1.stderr && process$1.stderr.isTTY ? process$1.stderr.columns : 80;
          if (inputLength < maxLength) {
            while (actualLines[0][i] === expectedLines[0][i]) {
              i++;
            }
            if (i > 2) {
              indicator = "\n  ".concat(repeat(" ", i), "^");
              i = 0;
            }
          }
        }
      }
      var a = actualLines[actualLines.length - 1];
      var b = expectedLines[expectedLines.length - 1];
      while (a === b) {
        if (i++ < 2) {
          end = "\n  ".concat(a).concat(end);
        } else {
          other = a;
        }
        actualLines.pop();
        expectedLines.pop();
        if (actualLines.length === 0 || expectedLines.length === 0) break;
        a = actualLines[actualLines.length - 1];
        b = expectedLines[expectedLines.length - 1];
      }
      var maxLines = Math.max(actualLines.length, expectedLines.length);
      if (maxLines === 0) {
        var _actualLines = actualInspected.split("\n");
        if (_actualLines.length > 30) {
          _actualLines[26] = "".concat(blue, "...").concat(white);
          while (_actualLines.length > 27) {
            _actualLines.pop();
          }
        }
        return "".concat(kReadableOperator.notIdentical, "\n\n").concat(_actualLines.join("\n"), "\n");
      }
      if (i > 3) {
        end = "\n".concat(blue, "...").concat(white).concat(end);
        skipped = true;
      }
      if (other !== "") {
        end = "\n  ".concat(other).concat(end);
        other = "";
      }
      var printedLines = 0;
      var msg = kReadableOperator[operator] + "\n".concat(green, "+ actual").concat(white, " ").concat(red, "- expected").concat(white);
      var skippedMsg = " ".concat(blue, "...").concat(white, " Lines skipped");
      for (i = 0; i < maxLines; i++) {
        var cur = i - lastPos;
        if (actualLines.length < i + 1) {
          if (cur > 1 && i > 2) {
            if (cur > 4) {
              res += "\n".concat(blue, "...").concat(white);
              skipped = true;
            } else if (cur > 3) {
              res += "\n  ".concat(expectedLines[i - 2]);
              printedLines++;
            }
            res += "\n  ".concat(expectedLines[i - 1]);
            printedLines++;
          }
          lastPos = i;
          other += "\n".concat(red, "-").concat(white, " ").concat(expectedLines[i]);
          printedLines++;
        } else if (expectedLines.length < i + 1) {
          if (cur > 1 && i > 2) {
            if (cur > 4) {
              res += "\n".concat(blue, "...").concat(white);
              skipped = true;
            } else if (cur > 3) {
              res += "\n  ".concat(actualLines[i - 2]);
              printedLines++;
            }
            res += "\n  ".concat(actualLines[i - 1]);
            printedLines++;
          }
          lastPos = i;
          res += "\n".concat(green, "+").concat(white, " ").concat(actualLines[i]);
          printedLines++;
        } else {
          var expectedLine = expectedLines[i];
          var actualLine = actualLines[i];
          var divergingLines = actualLine !== expectedLine && (!endsWith(actualLine, ",") || actualLine.slice(0, -1) !== expectedLine);
          if (divergingLines && endsWith(expectedLine, ",") && expectedLine.slice(0, -1) === actualLine) {
            divergingLines = false;
            actualLine += ",";
          }
          if (divergingLines) {
            if (cur > 1 && i > 2) {
              if (cur > 4) {
                res += "\n".concat(blue, "...").concat(white);
                skipped = true;
              } else if (cur > 3) {
                res += "\n  ".concat(actualLines[i - 2]);
                printedLines++;
              }
              res += "\n  ".concat(actualLines[i - 1]);
              printedLines++;
            }
            lastPos = i;
            res += "\n".concat(green, "+").concat(white, " ").concat(actualLine);
            other += "\n".concat(red, "-").concat(white, " ").concat(expectedLine);
            printedLines += 2;
          } else {
            res += other;
            other = "";
            if (cur === 1 || i === 0) {
              res += "\n  ".concat(actualLine);
              printedLines++;
            }
          }
        }
        if (printedLines > 20 && i < maxLines - 2) {
          return "".concat(msg).concat(skippedMsg, "\n").concat(res, "\n").concat(blue, "...").concat(white).concat(other, "\n") + "".concat(blue, "...").concat(white);
        }
      }
      return "".concat(msg).concat(skipped ? skippedMsg : "", "\n").concat(res).concat(other).concat(end).concat(indicator);
    }
    var AssertionError3 = /* @__PURE__ */ (function(_Error, _inspect$custom) {
      _inherits(AssertionError4, _Error);
      var _super = _createSuper(AssertionError4);
      function AssertionError4(options) {
        var _this;
        _classCallCheck(this, AssertionError4);
        if (_typeof(options) !== "object" || options === null) {
          throw new ERR_INVALID_ARG_TYPE("options", "Object", options);
        }
        var message = options.message, operator = options.operator, stackStartFn = options.stackStartFn;
        var actual = options.actual, expected = options.expected;
        var limit = Error.stackTraceLimit;
        Error.stackTraceLimit = 0;
        if (message != null) {
          _this = _super.call(this, String(message));
        } else {
          if (process$1.stderr && process$1.stderr.isTTY) {
            if (process$1.stderr && process$1.stderr.getColorDepth && process$1.stderr.getColorDepth() !== 1) {
              blue = "\x1B[34m";
              green = "\x1B[32m";
              white = "\x1B[39m";
              red = "\x1B[31m";
            } else {
              blue = "";
              green = "";
              white = "";
              red = "";
            }
          }
          if (_typeof(actual) === "object" && actual !== null && _typeof(expected) === "object" && expected !== null && "stack" in actual && actual instanceof Error && "stack" in expected && expected instanceof Error) {
            actual = copyError(actual);
            expected = copyError(expected);
          }
          if (operator === "deepStrictEqual" || operator === "strictEqual") {
            _this = _super.call(this, createErrDiff(actual, expected, operator));
          } else if (operator === "notDeepStrictEqual" || operator === "notStrictEqual") {
            var base = kReadableOperator[operator];
            var res = inspectValue(actual).split("\n");
            if (operator === "notStrictEqual" && _typeof(actual) === "object" && actual !== null) {
              base = kReadableOperator.notStrictEqualObject;
            }
            if (res.length > 30) {
              res[26] = "".concat(blue, "...").concat(white);
              while (res.length > 27) {
                res.pop();
              }
            }
            if (res.length === 1) {
              _this = _super.call(this, "".concat(base, " ").concat(res[0]));
            } else {
              _this = _super.call(this, "".concat(base, "\n\n").concat(res.join("\n"), "\n"));
            }
          } else {
            var _res = inspectValue(actual);
            var other = "";
            var knownOperators = kReadableOperator[operator];
            if (operator === "notDeepEqual" || operator === "notEqual") {
              _res = "".concat(kReadableOperator[operator], "\n\n").concat(_res);
              if (_res.length > 1024) {
                _res = "".concat(_res.slice(0, 1021), "...");
              }
            } else {
              other = "".concat(inspectValue(expected));
              if (_res.length > 512) {
                _res = "".concat(_res.slice(0, 509), "...");
              }
              if (other.length > 512) {
                other = "".concat(other.slice(0, 509), "...");
              }
              if (operator === "deepEqual" || operator === "equal") {
                _res = "".concat(knownOperators, "\n\n").concat(_res, "\n\nshould equal\n\n");
              } else {
                other = " ".concat(operator, " ").concat(other);
              }
            }
            _this = _super.call(this, "".concat(_res).concat(other));
          }
        }
        Error.stackTraceLimit = limit;
        _this.generatedMessage = !message;
        Object.defineProperty(_assertThisInitialized(_this), "name", {
          value: "AssertionError [ERR_ASSERTION]",
          enumerable: false,
          writable: true,
          configurable: true
        });
        _this.code = "ERR_ASSERTION";
        _this.actual = actual;
        _this.expected = expected;
        _this.operator = operator;
        if (Error.captureStackTrace) {
          Error.captureStackTrace(_assertThisInitialized(_this), stackStartFn);
        }
        _this.stack;
        _this.name = "AssertionError";
        return _possibleConstructorReturn(_this);
      }
      _createClass(AssertionError4, [{
        key: "toString",
        value: function toString() {
          return "".concat(this.name, " [").concat(this.code, "]: ").concat(this.message);
        }
      }, {
        key: _inspect$custom,
        value: function value(recurseTimes, ctx) {
          return inspect2(this, _objectSpread(_objectSpread({}, ctx), {}, {
            customInspect: false,
            depth: 0
          }));
        }
      }]);
      return AssertionError4;
    })(/* @__PURE__ */ _wrapNativeSuper(Error), inspect2.custom);
    exports$h2 = AssertionError3;
    return exports$h2;
  }
  var exports$g2 = {};
  var _dewExec$f2 = false;
  function dew$f2() {
    if (_dewExec$f2) return exports$g2;
    _dewExec$f2 = true;
    var toStr = Object.prototype.toString;
    exports$g2 = function isArguments(value) {
      var str = toStr.call(value);
      var isArgs = str === "[object Arguments]";
      if (!isArgs) {
        isArgs = str !== "[object Array]" && value !== null && typeof value === "object" && typeof value.length === "number" && value.length >= 0 && toStr.call(value.callee) === "[object Function]";
      }
      return isArgs;
    };
    return exports$g2;
  }
  var exports$f2 = {};
  var _dewExec$e2 = false;
  function dew$e2() {
    if (_dewExec$e2) return exports$f2;
    _dewExec$e2 = true;
    var keysShim;
    if (!Object.keys) {
      var has = Object.prototype.hasOwnProperty;
      var toStr = Object.prototype.toString;
      var isArgs = dew$f2();
      var isEnumerable = Object.prototype.propertyIsEnumerable;
      var hasDontEnumBug = !isEnumerable.call({
        toString: null
      }, "toString");
      var hasProtoEnumBug = isEnumerable.call(function() {
      }, "prototype");
      var dontEnums = ["toString", "toLocaleString", "valueOf", "hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable", "constructor"];
      var equalsConstructorPrototype = function(o) {
        var ctor = o.constructor;
        return ctor && ctor.prototype === o;
      };
      var excludedKeys = {
        $applicationCache: true,
        $console: true,
        $external: true,
        $frame: true,
        $frameElement: true,
        $frames: true,
        $innerHeight: true,
        $innerWidth: true,
        $onmozfullscreenchange: true,
        $onmozfullscreenerror: true,
        $outerHeight: true,
        $outerWidth: true,
        $pageXOffset: true,
        $pageYOffset: true,
        $parent: true,
        $scrollLeft: true,
        $scrollTop: true,
        $scrollX: true,
        $scrollY: true,
        $self: true,
        $webkitIndexedDB: true,
        $webkitStorageInfo: true,
        $window: true
      };
      var hasAutomationEqualityBug = (function() {
        if (typeof window === "undefined") {
          return false;
        }
        for (var k in window) {
          try {
            if (!excludedKeys["$" + k] && has.call(window, k) && window[k] !== null && typeof window[k] === "object") {
              try {
                equalsConstructorPrototype(window[k]);
              } catch (e) {
                return true;
              }
            }
          } catch (e) {
            return true;
          }
        }
        return false;
      })();
      var equalsConstructorPrototypeIfNotBuggy = function(o) {
        if (typeof window === "undefined" || !hasAutomationEqualityBug) {
          return equalsConstructorPrototype(o);
        }
        try {
          return equalsConstructorPrototype(o);
        } catch (e) {
          return false;
        }
      };
      keysShim = function keys(object) {
        var isObject2 = object !== null && typeof object === "object";
        var isFunction2 = toStr.call(object) === "[object Function]";
        var isArguments = isArgs(object);
        var isString2 = isObject2 && toStr.call(object) === "[object String]";
        var theKeys = [];
        if (!isObject2 && !isFunction2 && !isArguments) {
          throw new TypeError("Object.keys called on a non-object");
        }
        var skipProto = hasProtoEnumBug && isFunction2;
        if (isString2 && object.length > 0 && !has.call(object, 0)) {
          for (var i = 0; i < object.length; ++i) {
            theKeys.push(String(i));
          }
        }
        if (isArguments && object.length > 0) {
          for (var j = 0; j < object.length; ++j) {
            theKeys.push(String(j));
          }
        } else {
          for (var name in object) {
            if (!(skipProto && name === "prototype") && has.call(object, name)) {
              theKeys.push(String(name));
            }
          }
        }
        if (hasDontEnumBug) {
          var skipConstructor = equalsConstructorPrototypeIfNotBuggy(object);
          for (var k = 0; k < dontEnums.length; ++k) {
            if (!(skipConstructor && dontEnums[k] === "constructor") && has.call(object, dontEnums[k])) {
              theKeys.push(dontEnums[k]);
            }
          }
        }
        return theKeys;
      };
    }
    exports$f2 = keysShim;
    return exports$f2;
  }
  var exports$e2 = {};
  var _dewExec$d2 = false;
  function dew$d2() {
    if (_dewExec$d2) return exports$e2;
    _dewExec$d2 = true;
    var slice = Array.prototype.slice;
    var isArgs = dew$f2();
    var origKeys = Object.keys;
    var keysShim = origKeys ? function keys(o) {
      return origKeys(o);
    } : dew$e2();
    var originalKeys = Object.keys;
    keysShim.shim = function shimObjectKeys() {
      if (Object.keys) {
        var keysWorksWithArguments = (function() {
          var args = Object.keys(arguments);
          return args && args.length === arguments.length;
        })(1, 2);
        if (!keysWorksWithArguments) {
          Object.keys = function keys(object) {
            if (isArgs(object)) {
              return originalKeys(slice.call(object));
            }
            return originalKeys(object);
          };
        }
      } else {
        Object.keys = keysShim;
      }
      return Object.keys || keysShim;
    };
    exports$e2 = keysShim;
    return exports$e2;
  }
  var exports$d2 = {};
  var _dewExec$c2 = false;
  function dew$c2() {
    if (_dewExec$c2) return exports$d2;
    _dewExec$c2 = true;
    var objectKeys = dew$d2();
    var hasSymbols = dew$k()();
    var callBound = dew2();
    var toObject = Object;
    var $push = callBound("Array.prototype.push");
    var $propIsEnumerable = callBound("Object.prototype.propertyIsEnumerable");
    var originalGetSymbols = hasSymbols ? Object.getOwnPropertySymbols : null;
    exports$d2 = function assign(target, source1) {
      if (target == null) {
        throw new TypeError("target must be an object");
      }
      var to = toObject(target);
      if (arguments.length === 1) {
        return to;
      }
      for (var s = 1; s < arguments.length; ++s) {
        var from = toObject(arguments[s]);
        var keys = objectKeys(from);
        var getSymbols = hasSymbols && (Object.getOwnPropertySymbols || originalGetSymbols);
        if (getSymbols) {
          var syms = getSymbols(from);
          for (var j = 0; j < syms.length; ++j) {
            var key = syms[j];
            if ($propIsEnumerable(from, key)) {
              $push(keys, key);
            }
          }
        }
        for (var i = 0; i < keys.length; ++i) {
          var nextKey = keys[i];
          if ($propIsEnumerable(from, nextKey)) {
            var propValue = from[nextKey];
            to[nextKey] = propValue;
          }
        }
      }
      return to;
    };
    return exports$d2;
  }
  var exports$c3 = {};
  var _dewExec$b3 = false;
  function dew$b3() {
    if (_dewExec$b3) return exports$c3;
    _dewExec$b3 = true;
    var implementation = dew$c2();
    var lacksProperEnumerationOrder = function() {
      if (!Object.assign) {
        return false;
      }
      var str = "abcdefghijklmnopqrst";
      var letters = str.split("");
      var map = {};
      for (var i = 0; i < letters.length; ++i) {
        map[letters[i]] = letters[i];
      }
      var obj = Object.assign({}, map);
      var actual = "";
      for (var k in obj) {
        actual += k;
      }
      return str !== actual;
    };
    var assignHasPendingExceptions = function() {
      if (!Object.assign || !Object.preventExtensions) {
        return false;
      }
      var thrower = Object.preventExtensions({
        1: 2
      });
      try {
        Object.assign(thrower, "xy");
      } catch (e) {
        return thrower[1] === "y";
      }
      return false;
    };
    exports$c3 = function getPolyfill() {
      if (!Object.assign) {
        return implementation;
      }
      if (lacksProperEnumerationOrder()) {
        return implementation;
      }
      if (assignHasPendingExceptions()) {
        return implementation;
      }
      return Object.assign;
    };
    return exports$c3;
  }
  var exports$b3 = {};
  var _dewExec$a3 = false;
  function dew$a3() {
    if (_dewExec$a3) return exports$b3;
    _dewExec$a3 = true;
    var numberIsNaN = function(value) {
      return value !== value;
    };
    exports$b3 = function is(a, b) {
      if (a === 0 && b === 0) {
        return 1 / a === 1 / b;
      }
      if (a === b) {
        return true;
      }
      if (numberIsNaN(a) && numberIsNaN(b)) {
        return true;
      }
      return false;
    };
    return exports$b3;
  }
  var exports$a3 = {};
  var _dewExec$93 = false;
  function dew$93() {
    if (_dewExec$93) return exports$a3;
    _dewExec$93 = true;
    var implementation = dew$a3();
    exports$a3 = function getPolyfill() {
      return typeof Object.is === "function" ? Object.is : implementation;
    };
    return exports$a3;
  }
  var exports$93 = {};
  var _dewExec$83 = false;
  function dew$83() {
    if (_dewExec$83) return exports$93;
    _dewExec$83 = true;
    var keys = dew$d2();
    var hasSymbols = typeof Symbol === "function" && typeof Symbol("foo") === "symbol";
    var toStr = Object.prototype.toString;
    var concat = Array.prototype.concat;
    var defineDataProperty = dew$4();
    var isFunction2 = function(fn) {
      return typeof fn === "function" && toStr.call(fn) === "[object Function]";
    };
    var supportsDescriptors = dew$3()();
    var defineProperty = function(object, name, value, predicate) {
      if (name in object) {
        if (predicate === true) {
          if (object[name] === value) {
            return;
          }
        } else if (!isFunction2(predicate) || !predicate()) {
          return;
        }
      }
      if (supportsDescriptors) {
        defineDataProperty(object, name, value, true);
      } else {
        defineDataProperty(object, name, value);
      }
    };
    var defineProperties = function(object, map) {
      var predicates = arguments.length > 2 ? arguments[2] : {};
      var props = keys(map);
      if (hasSymbols) {
        props = concat.call(props, Object.getOwnPropertySymbols(map));
      }
      for (var i = 0; i < props.length; i += 1) {
        defineProperty(object, props[i], map[props[i]], predicates[props[i]]);
      }
    };
    defineProperties.supportsDescriptors = !!supportsDescriptors;
    exports$93 = defineProperties;
    return exports$93;
  }
  var exports$83 = {};
  var _dewExec$73 = false;
  function dew$73() {
    if (_dewExec$73) return exports$83;
    _dewExec$73 = true;
    var getPolyfill = dew$93();
    var define = dew$83();
    exports$83 = function shimObjectIs() {
      var polyfill = getPolyfill();
      define(Object, {
        is: polyfill
      }, {
        is: function testObjectIs() {
          return Object.is !== polyfill;
        }
      });
      return polyfill;
    };
    return exports$83;
  }
  var exports$73 = {};
  var _dewExec$63 = false;
  function dew$63() {
    if (_dewExec$63) return exports$73;
    _dewExec$63 = true;
    var define = dew$83();
    var callBind = dew$12();
    var implementation = dew$a3();
    var getPolyfill = dew$93();
    var shim = dew$73();
    var polyfill = callBind(getPolyfill(), Object);
    define(polyfill, {
      getPolyfill,
      implementation,
      shim
    });
    exports$73 = polyfill;
    return exports$73;
  }
  var exports$63 = {};
  var _dewExec$53 = false;
  function dew$53() {
    if (_dewExec$53) return exports$63;
    _dewExec$53 = true;
    exports$63 = function isNaN2(value) {
      return value !== value;
    };
    return exports$63;
  }
  var exports$53 = {};
  var _dewExec$43 = false;
  function dew$43() {
    if (_dewExec$43) return exports$53;
    _dewExec$43 = true;
    var implementation = dew$53();
    exports$53 = function getPolyfill() {
      if (Number.isNaN && Number.isNaN(NaN) && !Number.isNaN("a")) {
        return Number.isNaN;
      }
      return implementation;
    };
    return exports$53;
  }
  var exports$43 = {};
  var _dewExec$33 = false;
  function dew$33() {
    if (_dewExec$33) return exports$43;
    _dewExec$33 = true;
    var define = dew$83();
    var getPolyfill = dew$43();
    exports$43 = function shimNumberIsNaN() {
      var polyfill = getPolyfill();
      define(Number, {
        isNaN: polyfill
      }, {
        isNaN: function testIsNaN() {
          return Number.isNaN !== polyfill;
        }
      });
      return polyfill;
    };
    return exports$43;
  }
  var exports$33 = {};
  var _dewExec$24 = false;
  function dew$24() {
    if (_dewExec$24) return exports$33;
    _dewExec$24 = true;
    var callBind = dew$12();
    var define = dew$83();
    var implementation = dew$53();
    var getPolyfill = dew$43();
    var shim = dew$33();
    var polyfill = callBind(getPolyfill(), Number);
    define(polyfill, {
      getPolyfill,
      implementation,
      shim
    });
    exports$33 = polyfill;
    return exports$33;
  }
  var exports$24 = {};
  var _dewExec$14 = false;
  function dew$14() {
    if (_dewExec$14) return exports$24;
    _dewExec$14 = true;
    function _slicedToArray(arr, i) {
      return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
    }
    function _nonIterableRest() {
      throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }
    function _unsupportedIterableToArray(o, minLen) {
      if (!o) return;
      if (typeof o === "string") return _arrayLikeToArray(o, minLen);
      var n = Object.prototype.toString.call(o).slice(8, -1);
      if (n === "Object" && o.constructor) n = o.constructor.name;
      if (n === "Map" || n === "Set") return Array.from(o);
      if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
    }
    function _arrayLikeToArray(arr, len) {
      if (len == null || len > arr.length) len = arr.length;
      for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
      return arr2;
    }
    function _iterableToArrayLimit(r, l) {
      var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
      if (null != t) {
        var e, n, i, u, a = [], f = true, o = false;
        try {
          if (i = (t = t.call(r)).next, 0 === l) ;
          else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = true) ;
        } catch (r2) {
          o = true, n = r2;
        } finally {
          try {
            if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return;
          } finally {
            if (o) throw n;
          }
        }
        return a;
      }
    }
    function _arrayWithHoles(arr) {
      if (Array.isArray(arr)) return arr;
    }
    function _typeof(o) {
      "@babel/helpers - typeof";
      return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
        return typeof o2;
      } : function(o2) {
        return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
      }, _typeof(o);
    }
    var regexFlagsSupported = /a/g.flags !== void 0;
    var arrayFromSet = function arrayFromSet2(set) {
      var array = [];
      set.forEach(function(value) {
        return array.push(value);
      });
      return array;
    };
    var arrayFromMap = function arrayFromMap2(map) {
      var array = [];
      map.forEach(function(value, key) {
        return array.push([key, value]);
      });
      return array;
    };
    var objectIs = Object.is ? Object.is : dew$63();
    var objectGetOwnPropertySymbols = Object.getOwnPropertySymbols ? Object.getOwnPropertySymbols : function() {
      return [];
    };
    var numberIsNaN = Number.isNaN ? Number.isNaN : dew$24();
    function uncurryThis(f) {
      return f.call.bind(f);
    }
    var hasOwnProperty = uncurryThis(Object.prototype.hasOwnProperty);
    var propertyIsEnumerable = uncurryThis(Object.prototype.propertyIsEnumerable);
    var objectToString = uncurryThis(Object.prototype.toString);
    var _require$types = exports5.types, isAnyArrayBuffer = _require$types.isAnyArrayBuffer, isArrayBufferView = _require$types.isArrayBufferView, isDate2 = _require$types.isDate, isMap = _require$types.isMap, isRegExp2 = _require$types.isRegExp, isSet = _require$types.isSet, isNativeError = _require$types.isNativeError, isBoxedPrimitive = _require$types.isBoxedPrimitive, isNumberObject = _require$types.isNumberObject, isStringObject = _require$types.isStringObject, isBooleanObject = _require$types.isBooleanObject, isBigIntObject = _require$types.isBigIntObject, isSymbolObject = _require$types.isSymbolObject, isFloat32Array = _require$types.isFloat32Array, isFloat64Array = _require$types.isFloat64Array;
    function isNonIndex(key) {
      if (key.length === 0 || key.length > 10) return true;
      for (var i = 0; i < key.length; i++) {
        var code = key.charCodeAt(i);
        if (code < 48 || code > 57) return true;
      }
      return key.length === 10 && key >= Math.pow(2, 32);
    }
    function getOwnNonIndexProperties(value) {
      return Object.keys(value).filter(isNonIndex).concat(objectGetOwnPropertySymbols(value).filter(Object.prototype.propertyIsEnumerable.bind(value)));
    }
    function compare(a, b) {
      if (a === b) {
        return 0;
      }
      var x = a.length;
      var y = b.length;
      for (var i = 0, len = Math.min(x, y); i < len; ++i) {
        if (a[i] !== b[i]) {
          x = a[i];
          y = b[i];
          break;
        }
      }
      if (x < y) {
        return -1;
      }
      if (y < x) {
        return 1;
      }
      return 0;
    }
    var kStrict = true;
    var kLoose = false;
    var kNoIterator = 0;
    var kIsArray = 1;
    var kIsSet = 2;
    var kIsMap = 3;
    function areSimilarRegExps(a, b) {
      return regexFlagsSupported ? a.source === b.source && a.flags === b.flags : RegExp.prototype.toString.call(a) === RegExp.prototype.toString.call(b);
    }
    function areSimilarFloatArrays(a, b) {
      if (a.byteLength !== b.byteLength) {
        return false;
      }
      for (var offset = 0; offset < a.byteLength; offset++) {
        if (a[offset] !== b[offset]) {
          return false;
        }
      }
      return true;
    }
    function areSimilarTypedArrays(a, b) {
      if (a.byteLength !== b.byteLength) {
        return false;
      }
      return compare(new Uint8Array(a.buffer, a.byteOffset, a.byteLength), new Uint8Array(b.buffer, b.byteOffset, b.byteLength)) === 0;
    }
    function areEqualArrayBuffers(buf1, buf2) {
      return buf1.byteLength === buf2.byteLength && compare(new Uint8Array(buf1), new Uint8Array(buf2)) === 0;
    }
    function isEqualBoxedPrimitive(val1, val2) {
      if (isNumberObject(val1)) {
        return isNumberObject(val2) && objectIs(Number.prototype.valueOf.call(val1), Number.prototype.valueOf.call(val2));
      }
      if (isStringObject(val1)) {
        return isStringObject(val2) && String.prototype.valueOf.call(val1) === String.prototype.valueOf.call(val2);
      }
      if (isBooleanObject(val1)) {
        return isBooleanObject(val2) && Boolean.prototype.valueOf.call(val1) === Boolean.prototype.valueOf.call(val2);
      }
      if (isBigIntObject(val1)) {
        return isBigIntObject(val2) && BigInt.prototype.valueOf.call(val1) === BigInt.prototype.valueOf.call(val2);
      }
      return isSymbolObject(val2) && Symbol.prototype.valueOf.call(val1) === Symbol.prototype.valueOf.call(val2);
    }
    function innerDeepEqual(val1, val2, strict2, memos) {
      if (val1 === val2) {
        if (val1 !== 0) return true;
        return strict2 ? objectIs(val1, val2) : true;
      }
      if (strict2) {
        if (_typeof(val1) !== "object") {
          return typeof val1 === "number" && numberIsNaN(val1) && numberIsNaN(val2);
        }
        if (_typeof(val2) !== "object" || val1 === null || val2 === null) {
          return false;
        }
        if (Object.getPrototypeOf(val1) !== Object.getPrototypeOf(val2)) {
          return false;
        }
      } else {
        if (val1 === null || _typeof(val1) !== "object") {
          if (val2 === null || _typeof(val2) !== "object") {
            return val1 == val2;
          }
          return false;
        }
        if (val2 === null || _typeof(val2) !== "object") {
          return false;
        }
      }
      var val1Tag = objectToString(val1);
      var val2Tag = objectToString(val2);
      if (val1Tag !== val2Tag) {
        return false;
      }
      if (Array.isArray(val1)) {
        if (val1.length !== val2.length) {
          return false;
        }
        var keys1 = getOwnNonIndexProperties(val1);
        var keys2 = getOwnNonIndexProperties(val2);
        if (keys1.length !== keys2.length) {
          return false;
        }
        return keyCheck(val1, val2, strict2, memos, kIsArray, keys1);
      }
      if (val1Tag === "[object Object]") {
        if (!isMap(val1) && isMap(val2) || !isSet(val1) && isSet(val2)) {
          return false;
        }
      }
      if (isDate2(val1)) {
        if (!isDate2(val2) || Date.prototype.getTime.call(val1) !== Date.prototype.getTime.call(val2)) {
          return false;
        }
      } else if (isRegExp2(val1)) {
        if (!isRegExp2(val2) || !areSimilarRegExps(val1, val2)) {
          return false;
        }
      } else if (isNativeError(val1) || val1 instanceof Error) {
        if (val1.message !== val2.message || val1.name !== val2.name) {
          return false;
        }
      } else if (isArrayBufferView(val1)) {
        if (!strict2 && (isFloat32Array(val1) || isFloat64Array(val1))) {
          if (!areSimilarFloatArrays(val1, val2)) {
            return false;
          }
        } else if (!areSimilarTypedArrays(val1, val2)) {
          return false;
        }
        var _keys = getOwnNonIndexProperties(val1);
        var _keys2 = getOwnNonIndexProperties(val2);
        if (_keys.length !== _keys2.length) {
          return false;
        }
        return keyCheck(val1, val2, strict2, memos, kNoIterator, _keys);
      } else if (isSet(val1)) {
        if (!isSet(val2) || val1.size !== val2.size) {
          return false;
        }
        return keyCheck(val1, val2, strict2, memos, kIsSet);
      } else if (isMap(val1)) {
        if (!isMap(val2) || val1.size !== val2.size) {
          return false;
        }
        return keyCheck(val1, val2, strict2, memos, kIsMap);
      } else if (isAnyArrayBuffer(val1)) {
        if (!areEqualArrayBuffers(val1, val2)) {
          return false;
        }
      } else if (isBoxedPrimitive(val1) && !isEqualBoxedPrimitive(val1, val2)) {
        return false;
      }
      return keyCheck(val1, val2, strict2, memos, kNoIterator);
    }
    function getEnumerables(val, keys) {
      return keys.filter(function(k) {
        return propertyIsEnumerable(val, k);
      });
    }
    function keyCheck(val1, val2, strict2, memos, iterationType, aKeys) {
      if (arguments.length === 5) {
        aKeys = Object.keys(val1);
        var bKeys = Object.keys(val2);
        if (aKeys.length !== bKeys.length) {
          return false;
        }
      }
      var i = 0;
      for (; i < aKeys.length; i++) {
        if (!hasOwnProperty(val2, aKeys[i])) {
          return false;
        }
      }
      if (strict2 && arguments.length === 5) {
        var symbolKeysA = objectGetOwnPropertySymbols(val1);
        if (symbolKeysA.length !== 0) {
          var count = 0;
          for (i = 0; i < symbolKeysA.length; i++) {
            var key = symbolKeysA[i];
            if (propertyIsEnumerable(val1, key)) {
              if (!propertyIsEnumerable(val2, key)) {
                return false;
              }
              aKeys.push(key);
              count++;
            } else if (propertyIsEnumerable(val2, key)) {
              return false;
            }
          }
          var symbolKeysB = objectGetOwnPropertySymbols(val2);
          if (symbolKeysA.length !== symbolKeysB.length && getEnumerables(val2, symbolKeysB).length !== count) {
            return false;
          }
        } else {
          var _symbolKeysB = objectGetOwnPropertySymbols(val2);
          if (_symbolKeysB.length !== 0 && getEnumerables(val2, _symbolKeysB).length !== 0) {
            return false;
          }
        }
      }
      if (aKeys.length === 0 && (iterationType === kNoIterator || iterationType === kIsArray && val1.length === 0 || val1.size === 0)) {
        return true;
      }
      if (memos === void 0) {
        memos = {
          val1: /* @__PURE__ */ new Map(),
          val2: /* @__PURE__ */ new Map(),
          position: 0
        };
      } else {
        var val2MemoA = memos.val1.get(val1);
        if (val2MemoA !== void 0) {
          var val2MemoB = memos.val2.get(val2);
          if (val2MemoB !== void 0) {
            return val2MemoA === val2MemoB;
          }
        }
        memos.position++;
      }
      memos.val1.set(val1, memos.position);
      memos.val2.set(val2, memos.position);
      var areEq = objEquiv(val1, val2, strict2, aKeys, memos, iterationType);
      memos.val1.delete(val1);
      memos.val2.delete(val2);
      return areEq;
    }
    function setHasEqualElement(set, val1, strict2, memo) {
      var setValues = arrayFromSet(set);
      for (var i = 0; i < setValues.length; i++) {
        var val2 = setValues[i];
        if (innerDeepEqual(val1, val2, strict2, memo)) {
          set.delete(val2);
          return true;
        }
      }
      return false;
    }
    function findLooseMatchingPrimitives(prim) {
      switch (_typeof(prim)) {
        case "undefined":
          return null;
        case "object":
          return void 0;
        case "symbol":
          return false;
        case "string":
          prim = +prim;
        // Loose equal entries exist only if the string is possible to convert to
        // a regular number and not NaN.
        // Fall through
        case "number":
          if (numberIsNaN(prim)) {
            return false;
          }
      }
      return true;
    }
    function setMightHaveLoosePrim(a, b, prim) {
      var altValue = findLooseMatchingPrimitives(prim);
      if (altValue != null) return altValue;
      return b.has(altValue) && !a.has(altValue);
    }
    function mapMightHaveLoosePrim(a, b, prim, item, memo) {
      var altValue = findLooseMatchingPrimitives(prim);
      if (altValue != null) {
        return altValue;
      }
      var curB = b.get(altValue);
      if (curB === void 0 && !b.has(altValue) || !innerDeepEqual(item, curB, false, memo)) {
        return false;
      }
      return !a.has(altValue) && innerDeepEqual(item, curB, false, memo);
    }
    function setEquiv(a, b, strict2, memo) {
      var set = null;
      var aValues = arrayFromSet(a);
      for (var i = 0; i < aValues.length; i++) {
        var val = aValues[i];
        if (_typeof(val) === "object" && val !== null) {
          if (set === null) {
            set = /* @__PURE__ */ new Set();
          }
          set.add(val);
        } else if (!b.has(val)) {
          if (strict2) return false;
          if (!setMightHaveLoosePrim(a, b, val)) {
            return false;
          }
          if (set === null) {
            set = /* @__PURE__ */ new Set();
          }
          set.add(val);
        }
      }
      if (set !== null) {
        var bValues = arrayFromSet(b);
        for (var _i = 0; _i < bValues.length; _i++) {
          var _val = bValues[_i];
          if (_typeof(_val) === "object" && _val !== null) {
            if (!setHasEqualElement(set, _val, strict2, memo)) return false;
          } else if (!strict2 && !a.has(_val) && !setHasEqualElement(set, _val, strict2, memo)) {
            return false;
          }
        }
        return set.size === 0;
      }
      return true;
    }
    function mapHasEqualEntry(set, map, key1, item1, strict2, memo) {
      var setValues = arrayFromSet(set);
      for (var i = 0; i < setValues.length; i++) {
        var key2 = setValues[i];
        if (innerDeepEqual(key1, key2, strict2, memo) && innerDeepEqual(item1, map.get(key2), strict2, memo)) {
          set.delete(key2);
          return true;
        }
      }
      return false;
    }
    function mapEquiv(a, b, strict2, memo) {
      var set = null;
      var aEntries = arrayFromMap(a);
      for (var i = 0; i < aEntries.length; i++) {
        var _aEntries$i = _slicedToArray(aEntries[i], 2), key = _aEntries$i[0], item1 = _aEntries$i[1];
        if (_typeof(key) === "object" && key !== null) {
          if (set === null) {
            set = /* @__PURE__ */ new Set();
          }
          set.add(key);
        } else {
          var item2 = b.get(key);
          if (item2 === void 0 && !b.has(key) || !innerDeepEqual(item1, item2, strict2, memo)) {
            if (strict2) return false;
            if (!mapMightHaveLoosePrim(a, b, key, item1, memo)) return false;
            if (set === null) {
              set = /* @__PURE__ */ new Set();
            }
            set.add(key);
          }
        }
      }
      if (set !== null) {
        var bEntries = arrayFromMap(b);
        for (var _i2 = 0; _i2 < bEntries.length; _i2++) {
          var _bEntries$_i = _slicedToArray(bEntries[_i2], 2), _key = _bEntries$_i[0], item = _bEntries$_i[1];
          if (_typeof(_key) === "object" && _key !== null) {
            if (!mapHasEqualEntry(set, a, _key, item, strict2, memo)) return false;
          } else if (!strict2 && (!a.has(_key) || !innerDeepEqual(a.get(_key), item, false, memo)) && !mapHasEqualEntry(set, a, _key, item, false, memo)) {
            return false;
          }
        }
        return set.size === 0;
      }
      return true;
    }
    function objEquiv(a, b, strict2, keys, memos, iterationType) {
      var i = 0;
      if (iterationType === kIsSet) {
        if (!setEquiv(a, b, strict2, memos)) {
          return false;
        }
      } else if (iterationType === kIsMap) {
        if (!mapEquiv(a, b, strict2, memos)) {
          return false;
        }
      } else if (iterationType === kIsArray) {
        for (; i < a.length; i++) {
          if (hasOwnProperty(a, i)) {
            if (!hasOwnProperty(b, i) || !innerDeepEqual(a[i], b[i], strict2, memos)) {
              return false;
            }
          } else if (hasOwnProperty(b, i)) {
            return false;
          } else {
            var keysA = Object.keys(a);
            for (; i < keysA.length; i++) {
              var key = keysA[i];
              if (!hasOwnProperty(b, key) || !innerDeepEqual(a[key], b[key], strict2, memos)) {
                return false;
              }
            }
            if (keysA.length !== Object.keys(b).length) {
              return false;
            }
            return true;
          }
        }
      }
      for (i = 0; i < keys.length; i++) {
        var _key2 = keys[i];
        if (!innerDeepEqual(a[_key2], b[_key2], strict2, memos)) {
          return false;
        }
      }
      return true;
    }
    function isDeepEqual(val1, val2) {
      return innerDeepEqual(val1, val2, kLoose);
    }
    function isDeepStrictEqual(val1, val2) {
      return innerDeepEqual(val1, val2, kStrict);
    }
    exports$24 = {
      isDeepEqual,
      isDeepStrictEqual
    };
    return exports$24;
  }
  var exports$14 = {};
  var _dewExec5 = false;
  function dew5() {
    if (_dewExec5) return exports$14;
    _dewExec5 = true;
    var process$1 = process;
    function _typeof(o) {
      "@babel/helpers - typeof";
      return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
        return typeof o2;
      } : function(o2) {
        return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
      }, _typeof(o);
    }
    function _createClass(Constructor, protoProps, staticProps) {
      Object.defineProperty(Constructor, "prototype", {
        writable: false
      });
      return Constructor;
    }
    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }
    var _require = dew$h2(), _require$codes = _require.codes, ERR_AMBIGUOUS_ARGUMENT = _require$codes.ERR_AMBIGUOUS_ARGUMENT, ERR_INVALID_ARG_TYPE = _require$codes.ERR_INVALID_ARG_TYPE, ERR_INVALID_ARG_VALUE = _require$codes.ERR_INVALID_ARG_VALUE, ERR_INVALID_RETURN_VALUE = _require$codes.ERR_INVALID_RETURN_VALUE, ERR_MISSING_ARGS = _require$codes.ERR_MISSING_ARGS;
    var AssertionError3 = dew$g2();
    var _require2 = exports5, inspect2 = _require2.inspect;
    var _require$types = exports5.types, isPromise = _require$types.isPromise, isRegExp2 = _require$types.isRegExp;
    var objectAssign = dew$b3()();
    var objectIs = dew$93()();
    var RegExpPrototypeTest = dew2()("RegExp.prototype.test");
    var isDeepEqual;
    var isDeepStrictEqual;
    function lazyLoadComparison() {
      var comparison = dew$14();
      isDeepEqual = comparison.isDeepEqual;
      isDeepStrictEqual = comparison.isDeepStrictEqual;
    }
    var warned = false;
    var assert2 = exports$14 = ok3;
    var NO_EXCEPTION_SENTINEL = {};
    function innerFail(obj) {
      if (obj.message instanceof Error) throw obj.message;
      throw new AssertionError3(obj);
    }
    function fail3(actual, expected, message, operator, stackStartFn) {
      var argsLen = arguments.length;
      var internalMessage;
      if (argsLen === 0) {
        internalMessage = "Failed";
      } else if (argsLen === 1) {
        message = actual;
        actual = void 0;
      } else {
        if (warned === false) {
          warned = true;
          var warn = process$1.emitWarning ? process$1.emitWarning : console.warn.bind(console);
          warn("assert.fail() with more than one argument is deprecated. Please use assert.strictEqual() instead or only pass a message.", "DeprecationWarning", "DEP0094");
        }
        if (argsLen === 2) operator = "!=";
      }
      if (message instanceof Error) throw message;
      var errArgs = {
        actual,
        expected,
        operator: operator === void 0 ? "fail" : operator,
        stackStartFn: stackStartFn || fail3
      };
      if (message !== void 0) {
        errArgs.message = message;
      }
      var err = new AssertionError3(errArgs);
      if (internalMessage) {
        err.message = internalMessage;
        err.generatedMessage = true;
      }
      throw err;
    }
    assert2.fail = fail3;
    assert2.AssertionError = AssertionError3;
    function innerOk(fn, argLen, value, message) {
      if (!value) {
        var generatedMessage = false;
        if (argLen === 0) {
          generatedMessage = true;
          message = "No value argument passed to `assert.ok()`";
        } else if (message instanceof Error) {
          throw message;
        }
        var err = new AssertionError3({
          actual: value,
          expected: true,
          message,
          operator: "==",
          stackStartFn: fn
        });
        err.generatedMessage = generatedMessage;
        throw err;
      }
    }
    function ok3() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      innerOk.apply(void 0, [ok3, args.length].concat(args));
    }
    assert2.ok = ok3;
    assert2.equal = function equal3(actual, expected, message) {
      if (arguments.length < 2) {
        throw new ERR_MISSING_ARGS("actual", "expected");
      }
      if (actual != expected) {
        innerFail({
          actual,
          expected,
          message,
          operator: "==",
          stackStartFn: equal3
        });
      }
    };
    assert2.notEqual = function notEqual3(actual, expected, message) {
      if (arguments.length < 2) {
        throw new ERR_MISSING_ARGS("actual", "expected");
      }
      if (actual == expected) {
        innerFail({
          actual,
          expected,
          message,
          operator: "!=",
          stackStartFn: notEqual3
        });
      }
    };
    assert2.deepEqual = function deepEqual3(actual, expected, message) {
      if (arguments.length < 2) {
        throw new ERR_MISSING_ARGS("actual", "expected");
      }
      if (isDeepEqual === void 0) lazyLoadComparison();
      if (!isDeepEqual(actual, expected)) {
        innerFail({
          actual,
          expected,
          message,
          operator: "deepEqual",
          stackStartFn: deepEqual3
        });
      }
    };
    assert2.notDeepEqual = function notDeepEqual3(actual, expected, message) {
      if (arguments.length < 2) {
        throw new ERR_MISSING_ARGS("actual", "expected");
      }
      if (isDeepEqual === void 0) lazyLoadComparison();
      if (isDeepEqual(actual, expected)) {
        innerFail({
          actual,
          expected,
          message,
          operator: "notDeepEqual",
          stackStartFn: notDeepEqual3
        });
      }
    };
    assert2.deepStrictEqual = function deepStrictEqual3(actual, expected, message) {
      if (arguments.length < 2) {
        throw new ERR_MISSING_ARGS("actual", "expected");
      }
      if (isDeepEqual === void 0) lazyLoadComparison();
      if (!isDeepStrictEqual(actual, expected)) {
        innerFail({
          actual,
          expected,
          message,
          operator: "deepStrictEqual",
          stackStartFn: deepStrictEqual3
        });
      }
    };
    assert2.notDeepStrictEqual = notDeepStrictEqual3;
    function notDeepStrictEqual3(actual, expected, message) {
      if (arguments.length < 2) {
        throw new ERR_MISSING_ARGS("actual", "expected");
      }
      if (isDeepEqual === void 0) lazyLoadComparison();
      if (isDeepStrictEqual(actual, expected)) {
        innerFail({
          actual,
          expected,
          message,
          operator: "notDeepStrictEqual",
          stackStartFn: notDeepStrictEqual3
        });
      }
    }
    assert2.strictEqual = function strictEqual3(actual, expected, message) {
      if (arguments.length < 2) {
        throw new ERR_MISSING_ARGS("actual", "expected");
      }
      if (!objectIs(actual, expected)) {
        innerFail({
          actual,
          expected,
          message,
          operator: "strictEqual",
          stackStartFn: strictEqual3
        });
      }
    };
    assert2.notStrictEqual = function notStrictEqual3(actual, expected, message) {
      if (arguments.length < 2) {
        throw new ERR_MISSING_ARGS("actual", "expected");
      }
      if (objectIs(actual, expected)) {
        innerFail({
          actual,
          expected,
          message,
          operator: "notStrictEqual",
          stackStartFn: notStrictEqual3
        });
      }
    };
    var Comparison = /* @__PURE__ */ _createClass(function Comparison2(obj, keys, actual) {
      var _this = this;
      _classCallCheck(this, Comparison2);
      keys.forEach(function(key) {
        if (key in obj) {
          if (actual !== void 0 && typeof actual[key] === "string" && isRegExp2(obj[key]) && RegExpPrototypeTest(obj[key], actual[key])) {
            _this[key] = actual[key];
          } else {
            _this[key] = obj[key];
          }
        }
      });
    });
    function compareExceptionKey(actual, expected, key, message, keys, fn) {
      if (!(key in actual) || !isDeepStrictEqual(actual[key], expected[key])) {
        if (!message) {
          var a = new Comparison(actual, keys);
          var b = new Comparison(expected, keys, actual);
          var err = new AssertionError3({
            actual: a,
            expected: b,
            operator: "deepStrictEqual",
            stackStartFn: fn
          });
          err.actual = actual;
          err.expected = expected;
          err.operator = fn.name;
          throw err;
        }
        innerFail({
          actual,
          expected,
          message,
          operator: fn.name,
          stackStartFn: fn
        });
      }
    }
    function expectedException(actual, expected, msg, fn) {
      if (typeof expected !== "function") {
        if (isRegExp2(expected)) return RegExpPrototypeTest(expected, actual);
        if (arguments.length === 2) {
          throw new ERR_INVALID_ARG_TYPE("expected", ["Function", "RegExp"], expected);
        }
        if (_typeof(actual) !== "object" || actual === null) {
          var err = new AssertionError3({
            actual,
            expected,
            message: msg,
            operator: "deepStrictEqual",
            stackStartFn: fn
          });
          err.operator = fn.name;
          throw err;
        }
        var keys = Object.keys(expected);
        if (expected instanceof Error) {
          keys.push("name", "message");
        } else if (keys.length === 0) {
          throw new ERR_INVALID_ARG_VALUE("error", expected, "may not be an empty object");
        }
        if (isDeepEqual === void 0) lazyLoadComparison();
        keys.forEach(function(key) {
          if (typeof actual[key] === "string" && isRegExp2(expected[key]) && RegExpPrototypeTest(expected[key], actual[key])) {
            return;
          }
          compareExceptionKey(actual, expected, key, msg, keys, fn);
        });
        return true;
      }
      if (expected.prototype !== void 0 && actual instanceof expected) {
        return true;
      }
      if (Error.isPrototypeOf(expected)) {
        return false;
      }
      return expected.call({}, actual) === true;
    }
    function getActual(fn) {
      if (typeof fn !== "function") {
        throw new ERR_INVALID_ARG_TYPE("fn", "Function", fn);
      }
      try {
        fn();
      } catch (e) {
        return e;
      }
      return NO_EXCEPTION_SENTINEL;
    }
    function checkIsPromise(obj) {
      return isPromise(obj) || obj !== null && _typeof(obj) === "object" && typeof obj.then === "function" && typeof obj.catch === "function";
    }
    function waitForActual(promiseFn) {
      return Promise.resolve().then(function() {
        var resultPromise;
        if (typeof promiseFn === "function") {
          resultPromise = promiseFn();
          if (!checkIsPromise(resultPromise)) {
            throw new ERR_INVALID_RETURN_VALUE("instance of Promise", "promiseFn", resultPromise);
          }
        } else if (checkIsPromise(promiseFn)) {
          resultPromise = promiseFn;
        } else {
          throw new ERR_INVALID_ARG_TYPE("promiseFn", ["Function", "Promise"], promiseFn);
        }
        return Promise.resolve().then(function() {
          return resultPromise;
        }).then(function() {
          return NO_EXCEPTION_SENTINEL;
        }).catch(function(e) {
          return e;
        });
      });
    }
    function expectsError(stackStartFn, actual, error, message) {
      if (typeof error === "string") {
        if (arguments.length === 4) {
          throw new ERR_INVALID_ARG_TYPE("error", ["Object", "Error", "Function", "RegExp"], error);
        }
        if (_typeof(actual) === "object" && actual !== null) {
          if (actual.message === error) {
            throw new ERR_AMBIGUOUS_ARGUMENT("error/message", 'The error message "'.concat(actual.message, '" is identical to the message.'));
          }
        } else if (actual === error) {
          throw new ERR_AMBIGUOUS_ARGUMENT("error/message", 'The error "'.concat(actual, '" is identical to the message.'));
        }
        message = error;
        error = void 0;
      } else if (error != null && _typeof(error) !== "object" && typeof error !== "function") {
        throw new ERR_INVALID_ARG_TYPE("error", ["Object", "Error", "Function", "RegExp"], error);
      }
      if (actual === NO_EXCEPTION_SENTINEL) {
        var details = "";
        if (error && error.name) {
          details += " (".concat(error.name, ")");
        }
        details += message ? ": ".concat(message) : ".";
        var fnType = stackStartFn.name === "rejects" ? "rejection" : "exception";
        innerFail({
          actual: void 0,
          expected: error,
          operator: stackStartFn.name,
          message: "Missing expected ".concat(fnType).concat(details),
          stackStartFn
        });
      }
      if (error && !expectedException(actual, error, message, stackStartFn)) {
        throw actual;
      }
    }
    function expectsNoError(stackStartFn, actual, error, message) {
      if (actual === NO_EXCEPTION_SENTINEL) return;
      if (typeof error === "string") {
        message = error;
        error = void 0;
      }
      if (!error || expectedException(actual, error)) {
        var details = message ? ": ".concat(message) : ".";
        var fnType = stackStartFn.name === "doesNotReject" ? "rejection" : "exception";
        innerFail({
          actual,
          expected: error,
          operator: stackStartFn.name,
          message: "Got unwanted ".concat(fnType).concat(details, "\n") + 'Actual message: "'.concat(actual && actual.message, '"'),
          stackStartFn
        });
      }
      throw actual;
    }
    assert2.throws = function throws3(promiseFn) {
      for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        args[_key2 - 1] = arguments[_key2];
      }
      expectsError.apply(void 0, [throws3, getActual(promiseFn)].concat(args));
    };
    assert2.rejects = function rejects3(promiseFn) {
      for (var _len3 = arguments.length, args = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
        args[_key3 - 1] = arguments[_key3];
      }
      return waitForActual(promiseFn).then(function(result) {
        return expectsError.apply(void 0, [rejects3, result].concat(args));
      });
    };
    assert2.doesNotThrow = function doesNotThrow3(fn) {
      for (var _len4 = arguments.length, args = new Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
        args[_key4 - 1] = arguments[_key4];
      }
      expectsNoError.apply(void 0, [doesNotThrow3, getActual(fn)].concat(args));
    };
    assert2.doesNotReject = function doesNotReject3(fn) {
      for (var _len5 = arguments.length, args = new Array(_len5 > 1 ? _len5 - 1 : 0), _key5 = 1; _key5 < _len5; _key5++) {
        args[_key5 - 1] = arguments[_key5];
      }
      return waitForActual(fn).then(function(result) {
        return expectsNoError.apply(void 0, [doesNotReject3, result].concat(args));
      });
    };
    assert2.ifError = function ifError3(err) {
      if (err !== null && err !== void 0) {
        var message = "ifError got unwanted exception: ";
        if (_typeof(err) === "object" && typeof err.message === "string") {
          if (err.message.length === 0 && err.constructor) {
            message += err.constructor.name;
          } else {
            message += err.message;
          }
        } else {
          message += inspect2(err);
        }
        var newErr = new AssertionError3({
          actual: err,
          expected: null,
          operator: "ifError",
          message,
          stackStartFn: ifError3
        });
        var origStack = err.stack;
        if (typeof origStack === "string") {
          var tmp2 = origStack.split("\n");
          tmp2.shift();
          var tmp1 = newErr.stack.split("\n");
          for (var i = 0; i < tmp2.length; i++) {
            var pos = tmp1.indexOf(tmp2[i]);
            if (pos !== -1) {
              tmp1 = tmp1.slice(0, pos);
              break;
            }
          }
          newErr.stack = "".concat(tmp1.join("\n"), "\n").concat(tmp2.join("\n"));
        }
        throw newErr;
      }
    };
    function internalMatch(string, regexp, message, fn, fnName) {
      if (!isRegExp2(regexp)) {
        throw new ERR_INVALID_ARG_TYPE("regexp", "RegExp", regexp);
      }
      var match2 = fnName === "match";
      if (typeof string !== "string" || RegExpPrototypeTest(regexp, string) !== match2) {
        if (message instanceof Error) {
          throw message;
        }
        var generatedMessage = !message;
        message = message || (typeof string !== "string" ? 'The "string" argument must be of type string. Received type ' + "".concat(_typeof(string), " (").concat(inspect2(string), ")") : (match2 ? "The input did not match the regular expression " : "The input was expected to not match the regular expression ") + "".concat(inspect2(regexp), ". Input:\n\n").concat(inspect2(string), "\n"));
        var err = new AssertionError3({
          actual: string,
          expected: regexp,
          message,
          operator: fnName,
          stackStartFn: fn
        });
        err.generatedMessage = generatedMessage;
        throw err;
      }
    }
    assert2.match = function match2(string, regexp, message) {
      internalMatch(string, regexp, message, match2, "match");
    };
    assert2.doesNotMatch = function doesNotMatch2(string, regexp, message) {
      internalMatch(string, regexp, message, doesNotMatch2, "doesNotMatch");
    };
    function strict2() {
      for (var _len6 = arguments.length, args = new Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
        args[_key6] = arguments[_key6];
      }
      innerOk.apply(void 0, [strict2, args.length].concat(args));
    }
    assert2.strict = objectAssign(strict2, assert2, {
      equal: assert2.strictEqual,
      deepEqual: assert2.deepStrictEqual,
      notEqual: assert2.notStrictEqual,
      notDeepEqual: assert2.notDeepStrictEqual
    });
    assert2.strict.strict = assert2.strict;
    return exports$14;
  }
  var exports6 = dew5();
  var AssertionError = exports6.AssertionError;
  var deepEqual = exports6.deepEqual;
  var deepStrictEqual = exports6.deepStrictEqual;
  var doesNotReject = exports6.doesNotReject;
  var doesNotThrow = exports6.doesNotThrow;
  var equal = exports6.equal;
  var fail = exports6.fail;
  var ifError = exports6.ifError;
  var notDeepEqual = exports6.notDeepEqual;
  var notDeepStrictEqual = exports6.notDeepStrictEqual;
  var notEqual = exports6.notEqual;
  var notStrictEqual = exports6.notStrictEqual;
  var ok = exports6.ok;
  var rejects = exports6.rejects;
  var strict = exports6.strict;
  var strictEqual = exports6.strictEqual;
  var throws = exports6.throws;

  // node_modules/@jspm/core/nodelibs/browser/assert/strict.js
  var {
    fail: fail2,
    AssertionError: AssertionError2,
    ok: ok2,
    equal: equal2,
    notEqual: notEqual2,
    deepEqual: deepEqual2,
    notDeepEqual: notDeepEqual2,
    deepStrictEqual: deepStrictEqual2,
    notDeepStrictEqual: notDeepStrictEqual2,
    strictEqual: strictEqual2,
    notStrictEqual: notStrictEqual2,
    throws: throws2,
    rejects: rejects2,
    doesNotThrow: doesNotThrow2,
    doesNotReject: doesNotReject2,
    ifError: ifError2,
    match,
    doesNotMatch,
    CallTracker
  } = strict;

  // node_modules/@noble/hashes/esm/hmac.js
  init_dirname();
  init_buffer2();
  init_process2();
  init_utils();
  var HMAC = class extends Hash {
    constructor(hash, _key) {
      super();
      this.finished = false;
      this.destroyed = false;
      ahash(hash);
      const key = toBytes(_key);
      this.iHash = hash.create();
      if (typeof this.iHash.update !== "function")
        throw new Error("Expected instance of class which extends utils.Hash");
      this.blockLen = this.iHash.blockLen;
      this.outputLen = this.iHash.outputLen;
      const blockLen = this.blockLen;
      const pad = new Uint8Array(blockLen);
      pad.set(key.length > blockLen ? hash.create().update(key).digest() : key);
      for (let i = 0; i < pad.length; i++)
        pad[i] ^= 54;
      this.iHash.update(pad);
      this.oHash = hash.create();
      for (let i = 0; i < pad.length; i++)
        pad[i] ^= 54 ^ 92;
      this.oHash.update(pad);
      clean(pad);
    }
    update(buf) {
      aexists(this);
      this.iHash.update(buf);
      return this;
    }
    digestInto(out) {
      aexists(this);
      abytes(out, this.outputLen);
      this.finished = true;
      this.iHash.digestInto(out);
      this.oHash.update(out);
      this.oHash.digestInto(out);
      this.destroy();
    }
    digest() {
      const out = new Uint8Array(this.oHash.outputLen);
      this.digestInto(out);
      return out;
    }
    _cloneInto(to) {
      to || (to = Object.create(Object.getPrototypeOf(this), {}));
      const { oHash, iHash, finished, destroyed, blockLen, outputLen } = this;
      to = to;
      to.finished = finished;
      to.destroyed = destroyed;
      to.blockLen = blockLen;
      to.outputLen = outputLen;
      to.oHash = oHash._cloneInto(to.oHash);
      to.iHash = iHash._cloneInto(to.iHash);
      return to;
    }
    clone() {
      return this._cloneInto();
    }
    destroy() {
      this.destroyed = true;
      this.oHash.destroy();
      this.iHash.destroy();
    }
  };
  var hmac = (hash, key, message) => new HMAC(hash, key).update(message).digest();
  hmac.create = (hash, key) => new HMAC(hash, key);

  // node_modules/@noble/hashes/esm/sha512.js
  init_dirname();
  init_buffer2();
  init_process2();
  init_sha2();
  var sha5122 = sha512;

  // ../recovery-proof/public-discovery.mjs
  var import_bitcoinjs_lib6 = __toESM(require_src2(), 1);
  var import_bs58check2 = __toESM(require_bs58check(), 1);

  // node_modules/@noble/curves/esm/secp256k1.js
  init_dirname();
  init_buffer2();
  init_process2();
  init_sha2();

  // node_modules/@noble/curves/esm/_shortw_utils.js
  init_dirname();
  init_buffer2();
  init_process2();

  // node_modules/@noble/curves/esm/abstract/weierstrass.js
  init_dirname();
  init_buffer2();
  init_process2();
  init_utils();

  // node_modules/@noble/curves/esm/utils.js
  init_dirname();
  init_buffer2();
  init_process2();
  init_utils();
  init_utils();
  var _0n = /* @__PURE__ */ BigInt(0);
  var _1n = /* @__PURE__ */ BigInt(1);
  function _abool2(value, title2 = "") {
    if (typeof value !== "boolean") {
      const prefix = title2 && `"${title2}"`;
      throw new Error(prefix + "expected boolean, got type=" + typeof value);
    }
    return value;
  }
  function _abytes2(value, length, title2 = "") {
    const bytes = isBytes(value);
    const len = value?.length;
    const needsLen = length !== void 0;
    if (!bytes || needsLen && len !== length) {
      const prefix = title2 && `"${title2}" `;
      const ofLen = needsLen ? ` of length ${length}` : "";
      const got = bytes ? `length=${len}` : `type=${typeof value}`;
      throw new Error(prefix + "expected Uint8Array" + ofLen + ", got " + got);
    }
    return value;
  }
  function numberToHexUnpadded(num) {
    const hex = num.toString(16);
    return hex.length & 1 ? "0" + hex : hex;
  }
  function hexToNumber(hex) {
    if (typeof hex !== "string")
      throw new Error("hex string expected, got " + typeof hex);
    return hex === "" ? _0n : BigInt("0x" + hex);
  }
  function bytesToNumberBE(bytes) {
    return hexToNumber(bytesToHex(bytes));
  }
  function bytesToNumberLE(bytes) {
    abytes(bytes);
    return hexToNumber(bytesToHex(Uint8Array.from(bytes).reverse()));
  }
  function numberToBytesBE(n, len) {
    return hexToBytes(n.toString(16).padStart(len * 2, "0"));
  }
  function numberToBytesLE(n, len) {
    return numberToBytesBE(n, len).reverse();
  }
  function ensureBytes(title2, hex, expectedLength) {
    let res;
    if (typeof hex === "string") {
      try {
        res = hexToBytes(hex);
      } catch (e) {
        throw new Error(title2 + " must be hex string or Uint8Array, cause: " + e);
      }
    } else if (isBytes(hex)) {
      res = Uint8Array.from(hex);
    } else {
      throw new Error(title2 + " must be hex string or Uint8Array");
    }
    const len = res.length;
    if (typeof expectedLength === "number" && len !== expectedLength)
      throw new Error(title2 + " of length " + expectedLength + " expected, got " + len);
    return res;
  }
  var isPosBig = (n) => typeof n === "bigint" && _0n <= n;
  function inRange(n, min, max) {
    return isPosBig(n) && isPosBig(min) && isPosBig(max) && min <= n && n < max;
  }
  function aInRange(title2, n, min, max) {
    if (!inRange(n, min, max))
      throw new Error("expected valid " + title2 + ": " + min + " <= n < " + max + ", got " + n);
  }
  function bitLen(n) {
    let len;
    for (len = 0; n > _0n; n >>= _1n, len += 1)
      ;
    return len;
  }
  var bitMask = (n) => (_1n << BigInt(n)) - _1n;
  function createHmacDrbg(hashLen, qByteLen, hmacFn) {
    if (typeof hashLen !== "number" || hashLen < 2)
      throw new Error("hashLen must be a number");
    if (typeof qByteLen !== "number" || qByteLen < 2)
      throw new Error("qByteLen must be a number");
    if (typeof hmacFn !== "function")
      throw new Error("hmacFn must be a function");
    const u8n = (len) => new Uint8Array(len);
    const u8of = (byte) => Uint8Array.of(byte);
    let v = u8n(hashLen);
    let k = u8n(hashLen);
    let i = 0;
    const reset = () => {
      v.fill(1);
      k.fill(0);
      i = 0;
    };
    const h = (...b) => hmacFn(k, v, ...b);
    const reseed = (seed = u8n(0)) => {
      k = h(u8of(0), seed);
      v = h();
      if (seed.length === 0)
        return;
      k = h(u8of(1), seed);
      v = h();
    };
    const gen = () => {
      if (i++ >= 1e3)
        throw new Error("drbg: tried 1000 values");
      let len = 0;
      const out = [];
      while (len < qByteLen) {
        v = h();
        const sl = v.slice();
        out.push(sl);
        len += v.length;
      }
      return concatBytes(...out);
    };
    const genUntil = (seed, pred) => {
      reset();
      reseed(seed);
      let res = void 0;
      while (!(res = pred(gen())))
        reseed();
      reset();
      return res;
    };
    return genUntil;
  }
  function _validateObject(object, fields, optFields = {}) {
    if (!object || typeof object !== "object")
      throw new Error("expected valid options object");
    function checkField(fieldName, expectedType, isOpt) {
      const val = object[fieldName];
      if (isOpt && val === void 0)
        return;
      const current = typeof val;
      if (current !== expectedType || val === null)
        throw new Error(`param "${fieldName}" is invalid: expected ${expectedType}, got ${current}`);
    }
    Object.entries(fields).forEach(([k, v]) => checkField(k, v, false));
    Object.entries(optFields).forEach(([k, v]) => checkField(k, v, true));
  }
  function memoized(fn) {
    const map = /* @__PURE__ */ new WeakMap();
    return (arg, ...args) => {
      const val = map.get(arg);
      if (val !== void 0)
        return val;
      const computed = fn(arg, ...args);
      map.set(arg, computed);
      return computed;
    };
  }

  // node_modules/@noble/curves/esm/abstract/curve.js
  init_dirname();
  init_buffer2();
  init_process2();

  // node_modules/@noble/curves/esm/abstract/modular.js
  init_dirname();
  init_buffer2();
  init_process2();
  var _0n2 = BigInt(0);
  var _1n2 = BigInt(1);
  var _2n = /* @__PURE__ */ BigInt(2);
  var _3n = /* @__PURE__ */ BigInt(3);
  var _4n = /* @__PURE__ */ BigInt(4);
  var _5n = /* @__PURE__ */ BigInt(5);
  var _7n = /* @__PURE__ */ BigInt(7);
  var _8n = /* @__PURE__ */ BigInt(8);
  var _9n = /* @__PURE__ */ BigInt(9);
  var _16n = /* @__PURE__ */ BigInt(16);
  function mod(a, b) {
    const result = a % b;
    return result >= _0n2 ? result : b + result;
  }
  function pow2(x, power, modulo) {
    let res = x;
    while (power-- > _0n2) {
      res *= res;
      res %= modulo;
    }
    return res;
  }
  function invert(number, modulo) {
    if (number === _0n2)
      throw new Error("invert: expected non-zero number");
    if (modulo <= _0n2)
      throw new Error("invert: expected positive modulus, got " + modulo);
    let a = mod(number, modulo);
    let b = modulo;
    let x = _0n2, y = _1n2, u = _1n2, v = _0n2;
    while (a !== _0n2) {
      const q = b / a;
      const r = b % a;
      const m = x - u * q;
      const n = y - v * q;
      b = a, a = r, x = u, y = v, u = m, v = n;
    }
    const gcd = b;
    if (gcd !== _1n2)
      throw new Error("invert: does not exist");
    return mod(x, modulo);
  }
  function assertIsSquare(Fp, root, n) {
    if (!Fp.eql(Fp.sqr(root), n))
      throw new Error("Cannot find square root");
  }
  function sqrt3mod4(Fp, n) {
    const p1div4 = (Fp.ORDER + _1n2) / _4n;
    const root = Fp.pow(n, p1div4);
    assertIsSquare(Fp, root, n);
    return root;
  }
  function sqrt5mod8(Fp, n) {
    const p5div8 = (Fp.ORDER - _5n) / _8n;
    const n2 = Fp.mul(n, _2n);
    const v = Fp.pow(n2, p5div8);
    const nv = Fp.mul(n, v);
    const i = Fp.mul(Fp.mul(nv, _2n), v);
    const root = Fp.mul(nv, Fp.sub(i, Fp.ONE));
    assertIsSquare(Fp, root, n);
    return root;
  }
  function sqrt9mod16(P) {
    const Fp_ = Field(P);
    const tn = tonelliShanks(P);
    const c1 = tn(Fp_, Fp_.neg(Fp_.ONE));
    const c2 = tn(Fp_, c1);
    const c3 = tn(Fp_, Fp_.neg(c1));
    const c4 = (P + _7n) / _16n;
    return (Fp, n) => {
      let tv1 = Fp.pow(n, c4);
      let tv2 = Fp.mul(tv1, c1);
      const tv3 = Fp.mul(tv1, c2);
      const tv4 = Fp.mul(tv1, c3);
      const e1 = Fp.eql(Fp.sqr(tv2), n);
      const e2 = Fp.eql(Fp.sqr(tv3), n);
      tv1 = Fp.cmov(tv1, tv2, e1);
      tv2 = Fp.cmov(tv4, tv3, e2);
      const e3 = Fp.eql(Fp.sqr(tv2), n);
      const root = Fp.cmov(tv1, tv2, e3);
      assertIsSquare(Fp, root, n);
      return root;
    };
  }
  function tonelliShanks(P) {
    if (P < _3n)
      throw new Error("sqrt is not defined for small field");
    let Q = P - _1n2;
    let S = 0;
    while (Q % _2n === _0n2) {
      Q /= _2n;
      S++;
    }
    let Z = _2n;
    const _Fp = Field(P);
    while (FpLegendre(_Fp, Z) === 1) {
      if (Z++ > 1e3)
        throw new Error("Cannot find square root: probably non-prime P");
    }
    if (S === 1)
      return sqrt3mod4;
    let cc = _Fp.pow(Z, Q);
    const Q1div2 = (Q + _1n2) / _2n;
    return function tonelliSlow(Fp, n) {
      if (Fp.is0(n))
        return n;
      if (FpLegendre(Fp, n) !== 1)
        throw new Error("Cannot find square root");
      let M = S;
      let c = Fp.mul(Fp.ONE, cc);
      let t = Fp.pow(n, Q);
      let R = Fp.pow(n, Q1div2);
      while (!Fp.eql(t, Fp.ONE)) {
        if (Fp.is0(t))
          return Fp.ZERO;
        let i = 1;
        let t_tmp = Fp.sqr(t);
        while (!Fp.eql(t_tmp, Fp.ONE)) {
          i++;
          t_tmp = Fp.sqr(t_tmp);
          if (i === M)
            throw new Error("Cannot find square root");
        }
        const exponent = _1n2 << BigInt(M - i - 1);
        const b = Fp.pow(c, exponent);
        M = i;
        c = Fp.sqr(b);
        t = Fp.mul(t, c);
        R = Fp.mul(R, b);
      }
      return R;
    };
  }
  function FpSqrt(P) {
    if (P % _4n === _3n)
      return sqrt3mod4;
    if (P % _8n === _5n)
      return sqrt5mod8;
    if (P % _16n === _9n)
      return sqrt9mod16(P);
    return tonelliShanks(P);
  }
  var FIELD_FIELDS = [
    "create",
    "isValid",
    "is0",
    "neg",
    "inv",
    "sqrt",
    "sqr",
    "eql",
    "add",
    "sub",
    "mul",
    "pow",
    "div",
    "addN",
    "subN",
    "mulN",
    "sqrN"
  ];
  function validateField(field) {
    const initial = {
      ORDER: "bigint",
      MASK: "bigint",
      BYTES: "number",
      BITS: "number"
    };
    const opts = FIELD_FIELDS.reduce((map, val) => {
      map[val] = "function";
      return map;
    }, initial);
    _validateObject(field, opts);
    return field;
  }
  function FpPow(Fp, num, power) {
    if (power < _0n2)
      throw new Error("invalid exponent, negatives unsupported");
    if (power === _0n2)
      return Fp.ONE;
    if (power === _1n2)
      return num;
    let p = Fp.ONE;
    let d = num;
    while (power > _0n2) {
      if (power & _1n2)
        p = Fp.mul(p, d);
      d = Fp.sqr(d);
      power >>= _1n2;
    }
    return p;
  }
  function FpInvertBatch(Fp, nums, passZero = false) {
    const inverted = new Array(nums.length).fill(passZero ? Fp.ZERO : void 0);
    const multipliedAcc = nums.reduce((acc, num, i) => {
      if (Fp.is0(num))
        return acc;
      inverted[i] = acc;
      return Fp.mul(acc, num);
    }, Fp.ONE);
    const invertedAcc = Fp.inv(multipliedAcc);
    nums.reduceRight((acc, num, i) => {
      if (Fp.is0(num))
        return acc;
      inverted[i] = Fp.mul(acc, inverted[i]);
      return Fp.mul(acc, num);
    }, invertedAcc);
    return inverted;
  }
  function FpLegendre(Fp, n) {
    const p1mod2 = (Fp.ORDER - _1n2) / _2n;
    const powered = Fp.pow(n, p1mod2);
    const yes = Fp.eql(powered, Fp.ONE);
    const zero = Fp.eql(powered, Fp.ZERO);
    const no = Fp.eql(powered, Fp.neg(Fp.ONE));
    if (!yes && !zero && !no)
      throw new Error("invalid Legendre symbol result");
    return yes ? 1 : zero ? 0 : -1;
  }
  function nLength(n, nBitLength) {
    if (nBitLength !== void 0)
      anumber(nBitLength);
    const _nBitLength = nBitLength !== void 0 ? nBitLength : n.toString(2).length;
    const nByteLength = Math.ceil(_nBitLength / 8);
    return { nBitLength: _nBitLength, nByteLength };
  }
  function Field(ORDER, bitLenOrOpts, isLE = false, opts = {}) {
    if (ORDER <= _0n2)
      throw new Error("invalid field: expected ORDER > 0, got " + ORDER);
    let _nbitLength = void 0;
    let _sqrt = void 0;
    let modFromBytes = false;
    let allowedLengths = void 0;
    if (typeof bitLenOrOpts === "object" && bitLenOrOpts != null) {
      if (opts.sqrt || isLE)
        throw new Error("cannot specify opts in two arguments");
      const _opts = bitLenOrOpts;
      if (_opts.BITS)
        _nbitLength = _opts.BITS;
      if (_opts.sqrt)
        _sqrt = _opts.sqrt;
      if (typeof _opts.isLE === "boolean")
        isLE = _opts.isLE;
      if (typeof _opts.modFromBytes === "boolean")
        modFromBytes = _opts.modFromBytes;
      allowedLengths = _opts.allowedLengths;
    } else {
      if (typeof bitLenOrOpts === "number")
        _nbitLength = bitLenOrOpts;
      if (opts.sqrt)
        _sqrt = opts.sqrt;
    }
    const { nBitLength: BITS, nByteLength: BYTES } = nLength(ORDER, _nbitLength);
    if (BYTES > 2048)
      throw new Error("invalid field: expected ORDER of <= 2048 bytes");
    let sqrtP;
    const f = Object.freeze({
      ORDER,
      isLE,
      BITS,
      BYTES,
      MASK: bitMask(BITS),
      ZERO: _0n2,
      ONE: _1n2,
      allowedLengths,
      create: (num) => mod(num, ORDER),
      isValid: (num) => {
        if (typeof num !== "bigint")
          throw new Error("invalid field element: expected bigint, got " + typeof num);
        return _0n2 <= num && num < ORDER;
      },
      is0: (num) => num === _0n2,
      // is valid and invertible
      isValidNot0: (num) => !f.is0(num) && f.isValid(num),
      isOdd: (num) => (num & _1n2) === _1n2,
      neg: (num) => mod(-num, ORDER),
      eql: (lhs, rhs) => lhs === rhs,
      sqr: (num) => mod(num * num, ORDER),
      add: (lhs, rhs) => mod(lhs + rhs, ORDER),
      sub: (lhs, rhs) => mod(lhs - rhs, ORDER),
      mul: (lhs, rhs) => mod(lhs * rhs, ORDER),
      pow: (num, power) => FpPow(f, num, power),
      div: (lhs, rhs) => mod(lhs * invert(rhs, ORDER), ORDER),
      // Same as above, but doesn't normalize
      sqrN: (num) => num * num,
      addN: (lhs, rhs) => lhs + rhs,
      subN: (lhs, rhs) => lhs - rhs,
      mulN: (lhs, rhs) => lhs * rhs,
      inv: (num) => invert(num, ORDER),
      sqrt: _sqrt || ((n) => {
        if (!sqrtP)
          sqrtP = FpSqrt(ORDER);
        return sqrtP(f, n);
      }),
      toBytes: (num) => isLE ? numberToBytesLE(num, BYTES) : numberToBytesBE(num, BYTES),
      fromBytes: (bytes, skipValidation = true) => {
        if (allowedLengths) {
          if (!allowedLengths.includes(bytes.length) || bytes.length > BYTES) {
            throw new Error("Field.fromBytes: expected " + allowedLengths + " bytes, got " + bytes.length);
          }
          const padded = new Uint8Array(BYTES);
          padded.set(bytes, isLE ? 0 : padded.length - bytes.length);
          bytes = padded;
        }
        if (bytes.length !== BYTES)
          throw new Error("Field.fromBytes: expected " + BYTES + " bytes, got " + bytes.length);
        let scalar = isLE ? bytesToNumberLE(bytes) : bytesToNumberBE(bytes);
        if (modFromBytes)
          scalar = mod(scalar, ORDER);
        if (!skipValidation) {
          if (!f.isValid(scalar))
            throw new Error("invalid field element: outside of range 0..ORDER");
        }
        return scalar;
      },
      // TODO: we don't need it here, move out to separate fn
      invertBatch: (lst) => FpInvertBatch(f, lst),
      // We can't move this out because Fp6, Fp12 implement it
      // and it's unclear what to return in there.
      cmov: (a, b, c) => c ? b : a
    });
    return Object.freeze(f);
  }
  function getFieldBytesLength(fieldOrder) {
    if (typeof fieldOrder !== "bigint")
      throw new Error("field order must be bigint");
    const bitLength = fieldOrder.toString(2).length;
    return Math.ceil(bitLength / 8);
  }
  function getMinHashLength(fieldOrder) {
    const length = getFieldBytesLength(fieldOrder);
    return length + Math.ceil(length / 2);
  }
  function mapHashToField(key, fieldOrder, isLE = false) {
    const len = key.length;
    const fieldLen = getFieldBytesLength(fieldOrder);
    const minLen = getMinHashLength(fieldOrder);
    if (len < 16 || len < minLen || len > 1024)
      throw new Error("expected " + minLen + "-1024 bytes of input, got " + len);
    const num = isLE ? bytesToNumberLE(key) : bytesToNumberBE(key);
    const reduced = mod(num, fieldOrder - _1n2) + _1n2;
    return isLE ? numberToBytesLE(reduced, fieldLen) : numberToBytesBE(reduced, fieldLen);
  }

  // node_modules/@noble/curves/esm/abstract/curve.js
  var _0n3 = BigInt(0);
  var _1n3 = BigInt(1);
  function negateCt(condition, item) {
    const neg = item.negate();
    return condition ? neg : item;
  }
  function normalizeZ(c, points) {
    const invertedZs = FpInvertBatch(c.Fp, points.map((p) => p.Z));
    return points.map((p, i) => c.fromAffine(p.toAffine(invertedZs[i])));
  }
  function validateW(W, bits) {
    if (!Number.isSafeInteger(W) || W <= 0 || W > bits)
      throw new Error("invalid window size, expected [1.." + bits + "], got W=" + W);
  }
  function calcWOpts(W, scalarBits) {
    validateW(W, scalarBits);
    const windows = Math.ceil(scalarBits / W) + 1;
    const windowSize = 2 ** (W - 1);
    const maxNumber = 2 ** W;
    const mask = bitMask(W);
    const shiftBy = BigInt(W);
    return { windows, windowSize, mask, maxNumber, shiftBy };
  }
  function calcOffsets(n, window2, wOpts) {
    const { windowSize, mask, maxNumber, shiftBy } = wOpts;
    let wbits = Number(n & mask);
    let nextN = n >> shiftBy;
    if (wbits > windowSize) {
      wbits -= maxNumber;
      nextN += _1n3;
    }
    const offsetStart = window2 * windowSize;
    const offset = offsetStart + Math.abs(wbits) - 1;
    const isZero = wbits === 0;
    const isNeg = wbits < 0;
    const isNegF = window2 % 2 !== 0;
    const offsetF = offsetStart;
    return { nextN, offset, isZero, isNeg, isNegF, offsetF };
  }
  function validateMSMPoints(points, c) {
    if (!Array.isArray(points))
      throw new Error("array expected");
    points.forEach((p, i) => {
      if (!(p instanceof c))
        throw new Error("invalid point at index " + i);
    });
  }
  function validateMSMScalars(scalars, field) {
    if (!Array.isArray(scalars))
      throw new Error("array of scalars expected");
    scalars.forEach((s, i) => {
      if (!field.isValid(s))
        throw new Error("invalid scalar at index " + i);
    });
  }
  var pointPrecomputes = /* @__PURE__ */ new WeakMap();
  var pointWindowSizes = /* @__PURE__ */ new WeakMap();
  function getW(P) {
    return pointWindowSizes.get(P) || 1;
  }
  function assert0(n) {
    if (n !== _0n3)
      throw new Error("invalid wNAF");
  }
  var wNAF = class {
    // Parametrized with a given Point class (not individual point)
    constructor(Point, bits) {
      this.BASE = Point.BASE;
      this.ZERO = Point.ZERO;
      this.Fn = Point.Fn;
      this.bits = bits;
    }
    // non-const time multiplication ladder
    _unsafeLadder(elm, n, p = this.ZERO) {
      let d = elm;
      while (n > _0n3) {
        if (n & _1n3)
          p = p.add(d);
        d = d.double();
        n >>= _1n3;
      }
      return p;
    }
    /**
     * Creates a wNAF precomputation window. Used for caching.
     * Default window size is set by `utils.precompute()` and is equal to 8.
     * Number of precomputed points depends on the curve size:
     * 2^(𝑊−1) * (Math.ceil(𝑛 / 𝑊) + 1), where:
     * - 𝑊 is the window size
     * - 𝑛 is the bitlength of the curve order.
     * For a 256-bit curve and window size 8, the number of precomputed points is 128 * 33 = 4224.
     * @param point Point instance
     * @param W window size
     * @returns precomputed point tables flattened to a single array
     */
    precomputeWindow(point, W) {
      const { windows, windowSize } = calcWOpts(W, this.bits);
      const points = [];
      let p = point;
      let base = p;
      for (let window2 = 0; window2 < windows; window2++) {
        base = p;
        points.push(base);
        for (let i = 1; i < windowSize; i++) {
          base = base.add(p);
          points.push(base);
        }
        p = base.double();
      }
      return points;
    }
    /**
     * Implements ec multiplication using precomputed tables and w-ary non-adjacent form.
     * More compact implementation:
     * https://github.com/paulmillr/noble-secp256k1/blob/47cb1669b6e506ad66b35fe7d76132ae97465da2/index.ts#L502-L541
     * @returns real and fake (for const-time) points
     */
    wNAF(W, precomputes, n) {
      if (!this.Fn.isValid(n))
        throw new Error("invalid scalar");
      let p = this.ZERO;
      let f = this.BASE;
      const wo = calcWOpts(W, this.bits);
      for (let window2 = 0; window2 < wo.windows; window2++) {
        const { nextN, offset, isZero, isNeg, isNegF, offsetF } = calcOffsets(n, window2, wo);
        n = nextN;
        if (isZero) {
          f = f.add(negateCt(isNegF, precomputes[offsetF]));
        } else {
          p = p.add(negateCt(isNeg, precomputes[offset]));
        }
      }
      assert0(n);
      return { p, f };
    }
    /**
     * Implements ec unsafe (non const-time) multiplication using precomputed tables and w-ary non-adjacent form.
     * @param acc accumulator point to add result of multiplication
     * @returns point
     */
    wNAFUnsafe(W, precomputes, n, acc = this.ZERO) {
      const wo = calcWOpts(W, this.bits);
      for (let window2 = 0; window2 < wo.windows; window2++) {
        if (n === _0n3)
          break;
        const { nextN, offset, isZero, isNeg } = calcOffsets(n, window2, wo);
        n = nextN;
        if (isZero) {
          continue;
        } else {
          const item = precomputes[offset];
          acc = acc.add(isNeg ? item.negate() : item);
        }
      }
      assert0(n);
      return acc;
    }
    getPrecomputes(W, point, transform) {
      let comp = pointPrecomputes.get(point);
      if (!comp) {
        comp = this.precomputeWindow(point, W);
        if (W !== 1) {
          if (typeof transform === "function")
            comp = transform(comp);
          pointPrecomputes.set(point, comp);
        }
      }
      return comp;
    }
    cached(point, scalar, transform) {
      const W = getW(point);
      return this.wNAF(W, this.getPrecomputes(W, point, transform), scalar);
    }
    unsafe(point, scalar, transform, prev) {
      const W = getW(point);
      if (W === 1)
        return this._unsafeLadder(point, scalar, prev);
      return this.wNAFUnsafe(W, this.getPrecomputes(W, point, transform), scalar, prev);
    }
    // We calculate precomputes for elliptic curve point multiplication
    // using windowed method. This specifies window size and
    // stores precomputed values. Usually only base point would be precomputed.
    createCache(P, W) {
      validateW(W, this.bits);
      pointWindowSizes.set(P, W);
      pointPrecomputes.delete(P);
    }
    hasCache(elm) {
      return getW(elm) !== 1;
    }
  };
  function mulEndoUnsafe(Point, point, k1, k2) {
    let acc = point;
    let p1 = Point.ZERO;
    let p2 = Point.ZERO;
    while (k1 > _0n3 || k2 > _0n3) {
      if (k1 & _1n3)
        p1 = p1.add(acc);
      if (k2 & _1n3)
        p2 = p2.add(acc);
      acc = acc.double();
      k1 >>= _1n3;
      k2 >>= _1n3;
    }
    return { p1, p2 };
  }
  function pippenger(c, fieldN, points, scalars) {
    validateMSMPoints(points, c);
    validateMSMScalars(scalars, fieldN);
    const plength = points.length;
    const slength = scalars.length;
    if (plength !== slength)
      throw new Error("arrays of points and scalars must have equal length");
    const zero = c.ZERO;
    const wbits = bitLen(BigInt(plength));
    let windowSize = 1;
    if (wbits > 12)
      windowSize = wbits - 3;
    else if (wbits > 4)
      windowSize = wbits - 2;
    else if (wbits > 0)
      windowSize = 2;
    const MASK = bitMask(windowSize);
    const buckets = new Array(Number(MASK) + 1).fill(zero);
    const lastBits = Math.floor((fieldN.BITS - 1) / windowSize) * windowSize;
    let sum = zero;
    for (let i = lastBits; i >= 0; i -= windowSize) {
      buckets.fill(zero);
      for (let j = 0; j < slength; j++) {
        const scalar = scalars[j];
        const wbits2 = Number(scalar >> BigInt(i) & MASK);
        buckets[wbits2] = buckets[wbits2].add(points[j]);
      }
      let resI = zero;
      for (let j = buckets.length - 1, sumI = zero; j > 0; j--) {
        sumI = sumI.add(buckets[j]);
        resI = resI.add(sumI);
      }
      sum = sum.add(resI);
      if (i !== 0)
        for (let j = 0; j < windowSize; j++)
          sum = sum.double();
    }
    return sum;
  }
  function createField(order, field, isLE) {
    if (field) {
      if (field.ORDER !== order)
        throw new Error("Field.ORDER must match order: Fp == p, Fn == n");
      validateField(field);
      return field;
    } else {
      return Field(order, { isLE });
    }
  }
  function _createCurveFields(type, CURVE, curveOpts = {}, FpFnLE) {
    if (FpFnLE === void 0)
      FpFnLE = type === "edwards";
    if (!CURVE || typeof CURVE !== "object")
      throw new Error(`expected valid ${type} CURVE object`);
    for (const p of ["p", "n", "h"]) {
      const val = CURVE[p];
      if (!(typeof val === "bigint" && val > _0n3))
        throw new Error(`CURVE.${p} must be positive bigint`);
    }
    const Fp = createField(CURVE.p, curveOpts.Fp, FpFnLE);
    const Fn = createField(CURVE.n, curveOpts.Fn, FpFnLE);
    const _b = type === "weierstrass" ? "b" : "d";
    const params = ["Gx", "Gy", "a", _b];
    for (const p of params) {
      if (!Fp.isValid(CURVE[p]))
        throw new Error(`CURVE.${p} must be valid field element of CURVE.Fp`);
    }
    CURVE = Object.freeze(Object.assign({}, CURVE));
    return { CURVE, Fp, Fn };
  }

  // node_modules/@noble/curves/esm/abstract/weierstrass.js
  var divNearest = (num, den) => (num + (num >= 0 ? den : -den) / _2n2) / den;
  function _splitEndoScalar(k, basis, n) {
    const [[a1, b1], [a2, b2]] = basis;
    const c1 = divNearest(b2 * k, n);
    const c2 = divNearest(-b1 * k, n);
    let k1 = k - c1 * a1 - c2 * a2;
    let k2 = -c1 * b1 - c2 * b2;
    const k1neg = k1 < _0n4;
    const k2neg = k2 < _0n4;
    if (k1neg)
      k1 = -k1;
    if (k2neg)
      k2 = -k2;
    const MAX_NUM = bitMask(Math.ceil(bitLen(n) / 2)) + _1n4;
    if (k1 < _0n4 || k1 >= MAX_NUM || k2 < _0n4 || k2 >= MAX_NUM) {
      throw new Error("splitScalar (endomorphism): failed, k=" + k);
    }
    return { k1neg, k1, k2neg, k2 };
  }
  function validateSigFormat(format2) {
    if (!["compact", "recovered", "der"].includes(format2))
      throw new Error('Signature format must be "compact", "recovered", or "der"');
    return format2;
  }
  function validateSigOpts(opts, def) {
    const optsn = {};
    for (let optName of Object.keys(def)) {
      optsn[optName] = opts[optName] === void 0 ? def[optName] : opts[optName];
    }
    _abool2(optsn.lowS, "lowS");
    _abool2(optsn.prehash, "prehash");
    if (optsn.format !== void 0)
      validateSigFormat(optsn.format);
    return optsn;
  }
  var DERErr = class extends Error {
    constructor(m = "") {
      super(m);
    }
  };
  var DER = {
    // asn.1 DER encoding utils
    Err: DERErr,
    // Basic building block is TLV (Tag-Length-Value)
    _tlv: {
      encode: (tag, data) => {
        const { Err: E } = DER;
        if (tag < 0 || tag > 256)
          throw new E("tlv.encode: wrong tag");
        if (data.length & 1)
          throw new E("tlv.encode: unpadded data");
        const dataLen = data.length / 2;
        const len = numberToHexUnpadded(dataLen);
        if (len.length / 2 & 128)
          throw new E("tlv.encode: long form length too big");
        const lenLen = dataLen > 127 ? numberToHexUnpadded(len.length / 2 | 128) : "";
        const t = numberToHexUnpadded(tag);
        return t + lenLen + len + data;
      },
      // v - value, l - left bytes (unparsed)
      decode(tag, data) {
        const { Err: E } = DER;
        let pos = 0;
        if (tag < 0 || tag > 256)
          throw new E("tlv.encode: wrong tag");
        if (data.length < 2 || data[pos++] !== tag)
          throw new E("tlv.decode: wrong tlv");
        const first = data[pos++];
        const isLong = !!(first & 128);
        let length = 0;
        if (!isLong)
          length = first;
        else {
          const lenLen = first & 127;
          if (!lenLen)
            throw new E("tlv.decode(long): indefinite length not supported");
          if (lenLen > 4)
            throw new E("tlv.decode(long): byte length is too big");
          const lengthBytes = data.subarray(pos, pos + lenLen);
          if (lengthBytes.length !== lenLen)
            throw new E("tlv.decode: length bytes not complete");
          if (lengthBytes[0] === 0)
            throw new E("tlv.decode(long): zero leftmost byte");
          for (const b of lengthBytes)
            length = length << 8 | b;
          pos += lenLen;
          if (length < 128)
            throw new E("tlv.decode(long): not minimal encoding");
        }
        const v = data.subarray(pos, pos + length);
        if (v.length !== length)
          throw new E("tlv.decode: wrong value length");
        return { v, l: data.subarray(pos + length) };
      }
    },
    // https://crypto.stackexchange.com/a/57734 Leftmost bit of first byte is 'negative' flag,
    // since we always use positive integers here. It must always be empty:
    // - add zero byte if exists
    // - if next byte doesn't have a flag, leading zero is not allowed (minimal encoding)
    _int: {
      encode(num) {
        const { Err: E } = DER;
        if (num < _0n4)
          throw new E("integer: negative integers are not allowed");
        let hex = numberToHexUnpadded(num);
        if (Number.parseInt(hex[0], 16) & 8)
          hex = "00" + hex;
        if (hex.length & 1)
          throw new E("unexpected DER parsing assertion: unpadded hex");
        return hex;
      },
      decode(data) {
        const { Err: E } = DER;
        if (data[0] & 128)
          throw new E("invalid signature integer: negative");
        if (data[0] === 0 && !(data[1] & 128))
          throw new E("invalid signature integer: unnecessary leading zero");
        return bytesToNumberBE(data);
      }
    },
    toSig(hex) {
      const { Err: E, _int: int, _tlv: tlv } = DER;
      const data = ensureBytes("signature", hex);
      const { v: seqBytes, l: seqLeftBytes } = tlv.decode(48, data);
      if (seqLeftBytes.length)
        throw new E("invalid signature: left bytes after parsing");
      const { v: rBytes, l: rLeftBytes } = tlv.decode(2, seqBytes);
      const { v: sBytes, l: sLeftBytes } = tlv.decode(2, rLeftBytes);
      if (sLeftBytes.length)
        throw new E("invalid signature: left bytes after parsing");
      return { r: int.decode(rBytes), s: int.decode(sBytes) };
    },
    hexFromSig(sig) {
      const { _tlv: tlv, _int: int } = DER;
      const rs = tlv.encode(2, int.encode(sig.r));
      const ss = tlv.encode(2, int.encode(sig.s));
      const seq = rs + ss;
      return tlv.encode(48, seq);
    }
  };
  var _0n4 = BigInt(0);
  var _1n4 = BigInt(1);
  var _2n2 = BigInt(2);
  var _3n2 = BigInt(3);
  var _4n2 = BigInt(4);
  function _normFnElement(Fn, key) {
    const { BYTES: expected } = Fn;
    let num;
    if (typeof key === "bigint") {
      num = key;
    } else {
      let bytes = ensureBytes("private key", key);
      try {
        num = Fn.fromBytes(bytes);
      } catch (error) {
        throw new Error(`invalid private key: expected ui8a of size ${expected}, got ${typeof key}`);
      }
    }
    if (!Fn.isValidNot0(num))
      throw new Error("invalid private key: out of range [1..N-1]");
    return num;
  }
  function weierstrassN(params, extraOpts = {}) {
    const validated = _createCurveFields("weierstrass", params, extraOpts);
    const { Fp, Fn } = validated;
    let CURVE = validated.CURVE;
    const { h: cofactor, n: CURVE_ORDER } = CURVE;
    _validateObject(extraOpts, {}, {
      allowInfinityPoint: "boolean",
      clearCofactor: "function",
      isTorsionFree: "function",
      fromBytes: "function",
      toBytes: "function",
      endo: "object",
      wrapPrivateKey: "boolean"
    });
    const { endo } = extraOpts;
    if (endo) {
      if (!Fp.is0(CURVE.a) || typeof endo.beta !== "bigint" || !Array.isArray(endo.basises)) {
        throw new Error('invalid endo: expected "beta": bigint and "basises": array');
      }
    }
    const lengths = getWLengths(Fp, Fn);
    function assertCompressionIsSupported() {
      if (!Fp.isOdd)
        throw new Error("compression is not supported: Field does not have .isOdd()");
    }
    function pointToBytes(_c, point, isCompressed) {
      const { x, y } = point.toAffine();
      const bx = Fp.toBytes(x);
      _abool2(isCompressed, "isCompressed");
      if (isCompressed) {
        assertCompressionIsSupported();
        const hasEvenY = !Fp.isOdd(y);
        return concatBytes(pprefix(hasEvenY), bx);
      } else {
        return concatBytes(Uint8Array.of(4), bx, Fp.toBytes(y));
      }
    }
    function pointFromBytes(bytes) {
      _abytes2(bytes, void 0, "Point");
      const { publicKey: comp, publicKeyUncompressed: uncomp } = lengths;
      const length = bytes.length;
      const head = bytes[0];
      const tail = bytes.subarray(1);
      if (length === comp && (head === 2 || head === 3)) {
        const x = Fp.fromBytes(tail);
        if (!Fp.isValid(x))
          throw new Error("bad point: is not on curve, wrong x");
        const y2 = weierstrassEquation(x);
        let y;
        try {
          y = Fp.sqrt(y2);
        } catch (sqrtError) {
          const err = sqrtError instanceof Error ? ": " + sqrtError.message : "";
          throw new Error("bad point: is not on curve, sqrt error" + err);
        }
        assertCompressionIsSupported();
        const isYOdd = Fp.isOdd(y);
        const isHeadOdd = (head & 1) === 1;
        if (isHeadOdd !== isYOdd)
          y = Fp.neg(y);
        return { x, y };
      } else if (length === uncomp && head === 4) {
        const L = Fp.BYTES;
        const x = Fp.fromBytes(tail.subarray(0, L));
        const y = Fp.fromBytes(tail.subarray(L, L * 2));
        if (!isValidXY(x, y))
          throw new Error("bad point: is not on curve");
        return { x, y };
      } else {
        throw new Error(`bad point: got length ${length}, expected compressed=${comp} or uncompressed=${uncomp}`);
      }
    }
    const encodePoint = extraOpts.toBytes || pointToBytes;
    const decodePoint = extraOpts.fromBytes || pointFromBytes;
    function weierstrassEquation(x) {
      const x2 = Fp.sqr(x);
      const x3 = Fp.mul(x2, x);
      return Fp.add(Fp.add(x3, Fp.mul(x, CURVE.a)), CURVE.b);
    }
    function isValidXY(x, y) {
      const left = Fp.sqr(y);
      const right = weierstrassEquation(x);
      return Fp.eql(left, right);
    }
    if (!isValidXY(CURVE.Gx, CURVE.Gy))
      throw new Error("bad curve params: generator point");
    const _4a3 = Fp.mul(Fp.pow(CURVE.a, _3n2), _4n2);
    const _27b2 = Fp.mul(Fp.sqr(CURVE.b), BigInt(27));
    if (Fp.is0(Fp.add(_4a3, _27b2)))
      throw new Error("bad curve params: a or b");
    function acoord(title2, n, banZero = false) {
      if (!Fp.isValid(n) || banZero && Fp.is0(n))
        throw new Error(`bad point coordinate ${title2}`);
      return n;
    }
    function aprjpoint(other) {
      if (!(other instanceof Point))
        throw new Error("ProjectivePoint expected");
    }
    function splitEndoScalarN(k) {
      if (!endo || !endo.basises)
        throw new Error("no endo");
      return _splitEndoScalar(k, endo.basises, Fn.ORDER);
    }
    const toAffineMemo = memoized((p, iz) => {
      const { X, Y, Z } = p;
      if (Fp.eql(Z, Fp.ONE))
        return { x: X, y: Y };
      const is0 = p.is0();
      if (iz == null)
        iz = is0 ? Fp.ONE : Fp.inv(Z);
      const x = Fp.mul(X, iz);
      const y = Fp.mul(Y, iz);
      const zz = Fp.mul(Z, iz);
      if (is0)
        return { x: Fp.ZERO, y: Fp.ZERO };
      if (!Fp.eql(zz, Fp.ONE))
        throw new Error("invZ was invalid");
      return { x, y };
    });
    const assertValidMemo = memoized((p) => {
      if (p.is0()) {
        if (extraOpts.allowInfinityPoint && !Fp.is0(p.Y))
          return;
        throw new Error("bad point: ZERO");
      }
      const { x, y } = p.toAffine();
      if (!Fp.isValid(x) || !Fp.isValid(y))
        throw new Error("bad point: x or y not field elements");
      if (!isValidXY(x, y))
        throw new Error("bad point: equation left != right");
      if (!p.isTorsionFree())
        throw new Error("bad point: not in prime-order subgroup");
      return true;
    });
    function finishEndo(endoBeta, k1p, k2p, k1neg, k2neg) {
      k2p = new Point(Fp.mul(k2p.X, endoBeta), k2p.Y, k2p.Z);
      k1p = negateCt(k1neg, k1p);
      k2p = negateCt(k2neg, k2p);
      return k1p.add(k2p);
    }
    class Point {
      /** Does NOT validate if the point is valid. Use `.assertValidity()`. */
      constructor(X, Y, Z) {
        this.X = acoord("x", X);
        this.Y = acoord("y", Y, true);
        this.Z = acoord("z", Z);
        Object.freeze(this);
      }
      static CURVE() {
        return CURVE;
      }
      /** Does NOT validate if the point is valid. Use `.assertValidity()`. */
      static fromAffine(p) {
        const { x, y } = p || {};
        if (!p || !Fp.isValid(x) || !Fp.isValid(y))
          throw new Error("invalid affine point");
        if (p instanceof Point)
          throw new Error("projective point not allowed");
        if (Fp.is0(x) && Fp.is0(y))
          return Point.ZERO;
        return new Point(x, y, Fp.ONE);
      }
      static fromBytes(bytes) {
        const P = Point.fromAffine(decodePoint(_abytes2(bytes, void 0, "point")));
        P.assertValidity();
        return P;
      }
      static fromHex(hex) {
        return Point.fromBytes(ensureBytes("pointHex", hex));
      }
      get x() {
        return this.toAffine().x;
      }
      get y() {
        return this.toAffine().y;
      }
      /**
       *
       * @param windowSize
       * @param isLazy true will defer table computation until the first multiplication
       * @returns
       */
      precompute(windowSize = 8, isLazy = true) {
        wnaf.createCache(this, windowSize);
        if (!isLazy)
          this.multiply(_3n2);
        return this;
      }
      // TODO: return `this`
      /** A point on curve is valid if it conforms to equation. */
      assertValidity() {
        assertValidMemo(this);
      }
      hasEvenY() {
        const { y } = this.toAffine();
        if (!Fp.isOdd)
          throw new Error("Field doesn't support isOdd");
        return !Fp.isOdd(y);
      }
      /** Compare one point to another. */
      equals(other) {
        aprjpoint(other);
        const { X: X1, Y: Y1, Z: Z1 } = this;
        const { X: X2, Y: Y2, Z: Z2 } = other;
        const U1 = Fp.eql(Fp.mul(X1, Z2), Fp.mul(X2, Z1));
        const U2 = Fp.eql(Fp.mul(Y1, Z2), Fp.mul(Y2, Z1));
        return U1 && U2;
      }
      /** Flips point to one corresponding to (x, -y) in Affine coordinates. */
      negate() {
        return new Point(this.X, Fp.neg(this.Y), this.Z);
      }
      // Renes-Costello-Batina exception-free doubling formula.
      // There is 30% faster Jacobian formula, but it is not complete.
      // https://eprint.iacr.org/2015/1060, algorithm 3
      // Cost: 8M + 3S + 3*a + 2*b3 + 15add.
      double() {
        const { a, b } = CURVE;
        const b3 = Fp.mul(b, _3n2);
        const { X: X1, Y: Y1, Z: Z1 } = this;
        let X3 = Fp.ZERO, Y3 = Fp.ZERO, Z3 = Fp.ZERO;
        let t0 = Fp.mul(X1, X1);
        let t1 = Fp.mul(Y1, Y1);
        let t2 = Fp.mul(Z1, Z1);
        let t3 = Fp.mul(X1, Y1);
        t3 = Fp.add(t3, t3);
        Z3 = Fp.mul(X1, Z1);
        Z3 = Fp.add(Z3, Z3);
        X3 = Fp.mul(a, Z3);
        Y3 = Fp.mul(b3, t2);
        Y3 = Fp.add(X3, Y3);
        X3 = Fp.sub(t1, Y3);
        Y3 = Fp.add(t1, Y3);
        Y3 = Fp.mul(X3, Y3);
        X3 = Fp.mul(t3, X3);
        Z3 = Fp.mul(b3, Z3);
        t2 = Fp.mul(a, t2);
        t3 = Fp.sub(t0, t2);
        t3 = Fp.mul(a, t3);
        t3 = Fp.add(t3, Z3);
        Z3 = Fp.add(t0, t0);
        t0 = Fp.add(Z3, t0);
        t0 = Fp.add(t0, t2);
        t0 = Fp.mul(t0, t3);
        Y3 = Fp.add(Y3, t0);
        t2 = Fp.mul(Y1, Z1);
        t2 = Fp.add(t2, t2);
        t0 = Fp.mul(t2, t3);
        X3 = Fp.sub(X3, t0);
        Z3 = Fp.mul(t2, t1);
        Z3 = Fp.add(Z3, Z3);
        Z3 = Fp.add(Z3, Z3);
        return new Point(X3, Y3, Z3);
      }
      // Renes-Costello-Batina exception-free addition formula.
      // There is 30% faster Jacobian formula, but it is not complete.
      // https://eprint.iacr.org/2015/1060, algorithm 1
      // Cost: 12M + 0S + 3*a + 3*b3 + 23add.
      add(other) {
        aprjpoint(other);
        const { X: X1, Y: Y1, Z: Z1 } = this;
        const { X: X2, Y: Y2, Z: Z2 } = other;
        let X3 = Fp.ZERO, Y3 = Fp.ZERO, Z3 = Fp.ZERO;
        const a = CURVE.a;
        const b3 = Fp.mul(CURVE.b, _3n2);
        let t0 = Fp.mul(X1, X2);
        let t1 = Fp.mul(Y1, Y2);
        let t2 = Fp.mul(Z1, Z2);
        let t3 = Fp.add(X1, Y1);
        let t4 = Fp.add(X2, Y2);
        t3 = Fp.mul(t3, t4);
        t4 = Fp.add(t0, t1);
        t3 = Fp.sub(t3, t4);
        t4 = Fp.add(X1, Z1);
        let t5 = Fp.add(X2, Z2);
        t4 = Fp.mul(t4, t5);
        t5 = Fp.add(t0, t2);
        t4 = Fp.sub(t4, t5);
        t5 = Fp.add(Y1, Z1);
        X3 = Fp.add(Y2, Z2);
        t5 = Fp.mul(t5, X3);
        X3 = Fp.add(t1, t2);
        t5 = Fp.sub(t5, X3);
        Z3 = Fp.mul(a, t4);
        X3 = Fp.mul(b3, t2);
        Z3 = Fp.add(X3, Z3);
        X3 = Fp.sub(t1, Z3);
        Z3 = Fp.add(t1, Z3);
        Y3 = Fp.mul(X3, Z3);
        t1 = Fp.add(t0, t0);
        t1 = Fp.add(t1, t0);
        t2 = Fp.mul(a, t2);
        t4 = Fp.mul(b3, t4);
        t1 = Fp.add(t1, t2);
        t2 = Fp.sub(t0, t2);
        t2 = Fp.mul(a, t2);
        t4 = Fp.add(t4, t2);
        t0 = Fp.mul(t1, t4);
        Y3 = Fp.add(Y3, t0);
        t0 = Fp.mul(t5, t4);
        X3 = Fp.mul(t3, X3);
        X3 = Fp.sub(X3, t0);
        t0 = Fp.mul(t3, t1);
        Z3 = Fp.mul(t5, Z3);
        Z3 = Fp.add(Z3, t0);
        return new Point(X3, Y3, Z3);
      }
      subtract(other) {
        return this.add(other.negate());
      }
      is0() {
        return this.equals(Point.ZERO);
      }
      /**
       * Constant time multiplication.
       * Uses wNAF method. Windowed method may be 10% faster,
       * but takes 2x longer to generate and consumes 2x memory.
       * Uses precomputes when available.
       * Uses endomorphism for Koblitz curves.
       * @param scalar by which the point would be multiplied
       * @returns New point
       */
      multiply(scalar) {
        const { endo: endo2 } = extraOpts;
        if (!Fn.isValidNot0(scalar))
          throw new Error("invalid scalar: out of range");
        let point, fake;
        const mul = (n) => wnaf.cached(this, n, (p) => normalizeZ(Point, p));
        if (endo2) {
          const { k1neg, k1, k2neg, k2 } = splitEndoScalarN(scalar);
          const { p: k1p, f: k1f } = mul(k1);
          const { p: k2p, f: k2f } = mul(k2);
          fake = k1f.add(k2f);
          point = finishEndo(endo2.beta, k1p, k2p, k1neg, k2neg);
        } else {
          const { p, f } = mul(scalar);
          point = p;
          fake = f;
        }
        return normalizeZ(Point, [point, fake])[0];
      }
      /**
       * Non-constant-time multiplication. Uses double-and-add algorithm.
       * It's faster, but should only be used when you don't care about
       * an exposed secret key e.g. sig verification, which works over *public* keys.
       */
      multiplyUnsafe(sc) {
        const { endo: endo2 } = extraOpts;
        const p = this;
        if (!Fn.isValid(sc))
          throw new Error("invalid scalar: out of range");
        if (sc === _0n4 || p.is0())
          return Point.ZERO;
        if (sc === _1n4)
          return p;
        if (wnaf.hasCache(this))
          return this.multiply(sc);
        if (endo2) {
          const { k1neg, k1, k2neg, k2 } = splitEndoScalarN(sc);
          const { p1, p2 } = mulEndoUnsafe(Point, p, k1, k2);
          return finishEndo(endo2.beta, p1, p2, k1neg, k2neg);
        } else {
          return wnaf.unsafe(p, sc);
        }
      }
      multiplyAndAddUnsafe(Q, a, b) {
        const sum = this.multiplyUnsafe(a).add(Q.multiplyUnsafe(b));
        return sum.is0() ? void 0 : sum;
      }
      /**
       * Converts Projective point to affine (x, y) coordinates.
       * @param invertedZ Z^-1 (inverted zero) - optional, precomputation is useful for invertBatch
       */
      toAffine(invertedZ) {
        return toAffineMemo(this, invertedZ);
      }
      /**
       * Checks whether Point is free of torsion elements (is in prime subgroup).
       * Always torsion-free for cofactor=1 curves.
       */
      isTorsionFree() {
        const { isTorsionFree } = extraOpts;
        if (cofactor === _1n4)
          return true;
        if (isTorsionFree)
          return isTorsionFree(Point, this);
        return wnaf.unsafe(this, CURVE_ORDER).is0();
      }
      clearCofactor() {
        const { clearCofactor } = extraOpts;
        if (cofactor === _1n4)
          return this;
        if (clearCofactor)
          return clearCofactor(Point, this);
        return this.multiplyUnsafe(cofactor);
      }
      isSmallOrder() {
        return this.multiplyUnsafe(cofactor).is0();
      }
      toBytes(isCompressed = true) {
        _abool2(isCompressed, "isCompressed");
        this.assertValidity();
        return encodePoint(Point, this, isCompressed);
      }
      toHex(isCompressed = true) {
        return bytesToHex(this.toBytes(isCompressed));
      }
      toString() {
        return `<Point ${this.is0() ? "ZERO" : this.toHex()}>`;
      }
      // TODO: remove
      get px() {
        return this.X;
      }
      get py() {
        return this.X;
      }
      get pz() {
        return this.Z;
      }
      toRawBytes(isCompressed = true) {
        return this.toBytes(isCompressed);
      }
      _setWindowSize(windowSize) {
        this.precompute(windowSize);
      }
      static normalizeZ(points) {
        return normalizeZ(Point, points);
      }
      static msm(points, scalars) {
        return pippenger(Point, Fn, points, scalars);
      }
      static fromPrivateKey(privateKey) {
        return Point.BASE.multiply(_normFnElement(Fn, privateKey));
      }
    }
    Point.BASE = new Point(CURVE.Gx, CURVE.Gy, Fp.ONE);
    Point.ZERO = new Point(Fp.ZERO, Fp.ONE, Fp.ZERO);
    Point.Fp = Fp;
    Point.Fn = Fn;
    const bits = Fn.BITS;
    const wnaf = new wNAF(Point, extraOpts.endo ? Math.ceil(bits / 2) : bits);
    Point.BASE.precompute(8);
    return Point;
  }
  function pprefix(hasEvenY) {
    return Uint8Array.of(hasEvenY ? 2 : 3);
  }
  function getWLengths(Fp, Fn) {
    return {
      secretKey: Fn.BYTES,
      publicKey: 1 + Fp.BYTES,
      publicKeyUncompressed: 1 + 2 * Fp.BYTES,
      publicKeyHasPrefix: true,
      signature: 2 * Fn.BYTES
    };
  }
  function ecdh(Point, ecdhOpts = {}) {
    const { Fn } = Point;
    const randomBytes_ = ecdhOpts.randomBytes || randomBytes;
    const lengths = Object.assign(getWLengths(Point.Fp, Fn), { seed: getMinHashLength(Fn.ORDER) });
    function isValidSecretKey(secretKey) {
      try {
        return !!_normFnElement(Fn, secretKey);
      } catch (error) {
        return false;
      }
    }
    function isValidPublicKey(publicKey, isCompressed) {
      const { publicKey: comp, publicKeyUncompressed } = lengths;
      try {
        const l = publicKey.length;
        if (isCompressed === true && l !== comp)
          return false;
        if (isCompressed === false && l !== publicKeyUncompressed)
          return false;
        return !!Point.fromBytes(publicKey);
      } catch (error) {
        return false;
      }
    }
    function randomSecretKey(seed = randomBytes_(lengths.seed)) {
      return mapHashToField(_abytes2(seed, lengths.seed, "seed"), Fn.ORDER);
    }
    function getPublicKey(secretKey, isCompressed = true) {
      return Point.BASE.multiply(_normFnElement(Fn, secretKey)).toBytes(isCompressed);
    }
    function keygen(seed) {
      const secretKey = randomSecretKey(seed);
      return { secretKey, publicKey: getPublicKey(secretKey) };
    }
    function isProbPub(item) {
      if (typeof item === "bigint")
        return false;
      if (item instanceof Point)
        return true;
      const { secretKey, publicKey, publicKeyUncompressed } = lengths;
      if (Fn.allowedLengths || secretKey === publicKey)
        return void 0;
      const l = ensureBytes("key", item).length;
      return l === publicKey || l === publicKeyUncompressed;
    }
    function getSharedSecret(secretKeyA, publicKeyB, isCompressed = true) {
      if (isProbPub(secretKeyA) === true)
        throw new Error("first arg must be private key");
      if (isProbPub(publicKeyB) === false)
        throw new Error("second arg must be public key");
      const s = _normFnElement(Fn, secretKeyA);
      const b = Point.fromHex(publicKeyB);
      return b.multiply(s).toBytes(isCompressed);
    }
    const utils = {
      isValidSecretKey,
      isValidPublicKey,
      randomSecretKey,
      // TODO: remove
      isValidPrivateKey: isValidSecretKey,
      randomPrivateKey: randomSecretKey,
      normPrivateKeyToScalar: (key) => _normFnElement(Fn, key),
      precompute(windowSize = 8, point = Point.BASE) {
        return point.precompute(windowSize, false);
      }
    };
    return Object.freeze({ getPublicKey, getSharedSecret, keygen, Point, utils, lengths });
  }
  function ecdsa(Point, hash, ecdsaOpts = {}) {
    ahash(hash);
    _validateObject(ecdsaOpts, {}, {
      hmac: "function",
      lowS: "boolean",
      randomBytes: "function",
      bits2int: "function",
      bits2int_modN: "function"
    });
    const randomBytes2 = ecdsaOpts.randomBytes || randomBytes;
    const hmac2 = ecdsaOpts.hmac || ((key, ...msgs) => hmac(hash, key, concatBytes(...msgs)));
    const { Fp, Fn } = Point;
    const { ORDER: CURVE_ORDER, BITS: fnBits } = Fn;
    const { keygen, getPublicKey, getSharedSecret, utils, lengths } = ecdh(Point, ecdsaOpts);
    const defaultSigOpts = {
      prehash: false,
      lowS: typeof ecdsaOpts.lowS === "boolean" ? ecdsaOpts.lowS : false,
      format: void 0,
      //'compact' as ECDSASigFormat,
      extraEntropy: false
    };
    const defaultSigOpts_format = "compact";
    function isBiggerThanHalfOrder(number) {
      const HALF = CURVE_ORDER >> _1n4;
      return number > HALF;
    }
    function validateRS(title2, num) {
      if (!Fn.isValidNot0(num))
        throw new Error(`invalid signature ${title2}: out of range 1..Point.Fn.ORDER`);
      return num;
    }
    function validateSigLength(bytes, format2) {
      validateSigFormat(format2);
      const size = lengths.signature;
      const sizer = format2 === "compact" ? size : format2 === "recovered" ? size + 1 : void 0;
      return _abytes2(bytes, sizer, `${format2} signature`);
    }
    class Signature {
      constructor(r, s, recovery) {
        this.r = validateRS("r", r);
        this.s = validateRS("s", s);
        if (recovery != null)
          this.recovery = recovery;
        Object.freeze(this);
      }
      static fromBytes(bytes, format2 = defaultSigOpts_format) {
        validateSigLength(bytes, format2);
        let recid;
        if (format2 === "der") {
          const { r: r2, s: s2 } = DER.toSig(_abytes2(bytes));
          return new Signature(r2, s2);
        }
        if (format2 === "recovered") {
          recid = bytes[0];
          format2 = "compact";
          bytes = bytes.subarray(1);
        }
        const L = Fn.BYTES;
        const r = bytes.subarray(0, L);
        const s = bytes.subarray(L, L * 2);
        return new Signature(Fn.fromBytes(r), Fn.fromBytes(s), recid);
      }
      static fromHex(hex, format2) {
        return this.fromBytes(hexToBytes(hex), format2);
      }
      addRecoveryBit(recovery) {
        return new Signature(this.r, this.s, recovery);
      }
      recoverPublicKey(messageHash) {
        const FIELD_ORDER = Fp.ORDER;
        const { r, s, recovery: rec } = this;
        if (rec == null || ![0, 1, 2, 3].includes(rec))
          throw new Error("recovery id invalid");
        const hasCofactor = CURVE_ORDER * _2n2 < FIELD_ORDER;
        if (hasCofactor && rec > 1)
          throw new Error("recovery id is ambiguous for h>1 curve");
        const radj = rec === 2 || rec === 3 ? r + CURVE_ORDER : r;
        if (!Fp.isValid(radj))
          throw new Error("recovery id 2 or 3 invalid");
        const x = Fp.toBytes(radj);
        const R = Point.fromBytes(concatBytes(pprefix((rec & 1) === 0), x));
        const ir = Fn.inv(radj);
        const h = bits2int_modN(ensureBytes("msgHash", messageHash));
        const u1 = Fn.create(-h * ir);
        const u2 = Fn.create(s * ir);
        const Q = Point.BASE.multiplyUnsafe(u1).add(R.multiplyUnsafe(u2));
        if (Q.is0())
          throw new Error("point at infinify");
        Q.assertValidity();
        return Q;
      }
      // Signatures should be low-s, to prevent malleability.
      hasHighS() {
        return isBiggerThanHalfOrder(this.s);
      }
      toBytes(format2 = defaultSigOpts_format) {
        validateSigFormat(format2);
        if (format2 === "der")
          return hexToBytes(DER.hexFromSig(this));
        const r = Fn.toBytes(this.r);
        const s = Fn.toBytes(this.s);
        if (format2 === "recovered") {
          if (this.recovery == null)
            throw new Error("recovery bit must be present");
          return concatBytes(Uint8Array.of(this.recovery), r, s);
        }
        return concatBytes(r, s);
      }
      toHex(format2) {
        return bytesToHex(this.toBytes(format2));
      }
      // TODO: remove
      assertValidity() {
      }
      static fromCompact(hex) {
        return Signature.fromBytes(ensureBytes("sig", hex), "compact");
      }
      static fromDER(hex) {
        return Signature.fromBytes(ensureBytes("sig", hex), "der");
      }
      normalizeS() {
        return this.hasHighS() ? new Signature(this.r, Fn.neg(this.s), this.recovery) : this;
      }
      toDERRawBytes() {
        return this.toBytes("der");
      }
      toDERHex() {
        return bytesToHex(this.toBytes("der"));
      }
      toCompactRawBytes() {
        return this.toBytes("compact");
      }
      toCompactHex() {
        return bytesToHex(this.toBytes("compact"));
      }
    }
    const bits2int = ecdsaOpts.bits2int || function bits2int_def(bytes) {
      if (bytes.length > 8192)
        throw new Error("input is too large");
      const num = bytesToNumberBE(bytes);
      const delta = bytes.length * 8 - fnBits;
      return delta > 0 ? num >> BigInt(delta) : num;
    };
    const bits2int_modN = ecdsaOpts.bits2int_modN || function bits2int_modN_def(bytes) {
      return Fn.create(bits2int(bytes));
    };
    const ORDER_MASK = bitMask(fnBits);
    function int2octets(num) {
      aInRange("num < 2^" + fnBits, num, _0n4, ORDER_MASK);
      return Fn.toBytes(num);
    }
    function validateMsgAndHash(message, prehash) {
      _abytes2(message, void 0, "message");
      return prehash ? _abytes2(hash(message), void 0, "prehashed message") : message;
    }
    function prepSig(message, privateKey, opts) {
      if (["recovered", "canonical"].some((k) => k in opts))
        throw new Error("sign() legacy options not supported");
      const { lowS, prehash, extraEntropy } = validateSigOpts(opts, defaultSigOpts);
      message = validateMsgAndHash(message, prehash);
      const h1int = bits2int_modN(message);
      const d = _normFnElement(Fn, privateKey);
      const seedArgs = [int2octets(d), int2octets(h1int)];
      if (extraEntropy != null && extraEntropy !== false) {
        const e = extraEntropy === true ? randomBytes2(lengths.secretKey) : extraEntropy;
        seedArgs.push(ensureBytes("extraEntropy", e));
      }
      const seed = concatBytes(...seedArgs);
      const m = h1int;
      function k2sig(kBytes) {
        const k = bits2int(kBytes);
        if (!Fn.isValidNot0(k))
          return;
        const ik = Fn.inv(k);
        const q = Point.BASE.multiply(k).toAffine();
        const r = Fn.create(q.x);
        if (r === _0n4)
          return;
        const s = Fn.create(ik * Fn.create(m + r * d));
        if (s === _0n4)
          return;
        let recovery = (q.x === r ? 0 : 2) | Number(q.y & _1n4);
        let normS = s;
        if (lowS && isBiggerThanHalfOrder(s)) {
          normS = Fn.neg(s);
          recovery ^= 1;
        }
        return new Signature(r, normS, recovery);
      }
      return { seed, k2sig };
    }
    function sign(message, secretKey, opts = {}) {
      message = ensureBytes("message", message);
      const { seed, k2sig } = prepSig(message, secretKey, opts);
      const drbg = createHmacDrbg(hash.outputLen, Fn.BYTES, hmac2);
      const sig = drbg(seed, k2sig);
      return sig;
    }
    function tryParsingSig(sg) {
      let sig = void 0;
      const isHex = typeof sg === "string" || isBytes(sg);
      const isObj = !isHex && sg !== null && typeof sg === "object" && typeof sg.r === "bigint" && typeof sg.s === "bigint";
      if (!isHex && !isObj)
        throw new Error("invalid signature, expected Uint8Array, hex string or Signature instance");
      if (isObj) {
        sig = new Signature(sg.r, sg.s);
      } else if (isHex) {
        try {
          sig = Signature.fromBytes(ensureBytes("sig", sg), "der");
        } catch (derError) {
          if (!(derError instanceof DER.Err))
            throw derError;
        }
        if (!sig) {
          try {
            sig = Signature.fromBytes(ensureBytes("sig", sg), "compact");
          } catch (error) {
            return false;
          }
        }
      }
      if (!sig)
        return false;
      return sig;
    }
    function verify(signature, message, publicKey, opts = {}) {
      const { lowS, prehash, format: format2 } = validateSigOpts(opts, defaultSigOpts);
      publicKey = ensureBytes("publicKey", publicKey);
      message = validateMsgAndHash(ensureBytes("message", message), prehash);
      if ("strict" in opts)
        throw new Error("options.strict was renamed to lowS");
      const sig = format2 === void 0 ? tryParsingSig(signature) : Signature.fromBytes(ensureBytes("sig", signature), format2);
      if (sig === false)
        return false;
      try {
        const P = Point.fromBytes(publicKey);
        if (lowS && sig.hasHighS())
          return false;
        const { r, s } = sig;
        const h = bits2int_modN(message);
        const is = Fn.inv(s);
        const u1 = Fn.create(h * is);
        const u2 = Fn.create(r * is);
        const R = Point.BASE.multiplyUnsafe(u1).add(P.multiplyUnsafe(u2));
        if (R.is0())
          return false;
        const v = Fn.create(R.x);
        return v === r;
      } catch (e) {
        return false;
      }
    }
    function recoverPublicKey(signature, message, opts = {}) {
      const { prehash } = validateSigOpts(opts, defaultSigOpts);
      message = validateMsgAndHash(message, prehash);
      return Signature.fromBytes(signature, "recovered").recoverPublicKey(message).toBytes();
    }
    return Object.freeze({
      keygen,
      getPublicKey,
      getSharedSecret,
      utils,
      lengths,
      Point,
      sign,
      verify,
      recoverPublicKey,
      Signature,
      hash
    });
  }
  function _weierstrass_legacy_opts_to_new(c) {
    const CURVE = {
      a: c.a,
      b: c.b,
      p: c.Fp.ORDER,
      n: c.n,
      h: c.h,
      Gx: c.Gx,
      Gy: c.Gy
    };
    const Fp = c.Fp;
    let allowedLengths = c.allowedPrivateKeyLengths ? Array.from(new Set(c.allowedPrivateKeyLengths.map((l) => Math.ceil(l / 2)))) : void 0;
    const Fn = Field(CURVE.n, {
      BITS: c.nBitLength,
      allowedLengths,
      modFromBytes: c.wrapPrivateKey
    });
    const curveOpts = {
      Fp,
      Fn,
      allowInfinityPoint: c.allowInfinityPoint,
      endo: c.endo,
      isTorsionFree: c.isTorsionFree,
      clearCofactor: c.clearCofactor,
      fromBytes: c.fromBytes,
      toBytes: c.toBytes
    };
    return { CURVE, curveOpts };
  }
  function _ecdsa_legacy_opts_to_new(c) {
    const { CURVE, curveOpts } = _weierstrass_legacy_opts_to_new(c);
    const ecdsaOpts = {
      hmac: c.hmac,
      randomBytes: c.randomBytes,
      lowS: c.lowS,
      bits2int: c.bits2int,
      bits2int_modN: c.bits2int_modN
    };
    return { CURVE, curveOpts, hash: c.hash, ecdsaOpts };
  }
  function _ecdsa_new_output_to_legacy(c, _ecdsa) {
    const Point = _ecdsa.Point;
    return Object.assign({}, _ecdsa, {
      ProjectivePoint: Point,
      CURVE: Object.assign({}, c, nLength(Point.Fn.ORDER, Point.Fn.BITS))
    });
  }
  function weierstrass(c) {
    const { CURVE, curveOpts, hash, ecdsaOpts } = _ecdsa_legacy_opts_to_new(c);
    const Point = weierstrassN(CURVE, curveOpts);
    const signs = ecdsa(Point, hash, ecdsaOpts);
    return _ecdsa_new_output_to_legacy(c, signs);
  }

  // node_modules/@noble/curves/esm/_shortw_utils.js
  function createCurve(curveDef, defHash) {
    const create = (hash) => weierstrass({ ...curveDef, hash });
    return { ...create(defHash), create };
  }

  // node_modules/@noble/curves/esm/secp256k1.js
  var secp256k1_CURVE = {
    p: BigInt("0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f"),
    n: BigInt("0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141"),
    h: BigInt(1),
    a: BigInt(0),
    b: BigInt(7),
    Gx: BigInt("0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798"),
    Gy: BigInt("0x483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8")
  };
  var secp256k1_ENDO = {
    beta: BigInt("0x7ae96a2b657c07106e64479eac3434e99cf0497512f58995c1396c28719501ee"),
    basises: [
      [BigInt("0x3086d221a7d46bcde86c90e49284eb15"), -BigInt("0xe4437ed6010e88286f547fa90abfe4c3")],
      [BigInt("0x114ca50f7a8e2f3f657c1108d9d44cfd8"), BigInt("0x3086d221a7d46bcde86c90e49284eb15")]
    ]
  };
  var _2n3 = /* @__PURE__ */ BigInt(2);
  function sqrtMod(y) {
    const P = secp256k1_CURVE.p;
    const _3n3 = BigInt(3), _6n = BigInt(6), _11n = BigInt(11), _22n = BigInt(22);
    const _23n = BigInt(23), _44n = BigInt(44), _88n = BigInt(88);
    const b2 = y * y * y % P;
    const b3 = b2 * b2 * y % P;
    const b6 = pow2(b3, _3n3, P) * b3 % P;
    const b9 = pow2(b6, _3n3, P) * b3 % P;
    const b11 = pow2(b9, _2n3, P) * b2 % P;
    const b22 = pow2(b11, _11n, P) * b11 % P;
    const b44 = pow2(b22, _22n, P) * b22 % P;
    const b88 = pow2(b44, _44n, P) * b44 % P;
    const b176 = pow2(b88, _88n, P) * b88 % P;
    const b220 = pow2(b176, _44n, P) * b44 % P;
    const b223 = pow2(b220, _3n3, P) * b3 % P;
    const t1 = pow2(b223, _23n, P) * b22 % P;
    const t2 = pow2(t1, _6n, P) * b2 % P;
    const root = pow2(t2, _2n3, P);
    if (!Fpk1.eql(Fpk1.sqr(root), y))
      throw new Error("Cannot find square root");
    return root;
  }
  var Fpk1 = Field(secp256k1_CURVE.p, { sqrt: sqrtMod });
  var secp256k1 = createCurve({ ...secp256k1_CURVE, Fp: Fpk1, lowS: true, endo: secp256k1_ENDO }, sha256);

  // ../retail-calendar-cltv.mjs
  init_dirname();
  init_buffer2();
  init_process2();
  function retailDateToCltvTimestamp(dateISO) {
    if (typeof dateISO !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(dateISO))
      throw Error("Invalid ISO calendar date");
    const timestamp = Date.parse(dateISO + "T00:00:00Z");
    if (!Number.isSafeInteger(timestamp) || new Date(timestamp).toISOString().slice(0, 10) !== dateISO)
      throw Error("Invalid calendar date");
    const seconds = timestamp / 1e3;
    if (!Number.isSafeInteger(seconds) || seconds < 5e8 || seconds > 4294967295)
      throw Error("Calendar date outside supported timestamp CLTV range");
    return seconds;
  }

  // ../lifecycle/public-model.mjs
  init_dirname();
  init_buffer2();
  init_process2();

  // ../creator-service-policy.mjs
  init_dirname();
  init_buffer2();
  init_process2();
  var CREATOR_SERVICE_POLICY = Object.freeze({
    approved: true,
    network: "regtest",
    genesis: "0f9188f13cb7b2c71f2a335e3a4fc328bf5beb436012afca590b1a11466e2206",
    id: "OWNER_APPROVED_TEF_DISPOSABLE_REGTEST_SERVICE_V1",
    key: Object.freeze({ masterFingerprintHex: "e29ac13c", path: "m/84'/0'/0'/0/2", publicKeyHex: "03a82a699f1554465b9994bc60e6779a0433d2476ba894995b29032c6ebcde4057" })
  });

  // ../independent-recovery-profile.mjs
  init_dirname();
  init_buffer2();
  init_process2();
  init_buffer();
  var import_bitcoinjs_lib = __toESM(require_src2(), 1);
  var import_bs58check = __toESM(require_bs58check(), 1);
  var RECOVERY_PROFILE = Object.freeze({ id: "professional-public-date-discovery-v1", accountPath: "m/84'/0'/0'", accountPaths: Object.freeze(["m/84'/0'/0'", "m/84'/1'/0'"]), firstDate: "1985-11-06", lastDate: "2105-12-31", maxReleases: 24, minDiscoveryIndex: 1, maxDiscoveryIndex: 20, discoveryValueSats: 546 });

  // ../lifecycle/public-model.mjs
  init_buffer();
  var import_bitcoinjs_lib5 = __toESM(require_src2(), 1);

  // ../public-date-planner.mjs
  init_dirname();
  init_buffer2();
  init_process2();

  // ../funded-distribution-intent.mjs
  init_dirname();
  init_buffer2();
  init_process2();

  // ../unsigned-funded-distribution-psbt.mjs
  init_dirname();
  init_buffer2();
  init_process2();
  var import_bitcoinjs_lib2 = __toESM(require_src2(), 1);
  init_buffer();

  // ../verify-gift-cltv-outputs.mjs
  init_dirname();
  init_buffer2();
  init_process2();
  var import_bitcoinjs_lib3 = __toESM(require_src2(), 1);

  // ../verify-signed-funded-distribution.mjs
  init_dirname();
  init_buffer2();
  init_process2();
  var import_bitcoinjs_lib4 = __toESM(require_src2(), 1);

  // ../lifecycle/public-model.mjs
  var network = import_bitcoinjs_lib5.default.networks.regtest;

  // ../recovery-proof/public-discovery.mjs
  var PROFILE = Object.freeze({ accountPath: "m/84'/0'/0'", accountPaths: Object.freeze(["m/84'/0'/0'", "m/84'/1'/0'"]), firstDate: "1985-11-06", lastDate: "2105-12-31", keyCount: 24 });
  function publicChildren({ accountXpub, masterFingerprintHex, accountPath, discoveryIndex = 0 }) {
    strict.ok(PROFILE.accountPaths.includes(accountPath), "Unsupported recovery profile");
    strict.ok(Number.isInteger(discoveryIndex) && discoveryIndex >= 0 && discoveryIndex <= 20, "Discovery index outside proof range");
    strict.match(masterFingerprintHex, /^[0-9a-f]{8}$/);
    strict.ok(typeof accountXpub === "string" && accountXpub.startsWith("xpub"), "Public account xpub required");
    const raw = Buffer2.from(import_bs58check2.default.decode(accountXpub));
    strict.equal(raw.length, 78);
    strict.equal(raw.readUInt32BE(0), 76067358);
    strict.equal(raw[4], 3);
    strict.equal(raw.readUInt32BE(9), 2147483648);
    const derive = (n, index) => {
      const i = Buffer2.alloc(4);
      i.writeUInt32BE(index);
      const h = Buffer2.from(hmac(sha5122, n.chain, Buffer2.concat([n.pub, i]))), k = BigInt("0x" + h.subarray(0, 32).toString("hex"));
      strict.ok(k < secp256k1.CURVE.n, "Invalid public BIP32 child");
      const parent = secp256k1.ProjectivePoint.fromHex(n.pub);
      const point = k === 0n ? parent : parent.add(secp256k1.ProjectivePoint.BASE.multiply(k));
      strict.ok(!point.equals(secp256k1.ProjectivePoint.ZERO), "Invalid public BIP32 point");
      return { pub: Buffer2.from(point.toRawBytes(true)), chain: h.subarray(32) };
    };
    const account = { chain: raw.subarray(13, 45), pub: raw.subarray(45, 78) }, branch = derive(account, 1);
    const key = (node, path) => ({ publicKeyHex: node.pub.toString("hex"), masterFingerprintHex, path });
    return {
      recipient: Array.from({ length: PROFILE.keyCount }, (_, i) => key(derive(branch, i), `${accountPath}/1/${i}`)),
      destination: key(derive(derive(account, 0), 1), accountPath + "/0/1"),
      discovery: key(derive(derive(account, 0), discoveryIndex === 0 ? 0 : discoveryIndex + 2), `${accountPath}/0/${discoveryIndex === 0 ? 0 : discoveryIndex + 2}`)
    };
  }
  function matchPublicOutputs({ publicAccount, publicOutpoints }) {
    strict.ok(Array.isArray(publicOutpoints) && publicOutpoints.length <= 1e4, "Candidate outputs exceed proof bounds");
    const keys = publicChildren(publicAccount), byScript = /* @__PURE__ */ new Map();
    for (const u of publicOutpoints) {
      const tx = import_bitcoinjs_lib6.default.Transaction.fromHex(u.rawTransactionHex);
      strict.equal(tx.getId(), u.txid, "Fixture TXID mismatch");
      strict.ok(Number.isInteger(u.vout) && u.vout >= 0 && tx.outs[u.vout], "Fixture outpoint missing");
      const out = tx.outs[u.vout], id = `${u.txid}:${u.vout}`;
      strict.ok(![...byScript.values()].flat().some((x) => x.id === id), "Duplicate fixture outpoint");
      const script = out.script.toString("hex"), items = byScript.get(script) || [];
      items.push({ ...u, id, valueSats: out.value });
      byScript.set(script, items);
    }
    const found = [];
    for (const key of byScript.size ? keys.recipient : []) {
      for (let time = retailDateToCltvTimestamp(PROFILE.firstDate), end = retailDateToCltvTimestamp(PROFILE.lastDate); time <= end; time += 86400) {
        const redeem = import_bitcoinjs_lib6.default.script.compile([import_bitcoinjs_lib6.default.script.number.encode(time), import_bitcoinjs_lib6.default.opcodes.OP_CHECKLOCKTIMEVERIFY, import_bitcoinjs_lib6.default.opcodes.OP_DROP, Buffer2.from(key.publicKeyHex, "hex"), import_bitcoinjs_lib6.default.opcodes.OP_CHECKSIG]);
        const script = import_bitcoinjs_lib6.default.payments.p2sh({ redeem: { output: redeem }, network }).output.toString("hex");
        for (const u of byScript.get(script) || []) found.push({
          ...u,
          date: new Date(time * 1e3).toISOString().slice(0, 10),
          locktime: time,
          key,
          redeemScriptHex: redeem.toString("hex"),
          scriptPubKeyHex: script
        });
      }
    }
    return {
      releases: found.sort((a, b) => a.locktime - b.locktime || a.id.localeCompare(b.id)),
      destinationScriptHex: import_bitcoinjs_lib6.default.payments.p2wpkh({ pubkey: Buffer2.from(keys.destination.publicKeyHex, "hex"), network }).output.toString("hex"),
      publicAccountOriginVerified: false,
      chainVerified: false,
      fixtureOnly: true
    };
  }

  // ../beneficiary-discovery.worker.mjs
  self.onmessage = (e) => {
    try {
      self.postMessage({ result: matchPublicOutputs(e.data) });
    } catch (error) {
      self.postMessage({ error: error.message });
    }
  };
})();
/*! Bundled license information:

@jspm/core/nodelibs/browser/chunk-DtuTasat.js:
  (*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> *)

@noble/hashes/esm/utils.js:
@noble/hashes/utils.js:
  (*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) *)

safe-buffer/index.js:
  (*! safe-buffer. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> *)

@jspm/core/nodelibs/browser/assert.js:
  (*!
   * The buffer module from node.js, for the browser.
   *
   * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
   * @license  MIT
   *)

@noble/curves/esm/utils.js:
@noble/curves/esm/abstract/modular.js:
@noble/curves/esm/abstract/curve.js:
@noble/curves/esm/abstract/weierstrass.js:
@noble/curves/esm/_shortw_utils.js:
@noble/curves/esm/secp256k1.js:
  (*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) *)
*/
