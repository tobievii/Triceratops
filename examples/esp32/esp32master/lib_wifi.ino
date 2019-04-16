#include <WiFi.h>

const char* ssid = "devprotowifi";
const char* password = "devprotowifi";

// String apikey = "76mpzsbqv4aws5zn8fh14a1j8c96nwcf";
// String deviceid = "microRaptor2";

int lib_wifi_status_last = 999;

void lib_wifi_init() {
  WiFi.begin(ssid, password);
}

void lib_wifi_loop() {
  lib_wifi_status();
}

int lib_wifi_status_get() {
  return lib_wifi_status_last;
}

void lib_wifi_status() {
  // https://www.arduino.cc/en/Reference/WiFiStatus
  int wifiStatus = WiFi.status();
  
  if (wifiStatus != lib_wifi_status_last) {

    
    Serial.println(wifiStatus);

// Serial.println(WL_IDLE_STATUS);     // 0
// Serial.println(WL_NO_SSID_AVAIL);   // 1
// Serial.println(WL_SCAN_COMPLETED);  // 2
// Serial.println(WL_CONNECTED);       // 3
// Serial.println(WL_CONNECT_FAILED);  // 4
// Serial.println(WL_CONNECTION_LOST); // 5
// Serial.println(WL_DISCONNECTED);    // 6
// Serial.println(WL_NO_SHIELD);       // 255



 
    if (wifiStatus == WL_IDLE_STATUS) { // 0
      Serial.println("WiFi idle");
    }
    if (wifiStatus == WL_NO_SSID_AVAIL) { // 1
      Serial.println("no SSID are available");
    }
    if (wifiStatus == WL_SCAN_COMPLETED) { // 2
      Serial.println("scan networks is completed");
    }

    if (wifiStatus == WL_CONNECTED) { // 3
      Serial.println("connected to a WiFi network");
      Serial.print("Connected to ");
      Serial.println(ssid);
      Serial.print("IP address: ");
      Serial.println(WiFi.localIP());
    }

    if (wifiStatus == WL_CONNECT_FAILED) { // 4
      Serial.println(" connection fails for all the attempts");
      WiFi.disconnect();
      lib_wifi_init();
    }
    if (wifiStatus == WL_CONNECTION_LOST) { // 5
      Serial.println("connection is lost");
    }
    if (wifiStatus == WL_DISCONNECTED) { // 6
      Serial.println("disconnected from a network");
    }

   if (wifiStatus == WL_NO_SHIELD) { // 255
      Serial.println("no WiFi shield is present");
    }

    lib_wifi_status_last = wifiStatus;
    lib_display_update();
  }
}


String lib_wifi_ip() {
  IPAddress ip = WiFi.localIP();
  return String(ip[0]) + String(".") + String(ip[1]) + String(".") + String(ip[2]) + String(".") + String(ip[3])  ; 
}


