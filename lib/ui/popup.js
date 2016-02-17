/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// NOTE: this is a bit of a no-op class for right now, but we'll use it to
// handle key and click events very soon.

const EXPORTED_SYMBOLS = ['Popup'];

const XUL_NS = 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul';

function Popup() {}

Popup.prototype = {
  el: null,

  render: function(win) {
    const doc = win.document;
    this.el = doc.getElementById('PopupAutoCompleteRichResult');
    return this;
  },

  remove: function() {
    this.el = null;
  }
};
