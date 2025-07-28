from esb import ws
from esb import grip
import logging
import json
import datetime
import copy
from dicttoxml import dicttoxml

logger = logging.getLogger(__name__)
config = None


def audit(audit):
    logger.info("Audit:\n" + json.dumps(audit, sort_keys=True, indent=4))


def executeTrx(data):
    try:
        loadConfig()
    except Exception as e:
        logger.error(e, exc_info=True)
        return {"Error": "Error loading ESB config."}
    
    
    trx = data['trx']
    auditData = data['audit']
    data = data['data']
    trxConfig = config['trxs'][trx]
    response = None
    opNum = None
    wsdlPrefix = config.get('configs', {}).get('wsdlPrefix', "")
    if (trxConfig['type'] == "ws"):
        response = ws.execute(wsdlPrefix + trxConfig['wsdl'],
                          trxConfig['function'],
                          data,
                          trxConfig.get('reqType'))
    else:
        opNum = trx
        response = grip.execute(trxConfig['ip'], trxConfig['port'], 
                            trxConfig['format'],
                            data, 
                            config.get('gripFormats'), 
                            trxConfig.get('responseParams'),
                            trxConfig.get('firstTimeout'),
                            trxConfig.get('timeout'))
    
    
    input = _obfuscate(data,
                       trxConfig.get('inputObfuscate'),
                       "input")
    output = _obfuscate(response["data"],
                        trxConfig.get('outputObfuscate'),
                        "output")
    _addAuditData(response, auditData, opNum, trx,input,output)
    audit(response["audit"])
    
    return response["data"]


def generateResponse(data, success, delay):    
    audit = {
        "category" : "TX",
        "message" : "LOG_EVENT_MESSAGE",
        "sequenceNumber" : 0,
        "severity" : 1 if success else 0,
        "timestamp" : str(datetime.datetime.now()),
        "persisterClass" : "TAS NCR",
        
        "user11" : None,
        "user12" : None,
        "user14" : delay,
        "user15" : None
    }
    
    return {
        "audit" : audit,
        "data": data
        }

    
def loadConfig():
    global config
    if (config == None):
        try:
            configFile = open("config.json")
            config = json.load( configFile )
        except Exception as e:
            logger.error(e, exc_info=True)
            return {"Error": "Error loading ESB config."}
        finally:
            configFile.close()
    
  
def _addAuditData(response, auditData, opNum, trx, input, output):
    response["audit"].update(auditData)
    response["audit"]["user9"] = opNum
    response["audit"]["user10"] = trx
    response["audit"]["logData"] = input+"#"+output


def _obfuscate(data, params, rootElement):
    output = copy.deepcopy(data)
    logger.debug("To ofuscate:\n" + json.dumps(output, sort_keys=True, indent=4))
    
    if params and len(params) > 0:
        for param in params:
            logger.debug("Ofuscate Param: " + param)
            _replaceValue(output, param.split("."), "-")
    
    logger.debug("Ofuscated:\n" + json.dumps(output, sort_keys=True, indent=4))
    
    output = dicttoxml(output, custom_root=rootElement,
                       attr_type=False)
    output = output.decode("utf-8")
    return output
    

def _replaceValue(aDict, dictKeys, newValue):
    if dictKeys[0] in aDict:
        if len(dictKeys)==1:
            aDict[dictKeys[0]]=newValue
        else:
            _replaceValue(aDict[dictKeys[0]], dictKeys[1:],newValue)