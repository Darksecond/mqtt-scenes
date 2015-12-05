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

let setLights = function(newState) {
  if(newState) {
    mqttClient.publish('scenes/bedroom-on/set/trigger', '{"trigger": true}');
  } else {
    mqttClient.publish('scenes/bedroom-off/set/trigger', '{"trigger": true}');
  }
};

let setLightsBrightness = function(brightness) {
  let newState = JSON.stringify({
    on: true,
    brightness: brightness
  });

  mqttClient.publish('lights/hue/00:17:88:01:00:f5:b3:6c-0b/set/state', String(newState)); // Middle
  mqttClient.publish('lights/hue/00:17:88:01:00:dd:1b:73-0b/set/state', String(newState)); // Window
  mqttClient.publish('lights/hue/00:17:88:01:00:10:6e:17-0b/set/state', String(newState)); // TV
  mqttClient.publish('lights/hue/00:17:88:01:00:10:6e:15-0b/set/state', String(newState)); // Bed
};
