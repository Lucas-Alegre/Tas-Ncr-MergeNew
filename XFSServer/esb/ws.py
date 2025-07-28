from suds.client import Client
import logging
import re
import json
from xmljson import yahoo as xmlToJson
from xml.etree.ElementTree import fromstring
from esb import esb
import time
import ssl

logger = logging.getLogger(__name__)
clients = {}


def execute(wsdl, function, data, reqType = None):
    milliSec = lambda: int(round(time.time() * 1000))
    
    try:
        client = getClient(wsdl)
    except Exception as e:
        logger.error(e, exc_info=True)
        return esb.generateResponse(
            {"Error": "Error trying to retrieve wsdl"},
            False,
            0)
    
    if (reqType == None):
        try:
            reqType = re.search("(\S*"+function+"Request.*)$", str(client),
                                re.RegexFlag.MULTILINE).group(1)
        except:
            reqType = function
     
    request = client.factory.create(reqType)
    
    logger.debug("Request:\n" + str(request))
    
    logger.debug("Data Request:\n" + json.dumps(data, sort_keys=True, indent=4))
    
    _setData(request, data)
    
    logger.debug("Request:\n" + str(request))
    
    func = getattr(client.service, function)
    try:
        preTime = milliSec()
        response = func(*_getParamsList(client, function, request))
        postTime = milliSec()
    except Exception as e:
        logger.error(e, exc_info=True)
        return esb.generateResponse(
            {"Error": "Error trying to execute function"},
            False,
            0)
    
    response = xmlToJson.data(fromstring(response))
    response = re.sub(r"\"\{.*?\}(.*?\":)",r'"\g<1>',json.dumps(response))
    logger.debug("Response:\n" + response)
    response = json.loads(response)
    response = response['Envelope']['Body']['ResponseMessage']
    
    return esb.generateResponse(
            response,
            True if response["body"].get("Error") != None else False,
            postTime - preTime)
    
    return response


def getClient(wsdl):
    client = clients.get(wsdl)
    if (client == None):
        logger.debug("Creating new soap client...")
        ssl._create_default_https_context = ssl._create_unverified_context
        client = Client(url=wsdl, retxml=True)
        clients[wsdl] = client
    return client
        

def _getParamsList(client, function, request):
    functionParams = re.search(function+"\((.*)\)$", str(client),
                            re.RegexFlag.MULTILINE).group(1)
    functionParams = functionParams.split(",")
    
    ret = []
    for param in functionParams:
        param = param.split(" ")[-1]
        ret.append(request[param])
    return ret


def _setData(obj, data):
    for name, value in data.items():
        if isinstance(value, dict):
            try:
                obj[name]
            except AttributeError:
                obj[name] = {}
            _setData(obj[name], value)
        if isinstance(value, list):
            for item in value:
                if isinstance(item, str):
                    obj[name].append( item )
                else:
                    obj[name].append( _setData({}, item) )
        else:
            obj[name] = value
    return obj


def _basicSObjectToDict(obj):
    """Converts suds object to dict very quickly.
    Does not serialize date time or normalize key case.
    :param obj: suds object
    :return: dict object
    """
    if not hasattr(obj, '__keylist__'):
        return obj
    data = {}
    fields = obj.__keylist__
    for field in fields:
        val = getattr(obj, field)
        if isinstance(val, list):
            data[field] = []
            for item in val:
                data[field].append(_basicSObjectToDict(item))
        else:
            data[field] = _basicSObjectToDict(val)
    return data