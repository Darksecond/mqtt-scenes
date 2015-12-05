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

let mqtt    = require('mqtt');
let mqttClient  = mqtt.connect('mqtt://test.mosquitto.org');
let mqttRegex = new MqttRegex(mqttClient);

mqttRegex.subscribe('sensors/hue/00:17:88:01:10:39:27:ce-02-fc00/get/buttons/on', function(topic, message){
  console.log("on");
  mqttClient.publish('scenes/bedroom-on/set/trigger', '{"trigger": true}');
});

mqttRegex.subscribe('sensors/hue/00:17:88:01:10:39:27:ce-02-fc00/get/buttons/off', function(topic, message){
  console.log("off");
  mqttClient.publish('scenes/bedroom-off/set/trigger', '{"trigger": true}');
});

mqttRegex.subscribe('sensors/hue/00:17:88:01:10:39:27:ce-02-fc00/get/buttons/up', function(topic, message){
  console.log("up");
  mqttClient.publish('scenes/bedroom-bright/set/trigger', '{"trigger": true}');
});

mqttRegex.subscribe('sensors/hue/00:17:88:01:10:39:27:ce-02-fc00/get/buttons/down', function(topic, message){
  console.log("down");
  mqttClient.publish('scenes/bedroom-dark/set/trigger', '{"trigger": true}');
});
