from pyHS100 import Discover
from pyHS100 import SmartPlug
import json
import urllib.request
import time
from datetime import date
sleeper = 10
autoList = []
dataList = []
class DatetimeEncoder(json.JSONEncoder):
    def default(self, obj):
        try:
            return super(DatetimeEncoder, obj).default(obj)
        except TypeError:
            return str(obj)

while(True):
    for dev in Discover.discover():
        if(autoList.count(dev) == 0):
            plug = SmartPlug(str(dev))
            autoList.append(dev)
            dataList.append(plug)
    for smartplug in dataList:
        EnergyData = smartplug.get_emeter_realtime()
        smartTime = str(smartplug.time)
        data = {
		"id": smartplug.alias.replace(" ","_"),
		"data": {
			"Plug State" : smartplug.state,
                        "Current Time" : smartTime,
                        "Consumption":EnergyData,
                        "On Since":smartplug.on_since                
		}
                }
        req = urllib.request.Request("http://localhost:8080/api/v3/data/post")
        req.add_header("Content-Type", "application/json")
        req.add_header("Authorization", "Basic YXBpOmtleS0ydDEzeW5pbHE1aWlkZjEyNWh6ajV2cWltMmw1cmtoMw==")
        response = urllib.request.urlopen(req, json.dumps(data, cls=DatetimeEncoder).encode("utf8"))
        #print(response.read())
    time.sleep(sleeper)