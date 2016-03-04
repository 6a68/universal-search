/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const EXPORTED_SYMBOLS = ['HighlightManager'];

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
    this.events.subscribe('navigational-key', this.adjustHighlight);
    this.events.subscribe('recommendation-shown', this.adjustHighlight);

    this.popup = this.win.document.getElementById('PopupAutoCompleteRichResult');

    // TODO: maybe we can hook into the XBL mousemove handler and steal focus
    // that way instead of manually setting a mousemove listener
    this.popup.addEventListener('mousemove', this.adjustHighlight);
  },
  destroy: function() {
    this.popup.removeEventListener('mousemove', this.adjustHighlight);
    this.events.unsubscribe('recommendation-shown', this.adjustHighlight);
    this.events.unsubscribe('navigational-key', this.adjustHighlight);
    delete this.popup;
    delete this.recommendationView;
    delete this.win;
  },
  adjustHighlight: function(evt) {
    // TODO: what do we do if the highlight is in two places at once?
    let gURLBar = this.win.gURLBar;
    const listLength = gURLBar.popup.richlistbox.childNodes.length;
    const selectedIndex = gURLBar.popup.selectedIndex;

    // If the recommendation is shown,
    if (this.recommendation.el && !this.recommendation.el.collapsed) {
      // 1. If the recommendation isn't highlighted, and neither is the list,
      // then we're moving focus from urlbar to recommendation, for
      // down keys, or moving the highlight to the bottom list item, for up keys.
      if (!this.recommendation.isHighlighted && selectedIndex === -1) {
        if (evt.down) {
          this.recommendation.isHighlighted = true;
        } else {
          gURLBar.popup.selectedIndex = listLength;
        }

      // 2. If the recommendation is highlighted,
      //   down keys move the highlight to the list,
      //   up keys wrap around
      } else if (this.recommendation.isHighlighted) {
        if (evt.down) {
          this.recommendation.isHighlighted = false;
          gURLBar.popup.selectedIndex = 0;
        } else {
          this.recommendation.isHighlighted = false;
          gURLBar.popup.selectedIndex = listLength;
        }

      // 3. If the first item in the list is highlighted,
      //   up keys move the highlight to the recommendation,
      //   down keys move the highlight into the popup.
      } else if (selectedIndex === 0) {
        if (evt.down) {
          gURLBar.popup.selectedIndex = 1;
        } else {
          gURLBar.popup.selectedIndex = -1; // TODO: won't this close the popup?
          this.recommendation.isHighlighted = true;
        }

      // 4. If the last item in the list is highlighted,
      //   down keys move the highlight back to the recommendation,
      //   up keys move the highlight to the next higher item
      } else if (selectedIndex === listLength) {
        if (evt.down) {
          gURLBar.popup.selectedIndex = -1;
          this.recommendation.isHighlighted = true;
        } else {
          gURLBar.popup.selectedIndex -= 1;
        }

      // 5. If any other item in the list is highlighted,
      //   just move the selectedIndex by one.
      } else {
        if (evt.down) {
          gURLBar.popup.selectedIndex += 1;
        } else {
          gURLBar.popup.selectedIndex -= 1;
        }
      }
    }
  }
};
