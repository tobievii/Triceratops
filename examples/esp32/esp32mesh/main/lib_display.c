#include <driver/gpio.h>
#include <driver/spi_master.h>
#include <esp_log.h>
#include <freertos/FreeRTOS.h>
#include <freertos/task.h>
#include <stdio.h>
#include <string.h>
#include <u8g2.h>

#include "sdkconfig.h"
#include "u8g2_esp32_hal.h"

#include "lib_display.h"
#include "mwifi.h"
#include "main.h"

int meshLayer = -1;
int nodecount = -1;
int rssi = 99;
uint8_t sta_mac[MWIFI_ADDR_LEN] = {0x0};

static const char *TAG = "ssd1306";
const uint8_t bitmap1[] = {

		0x00, // ........
		0x00, // ........
		0x02, // ......#.
		0x02, // ......#.
		0x0A, // ....#.#.
		0x0A, // .##.#.#.
		0x2A, // ..#.#.#.
		0x00	// ........

};

const uint8_t bitmapm[] = {

		0x00, // ........
		0x00, // ........
		0x00, // ........
		0x00, // ........
		0x02, // ......#.
		0x1A, // ...##.#.
		0x1A, // ...##.#.
		0x00	// ........

};
const uint8_t bitmapl[] = {

		0x00, // ........
		0x00, // ........
		0x00, // ........
		0x00, // ........
		0x00, // ........
		0x06, // .....##.
		0x06, // .....##.
		0x00	// ........

};

const uint8_t bitmap2[] = {

		0x3C, // ..####..
		0x46, // .#...##.
		0x87, // #....###
		0x89, // #...#..#
		0x91, // #..#...#
		0xE1, // ###....#
		0x62, // .##...#.
		0x3C	// ..####..

};

//const uint8_t battery[] = {

//0x00, // ........
//0x00, // ........
//0xFE, // #######.
//0x83, // #.....##
//0x83, // #.....##
//0xFE, // #######.
//0x00, // ........
// 0x00  // ........

//};

void lib_display_setNodeNum(int nodecounttemp)
{
	nodecount = nodecounttemp;
}

void lib_display_setRSSI(int rssitmp)
{
	rssi = rssitmp;
}

void lib_display_setLayer(int layertmp)
{
	meshLayer = layertmp;
}

void lib_display_setMac(uint8_t *mac)
{
	memcpy(sta_mac, mac, MWIFI_ADDR_LEN);
}

void task_test_SSD1306i2c(void *ignore)
{

	u8g2_esp32_hal_t u8g2_esp32_hal = U8G2_ESP32_HAL_DEFAULT;
	u8g2_esp32_hal.sda = PIN_SDA;
	u8g2_esp32_hal.scl = PIN_SCL;
	u8g2_esp32_hal_init(u8g2_esp32_hal);

	/*
u8g2_Setup_ssd1306_i2c_64x48_er_f(&u8g2, rotation, u8x8_byte_arduino_hw_i2c, u8x8_gpio_and_delay_arduino);
    u8x8_SetPin_HW_I2C(getU8x8(), reset, clock, data);
*/

	u8g2_t u8g2; // a structure which will contain all the data for one display
	u8g2_Setup_ssd1306_i2c_64x48_er_f(
			&u8g2,
			U8G2_R0,
			//u8x8_byte_sw_i2c,
			u8g2_esp32_i2c_byte_cb,
			u8g2_esp32_gpio_and_delay_cb); // init u8g2 structure
	u8x8_SetI2CAddress(&u8g2.u8x8, 0x78);

	ESP_LOGI(TAG, "u8g2_InitDisplay");
	u8g2_InitDisplay(&u8g2); // send init sequence to the display, display is in sleep mode after this,

	ESP_LOGI(TAG, "u8g2_SetPowerSave");
	u8g2_SetPowerSave(&u8g2, 0); // wake up display

	for (;;)
	{
		//ESP_LOGI(TAG, "u8g2_ClearBuffer");
		u8g2_ClearBuffer(&u8g2);
		//// ESP_LOGI(TAG, "u8g2_DrawBox");
		// u8g2_DrawBox(&u8g2, 0, 26, 80,6);
		// u8g2_DrawFrame(&u8g2, 0,26,100,6);

		//ESP_LOGI(TAG, "u8g2_SetFont");
		u8g2_SetFont(&u8g2, u8g2_font_5x7_tf);
		//ESP_LOGI(TAG, "u8g2_DrawStr");
		if (rssi > 0 || rssi == -120)
		{
			u8g2_DrawBitmap(&u8g2, 55, 0, 1, 8, bitmap2);
		}
		else if (rssi >= -65 && rssi < 0)
		{
			u8g2_DrawBitmap(&u8g2, 55, 0, 1, 8, bitmap1);
		}

		else if (rssi >= -75 && rssi < -65)
		{
			u8g2_DrawBitmap(&u8g2, 55, 0, 1, 8, bitmapm);
		}

		else if (rssi > -120 && rssi < -75)
		{
			u8g2_DrawBitmap(&u8g2, 55, 0, 1, 8, bitmapl);
		}

		if (meshLayer == 1)
		{
			u8g2_DrawStr(&u8g2, 45, 7, "P");
		}

		else if (meshLayer > 1)
		{
			u8g2_DrawStr(&u8g2, 45, 7, "C");
		}

		u8g2_DrawStr(&u8g2, 0, 7, "IoT.nxt");

		char strlayer[6];
		sprintf(strlayer, "%d", meshLayer);
		u8g2_DrawStr(&u8g2, 0, 15, "Layer");
		u8g2_DrawStr(&u8g2, 26, 15, strlayer);

		char strnodes[6];
		sprintf(strnodes, "%d", nodecount);
		u8g2_DrawStr(&u8g2, 0, 23, "Nodes");
		u8g2_DrawStr(&u8g2, 26, 23, strnodes);

		char str_rssi[6];
		sprintf(str_rssi, "%d", rssi);
		u8g2_DrawStr(&u8g2, 0, 31, "RSSI");
		u8g2_DrawStr(&u8g2, 26, 31, str_rssi);

		//////// MAC
		char str_mac[6];
		sprintf(str_mac, "%02x%02x%02x%02x%02x%02x", sta_mac[0], sta_mac[1], sta_mac[2], sta_mac[3], sta_mac[4], sta_mac[5]);
		u8g2_DrawStr(&u8g2, 0, 39, str_mac);

		// VERSION
		u8g2_DrawStr(&u8g2, 0, 48, "V");
		u8g2_DrawStr(&u8g2, 10, 48, FIRMWARE_VERSION);

		//ESP_LOGI(TAG, "u8g2_SendBuffer");
		u8g2_SendBuffer(&u8g2);
		//ESP_LOGI(TAG, "All done!");
		vTaskDelay(1000 / portTICK_RATE_MS);
	}

	vTaskDelete(NULL);
}