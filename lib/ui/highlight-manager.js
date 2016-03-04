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
  this.stealHighlight = this.stealHighlight.bind(this);
}

HighlightManager.prototype = {
  init: function() {
    this.events.subscribe('navigational-key', this.adjustHighlight);
    this.events.subscribe('recommendation-shown', this.stealHighlight);

    this.popup = this.win.document.getElementById('PopupAutoCompleteRichResult');
  },
  destroy: function() {
    this.events.unsubscribe('recommendation-shown', this.stealHighlight);
    this.events.unsubscribe('navigational-key', this.adjustHighlight);
    delete this.popup;
    delete this.recommendationView;
    delete this.win;
  },
  stealHighlight: function() {
    // when the recommendation has just been shown, if the default list item is
    // highlighted, steal the highlight and set it on the recommendation
    if (this.popup.selectedIndex === 0) {
      this.recommendation.isHighlighted = true;
      this.popup.selectedIndex = -1;
    }
  },
  clearHighlight: function() {
    // TODO: should we also clear the highlight from the recommendation?
    const boxy = this.win.document.getAnonymousElementByAttribute(this.popup, 'anonid', 'richlistbox');
    const rows = boxy.querySelectorAll('.autocomplete-richlistitem');
    Array.prototype.forEach.call(rows, row => { row.selected = false; });
  },
  // Due to constraints in combining XBL and JS, we have to totally take over
  // highlight management for the list of results as well as the recommendation.
  // TODO: should we wait a turn before adjusting highlight?
  adjustHighlight: function(evt) {
    // let's try to do all our DOM access all at once here at the start
    const boxy = this.win.document.getAnonymousElementByAttribute(this.popup, 'anonid', 'richlistbox');
    const rows = boxy.querySelectorAll('.autocomplete-richlistitem');
    const listLength = rows.length;
    const selectedIndex = this.popup.selectedIndex;
    const recommendationVisible = this.recommendation.el && !this.recommendation.el.collapsed;
    const recommendationHighlighted = this.recommendation.el && this.recommendation.isHighlighted;

    // blow away the highlight. the DOM is now dirty and not trustworthy.
    this.clearHighlight();

    // the simplest way seems to be to start by checking what's currently
    // highlighted, and alter the state from there:

    // recommendation
    if (recommendationHighlighted) {
      this.recommendation.isHighlighted = false;
      this.popup.selectedIndex = (evt.forward) ? 0 : listLength - 1;

    // top of the list
    } else if (selectedIndex === 0) {
      if (evt.forward) {
        this.popup.selectedIndex = 1;
      } else if (recommendationVisible) {
        this.popup.selectedIndex = -1;
        this.recommendation.isHighlighted = true;
      } else {
        this.popup.selectedIndex = listLength - 1;
      }

    // bottom of the list
    } else if (selectedIndex === listLength - 1) {
      if (evt.forward && recommendationVisible) {
        this.popup.selectedIndex = -1;
        this.recommendation.isHighlighted = true;
      } else if (evt.forward && !recommendationVisible) {
        this.popup.selectedIndex = 0;
      } else {
        this.popup.selectedIndex = selectedIndex - 1;
      }

    // middle of the list
    } else {
      this.popup.selectedIndex = evt.forward ? selectedIndex + 1 : selectedIndex - 1;
    }
  }
};
