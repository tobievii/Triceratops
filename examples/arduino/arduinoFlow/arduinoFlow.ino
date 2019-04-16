#include <ArduinoJson.h>

const byte ledPin = 13;
const byte interruptPin = A0;
volatile byte state = LOW;

volatile unsigned long flow = 0;
long interval = 1000; 
long previousMillis = 0; 
byte devuuid[8];

void setup() {
  SerialUSB.begin(115200);
  pinMode(ledPin, OUTPUT);
  pinMode(interruptPin, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(interruptPin), blink, CHANGE);
}

void loop() {
  digitalWrite(ledPin, state);

  unsigned long currentMillis = millis();
  unsigned long flownow = flow;
  if(currentMillis - previousMillis >= interval) {
    // save the last time you blinked the LED 
    previousMillis = currentMillis;   



    StaticJsonDocument<256> doc;
    JsonObject root = doc.to<JsonObject>();
    root["id"] = "flowMeter"; //getUuidString();
    JsonObject data = root.createNestedObject("data");
    data["up"] = millis();
    data["flow"] = flownow; //checkBat();
    //data["ver"] = 1;//version;
    //data["desc"] = "test"; //description;
    //root["doorState"] = doorState;
    //root["doorLocked"] = doorLocked;
    
    String output;
    serializeJson(doc, output);
    SerialUSB.println(output); //SERIAL    
    flow -= flownow;

  }
}

void blink() {
  state = !state;
  flow++;
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


char inData[200]; // Allocate some space for the string
char inChar=-1; // Where to store the character read
byte inputStringIndex = 0; // Index into array; where to store the character



void handleSerial() {
  while (Serial.available() > 0) {
    inChar = Serial.read(); 
    inData[inputStringIndex] = inChar; 
    inputStringIndex++;
    if (inChar == '\n') {
      String inSerialString = inData;
      //request
      StaticJsonDocument<200> requestDoc;
      DeserializationError error = deserializeJson(requestDoc, inData);
      JsonObject request = requestDoc.as<JsonObject>();

      //response
      StaticJsonDocument<200> responseDoc;
      JsonObject response = responseDoc.to<JsonObject>();

      // Test if parsing succeeds.
      if (error) {
        Serial.print(F("deserializeJson() failed: "));
        Serial.println(error.c_str());
        return;
      }

      /* = = = = */


      if (request.containsKey("id")) {
        String reqid = request["id"];
        if (reqid == getUuidString()) {
          //for us
          if (request.containsKey("doorLock")) {
            //doorLocked = request["doorLock"];
          }

        } else {
          // transmit with random delay
          //delay(100 + random(0,300));
          //LoraTX(inSerialString);
        }
      }

      /* = = = = */

      if (request.containsKey("getBatteryVolts")) {
        //checkBat();
        int getBatteryVolts = request["getBatteryVolts"];
        if (getBatteryVolts == 1) {
          float batvolt = 0;
          
          response["batteryVolts"] = batvolt;
        }
      }

      /* = = = = */

      if (request.containsKey("uuid")) {
        uuid();

        response["uuid"] = getUuidString();    
      }

      /* = = = = */

      if (request.containsKey("getEEPROM")) {
        //checkBat();
        int getBatteryVolts = request["getEEPROM"];
        if (getBatteryVolts == 1) {
          eepromDump();
          response["EEPROM"] = "dumped";
        }
      }

      /* = = = = */

      if (request.containsKey("loraTX")) {
        //checkBat();
        //String stringToSend = request["loraTX"];
        //LoraTX(stringToSend); 
      }

      /* = = = = */

      //send it.
      serializeJson(response, Serial);
      Serial.println();
      clearBuffer();
    }
  }
}

void clearBuffer() {
  for (int a = 0; a< 200; a++) {
    inData[a] = 0;
    inputStringIndex = 0;
  }
}

void uuid() {
  
  bool uuidset = 0;

  String uuidHex; // = String(uuid);

  for (int a = 0; a < 8; a++) {
//    devuuid[a] = EEPROM[a];
    
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
//    EEPROM.write(a, random(256));
  }
  uuid();
}

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


void eepromDump() {
//  int a = 0;
//  int value;
//  bool done = 0;
//
//  while (!done) {
//    value = EEPROM.read(a);
//    Serial.print(a);
//    Serial.print("\t");
//    Serial.print(value);
//    Serial.println();
//
//    a = a + 1;
//
//    if (a == 8) done = 1;
//  }
}
