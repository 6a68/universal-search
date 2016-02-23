/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// hbox
// - DOM listeners: clicks
// - listens for 'recommendation' and 'enter-key' events
// - fires 'shown' event when rendered
// - public methods: show(), hide(), render()
// - public state: isHighlighted (getter/setter maps to 'highlight' class)
//   - we could also use focus() and blur() methods, though it's not true focus.

function Recommendation(opts) {
  this.win = opts.win;
  this.events = opts.events;
  this.urlbar = opts.urlbar;

  // least awful way of binding `this`
  this.navigate = this.navigate.bind(this);
  this.show = this.show.bind(this);
}

const recommendation = {
  init: function() {
    // get a pointer to the hbox
    this.el = this.win.getElementById('universal-search-recommendation');

    // listen for clicks on hbox
    this.el.addEventListener('click', this.navigate);

    // attach listener for 'recommendation', 'enter-key' events
    this.events.subscribe('recommendation', this.show);
    this.events.subscribe('enter-key', this.navigate);
  },
  destroy: function() {
    this.el.removeEventListener('click', this.navigate);
    this.events.unsubscribe('recommendation', this.show);
    this.events.unsubscribe('enter-key', this.navigate);
    // unset hbox, window pointers
    this.el = null;
    this.win = null;
  },
  show: function(data) {
    // TODO: use a template or insert data into nodes
    this.el.textContent = data;
    // keep track of the URL, so that clicks will go to the right spot
    this.url = data.url;
    // show the hbox
    this.el.collapsed = false;
    // fire 'shown' event
    this.events.publish('shown');
  },
  hide: function() {
    // collapse the node
    this.el.collapsed = true;
  },
  navigate: function(evt) {
    // if it's a click, we'll have an evt. make sure it's not a right click.
    // else, we'll just have the data from the 'enter-key' event (or null?)

    if (evt) {
      // if it's not a right click, cancel the event and navigate
      evt.preventDefault();
    }

    // ping the urlbar to navigate.
    // TODO: why not fire an event?
    this.urlbar.navigate(this.url);
  }
};
