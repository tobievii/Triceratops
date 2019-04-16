#include <DHT.h>

#define TOUTCH_PIN T0 // ESP32 Pin D4
#define LED_PIN 2
#define DHTPIN 18
#define DHTTYPE DHT12
#define LIGHT_SENSOR 39
#define RADAR 5
#define ULTRASONIC 33
//const int echoPin = 32;

int freq = 5000;
int ledChannel = 0;
int resolution = 8;
int dutyCycle = 0;

DHT dht(DHTPIN, DHTTYPE);
int touch_value = 100;
int sensorValue;
int analog_value = 0;

// long duration;
// int distance;

void lib_sensors_init()
{
    ledcSetup(ledChannel, freq, resolution);
    ledcAttachPin(LED_PIN, ledChannel);
    ledcWrite(ledChannel, dutyCycle);
}

void lib_sensors_loop()
{

    //getRadar();
    Serial.print("Radar ");
    Serial.println(getRadar());

    //Serial.print("TEST: ");
    //Serial.println(getUltrasonic());

    //sensorValue = analogRead(A0);
    //Serial.println(sensorValue);
    // dutyCycle = map(sensorValue, 0, 4095, 0, 255);
    // ledcWrite(ledChannel, dutyCycle);
    // touch_value = touchRead(TOUTCH_PIN);

    // pinMode(LED_PIN, OUTPUT);
    // digitalWrite(LED_PIN, LOW);

    //if (touch_value < 50)
    //{
    //Serial.print("Sense:  ");
    //Serial.println(analogRead(LIGHT_SENSOR));
    // digitalWrite(LED_PIN, HIGH);
    //}
    //else
    //{
    // if (sensorValue < 300)
    // {
    //     digitalWrite(LED_PIN, HIGH);
    // }
    // else
    // {
    //     digitalWrite(LED_PIN, LOW);
    // }
    //}
    delay(500);
}

int getTouch()
{
    return touchRead(TOUTCH_PIN);
}

float getTemp()
{
    return dht.readTemperature();
}

float getHumidity()
{
    return dht.readHumidity();
}

int lib_sensors_getPotentiometer()
{
    return analogRead(A0);
}

int lib_sensors_getLightSensor()
{
    return analogRead(LIGHT_SENSOR);
}

int getRadar()
{
    return digitalRead(RADAR);
}
