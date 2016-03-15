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
  this.mouseOverTimeout = null;

  this.beforePopupHide = this.beforePopupHide.bind(this);
  this.onResultsMouseOver = this.onResultsMouseOver.bind(this);
}

Popup.prototype = {
  init: function() {
    this.el = this.win.document.getElementById('PopupAutoCompleteRichResult');
    this.el.addEventListener('popuphiding', this.beforePopupHide);
  },
  beforePopupHide: function(evt) {
    this.events.publish('before-popup-hide');
  },
  onResultsMouseOver: function(evt) {
    // This must be debounced. mouseover fires many times per second.
    if (this.mouseOverTimeout) {
      return;
    }

    // The mousemove code in autocomplete.xml uses a 30 millisecond timeout
    // to throttle mousemoves. Use a shorter timeout so that we can respond
    // more quickly than that code.
    this.events.publish('results-list-mouse-highlighted');
    this.mouseOverTimeout = this.win.setTimeout(() => {
      this.win.clearTimeout(this.mouseOverTimeout);
      this.mouseOverTimeout = null
    }, 15);
  }
};
