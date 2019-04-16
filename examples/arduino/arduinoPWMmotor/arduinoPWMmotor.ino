/*
    Arduino UNO or similar 
    Ardumoto driver shield 
    DC 12v motor
*/

int PWMA = 3;
int PWMB = 11;
int DIRA = 12;
int DIRB = 13;

int motorOn = 0;

void setup() {
    Serial.begin(115200);
    pinMode(DIRA, OUTPUT);
    digitalWrite(DIRA, HIGH);
}


void loop() {

    digitalWrite(PWMA, motorOn);

    while(Serial.available()) {
      char c = Serial.read(); 
      if ((c != '\r')&&(c != '\n')) {
          motorOn = c - '0';
      }      
    }
}