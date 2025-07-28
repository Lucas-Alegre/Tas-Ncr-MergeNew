from esb import esb
import json


def callExecute(data):
    fobj = open("response.json", "w")
    result = ""
    try:
        result = esb.executeTrx(data)
    except:
        result = {"Error": "Invalid grip request"}
    fobj.write(json.dumps(result))
    fobj.close()
    return 0
