#include <ArduinoJson.h>

#include <ESP8266WiFi.h>
#include <PubSubClient.h>

// test commit

const char* ssid = "IOT.NXT.DEV";
const char* password = "10TnxtD3v";
const char* mqttServer = "172.16.3.28";
const int mqttPort = 1883;
String mqttUser = "api";
String apikey = "4vpw5gtrw4p3mdunmxpbm3qp76n37q4g";
String deviceid = "esp8266";

WiFiClient espClient;
PubSubClient client(espClient);
 
unsigned long lastupdate = 0;

bool led = true;

// MQTT
void handleMessages(char* topic, byte* payload, unsigned int length) {
  Serial.print("Message");
  Serial.print(topic);
  Serial.print("] ");

  StaticJsonDocument<200> doc;
  DeserializationError error = deserializeJson(doc, payload);

  
  // TODO
  // led = doc["led"];

  for (int i = 0; i < length; i++) {
    Serial.print((char)payload[i]);
  }
  Serial.println();
}

void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
  digitalWrite(LED_BUILTIN, LOW); // HIGH = OFF on esp8266
  
  randomSeed(micros());

  Serial.begin(115200);
  WiFi.begin(ssid, password);
 
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.println("Connecting to WiFi..");
  }
 
  Serial.println("Connected to the WiFi network"); 
  client.setServer(mqttServer, mqttPort);
  client.setCallback(handleMessages);
  
  connectMqtt();
 
  //client.publish("glp5xm1jpwhtwdnsykv5nv4hhwrp1xy9", "{\"id\":\"esp32\",\"data\":{\"temperature\":34}}");
  client.subscribe(apikey.c_str());
}
 
void loop() {

  digitalWrite(LED_BUILTIN, led);

  client.loop();

  if (!client.connected()) {
    connectMqtt();
  }

  if (millis() - lastupdate > 5000) {
    lastupdate = millis();
    publishUpdate();
  }
}

void publishUpdate() {
  Serial.print("publishing!\n");
  String msg = "{\"id\":\""+deviceid+"\",\"data\":{\"led\":"+led+"}}";
  client.publish("4vpw5gtrw4p3mdunmxpbm3qp76n37q4g", msg.c_str());
}

void connectMqtt() {
  Serial.print("reconnect");
  String clientId = "ESP8266Client-";
  clientId += String(random(0xffff), HEX);
  String mqttPassword = "key-"+apikey;

  while (!client.connected()) {
    Serial.println("Connecting to MQTT...");
    if (client.connect("clientid", mqttUser.c_str(), mqttPassword.c_str() )) {
      Serial.println("connected"); 
    } else {
      Serial.print("failed with state ");
      Serial.print(client.state());
      delay(2000); 
    }
  }
}