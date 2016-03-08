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
  this.stealHighlightTimeout = null;

  this.adjustHighlight = this.adjustHighlight.bind(this);
  this.stealHighlight = this.stealHighlight.bind(this);
  this.mutationHandler = this.mutationHandler.bind(this);
}

HighlightManager.prototype = {
  init: function() {
    this.events.subscribe('navigational-key', this.adjustHighlight);
    this.events.subscribe('recommendation-shown', this.stealHighlight);

    this.popup = this.win.document.getElementById('PopupAutoCompleteRichResult');

    // The existing code doesn't insert all the results at once; instead, rows
    // are inserted after repeated timeouts, to keep the urlbar responsive (see
    // _appendResultTimeout in autocomplete.xml). Each time a row is appended,
    // the existing code reapplies the highlight to an item in the results
    // list. So, as that happens, we want to continually steal the focus back.
    // The simplest way to do this, it turns out, is with a MutationObserver.
    // We listen for changes to the 'url' attribute on the rows inside the
    // richlistbox. This ensures changes are detected, even when rows are
    // reused, rather than created (see _adjustAcItem in autocomplete.xml).
    // TODO: To avoid hurting performance, we may throttle our focus stealer.
    this.resultsObserver = new this.win.MutationObserver(this.mutationHandler);
    const results = this.win.document.getAnonymousElementByAttribute(this.popup, 'anonid', 'richlistbox');
    if (!results) { this.win.console.error('unable to attach mutation observer, because popup doesn\'t exist'); }
    // TODO: what if results doesn't exist when we first do this! hahaha, this is nuts.
    const resultsObserverConfig = {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['url']
    };
    this.resultsObserver.observe(results, resultsObserverConfig);
  },
  destroy: function() {
    this.resultsObserver.disconnect();
    this.events.unsubscribe('recommendation-shown', this.stealHighlight);
    this.events.unsubscribe('navigational-key', this.adjustHighlight);
    delete this.popup;
    delete this.recommendationView;
    delete this.win;
  },
  mutationHandler: function() {
    this.win.console.log('mutationHandler fired');
    this.stealHighlight();
  },
  stealHighlight: function() {
    // when the recommendation has just been shown, if the default list item is
    // highlighted, steal the highlight and set it on the recommendation
    // TODO: just for the moment, always stealing the highlight
    this.recommendation.isHighlighted = true;
    this.popup.selectedIndex = -1;
    // try debouncing, to avoid XUL getting the upper hand ;-)
    // if this seems janky still, try throttling instead to 50 msec delay
    this.win.clearTimeout(this.stealHighlightTimeout);
    this.stealHighlightTimeout = this.win.setTimeout(() => {
      this.win.console.log('stealHighlight, delayed call firing');
      this.recommendation.isHighlighted = true;
      this.popup.selectedIndex = -1;
    }, 500);
  },
  clearHighlight: function() {
    // TODO: should we also clear the highlight from the recommendation?
    const boxy = this.win.document.getAnonymousElementByAttribute(this.popup, 'anonid', 'richlistbox');
    const rows = boxy.getElementsByClassName('.autocomplete-richlistitem');
    Array.prototype.forEach.call(rows, row => { row.selected = false; });
  },
  // Due to constraints in combining XBL and JS, we have to totally take over
  // highlight management for the list of results as well as the recommendation.
  // TODO: should we wait a turn before adjusting highlight?
  adjustHighlight: function(evt) {
    // let's try to do all our DOM access all at once here at the start
    const boxy = this.win.document.getAnonymousElementByAttribute(this.popup, 'anonid', 'richlistbox');
    const rows = boxy.getElementsByClassName('.autocomplete-richlistitem');
    // rows is a live collection, and the XBL code inserts elements over
    // several turns, so we'll use listLength for calculating the past
    // state of the world, but when we want to assign focus to the last
    // item in the list, we'll use the live collection. I'm not sure this
    // logic is sound, but we'll see if it works.
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
      this.popup.selectedIndex = (evt.forward) ? 0 : rows.length - 1;

    // top of the list
    } else if (selectedIndex === 0) {
      if (evt.forward) {
        this.popup.selectedIndex = 1;
      } else if (recommendationVisible) {
        this.popup.selectedIndex = -1;
        this.recommendation.isHighlighted = true;
      } else {
        this.popup.selectedIndex = rows.length - 1;
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
