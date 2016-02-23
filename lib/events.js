// nsIObserver is unfortunately Gecko-global, so topics fired on one window
// could be visible to all other windows. instead, use a trivial, tiny pubsub
// class per window.

const EXPORTED_SYMBOLS = ['Events'];

function Events() {
  this.topics = {};
}

Events.prototype = {
  subscribe: function(topic, cb) {
    if (!(topic in this.topics)) {
      this.topics[topic] = [];
    }
    this.topics[topic].push(cb);
  },
  unsubscribe: function(topic, cb) {
    if (!(topic in this.topics)) {
      return;
    }

    // remove any matching subscribers
    this.topics[topic].forEach((callback, i) => {
      if (callback === cb) {
        this.topics[topic].splice(i, 1):
      }
    });

    // if the topic's empty, remove it
    if (!this.topics[topic].length) {
      delete this.topics[topic];
    }
  },
  publish: function(topic, data) {
    if (!(topic in this.topics)) {
      return;
    }
    this.topics[topic].forEach(cb => {
      cb(data);
    });
  }
};
