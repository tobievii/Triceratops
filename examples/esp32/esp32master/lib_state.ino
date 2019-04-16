String lib_state_version() {
  return "0.0.10";
}

String lib_state_deviceid()
{
  String uuid = lib_id_getuuid();
  String output = String("iotnxt_uwb_" + uuid);
  return output;
}

String lib_state_packet()
{
  StaticJsonDocument<200> packet;
  packet["id"] = lib_state_deviceid();
  JsonObject data = packet.createNestedObject("data");
  data["version"] = lib_state_version();
  data["ip"] = lib_wifi_ip();
  
#ifdef USE_UWB 
  data["distance"] = lib_uwb_lastDistance();
#endif

//
//packet.prettyPrintTo(Serial);
#ifdef USE_ULTRASONIC
  data["radar"] = getRadar();
  data["ultrasonic"] = getUltrasonic2();
  data["battery"] = lib_battery_percentage();
#endif

  String output;
  serializeJson(packet, output);
  //Serial.println(output);
  return output;
}
