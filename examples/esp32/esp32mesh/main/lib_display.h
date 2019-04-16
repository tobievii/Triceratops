/*
LIB DISPLLAY
*/

#ifndef __LIB_DISPLAY__
#define __LIB_DISPLAY__

/*******************************************************
 *                Constants
 *******************************************************/

// https://github.com/nkolban/esp32-snippets/tree/master/hardware/displays/U8G2

// SDA - GPIO21
#define PIN_SDA 21

// SCL - GPIO22
#define PIN_SCL 22


/*******************************************************
 *                Type Definitions
 *******************************************************/

/*******************************************************
 *                Structures
 *******************************************************/

/*******************************************************
 *                Variables Declarations
 *******************************************************/

/*******************************************************
 *                Function Definitions
 *******************************************************/
void lib_display_setNodeNum(int nodecounttemp);
void lib_display_setRSSI(int rssitmp);
void lib_display_setLayer(int layertmp);
void lib_display_setMac(uint8_t *mac);
void task_test_SSD1306i2c(void *ignore);


#endif /* __LIB_DISPLAY__ */