/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const {utils: Cu} = Components;

Cu.import('resource://gre/modules/XPCOMUtils.jsm');
XPCOMUtils.defineLazyModuleGetter(this, 'console',
  'resource://gre/modules/Console.jsm');
XPCOMUtils.defineLazyModuleGetter(this, 'WindowWatcher',
  'chrome://usearch-lib/content/window-watcher.js');

const EXPORTED_SYMBOLS = ['UniversalSearch'];

function Search() {}

Search.prototype = {
  load: function() {
    WindowWatcher.start(this.loadIntoWindow, this.unloadFromWindow, this.onError, this);
  },

  unload: function() {
    WindowWatcher.stop();
  },

  loadIntoWindow: function(win) {
    // set up the app global
    win.US = win.US || {};

    this._loadStyleSheets(win);
    this._loadScripts(win);
    this._startApp(win);
  },

  unloadFromWindow: function(win) {
    this._stopApp(win);
    this._unloadScripts(win);
    this._unloadStyleSheets(win);

    // tear down the app global
    delete win.US;
  },

  _loadStyleSheets: function(win) {
    const doc = win.document;
    const docEl = doc.documentElement;

    const stylesheet = doc.createElementNS('http://www.w3.org/1999/xhtml', 'h:link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = 'chrome://usearch/content/skin/style.css';
    stylesheet.type = 'text/css';
    stylesheet.id = 'UniversalSearchStyleSheet';
    stylesheet.style.display = 'none';

    docEl.appendChild(stylesheet);
  },

  _unloadStyleSheets: function(win) {
    const docEl = win.document.documentElement;
    const stylesheet = docEl.getElementById('UniversalSearchStyleSheet');

    docEl.removeChild(stylesheet);
  },

  _loadScripts: function(win) {
    // Note that we load the scripts into the app namespace, to ease cleanup.
    // Each module's EXPORTED_SYMBOLS will be properties on win.US.
    // Example: Cu.import('chrome://usearch-lib/content/something-in-lib.js', win.US);
  },

  _unloadScripts: function(win) {
    // Unload scripts from the namespace. Not clear on whether this is necessary
    // if we just delete win.US.
    // Example: Cu.unload('chrome://usearch-lib/content/something-in-lib.js', win.US);
  },

  _startApp: function(win) {
    // Initialize libraries and attach to the DOM here
  },

  _stopApp: function(win) {
    // Detach DOM listeners / elements, unset window pointers
  },

  onError: function(msg) {
    console.error(msg);
  }
};

// Expose a singleton, since we only need one of these for the add-on.
const UniversalSearch = new Search();
