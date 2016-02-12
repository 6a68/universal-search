/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const EXPORTED_SYMBOLS = ['Popup'];

const XUL_NS = 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul';

function Popup() {}

Popup.prototype = {
  el: null,

  render: function(win) {
    const doc = win.document;
    const oldPopup = doc.getElementById('PopupAutoCompleteRichResult');

    // TODO: should we actually be creating an empty panel?
    // or should it be auto-inserted by XBL?
    this.el = doc.createElementNS(XUL_NS, 'panel');
    this.el.setAttribute('type', 'autocomplete-richlistbox');
    this.el.setAttribute('id', 'USearchPopupAutoCompleteRichResult');
    this.el.setAttribute('noautofocus', 'true');

    oldPopup.parentElement.insertBefore(this.el, oldPopup);
  },

  remove: function() {
    this.el = null;
  }
};
