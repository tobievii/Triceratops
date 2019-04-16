#include <ArduinoJson.h>

char inData[200]; // Allocate some space for the string
char inChar=-1; // Where to store the character read
byte inputStringIndex = 0; // Index into array; where to store the character

void lib_serial_loop() {
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

      //test
      // String jsontemp;
      // serializeJson(request, jsontemp);
      // Serial.println("api call:");
      // Serial.println(jsontemp);
      // Serial.println("-----");

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


      // if (request.containsKey("id")) {
      //   String reqid = request["id"];
      //   if (reqid == lib_id_getUuidString()) {
      //     //for us
      //     // if (request.containsKey("doorLock")) {
      //     //   doorLocked = request["doorLock"];
      //     // }

      //   } else {
      //     // transmit with random delay
      //     // delay(100 + random(0,300));
      //     // LoraTX(inSerialString);
      //   }
      // }

      /* = = = = */

      // if (request.containsKey("getBatteryVolts")) {
      //   //checkBat();
      //   int getBatteryVolts = request["getBatteryVolts"];
      //   if (getBatteryVolts == 1) {
      //     float batvolt = checkBat();
          
      //     response["batteryVolts"] = batvolt;
      //   }
      // }

      /* = = = = */

      if (request.containsKey("uuid")) {
        //uuid();
        response["uuid"] = lib_id_getUuidString();    
      }

      /* = = = = */

      // if (request.containsKey("getEEPROM")) {
      //   //checkBat();
      //   int getBatteryVolts = request["getEEPROM"];
      //   if (getBatteryVolts == 1) {
      //     eepromDump();
      //     response["EEPROM"] = "dumped";
      //   }
      // }

      // /* = = = = */

      // if (request.containsKey("loraTX")) {
      //   //checkBat();
      //   String stringToSend = request["loraTX"];
      //   LoraTX(stringToSend); 
      // }

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