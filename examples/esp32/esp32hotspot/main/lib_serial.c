#include <stdio.h>
#include <string.h>
#include "esp_system.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "driver/uart.h"
#include "esp_log.h"

#include "lib_serial.h"
#include "lib_display.h"

#define ECHO_TEST_RXD  (GPIO_NUM_16)
#define ECHO_TEST_TXD  (GPIO_NUM_17)
#define ECHO_TEST_RTS  (UART_PIN_NO_CHANGE)
#define ECHO_TEST_CTS  (UART_PIN_NO_CHANGE)

#define BUF_SIZE (1024)

static const char *TAG = "serial";

void serial_port_task(void *pvParameters) {
    /* Configure parameters of an UART driver,
     * communication pins and install the driver */
    uart_config_t uart_config = {
        .baud_rate = 115200,
        .data_bits = UART_DATA_8_BITS,
        .parity    = UART_PARITY_DISABLE,
        .stop_bits = UART_STOP_BITS_1,
        .flow_ctrl = UART_HW_FLOWCTRL_DISABLE
    };
    uart_param_config(UART_NUM_2, &uart_config);
    uart_set_pin(UART_NUM_2, ECHO_TEST_TXD, ECHO_TEST_RXD, ECHO_TEST_RTS, ECHO_TEST_CTS);
    uart_driver_install(UART_NUM_2, BUF_SIZE * 2, 0, 0, NULL, 0);

    // Configure a temporary buffer for the incoming data
    uint8_t *data = (uint8_t *) malloc(BUF_SIZE);

    while (1) {
        // Read data from the UART
        int len = uart_read_bytes(UART_NUM_2, data, BUF_SIZE, 20 / portTICK_RATE_MS);

        if (len > 0) {
          //char buf[20+1] = {};
          //memcpy(buf, data , len);
          //ESP_LOGI(TAG, "RECV: %s", buf);
          ESP_LOGI(TAG, "RECV: %d", len);
          lib_display_log((char *) data);
        }

        //// char buf[10+1] = {};
        //// memcpy(buf, data , 10);
        //lib_display_log((char *) data);
        

        //lib_serial

        //uart_write_bytes(UART_NUM_2, (const char *) data, len);
    }
}

void serial_port_write(char *indata) {
  uart_write_bytes(UART_NUM_2, (const char *) indata, sizeof(indata));
}

void serial_port_writelen(char *indata, int len) {
  uart_write_bytes(UART_NUM_2, (const char *) indata, len);
}