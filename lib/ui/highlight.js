/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// highlight manager
// - listens for 'navigational-key' event
// - listens for recommendation 'shown' event
// - listens for mousemove events on popup?

function HighlightManager(opts) {
  this.win = opts.win;
  this.events = opts.events;

  // this is a recommendation view, because the highlight
  // class manages passing focus between it and the list of results
  this.recommendation = opts.recommendation;

  this.adjustHighlight = this.adjustHighlight.bind(this);
}

HighlightManager.prototype = {
  init: function() {
    // listen for 'urlbar::navigational-key' event
    this.events.subscribe('navigational-key', this.adjustHighlight);
    // listen for 'recommendation::shown' event
    this.events.subscribe('shown', this.adjustHighlight);
  },
  destroy: function() {
    this.win = null;
    this.events.unsubscribe('shown', this.adjustHighlight);
    this.events.unsubscribe('navigational-key', this.adjustHighlight);

  },
  adjustHighlight: function(evt) {
    // if the recommendation isn't shown, just let the popup manage its focus.
    if (this.recommendation.el.collapsed) {
      return;
    }
    // check if the recommendation is shown + highlighted
    // check the selectedIndex of the popup
    // if it's a down key, move the focus downward, unless the selectedIndex
    //   is at the bottom of the node, in which case, wrap focus around.
    // if it's an up key, move the focus upward, unless the
  }
};
