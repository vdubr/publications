(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.app = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

//import React from 'react';

var _ApplicationView = require('./ApplicationView');

var _ApplicationView2 = _interopRequireDefault(_ApplicationView);

var _Application = require('./Application');

var _Application2 = _interopRequireDefault(_Application);

var initialData = {
  showWellInfo: false,
  wellInfo: {}
};

var view = React.render(React.createElement(_ApplicationView2['default'], null), document.querySelector('#application'));
var app = new _Application2['default'](initialData, view);

app.init();
app.render();

},{"./Application":3,"./ApplicationView":4}],2:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _globalEmitter = require('./Emitter');

var _globalEmitter2 = _interopRequireDefault(_globalEmitter);

var Application = (function () {
  function Application(initialData, view) {
    _classCallCheck(this, Application);

    this.view = view;
    this.state = initialData;
    this.setListeners();
  }

  _createClass(Application, [{
    key: 'getWellInfo',
    value: function getWellInfo(wellId) {
      return new Promise(function (resolve, reject) {
        var req = new XMLHttpRequest();
        var url = 'data/' + wellId + '/well.json';
        req.open('GET', url);

        req.onload = function () {
          // This is called even on 404 etc
          // so check the status
          if (req.status == 200) {
            // Resolve the promise with the response text
            var data = JSON.parse(req.responseText);
            resolve(data);
          } else {
            // Otherwise reject with the status text
            // which will hopefully be a meaningful error
            window['console']['log']('error load well info number ' + wellId);
            reject(Error(req.statusText));
          }
        };

        // Handle network errors
        req.onerror = function () {
          reject(Error('Network Error'));
        };

        // Make the request
        req.send();
      });
    }
  }, {
    key: 'init',
    value: function init() {

      var localConfig = {
        target: 'map',
        path: './data/moldavia'
      };
      var app = new mapito.App();

      var cb = function cb() {
        app.init();
      };

      var listener = function listener(evt) {
        var features = evt.features;
        if (features.length && features.length > 0) {
          var firstFeature = features[0];
          var geometry = firstFeature.getGeometry();
          var id = firstFeature.get('id');
          this.showDetail(id);
        }
      };

      app.setOptions(localConfig, cb);

      app.setEventListener(listener.bind(this));
    }
  }, {
    key: 'render',
    value: function render() {
      this.view.setState(this.state);
    }
  }, {
    key: 'setListeners',
    value: function setListeners() {
      _globalEmitter2['default'].on('closeWellInfo', (function () {
        this.state.showWellInfo = false;
        this.render();
      }).bind(this));
    }
  }, {
    key: 'showDetail',
    value: function showDetail(wellId) {

      this.getWellInfo(wellId).then(this.showWellInfo.bind(this));
    }
  }, {
    key: 'showWellInfo',
    value: function showWellInfo(data) {
      this.state.wellInfo = data;
      this.state.showWellInfo = true;
      this.render();
    }
  }]);

  return Application;
})();

exports['default'] = Application;
module.exports = exports['default'];
/**@type {mapito.app.Options}*/

},{"./Emitter":5}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { desc = parent = getter = undefined; _again = false; var object = _x,
    property = _x2,
    receiver = _x3; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

//import {Component} from 'react';

var _WellInfo = require("./wellInfo");

var _WellInfo2 = _interopRequireDefault(_WellInfo);

var ApplicationView = (function (_React$Component) {
  function ApplicationView() {
    _classCallCheck(this, ApplicationView);

    _get(Object.getPrototypeOf(ApplicationView.prototype), "constructor", this).call(this);
    this.state = {};
  }

  _inherits(ApplicationView, _React$Component);

  _createClass(ApplicationView, [{
    key: "render",
    value: function render() {
      window["console"]["log"]("kkkk", this.state);
      return React.createElement(
        "div",
        null,
        React.createElement("div", { id: "map" }),
        React.createElement(
          "div",
          { id: "data" },
          React.createElement(
            "div",
            null,
            React.createElement("div", { className: "logo-watersources" }),
            React.createElement("div", { className: "logo-cra" }),
            React.createElement(_WellInfo2["default"], { isVisible: this.state.showWellInfo, data: this.state.wellInfo })
          )
        )
      );
    }
  }]);

  return ApplicationView;
})(React.Component);

exports["default"] = ApplicationView;
module.exports = exports["default"];

},{"./wellInfo":6}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _EventEmitter = require('events');

var _EventEmitter2 = _interopRequireDefault(_EventEmitter);

var globalEmitter = new _EventEmitter2['default']();

exports['default'] = globalEmitter;
module.exports = exports['default'];

},{"events":2}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { desc = parent = getter = undefined; _again = false; var object = _x,
    property = _x2,
    receiver = _x3; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

//import {Component} from 'react';
//import React from 'react';

var _globalEmitter = require("./Emitter");

var _globalEmitter2 = _interopRequireDefault(_globalEmitter);

var WellInfo = (function (_React$Component) {
  function WellInfo(props) {
    _classCallCheck(this, WellInfo);

    _get(Object.getPrototypeOf(WellInfo.prototype), "constructor", this).call(this, props);
    this.props = {
      isVisible: false,
      data: null
    };

    this._onCloseBtnClick = this._onCloseBtnClick.bind(this);
  }

  _inherits(WellInfo, _React$Component);

  _createClass(WellInfo, [{
    key: "_getRows",
    value: function _getRows(data) {
      var rows = [];
      var row;
      for (var i in data) {
        row = React.createElement(
          "tr",
          null,
          React.createElement(
            "th",
            null,
            i
          ),
          React.createElement(
            "td",
            null,
            data[i]
          )
        );
        rows.push(row);
      }
      return rows;
    }
  }, {
    key: "_onCloseBtnClick",
    value: function _onCloseBtnClick() {
      window["console"]["log"]("click");
      _globalEmitter2["default"].emit("closeWellInfo");
    }
  }, {
    key: "render",
    value: function render() {
      window["console"]["log"](this.props.isVisible);
      var rows = [];
      if (!this.props.isVisible) {
        return React.createElement("div", null);
      } else {
        return React.createElement(
          "div",
          { className: "wellInfo", style: { display: this.props.isVisible ? "block" : "none" } },
          React.createElement(
            "button",
            { className: "closeBtn", onClick: this._onCloseBtnClick },
            "close",
            React.createElement("i", { className: "fa fa-times fa-2", style: { "padding-left": "4px" } })
          ),
          React.createElement(
            "div",
            { className: "wellContent" },
            React.createElement(
              "table",
              null,
              React.createElement(
                "tbody",
                null,
                this._getRows(this.props.data)
              )
            )
          )
        );
      };
    }
  }]);

  return WellInfo;
})(React.Component);

exports["default"] = WellInfo;

// class WellInfo {
//   constructor(wellInfo){
//     this.data = wellInfo
//   }
//
//   getComponent(){
//     return React.createClass({
//         render: function() {
//           window["console"]["log"]("props",this.props.data);
//
//           var rows = []
//           //rows.push(  <tr>this.props.BodRegion</tr> )
//             return (
//                 <table>
//                     <tbody><td>'BodRegionCislo'</td><td>{this.props.data.BodRegionCislo}</td></tbody>
//                 </table>
//             );
//         }
//     });
//   }
//
//   render(){
//     var data = document.body.querySelector('#data')
//     var wellInfoComponent = this.getComponent()
//
//     //React.createElement(wellInfoComponent),  data);
//     React.render(
//       React.createElement(wellInfoComponent, {data:this.data}),  data);
//   }
// }
//
// module.exports = WellInfo;
module.exports = exports["default"];

},{"./Emitter":5}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvdm9qdGFkdWJyb3Zza3kvV29yay9tb2xkYXZpYV93YXRlci93ZWIvc3JjL21haW4uanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvZXZlbnRzL2V2ZW50cy5qcyIsIi9Vc2Vycy92b2p0YWR1YnJvdnNreS9Xb3JrL21vbGRhdmlhX3dhdGVyL3dlYi9zcmMvQXBwbGljYXRpb24uanMiLCIvVXNlcnMvdm9qdGFkdWJyb3Zza3kvV29yay9tb2xkYXZpYV93YXRlci93ZWIvc3JjL0FwcGxpY2F0aW9uVmlldy5qcyIsIi9Vc2Vycy92b2p0YWR1YnJvdnNreS9Xb3JrL21vbGRhdmlhX3dhdGVyL3dlYi9zcmMvRW1pdHRlci5qcyIsIi9Vc2Vycy92b2p0YWR1YnJvdnNreS9Xb3JrL21vbGRhdmlhX3dhdGVyL3dlYi9zcmMvd2VsbEluZm8uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7K0JDQzRCLG1CQUFtQjs7OzsyQkFDdkIsZUFBZTs7OztBQUV2QyxJQUFJLFdBQVcsR0FBRztBQUNoQixjQUFZLEVBQUMsS0FBSztBQUNsQixVQUFRLEVBQUUsRUFBRTtDQUNiLENBQUE7O0FBRUQsSUFBSSxJQUFJLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FDbkIsdURBQW1CLEVBQ25CLFFBQVEsQ0FBQyxhQUFhLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztBQUM1QyxJQUFJLEdBQUcsR0FBRyw2QkFBZ0IsV0FBVyxFQUFFLElBQUksQ0FBQyxDQUFDOztBQUU3QyxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDWCxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUM7OztBQ2ZiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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QUUsRUFBQyxjQUFjLEVBQUMsS0FBSyxFQUFDLEFBQUMsR0FBTTtXQUMvRDtVQUNUOztjQUFLLFNBQVMsRUFBRSxhQUFhLEFBQUM7WUFDNUI7OztjQUNJOzs7Z0JBQ0csSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQztlQUN2QjthQUNOO1dBQ0o7U0FDRixDQUNQO09BQ0EsQ0FBQztLQUNQOzs7U0FsREwsUUFBUTtHQUFTLEtBQUssQ0FBQyxTQUFTOztxQkFxRHZCLFFBQVEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy9pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IEFwcGxpY2F0aW9uVmlldyBmcm9tICcuL0FwcGxpY2F0aW9uVmlldyc7XG5pbXBvcnQgQXBwbGljYXRpb24gZnJvbSAnLi9BcHBsaWNhdGlvbic7XG5cbmxldCBpbml0aWFsRGF0YSA9IHtcbiAgc2hvd1dlbGxJbmZvOmZhbHNlLFxuICB3ZWxsSW5mbzoge31cbn1cblxubGV0IHZpZXcgPSBSZWFjdC5yZW5kZXIoXG4gICAgPEFwcGxpY2F0aW9uVmlldyAvPixcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjYXBwbGljYXRpb24nKSk7XG5sZXQgYXBwID0gbmV3IEFwcGxpY2F0aW9uKGluaXRpYWxEYXRhLCB2aWV3KTtcblxuYXBwLmluaXQoKTtcbmFwcC5yZW5kZXIoKTtcbiIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG5mdW5jdGlvbiBFdmVudEVtaXR0ZXIoKSB7XG4gIHRoaXMuX2V2ZW50cyA9IHRoaXMuX2V2ZW50cyB8fCB7fTtcbiAgdGhpcy5fbWF4TGlzdGVuZXJzID0gdGhpcy5fbWF4TGlzdGVuZXJzIHx8IHVuZGVmaW5lZDtcbn1cbm1vZHVsZS5leHBvcnRzID0gRXZlbnRFbWl0dGVyO1xuXG4vLyBCYWNrd2FyZHMtY29tcGF0IHdpdGggbm9kZSAwLjEwLnhcbkV2ZW50RW1pdHRlci5FdmVudEVtaXR0ZXIgPSBFdmVudEVtaXR0ZXI7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX2V2ZW50cyA9IHVuZGVmaW5lZDtcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX21heExpc3RlbmVycyA9IHVuZGVmaW5lZDtcblxuLy8gQnkgZGVmYXVsdCBFdmVudEVtaXR0ZXJzIHdpbGwgcHJpbnQgYSB3YXJuaW5nIGlmIG1vcmUgdGhhbiAxMCBsaXN0ZW5lcnMgYXJlXG4vLyBhZGRlZCB0byBpdC4gVGhpcyBpcyBhIHVzZWZ1bCBkZWZhdWx0IHdoaWNoIGhlbHBzIGZpbmRpbmcgbWVtb3J5IGxlYWtzLlxuRXZlbnRFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnMgPSAxMDtcblxuLy8gT2J2aW91c2x5IG5vdCBhbGwgRW1pdHRlcnMgc2hvdWxkIGJlIGxpbWl0ZWQgdG8gMTAuIFRoaXMgZnVuY3Rpb24gYWxsb3dzXG4vLyB0aGF0IHRvIGJlIGluY3JlYXNlZC4gU2V0IHRvIHplcm8gZm9yIHVubGltaXRlZC5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuc2V0TWF4TGlzdGVuZXJzID0gZnVuY3Rpb24obikge1xuICBpZiAoIWlzTnVtYmVyKG4pIHx8IG4gPCAwIHx8IGlzTmFOKG4pKVxuICAgIHRocm93IFR5cGVFcnJvcignbiBtdXN0IGJlIGEgcG9zaXRpdmUgbnVtYmVyJyk7XG4gIHRoaXMuX21heExpc3RlbmVycyA9IG47XG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIgZXIsIGhhbmRsZXIsIGxlbiwgYXJncywgaSwgbGlzdGVuZXJzO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuXG4gIC8vIElmIHRoZXJlIGlzIG5vICdlcnJvcicgZXZlbnQgbGlzdGVuZXIgdGhlbiB0aHJvdy5cbiAgaWYgKHR5cGUgPT09ICdlcnJvcicpIHtcbiAgICBpZiAoIXRoaXMuX2V2ZW50cy5lcnJvciB8fFxuICAgICAgICAoaXNPYmplY3QodGhpcy5fZXZlbnRzLmVycm9yKSAmJiAhdGhpcy5fZXZlbnRzLmVycm9yLmxlbmd0aCkpIHtcbiAgICAgIGVyID0gYXJndW1lbnRzWzFdO1xuICAgICAgaWYgKGVyIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgdGhyb3cgZXI7IC8vIFVuaGFuZGxlZCAnZXJyb3InIGV2ZW50XG4gICAgICB9XG4gICAgICB0aHJvdyBUeXBlRXJyb3IoJ1VuY2F1Z2h0LCB1bnNwZWNpZmllZCBcImVycm9yXCIgZXZlbnQuJyk7XG4gICAgfVxuICB9XG5cbiAgaGFuZGxlciA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICBpZiAoaXNVbmRlZmluZWQoaGFuZGxlcikpXG4gICAgcmV0dXJuIGZhbHNlO1xuXG4gIGlmIChpc0Z1bmN0aW9uKGhhbmRsZXIpKSB7XG4gICAgc3dpdGNoIChhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICAvLyBmYXN0IGNhc2VzXG4gICAgICBjYXNlIDE6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDI6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMzpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSwgYXJndW1lbnRzWzJdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICAvLyBzbG93ZXJcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgICAgIGFyZ3MgPSBuZXcgQXJyYXkobGVuIC0gMSk7XG4gICAgICAgIGZvciAoaSA9IDE7IGkgPCBsZW47IGkrKylcbiAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgaGFuZGxlci5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoaXNPYmplY3QoaGFuZGxlcikpIHtcbiAgICBsZW4gPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgIGFyZ3MgPSBuZXcgQXJyYXkobGVuIC0gMSk7XG4gICAgZm9yIChpID0gMTsgaSA8IGxlbjsgaSsrKVxuICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG5cbiAgICBsaXN0ZW5lcnMgPSBoYW5kbGVyLnNsaWNlKCk7XG4gICAgbGVuID0gbGlzdGVuZXJzLmxlbmd0aDtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuOyBpKyspXG4gICAgICBsaXN0ZW5lcnNbaV0uYXBwbHkodGhpcywgYXJncyk7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICB2YXIgbTtcblxuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgdGhpcy5fZXZlbnRzID0ge307XG5cbiAgLy8gVG8gYXZvaWQgcmVjdXJzaW9uIGluIHRoZSBjYXNlIHRoYXQgdHlwZSA9PT0gXCJuZXdMaXN0ZW5lclwiISBCZWZvcmVcbiAgLy8gYWRkaW5nIGl0IHRvIHRoZSBsaXN0ZW5lcnMsIGZpcnN0IGVtaXQgXCJuZXdMaXN0ZW5lclwiLlxuICBpZiAodGhpcy5fZXZlbnRzLm5ld0xpc3RlbmVyKVxuICAgIHRoaXMuZW1pdCgnbmV3TGlzdGVuZXInLCB0eXBlLFxuICAgICAgICAgICAgICBpc0Z1bmN0aW9uKGxpc3RlbmVyLmxpc3RlbmVyKSA/XG4gICAgICAgICAgICAgIGxpc3RlbmVyLmxpc3RlbmVyIDogbGlzdGVuZXIpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIC8vIE9wdGltaXplIHRoZSBjYXNlIG9mIG9uZSBsaXN0ZW5lci4gRG9uJ3QgbmVlZCB0aGUgZXh0cmEgYXJyYXkgb2JqZWN0LlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IGxpc3RlbmVyO1xuICBlbHNlIGlmIChpc09iamVjdCh0aGlzLl9ldmVudHNbdHlwZV0pKVxuICAgIC8vIElmIHdlJ3ZlIGFscmVhZHkgZ290IGFuIGFycmF5LCBqdXN0IGFwcGVuZC5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0ucHVzaChsaXN0ZW5lcik7XG4gIGVsc2VcbiAgICAvLyBBZGRpbmcgdGhlIHNlY29uZCBlbGVtZW50LCBuZWVkIHRvIGNoYW5nZSB0byBhcnJheS5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBbdGhpcy5fZXZlbnRzW3R5cGVdLCBsaXN0ZW5lcl07XG5cbiAgLy8gQ2hlY2sgZm9yIGxpc3RlbmVyIGxlYWtcbiAgaWYgKGlzT2JqZWN0KHRoaXMuX2V2ZW50c1t0eXBlXSkgJiYgIXRoaXMuX2V2ZW50c1t0eXBlXS53YXJuZWQpIHtcbiAgICB2YXIgbTtcbiAgICBpZiAoIWlzVW5kZWZpbmVkKHRoaXMuX21heExpc3RlbmVycykpIHtcbiAgICAgIG0gPSB0aGlzLl9tYXhMaXN0ZW5lcnM7XG4gICAgfSBlbHNlIHtcbiAgICAgIG0gPSBFdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycztcbiAgICB9XG5cbiAgICBpZiAobSAmJiBtID4gMCAmJiB0aGlzLl9ldmVudHNbdHlwZV0ubGVuZ3RoID4gbSkge1xuICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdLndhcm5lZCA9IHRydWU7XG4gICAgICBjb25zb2xlLmVycm9yKCcobm9kZSkgd2FybmluZzogcG9zc2libGUgRXZlbnRFbWl0dGVyIG1lbW9yeSAnICtcbiAgICAgICAgICAgICAgICAgICAgJ2xlYWsgZGV0ZWN0ZWQuICVkIGxpc3RlbmVycyBhZGRlZC4gJyArXG4gICAgICAgICAgICAgICAgICAgICdVc2UgZW1pdHRlci5zZXRNYXhMaXN0ZW5lcnMoKSB0byBpbmNyZWFzZSBsaW1pdC4nLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9ldmVudHNbdHlwZV0ubGVuZ3RoKTtcbiAgICAgIGlmICh0eXBlb2YgY29uc29sZS50cmFjZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAvLyBub3Qgc3VwcG9ydGVkIGluIElFIDEwXG4gICAgICAgIGNvbnNvbGUudHJhY2UoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub24gPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgdmFyIGZpcmVkID0gZmFsc2U7XG5cbiAgZnVuY3Rpb24gZygpIHtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGcpO1xuXG4gICAgaWYgKCFmaXJlZCkge1xuICAgICAgZmlyZWQgPSB0cnVlO1xuICAgICAgbGlzdGVuZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG4gIH1cblxuICBnLmxpc3RlbmVyID0gbGlzdGVuZXI7XG4gIHRoaXMub24odHlwZSwgZyk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vLyBlbWl0cyBhICdyZW1vdmVMaXN0ZW5lcicgZXZlbnQgaWZmIHRoZSBsaXN0ZW5lciB3YXMgcmVtb3ZlZFxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHZhciBsaXN0LCBwb3NpdGlvbiwgbGVuZ3RoLCBpO1xuXG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIHJldHVybiB0aGlzO1xuXG4gIGxpc3QgPSB0aGlzLl9ldmVudHNbdHlwZV07XG4gIGxlbmd0aCA9IGxpc3QubGVuZ3RoO1xuICBwb3NpdGlvbiA9IC0xO1xuXG4gIGlmIChsaXN0ID09PSBsaXN0ZW5lciB8fFxuICAgICAgKGlzRnVuY3Rpb24obGlzdC5saXN0ZW5lcikgJiYgbGlzdC5saXN0ZW5lciA9PT0gbGlzdGVuZXIpKSB7XG4gICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICBpZiAodGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIGxpc3RlbmVyKTtcblxuICB9IGVsc2UgaWYgKGlzT2JqZWN0KGxpc3QpKSB7XG4gICAgZm9yIChpID0gbGVuZ3RoOyBpLS0gPiAwOykge1xuICAgICAgaWYgKGxpc3RbaV0gPT09IGxpc3RlbmVyIHx8XG4gICAgICAgICAgKGxpc3RbaV0ubGlzdGVuZXIgJiYgbGlzdFtpXS5saXN0ZW5lciA9PT0gbGlzdGVuZXIpKSB7XG4gICAgICAgIHBvc2l0aW9uID0gaTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHBvc2l0aW9uIDwgMClcbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgaWYgKGxpc3QubGVuZ3RoID09PSAxKSB7XG4gICAgICBsaXN0Lmxlbmd0aCA9IDA7XG4gICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIH0gZWxzZSB7XG4gICAgICBsaXN0LnNwbGljZShwb3NpdGlvbiwgMSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBsaXN0ZW5lcik7XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIga2V5LCBsaXN0ZW5lcnM7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgLy8gbm90IGxpc3RlbmluZyBmb3IgcmVtb3ZlTGlzdGVuZXIsIG5vIG5lZWQgdG8gZW1pdFxuICBpZiAoIXRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcikge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKVxuICAgICAgdGhpcy5fZXZlbnRzID0ge307XG4gICAgZWxzZSBpZiAodGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIGVtaXQgcmVtb3ZlTGlzdGVuZXIgZm9yIGFsbCBsaXN0ZW5lcnMgb24gYWxsIGV2ZW50c1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgIGZvciAoa2V5IGluIHRoaXMuX2V2ZW50cykge1xuICAgICAgaWYgKGtleSA9PT0gJ3JlbW92ZUxpc3RlbmVyJykgY29udGludWU7XG4gICAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycyhrZXkpO1xuICAgIH1cbiAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycygncmVtb3ZlTGlzdGVuZXInKTtcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICBpZiAoaXNGdW5jdGlvbihsaXN0ZW5lcnMpKSB7XG4gICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnMpO1xuICB9IGVsc2Uge1xuICAgIC8vIExJRk8gb3JkZXJcbiAgICB3aGlsZSAobGlzdGVuZXJzLmxlbmd0aClcbiAgICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzW2xpc3RlbmVycy5sZW5ndGggLSAxXSk7XG4gIH1cbiAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIgcmV0O1xuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIHJldCA9IFtdO1xuICBlbHNlIGlmIChpc0Z1bmN0aW9uKHRoaXMuX2V2ZW50c1t0eXBlXSkpXG4gICAgcmV0ID0gW3RoaXMuX2V2ZW50c1t0eXBlXV07XG4gIGVsc2VcbiAgICByZXQgPSB0aGlzLl9ldmVudHNbdHlwZV0uc2xpY2UoKTtcbiAgcmV0dXJuIHJldDtcbn07XG5cbkV2ZW50RW1pdHRlci5saXN0ZW5lckNvdW50ID0gZnVuY3Rpb24oZW1pdHRlciwgdHlwZSkge1xuICB2YXIgcmV0O1xuICBpZiAoIWVtaXR0ZXIuX2V2ZW50cyB8fCAhZW1pdHRlci5fZXZlbnRzW3R5cGVdKVxuICAgIHJldCA9IDA7XG4gIGVsc2UgaWYgKGlzRnVuY3Rpb24oZW1pdHRlci5fZXZlbnRzW3R5cGVdKSlcbiAgICByZXQgPSAxO1xuICBlbHNlXG4gICAgcmV0ID0gZW1pdHRlci5fZXZlbnRzW3R5cGVdLmxlbmd0aDtcbiAgcmV0dXJuIHJldDtcbn07XG5cbmZ1bmN0aW9uIGlzRnVuY3Rpb24oYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnZnVuY3Rpb24nO1xufVxuXG5mdW5jdGlvbiBpc051bWJlcihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdudW1iZXInO1xufVxuXG5mdW5jdGlvbiBpc09iamVjdChhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnICYmIGFyZyAhPT0gbnVsbDtcbn1cblxuZnVuY3Rpb24gaXNVbmRlZmluZWQoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IHZvaWQgMDtcbn1cbiIsImltcG9ydCBnbG9iYWxFbWl0dGVyIGZyb20gJy4vRW1pdHRlcic7XG5cbmNsYXNzIEFwcGxpY2F0aW9uIHtcblxuICAgIGNvbnN0cnVjdG9yKGluaXRpYWxEYXRhLCB2aWV3KSB7XG4gICAgICAgIHRoaXMudmlldyA9IHZpZXc7XG4gICAgICAgIHRoaXMuc3RhdGUgPSBpbml0aWFsRGF0YTtcbiAgICAgICAgdGhpcy5zZXRMaXN0ZW5lcnMoKVxuICAgIH1cblxuICAgIGdldFdlbGxJbmZvKHdlbGxJZCl7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIHZhciByZXEgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICAgICAgdmFyIHVybCA9ICdkYXRhLycgKyB3ZWxsSWQgKyAnL3dlbGwuanNvbidcbiAgICAgICAgcmVxLm9wZW4oJ0dFVCcsIHVybCk7XG5cbiAgICAgICAgcmVxLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIC8vIFRoaXMgaXMgY2FsbGVkIGV2ZW4gb24gNDA0IGV0Y1xuICAgICAgICAgIC8vIHNvIGNoZWNrIHRoZSBzdGF0dXNcbiAgICAgICAgICBpZiAocmVxLnN0YXR1cyA9PSAyMDApIHtcbiAgICAgICAgICAgIC8vIFJlc29sdmUgdGhlIHByb21pc2Ugd2l0aCB0aGUgcmVzcG9uc2UgdGV4dFxuICAgICAgICAgICAgdmFyIGRhdGEgPSBKU09OLnBhcnNlKHJlcS5yZXNwb25zZVRleHQpO1xuICAgICAgICAgICAgcmVzb2x2ZShkYXRhKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyBPdGhlcndpc2UgcmVqZWN0IHdpdGggdGhlIHN0YXR1cyB0ZXh0XG4gICAgICAgICAgICAvLyB3aGljaCB3aWxsIGhvcGVmdWxseSBiZSBhIG1lYW5pbmdmdWwgZXJyb3JcbiAgICAgICAgICAgIHdpbmRvd1tcImNvbnNvbGVcIl1bXCJsb2dcIl0oXCJlcnJvciBsb2FkIHdlbGwgaW5mbyBudW1iZXIgXCIgKyB3ZWxsSWQpO1xuICAgICAgICAgICAgcmVqZWN0KEVycm9yKHJlcS5zdGF0dXNUZXh0KSk7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIEhhbmRsZSBuZXR3b3JrIGVycm9yc1xuICAgICAgICByZXEub25lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJlamVjdChFcnJvcihcIk5ldHdvcmsgRXJyb3JcIikpO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIE1ha2UgdGhlIHJlcXVlc3RcbiAgICAgICAgcmVxLnNlbmQoKTtcbiAgICB9KVxuICAgIH1cblxuICAgIGluaXQoKXtcblxuICAgICAgdmFyIGxvY2FsQ29uZmlnID0ge1xuICAgICAgICB0YXJnZXQ6ICdtYXAnLFxuICAgICAgICBwYXRoOiAnLi9kYXRhL21vbGRhdmlhJ1xuICAgICAgfTtcbiAgICAgIHZhciBhcHAgPSBuZXcgbWFwaXRvLkFwcCgpXG5cbiAgICAgIHZhciBjYiA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIGFwcC5pbml0KClcbiAgICAgIH1cblxuICAgICAgdmFyIGxpc3RlbmVyID0gZnVuY3Rpb24oZXZ0KXtcbiAgICAgICAgdmFyIGZlYXR1cmVzID0gZXZ0LmZlYXR1cmVzXG4gICAgICAgIGlmKGZlYXR1cmVzLmxlbmd0aCAmJiBmZWF0dXJlcy5sZW5ndGggPiAwKXtcbiAgICAgICAgICB2YXIgZmlyc3RGZWF0dXJlID0gZmVhdHVyZXNbMF1cbiAgICAgICAgICB2YXIgZ2VvbWV0cnkgPSBmaXJzdEZlYXR1cmUuZ2V0R2VvbWV0cnkoKVxuICAgICAgICAgIHZhciBpZCA9IGZpcnN0RmVhdHVyZS5nZXQoJ2lkJylcbiAgICAgICAgICB0aGlzLnNob3dEZXRhaWwoaWQpXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgYXBwLnNldE9wdGlvbnMoLyoqQHR5cGUge21hcGl0by5hcHAuT3B0aW9uc30qLyhsb2NhbENvbmZpZyksY2IpO1xuXG4gICAgICBhcHAuc2V0RXZlbnRMaXN0ZW5lcihsaXN0ZW5lci5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIHRoaXMudmlldy5zZXRTdGF0ZSh0aGlzLnN0YXRlKTtcbiAgICAgIH1cblxuICAgICAgc2V0TGlzdGVuZXJzKCl7XG4gICAgICAgIGdsb2JhbEVtaXR0ZXIub24oJ2Nsb3NlV2VsbEluZm8nLGZ1bmN0aW9uKCl7XG4gICAgICAgICAgdGhpcy5zdGF0ZS5zaG93V2VsbEluZm8gPSBmYWxzZVxuICAgICAgICAgIHRoaXMucmVuZGVyKClcbiAgICAgICAgfS5iaW5kKHRoaXMpKVxuICAgICAgfVxuXG4gICAgICBzaG93RGV0YWlsKHdlbGxJZCl7XG5cbiAgICAgICAgdGhpcy5nZXRXZWxsSW5mbyh3ZWxsSWQpLnRoZW4odGhpcy5zaG93V2VsbEluZm8uYmluZCh0aGlzKSlcbiAgICAgIH1cblxuICAgICAgc2hvd1dlbGxJbmZvKGRhdGEpe1xuICAgICAgICB0aGlzLnN0YXRlLndlbGxJbmZvID0gZGF0YVxuICAgICAgICB0aGlzLnN0YXRlLnNob3dXZWxsSW5mbyA9IHRydWVcbiAgICAgICAgdGhpcy5yZW5kZXIoKVxuICAgICAgfVxuXG5cbn1cbmV4cG9ydCBkZWZhdWx0IEFwcGxpY2F0aW9uO1xuIiwiLy9pbXBvcnQge0NvbXBvbmVudH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IFdlbGxJbmZvIGZyb20gJy4vd2VsbEluZm8nO1xuXG5jbGFzcyBBcHBsaWNhdGlvblZpZXcgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIGNvbnN0cnVjdG9yKCl7XG4gICAgICBzdXBlcigpO1xuICAgICAgdGhpcy5zdGF0ZSA9IHt9O1xuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgIHdpbmRvd1tcImNvbnNvbGVcIl1bXCJsb2dcIl0oXCJra2trXCIsdGhpcy5zdGF0ZSk7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgIDxkaXYgaWQ9eydtYXAnfT5cbiAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICA8ZGl2IGlkPXsnZGF0YSd9PlxuICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXsnbG9nby13YXRlcnNvdXJjZXMnfT48L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17J2xvZ28tY3JhJ30+PC9kaXY+XG4gICAgICAgICAgICAgICAgPFdlbGxJbmZvIGlzVmlzaWJsZT17dGhpcy5zdGF0ZS5zaG93V2VsbEluZm99IGRhdGE9e3RoaXMuc3RhdGUud2VsbEluZm99Lz5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEFwcGxpY2F0aW9uVmlldztcbiIsImltcG9ydCBFdmVudEVtaXR0ZXIgZnJvbSAnZXZlbnRzJztcblxubGV0IGdsb2JhbEVtaXR0ZXIgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG5cbmV4cG9ydCBkZWZhdWx0IGdsb2JhbEVtaXR0ZXI7XG4iLCIvL2ltcG9ydCB7Q29tcG9uZW50fSBmcm9tICdyZWFjdCc7XG4vL2ltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgZ2xvYmFsRW1pdHRlciBmcm9tICcuL0VtaXR0ZXInO1xuXG5jbGFzcyBXZWxsSW5mbyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudHtcbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgc3VwZXIocHJvcHMpO1xuICAgICAgdGhpcy5wcm9wcyA9IHtcbiAgICAgICAgaXNWaXNpYmxlOiBmYWxzZSxcbiAgICAgICAgZGF0YTpudWxsXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5fb25DbG9zZUJ0bkNsaWNrID0gdGhpcy5fb25DbG9zZUJ0bkNsaWNrLmJpbmQodGhpcylcblxuICAgIH1cblxuICAgIF9nZXRSb3dzKGRhdGEpe1xuICAgICAgdmFyIHJvd3MgPSBbXVxuICAgICAgdmFyIHJvd1xuICAgICAgZm9yKHZhciBpIGluIGRhdGEpe1xuICAgICAgICByb3cgPSA8dHI+PHRoPntpfTwvdGg+PHRkPntkYXRhW2ldfTwvdGQ+PC90cj5cbiAgICAgICAgcm93cy5wdXNoKHJvdylcbiAgICAgIH1cbiAgICAgIHJldHVybiByb3dzXG5cbiAgICB9XG5cbiAgICBfb25DbG9zZUJ0bkNsaWNrKCl7XG4gICAgICB3aW5kb3dbXCJjb25zb2xlXCJdW1wibG9nXCJdKFwiY2xpY2tcIik7XG4gICAgICBnbG9iYWxFbWl0dGVyLmVtaXQoJ2Nsb3NlV2VsbEluZm8nKVxuICAgIH1cblxuICByZW5kZXIoKSB7XG4gICAgd2luZG93W1wiY29uc29sZVwiXVtcImxvZ1wiXSh0aGlzLnByb3BzLmlzVmlzaWJsZSlcbiAgICAgICAgICAgIHZhciByb3dzID0gW11cbiAgICAgICAgICAgICAgICBpZighdGhpcy5wcm9wcy5pc1Zpc2libGUpe1xuICAgICAgICAgICAgICAgICAgcmV0dXJuICg8ZGl2PjwvZGl2PilcbiAgICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9eyd3ZWxsSW5mbyd9IHN0eWxlPXt7ZGlzcGxheTogdGhpcy5wcm9wcy5pc1Zpc2libGUgPyAnYmxvY2snIDogJ25vbmUnfX0gPlxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT17J2Nsb3NlQnRuJ30gb25DbGljaz17dGhpcy5fb25DbG9zZUJ0bkNsaWNrfSA+XG4gICAgICAgICAgICAgICAgICAgICAgeydjbG9zZSd9XG4gICAgICAgICAgICAgICAgICAgICAgPGkgY2xhc3NOYW1lPXsnZmEgZmEtdGltZXMgZmEtMid9IHN0eWxlPXt7J3BhZGRpbmctbGVmdCc6JzRweCd9fSA+PC9pPlxuICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9eyd3ZWxsQ29udGVudCd9PlxuICAgICAgICAgICAgICAgICAgICAgIDx0YWJsZT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHRib2R5PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHt0aGlzLl9nZXRSb3dzKHRoaXMucHJvcHMuZGF0YSl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90Ym9keT5cbiAgICAgICAgICAgICAgICAgICAgICA8L3RhYmxlPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgV2VsbEluZm87XG5cblxuXG4vLyBjbGFzcyBXZWxsSW5mbyB7XG4vLyAgIGNvbnN0cnVjdG9yKHdlbGxJbmZvKXtcbi8vICAgICB0aGlzLmRhdGEgPSB3ZWxsSW5mb1xuLy8gICB9XG4vL1xuLy8gICBnZXRDb21wb25lbnQoKXtcbi8vICAgICByZXR1cm4gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuLy8gICAgICAgICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuLy8gICAgICAgICAgIHdpbmRvd1tcImNvbnNvbGVcIl1bXCJsb2dcIl0oXCJwcm9wc1wiLHRoaXMucHJvcHMuZGF0YSk7XG4vL1xuLy8gICAgICAgICAgIHZhciByb3dzID0gW11cbi8vICAgICAgICAgICAvL3Jvd3MucHVzaCggIDx0cj50aGlzLnByb3BzLkJvZFJlZ2lvbjwvdHI+IClcbi8vICAgICAgICAgICAgIHJldHVybiAoXG4vLyAgICAgICAgICAgICAgICAgPHRhYmxlPlxuLy8gICAgICAgICAgICAgICAgICAgICA8dGJvZHk+PHRkPidCb2RSZWdpb25DaXNsbyc8L3RkPjx0ZD57dGhpcy5wcm9wcy5kYXRhLkJvZFJlZ2lvbkNpc2xvfTwvdGQ+PC90Ym9keT5cbi8vICAgICAgICAgICAgICAgICA8L3RhYmxlPlxuLy8gICAgICAgICAgICAgKTtcbi8vICAgICAgICAgfVxuLy8gICAgIH0pO1xuLy8gICB9XG4vL1xuLy8gICByZW5kZXIoKXtcbi8vICAgICB2YXIgZGF0YSA9IGRvY3VtZW50LmJvZHkucXVlcnlTZWxlY3RvcignI2RhdGEnKVxuLy8gICAgIHZhciB3ZWxsSW5mb0NvbXBvbmVudCA9IHRoaXMuZ2V0Q29tcG9uZW50KClcbi8vXG4vLyAgICAgLy9SZWFjdC5jcmVhdGVFbGVtZW50KHdlbGxJbmZvQ29tcG9uZW50KSwgIGRhdGEpO1xuLy8gICAgIFJlYWN0LnJlbmRlcihcbi8vICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQod2VsbEluZm9Db21wb25lbnQsIHtkYXRhOnRoaXMuZGF0YX0pLCAgZGF0YSk7XG4vLyAgIH1cbi8vIH1cbi8vXG4vLyBtb2R1bGUuZXhwb3J0cyA9IFdlbGxJbmZvO1xuIl19
