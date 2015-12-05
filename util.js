"use strict";

class MqttRegex {
  constructor(mqtt) {
    this.mqtt = mqtt;
    this.callbacks = {};

    this.mqtt.on('message', this._message.bind(this));
  }

  _message(topic, message) {
    for(let regex in this.callbacks) {
      if(topic.match(regex)) {
        this.callbacks[regex](topic, message);
      }
    }
  }

  subscribe(topic, callback) {
    let regex = topic.replace("+", "(.*)");
    this.callbacks[regex] = callback;

    this.mqtt.subscribe(topic);
  }
}

module.exports = {
	MqttRegex: MqttRegex
};
