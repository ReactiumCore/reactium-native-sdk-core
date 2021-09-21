"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

class EventTarget {
  constructor() {
    this.listeners = {};
  }

  addEventListener(type, callback) {
    if (!(type in this.listeners)) {
      this.listeners[type] = [];
    }

    this.listeners[type].push(callback);
  }

  removeEventListener(type, callback) {
    if (!(type in this.listeners)) {
      return;
    }

    var stack = this.listeners[type];

    for (var i = 0, l = stack.length; i < l; i++) {
      if (stack[i] === callback) {
        stack.splice(i, 1);
        return;
      }
    }
  }

  dispatchEvent(event) {
    if (!(event.type in this.listeners)) {
      return true;
    }

    event.target = this;
    var stack = this.listeners[event.type].slice();

    for (var i = 0, l = stack.length; i < l; i++) {
      stack[i].call(this, event);
    }

    return !event.defaultPrevented;
  }

}

var _default = EventTarget;
exports.default = _default;