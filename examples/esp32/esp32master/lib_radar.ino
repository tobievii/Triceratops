int ip = 5;

int val = 0;

int led = 13;

void lib_radar_init()
{

    //Serial.begin(115200);

    pinMode(ip, INPUT);

    pinMode(led, OUTPUT);
}

void lib_radar_loop()
{

    val = digitalRead(ip);

    //Serial.println(val, DEC);

    if (val > 0)

    {

        digitalWrite(led, HIGH);
    }

    else

    {

        digitalWrite(led, LOW);
    }

    delay(1000);
}