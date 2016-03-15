/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const EXPORTED_SYMBOLS = ['Popup'];

function Popup(opts) {
  /*
  The Popup module abstracts the XUL popup. Currently only used to listen for
  events emitted by the popup.
  */
  this.win = opts.win;
  this.events = opts.events;
  this.mouseEnterTimeout = null;

  this.beforePopupHide = this.beforePopupHide.bind(this);
  this.onResultsMouseEnter = this.onResultsMouseEnter.bind(this);
}

Popup.prototype = {
  init: function() {
    this.el = this.win.document.getElementById('PopupAutoCompleteRichResult');
    this.el.addEventListener('popuphiding', this.beforePopupHide);
  },
  beforePopupHide: function(evt) {
    this.events.publish('before-popup-hide');
  },
  onResultsMouseEnter: function(evt) {
    // TODO: do we need to throttle this?
    if (this.mouseEnterTimeout) { return; }

    // The mousemove code in autocomplete.xml uses a 30 millisecond timeout
    // to throttle mousemoves. Use a shorter timeout so that we can respond
    // more quickly than that code.
    this.mouseEnterTimeout = this.win.setTimeout(() => {
      this.win.console.log('mouseenter timeout firing');
      this.events.publish('results-list-mouse-highlighted');
      this.win.clearTimeout(this.mouseEnterTimeout);
    }, 15);
  }
};
