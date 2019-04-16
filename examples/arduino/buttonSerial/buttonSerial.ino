/*
    This example works in conjunction with /examples/html/buttonSerial
*/

int lastButton = 0;

void setup() {
  Serial.begin(115200);
  pinMode(6, INPUT);
  pinMode(8, OUTPUT);
}


void loop() {
    int buttonReading = digitalRead(6);

    if (buttonReading != lastButton) {
        Serial.println(buttonReading);
        lastButton = buttonReading;
    }

    delay(10);        // delay in between reads for stability


    while(Serial.available()) {

      char c = Serial.read(); 
      if ((c != '\r')&&(c != '\n')) {
          digitalWrite(8, c - '0');
      }
      
    }

}