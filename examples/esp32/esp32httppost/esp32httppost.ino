
#include <WiFi.h>
#include <HTTPClient.h>
 
const char* ssid = "yourwifi";
const char* password =  "yourwifipassword";
 
void setup() {
 
  Serial.begin(115200);
  delay(4000);   //Delay needed before calling the WiFi.begin
 
  WiFi.begin(ssid, password); 
 
  while (WiFi.status() != WL_CONNECTED) { //Check for the connection
    delay(1000);
    Serial.println("Connecting to WiFi..");
  }
 
  Serial.println("Connected to the WiFi network");
 
}
 
void loop() {
 
 if(WiFi.status()== WL_CONNECTED){   //Check WiFi connection status
 
   HTTPClient http;   
 
   http.begin("https://prototype.iotnxt.io/api/v3/data/post");  
   http.addHeader("Content-Type", "application/json");            
   http.addHeader("Authorization", "Basic YXBfnjdksdmsklmfdskldmsajkdnsajkfhcxaw=="); // UPDATE WITH YOUR AUTH HEADER SEE API DOCS ONCE LOGGED IN
 
   int httpResponseCode = http.POST("{\"id\":\"esp32\",\"data\":{\"temperature\":24.54,\"doorOpen\":false,\"gps\":{\"lat\":25.123,\"lon\":28.125}}}");   //Send the actual POST request
 
   if(httpResponseCode>0){
 
    String response = http.getString();                       //Get the response to the request
 
    Serial.println(httpResponseCode);   //Print return code
    Serial.println(response);           //Print request answer
 
   }else{
 
    Serial.print("Error on sending POST: ");
    Serial.println(httpResponseCode);
 
   }
 
   http.end();  //Free resources
 
 }else{
 
    Serial.println("Error in WiFi connection");   
 
 }
 
  delay(10000);  //Send a request every 10 seconds
 
}