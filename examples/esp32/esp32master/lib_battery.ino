int pvt_lib_battery_lastadc = 0;
float pvt_lib_battery_volts = 0.0;
float pvt_lib_battery_percentage = 0.0;

void lib_battery_update()
{
  pvt_lib_battery_lastadc = analogRead(36);
  pvt_lib_battery_volts = ((float)pvt_lib_battery_lastadc) * 4.2f / 1520.0f;
  pvt_lib_battery_percentage = lib_battery_voltToPercentage(pvt_lib_battery_volts);
}

int lib_battery_lastadc()
{
  return pvt_lib_battery_lastadc;
}

float lib_battery_volts()
{
  return pvt_lib_battery_volts;
}

float lib_battery_percentage()
{
  // if (pvt_lib_battery_percentage == 1)
  // {
  //   return pvt_lib_battery_percentage + 1;
  // }
  // else
  // {
  return pvt_lib_battery_percentage;
  //}
}

////////////////////////////////////////////////////////////

float lib_battery_voltToPercentage(float volt)
{
  // float x = volt - (3.27) / (4.2-3.27);
  // if (x > 1) { x = 1;}
  // if (x < 0) { x = 0;}
  // return x;

  if (volt >= 4.2)
  {
    return 8;
  }
  if (volt >= 4.05)
  {
    return 7;
  }
  if (volt >= 3.85)
  {
    return 6;
  }
  if (volt >= 3.70)
  {
    return 5;
  }
  if (volt >= 3.55)
  {
    return 4;
  }
  if (volt >= 3.40)
  {
    return 3;
  }
  if (volt >= 3.35)
  {
    return 2;
  }
  if (volt >= 3.27)
  {
    return 1;
  }

  // if (volt >= 4.2)
  // {
  //   return 1.0;
  // }
  // if (volt >= 4.15)
  // {
  //   return 0.95;
  // }
  // if (volt >= 4.11)
  // {
  //   return 0.9;
  // }
  // if (volt >= 4.08)
  // {
  //   return 0.85;
  // }
  // if (volt >= 4.02)
  // {
  //   return 0.8;
  // }
  // if (volt >= 3.98)
  // {
  //   return 0.75;
  // }
  // if (volt >= 3.95)
  // {
  //   return 0.7;
  // }
  // if (volt >= 3.91)
  // {
  //   return 0.65;
  // }
  // if (volt >= 3.87)
  // {
  //   return 0.6;
  // }
  // if (volt >= 3.85)
  // {
  //   return 0.55;
  // }
  // if (volt >= 3.84)
  // {
  //   return 0.5;
  // }
  // if (volt >= 3.82)
  // {
  //   return 0.45;
  // }
  // if (volt >= 3.79)
  // {
  //   return 0.4;
  // }
  // if (volt >= 3.77)
  // {
  //   return 0.35;
  // }
  // if (volt >= 3.75)
  // {
  //   return 0.3;
  // }
  // if (volt >= 3.73)
  // {
  //   return 0.25;
  // }
  // if (volt >= 3.71)
  // {
  //   return 0.2;
  // }
  // if (volt >= 3.69)
  // {
  //   return 0.15;
  // }
  // if (volt >= 3.61)
  // {
  //   return 0.1;
  // }
  // if (volt < 3.61)
  // {
  //   return 0.05;
  // }
  // if (volt < 3.27)
  // {
  //   return 0.00;
  // }
}