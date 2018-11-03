/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/uuid/index.js":
/*!************************************!*\
  !*** ./node_modules/uuid/index.js ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var v1 = __webpack_require__(/*! ./v1 */ "./node_modules/uuid/v1.js");
var v4 = __webpack_require__(/*! ./v4 */ "./node_modules/uuid/v4.js");

var uuid = v4;
uuid.v1 = v1;
uuid.v4 = v4;

module.exports = uuid;


/***/ }),

/***/ "./node_modules/uuid/lib/bytesToUuid.js":
/*!**********************************************!*\
  !*** ./node_modules/uuid/lib/bytesToUuid.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * Convert array of 16 byte values to UUID string format of the form:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 */
var byteToHex = [];
for (var i = 0; i < 256; ++i) {
  byteToHex[i] = (i + 0x100).toString(16).substr(1);
}

function bytesToUuid(buf, offset) {
  var i = offset || 0;
  var bth = byteToHex;
  // join used to fix memory issue caused by concatenation: https://bugs.chromium.org/p/v8/issues/detail?id=3175#c4
  return ([bth[buf[i++]], bth[buf[i++]], 
	bth[buf[i++]], bth[buf[i++]], '-',
	bth[buf[i++]], bth[buf[i++]], '-',
	bth[buf[i++]], bth[buf[i++]], '-',
	bth[buf[i++]], bth[buf[i++]], '-',
	bth[buf[i++]], bth[buf[i++]],
	bth[buf[i++]], bth[buf[i++]],
	bth[buf[i++]], bth[buf[i++]]]).join('');
}

module.exports = bytesToUuid;


/***/ }),

/***/ "./node_modules/uuid/lib/rng-browser.js":
/*!**********************************************!*\
  !*** ./node_modules/uuid/lib/rng-browser.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

// Unique ID creation requires a high quality random # generator.  In the
// browser this is a little complicated due to unknown quality of Math.random()
// and inconsistent support for the `crypto` API.  We do the best we can via
// feature-detection

// getRandomValues needs to be invoked in a context where "this" is a Crypto
// implementation. Also, find the complete implementation of crypto on IE11.
var getRandomValues = (typeof(crypto) != 'undefined' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto)) ||
                      (typeof(msCrypto) != 'undefined' && typeof window.msCrypto.getRandomValues == 'function' && msCrypto.getRandomValues.bind(msCrypto));

if (getRandomValues) {
  // WHATWG crypto RNG - http://wiki.whatwg.org/wiki/Crypto
  var rnds8 = new Uint8Array(16); // eslint-disable-line no-undef

  module.exports = function whatwgRNG() {
    getRandomValues(rnds8);
    return rnds8;
  };
} else {
  // Math.random()-based (RNG)
  //
  // If all else fails, use Math.random().  It's fast, but is of unspecified
  // quality.
  var rnds = new Array(16);

  module.exports = function mathRNG() {
    for (var i = 0, r; i < 16; i++) {
      if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
      rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
    }

    return rnds;
  };
}


/***/ }),

/***/ "./node_modules/uuid/v1.js":
/*!*********************************!*\
  !*** ./node_modules/uuid/v1.js ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var rng = __webpack_require__(/*! ./lib/rng */ "./node_modules/uuid/lib/rng-browser.js");
var bytesToUuid = __webpack_require__(/*! ./lib/bytesToUuid */ "./node_modules/uuid/lib/bytesToUuid.js");

// **`v1()` - Generate time-based UUID**
//
// Inspired by https://github.com/LiosK/UUID.js
// and http://docs.python.org/library/uuid.html

var _nodeId;
var _clockseq;

// Previous uuid creation time
var _lastMSecs = 0;
var _lastNSecs = 0;

// See https://github.com/broofa/node-uuid for API details
function v1(options, buf, offset) {
  var i = buf && offset || 0;
  var b = buf || [];

  options = options || {};
  var node = options.node || _nodeId;
  var clockseq = options.clockseq !== undefined ? options.clockseq : _clockseq;

  // node and clockseq need to be initialized to random values if they're not
  // specified.  We do this lazily to minimize issues related to insufficient
  // system entropy.  See #189
  if (node == null || clockseq == null) {
    var seedBytes = rng();
    if (node == null) {
      // Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
      node = _nodeId = [
        seedBytes[0] | 0x01,
        seedBytes[1], seedBytes[2], seedBytes[3], seedBytes[4], seedBytes[5]
      ];
    }
    if (clockseq == null) {
      // Per 4.2.2, randomize (14 bit) clockseq
      clockseq = _clockseq = (seedBytes[6] << 8 | seedBytes[7]) & 0x3fff;
    }
  }

  // UUID timestamps are 100 nano-second units since the Gregorian epoch,
  // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
  // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
  // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.
  var msecs = options.msecs !== undefined ? options.msecs : new Date().getTime();

  // Per 4.2.1.2, use count of uuid's generated during the current clock
  // cycle to simulate higher resolution clock
  var nsecs = options.nsecs !== undefined ? options.nsecs : _lastNSecs + 1;

  // Time since last uuid creation (in msecs)
  var dt = (msecs - _lastMSecs) + (nsecs - _lastNSecs)/10000;

  // Per 4.2.1.2, Bump clockseq on clock regression
  if (dt < 0 && options.clockseq === undefined) {
    clockseq = clockseq + 1 & 0x3fff;
  }

  // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
  // time interval
  if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === undefined) {
    nsecs = 0;
  }

  // Per 4.2.1.2 Throw error if too many uuids are requested
  if (nsecs >= 10000) {
    throw new Error('uuid.v1(): Can\'t create more than 10M uuids/sec');
  }

  _lastMSecs = msecs;
  _lastNSecs = nsecs;
  _clockseq = clockseq;

  // Per 4.1.4 - Convert from unix epoch to Gregorian epoch
  msecs += 12219292800000;

  // `time_low`
  var tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
  b[i++] = tl >>> 24 & 0xff;
  b[i++] = tl >>> 16 & 0xff;
  b[i++] = tl >>> 8 & 0xff;
  b[i++] = tl & 0xff;

  // `time_mid`
  var tmh = (msecs / 0x100000000 * 10000) & 0xfffffff;
  b[i++] = tmh >>> 8 & 0xff;
  b[i++] = tmh & 0xff;

  // `time_high_and_version`
  b[i++] = tmh >>> 24 & 0xf | 0x10; // include version
  b[i++] = tmh >>> 16 & 0xff;

  // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)
  b[i++] = clockseq >>> 8 | 0x80;

  // `clock_seq_low`
  b[i++] = clockseq & 0xff;

  // `node`
  for (var n = 0; n < 6; ++n) {
    b[i + n] = node[n];
  }

  return buf ? buf : bytesToUuid(b);
}

module.exports = v1;


/***/ }),

/***/ "./node_modules/uuid/v4.js":
/*!*********************************!*\
  !*** ./node_modules/uuid/v4.js ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var rng = __webpack_require__(/*! ./lib/rng */ "./node_modules/uuid/lib/rng-browser.js");
var bytesToUuid = __webpack_require__(/*! ./lib/bytesToUuid */ "./node_modules/uuid/lib/bytesToUuid.js");

function v4(options, buf, offset) {
  var i = buf && offset || 0;

  if (typeof(options) == 'string') {
    buf = options === 'binary' ? new Array(16) : null;
    options = null;
  }
  options = options || {};

  var rnds = options.random || (options.rng || rng)();

  // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
  rnds[6] = (rnds[6] & 0x0f) | 0x40;
  rnds[8] = (rnds[8] & 0x3f) | 0x80;

  // Copy bytes to buffer, if provided
  if (buf) {
    for (var ii = 0; ii < 16; ++ii) {
      buf[i + ii] = rnds[ii];
    }
  }

  return buf || bytesToUuid(rnds);
}

module.exports = v4;


/***/ }),

/***/ "./src/config.js":
/*!***********************!*\
  !*** ./src/config.js ***!
  \***********************/
/*! exports provided: Config, config */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Config", function() { return Config; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "config", function() { return config; });
/* harmony import */ var _web_socket_service__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./web-socket.service */ "./src/web-socket.service.js");
/* harmony import */ var _my_event_class__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./my-event.class */ "./src/my-event.class.js");
/* harmony import */ var _ui__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./ui */ "./src/ui.js");




class Config extends _my_event_class__WEBPACK_IMPORTED_MODULE_1__["MyEvent"] {
  constructor() {
    super();
    this.data = {
      recordDir: 'files',
    };
    _web_socket_service__WEBPACK_IMPORTED_MODULE_0__["socket"].addHandler('config/all', (data) => {
      Object.assign(this.data, data);
      this.emit(this.data);
    });
    _web_socket_service__WEBPACK_IMPORTED_MODULE_0__["socket"].sendData('config/fetch');

    /** wait till config is ready */
    this.resolved = new Promise((resolve, reject) => {
      this.once((value) => {
        console.log('config received', config.getAll());

        resolve(value);
      });
      setTimeout(() => reject(new Error('timeout')), 2000);
    });
  }

  /**
   * @param {string} prop
   * @param {*} value
   */
  set(prop, value) {
    _web_socket_service__WEBPACK_IMPORTED_MODULE_0__["socket"].sendData('config/patch', { [prop]: value });
    this.data[prop] = value;
    this.emit(this.data);
  }

  getAll() {
    return this.data;
  }

  /**
   * @param {string} prop
   */
  get(prop) {
    return this.data[prop];
  }
}

const config = new Config();

config.on(() => {
  _ui__WEBPACK_IMPORTED_MODULE_2__["ui"].set('wsUri', config.get('wsUri'));
});


/***/ }),

/***/ "./src/files.js":
/*!**********************!*\
  !*** ./src/files.js ***!
  \**********************/
/*! exports provided: Files, files */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Files", function() { return Files; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "files", function() { return files; });
/* harmony import */ var _web_socket_service__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./web-socket.service */ "./src/web-socket.service.js");
/* harmony import */ var _ui__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ui */ "./src/ui.js");



class Files {
  constructor() {
    this.list = [];
    this.html = '';
    this.assingSocketListeners();
    this.refresh();
  }

  assingSocketListeners() {
    _web_socket_service__WEBPACK_IMPORTED_MODULE_0__["socket"].addHandler('files/list', (data) => {
      this.list = data;
      this.html = this.list.map(file => `<div><a>${file}</a></div>`).join('\n');
      _ui__WEBPACK_IMPORTED_MODULE_1__["ui"].set('fileList', this.html);
      _ui__WEBPACK_IMPORTED_MODULE_1__["ui"].enliveFileList();
    });
  }

  refresh() {
    _web_socket_service__WEBPACK_IMPORTED_MODULE_0__["socket"].sendData('files/request', '');
  }
}

const files = new Files();


/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _config__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./config */ "./src/config.js");
/* harmony import */ var _kurento_node_class__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./kurento-node.class */ "./src/kurento-node.class.js");
/* harmony import */ var _ui__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./ui */ "./src/ui.js");
/* harmony import */ var _files__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./files */ "./src/files.js");
//@ts-check



 // eslint-disable-line


const videoInput = document.getElementById('videoInput');
const videoOutput = document.getElementById('videoOutput');


_config__WEBPACK_IMPORTED_MODULE_0__["config"].resolved.then(() => {
  const kurento = new _kurento_node_class__WEBPACK_IMPORTED_MODULE_1__["KurentoNode"]({
    videoInput,
    videoOutput,
  });

  //@ts-ignore
  window.kurento = kurento;

  _ui__WEBPACK_IMPORTED_MODULE_2__["ui"].elements.videoInput_icon.onclick = () => {
    if (kurento.lock.play) {
      return;
    }
    if (!kurento.isPlaying) {
      kurento.start()
        .then(() => {
          _ui__WEBPACK_IMPORTED_MODULE_2__["ui"].toggleVideo();
          _ui__WEBPACK_IMPORTED_MODULE_2__["ui"].toggleRecButtonView();
        })
        .catch(() => _ui__WEBPACK_IMPORTED_MODULE_2__["ui"].logAppend('kurento', 'start error'));
    } else {
      kurento.stop()
        .then(() => {
          _ui__WEBPACK_IMPORTED_MODULE_2__["ui"].toggleVideo();
          _ui__WEBPACK_IMPORTED_MODULE_2__["ui"].toggleRecButtonView();
        })
        .catch(() => _ui__WEBPACK_IMPORTED_MODULE_2__["ui"].logAppend('kurento', 'stop error'));
    }
  };

  _ui__WEBPACK_IMPORTED_MODULE_2__["ui"].elements.rec_icon.onclick = () => {
    if (kurento.lock.record) {
      return;
    }
    if (!kurento.isPlaying) {
      return;
    }
    kurento.toggleRecord();
  };
});


/***/ }),

/***/ "./src/kurento-node.class.js":
/*!***********************************!*\
  !*** ./src/kurento-node.class.js ***!
  \***********************************/
/*! exports provided: KurentoNode */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "KurentoNode", function() { return KurentoNode; });
/* harmony import */ var _web_socket_service__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./web-socket.service */ "./src/web-socket.service.js");
/* harmony import */ var _ui__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./ui */ "./src/ui.js");
/* harmony import */ var _files__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./files */ "./src/files.js");




const kurentoUtils = window.kurentoUtils;

class KurentoNode {
  constructor({
    videoInput,
    videoOutput,
  }) {
    this.videoInput = videoInput;
    this.videoOutput = videoOutput;
    this.lock = {
      record: false,
      play: false,
    };
  }

  async start() {
    console.log('kurento constructor');
    this.lock.play = true;
    this.webRtcPeer = null;
    this.localCandidates = [];
    this.remoteCandidates = [];
    this.offer = '';
    this.answer = '';
    this.isRecording = undefined;
    this.isPlaying = true;

    this.options = this.createOptions('relay');

    this.offer = await this.generateOffer(this.options);
    this.listenSocket();
    this.listenCandidates();
    _web_socket_service__WEBPACK_IMPORTED_MODULE_0__["socket"].sendData('media/offer', this.offer);
    return true;
  }

  async stop() {
    _web_socket_service__WEBPACK_IMPORTED_MODULE_0__["socket"].sendData('media/stop', '');
    this.isPlaying = false;
    return true;
  }

  createOptions(iceTransportPolicy) {
    return {
      localVideo: this.videoInput,
      remoteVideo: this.videoOutput,
      iceTransportPolicy,
    };
  }

  /**
   *
   * @param {*} options
   * @returns {Promise<string>}
   */
  generateOffer(options) {
    return new Promise((resolve, reject) => {
      /** @type {WebRtcPeerSendrecv} */
      this.webRtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerSendrecv(options, function (error) {
        if (error) {
          reject(error);
        }

        this.generateOffer((errorOffer, offer) => {
          if (errorOffer) {
            reject(errorOffer);
          }
          _ui__WEBPACK_IMPORTED_MODULE_1__["ui"].logAppend('sdp', 'offer generated');
          resolve(offer);
        });
      });
    });

  }

  listenCandidates() {
    this.webRtcPeer.on('icecandidate', (event) => {
      this.localCandidates.push(event);
      _web_socket_service__WEBPACK_IMPORTED_MODULE_0__["socket"].sendData('media/localCandidate', event);
    });
  }

  listenSocket() {
    _web_socket_service__WEBPACK_IMPORTED_MODULE_0__["socket"].setHandler('media/remoteCandidate', (data) => {
      this.remoteCandidates.push(data);
      if (this.webRtcPeer) {
        this.webRtcPeer.addIceCandidate(data);
      }
    });

    _web_socket_service__WEBPACK_IMPORTED_MODULE_0__["socket"].setHandler('media/answer', (answer) => {
      this.answer = answer;
      this.webRtcPeer.processAnswer(this.answer);
      _ui__WEBPACK_IMPORTED_MODULE_1__["ui"].logAppend('sdp', 'answer processed');
      console.log('answer processed');
      _web_socket_service__WEBPACK_IMPORTED_MODULE_0__["socket"].sendData('media/mirror');
      this.lock.play = false;
    });

    _web_socket_service__WEBPACK_IMPORTED_MODULE_0__["socket"].setHandler('media/event', (event) => {
      delete event.tags;
      delete event.timestamp;
      delete event.componentId;
      delete event.streamId;
      delete event.padName;
      console.log({ [event.type]: event });
    });

    _web_socket_service__WEBPACK_IMPORTED_MODULE_0__["socket"].setHandler('media/record-started', (fileName) => {
      _ui__WEBPACK_IMPORTED_MODULE_1__["ui"].set('recordStatus', `Recording ${fileName}`);
      _ui__WEBPACK_IMPORTED_MODULE_1__["ui"].toggleRecBorder();
      this.lock.record = false;
      this.isRecording = true;
    });

    _web_socket_service__WEBPACK_IMPORTED_MODULE_0__["socket"].setHandler('media/stopped', () => {
      if (this.webRtcPeer) {
        this.webRtcPeer.dispose();
        this.webRtcPeer = null;
      }
      _ui__WEBPACK_IMPORTED_MODULE_1__["ui"].set('recordStatus', '');
      _ui__WEBPACK_IMPORTED_MODULE_1__["ui"].logAppend('media', 'stopped');
      this.lock.play = false;
    });
  }

  toggleRecord() {
    if (!this.webRtcPeer) {
      return false;
    }

    if (!this.isRecording) {
      // start record
      _web_socket_service__WEBPACK_IMPORTED_MODULE_0__["socket"].sendData('media/record-start');
      _web_socket_service__WEBPACK_IMPORTED_MODULE_0__["socket"].sendData('media/record-start-tofile');
    } else {
      // stop record
      _web_socket_service__WEBPACK_IMPORTED_MODULE_0__["socket"].sendData('media/record-stop');
      _ui__WEBPACK_IMPORTED_MODULE_1__["ui"].set('recordStatus', '');
      _ui__WEBPACK_IMPORTED_MODULE_1__["ui"].toggleRecBorder();
      _files__WEBPACK_IMPORTED_MODULE_2__["files"].refresh();
      this.isRecording = false;
    }
  }


}


/***/ }),

/***/ "./src/my-event.class.js":
/*!*******************************!*\
  !*** ./src/my-event.class.js ***!
  \*******************************/
/*! exports provided: MyEvent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MyEvent", function() { return MyEvent; });
class MyEvent {
  constructor() {
    this.listeners = [];
    this.onetimers = [];
    this.value = undefined;
    this.addEventListener = this.on;
    this.removeListener = this.off;
  }

  emit(value) {
    this.value = value;
    this.onetimers.forEach(cb => cb(value));
    this.onetimers = [];
    this.listeners.forEach(cb => cb(value));
  }

  /**
   * @callback MyEventListener
   * @param {*} value
   */

  /**
   * @param {MyEventListener} cb
   */
  on(cb) {
    this.listeners.push(cb);
  }

  once(cb) {
    this.onetimers.push(cb);
  }

  off(cb) {
    this.listeners = this.listeners.filter(_cb => _cb !== cb);
  }

  removeAllListeners() {
    this.listeners = [];
  }
}


/***/ }),

/***/ "./src/ui.js":
/*!*******************!*\
  !*** ./src/ui.js ***!
  \*******************/
/*! exports provided: UI, ui */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "UI", function() { return UI; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ui", function() { return ui; });
/* harmony import */ var _web_socket_service__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./web-socket.service */ "./src/web-socket.service.js");


class UI {
  constructor() {
    this.values = {};
    this.defaults = {};
    this.elements = {
      /** @type {HTMLSpanElement} */
      wsUri: document.querySelector('#wsUri'),
      /** @type {HTMLSpanElement} */
      recordStatus: document.querySelector('#recordStatus'),
      /** @type {HTMLDivElement} */
      fileList: document.querySelector('#filelist'),
      /** @type {HTMLVideoElement} */
      videoInput: document.querySelector('#videoInput'),
      /** @type {HTMLVideoElement} */
      videoOutput: document.querySelector('#videoOutput'),
      /** @type {HTMLVideoElement} */
      playerOutput: document.querySelector('#playerOutput'),
      /** @type {HTMLDivElement} */
      log: document.querySelector('#log'),
      /** @type {HTMLDivElement} */
      videoInput_icon: document.querySelector('#videoInput_icon'),
      /** @type {HTMLImageElement} */
      play_icon: document.querySelector('#play_icon'),
      /** @type {HTMLImageElement} */
      stop_icon: document.querySelector('#stop_icon'),
      /** @type {HTMLImageElement} */
      rec_icon: document.querySelector('#rec_icon'),
    };
    Object.keys(this.elements).forEach((prop) => {
      this.defaults[prop] = this.elements[prop].innerHTML;
    });
    this.listenSocket();
  }

  set(prop, value) {
    /** @type {HTMLElement} */
    const element = this.elements[prop];
    if (element instanceof HTMLElement) {
      this.values[prop] = value;
      element.innerHTML = value;
    }
  }

  reset(prop) {
    /** @type {HTMLElement} */
    const element = this.elements[prop];
    if (element instanceof HTMLElement) {
      element.innerHTML = this.defaults[prop];
    }
  }

  unreset(prop) {
    /** @type {HTMLElement} */
    const element = this.elements[prop];
    if (element instanceof HTMLElement) {
      element.innerHTML = this.values[prop];
    }
  }

  logAppend(type = '', message) {
    const div = document.createElement('div');
    const strong = document.createElement('strong');
    const span = document.createElement('span');
    strong.innerText = `${type} `;
    span.innerText = message;
    div.appendChild(strong);
    div.appendChild(span);
    this.elements.log.appendChild(div);
  }

  enliveFileList() {
    const list = Array.from(this.elements.fileList.querySelectorAll('a'));
    list.forEach((a) => {
      a.onclick = () => {

        list.forEach((a1) => {
          a1.classList.remove('active');
        });
        a.isActive = !a.isActive;
        if (a.isActive) {
          a.classList.add('active');
          this.elements.playerOutput.src = a.innerText;
          this.elements.playerOutput.play();
        } else {
          a.classList.remove('active');
          this.elements.playerOutput.pause();
        }
      };
    });
  }

  toggleVideo() {
    this.elements.play_icon.style.display = this.elements.play_icon.style.display
      ? ''
      : 'none';
    this.elements.stop_icon.style.display = this.elements.stop_icon.style.display
      ? ''
      : 'none';
  }

  toggleRecButtonView() {
    this.elements.rec_icon.style.display = this.elements.rec_icon.style.display
      ? ''
      : 'none';
  }

  toggleRecBorder() {
    const boderStyle = '2px solid red';
    this.elements.videoOutput.style.border = this.elements.videoOutput.style.border === boderStyle
      ? ''
      : boderStyle;
  }

  listenSocket() {
    _web_socket_service__WEBPACK_IMPORTED_MODULE_0__["socket"].setHandler('log/append', (data) => {
      this.logAppend(data.type || data.header, data.message);
    });
  }

}


const ui = new UI();


/***/ }),

/***/ "./src/web-socket.service.js":
/*!***********************************!*\
  !*** ./src/web-socket.service.js ***!
  \***********************************/
/*! exports provided: WS, socket */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "WS", function() { return WS; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "socket", function() { return socket; });
/* harmony import */ var uuid__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! uuid */ "./node_modules/uuid/index.js");
/* harmony import */ var uuid__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(uuid__WEBPACK_IMPORTED_MODULE_0__);

const URI = `wss://${window.location.hostname}:${window.location.port}/ws`;

class WS {
  constructor(uri) {
    /** @type {WebSocket} */
    this.socket = new WebSocket(uri);
    this.sessionId = Object(uuid__WEBPACK_IMPORTED_MODULE_0__["v4"])();
    this.handlers = {};
    this.waitings = [];

    this.socket.onmessage = ({ data }) => {
      // console.log(data);

      try {
        const dataParsed = JSON.parse(data);
        /** @type {function[]} */
        const handlers = [].concat(this.handlers[dataParsed.type] || []);
        handlers.forEach((func) => {
          func(dataParsed.data);
        });
      } catch (error) {
        console.error(error);
      }
    };


    this.socket.onopen = () => {
      this.socket.send(JSON.stringify({
        type: 'session/greetings',
        sessionId: this.sessionId,
      }));

      this.waitings.forEach(func => func());
    };
  }


  /**
   * @param {string} type
   * @param {*} data
   */
  sendData(type, data = '') {
    const msg = JSON.stringify({
      type,
      data,
      sessionId: this.sessionId,
    });
    if (this.socket.readyState === 1) {
      this.socket.send(msg);
    } else {
      this.waitings.push(() => this.socket.send(msg));
    }
  }

  /**
   * @callback wsHandlerCallback
   * @param {*} data
   */

  /**
   * @param {string} prop
   * @param {wsHandlerCallback} handler
   */
  addHandler(prop, handler) {
    if (Array.isArray(this.handlers[prop])) {
      this.handlers[prop].push(handler);
    } else {
      this.handlers[prop] = [handler];
    }
  }

  /**
   * @param {string} prop
   */
  clearHandlers(prop) {
    this.handlers[prop] = null;
  }

  /**
   * @param {string} prop
   * @param {wsHandlerCallback} handler
   */
  setHandler(prop, handler) {
    this.clearHandlers(prop);
    this.addHandler(prop, handler);
  }
}

const socket = new WS(URI);

socket.setHandler('session/ping', () => socket.sendData('pong', ''));


/***/ })

/******/ });
//# sourceMappingURL=bundle.js.map