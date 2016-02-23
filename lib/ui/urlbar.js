/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// urlbar:
// - DOM listeners: intercept keys
//   - note, for many keys we'll just pass through to existing XBL handlers
// - fires 'navigational-key' and 'printable-key' events
// - public method: navigate(), sets urlbar state + navs to URL

function Urlbar(opts) {
  this.win = opts.win;
  this.events = opts.events;

  this.onKeyPress = this.onKeyPress.bind(this);
}

Urlbar.prototype = {
  init: function() {
    // grab pointer to urlbar
    this.el = this.win.gURLBar;
    // TODO: how do we make sure XBL calls this function? how do we call the parent
    //       XBL function if we can't handle anything? maybe return false/true and use that?
    this.onKeyPress = this.onKeyPress.bind(this);
    // need a key handler method
    // fire 'navigational-key' and 'printable-key' events under certain circumstances
    // if we can't handle a key, just don't e.preventDefault(), let XBL do it.
    //   - might need to return true instead/in addition? we'll figure it out.
  },
  destroy: function() {
    // remove urlbar pointer
    this.el = null;
    // 
  },
  onKeyPress: function(evt) {
    // check the key type, etc
    // if it's a printable key, fire 'printable-key'
    // if it's a navigational key, fire 'navigational-key'
    // if we don't know what to do, return true or false
  },
  navigate: function(url) {
    // set some urlbar state + navigate
  }
};
