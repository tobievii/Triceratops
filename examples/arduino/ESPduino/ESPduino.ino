/*

  https://www.robotics.org.za/ESPDUINO?search=wifi
  http://www.elecrow.com/wiki/index.php?title=Elecrow_ESPduino_UNO%2BESP8266_Wifi_Board

*/

#include <SoftwareSerial.h>
#include <ArduinoJson.h>
 
#include <EEPROM.h>

#define DEBUG true
 
int version = 10;

SoftwareSerial esp8266(7,8);
byte devuuid[8];

String ssid     = "rouanwifi";
String password = "rouanpass1234";
String host = "192.168.1.145";
String port = "12009";

String ipaddress = ""; //devices ipaddress on the network if applicable.
String macaddress = ""; //devie macaddress

unsigned long lastIdlePacket = 0;
String wifiResponseBuffer = "";

bool wificonnected = false;

// the setup function runs once when you press reset or power the board
void setup() {
  randomSeed(analogRead(0));
  uuid();
  // initialize digital pin LED_BUILTIN as an output.
  pinMode(LED_BUILTIN, OUTPUT);
  Serial.begin(115200);
  esp8266.begin(9600);

  digitalWrite(LED_BUILTIN, 0);

  
  
  // //sendData("AT+RST\r\n",2000,DEBUG);        // reset module
  // sendData("AT+CWMODE=1\r\n",1000,DEBUG);   // configure as access point
  // //sendData("AT+RST\r\n",2000,DEBUG);        // reset module
  
  // // sendData("AT+CWLAP\r\n",1000,DEBUG);      // wifi list AP
  
  // sendData("AT+CIPMUX=0\r\n",1000,DEBUG);      // single connection

  // sendData("AT+CWJAP=\""+ssid+"\",\""+password+"\"\r\n",2000,DEBUG);      // wifi JOIN AP  
  // sendData("AT+CIFSR\r\n",2000,DEBUG); // get ip address

  // //send TCP data

  // // sendData("AT+CIPSTART=\"TCP\",\""+host+"\","+port+"\r\n", 2000, DEBUG);
  // // sendData("AT+CIPSEND=5\r\n", 2000, DEBUG);
  // // sendData("hello\r\n", 2000, DEBUG);
  // // sendData("AT+CIPCLOSE\r\n", 2000, DEBUG);
  // sendData("AT+CIPSTART=\"TCP\",\""+host+"\","+port+"\r\n", 2000, DEBUG);
}

// the loop function runs over and over again forever
void loop() {
  digitalWrite(LED_BUILTIN, wificonnected);
  handleWifi();
  idle();
}


void idle() {
    if (millis() - lastIdlePacket > 5000) {
    //sendData("AT+CIFSR\r\n",2000,DEBUG); 
    //Serial
    StaticJsonDocument<256> doc;
    JsonObject root = doc.to<JsonObject>();
    root["id"] = getUuidString();
    root["up"] = millis();    
    root["ver"] = version;
    root["wificonnected"] = wificonnected;    
    root["ip"] = ipaddress;
    root["mac"] = macaddress;
    String output;
    serializeJson(doc, output);
    Serial.println(output);

    wifiSendTCP(output, host, port);

    lastIdlePacket = millis();
  }  
}


String sendData(String command, const int timeout, boolean debug) {
    String response = "";
    esp8266.print(command); 

    long int time = millis();
    while( (time+timeout) > millis()) {
      handleWifi();
    }
    
    //if(debug) { Serial.print(response); }    
    return response;
}



void handleWifi() {
  if(esp8266.available()) {
    while(esp8266.available()) {
      char c = esp8266.read(); 
      wifiResponseBuffer += c;

      if (c == '\r') {
        
        //Serial.println("-- handlewifi --");
        //Serial.print(wifiResponseBuffer);
        wifiResponseBuffer.trim();
        if (wifiResponseBuffer == "WIFI CONNECTED") {
          wificonnected = true;
          //Serial.println("!! success wifi connected whoo");
          delay(1000);
          sendData("AT+CIFSR\r\n",2000,DEBUG); 
        }

        if (wifiResponseBuffer == "link is not valid") {
          sendData("AT+CIPSTART=\"TCP\",\""+host+"\","+port+"\r\n", 2000, DEBUG);
        }

        if (wifiResponseBuffer.startsWith("+CIFSR:STAIP",0)) {
          int indexA = wifiResponseBuffer.indexOf('"');
          int indexB = wifiResponseBuffer.lastIndexOf('"');
          ipaddress = wifiResponseBuffer.substring(indexA+1,indexB);
        }

        if (wifiResponseBuffer.startsWith("+CIFSR:STAMAC",0)) {
          //Serial.println(wifiResponseBuffer);
          //Serial.println("got mac address whoo!");
          int indexA = wifiResponseBuffer.indexOf('"');
          int indexB = wifiResponseBuffer.lastIndexOf('"');
          macaddress = wifiResponseBuffer.substring(indexA+1,indexB);
        }

        //Serial.println("----------------");
        wifiResponseBuffer = "";
      }
      //Serial.write(c);
    } 
  }
}



void uuid() {
  bool uuidset = 0;
  String uuidHex; // = String(uuid);
  for (int a = 0; a < 8; a++) {
    devuuid[a] = EEPROM[a];    
    Serial.println(devuuid[a]);
    if (devuuid[a] != 255) uuidset = 1;
  }
  
  //String myString = (char*)devuuid;
  //Serial.println(myString);

  if (uuidset == false) {
    //Serial.println("generating uuid");
    genuuid();
  } else {
    //Serial.println("uuid already set");
  }
  
}

void genuuid() {
  // this should only ever be run once per device
  randomSeed(analogRead(0));
  for (int a = 0; a < 8; a++) {
    EEPROM.write(a, random(256));
  }
  uuid();
}

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


void eepromDump() {
  int a = 0;
  int value;
  bool done = 0;

  while (!done) {
    value = EEPROM.read(a);
    Serial.print(a);
    Serial.print("\t");
    Serial.print(value);
    Serial.println();

    a = a + 1;

    if (a == 8) done = 1;
  }
}

String getUuidString() {
    String output = "";        
    for (int a = 0; a< 8; a++) {
        String byteHex = String(devuuid[a], HEX);
        if (byteHex.length() == 1) { byteHex = String("0"+byteHex);}
        output = String(output+byteHex);
    }
    return output;
}



void wifiSendTCP(String inputstring, String host, String port) {
  //sendData("AT+CIPSTART=\"TCP\",\""+host+"\","+port+"\r\n", 2000, DEBUG);
  sendData("AT+CIPSEND="+String(inputstring.length())+"\r\n", 50, DEBUG);
  sendData(inputstring+"\r\n", 50, DEBUG);
  //sendData("AT+CIPCLOSE\r\n", 2000, DEBUG);
}