
/*
LIB IOTSERIAL
*/

#ifndef __LIB_IOTSERIAL__
#define __LIB_IOTSERIAL__

void serial_port_task(void *pvParameters);
void serial_port_write(char *indata);
void serial_port_writelen(char *indata, int len);

#endif /* __LIB_IOTSERIAL__ */


