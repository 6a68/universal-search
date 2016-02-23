/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// rec service
// - listens for 'printable-key' event
// - fires 'recommendation' event

const EXPORTED_SYMBOLS = ['RecommendationServer']; // eslint-disable-line no-unused-vars

function RecommendationServer(opts) {
  /*
  Class providing a connection to a recommendation server and a method for
  querying it. This class should be initialized once and exported as a
  singleton to modules that will use it.

  Usage:

  let recommendation = new RecommendationServer({
    // events is a lib/events.js instance
    events: events,
    server: 'http://universal-search.dev/',
    xhr: Cc['@mozilla.org/xmlextras/xmlhttprequest;1'],
    timeout: 1000
  });
  recommendation.init();

  */
  this.events = opts.events;
  this.server = opts.server;
  this.timeout = opts.timeout;
  this.xhr = opts.xhr;
}

RecommendationServer.prototype = {
  init: function() {
    this.request = this.xhr.createInstance();
    this.request.timeout = this.timeout;
    this.request.isInFlight = false;
  },
  destroy: function() {
    this.request.abort();
    this.request = null;
  },
  _url: function(query) {
    return `${this.server}/?q=${encodeURIComponent(query)}`;
  },
  search: function(query) {
    /*
    Method to query a recommendation server. Returns a promise that resolves to
    a recommendation or rejects to a reason that a recommendation is not
    available.

    Usage:

    recommendation.search('hello wor').then(data => {
      // Recommendation returned as `data` object literal.
    }, reason => {
      // No recommendation returned for `reason` string.
    });
    */
    const endpoint = this._url(query);
    const req = this.request;
    return new Promise((resolve, reject) => {
      try {
        if (req.isInFlight) {
          req.abort();
        }
        req.addEventListener('abort', evt => {
          req.isInFlight = false;
          reject(`Aborted request for "${query}".`);
        });
        req.addEventListener('error', evt => {
          req.isInFlight = false;
          reject(`Request for "${query}" errored.`);
        });
        req.addEventListener('load', evt => {
          req.isInFlight = false;
          let recommendation;
          try {
            recommendation = JSON.parse(req.responseText);
          } catch (err) {
            reject(`Unable to parse JSON for "${query}".`);
          }
          if (req.status === 200 && recommendation !== {}) {
            resolve(recommendation);
          }
          reject(`No recommendation available for "${query}".`);
        });
        req.open('GET', endpoint);
        req.isInFlight = true;
        req.send();
      } catch (err) {
        reject(`Uncaught exception in search for "${query}".`);
      }
    });
  }
};
