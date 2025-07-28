import json
import logging
import socket
import time

from esb import esb


logger = logging.getLogger(__name__)

def execute(ip, port, format, data, globalFormats,
            responseParams, firstTimeout, timeout):
    milliSec = lambda: int(round(time.time() * 1000))
    
    _putGlobals(format, globalFormats)
    logger.debug("Request:\n" + json.dumps(data, sort_keys=True, indent=4))
    msg = _getMessage(format, data)
    msg = _getHeaderBytes(msg) + msg
    msg = msg.encode(encoding='iso-8859-15', errors='strict')
    logger.debug("Request: " + str(msg))
    
    try:
        preTime = milliSec()
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.connect((ip, port))
        sock.send(msg)
        response = _recvall(sock,
                            firstTimeout if firstTimeout != None else 20,
                            timeout if timeout != None else 2)
        postTime = milliSec()
    except Exception as e:
        logger.debug("Error: " + str(e))
        return esb.generateResponse(
                {"Error": str(e)},
                False,
                0)
    finally:
        try:
            sock.close()
        except:
            pass
        
    logger.debug("Response: " + str(response))
    
    response = response[2:].decode(encoding="iso-8859-15", errors='ignore')
    
    if not response:
        return esb.generateResponse(
                {"Error": "Timeout or empty response"},
                False,
                0)
    else:
        success = response[6]
        nextControl = response[16]
        if success == "S":
            response = _parseResponse(response, responseParams)
            response["nextControl"] = nextControl
            return esb.generateResponse(
                response,
                True,
                postTime - preTime)
        else:
            return esb.generateResponse(
                {
                    	"Error": "Response with error.",
                    "nextControl": nextControl,
                    "Response": _parseResponse(response)
                },
                False,
                postTime - preTime)


def _parseResponse(msg, params=None):
    values = msg.split("|")
    
    paramNames = []
    for i in range(len(values)):
        if params != None and i < len(params):
            paramNames.append(params[i])
        else:
            paramNames.append(str(i))
    
    return dict(zip(paramNames, values))


def _putGlobals(format, globalFormats):
    index = 0;
    for att in format[:]:
        gf = att.get('format')
        if (gf != None):
            format[index:index + 1] = globalFormats[gf]
            index += len(globalFormats[gf]) - 1
        index += 1
        
def _getMessage(format, data):
    msg = ""
    for att in format:
        value = ""
        filler = att.get('filler')
        attName = att.get('attName')
        if (filler != None):
            value = filler
        elif (attName != None):
            attValue = data.get(attName)
            if (attValue != None):
                value = attValue
        
        length = att.get('length')
        if (length != None):
            padLeft = att.get('padLeft')
            padLeft = ">" if (padLeft == None or padLeft == True) else "<"
            padChar = att.get('padChar')
            padChar = " " if (padChar == None) else padChar[:1]
            
            value = value[:length]
            aux = "{:" + padChar + padLeft + str(length) + "}"
            value = aux.format(value)
        msg += value
    return msg


def _recvall(sock, firstTimeout, timeout):
    # make socket non blocking
    sock.setblocking(0)
     
    # total data partwise in an array
    total_data = [];
    data = '';
     
    # beginning time
    begin = time.time()
    while 1:
        # if you got some data, then break after timeout
        if total_data and time.time() - begin > timeout:
            break
         
        # if you got no data at all, wait a little longer, twice the timeout
        elif time.time() - begin > firstTimeout:
            break
         
        # recv something
        try:
            data = sock.recv(8192)
            if data:
                total_data.append(data)
                # change the beginning time for measurement
                begin = time.time()
            else:
                # sleep for sometime to indicate a gap
                time.sleep(0.1)
        except:
            pass
     
    # join all parts to make final string
    return b''.join(total_data)


def _getHeaderBytes(msg):
    size = len(msg) + 2
    return chr(int(size % 256)) + chr(int(size // 256))
