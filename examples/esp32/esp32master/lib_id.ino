#include <EEPROM.h>

/*
This file handles all that relates to the unique identifier for this device. In this implementation we use the EEPROM memory to store a random requence of bytes. Once this is stored we will retrieve this same random sequence and use that as our unique identifier for this device.
*/

byte devuuid[8];
String lib_id_uuid = "                ";

void lib_id_init() {
  randomSeed(analogRead(0));
  lib_id_checkuuid(); 
  lib_id_uuid = lib_id_getUuidString();
}

String lib_id_getuuid() {
  return lib_id_uuid;
}

/* ------------------------------------------------------------------------ */

void lib_id_checkuuid() {
  
  bool uuidset = 0;

  EEPROM.begin(8);
  String uuidHex; // = String(uuid);

  for (int a = 0; a < 8; a++) {
    devuuid[a] = EEPROM.read(a); //EEPROM[a];
    //Serial.println(devuuid[a]);
    if (devuuid[a] != 255) uuidset = 1;
  }
  
  //String myString = (char*)devuuid;
  //Serial.println(myString);

  //if all EEPROM == 0 then generate new uuid.
  if (uuidset == false) {
    //Serial.println("generating uuid");
    lib_id_genuuid();
  } else {
    //Serial.println("uuid already set");
  }
  
}

/* ------------------------------------------------------------------------ */

void lib_id_genuuid() {
  // this should only ever be run once per device
  randomSeed(analogRead(0));
  for (int a = 0; a < 8; a++) {
    EEPROM.write(a, random(256));
  }
  EEPROM.commit();
  lib_id_checkuuid();
}



/* ------------------------------------------------------------------------ */

void lib_id_eepromDump() {
  int a = 0;
  int value;
  bool done = 0;

  while (!done) {
    value = EEPROM.read(a);
    // Serial.print(a);
    // Serial.print("\t");
    // Serial.print(value);
    // Serial.println();

    a = a + 1;

    if (a == 8) done = 1;
  }
}



/* ------------------------------------------------------------------------ */

String lib_id_getUuidString() {
    String output = "";        
    for (int a = 0; a< 8; a++) {
        String byteHex = String(devuuid[a], HEX);
        if (byteHex.length() == 1) { byteHex = String("0"+byteHex);}
        output = String(output+byteHex);
    }
    return output;
}
