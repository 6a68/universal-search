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
  this.mouseMoveTimeout = null;
  this.popupOpenObserver = null;

  this.afterPopupHide = this.afterPopupHide.bind(this);
  this.beforePopupShow = this.beforePopupShow.bind(this);
  this.onResultsMouseMove = this.onResultsMouseMove.bind(this);
  this.onClick = this.onClick.bind(this);
}

Popup.prototype = {
  init: function() {
    this.el = this.win.document.getElementById('PopupAutoCompleteRichResult');
    this.el.addEventListener('popuphidden', this.afterPopupHide);
    this.el.addEventListener('popupshown', this.beforePopupShow);
    this.el.addEventListener('click', this.onClick);
  },
  destroy: function() {
    this.el.removeEventListener('popuphidden', this.afterPopupHide);
    this.el.removeEventListener('popupshown', this.beforePopupShow);
    this.el.removeEventListener('click', this.onClick);

    this.win.clearTimeout(this.mouseMoveTimeout);

    delete this.el;
    delete this.win;
  },
  // TODO: this isn't getting called anymore, why does everythign still work?
  initOneOffSearchButtonShim: function() {
    // Trying to deactivate the one off search functionality, but hitting an error
    // due to a missing `this.oneOffSearchButtons.handleKeyPress` method.
    const searchButtons = this.win.document.getAnonymousElementByAttribute(this.el, 'anonid', 'one-off-search-buttons');
    searchButtons.handleKeyPress = function(e) { return true; };
  },
  afterPopupHide: function(evt) {
    this.events.publish('after-popup-hide');
  },
  beforePopupShow: function(evt) {
    if (this.el.getAttribute('maxrows') === -1) {
      this.el.setAttribute('maxrows', 10);
    }
    this.events.publish('before-popup-show');
  },
  onResultsMouseMove: function(evt) {
    // Throttle mousemove events, which fire rapidly as the user moves
    // the mouse.
    if (this.mouseMoveTimeout) {
      return;
    }
    this.mouseMoveTimeout = this.win.setTimeout(() => {
      this.win.clearTimeout(this.mouseMoveTimeout);
      this.mouseMoveTimeout = null;
    }, 15);

    this.events.publish('results-list-mouse-highlighted');
  },
  onClick: function(evt) {
    // If it's not a left click, bail.
    if (evt.button !== 0) {
      return;
    }
    const selectedIndex = this.el.selectedIndex;
    this.events.publish('before-click-navigate', {selectedIndex: selectedIndex});
  }
};
