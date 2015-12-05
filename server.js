"use strict";

class Scene {
  constructor(json) {
    this.id = json.uniqueId;
    this.commands = json.commands;
  }

  trigger(mqtt, options) {
    for(let command of this.commands) {
      if(command.value instanceof Object) {
        mqttClient.publish(command.topic, JSON.stringify(command.value));
      } else {
        mqttClient.publish(command.topic, command.value);
      }
    }
  }
}

let util = require('./util');
let mqtt = require('mqtt');
let mqttClient  = mqtt.connect('mqtt://test.mosquitto.org');
let mqttRegex = new util.MqttRegex(mqttClient);
let fs = require('fs');

let scenes = {};

fs.readdir('scenes', function(err, files) {
  if(err)
    throw err;

  files.forEach(file => {
    if (file.match(/\.json$/)) {
      let scene = new Scene(require('./scenes/'+file));
      scenes[scene.id] = scene;
    }
  });
});

mqttRegex.subscribe('scenes/+/set/trigger', function(topic, message) {
  let json = JSON.parse(message.toString());
  let params = topic.match("scenes/(.*)/set/trigger");
  let sceneId = params[1];
  let scene = scenes[sceneId];
  if(scene) {
    console.log(sceneId);
    scene.trigger(mqttClient, json);
  }
});
