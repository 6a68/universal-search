/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const EXPORTED_SYMBOLS = ['Recommendation'];

// The Recommendation class represents the recommendation el inside the popup.

function Recommendation() {}

Recommendation.prototype = {
  el: null,

  render: function(win) {
    const doc = win.document;
    const popup = doc.getElementById('USearchPopupAutoCompleteRichResult');
    this.el = doc.getAnonymousElementByAttribute(popup, 'anonid', 'recommendation');
  },

  remove: function() {
    this.el = null;
  }
};
