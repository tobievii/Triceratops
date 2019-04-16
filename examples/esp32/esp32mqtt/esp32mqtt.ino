#include <WiFi.h>
#include <PubSubClient.h>
 
const char* ssid = "wifissid";
const char* password = "wifipass";

//const char* mqttServer = "prototype.iotnxt.io";
const char* mqttServer = "10.0.4.27";

const int mqttPort = 1883;
const char* mqttUser = "api";
const char* mqttPassword = "key-glp5xm1jpwhtwdnsykv5nv4hhwrp1xy9";
 
WiFiClient espClient;
PubSubClient client(espClient);
 
void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
  digitalWrite(LED_BUILTIN, LOW);
  

  Serial.begin(115200);
  WiFi.begin(ssid, password);
 
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.println("Connecting to WiFi..");
  }
 
  Serial.println("Connected to the WiFi network"); 
  client.setServer(mqttServer, mqttPort);
  client.setCallback(handleMessages);
 
  while (!client.connected()) {
    Serial.println("Connecting to MQTT...");
 
    if (client.connect("clientid", mqttUser, mqttPassword )) {
      digitalWrite(LED_BUILTIN, HIGH); 
      Serial.println("connected"); 
    } else {
 
      Serial.print("failed with state ");
      Serial.print(client.state());
      delay(2000);
 
    }
  }
 
  Serial.print("publishing!");
  //client.publish("glp5xm1jpwhtwdnsykv5nv4hhwrp1xy9", "{\"id\":\"esp32\",\"data\":{\"temperature\":34,\"doorOpen\":false,\"gps\":{\"lat\":25.123,\"lon\":28.125}}}");
  //client.publish("glp5xm1jpwhtwdnsykv5nv4hhwrp1xy9", "{\"id\":\"esp32\",\"data\":{\"temperature\":34}}");
  client.subscribe("glp5xm1jpwhtwdnsykv5nv4hhwrp1xy9");
  
}
 
void loop() {
  client.loop();
}


// MQTT
void handleMessages(char* topic, byte* payload, unsigned int length) {
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("] ");
  for (int i = 0; i < length; i++) {
    Serial.print((char)payload[i]);
  }
  Serial.println();

}