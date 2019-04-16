
/*
CONFIG
*/

#define USE_UWB
//#define USE_RADAR
//#define USE_ULTRASONIC
//#define USE_SENSORS

#define STATUSLED 2

void setup()
{
  Serial.begin(2000000);
  pinMode(STATUSLED, OUTPUT);   //enable this pin;
  digitalWrite(STATUSLED, LOW); //default off;

#ifdef USE_SENSORS
  lib_sensors_init();
#endif

  lib_id_init();
  lib_display_init();
  lib_wifi_init();
  lib_ota_init();

#ifdef USE_UWB
  lib_uwb_init();
#endif

#ifdef USE_RADAR
  lib_radar_init();
#endif

  // unique Identifier
  Serial.println("version: " + lib_state_version());
  String uuid = lib_id_getUuidString();
  Serial.println(uuid);
}

void loop()
{
  lib_display_loop();
  lib_serial_loop();
  lib_wifi_loop();
  lib_mqtt_loop();
  lib_ota_loop();

#ifdef USE_UWB
  lib_uwb_loop();
#endif

#ifdef USE_SENSORS
  lib_sensors_loop();
#endif

#ifdef USE_RADAR
  lib_radar_loop();
#endif

#ifdef USE_ULTRASONIC
  lib_ultrasonic_init();
#endif
}