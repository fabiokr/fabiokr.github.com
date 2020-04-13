
;
"use strict";

/* eslint-disable */
(function (global) {
  var CE2babelHelpers = global.CE2babelHelpers = {};

  function _typeof(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      CE2babelHelpers.typeof = _typeof = function _typeof(obj) {
        return typeof obj;
      };
    } else {
      CE2babelHelpers.typeof = _typeof = function _typeof(obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  CE2babelHelpers.typeof = _typeof;

  function _toConsumableArray(arr) {
    return CE2babelHelpers.arrayWithoutHoles(arr) || CE2babelHelpers.iterableToArray(arr) || CE2babelHelpers.unsupportedIterableToArray(arr) || CE2babelHelpers.nonIterableSpread();
  }

  CE2babelHelpers.toConsumableArray = _toConsumableArray;

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) return CE2babelHelpers.arrayLikeToArray(arr);
  }

  CE2babelHelpers.arrayWithoutHoles = _arrayWithoutHoles;

  function _iterableToArray(iter) {
    if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
  }

  CE2babelHelpers.iterableToArray = _iterableToArray;

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return CE2babelHelpers.arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(n);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return CE2babelHelpers.arrayLikeToArray(o, minLen);
  }

  CE2babelHelpers.unsupportedIterableToArray = _unsupportedIterableToArray;

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) {
      arr2[i] = arr[i];
    }

    return arr2;
  }

  CE2babelHelpers.arrayLikeToArray = _arrayLikeToArray;

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  CE2babelHelpers.nonIterableSpread = _nonIterableSpread;
})(typeof global === "undefined" ? self : global);


;
"use strict";

if ((typeof CE2 === "undefined" ? "undefined" : CE2babelHelpers.typeof(CE2)) === 'object' && CE2.uid) {
  throw new Error('CE: multiple userscripts installed');
}

if (typeof CE2 == 'undefined') CE2 = {};
CE2.uid = 781224;
CE2.USER_SCRIPT_VERSION = 1586802008;
CE2.__CE_HOST__ = "https://app.crazyegg.com"

;
"use strict";

;
"use strict";

if (typeof CE2 === 'undefined') CE2 = {};
CE2.ignoredElements = [];
CE2.clickCaptors = []; // Shortcuts

CE2.d = document;
CE2.w = window;
CE2.n = navigator; // Pending snapshots

CE2.p = {};

(function () {
  var ua = CE2.n.userAgent;

  if (/\bMSIE\b/.test(ua)) {
    CE2.ie = 1;
    CE2.ieVersion = parseInt(/MSIE (\d+)\.\d+/.exec(ua)[1], 10);
    CE2.ieQuirksMode = CE2.d.compatMode == 'BackCompat';
  }
})();

CE2.ignore = function (el) {
  if (!el) return;
  CE2.ignoredElements.push(el);
  if (CE2.tracker) CE2.tracker.ignoredElements.push(el);
};

CE2.capture = function (el) {
  CE2.clickCaptors.push(el);
  if (CE2.tracker) CE2.tracker.clickCaptors.push(el);
};

CE2.findMatchingSnapshot = function (snapshots, url, name, variantId, googleOptimize, ip) {
  var i;
  var snapshot;
  var result;
  if (!(snapshots && snapshots.length)) return;
  var now = Math.floor(CE2._sampling.getAdjustedDate() / 1000);

  for (i = 0; snapshot = snapshots[i++];) {
    if (snapshot.e && snapshot.e <= now) {
      // snapshot has expired, skip it
      continue;
    }

    if (name && !/n/.test(snapshot.o || '') || googleOptimize && !/go/.test(snapshot.o || '')) {
      // page is named, but snapshot isn't
      continue;
    }

    if (CE2.isMatchingSnapshot(snapshot, url, name, variantId, googleOptimize, ip)) {
      if (snapshot.s && snapshot.s > now) {
        // snapshot is still pending (starts_at is in the future)
        CE2.p[snapshot.id] = snapshot;
      } else if (!result) {
        // if a result hasn't been found yet, set result to the current
        // snapshot
        result = snapshot;
      }
    }
  }

  return result;
};

CE2.isMatchingSnapshot = function (snapshot, url, name, variantId, googleOptimize, ip) {
  if (snapshot.isBlocked === undefined) {
    snapshot.isBlocked = new CE2.IPBlockList(snapshot.ip).blocked(ip);
  }

  if (snapshot.isBlocked) {
    return false;
  }

  if (snapshot.v >= 11 && CE2.isBot()) {
    return false;
  } // if variant Id is passed we need to track corresponding snapshot only


  if (variantId) {
    return variantId == snapshot.vid;
  }

  if (!variantId && snapshot.vid) {
    // if not, we need to exclude snapshots, participating in flow tracking
    return false;
  }

  if (googleOptimize) {
    return CE2.matchURL(snapshot.u, googleOptimize, snapshot.o, snapshot.d, CE2.n.userAgent);
  }

  return CE2.matchURL(snapshot.u, name || url, snapshot.o, snapshot.d, CE2.n.userAgent);
};

CE2.loadTrackingScript = function (callback) {
  if (!CE2.SPLIT_TRACKERS || CE2.TRACKING_SCRIPT_LOADED) {
    if (callback) {
      callback();
    }

    return;
  }

  CE2.TRACKING_SCRIPT_CALLBACK = callback; // safeguard against multiple includes

  if (CE2.TRACKING_SCRIPT_INCLUDED) {
    return;
  }

  CE2.debug('Loading tracking script...');
  var script = CE2.d.createElement('script');
  var scriptSrc = CE2.w.location.protocol == 'https:' ? CE2.TRACKING_SCRIPT_SECURE : CE2.TRACKING_SCRIPT;
  script.src = scriptSrc;
  script.type = 'text/javascript';
  script.async = true;
  CE2.d.body.appendChild(script);
  CE2.TRACKING_SCRIPT_INCLUDED = true;
  return false;
};

CE2.startSnapshotTracking = function (snapshot, recordingSessionId) {
  var trackerClass = CE2.V11Tracker;
  var trackerVersion = 11;
  var snapshotId;

  if (snapshot && snapshot.v >= 6 && snapshot.v <= 7) {
    trackerClass = CE2.V6Tracker;
    trackerVersion = 6;
  }

  var log = [];

  if (snapshot) {
    log.push("SNAPSHOT_ID=".concat(snapshot.id));
  }

  if (recordingSessionId) {
    log.push("SESSION=".concat(recordingSessionId));
  }

  CE2.debug("Preparing Tracker TRACKER=".concat(trackerVersion, " ").concat(log.join(' '))); // evaluate snapshot tracking

  if (snapshot && CE2.sampleVisit(snapshot)) {
    snapshotId = snapshot.id;
    CE2.testID = snapshot.id;
    CE2.testVersion = snapshot.v || 1;
  }

  if (snapshotId || recordingSessionId) {
    CE2.debug("Starting V".concat(trackerVersion, "Tracker"));

    if (CE2.tracker) {
      CE2.tracker.cleanup();
    }

    CE2.tracker = new trackerClass(trackerVersion, snapshotId, recordingSessionId);
  } else {
    CE2.debug('No tracker started.');
  }
};

CE2.unescape = function (s) {
  try {
    return decodeURIComponent(s);
  } catch (e) {
    return unescape(s);
  }
};

CE2.qs2obj = function (qs, sep) {
  if (qs == null || /^\s*$/.test(qs)) return null;
  var rv = {};
  var item = null;
  var pairs = qs.replace(/\+/g, ' ').split(sep || '&');
  var i;
  var l;

  for (i = 0, l = pairs.length; i < l; i++) {
    item = pairs[i].split('=');
    if (!item[0]) continue;
    rv[CE2.unescape(item[0])] = item[1] == null ? null : CE2.unescape(item[1]);
  }

  return rv;
};

CE2.each = function (obj, fn, self) {
  if (!obj) return;
  var value;

  if (typeof obj.length === 'number' && typeof obj.concat === 'function') {
    // Array
    for (var i = 0, l = obj.length; i < l; i++) {
      value = obj[i];
      if (fn.call(self, value, i) === false) break;
    }
  } else {
    // Object
    var key;

    for (key in obj) {
      value = obj[key];

      if (value !== Object.prototype[key]) {
        if (fn.call(self, value, key) === false) break;
      }
    }
  }
};

CE2.indexOf = function (arr, value, index) {
  var i;
  var l;

  for (i = index || 0, l = arr.length; i < l; i++) {
    if (arr[i] === value) return i;
  }

  return -1;
};

CE2.listen = CE2.addListener = function (target, evt, fn) {
  if (target.addEventListener) target.addEventListener(evt, fn, true);else target.attachEvent("on".concat(evt), fn);
};

CE2.removeListener = function (target, evt, fn) {
  if (target.removeEventListener) target.removeEventListener(evt, fn, true);else target.detachEvent("on".concat(evt), fn);
};

CE2.userData = {};

CE2.set = function (index, value) {
  index = parseInt(index, 10);

  if (index >= 1 && index <= 5) {
    CE2.userData[index] = String(value);
  }
};

CE2.click = function () {
  var _CE2$tracker;

  if (CE2.tracker) return (_CE2$tracker = CE2.tracker).click.apply(_CE2$tracker, arguments);
};

if (!CE2.getBox) {
  // This will be overwritten with a non-noop function if the tracking script is loaded
  CE2.getBox = function () {};
}

CE2.sampleVisit = function (snapshot) {
  // no sampling ratio specified for this snapshot
  if (snapshot.r == null) return true; // check if this visit has already been rejected or selected

  if (snapshot.r !== false && snapshot.r !== true) {
    if (Math.random() >= 1 / snapshot.r) {
      // This visit did not make it into the sample. Turn off tracking of this
      // snapshot by setting snapshot.r to false. This state is stored with a JS
      // variable--rather than a cookie--so that the user can return to this
      // page and potentially be included in the sample. The intention is to
      // sample visits, not visitors.
      snapshot.r = false;
    } else {
      snapshot.r = true;
    }
  }

  return snapshot.r;
};

CE2.dontTrack = function (win, doc, nav, ie) {
  // IE8+ "Private browswing" mode.
  if (ie && typeof win.external !== 'undefined') {
    try {
      if (win.external.InPrivateFilteringEnabled() === true) return true;
    } catch (e) {// ignore error
    }
  }

  var dnt = doc.doNotTrack || nav.doNotTrack || nav.msDoNotTrack || win.doNotTrack;
  return dnt == '1' || dnt == 'yes';
};

CE2.cookies = function () {
  try {
    return CE2.qs2obj(document.cookie, /;\s*/g) || {};
  } catch (e) {
    return {// ignore error
    };
  }
}();

CE2.writeCookie = function (key, value, params) {
  if (!params) {
    params = {};
  }

  var encode = encodeURIComponent;
  var _CE = CE2,
      cookies = _CE.cookies;
  var path = params.path || '/';
  var domain = params.domain || new CE2.URI(CE2.w.location.href).getDomain();
  var expires = null;

  if (params.expires) {
    expires = params.expires;
  } else if (params.expiresIn) {
    // expires in seconds value
    expires = new Date(new Date().getTime() + params.expiresIn * 1000);
  } else if (params.expiresInDays) {
    // expires in days value
    expires = new Date(new Date().getTime() + params.expiresInDays * 86400 * 1000);
  }

  if (value == null) {
    delete cookies[key];
    expires = new Date(0);
    value = '';
  } else {
    cookies[key] = value;
  }

  var cookie = ["".concat(encode(key), "=").concat(encode(value))];
  cookie.push("path=".concat(path));
  cookie.push('SameSite=Strict');

  if (domain) {
    cookie.push("domain=".concat(domain));
  }

  if (expires) {
    cookie.push("expires=".concat(expires.toUTCString()));
  }

  document.cookie = cookie.join(';');
};

CE2.deleteCookie = function (key, params) {
  CE2.writeCookie(key, null, params);
};

CE2.parseJSON = function (src) {
  if (typeof JSON !== 'undefined' && typeof JSON.parse === 'function') {
    return JSON.parse(src);
  }

  return eval("(".concat(src, ")")); // eslint-disable-line no-eval
};

CE2.convertToFormData = function (params) {
  var formData = new FormData();
  var keys = Object.keys(params);

  for (var i = 0; i < keys.length; i++) {
    formData.append(keys[i], params[keys[i]]);
  }

  return formData;
};

CE2.dasherize = function (str) {
  if (typeof str === 'string') {
    return str.replace(/([a-z\d])([A-Z])/g, '$1_$2').toLowerCase().replace(/[ _]/g, '-');
  }

  return str;
};

CE2.matchSite = function (siteName, pageHost) {
  if (CE2.re.ipHost.test(siteName)) {
    return siteName === pageHost;
  }

  return new RegExp("(^|\\.)".concat(siteName, "$"), 'i').test(pageHost);
};

CE2.normalizeSiteName = function (name) {
  var a = document.createElement('a');
  a.href = "http://".concat(name, "/");
  return a.hostname;
};

CE2.getCurrentSite = function (sites) {
  var site;
  var i;

  for (i = 0; site = sites[i++];) {
    if (CE2.matchSite(CE2.normalizeSiteName(site.name), location.hostname)) {
      return site;
    }
  }
};

CE2.equalObjects = function (a, b) {
  // Create arrays of property names
  var aProps = Object.getOwnPropertyNames(a);
  var bProps = Object.getOwnPropertyNames(b); // If number of properties is different,
  // objects are not equivalent

  if (aProps.length != bProps.length) {
    return false;
  }

  for (var i = 0; i < aProps.length; i++) {
    var propName = aProps[i]; // If values of same property are not equal,
    // objects are not equivalent

    if (a[propName] !== b[propName]) {
      return false;
    }
  } // If we made it this far, objects
  // are considered equivalent


  return true;
};

CE2.matchURLRules = function (urlRules) {
  var i;
  var rule;

  if (urlRules && urlRules.length) {
    for (i = 0; rule = urlRules[i++];) {
      if (CE2.matchURL(rule.u, location.href, rule.o)) {
        return true;
      }
    }
  }

  return false;
};



;
"use strict";

if (typeof CE2 === 'undefined') CE2 = {};

CE2.browser = function () {
  var ua = navigator.userAgent;
  CE2.opera = CE2.ie = CE2.chrome = CE2.safari = CE2.firefox = false;
  var browser = 'unknown';

  if (CE2.w.opera && typeof CE2.w.opera.version === 'function') {
    browser = 'opera';
    CE2.opera = true;
    CE2.operaVersion = parseInt(opera.version(), 10);
  } else if (/\bMSIE\b/.test(ua)) {
    browser = 'ie';
    CE2.ie = true;
    CE2.ieVersion = parseInt(/MSIE (\d+)\.\d+/.exec(navigator.userAgent)[1], 10);
    CE2.ieQuirksMode = document.compatMode == 'BackCompat';
  } else if (/\b(iPhone|iP[ao]d)\b/.test(ua)) {
    browser = 'iphone';
    CE2.iphone = true;
    CE2.webkit = true;
  } else if (/\bChrome\b/.test(ua)) {
    browser = 'chrome';
    CE2.chrome = true;
    CE2.webkit = true;
  } else if (/AppleWebKit/.test(navigator.appVersion)) {
    browser = 'safari';
    CE2.safari = true;
    CE2.webkit = true;
  } else if (/Mozilla/i.test(ua) && !/compatible|webkit/i.test(ua)) {
    browser = 'firefox';
    CE2.firefox = true;
  }

  if (CE2.webkit) CE2.webkitVersion = parseInt(/AppleWebKit\/(\d+)/.exec(ua)[1], 10);
  return browser;
}();

CE2.findByClass = function (className) {
  var result = [];
  var body = CE2.d.body;
  var i;
  var el;
  var elements;
  var pattern;
  if (body.getElementsByClassName) elements = body.getElementsByClassName(className);else if (body.querySelectorAll) elements = body.querySelectorAll(".".concat(className));

  if (elements) {
    for (i = 0; el = elements[i++];) {
      result.push(el);
    }
  } else {
    elements = body.getElementsByTagName('*');
    pattern = new RegExp("(^|\\s)".concat(className, "($|\\s)"));

    for (i = 0; el = elements[i++];) {
      if (el.className && pattern.test(el.className)) result.push(el);
    }
  }

  return result;
};

CE2.formatClass = function (el) {
  var cls = el.className;

  if (cls && typeof cls === 'string') {
    cls = CE2.strip(cls.replace(/(\s|^)-ce-capture\b/g, '')).split(/\s+/);
    cls.sort();
    return cls.join(' ');
  }
};

CE2.href = function (el) {
  if (CE2.ie) {
    var m = el.outerHTML.match(CE2.re.href);
    if (m) return CE2.strip(m[1]);
  } else return el.getAttribute('href');
};

CE2.src = function (src) {
  if (/^\s*data:/.test(src)) {
    return CE2.strip(src).substr(0, 100);
  }

  return new CE2.URI(src).simplify();
};

CE2.eventCoords = function (evt, win) {
  var scroll = CE2.scroll(win);
  return [evt.clientX + scroll.left, evt.clientY + scroll.top];
}; // Returns true if the inner element is the same as--or is contained by--outer.


CE2.contains = function (outer, inner) {
  if (outer == inner) return true;
  if (typeof outer.contains === 'function') return outer.contains(inner);
  var el = inner;

  do {
    el = el.parentNode;
  } while (el && el != document.body && el != outer);

  return el == outer;
}; // Returns the first element in containers that contains or is equal to el, if
// any.


CE2.arrayContains = function (containers, el) {
  var i;
  var c;

  if (containers && containers.length) {
    for (i = 0; c = containers[i++];) {
      if (CE2.contains(c, el)) {
        return c;
      }
    }
  }
};

CE2.isVML = function (el) {
  return typeof el.tagUrn === 'string' && el.tagUrn.indexOf('vml') >= 0;
};

CE2.bind = function (obj, funcName) {
  var fn = obj[funcName];
  return function () {
    try {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return fn.apply(obj, args);
    } catch (e) {// ignore error
    }
  };
};

CE2.TIME_RANGES = [500, 1000, 1500, 2000, 3000, 4000, 5000, 6000, 8000, 10000, 15000, 20000, 30000, 35000, 40000, 60000, 1.5 * 60 * 1000, 2 * 60 * 1000, 3 * 60 * 1000, 4 * 60 * 1000, 5 * 60 * 1000, 7 * 60 * 1000, 10 * 60 * 1000, 15 * 60 * 1000, 20 * 60 * 1000, 25 * 60 * 1000, 30 * 60 * 1000, 40 * 60 * 1000, 50 * 60 * 1000, 60 * 60 * 1000, 2 * 60 * 60 * 1000, 3 * 60 * 60 * 1000, Number.MAX_VALUE];

CE2.getTimeRange = function (ms) {
  var ranges = CE2.TIME_RANGES;

  for (var i = 0, l = ranges.length; i < l; i++) {
    if (ms < ranges[i] && (i == 0 || ms >= ranges[i - 1])) return i + 1;
  }
};

CE2.eventWindow = function (evt) {
  return evt.source || evt.view || evt.srcElement.ownerDocument.parentWindow;
};

CE2.getStyle = function (el) {
  var win = CE2.w;
  var getComputedStyle = win.getComputedStyle;
  return getComputedStyle ? getComputedStyle.call(win, el, null) : el.currentStyle;
}; // Adapted from http://www.codecouch.com/2012/05/adding-document-queryselectorall-support-to-ie-7/


CE2.querySelectorAll = function (selector, one) {
  var _CE = CE2,
      d = _CE.d;

  if (d.querySelectorAll) {
    return one ? d.querySelector(selector) : d.querySelectorAll(selector);
  }

  var c = [];
  var i;
  var j;
  var a = d.all;
  var s = d.createStyleSheet();
  selector = selector.split(/\s*,\s*/);

  for (i = selector.length; i--;) {
    s.addRule(selector[i], 'k:v');

    for (j = a.length; j--;) {
      if (a[j].currentStyle.k) {
        if (one) return a[j];
        c.push(a[j]);
      }
    }

    s.removeRule(0);
  }

  return one ? null : c;
};

CE2.makeId = function (numBytes, allowBase64) {
  var ID_SIZE = 20;
  var crypto = CE2.w.crypto;
  var btoa = typeof CE2.w.btoa === 'function' && CE2.w.btoa;
  var result = '';
  var array;
  var i;
  var hex;
  numBytes = numBytes || ID_SIZE;

  if (crypto && crypto.getRandomValues) {
    var typedArray = new Uint8Array(numBytes);
    crypto.getRandomValues(typedArray); // Convert Uint8Array to an untyped Array

    array = Array.from(typedArray);
  } else {
    array = new Array(numBytes);

    for (i = 0; i < numBytes; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }

  if (allowBase64 && btoa) {
    result = array.map(function (c) {
      return String.fromCharCode(c);
    }).join(''); // Make the base64 string url safe

    return btoa(result).replace(/\+/g, '-').replace(/\//g, '_').replace(/\=+$/, '');
  }

  for (i = 0; i < numBytes; i++) {
    hex = array[i].toString(16);
    result += hex.length < 2 ? "0".concat(hex) : hex;
  }

  return result;
};

CE2.hasAccessToFrame = function (el) {
  var key = "key_".concat(+new Date());

  try {
    var global = el.contentWindow;
    global[key] = 'temp';
    var res = global[key] === 'temp';

    if (res) {
      delete global[key];
    }

    return res;
  } catch (ex) {
    return false;
  }
};

CE2.assign = function () {
  for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    args[_key2] = arguments[_key2];
  }

  var target = args[0];

  if (arguments.length === 1) {
    return target;
  }

  var argumentArray = Array.prototype.slice.call(args);
  var source = argumentArray[1];

  for (var nextKey in source) {
    // Avoid bugs when hasOwnProperty is shadowed
    if (Object.prototype.hasOwnProperty.call(source, nextKey)) {
      target[nextKey] = source[nextKey];
    }
  }

  argumentArray.splice(1, 1);
  return CE2.assign.apply(this, argumentArray);
};

CE2.isVisible = function (elem) {
  var style = CE2.getStyle(elem);
  if (style.display === 'none') return false;
  if (style.visibility === 'hidden') return false;
  if (style.opacity < 0.1) return false;

  if (elem.parentElement) {
    return CE2.isVisible(elem.parentElement);
  }

  return true;
};



;
"use strict";

if (typeof CE2 === 'undefined') CE2 = {}; // Search pattern through a 10x10 grid. Starts near center and "spirals"
// out to edges, eventually traversing the whole grid

CE2.SPIRAL = [[0.4, 0.4], [0.5, 0.4], [0.5, 0.5], [0.4, 0.5], [0.3, 0.5], [0.3, 0.4], [0.3, 0.3], [0.4, 0.3], [0.5, 0.3], [0.6, 0.3], [0.6, 0.4], [0.6, 0.5], [0.6, 0.6], [0.5, 0.6], [0.4, 0.6], [0.3, 0.6], [0.2, 0.6], [0.2, 0.5], [0.2, 0.4], [0.2, 0.3], [0.2, 0.2], [0.3, 0.2], [0.4, 0.2], [0.5, 0.2], [0.6, 0.2], [0.7, 0.2], [0.7, 0.3], [0.7, 0.4], [0.7, 0.5], [0.7, 0.6], [0.7, 0.7], [0.6, 0.7], [0.5, 0.7], [0.4, 0.7], [0.3, 0.7], [0.2, 0.7], [0.1, 0.7], [0.1, 0.6], [0.1, 0.5], [0.1, 0.4], [0.1, 0.3], [0.1, 0.2], [0.1, 0.1], [0.2, 0.1], [0.3, 0.1], [0.4, 0.1], [0.5, 0.1], [0.6, 0.1], [0.7, 0.1], [0.8, 0.1], [0.8, 0.2], [0.8, 0.3], [0.8, 0.4], [0.8, 0.5], [0.8, 0.6], [0.8, 0.7], [0.8, 0.8], [0.7, 0.8], [0.6, 0.8], [0.5, 0.8], [0.4, 0.8], [0.3, 0.8], [0.2, 0.8], [0.1, 0.8], [0, 0.8], [0, 0.7], [0, 0.6], [0, 0.5], [0, 0.4], [0, 0.3], [0, 0.2], [0, 0.1], [0, 0], [0.1, 0], [0.2, 0], [0.3, 0], [0.4, 0], [0.5, 0], [0.6, 0], [0.7, 0], [0.8, 0], [0.9, 0], [0.9, 0.1], [0.9, 0.2], [0.9, 0.3], [0.9, 0.4], [0.9, 0.5], [0.9, 0.6], [0.9, 0.7], [0.9, 0.8], [0.9, 0.9], [0.8, 0.9], [0.7, 0.9], [0.6, 0.9], [0.5, 0.9], [0.4, 0.9], [0.3, 0.9], [0.2, 0.9], [0.1, 0.9], [0, 0.9]]; // Used for memoizing CE2.isStatic per element. The randomized name avoids
// potential clashes with any other custom properties the page might assign to
// DOM elements.

CE2.dynamicKey = "cedk".concat(Math.random().toString().replace(/\D/g, '')); // Used for storing window-specific scrollRoot. The randomized name avoids
// potential clashes with any other custom properties the site's code might
// assign to window.

CE2.scrollRootKey = "cesrk".concat(Math.random().toString().replace(/\D/g, ''));

CE2.ScrollTracker = function () {
  this.strictAnchorSearch = true;
  this.lastRecordedScroll = null;
  this.lastRecordedTime = 0;
  this.lastRecordedY = 0;
  this.idleAt = null;
  this.idleSince = new Date().getTime();
};

CE2.ScrollTracker.prototype = {
  shouldRecordScroll: function shouldRecordScroll(scroll) {
    var scrollTop = scroll.top;
    var scrollHeight = scroll.height;
    var scrollString = "".concat(scrollTop, ":").concat(scrollHeight);
    var now = new Date().getTime();
    if (scrollString == this.lastRecordedScroll) return false;

    if (scrollString == this.idleAt) {
      if (now - this.idleSince >= 800) {
        this.lastRecordedScroll = scrollString;
        this.lastRecordedTime = now;
        this.lastRecordedY = scrollTop;
        return true;
      }
    } else {
      this.idleAt = scrollString;
      this.idleSince = now;
    }

    if (this.lastRecordedScroll == null || Math.abs(scrollTop - this.lastRecordedY) > scrollHeight / 2 && now - this.lastRecordedTime >= 1600) {
      this.lastRecordedScroll = scrollString;
      this.lastRecordedTime = now;
      this.lastRecordedY = scrollTop;
      return true;
    }
  },
  findAnchor: function findAnchor(scroll, callback) {
    if (!CE2.d.elementFromPoint) return callback(scroll);
    var self = this;
    var i = 0;
    var strict = this.strictAnchorSearch;
    var width = scroll.width;
    var height = scroll.height;
    var coord;
    var el;
    var cX;
    var cY;

    var loop = function loop() {
      if (coord = CE2.SPIRAL[i++]) {
        // Search for an appropriate anchor element
        cX = (coord[0] + Math.random() * 0.1) * width;
        cY = (coord[1] + Math.random() * 0.1) * height;
        el = CE2.elementFromPoint(cX, cY, scroll);
        if (CE2.isAnchorElement(el, scroll, strict)) return callback(scroll, el);
        setTimeout(loop, 0);
      } else {
        // If no anchor element was found, search again using less strict criteria
        i = 0;
        self.strictAnchorSearch = strict = false;
        setTimeout(loop, 0);
      }
    };

    setTimeout(loop, 0);
  }
};

CE2.scroll = function (win) {
  var _CE = CE2,
      scrollRootKey = _CE.scrollRootKey;
  var scrollRoot;
  win = win || CE2.w;
  var doc = win.document; // store path specific scroll root to accomdate SPAs

  if (win["".concat(scrollRootKey, "_path")] !== win.location.pathname) {
    win[scrollRootKey] = CE2.findScrollRoot(doc);
    win["".concat(scrollRootKey, "_path")] = win.location.pathname;
  }

  scrollRoot = win[scrollRootKey];
  scrollRoot = scrollRoot || (doc.compatMode === 'BackCompat' ? doc.body : doc.documentElement);
  return {
    left: scrollRoot.toString() === '[object Window]' ? scrollRoot.scrollX : scrollRoot.scrollLeft,
    top: scrollRoot.toString() === '[object Window]' ? scrollRoot.scrollY : scrollRoot.scrollTop,
    width: win.innerWidth,
    height: win.innerHeight
  };
}; // Searches for an element that contains most of the page's content and is a
// scrollable block element


CE2.findScrollRoot = function (doc) {
  var win = doc.defaultView;
  var html = doc.documentElement;

  if (html.scrollHeight > win.innerHeight) {
    return win;
  } // This won't work on really outdated browsers.


  if (!doc.querySelectorAll || typeof doc.body.scrollHeight != 'number') return;
  var body = doc.body;
  var elements = doc.querySelectorAll('html, body, body > *, body > * > *, body > * > * > *');
  var totalElements = body.getElementsByTagName('*').length;
  var i;
  var limit;
  var el;
  var rect;

  for (i = 0, limit = Math.min(7000, elements.length); i < limit; i++) {
    el = elements[i]; // is it scrollable

    if (el.clientHeight >= el.scrollHeight) {
      continue;
    } // Is it visible?


    if (!(el.offsetWidth || el.offsetHeight || el.getClientRects().length)) continue; // Does it contain most of the page?

    if (el.getElementsByTagName('*').length / totalElements < 0.5) continue; // Is clientHeight <= window.innerHeight?

    if (el.clientHeight > window.innerHeight) continue; // Is it big enough relative to the viewport?

    rect = el.getBoundingClientRect();
    if (Math.floor(rect.width || rect.right - rect.left) < win.innerWidth * 0.75) continue;
    if (Math.floor(rect.height || rect.bottom - rect.top) < win.innerHeight * 0.75) continue;
    return el;
  }
};

CE2.isStatic = function (el) {
  var style;
  var isDynamic = this.dynamicKey;
  if (el[isDynamic]) return false;

  for (; el && el != CE2.d && el != CE2.d.documentElement && el != CE2.d.body; el = el.parentNode) {
    style = CE2.getStyle(el);
    if (style && (style.position == 'absolute' || style.position == 'fixed')) return !(el[isDynamic] = true);
  }

  return true;
};

CE2.isAnchorElement = function (el, scroll, strict) {
  if (!(el && el.nodeName)) return false;
  if (el == CE2.d || el == CE2.d.documentElement || el == CE2.d.body) return false;
  if (CE2.isVML(el)) return false;

  if (strict) {
    if (!CE2.isStatic(el)) return false;
    var box = CE2.getBox(el);
    if (box.height > scroll.height * 2) return false;
  }

  return true;
};
/*
The elementFromPoint function takes absolute page coord params in old
versions of Webkit and Opera. The x and y are relative to the very
top-left corner of the whole page.
*/


CE2.elementFromPointAbsolute = function (x, y, scroll) {
  var el = CE2.d.elementFromPoint(x + scroll.left, y + scroll.top);
  if (el.nodeType === el.TEXT_NODE) return el.parentNode;
  return el;
};
/*
The elementFromPoint function takes "view" coords in modern
browsers. The x and y are relative to the top-left of the viewable area
of the page rather than the top-left corner of the whole page.
*/


CE2.elementFromPointRelative = function (x, y) {
  return CE2.d.elementFromPoint(x, y);
};
/*
Determine which version of elementFromPoint should be used
*/


CE2.elementFromPoint = function () {
  if (CE2.d.elementFromPoint) {
    var _CE2;

    if (CE2.webkit && CE2.webkitVersion < 533 || CE2.opera && CE2.operaVersion < 10) {
      // Safari 4 and earlier (or equivalent) and Opera 9 and earlier take absolute coords
      CE2.elementFromPoint = CE2.elementFromPointAbsolute;
    } else {
      // Everything else takes relative coords
      CE2.elementFromPoint = CE2.elementFromPointRelative;
    }

    return (_CE2 = CE2).elementFromPoint.apply(_CE2, arguments);
  }
};



;
"use strict";

if (typeof CE2 === 'undefined') CE2 = {};

CE2.re = function () {
  var ws = "[\\s\\u00a0\\u2028\\u2029]+";
  return {
    whitespace: new RegExp(ws, 'g'),
    strip: new RegExp("^".concat(ws, "|").concat(ws, "$"), 'g'),
    href: /\bhref="(.*?)"/i,
    ipHost: /^([\d\.]+|\[[a-f\d:]+\])$/i
  };
}();

CE2.strip = function (s, collapse) {
  var result = s.replace(CE2.re.strip, '');
  if (collapse) return result.replace(CE2.re.whitespace, ' ');
  return result;
}; // Adapted from http://stackoverflow.com/a/7616484/1591270


CE2.hash = function (string) {
  var hash = 0;
  var i;
  var chr;
  var len;
  if (string.length == 0) return hash;

  for (i = 0, len = string.length; i < len; i++) {
    chr = string.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }

  return hash;
};



;
"use strict";

;
"use strict";

if (typeof CE2 === 'undefined') CE2 = {};

CE2.getBox = function (el, rv, parent) {
  rv = rv || {};
  var rect;

  if (el.nodeName == 'AREA') {
    rect = CE2.boxForArea(el);

    if (rect) {
      rv.left = rect.left;
      rv.top = rect.top;
      rv.width = rect.width;
      rv.height = rect.height;
    }
  } else if (el.getBoundingClientRect) {
    rect = el.getBoundingClientRect();
    var scroll = CE2.scroll();
    rv.left = Math.floor(rect.left + scroll.left);
    rv.top = Math.floor(rect.top + scroll.top);

    if (CE2.webkit && CE2.webkitVersion < 533 && el.style.position == 'relative') {
      rv.left += parseInt(el.style.left, 10);
      rv.top += parseInt(el.style.top, 10);
    }

    rv.width = Math.floor(rect.width || rect.right - rect.left);
    rv.height = Math.floor(rect.height || rect.bottom - rect.top);
  } else {
    rv.width = el.offsetWidth;
    rv.height = el.offsetHeight;
    var e = el;
    var x = 0;
    var y = 0;

    do {
      x += e.offsetLeft || 0;
      y += e.offsetTop || 0;
      e = e.offsetParent;
    } while (e);

    rv.left = Math.floor(x);
    rv.top = Math.floor(y);
  }

  rv.pageX = rv.left;
  rv.pageY = rv.top;

  if (parent) {
    var parentBox = CE2.getBox(parent);
    rv.left -= parentBox.pageX;
    rv.top -= parentBox.pageY;
  }

  return rv;
};

CE2.boxForArea = function (area) {
  var image = CE2.imageForArea(area);
  if (!image) return;
  var imageBox = CE2.getBox(image);
  var bounds = CE2.areaBounds(area, imageBox);

  if (bounds) {
    return {
      left: imageBox.left + bounds.left,
      top: imageBox.top + bounds.top,
      width: bounds.width,
      height: bounds.height
    };
  }
};

CE2.imageForArea = function (area) {
  var map = new RegExp("(^|#)".concat(area.parentNode.name), 'i');
  var images = area.ownerDocument.getElementsByTagName('IMG');
  var i;
  var image;

  for (i = 0; image = images[i++];) {
    if (map.test(image.useMap)) return image;
  }
};

CE2.areaBounds = function (area, imageBox) {
  var length = CE2.areaLength;
  var maxLength = Math.min(imageBox.width, imageBox.height);
  var coords = CE2.strip(area.coords, true).split(/[^\d\.%]+/).map(function (coord) {
    return length(coord, maxLength);
  });
  var x;
  var y;
  var radius;

  if (/circle/i.test(area.shape)) {
    if (coords.length >= 3) {
      x = coords[0];
      y = coords[1];
      radius = coords[2];
      return {
        left: x - radius,
        top: y - radius,
        width: radius * 2,
        height: radius * 2
      };
    }
  } else {
    x = [];
    y = [];

    for (var i = 0, l = coords.length; i < l; i++) {
      if (i % 2) y.push(coords[i]);else x.push(coords[i]);
    }

    var minX = Math.min.apply(null, x);
    var maxX = Math.max.apply(null, x);
    var minY = Math.min.apply(null, y);
    var maxY = Math.max.apply(null, y);
    return {
      left: minX,
      top: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  }
}; // Converts an area coordinate value from a String to a Number.  If
// it is a percentage, it will be converted to an absolute value by
// applying the percentage to max.


CE2.areaLength = function (value, max) {
  var rv = parseInt(value, 10);
  if (value.indexOf('%') != -1) rv *= 0.01 * max;
  if (isNaN(rv)) return null;
  return rv;
};

CE2.getPageCoords = function (data) {
  data.pageX = data.left;
  data.pageY = data.top;
  var parent;
  var box;

  if (data.parentID && (parent = CE2.d.getElementById(String(data.parentID)))) {
    box = CE2.getBox(parent);
    data.pageX += box.pageX;
    data.pageY += box.pageY;
  }
};



;
"use strict";

if (typeof CE2 === 'undefined') CE2 = {};

CE2.fingerprint = function (el) {
  var rv = {
    type: CE2.tagTypes[el.nodeName.toLowerCase()] || 0
  };
  var name;
  var data;
  var id;
  var ceid;
  var parentID;
  if (name = CE2.getName(el)) rv.name = name;
  if (data = CE2.getData(el)) rv.data = data;
  if (id = el.getAttribute('id')) rv.id = id;
  if (ceid = CE2.getCEID(el)) rv.ceid = ceid;
  if (parentID = CE2.getParentID(el)) rv.parentID = parentID;
  CE2.getBox(el, rv, parentID ? el.parentNode : null);
  return rv;
};

CE2.getParentID = function (el) {
  var parentNode = el.parentNode;
  var parentID = null;

  if (parentNode && parentNode.getAttribute && parentNode != el.ownerDocument.body) {
    if ((parentID = parentNode.id) && parentNode.ownerDocument.getElementById(parentID) == parentNode) return parentID;
    return CE2.getCEID(parentNode) || null;
  }
};

CE2.getCEID = function (el) {
  return el.getAttribute('ceid') || el.getAttribute('data-ceid');
};

CE2.IGNORE_HREF = /^\s*javascript:|^\s*#\s*$/;

CE2.getName = function (el) {
  var rv;
  var href;
  if (rv = el.getAttribute('cename')) return rv;
  if (rv = el.getAttribute('ceid')) return rv;
  if (rv = el.getAttribute('title')) return rv;
  if (rv = el.getAttribute('alt')) return rv;
  if (rv = el.getAttribute('name')) return rv;

  if (el.nodeName == 'A') {
    if (rv = CE2.innerTextName(el)) return rv;
  }

  if (rv = CE2.href(el)) {
    href = CE2.href(el);
    if (href && !CE2.IGNORE_HREF.test(href)) return new CE2.URI(rv).simplify();
  }

  if (rv = el.getAttribute('src')) return CE2.src(rv);
  if (rv = CE2.innerTextName(el)) return rv;
  if (rv = el.getAttribute('id')) return rv;
  if (rv = CE2.fingerprintClass(el)) return rv;
  return '';
};

CE2.getData = function (el) {
  var href;

  switch (el.nodeName) {
    case 'A':
      href = CE2.href(el);
      if (href && !CE2.IGNORE_HREF.test(href)) return new CE2.URI(el.href).simplify();
      if (el.className) return "@#".concat(CE2.fingerprintClass(el));
      break;

    case 'IMG':
    case 'IFRAME':
    case 'EMBED':
      return CE2.src(el.src);

    case 'OBJECT':
      return CE2.src(el.data);

    case 'INPUT':
    case 'SELECT':
    case 'TEXTAREA':
      return el.name;

    default:
      return CE2.fingerprintClass(el);
  }
};

CE2.innerText = function (el) {
  var prop = typeof el.textContent === 'undefined' ? 'innerText' : 'textContent';
  var result = el[prop].substr(0, 1024 * 16);

  function clean(text, unwanted) {
    var i;
    var el;

    for (i = 0; el = unwanted[i++];) {
      text = text.replace(el[prop], '');
    }

    return text;
  }

  result = clean(result, el.getElementsByTagName('SCRIPT'));
  result = clean(result, el.getElementsByTagName('NOSCRIPT'));
  return result;
};

CE2.innerTextName = function (el, length) {
  if (el.nodeName == 'TEXTAREA') {
    return;
  }

  var result = CE2.strip(CE2.strip(CE2.innerText(el), true).substr(0, length || 100)); // Remove any trailing Unicode surrogate characters to avoid UTF-8 encoding issues later.

  return CE2.strip(result.replace(/[\ud800-\udbff\udc00-\udfff]+$/, '')); // eslint-disable-line no-misleading-character-class
};

CE2.tagTypes = {
  a: 3,
  abbr: 4,
  acronym: 5,
  address: 6,
  applet: 7,
  area: 8,
  b: 9,
  base: 10,
  basefont: 11,
  bdo: 12,
  big: 13,
  blockquote: 14,
  body: 15,
  br: 16,
  button: 17,
  caption: 18,
  center: 19,
  cite: 20,
  code: 21,
  col: 22,
  colgroup: 23,
  dd: 24,
  del: 25,
  dfn: 26,
  dir: 27,
  div: 28,
  dl: 29,
  dt: 30,
  em: 31,
  fieldset: 32,
  font: 33,
  form: 34,
  frame: 35,
  frameset: 36,
  head: 37,
  h1: 38,
  h2: 38,
  h3: 38,
  h4: 38,
  h5: 38,
  h6: 38,
  hr: 38,
  html: 39,
  i: 40,
  iframe: 41,
  img: 42,
  input: 43,
  ins: 44,
  kbd: 45,
  label: 46,
  legend: 47,
  li: 48,
  link: 49,
  map: 50,
  menu: 51,
  meta: 52,
  noframes: 53,
  noscript: 54,
  object: 55,
  embed: 55,
  ol: 56,
  optgroup: 57,
  option: 58,
  p: 59,
  param: 60,
  pre: 61,
  q: 62,
  s: 63,
  samp: 64,
  script: 65,
  select: 66,
  small: 67,
  span: 68,
  strike: 69,
  strong: 70,
  style: 71,
  sub: 72,
  sup: 73,
  table: 74,
  tbody: 75,
  td: 76,
  textarea: 77,
  tfoot: 78,
  th: 79,
  thead: 80,
  title: 81,
  tr: 82,
  tt: 83,
  u: 84,
  ul: 85,
  var: 86,
  article: 87,
  aside: 88,
  audio: 89,
  bdi: 90,
  canvas: 91,
  command: 92,
  details: 93,
  figcaption: 94,
  figure: 95,
  footer: 96,
  header: 97,
  hgroup: 98,
  keygen: 99,
  mark: 100,
  meter: 101,
  nav: 102,
  output: 103,
  progress: 104,
  rp: 105,
  rt: 106,
  ruby: 107,
  section: 108,
  summary: 109,
  time: 110,
  video: 111,
  svg: 112,
  '(custom)': 255
};
CE2.CLASS_EXCLUDE_PATTERN = /(-|^)(default|open|hover|close|error|active|focus|valid|invalid|dirty|submitted|expand|collapse|hide|show|enable|disable|on|off|yui|ui)/i;

CE2.fingerprintClass = function (el) {
  var className = CE2.formatClass(el);

  if (!className || CE2.testVersion && CE2.testVersion <= 6) {
    return className;
  } // remove state classes if format version is 7 or above


  var result = [];
  CE2.each(className.split(/\s+/), function (cls) {
    if (cls && !CE2.CLASS_EXCLUDE_PATTERN.test(cls)) {
      result.push(cls);
    }
  });
  return result.join(' ');
};


if (typeof CE2 === 'undefined') CE2 = {};

(function () {
  var Sibling = 1;
  var Parent = 2;
  var MaxSetSize = 32;

  function Fingerprint2(el) {
    var getTypeID = Fingerprint2.getTypeID;
    var encodeTypeIDs = Fingerprint2.encodeTypeIDs;
    var i;
    var relation;
    var elders = [];
    var youngerSiblings = [];
    var descendants = []; // elders

    i = el;

    while (true) {
      if (i.previousElementSibling) {
        relation = Sibling;
        i = i.previousElementSibling;
      } else if (i.parentNode && i.parentNode != document.body && i.parentNode != document.documentElement) {
        relation = Parent;
        i = i.parentNode;
      } else {
        break;
      }

      elders.push({
        type: getTypeID(i),
        relation: relation
      });

      if (elders.length >= MaxSetSize) {
        break;
      }
    } // youngerSiblings


    for (i = el.nextElementSibling; youngerSiblings.length < MaxSetSize && i; i = i.nextElementSibling) {
      youngerSiblings.push({
        type: getTypeID(i)
      });
    } // descendants


    var elements = el.getElementsByTagName('*');

    for (i = 0; i < elements.length && i < MaxSetSize; i++) {
      descendants.push({
        type: getTypeID(elements[i])
      });
    }

    this.type = getTypeID(el);
    this.elders = encodeTypeIDs(elders);
    this.youngerSiblings = encodeTypeIDs(youngerSiblings);
    this.descendants = encodeTypeIDs(descendants);
    CE2.getBox(el, this);
    this.name = CE2.getName(el);
  }

  Fingerprint2.fromObject = function (object) {
    if (object instanceof Fingerprint2) {
      return object;
    }

    var fp = Object.create(Fingerprint2.prototype);
    CE2.assign(fp, object);
    return fp;
  };

  Fingerprint2.hex = function (i) {
    if (typeof i === 'string') {
      return i;
    }

    var result = i.toString(16);

    if (result.length % 2 != 0) {
      return "0".concat(result);
    }

    return result;
  };

  Fingerprint2.getTypeID = function (el) {
    return CE2.tagTypes[el.nodeName.toLowerCase()] || 0;
  };

  Fingerprint2.encodeTypeIDs = function (arr) {
    var hex = Fingerprint2.hex;
    var result = [];
    var resultString = '';
    var entry;
    var lastEntry;
    var lastRelation;
    var i;
    var l;
    var r;
    var j;

    for (i = 0, l = arr.length; i < l; i++) {
      entry = arr[i];

      if (entry.type === (lastEntry && lastEntry.type) && entry.relation === lastEntry.relation) {
        result[result.length - 1].count++;
      } else {
        result.push({
          type: entry.type,
          relation: entry.relation,
          count: 1
        });
      }

      lastEntry = entry;
    }

    for (i = 0, l = result.length; i < l; i++) {
      r = result[i];

      if (r.relation && r.relation !== lastRelation) {
        resultString += r.relation === Sibling ? '^' : '<';
        lastRelation = r.relation;
      }

      if (r.count > 2) {
        resultString += "".concat(hex(r.type), "x").concat(hex(r.count));
      } else {
        for (j = 0; j < r.count; j++) {
          resultString += hex(r.type);
        }
      }
    }

    return resultString;
  };

  Fingerprint2.prototype.toString = function () {
    return "".concat(Fingerprint2.hex(this.type), ";").concat(this.elders, ";").concat(this.youngerSiblings, ";").concat(this.descendants);
  };

  CE2.Fingerprint2 = Fingerprint2;
})();



;
"use strict";

if (typeof CE2 === 'undefined') CE2 = {};

if (typeof CE2.URI === 'undefined') {
  CE2.URI = function (src) {
    this.src = src;
    this.protocol = this.host = this.port = this.path = this.qs = this.hash = this.query = null;

    if (src) {
      var t = CE2babelHelpers.typeof(src);
      if (t == 'string') this.initWithString(src);else if (t == 'object') this.initWithURI(src);
    }
  }; //                      1 protocol    2 auth       3 host        4 port  5 path        6 query string 7 hash


  CE2.URI.pattern = /^\s*([\S]+?:\/\/)?([^\s\/]+?@)?([^:\/\?\#]+)?(\:\d+)?(\/?[^#\?\s]*)?([\?][^#\s]*)?([#]\S+)?/i;
  CE2.URI.prototype = {
    initWithString: function initWithString(src) {
      var protocol;
      var port;
      var path;
      var qs;
      var hash;
      var match = CE2.URI.pattern.exec(src); // If this is a relative URI, in which case group 1 (protocol) would be
      // empty, CE2.URI.pattern may place the first part of the path into
      // group 3 (host).

      if (!match[1] && src.charAt(0) != '/') this.path = CE2.unescape((match[3] || '') + (match[5] || ''));else {
        if (protocol = match[1]) this.protocol = protocol.substr(0, protocol.indexOf(':'));
        this.host = match[3] || null;
        if (port = match[4]) this.port = Number(port.substr(1));
        if (path = match[5]) this.path = CE2.unescape(path);else if (this.host) this.path = '/';
      }

      if (qs = match[6]) {
        // parsed query string
        this.qs = CE2.qs2obj(qs.substr(1)); // raw query string

        this.query = qs.substr(1);
      }

      if (hash = match[7]) this.hash = CE2.unescape(hash.substr(1));
    },
    initWithURI: function initWithURI(u) {
      CE2.each(u, function (v, k) {
        this[k] = v;
      }, this);
    },
    isAbsolute: function isAbsolute() {
      return this.isURL() || this.path && this.path.charAt(0) == '/';
    },
    isURL: function isURL() {
      return this.protocol && this.host;
    },
    getDomain: function getDomain() {
      return this.host && this.host.replace(/^(www|m)\./, '');
    },
    getHost: function getHost() {
      return this.host + (this.port ? ":".concat(this.port) : '');
    },
    getOrigin: function getOrigin() {
      return "".concat(this.protocol, "://").concat(this.getHost());
    }
  }; // CE2.URI.prototype
} // if (typeof(CE2.URI) == 'undefined')



;
"use strict";

if (typeof CE2 === 'undefined') CE2 = {};

CE2.URI.prototype.join = function (other) {
  var rv = new CE2.URI(this);
  var path = this.path;
  if (typeof other === 'string') other = new CE2.URI(other);
  if (other.isURL()) return new CE2.URI(other);
  if (other.isAbsolute()) path = other.path;else if (path) {
    path = path.split('/');
    path.pop();
    path = other.path ? path.concat(other.path.split('/')) : path;
    path = path.join('/');
  } else if (this.isURL()) path = "/".concat(other.path);else path = other.path;
  rv.path = path;
  rv.qs = other.qs;
  rv.hash = other.hash;
  return rv;
};

CE2.URI.prototype.normalize = function () {
  if (!this.path) return;
  var path;

  if (CE2.ie && CE2.ieVersion < 9) {
    path = [];
    if (this.path.charAt(0) == '/') path.push('');
    path = path.concat(this.path.split(/\/+/g));
    if (this.path.charAt(this.path.length - 1) == '/') path.push('');
  } else path = this.path.split(/\/+/g);

  var i = 0;
  var j;

  do {
    j = path.length - 1;

    if (path[i + 1] == '..') {
      if (path[i] == '' && i == 0) path.splice(i + 1, 1);else {
        path.splice(i, 2);
        i -= 1;
      }
    } else if (path[i] == '.') {
      if (j == 0) break;else path.splice(i, 1);
    } else i++;
  } while (i <= j);

  this.path = path.join('/');
};

CE2.URI.prototype.simplify = function (base) {
  var uri;
  var rv = [];

  if (this.protocol == 'file') {
    uri = this;
  } else if (CE2.ie) {
    // IE automatically adjusts the .href property of all <a> elements according to the current base URI.
    uri = base ? base.join(this) : this;
  } else {
    // All other browsers provide a document.baseURI property
    base = base || new CE2.URI(CE2.d.baseURI);
    uri = base.join(this);
  }

  uri.normalize();
  if (uri.host) rv.push(uri.host.replace(/^(www|m)\./, ''));
  if (uri.port != null) rv.push(":".concat(uri.port));

  if (uri.path == '/' || /^\/(default|home|index)\b[^\/]*$/i.test(uri.path)) {
    if (uri.qs || uri.hash) rv.push('/');
  } else rv.push(uri.path);

  if (uri.qs) {
    var qs = [];
    CE2.each(uri.qs, function (value, key) {
      if (value && !/(^sess|^sid$|^phpsessid$|^jsessionid$|^__VIEWSTATE$)/i.test(key)) {
        qs.push("".concat(encodeURIComponent(key), "=").concat(encodeURIComponent(value)));
      }
    });
    if (qs.length) rv.push("?".concat(qs.join('&')));
  }

  if (uri.hash) rv.push("#".concat(uri.hash));
  return rv.join('');
};

CE2.URI.prototype.sameOrigin = function (other) {
  if (!other) return false;
  if (typeof other === 'string') other = new CE2.URI(other);
  return other.host == null || other.host == this.host && other.port == this.port && other.protocol == this.protocol;
};



;
"use strict";

// CE2.getAllFingerprints takes all elements on a page or a given set of
// elements and returns an array of fingerprints. For most cases, simply
// calling CE2.getAllFingerprints() with no arguments will suffice. The extra
// options are really there just for live tracking.
//
// This function requires a lot of stuff defined in lib/js/tracking/*.js
//
// The options argument is not required. It is an object with these values,
// all of which are optional:
//
//   elements: (array) the elements to fingerprint; by default all elements in
//   document.body are fingerprinted
//
//   skipOffScreen: (boolean) do not fingerprint elements that are way off
//   screen; default is true
//
//   onHidden: (function) callback invoked when a hidden element is found;
//   signature is function(el)
//
//   onFingerprint: (function) callback invoked after an element has
//   fingerprinted; signature is function(el, fingerprint)
CE2.IGNORED_TAGS = {
  SCRIPT: 0,
  NOSCRIPT: 0,
  STYLE: 0,
  BR: 0
};

CE2.getAllFingerprints = function (options) {
  options = options || {};
  var result = [];
  var body = CE2.d.body;
  var elements = options.elements || body.getElementsByTagName('*');
  var pageWidth = body.clientWidth;
  var captors = CE2.findByClass('-ce-capture');
  var ignored = CE2.findByClass('-ce-ignore');
  var ignoredTags = CE2.IGNORED_TAGS;
  var skipHidden = options.skipHidden == null ? true : options.skipHidden;
  var skipOffScreen = options.skipOffScreen == null ? true : options.skipOffScreen;
  var _options = options,
      onHidden = _options.onHidden;
  var _options2 = options,
      onFingerprint = _options2.onFingerprint;
  var _options3 = options,
      snakeCase = _options3.snakeCase;
  var _options4 = options,
      fpClass = _options4.fpClass;
  var i;
  var el;
  var fingerprint;
  var captor;

  for (i = 0; el = elements[i++];) {
    try {
      if (el.nodeName in ignoredTags || el.nodeName == 'INPUT' && el.type == 'hidden') continue; // reject hidden elements

      if (skipHidden && el.nodeName != 'AREA') {
        if (!CE2.isVisible(el)) {
          if (onHidden) onHidden(el);
          continue;
        }
      } // reject ignored elements


      if (CE2.arrayContains(ignored, el)) continue; // reject elements inside captor elements
      // but keep elements that are themselves captors

      if ((captor = CE2.arrayContains(captors, el)) && captor != el) continue; // reject elements inside <svg> elements

      if (el.ownerSVGElement) continue;

      if (fpClass) {
        fingerprint = new fpClass(el);
      } else {
        fingerprint = CE2.fingerprint(el);
      }

      if (snakeCase) {
        if (fingerprint.parentID) {
          fingerprint.parent_id = fingerprint.parentID;
          delete fingerprint.parentID;
        }

        fingerprint.page_x = fingerprint.pageX;
        fingerprint.page_y = fingerprint.pageY;
        delete fingerprint.pageX;
        delete fingerprint.pageY;
      }

      if (onFingerprint) onFingerprint(el, fingerprint); // reject elements that are way off screen

      if (skipOffScreen && fingerprint.pageX + fingerprint.width < -pageWidth * 0.25) continue; // Reject elements inside captor elements, but don't reject the captor
      // itself.

      if (captors.length) {
        var skip = false;

        for (var j = 0; captor = captors[j++];) {
          if (captor != el && CE2.contains(captor, el)) {
            skip = true;
            break;
          }
        }

        if (skip) continue;
      }

      result.push(fingerprint);
    } catch (e) {
      console.log(e);
    }
  } // sort visible / known elements first in the result array


  result.sort(function (a, b) {
    var aScore = a.width && a.height && a.type ? -1 : 1;
    var bScore = b.width && b.height && b.type ? -1 : 1;
    return aScore - bScore;
  });
  return result;
};

CE2.getAllFingerprints2 = function (options) {
  options = CE2.assign({
    fpClass: CE2.Fingerprint2,
    skipHidden: false
  }, options);
  var fingerprints = CE2.getAllFingerprints(options);
  var fp;

  for (var i = 0; fp = fingerprints[i++];) {
    fp.element_fingerprint_id = i;
    fp.found = true;

    if (fp.parentID) {
      fp.parent_id = fp.parentID;
    }

    delete fp.parentID;
    delete fp.pageX;
    delete fp.pageY;
  }

  return fingerprints;
};


(function () {
  var fpsTimeout;
  var prevfps;
  var parentUrl;
  var hostUrl;

  function siteLoaded(parentUrl) {
    window.parent.postMessage({
      type: 'ce-site-loaded'
    }, parentUrl.getOrigin());
  }

  function sendFingerprints() {
    fpsTimeout = null;

    if (prevfps) {
      var fps = CE2.getAllFingerprints2();
      var fpsStr = JSON.stringify(fps);

      if (prevfps !== fpsStr) {
        prevfps = fpsStr;
        window.parent.postMessage({
          type: 'ce-reload-reports',
          fps: fps
        }, parentUrl.getOrigin());
      }
    }
  }

  function onActivity() {
    if (fpsTimeout) {
      clearTimeout(fpsTimeout);
    }

    fpsTimeout = setTimeout(sendFingerprints, 1000);
  }

  if (window.parent !== window) {
    parentUrl = new CE2.URI(document.referrer);
    hostUrl = new CE2.URI(CE2.__CE_HOST__); // if its loaded as part of crazyegg

    if (parentUrl.getHost() === hostUrl.getHost()) {
      if (window.performance.timing.loadEventEnd) {
        siteLoaded(parentUrl);
      } else {
        window.addEventListener('load', function () {
          siteLoaded(parentUrl);
        }, true);
      }

      window.addEventListener('message', function (event) {
        if (new CE2.URI(event.origin).getHost() === hostUrl.getHost() && event.data === 'ce-get-fingerprints') {
          var fps = CE2.getAllFingerprints2();
          prevfps = JSON.stringify(fps);
          window.parent.postMessage({
            type: 'ce-fingerprints',
            fps: fps
          }, event.origin);
        }

        if (new CE2.URI(event.origin).getHost() === hostUrl.getHost() && event.data === 'ce-get-height') {
          var height = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
          window.parent.postMessage({
            type: 'ce-height',
            height: height
          }, event.origin);
        }
      }, true);
      CE2.listen(window, 'mousedown', onActivity);
      CE2.listen(window, 'mouseover', onActivity);
      CE2.listen(window, 'keydown', onActivity);
      CE2.listen(window, 'mousemove', function (event) {
        window.parent.postMessage({
          type: 'ce-interactive-mousemove',
          clientX: event.clientX,
          clientY: event.clientY
        }, parentUrl.getOrigin());
      });
      throw new Error('site loaded'); // throwing error to stop execution of rest of the script
    }
  }
})();

CE2.TRACKING_SCRIPT = "http://script.crazyegg.com/pages/tracking-scripts/1.js";
CE2.TRACKING_SCRIPT_SECURE = "https://script.crazyegg.com/pages/tracking-scripts/1.js";

;
"use strict";



;
"use strict";

if (typeof CE2 === 'undefined') CE2 = {};
CE2.READY_STATE_PATTERN = CE2.ie ? /complete/ : /complete|interactive/;
CE2.autoStart = typeof CE_MANUAL_START === 'undefined' || !CE_MANUAL_START;
CE2.domReady = document.readyState && CE2.READY_STATE_PATTERN.test(document.readyState);
CE2.domReadyListeners = [];

CE2.onDOMReady = function (fn) {
  if (CE2.domReady) return setTimeout(fn, 1);
  CE2.domReadyListeners.push(fn);
};

CE2.domReadySetup = function () {
  var listener = function listener() {
    var listeners = CE2.domReadyListeners;

    while (listeners.length > 0) {
      listeners.pop().call();
    }

    CE2.domReady = true;
  };

  if (CE2.domReady) listener();
  CE2.listen(window, 'load', listener);
  if (document.addEventListener) CE2.listen(document, 'DOMContentLoaded', listener);

  if (document.readyState) {
    var readyStatePattern = CE2.READY_STATE_PATTERN;

    (function checker() {
      if (readyStatePattern.test(document.readyState)) {
        listener();
      } else {
        setTimeout(checker, 10);
      }
    })();
  }
};

if (CE2.autoStart) CE2.domReadySetup();



;
"use strict";

if (typeof CE2 === 'undefined') CE2 = {};

CE2.matchURL = function (targetUrl, pageUrl, flags, devices, userAgent) {
  var indexPattern = /(default|index)($|\..*)/i;
  var returnFalse = false;
  var pathParts;
  var targetPath;
  var targetPathParts;
  var strict;
  var i;
  var l;
  if (!(targetUrl && pageUrl)) return false; // Return false if a devices array was passed in and the current device type
  // isn't in that array.

  if (devices && CE2.indexOf(devices, CE2.deviceType(userAgent)) < 0) return false;
  flags = flags || ''; // Named snapshot. In this case, neither targetUrl nor pageUrl are
  // actually URLs, they are just snapshot names

  if (/n/.test(flags)) return targetUrl.trim() === pageUrl.trim(); // Google optimize tracking snapshot. In this case, neither targetUrl nor pageUrl are
  // actually URLs, they are combination of GA tracking id experimentid and variant id

  if (/go/.test(flags)) {
    var parts = targetUrl.split('.');
    return pageUrl && pageUrl[parts[0]] && pageUrl[parts[0]].experiments && pageUrl[parts[0]].experiments[parts[1]] && pageUrl[parts[0]].experiments[parts[1]] == parts[2];
  } // wildcard or regex


  if (/[re]/.test(flags)) {
    try {
      return new RegExp(targetUrl, 'i').test(pageUrl);
    } catch (e) {
      return false;
    }
  }

  targetUrl = new CE2.URI(targetUrl);
  var location = new CE2.URI(pageUrl.toLowerCase()); // protocols match?

  if (/h/.test(flags) && targetUrl.protocol != location.protocol) return false; // hosts match?

  var host = location.host;
  var domain = host.replace(/^(www|m)\./, '');
  var targetHost = targetUrl.host;
  var targetIdnHost = targetUrl.ihost;
  if (/w/.test(flags) && host != targetHost && host != targetIdnHost) return false;
  if (domain != targetHost.replace(/^(www|m)\./, '') && domain != (targetIdnHost && targetIdnHost.replace(/^(www|m)\./, ''))) return false; // paths match?

  if (!targetUrl.path) {
    targetPath = '/';
  } else {
    targetPath = targetUrl.path;
  }

  var path = location.path;

  if (targetPath != path) {
    if (/\//.test(flags)) return false;
    targetPathParts = targetPath.split('/');
    pathParts = path.split('/');

    for (i = 0, l = Math.max(targetPathParts.length, pathParts.length); i < l; i++) {
      if (!targetPathParts[i]) targetPathParts[i] = '';
      if (!pathParts[i]) pathParts[i] = '';

      if (i == l - 1) {
        targetPathParts[i] = targetPathParts[i].replace(indexPattern, '');
        pathParts[i] = pathParts[i].replace(indexPattern, '');
      }

      if (targetPathParts[i] != pathParts[i]) return false;
    }
  } // query strings match?


  var queryString = location.qs;
  var targetQueryString = targetUrl.qs || '';
  strict = /\?/.test(flags);
  if (strict && queryString && !targetQueryString || !queryString && targetQueryString) return false;
  CE2.each(targetQueryString, function (value, key) {
    if (queryString[key] !== value) {
      returnFalse = true;
      return false;
    }
  });
  if (returnFalse) return false;

  if (strict) {
    CE2.each(queryString, function (value, key) {
      if (value != targetQueryString[key]) return returnFalse = true;
    });
    if (returnFalse) return false;
  } // hashes match?


  var targetHash = targetUrl.hash || '';
  var hash = location.hash || '';
  strict = /#/.test(flags);
  if ((strict || targetHash) && targetHash != hash) return false;
  return true;
};




;
"use strict";

if (typeof CE2 === 'undefined') {
  CE2 = {};
}

(function () {
  CE2.uaBot = function (ua) {
    // its set by script check tool so dont run bot check when its set
    if (window.__CE_SCRIPT_CHECK) {
      return false;
    } // known bot useragents


    if (/bingpreview|prerender|jorgee|Mediapartners-Google|APIs-Google|phpcrawl|GoogleAdSenseInfeed|Google Page Speed Insights|Google-Ads-Overview|Google-Read-Aloud|Google-Structured-Data-Testing-Tool|Data Theorem|alexa|bot|crawl(er|ing)|facebookexternalhit|feedburner|google web preview|nagios|postrank|pingdom|slurp|spider|yahoo|yandex|phantom|headless/i.test(ua)) {
      return true;
    }
  };

  function isBot() {
    try {
      if (CE2.uaBot(navigator.userAgent)) {
        return true;
      } // when running in headless mode outerwidth will be 0


      if (window.outerWidth === 0 || window.outerHeight === 0) {
        return true;
      } // onLine is false in chrome headless browser


      if (navigator.onLine === false) {
        return true;
      }

      if (!navigator.language || navigator.languages && navigator.languages.length === 0) {
        return true;
      } // it will be true on browsers when it controlled by webdriver


      if (navigator.webdriver) {
        return true;
      } // it will be true on browsers when running jasmine


      if (window.jasmine) {
        return true;
      } // network round trip time will be 0 on headless browsers


      if (navigator.connection && navigator.connection.rtt === 0) {
        return true;
      } // below are some properties/functions set by tools susch as phantomjs/selenium on document/window


      var documentDetectionKeys = ['__webdriver_evaluate', '__selenium_evaluate', '__webdriver_script_function', '__webdriver_script_func', '__webdriver_script_fn', '__fxdriver_evaluate', '__driver_unwrapped', '__webdriver_unwrapped', '__driver_evaluate', '__selenium_unwrapped', '__fxdriver_unwrapped'];
      var windowDetectionKeys = ['webdriver', '_phantom', '__nightmare', '_selenium', 'callPhantom', 'callSelenium', '_Selenium_IDE_Recorder'];

      for (var windowDetectionKey in windowDetectionKeys) {
        var windowDetectionKeyValue = windowDetectionKeys[windowDetectionKey];

        if (window[windowDetectionKeyValue]) {
          return true;
        }
      }

      for (var documentDetectionKey in documentDetectionKeys) {
        var documentDetectionKeyValue = documentDetectionKeys[documentDetectionKey];

        if (window.document[documentDetectionKeyValue]) {
          return true;
        }
      } // chrome headless will set the some cache key with name such as $cdc_asdsadsadasad_.Cache_ on document


      for (var documentKey in window.document) {
        if (documentKey.match(/\$[a-z]dc_/) && window.document[documentKey].cache_) {
          return true;
        }
      } // sequentum sets window.external.Sequentum


      if (window.external && window.external.toString() && window.external.toString().indexOf('Sequentum') !== -1) {
        return true;
      }

      var documentElement = window.document.documentElement; // selenium will set below 3 attributes on HTML element

      if (documentElement.getAttribute('selenium') || documentElement.getAttribute('webdriver') || documentElement.getAttribute('driver')) {
        return true;
      } // websocket doenst work on phantomjs, and it will throw dom exception 12


      try {
        new WebSocket('itsgonnafail');
      } catch (e) {
        if (/SyntaxError: DOM Exception 12/.test(e.message)) {
          return true;
        }
      } // if the userAgent has value of chrome and if the window.chrome is not defined whe can treat it as bot


      if (/Chrome|Chromium/i.test(navigator.userAgent)) {
        if (!window.chrome) {
          return true;
        } // some times bots can fix it by csetting window.chrome to true so create an iframe and check the chrome on iframe window


        var iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
        var result = CE2babelHelpers.typeof(iframe.contentWindow.chrome);
        iframe.remove();

        if (result === 'undefined') {
          return true;
        } // on chrome canvas WEBGL vendor value will be Google Inc,
        // on headeless it will be original webGL developer


        var canvas = document.createElement('canvas');
        var gl = canvas.getContext('webgl');
        var debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        var vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
        var renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);

        if (vendor === 'Brian Paul' && renderer === 'Mesa OffScreen') {
          return true;
        }
      }
    } catch (ex) {// ignore error
    }

    return false;
  }

  var _isBot;

  CE2.isBot = function () {
    // its set by script check tool so dont run bot check when its set
    if (window.__CE_SCRIPT_CHECK) {
      return false;
    }

    if (_isBot === undefined) {
      _isBot = isBot();
    }

    return _isBot;
  };
})();



;
"use strict";

if (typeof CE2 === 'undefined') {
  CE2 = {};
}

(function () {
  function NumericRange(left, right) {
    this.left = parseInt(left, 10);
    this.right = parseInt(right, 10);
  }

  NumericRange.prototype.includes = function (value) {
    return this.left <= parseInt(value, 10) && this.right >= parseInt(value, 10);
  };

  function Rule(parts) {
    this.parts = parts;
  }

  Rule.prototype.matches = function (ip) {
    var part;

    for (var i = 0; i < ip.parts.length; i++) {
      part = ip.parts[i];

      if (!Rule.parts_match(this.parts[i], part)) {
        return false;
      }
    }

    return true;
  };

  Rule.parts_match = function (rule, atom) {
    if (rule === null) {
      return true;
    }

    if (!isNaN(rule)) {
      return rule === atom;
    }

    if (rule instanceof NumericRange) {
      return rule.includes(atom);
    }
  };

  function IPAddress(ip) {
    this.ip = ip;
    this.parts = ip.split('.').map(function (x) {
      return parseInt(x, 10);
    });
  }

  function IPBlockList(text) {
    var self = this;
    this.text = text || '';
    this.rules = this.text.split('\n').map(function (line) {
      return self.parse_rule(line);
    });
    this.rules = this.rules.filter(function (x) {
      return x;
    });
  }

  IPBlockList.prototype.blocked = function (ip) {
    if (!ip) {
      return false;
    }

    ip = new IPAddress(ip);

    for (var i = 0; i < this.rules.length; i++) {
      if (this.rules[i].matches(ip)) {
        return true;
      }
    }

    return false;
  };

  IPBlockList.prototype.parse_rule = function (line) {
    line = line.trim();

    if (line === '' || /^\s*#.*$/.test(line)) {
      return null;
    }

    line = line.replace(/\s*#.*$/, '');

    if (line.indexOf('-') > -1) {
      return this.parse_range_based_rule(line);
    }

    var parts = line.split('.').map(function (part) {
      if (part === '*') {
        return null;
      }

      if (/^[0-9]+$/.test(part)) {
        return parseInt(part, 10);
      }

      return null;
    });
    return new Rule(parts);
  };

  IPBlockList.prototype.parse_range_based_rule = function (line) {
    var self = this;
    var ips = line.split('-');
    var rules = ips.map(function (ip) {
      return self.parse_rule(ip);
    });
    var parts = [];

    for (var i = 0; i < 4; i++) {
      var leftPart = rules[0].parts[i];
      var rightPart = rules[1].parts[i];

      if (leftPart === rightPart) {
        parts.push(leftPart);
      } else if (leftPart === undefined || leftPart === null || rightPart === undefined || rightPart === null) {
        parts.push(null);
      } else {
        parts.push(new NumericRange(leftPart, rightPart));
      }
    }

    return new Rule(parts);
  };

  CE2.IPBlockList = IPBlockList;
})();



;
"use strict";

if (typeof CE2 === 'undefined') {
  CE2 = {};
}

(function () {
  function Sampling(site) {
    this.site = site;
  }

  Sampling.prototype = {
    nEndpoint: function nEndpoint() {
      return "".concat(CE2.SREC_DEST.sample, "/n/").concat(CE2.uid, "/").concat(this._key(), "?v=7&user_script_version=").concat(CE2.USER_SCRIPT_VERSION);
    },
    rEndpoint: function rEndpoint() {
      if (this._freeSamplingApplies()) {
        return "".concat(CE2.SREC_DEST.sample, "/r/").concat(CE2.uid, "/").concat(this._key(), "/").concat(this.samplingData.numFreeRecordingsRecorded, "?free_recordings=true&user_script_version=").concat(CE2.USER_SCRIPT_VERSION);
      }

      return "".concat(CE2.SREC_DEST.sample, "/r/").concat(CE2.uid, "/").concat(this._key(), "/").concat(this.samplingData.numRecordingsForKey, "?user_script_version=").concat(CE2.USER_SCRIPT_VERSION);
    },
    validSamplingData: function validSamplingData() {
      return typeof this.samplingData !== 'undefined' && this.samplingData != null;
    },
    setSamplingData: function setSamplingData(xhrResponse) {
      // num_recordings_total,num_requests_for_key,num_recordings_for_key,last_recorded_for_key,num_recordings_free,server_time,server_next_month_time
      // i.e: "10,3,1,1535744384,1,1535744385,1535744390"
      var r = xhrResponse.split(',');

      if (r.length >= 7) {
        this.samplingData = {
          numRecordingsTotal: r[0],
          numRequestsForKey: r[1],
          numRecordingsForKey: r[2],
          lastRecordedForKey: new Date(parseInt(r[3], 10) * 1000),
          numFreeRecordingsRecorded: r[4] || 0,
          serverNow: new Date(parseInt(r[5], 10) * 1000),
          serverNextMonth: new Date(parseInt(r[6], 10) * 1000)
        };

        if (r[7]) {
          sessionStorage.setItem('ce_ip_address', r[7]);
        }

        sessionStorage.setItem('ce_diff_time', parseInt(r[5], 10) * 1000 - +new Date());
      } else {
        this.samplingData = null;
      }
    },
    canSample: function canSample() {
      var remainingRecordings = 0;
      var remainingRecordingsForKey;
      remainingRecordings = CE2.NUMBER_OF_RECORDINGS - this.samplingData.numRecordingsTotal; // if activated recordings this month then add free recordings

      if (this._activatedRecordingsThisMonth()) {
        remainingRecordings += this._freeRecordings();
      } // remaining recordings


      if (remainingRecordings > 0) {
        if (this._freeSamplingApplies()) {
          CE2.debug('Recording: free sampling applied');
          return true;
        }

        if (this._strategy() === 'custom' && this._customSamplingApplies()) {
          this.appliedStrategy = 'custom';
          remainingRecordingsForKey = this.site.recordingSettings.samplingNumRecordings - this.samplingData.numRecordingsForKey;

          if (remainingRecordingsForKey > 0) {
            return this._canSampleUniformly(remainingRecordingsForKey, this.samplingData.lastRecordedForKey, new Date(parseInt(this.site.recordingSettings.samplingEndDateUnix, 10) * 1000));
          }

          CE2.debug('Recording: custom sampling rejected');
          return false;
        }

        if (this._strategy() === 'consecutive' && this._canSampleConsecutively()) {
          this.appliedStrategy = 'consecutive';
          remainingRecordingsForKey = this.site.recordingSettings.samplingNumRecordings - this.samplingData.numRecordingsForKey;

          if (remainingRecordingsForKey > 0) {
            CE2.debug('Recording: consecutive sampling applied');
            return true;
          }

          CE2.debug('Recording: consecutive sampling rejected');
          return false;
        }

        this.appliedStrategy = 'uniform';
        return this._canSampleUniformly(remainingRecordings, this.samplingData.lastRecordedForKey, this.samplingData.serverNextMonth);
      }

      CE2.debug('Recording: sampling rejected, no remaining recordings.');
      return false;
    },
    _key: function _key() {
      if (this._strategy() === 'custom' || this._strategy() === 'consecutive') {
        return btoa("".concat(this.site.id, "|").concat(this.site.recordingSettings.samplingUpdatedAt));
      }

      return 'all';
    },
    _strategy: function _strategy() {
      // custom || consecutive || uniform
      if (this.site.recordingSettings.samplingStrategy === 'custom') {
        return 'custom';
      }

      if (this.site.recordingSettings.samplingStrategy === 'consecutive') {
        return 'consecutive';
      }

      return 'uniform';
    },
    _appliedStrategy: function _appliedStrategy() {
      return this.appliedStrategy;
    },
    _customSamplingApplies: function _customSamplingApplies() {
      var startDate = new Date(parseInt(this.site.recordingSettings.samplingStartDateUnix, 10) * 1000);
      var endDate = new Date(parseInt(this.site.recordingSettings.samplingEndDateUnix, 10) * 1000);
      return startDate <= this.samplingData.serverNow && this.samplingData.serverNow <= endDate;
    },
    _freeRecordings: function _freeRecordings() {
      return CE2.NUMBER_OF_RECORDINGS * 0.10;
    },
    _freeSamplingApplies: function _freeSamplingApplies() {
      return this._activatedRecordingsThisMonth() && this.samplingData.numFreeRecordingsRecorded < this._freeRecordings();
    },
    _canSampleUniformly: function _canSampleUniformly(remainingRecordings, lastRecordedForKey, endDate) {
      var remainingMiliseconds = endDate - this.samplingData.serverNow;
      var rate = remainingMiliseconds / remainingRecordings; // (days remaining in miliseconds / remainingRecordings)

      var elapsedMilisecondsSinceLastRecording = this.samplingData.serverNow - lastRecordedForKey; // it's been X miliseconds since last_recorded_for_key, should record

      if (elapsedMilisecondsSinceLastRecording > rate) {
        console.debug('Recording: uniform sampling applied');
        return true;
      }

      console.debug('Recording: uniform sampling rejected');
      return false;
    },
    _canSampleConsecutively: function _canSampleConsecutively() {
      return this.site.recordingSettings.samplingNumRecordings > 0 && this.samplingData.numRecordingsForKey < this.site.recordingSettings.samplingNumRecordings;
    },
    _activatedRecordingsThisMonth: function _activatedRecordingsThisMonth() {
      if (CE2.RECORDINGS_ACTIVATION) {
        var activationDate = new Date(parseInt(CE2.RECORDINGS_ACTIVATION, 10) * 1000);
        return Math.abs(new Date() - activationDate) / 86400000 < 30;
      }

      return false;
    },
    getSamplingData: function getSamplingData(callback) {
      if (typeof this.samplingData !== 'undefined') {
        callback();
      } else {
        var self = this;
        var sampleApiRequest = new XMLHttpRequest();

        sampleApiRequest.onreadystatechange = function () {
          if (sampleApiRequest.readyState === 4) {
            self.setSamplingData(sampleApiRequest.response);
            return callback();
          }
        };

        sampleApiRequest.open('GET', this.nEndpoint());
        sampleApiRequest.send();
      }
    },
    getIP: function getIP() {
      return sessionStorage.getItem('ce_ip_address');
    },
    getDiffTime: function getDiffTime() {
      var diff = sessionStorage.getItem('ce_diff_time');
      return diff === null ? null : parseInt(diff, 10);
    },
    // gets a more trustworthy user timestamp, by subtracting the time diff from the CE server
    getAdjustedDate: function getAdjustedDate() {
      return new Date(+new Date() + CE2._sampling.getDiffTime());
    }
  };
  CE2.Sampling = Sampling;
})();


CE2.userMain = function () {
  try {
    CE2.debug('Starting CrazyEgg');
    var _CE = CE2,
        snapshots = _CE.snapshots;
    var _CE2 = CE2,
        sites = _CE2.sites;
    var ipBlockList = CE2.GLOBAL_IP_BLOCK_LIST;
    var flowDetails;

    if (CE2.uaBot(navigator.userAgent)) {
      CE2.debug('Not tracking: bot detected.');
      return;
    }

    if (CE2.dontTrack(CE2.w, CE2.d, CE2.n, CE2.ie)) {
      CE2.debug('Not tracking: doNotTrack detected.');
      return;
    }

    CE2.testID = CE2.testVersion = null;

    if (CE2.initPageEdits) {
      CE2.initPageEdits();
    }

    if (CE2.initFlowTracking) flowDetails = CE2.initFlowTracking();
    CE2.showWebsite(); // The contents of lib/js/tracking/unscramble.js will be
    // inserted here by create_tracking_js.
    "use strict";

if (typeof CE2 === 'undefined') CE2 = {}; // Translate scrambled digits to regular base36 digits

var unstr = function () {
  var digits = '!$%&()*+,-.0123456789;<=>?@[]^_`{|}~';
  var tr = {};
  var i;

  for (i = 0; i < digits.length; i++) {
    tr[digits.charAt(i)] = i.toString(36);
  }

  return tr;
}(); // Unscramble a string to an integer


var unsi = function unsi(string) {
  return parseInt(string.replace(/./g, function (m) {
    return unstr[m];
  }), 36);
}; // Unscramble a string


var unss = function unss(string) {
  // eslint-disable-line no-unused-vars
  var result = '';
  var re = /(![^:\/a-z])|([^:\/a-z]{2})|(:[^:\/a-z]{3})|(\/[^:\/a-z]{4})/ig;
  var str = String.fromCharCode;
  var match;

  while ((match = re.exec(string)) != null) {
    if (match[1] || match[2]) result += str(unsi(match[0]));else if (match[3]) result += str(unsi(match[3].substr(1)));else if (match[4]) result += str(unsi(match[4].substr(1)));
  }

  return result;
};
    // If the function unss from unscramble.js exists, use it to decode
    // scrambled JSON data

    if (typeof unss === 'function') {
      if (typeof snapshots === 'string') snapshots = CE2.parseJSON(unss(snapshots));
      if (typeof sites === 'string') sites = CE2.parseJSON(unss(sites));
      ipBlockList = unss(ipBlockList);
    }

    var site = CE2.getCurrentSite(sites);

    if (site) {
      var callback = function callback() {
        if (!new CE2.IPBlockList(ipBlockList).blocked(CE2._sampling.getIP())) {
          CE2.monitor = function () {

            try {
              var pageUrl = CE2.w.location.href;
              var variantId = flowDetails && flowDetails.flow && flowDetails.flow.trackByVariant && flowDetails.variant.variantId;
              var snapshot = null;
              var recordingSessionId = null;

              if (variantId) {
                snapshot = CE2.findMatchingSnapshot(snapshots, pageUrl, typeof CE_SNAPSHOT_NAME === 'string' && CE_SNAPSHOT_NAME.trim(), variantId, null, CE2._sampling.getIP());
              }

              if (!snapshot && CE2.w.gaData) {
                snapshot = CE2.findMatchingSnapshot(snapshots, pageUrl, typeof CE_SNAPSHOT_NAME === 'string' && CE_SNAPSHOT_NAME.trim(), null, CE2.w.gaData, CE2._sampling.getIP());
              }

              if (!snapshot) {
                snapshot = CE2.findMatchingSnapshot(snapshots, pageUrl, typeof CE_SNAPSHOT_NAME === 'string' && CE_SNAPSHOT_NAME.trim(), null, null, CE2._sampling.getIP());
              }

              if (CE2.ALLOW_RECORDINGS_2 && CE2.recording && CE2.recording.hasSession()) {
                recordingSessionId = CE2.recording.getSessionState().id;
              } // cleanup


              if (!snapshot && !recordingSessionId || CE2.tracker && CE2.tracker.snapshotId != (snapshot && snapshot.id) || CE2.tracker && CE2.tracker.recordingSessionId != recordingSessionId) {
                CE2.testID = CE2.testVersion = null;

                if (CE2.tracker) {
                  CE2.tracker.cleanup();
                  CE2.tracker = null;
                  CE2.debug('Tracker reset');
                }

                return;
              }

              if (!CE2.tracker) {
                var initial =     +new Date()
                CE2.loadTrackingScript(function () {
                  CE2.startSnapshotTracking(snapshot, recordingSessionId);
                });
                var ended =     +new Date()
            console.log(ended - initial)
              }
            } catch (e) {
              CE2.debug(e);
            }


          };

          if (CE2.recording && CE2.recording.main) {
            var waitSampling = CE2.recording.main(site);

            if (!waitSampling) {
              CE2.startMonitor();
            }
          } else {
            // no recording, just start the monitor
            CE2.startMonitor();
          }
        }
      };

      CE2._sampling = new CE2.Sampling(site);

      if ((!CE2.IS_USING_IP_BLOCKING || CE2._sampling.getIP()) && CE2._sampling.getDiffTime() !== null) {
        callback();
      } else {
        CE2._sampling.getSamplingData(function () {
          if (CE2._sampling.validSamplingData()) {
            callback();
          }
        });
      }
    }
  } finally {
    CE2.showWebsite();
  }
};

CE2.startMonitor = function () {
  CE2.debug('Starting Monitor');

  if (!CE2.monitor) {
    return;
  }

  CE2.monitor();

  if (CE2.autoStart) {
    CE2.monitorInterval = setInterval(CE2.monitor, 1000);
  }
}; // to avoid flickering users might hide the body using our script
// here we undo that change


CE2.showWebsite = function () {
  if (CE2.bh) {
    CE2.bh.parentElement.removeChild(CE2.bh);
    CE2.bh = null;
  }
};

if (CE2.autoStart) CE2.onDOMReady(CE2.userMain);
if (typeof CE_READY === 'function') CE2.onDOMReady(CE_READY);else if ((typeof CE_READY === "undefined" ? "undefined" : CE2babelHelpers.typeof(CE_READY)) === 'object') {
  CE2.onDOMReady(function () {
    CE2.each(CE_READY, function (func) {
      if (typeof func === 'function') func();
    });
  });
}


;
"use strict";

CE2.debugEnabled = CE2.w.location.search && CE2.w.location.search.indexOf('ce2debug=enabled') > 0;

CE2.debug = function (msg) {
  if (!CE2.debugEnabled) {
    return false;
  }

  var logMsg;

  if (typeof msg === 'string') {
    logMsg = "CE2: ".concat(msg);
  } else {
    logMsg = msg;
  }

  console.log(logMsg);
};

CE2.sites = "%8&4!}%|%]!}$<$4$3$6$3$2$1$,!}&%%?&$%^!}$<!}%`&!&&%@&&$.%[&&&$!}$,!}&+%^&+&+%|&&&%%.%^%[&&&*%]%|&%%`!}$<%_%?&!&+%^$,!}&*%^%[&&&*%]%|&%%`%0%^&,&,%|&%%`&+!}$<&4!}&(%?%`%^%1%?&*%`%^&,%|&%%`$|&%%?%@&!%^%]!}$<%_%?&!&+%^$,!}&(%?%`%^%1%?&*%`%^&,%|&%%`%2&*&!&+!}$<%8%;$,!}&*&-&!%^&+!}$<%8%;$,!}&$%?&+%~$|&!%^&$%^&%&,&+!}$<&%&-&!&!$,!}&+%?&$&(&!%|&%%`%0&,&*%?&,%^%`&2!}$<!}&-&%%|%_&&&*&$!}$,!}&+%?&$&(&!%|&%%`%*&-&$%.%^%[&&&*%]%|&%%`&+!}$<&%&-&!&!$,!}&+%?&$&(&!%|&%%`%0&,%?&*&,${%?&,%^!}$<&%&-&!&!$,!}&+%?&$&(&!%|&%%`%0&,%?&*&,${%?&,%^%2&%%|&1!}$<&%&-&!&!$,!}&+%?&$&(&!%|&%%`$|&%%]${%?&,%^!}$<&%&-&!&!$,!}&+%?&$&(&!%|&%%`$|&%%]${%?&,%^%2&%%|&1!}$<&%&-&!&!$,!}&+%?&$&(&!%|&%%`%2&(%]%?&,%^%]$^&,!}$<&%&-&!&!$,!}%^&%%]%0%^&+&+%|&&&%%+&%$_&!&&%[%~%^%]%2&*&!!}$<%_%?&!&+%^$,!}%@&!&&%[%~%^%]%2&*&!&+!}$<%8%;$,!}%@&!&&%[%~%^%]%.&-&!%^&+!}$<%8%;$,!}&(&*%^$`%?%[%{%^%$&$%?%`%^&+!}$<%_%?&!&+%^&6&6$,&4!}%|%]!}$<$4$1$4$5$6$3$,!}&%%?&$%^!}$<!}%~&*%^&-&+%[%{$.%[&&&$$.%@&*!}$,!}&+%^&+&+%|&&&%%.%^%[&&&*%]%|&%%`!}$<%_%?&!&+%^$,!}&*%^%[&&&*%]%|&%%`%0%^&,&,%|&%%`&+!}$<&4!}&(%?%`%^%1%?&*%`%^&,%|&%%`$|&%%?%@&!%^%]!}$<%_%?&!&+%^$,!}&(%?%`%^%1%?&*%`%^&,%|&%%`%2&*&!&+!}$<%8!}%{&,&,&($<$0$0%~&*%^&-&+%[%{$.%[&&&$$.%@&*$0%?%@&&&-&,$0!}%;$,!}&*&-&!%^&+!}$<%8&4!}&-!}$<&4!}&(&*&&&,&&%[&&&!!}$<!}%{&,&,&(!}$,!}%{&&&+&,!}$<!}%~&*%^&-&+%[%{$.%[&&&$$.%@&*!}$,!}&(%?&,%{!}$<!}$0%?%@&&&-&,$0!}&6$,!}&&!}$<!}%{!}&6%;$,!}&$%?&+%~$|&!%^&$%^&%&,&+!}$<&%&-&!&!$,!}&+%?&$&(&!%|&%%`%0&,&*%?&,%^%`&2!}$<!}%[&&&%&+%^%[&-&,%|&.%^!}$,!}&+%?&$&(&!%|&%%`%*&-&$%.%^%[&&&*%]%|&%%`&+!}$<$2$7$9$,!}&+%?&$&(&!%|&%%`%0&,%?&*&,${%?&,%^!}$<&%&-&!&!$,!}&+%?&$&(&!%|&%%`%0&,%?&*&,${%?&,%^%2&%%|&1!}$<&%&-&!&!$,!}&+%?&$&(&!%|&%%`$|&%%]${%?&,%^!}$<&%&-&!&!$,!}&+%?&$&(&!%|&%%`$|&%%]${%?&,%^%2&%%|&1!}$<&%&-&!&!$,!}&+%?&$&(&!%|&%%`%2&(%]%?&,%^%]$^&,!}$<$2$6$9$7$9$1$2$9$8$1$,!}%^&%%]%0%^&+&+%|&&&%%+&%$_&!&&%[%~%^%]%2&*&!!}$<%_%?&!&+%^$,!}%@&!&&%[%~%^%]%2&*&!&+!}$<%8%;$,!}%@&!&&%[%~%^%]%.&-&!%^&+!}$<%8%;$,!}&(&*%^$`%?%[%{%^%$&$%?%`%^&+!}$<%_%?&!&+%^&6&6%;";
CE2.GLOBAL_IP_BLOCK_LIST = '';
CE2.IS_USING_IP_BLOCKING = false;
CE2.SPLIT_TRACKERS = true;

;
// Trackers dependencies


;
"use strict";

CE2.cookieStorage = {
  CK: '_ce.s',
  saveTimeout: null,
  canSave: typeof CE_NO_COOKIES === 'undefined' || !CE_NO_COOKIES,
  expiresIn: typeof CE_COOKIE_EXPIRE_DAYS === 'number' ? CE_COOKIE_EXPIRE_DAYS : 1780,
  load: function load() {
    if (this.values) {
      return;
    }

    var values = {};
    var strings = CE2.cookies[this.CK];
    var i;
    var key;

    if (!strings) {
      this.values = {};
      return;
    }

    strings = strings.replace(/\\~/g, '\x00').split('~');

    for (i = 0; key = strings[i]; i += 2) {
      values[key.replace(/\x00/g, '~')] = strings[i + 1].replace(/\x00/g, '~');
    }

    this.values = values;
  },
  getCookieRawValue: function getCookieRawValue() {
    var values = this.values || {};
    var strings = [];
    CE2.each(values, function (value, key) {
      strings.push(key.replace('~', '\\~'));
      strings.push(value.replace('~', '\\~'));
    });
    return strings.join('~');
  },
  save: function save() {
    if (this.canSave) {
      CE2.writeCookie(this.CK, this.getCookieRawValue(), {
        expiresInDays: this.expiresIn
      });
    }
  },
  get: function get(key) {
    this.load();
    return this.values[key];
  },
  set: function set(key, value) {
    var self = this;
    this.load();
    this.values[key] = "".concat(value);

    if (this.saveTimeout === null) {
      this.saveTimeout = setTimeout(function () {
        self.saveTimeout = null;
        self.save();
      }, 10);
    }
  },
  del: function del(key) {
    this.load();
    delete this.values[key];
    this.save();
  }
};






;
"use strict";

/* eslint-disable */

/***
 * This file creates our own JSON stringify method
 * There are currently lots of JSON serializers available in the online
 * user might use any of them in their website sometimes those libraries might contain bugs
 * so to avoid that dependency we are using our own stringify method it is copied from JSON2.js and customized to not to use Array.prototype.toJSON method.
 * Example issue: when user uses 6.1 version prototypejs,
 * default JSON.stringify is adding extra quotes to resultant json string
 ***/
if (typeof CE2 == "undefined") CE2 = {};
if (!CE2.JSON) CE2.JSON = {};

(function (JSON) {
  //  json2.js
  //  2016-05-01
  //  Public Domain.
  //  NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
  //  See http://www.JSON.org/js.html
  //  This code should be minified before deployment.
  //  See http://javascript.crockford.com/jsmin.html
  //  USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
  //  NOT CONTROL.
  //  This file creates a global JSON object containing two methods: stringify
  //  and parse. This file is provides the ES5 JSON capability to ES3 systems.
  //  If a project might run on IE8 or earlier, then this file should be included.
  //  This file does nothing on ES5 systems.
  //      JSON.stringify(value, replacer, space)
  //          value       any JavaScript value, usually an object or array.
  //          replacer    an optional parameter that determines how object
  //                      values are stringified for objects. It can be a
  //                      function or an array of strings.
  //          space       an optional parameter that specifies the indentation
  //                      of nested structures. If it is omitted, the text will
  //                      be packed without extra whitespace. If it is a number,
  //                      it will specify the number of spaces to indent at each
  //                      level. If it is a string (such as "\t" or "&nbsp;"),
  //                      it contains the characters used to indent at each level.
  //          This method produces a JSON text from a JavaScript value.
  //          When an object value is found, if the object contains a toJSON
  //          method, its toJSON method will be called and the result will be
  //          stringified. A toJSON method does not serialize: it returns the
  //          value represented by the name/value pair that should be serialized,
  //          or undefined if nothing should be serialized. The toJSON method
  //          will be passed the key associated with the value, and this will be
  //          bound to the value.
  //          For example, this would serialize Dates as ISO strings.
  //              Date.prototype.toJSON = function (key) {
  //                  function f(n) {
  //                      // Format integers to have at least two digits.
  //                      return (n < 10)
  //                          ? "0" + n
  //                          : n;
  //                  }
  //                  return this.getUTCFullYear()   + "-" +
  //                       f(this.getUTCMonth() + 1) + "-" +
  //                       f(this.getUTCDate())      + "T" +
  //                       f(this.getUTCHours())     + ":" +
  //                       f(this.getUTCMinutes())   + ":" +
  //                       f(this.getUTCSeconds())   + "Z";
  //              };
  //          You can provide an optional replacer method. It will be passed the
  //          key and value of each member, with this bound to the containing
  //          object. The value that is returned from your method will be
  //          serialized. If your method returns undefined, then the member will
  //          be excluded from the serialization.
  //          If the replacer parameter is an array of strings, then it will be
  //          used to select the members to be serialized. It filters the results
  //          such that only members with keys listed in the replacer array are
  //          stringified.
  //          Values that do not have JSON representations, such as undefined or
  //          functions, will not be serialized. Such values in objects will be
  //          dropped; in arrays they will be replaced with null. You can use
  //          a replacer function to replace those with JSON values.
  //          JSON.stringify(undefined) returns undefined.
  //          The optional space parameter produces a stringification of the
  //          value that is filled with line breaks and indentation to make it
  //          easier to read.
  //          If the space parameter is a non-empty string, then that string will
  //          be used for indentation. If the space parameter is a number, then
  //          the indentation will be that many spaces.
  //          Example:
  //          text = JSON.stringify(["e", {pluribus: "unum"}]);
  //          // text is '["e",{"pluribus":"unum"}]'
  //          text = JSON.stringify(["e", {pluribus: "unum"}], null, "\t");
  //          // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'
  //          text = JSON.stringify([new Date()], function (key, value) {
  //              return this[key] instanceof Date
  //                  ? "Date(" + this[key] + ")"
  //                  : value;
  //          });
  //          // text is '["Date(---current time---)"]'
  //      JSON.parse(text, reviver)
  //          This method parses a JSON text to produce an object or array.
  //          It can throw a SyntaxError exception.
  //          The optional reviver parameter is a function that can filter and
  //          transform the results. It receives each of the keys and values,
  //          and its return value is used instead of the original value.
  //          If it returns what it received, then the structure is not modified.
  //          If it returns undefined then the member is deleted.
  //          Example:
  //          // Parse the text. Values that look like ISO date strings will
  //          // be converted to Date objects.
  //          myData = JSON.parse(text, function (key, value) {
  //              var a;
  //              if (typeof value === "string") {
  //                  a =
  //   /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
  //                  if (a) {
  //                      return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
  //                          +a[5], +a[6]));
  //                  }
  //              }
  //              return value;
  //          });
  //          myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
  //              var d;
  //              if (typeof value === "string" &&
  //                      value.slice(0, 5) === "Date(" &&
  //                      value.slice(-1) === ")") {
  //                  d = new Date(value.slice(5, -1));
  //                  if (d) {
  //                      return d;
  //                  }
  //              }
  //              return value;
  //          });
  //  This is a reference implementation. You are free to copy, modify, or
  //  redistribute.

  /*jslint
    eval, for, this
    */

  /*property
    JSON, apply, call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
    */
  "use strict";

  var rx_one = /^[\],:{}\s]*$/;
  var rx_two = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g;
  var rx_three = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
  var rx_four = /(?:^|:|,)(?:\s*\[)+/g;
  var rx_escapable = /[\\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
  var rx_dangerous = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;

  function f(n) {
    // Format integers to have at least two digits.
    return n < 10 ? "0" + n : n;
  }

  function this_value() {
    return this.valueOf();
  }

  if (typeof Date.prototype.toJSON !== "function") {
    Date.prototype.toJSON = function () {
      return isFinite(this.valueOf()) ? this.getUTCFullYear() + "-" + f(this.getUTCMonth() + 1) + "-" + f(this.getUTCDate()) + "T" + f(this.getUTCHours()) + ":" + f(this.getUTCMinutes()) + ":" + f(this.getUTCSeconds()) + "Z" : null;
    };

    Boolean.prototype.toJSON = this_value;
    Number.prototype.toJSON = this_value;
    String.prototype.toJSON = this_value;
  }

  var gap;
  var indent;
  var meta;
  var rep;

  function quote(string) {
    // If the string contains no control characters, no quote characters, and no
    // backslash characters, then we can safely slap some quotes around it.
    // Otherwise we must also replace the offending characters with safe escape
    // sequences.
    rx_escapable.lastIndex = 0;
    return rx_escapable.test(string) ? "\"" + string.replace(rx_escapable, function (a) {
      var c = meta[a];
      return typeof c === "string" ? c : "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4);
    }) + "\"" : "\"" + string + "\"";
  }

  function str(key, holder) {
    // Produce a string from holder[key].
    var i; // The loop counter.

    var k; // The member key.

    var v; // The member value.

    var length;
    var mind = gap;
    var partial;
    var value = holder[key]; // If the value has a toJSON method, call it to obtain a replacement value.

    if (value && CE2babelHelpers.typeof(value) === "object" && Object.prototype.toString.apply(value) !== "[object Array]" && typeof value.toJSON === "function") {
      value = value.toJSON(key);
    } // If we were called with a replacer function, then call the replacer to
    // obtain a replacement value.


    if (typeof rep === "function") {
      value = rep.call(holder, key, value);
    } // What happens next depends on the value's type.


    switch (CE2babelHelpers.typeof(value)) {
      case "string":
        return quote(value);

      case "number":
        // JSON numbers must be finite. Encode non-finite numbers as null.
        return isFinite(value) ? String(value) : "null";

      case "boolean":
      case "null":
        // If the value is a boolean or null, convert it to a string. Note:
        // typeof null does not produce "null". The case is included here in
        // the remote chance that this gets fixed someday.
        return String(value);
      // If the type is "object", we might be dealing with an object or an array or
      // null.

      case "object":
        // Due to a specification blunder in ECMAScript, typeof null is "object",
        // so watch out for that case.
        if (!value) {
          return "null";
        } // Make an array to hold the partial results of stringifying this object value.


        gap += indent;
        partial = []; // Is the value an array?

        if (Object.prototype.toString.apply(value) === "[object Array]") {
          // The value is an array. Stringify every element. Use null as a placeholder
          // for non-JSON values.
          length = value.length;

          for (i = 0; i < length; i += 1) {
            partial[i] = str(i, value) || "null";
          } // Join all of the elements together, separated with commas, and wrap them in
          // brackets.


          v = partial.length === 0 ? "[]" : gap ? "[\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "]" : "[" + partial.join(",") + "]";
          gap = mind;
          return v;
        } // If the replacer is an array, use it to select the members to be stringified.


        if (rep && CE2babelHelpers.typeof(rep) === "object") {
          length = rep.length;

          for (i = 0; i < length; i += 1) {
            if (typeof rep[i] === "string") {
              k = rep[i];
              v = str(k, value);

              if (v) {
                partial.push(quote(k) + (gap ? ": " : ":") + v);
              }
            }
          }
        } else {
          // Otherwise, iterate through all of the keys in the object.
          for (k in value) {
            if (Object.prototype.hasOwnProperty.call(value, k)) {
              v = str(k, value);

              if (v) {
                partial.push(quote(k) + (gap ? ": " : ":") + v);
              }
            }
          }
        } // Join all of the member texts together, separated with commas,
        // and wrap them in braces.


        v = partial.length === 0 ? "{}" : gap ? "{\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "}" : "{" + partial.join(",") + "}";
        gap = mind;
        return v;
    }
  } // If the JSON object does not yet have a stringify method, give it one.


  if (typeof JSON.stringify !== "function") {
    meta = {
      // table of character substitutions
      "\b": "\\b",
      "\t": "\\t",
      "\n": "\\n",
      "\f": "\\f",
      "\r": "\\r",
      "\"": "\\\"",
      "\\": "\\\\"
    };

    JSON.stringify = function (value, replacer, space) {
      // The stringify method takes a value and an optional replacer, and an optional
      // space parameter, and returns a JSON text. The replacer can be a function
      // that can replace values, or an array of strings that will select the keys.
      // A default replacer method can be provided. Use of the space parameter can
      // produce text that is more easily readable.
      var i;
      gap = "";
      indent = ""; // If the space parameter is a number, make an indent string containing that
      // many spaces.

      if (typeof space === "number") {
        for (i = 0; i < space; i += 1) {
          indent += " ";
        } // If the space parameter is a string, it will be used as the indent string.

      } else if (typeof space === "string") {
        indent = space;
      } // If there is a replacer, it must be a function or an array.
      // Otherwise, throw an error.


      rep = replacer;

      if (replacer && typeof replacer !== "function" && (CE2babelHelpers.typeof(replacer) !== "object" || typeof replacer.length !== "number")) {
        throw new Error("JSON.stringify");
      } // Make a fake root object containing our value under the key of "".
      // Return the result of stringifying the value.


      return str("", {
        "": value
      });
    };
  }
})(CE2.JSON);






;
"use strict";

if (typeof CE2 === 'undefined') CE2 = {}; // S16: signed, 16-bit integer
// 0x8000 == Math.pow(2, 16) / 2
// 0x8000 is considered 0
// greater than 0x8000 is positive
// less than 0x8000 is negative

CE2.S16_0 = 0x8000;

CE2.Package = function () {
  var propList = [];
  var props = {};
  var row;
  var name;
  var type;
  var size;

  for (var i = 0, l = arguments.length; i < l; i++) {
    row = i < 0 || arguments.length <= i ? undefined : arguments[i];
    name = row[0];
    type = row[1];
    size = row[2];
    propList.push(name);
    props[name] = {
      t: type,
      s: size
    };
  }

  this.props = props;
  this.propList = propList;
  this.overBudget = [];
  this.surplus = 0;
};

CE2.Package.prototype = {
  set: function set(name, value) {
    // console.log('Package.set(', name, ',', value, ')');
    var prop = this.props[name];
    var surplus = 0;
    if (!prop) return;

    if (prop.t == 's') {
      prop.ov = value;
      prop.v = String(value) ? CE2.utf8Trim(String(value), 255) : '';
      surplus = prop.s - prop.v.length;
      this.surplus += surplus;
      if (surplus < 0) this.overBudget.push(prop);
    } else {
      prop.ov = value;
      prop.v = isNaN(parseInt(value, 10)) ? 0 : parseInt(value, 10);
    }
  },
  trimStrings: function trimStrings() {
    var surplus = this.surplus;
    var overBudget = this.overBudget;
    if (surplus >= 0) return;
    var diff = Math.abs(surplus) / overBudget.length;
    var remainder = Math.floor(diff) == diff ? 0 : 1;
    diff = Math.floor(diff);

    for (var i = 0, l = overBudget.length, prop = null; i < l; i++) {
      prop = overBudget[i];
      prop.v = CE2.utf8Trim(prop.v, prop.v.length - diff - remainder);
      if (remainder) remainder = 0;
    }
  },
  toString: function toString() {
    this.trimStrings();
    var props = this.props;
    var propList = this.propList;
    var result = [];
    var prop;
    var value;

    for (var i = 0, l = propList.length; i < l; i++) {
      prop = props[propList[i]];
      value = prop.v;

      if (prop.t == 's') {
        if (value == null) result.push('\x00');else {
          result.push(CE2.pack(1, value.length));
          result.push(value);
        }
      } else if (value == null) result.push(CE2.pack(prop.s, 0));else result.push(CE2.pack(prop.s, value));
    }

    return result.join('');
  }
};

CE2.pack = function (size, value) {
  var result = '';

  for (var i = 0; i < size; i++) {
    result += String.fromCharCode(value >> 8 * i & 255);
  }

  return result;
};

CE2.utf8 = function (string) {
  return unescape(encodeURIComponent(string));
};

CE2.utf8Trim = function (string, target) {
  var subString = string.substr(0, target);
  var result = CE2.utf8(subString);
  if (result == subString) return subString;

  for (var l = subString.length - 1; result.length > target; l--) {
    result = CE2.utf8(subString.substr(0, l));
  }

  return result;
};

CE2.base64Alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_=';

CE2.base64 = function (input) {
  var alphabet = CE2.base64Alphabet;
  var chr1;
  var chr2;
  var chr3;
  var enc1;
  var enc2;
  var enc3;
  var enc4;
  var output = [];
  var i = 0;
  var l = input.length;

  while (i < l) {
    chr1 = input.charCodeAt(i++);
    chr2 = input.charCodeAt(i++);
    chr3 = input.charCodeAt(i++);
    enc1 = chr1 >> 2;
    enc2 = (chr1 & 3) << 4 | chr2 >> 4;
    enc3 = (chr2 & 15) << 2 | chr3 >> 6;
    enc4 = chr3 & 63;

    if (isNaN(chr2)) {
      enc3 = enc4 = 64;
    } else if (isNaN(chr3)) {
      enc4 = 64;
    }

    output.push(alphabet.charAt(enc1) + alphabet.charAt(enc2));

    if (enc3 != 64) {
      output.push(alphabet.charAt(enc3));

      if (enc4 != 64) {
        output.push(alphabet.charAt(enc4));
      }
    }
  }

  return output.join('');
};


"use strict";

CE2.snapshots = "%8&4!}%|%]!}$<$4$;$2$1$5$1$8$,!}&.!}$<$2$2$,!}%^!}$<$2$6$;$1$;$5$6$9$8$4$,!}&-!}$<&4!}&(&*&&&,&&%[&&&!!}$<!}%{&,&,&(!}$,!}%{&&&+&,!}$<!}%~&*%^&-&+%[%{$.%[&&&$$.%@&*!}$,!}&(%?&,%{!}$<!}$0%[%?&,%^%`&&&*&2$0&+&-%@&!%|&$%^$0!}&6&6$,&4!}%|%]!}$<$4$9$7$9$5$4$5$,!}&.!}$<$2$2$,!}%^!}$<$2$6$9$9$7$2$9$5$8$;$,!}&-!}$<&4!}&(&*&&&,&&%[&&&!!}$<!}%{&,&,&(!}$,!}%{&&&+&,!}$<!}%~&*%^&-&+%[%{$.%[&&&$$.%@&*!}$,!}&(%?&,%{!}$<!}$0%[%?&,%^%`&&&*&2$0%@%?&3%?%?&*$0!}&6&6$,&4!}%|%]!}$<$4$9$6$;$3$1$2$,!}&.!}$<$2$2$,!}%^!}$<$2$6$9$9$4$4$7$4$8$4$,!}&-!}$<&4!}&(&*&&&,&&%[&&&!!}$<!}%{&,&,&(!}$,!}%{&&&+&,!}$<!}%~&*%^&-&+%[%{$.%[&&&$$.%@&*!}$,!}&(%?&,%{!}$<!}$0%?%@&&&-&,$0!}&6&6$,&4!}%|%]!}$<$4$;$1$1$;$4$9$,!}&.!}$<$2$2$,!}%^!}$<$2$6$;$1$5$3$5$1$9$;$,!}&-!}$<&4!}&(&*&&&,&&%[&&&!!}$<!}%{&,&,&(!}$,!}%{&&&+&,!}$<!}%~&*%^&-&+%[%{$.%[&&&$$.%@&*!}$,!}&(%?&,%{!}$<!}$0!}&6&6%;";
CE2.TRACKING_DEST = "http://trk.cetrk.com/";
CE2.TRACKING_DEST_SECURE = "https://s3.amazonaws.com/trk.cetrk.com/";
CE2.TRACKING_DEST_NEW = "https://user-event-tracker.crazyegg.com/";
CE2.TRACKING_DEST_NEW_SECURE = "https://user-event-tracker.crazyegg.com/";
CE2.DEST_V11 = "https://tracking.crazyegg.com/v11";

;
"use strict";


;
"use strict";


;
"use strict";

// ----------------------------------------------------------------------
// This file was generated by create_device_js. Do not modify it. Instead,
// modify the Ruby class that it came from, then re-run create_device_js.
// ----------------------------------------------------------------------
window.Device = {
  types: {
    desktop: {
      name: 'desktop',
      fullName: 'Desktop',
      code: 1,
      display: {
        width: 1280,
        height: 800
      },
      viewport: {
        width: 1280,
        height: 800
      },
      userAgent: null
    },
    phone: {
      name: 'phone',
      fullName: 'Phone',
      code: 2,
      display: {
        width: 320,
        height: 480
      },
      viewport: {
        width: 980,
        height: 1091
      },
      userAgent: 'Mozilla/5.0 (Android 7.0; Mobile; rv:60.0) Gecko/60.0 Firefox/60.0'
    },
    tablet: {
      name: 'tablet',
      fullName: 'Tablet',
      code: 3,
      display: {
        width: 800,
        height: 1280
      },
      viewport: {
        width: 980,
        height: 1568
      },
      userAgent: 'Mozilla/5.0 (Android 7.0; Tablet; rv:60.0) Gecko/60.0 Firefox/60.0'
    }
  },
  codeMap: {
    1: 'desktop',
    2: 'phone',
    3: 'tablet'
  },
  typeMap: {
    desktop: 1,
    phone: 2,
    tablet: 3
  }
};



;
"use strict";

// ----------------------------------------------------------------------
// This file was generated by create_detect_device_js. Do not modify it. Instead,
// modify that Ruby script or the C++ code that this code was derrived from,
// then re-run create_detect_device_js.
// ----------------------------------------------------------------------
if (typeof CE2 === 'undefined') CE2 = {};

CE2.deviceType = function (ua) {
  var uaLower = ua.toLowerCase();
  var paren;
  var pos;
  var character = 0;
  paren = ua.indexOf('(');
  if (paren == -1) return 1;
  paren++; // Android

  if ((pos = ua.indexOf('Android', paren)) != -1) {
    pos += 8; // length of "Android "

    if (ua.length > pos && (character = ua.charAt(pos))) {
      switch (character) {
        case '2':
          // Tablets using Android 2 don't tend to follow the convention of
          // only having "Mobile" in the string if it's a phone.
          // Nook
          if (ua.indexOf('BNTV', pos) != -1) return 3;
          if (uaLower.indexOf('nook', pos) != -1) return 3; // Kindle

          if (ua.indexOf('Kindle', pos) != -1) return 3; // HP Touchpad

          if (ua.indexOf('Touchpad', pos) != -1) return 3;
          break;

        case '3':
          // Android 3 was just for tablets
          return 3;

        case '4':
          // Kindle
          if (ua.indexOf('Silk', pos) != -1) return 3;
      }
    } // They made it easy for us


    if (uaLower.indexOf('tablet', pos) != -1) return 3; // Android phone

    if (ua.indexOf('Mobi', pos) != -1) return 2;
    return 3;
  } // iOS


  if ((pos = ua.indexOf('iP', paren)) != -1) {
    character = ua.charAt(pos + 2);

    switch (character) {
      // iPad
      case 'a':
        return 3;
      // iPhone, iPod

      case 'h':
      case 'o':
        return 2;
    }
  } // BlackBerry


  if ((pos = ua.indexOf('BlackBerry', paren)) != -1) {
    // 10 is length of "BlackBerry"
    if (ua.indexOf('Tablet', pos + 10) != -1) return 3;
    return 2;
  } // Windows Phone


  if (ua.indexOf('Windows Phone', paren) != -1) return 2; // BlackBerry again

  if (ua.indexOf('BB10', paren) != -1) return 2; // other phones

  if (ua.charAt(0) != 'M' // Doesn't start with "Mozilla"
  && ua.indexOf('Opera Mini', paren) != -1) return 2;
  return 1;
};





/*
Call the passed-in function or the function referred to by the invocation
array. An invocation array is a 1+ element array in the form of

  ["nameOfFunctionInCE2Namespace", optional, extra, arguments]

Example 1: the following invocation array calls CE2.something(1234, "abcd")

  ["something", 1234, "abcd"]

Example 2: the following invocation array calls CE2.blah() with no arguments

  ["blah"]
*/
CE2.invoke = function (fn) {
  var _CE;

  var functionType = 'function'; // minifier assist

  if (!fn) return;
  if (CE2babelHelpers.typeof(fn) === functionType) return fn();
  if (!(typeof fn.length === 'number' && CE2babelHelpers.typeof(CE2[fn[0]]) === functionType)) return;
  return (_CE = CE2)[fn[0]].apply(_CE, CE2babelHelpers.toConsumableArray(fn.slice(1)));
};

CE2.matchURLSimple = function ()
/* urls */
{
  var i;
  var l;
  var url;

  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  for (i = 0, l = args.length; i < l; i++) {
    url = args[i];
    if (CE2.matchURL(url.toLowerCase(), location.href)) return true;
  }

  return false;
};

CE2.isDeviceTypeAllowed = function (deviceType) {
  return CE2.deviceType(CE2.n.userAgent) === Device.typeMap[deviceType];
};



;
"use strict";


;
"use strict";

CE2.post = {
  send: function send(url, params, callback, canUseBeacon) {
    var encodeParams = this.encodeParams;
    var beacon = canUseBeacon && CE2.n && CE2.n.sendBeacon;
    var xhr;

    if (beacon) {
      CE2.n.sendBeacon(url, encodeParams(params));

      if (callback) {
        callback();
      }
    } else {
      xhr = CE2.w.XMLHttpRequest && new XMLHttpRequest();

      xhr.onreadystatechange = function () {
        if (callback && xhr.readyState == 4) {
          callback(xhr);
        }
      };

      xhr.open('POST', url);
      xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
      xhr.send(encodeParams(params));
    }
  },
  sendPlain: function sendPlain(url, text) {
    var xhr = CE2.w.XMLHttpRequest && new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.setRequestHeader('Content-type', 'text/plain');
    xhr.send(text);
  },
  sendJSON: function sendJSON(url, data) {
    var xhr = CE2.w.XMLHttpRequest && new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.setRequestHeader('Content-type', 'text/plain');
    xhr.send(CE2.JSON.stringify(data));
  },
  encodeParams: function encodeParams(params) {
    var result = '';
    var encode = encodeURIComponent;
    CE2.each(params, function (value, key) {
      if (value == null || !CE2.strip("".concat(value))) return;
      if (result.length) result += '&';
      result += "".concat(encode(key), "=").concat(encode(value));
    });
    return result;
  }
};


CE2.transformation = {
  /*
  Renders an array of transforms. The each element of the transforms array is
  an object in the form:
     {
      target: string // Required. The CSS selector of the element to be transformed.
       hide: boolean, // Optional. Hides the element. (The actual value of the
                     // property is ignored.)
       html: string,  // Optional. The element's innerHTML is set to the value.
       style: object, // Optional. An object where each key is a valid CSS
                     // property name (in camelCase form) and each value is
                     // the corresponding CSS property value.
    }
  */
  TIME_INTERVAL: 250,
  LONG_TIME_INTERVAL: 1000,
  RETRY_LIMIT: 30000,
  render: function render(transformsList, options, flowDetails) {
    options = options || {};
    var applied;
    var timeout;
    var now;

    if (!options.index) {
      options.index = 0;
    }

    var transform = transformsList[options.index];
    var shouldApplyTransform = !options.dynamicNode || document.body.contains(options.dynamicNode);

    if (transform && shouldApplyTransform) {
      applied = CE2.transformation.transform(transform);
      CE2.transformation.addUnloadEventListener(transformsList, options, flowDetails);

      if (applied) {
        options.index++;
        delete options.startTime;
        CE2.transformation.render(transformsList, options, flowDetails);
      } else {
        now = +new Date();
        options.startTime = options.startTime || now;
        timeout = CE2.transformation.calculateTimeout(options.startTime, now);
        setTimeout(function () {
          CE2.transformation.render(transformsList, options, flowDetails);
        }, timeout);
      }
    }
  },
  addUnloadEventListener: function addUnloadEventListener(transformsList, options, flowDetails) {
    if (!options.addedUnloadListener && flowDetails) {
      options.addedUnloadListener = true;
      CE2.listen(window, 'beforeunload', function () {
        if (transformsList.length !== options.index && options.startTime) {
          var isFlow = !!flowDetails.flow;
          var type = isFlow ? 'variants' : 'edits';
          var id = isFlow ? flowDetails.variant.variantId : flowDetails.edit.id;
          var params = {
            selector: transformsList[options.index].target
          };
          console.log('unable to apply all edits', flowDetails, options.index);
          var hostUrl = new CE2.URI(CE2.__CE_HOST__);
          var url = "//".concat(hostUrl.getHost(), "/user-script/").concat(type, "/").concat(id, "/failure");
          CE2.post.send(url, params, undefined, true);
        }
      });
    }
  },
  observeDynamicElements: function observeDynamicElements(transforms, flowDetails) {
    var key;
    var excludedNodeType = [Node.TEXT_NODE, Node.COMMENT_NODE];
    var keys = Object.keys(transforms);
    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        var addedNode;

        for (var m = 0; addedNode = mutation.addedNodes[m++];) {
          if (document.body.contains(addedNode)) {
            for (var j = 0; key = keys[j++];) {
              if (!excludedNodeType.includes(addedNode.nodeType) && CE2.transformation.matches(addedNode, key)) {
                CE2.transformation.render(transforms[key], {
                  dynamicNode: addedNode
                }, flowDetails);
              }
            }
          }
        }
      });
    });
    observer.observe(document, {
      childList: true,
      subtree: true
    });
  },
  transform: function transform(opt) {
    var elements = CE2.d.querySelectorAll(opt.target);
    var el;
    var i;

    if (elements.length === 0) {
      return false;
    }

    for (i = 0; el = elements[i++];) {
      if (opt.hide) {
        el.style.setProperty('display', 'none', 'important');
      } else if (opt.html) {
        el.outerHTML = opt.html;
      } else if (opt.style) {
        CE2.each(opt.style, function (value, name) {
          // stye might contain backgroundColor instead background-color so dasherize it
          el.style.setProperty(CE2.dasherize(name), value, 'important');
        });
      }
    }

    return true;
  },
  calculateTimeout: function calculateTimeout(startTime, now) {
    if (now - startTime < CE2.transformation.RETRY_LIMIT) {
      return CE2.transformation.TIME_INTERVAL;
    }

    return CE2.transformation.LONG_TIME_INTERVAL;
  },
  matches: function matches(el, selector) {
    return (el.matches || el.matchesSelector || el.msMatchesSelector || el.mozMatchesSelector || el.webkitMatchesSelector || el.oMatchesSelector).call(el, selector);
  }
};


CE2.initPageEdits = function () {
  try {
    CE2.each(CE2.pageEdits, function (edit, id) {
      // if the edit targets this device type
      if (CE2.isDeviceTypeAllowed(edit.deviceType)) {
        // if the visitor is a part of this edit
        if (CE2.invoke(edit.match)) {
          edit.id = id;
          var editDetils = {
            edit: edit
          };
          var options = {
            index: 0
          };
          CE2.transformation.render(edit.transforms.default, options, editDetils); // observe dynamic elements

          CE2.transformation.observeDynamicElements(edit.transforms, editDetils);
        }
      }
    });
  } catch (e) {// ignore error
  }
};

CE2.pageEdits = {"3495":{"deviceType":"phone","transforms":{"default":[{"target":"div.slider-videos-wrapper","hide":null,"html":null,"style":{"left":"-3px","top":"-1098px","position":"relative"},"finalSelectors":["div.slider-videos-wrapper"]}]},"match":["matchURLSimple","http://kreusch.com.br/movistar.html"]}};
CE2.PAGE_VIEWS_LIMIT_REACHED = false;
CE2.SREC_DEST = {"sample":"https://sample-api-v2.crazyegg.com","record":"https://recording.crazyegg.com"};
