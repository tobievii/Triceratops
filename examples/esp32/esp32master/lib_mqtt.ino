#include <PubSubClient.h>
#include <WiFi.h>
#include <ArduinoJson.h>

WiFiClient espClient;
PubSubClient client(espClient);

int wifiStatusLast = 999;
int mqttStatus = 0;

// 0 = NOT CONNECTED
// 1 = CONNECTING
// 2 = FAILED ()
// 3 = SUCCESS

//const char* mqttServer = "prototype.dev.iotnxt.io";
const char* mqttServer = "192.168.1.145";
const int mqttPort = 1883;
String apikey = "4oxk9bg32xyncaxr6494z6jkqxb61tmf";

unsigned long lastupdate = 0;

int lib_mqtt_status_get() {
  int returnmqttStatus = mqttStatus;
  return returnmqttStatus;
}

void lib_mqtt_loop() {
  detectConnection();
  client.loop();  
  
  if (client.connected()) {
    mqttStatus = 3;lib_display_update();
    if (millis() - lastupdate > 15000) {
      lastupdate = millis();
      lib_mqtt_publishUpdate();
      //pub = true;
    }
  } else {
    
    if (lib_wifi_status_get() == 3) { //if wifi is on
      mqttStatus = 1;lib_display_update();
      //connectMqtt();  
      lib_mqtt_connectMQTT();  
    } else {
      mqttStatus = 0;lib_display_update();
    }
  }
  
}

void detectConnection() {
  if (lib_wifi_status_get() != wifiStatusLast) {
    if (lib_wifi_status_get() == 3) {
      wifiStatusLast = lib_wifi_status_get();
      lib_mqtt_connectMQTT();
    }
  }
}

void lib_mqtt_connectMQTT() {
  mqttStatus = 1;lib_display_update();
  client.setServer(mqttServer, mqttPort);
  client.setCallback(handleMessages);
  connectMqtt();
  String subscribeTopic = String(apikey+"|"+lib_state_deviceid());
  client.subscribe(subscribeTopic.c_str());
}

void connectMqtt() {
  Serial.print("reconnect");
  String clientId = "ESP8266Client-";
  clientId += String(random(0xffff), HEX);
  String mqttPassword = "key-"+apikey;
  //iotnxt = false;
  while (!client.connected()) {
    Serial.println("Connecting to MQTT...");
    if (client.connect("clientid", "api", mqttPassword.c_str() )) {
      mqttStatus = 3;lib_display_update();
      Serial.println("connected"); 
      lib_display_log("MQTT");
      lib_mqtt_publishUpdate();
      //iotnxt = true;
    } else {
      mqttStatus = 2; lib_display_update();// FAILED
      Serial.print("failed with state ");
      Serial.print(client.state());
      lib_display_log("MQTT failed.");

      /*
-4 : MQTT_CONNECTION_TIMEOUT - the server didn't respond within the keepalive time
-3 : MQTT_CONNECTION_LOST - the network connection was broken
-2 : MQTT_CONNECT_FAILED - the network connection failed
-1 : MQTT_DISCONNECTED - the client is disconnected cleanly
0 : MQTT_CONNECTED - the client is connected
1 : MQTT_CONNECT_BAD_PROTOCOL - the server doesn't support the requested version of MQTT
2 : MQTT_CONNECT_BAD_CLIENT_ID - the server rejected the client identifier
3 : MQTT_CONNECT_UNAVAILABLE - the server was unable to accept the connection
4 : MQTT_CONNECT_BAD_CREDENTIALS - the username/password were rejected
5 : MQTT_CONNECT_UNAUTHORIZED - the client was not authorized to connect
      */
      //delay(2000); 
    }
  }
}

void lib_mqtt_publishUpdate() {
  if (mqttStatus == 3) {
    Serial.print("publishing!\n");
    String msg = lib_state_packet(); //"{\"id\":\""+lib_state_deviceid()+"_"+lib_id_getuuid()+"\",\"data\":{\"version\":\""+lib_state_version()+"\",\"button\":false}}";
    client.publish(apikey.c_str(), msg.c_str());
  }  
}

void handleMessages(char* topic, byte* payload, unsigned int length) {
  //Serial.println(payload);
  Serial.println("MQTT recv");

  StaticJsonDocument<200> requestDoc;
  DeserializationError error = deserializeJson(requestDoc, payload);
  JsonObject request = requestDoc.as<JsonObject>();

  String jsontemp; 
  serializeJson(request,jsontemp);
  Serial.println("api call:");
  Serial.println(jsontemp);
  Serial.println("-----");

  JsonVariant display = request["data"]["display"];
  if (!display.isNull()) { 
    String displayVal = request["data"]["display"];
    Serial.println(displayVal);
    lib_display_log(displayVal); 
  }
  
  if (request["data"]["digitalWrite"]) {
    pinMode(request["data"]["pin"], OUTPUT);
    digitalWrite(request["data"]["pin"], request["data"]["level"]);
  }   
}