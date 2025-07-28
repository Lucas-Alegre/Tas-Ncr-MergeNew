/*

*/

var REGXFSSERVER = "Software\\NCR";
//var REGXFSSERVER = "Software\\NCR\\XFSServer";
function XFSDevice(conn) {

    this.server_base = "http://localhost:4096/XFSServer/";
    //this.server_base = "http://192.127.58.133:4096/XFSServer/";
    //this.server_base = "http://192.127.58.44:4096/XFSServer/";

    this.conn = conn;

    this.callXfsConnection = function (connname, fun, command, params, timeout) {
        var _this = this;
        return new Promise(function (resolve, reject) {

            var xfsserver = _this.server_base + fun + "/" + connname;
            
            if (!params) {
                params = {};
            }

            //build request
            var obj = _this.buildCommand(command, params, timeout);

            //console.log(xfsserver + ", " + JSON.stringify(obj));

            $.ajax(xfsserver, {
                data: JSON.stringify(obj),
                type: 'POST',
                contentType: 'text/plain',
                success: function (data) {
                    resolve(JSON.parse(data));
                },
                error: function (xhr, opt, error) {
                    reject(xhr);
                }
            });
        });
    }

    this.getRequest = function (method, param) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var xfsserver = _this.server_base + method + "/" + _this.conn + "/" + param;

            $.ajax(xfsserver, {
                type: 'GET',
                contentType: 'text/plain',
                success: function (data) {
                    resolve(JSON.parse(data));
                },
                error: reject
            });
        });
    }

    this.buildCommand = function (command, params, timeout) {
        var cmd = {};
        if (command != null) {
            cmd.command = command;
            if (typeof params != "function" && params)
                cmd.input = params;
            if (typeof timeout != "undefined")
                cmd.timeout = parseInt(timeout);
        } else {
            return params;
        }
        return cmd;
    }


    this.pullEvent = function (queue) {
        var _this = this;
        return this.getRequest("pullEvent", queue);
    }


    this.clearQueue = function (queue) {
        var _this = this;
        return this.getRequest("clearQueue", queue);
    }

    this.extension = function (command, params, timeout) {
        if (typeof (params) == 'undefined')
            params = {};
        return this.callXfsConnection(this.conn, "extension", command, params, timeout);
    }

    this.getInfo = function (command, params, timeout) {
        return this.callXfsConnection(this.conn, "WFSGetInfo", command, params, timeout);
    }

    this.asyncGetInfo = function (command, params, timeout) {
        return this.callXfsConnection(this.conn, "WFSAsyncGetInfo", command, params, timeout);
    }

    this.execute = function (command, params, timeout) {
        return this.callXfsConnection(this.conn, "WFSExecute", command, params, timeout);
    }

    this.asyncExecute = function (command, params, timeout) {
        return this.callXfsConnection(this.conn, "WFSAsyncExecute", command, params, timeout);
    }

    this.cancelBlockingCall = function (params) {
        return this.callXfsConnection(this.conn, "WFSCancelBlockingCall", null, params);
    }

    this.cancelAsyncRequest = function (params) {
        return this.callXfsConnection(this.conn, "WFSCancelAsyncRequest", null, params);
    }

    this.available = function () {
        return this.extension("Available", null);
    }

    this.setCallback = function (callback, clear, queue) {
        var _this = this;
        var _stateid = States.CurrentState;
        var _queue = queue;
        if (typeof queue == 'undefined')
            _queue = conn;

        if (typeof clear == 'undefined')
            clear = true;
        function readQueue() {
            _this.pullEvent(_queue)
                .then(function (data) {
                    callback(data);
                    if (States.CurrentState == _stateid)
                        window.setTimeout(readQueue, 200);
                })
                .caught(function (err) { });
        };
        if (clear) {
            _this.clearQueue(_queue)
            .then(function () {
                readQueue();
            });
        } else {
            readQueue();
        }
    }

    this.log = function (message, level, src) {
        if (typeof src === 'undefined')
            src = "TPA";

        if (typeof level === 'undefined' || level == null || level == "")
            level = "Info";

        return this.extension("Logger", { "source": src, "message": message, "level": level });
    }
};

function xfsAvailable(conn) {

    var dev = new XFSDevice(conn);
    if (dev == "dep") {

        return dev.getInfo("WFS_INF_DEP_STATUS")

        .then(function (res) {
            return res.lpBuffer.fwDevice == 0 && res.lpBuffer.fwDepContainer == 0 && res.lpBuffer.fwDepTransport == 0;
        })

        .caught(function (res) {
            return false;
        })


    } else {

        return dev.available()

        .then(function (res) {
            return res.available;
        })

        .caught(function (res) {
            return false;
        });

    }

}

function xfslogger(message, level, src) {
    return new XFSDevice("server").log(message, level, src);
}

//Tira auditora con Fecha, hora, numero de terminal y numero de transaccion
function xfsAudit(title, message) {
    var date = new Date();
    var str = UserFuns.getDateString(date) + " " + UserFuns.getTimeString(date);
    str += " " + SSUtil.getLocal("TerminalName", "") + " / " + States.getSequencialNumber("config.numtrx", "") + "\r\n";
	if (title != "") {
		str += "" + title + "\r\n";
	}
    if (message != "") {
		str += "" + message + "\r\n";
	}  
    var input = { "data": str };
    console.log(str);
    
	var datos = {};
	datos.operacion = "Loguear";
	datos.texto = str;
	var dev = new XFSDevice("server");		
	dev.extension("Auditoria", datos)
	.then(function(data) {
		return new XFSDevice("server").extension("Journal", input);
	})
	.caught(function(err) {
		return new XFSDevice("server").extension("Journal", input);
	});
}

//Tira auditora con Fecha, hora y numero de terminal
function xfsAuditNtrx(title, message) {
    var date = new Date();
    var str = UserFuns.getDateString(date) + " " + UserFuns.getTimeString(date);
    str += " " + SSUtil.getLocal("TerminalName", "") + "\r\n";
	if (title != "") {
		str += "" + title + "\r\n";
	}
    if (message != "") {
		str += "" + message + "\r\n";
	}
    var input = { "data": str };
    console.log(str);

    var datos = {};
	datos.operacion = "Loguear";
	datos.texto = str;
	var dev = new XFSDevice("server");		
	dev.extension("Auditoria", datos)
	.then(function(data) {
		return new XFSDevice("server").extension("Journal", input);
	})
	.caught(function(err) {
		return new XFSDevice("server").extension("Journal", input);
	});
}

function readRegistry(key, def, path, action) {
    if (typeof path == 'undefined')
        path = REGXFSSERVER;
    if (typeof def == 'undefined')
        def = "";
    var input = { "path": path, "key": key, "default": def };
    if (action)
        input.action = action;
    return new XFSDevice("server").extension("RegistryExt", input)
    .then(function (res) {
        return res[key];
    })
    .caught(function (ex) {
        return def;
    });
}

function setRegistry(key, def, path) {
    return readRegistry(key, def, path, "set");
}

function initSupervisorSwitch() {
    new XFSDevice("server").extension("SupervisorSwitch", { "path": REGXFSSERVER });
}

function supervisorData() {

    var retobj = {};
    var monitor_count = 1;

    return readRegistry("monitor_count", -1)

    .then(function (mc) {
        retobj.monitor_count = mc;
        return readRegistry("supervisor_switch", -1);
    })

    .then(function (ss) {
        retobj.supervisor_switch = ss;
        return readRegistry("tpa_status", -1);
    })

    .then(function (tpa) {
        retobj.tpa = tpa;
        return readRegistry("sup_status", -1);
    })

    .then(function (sup) {
        retobj.sup = sup;
        return retobj;
    })
        
    .caught(function (ex) {
        return retobj;
    });
}

function supervisorSwitch(callback, _stateid) {
    
    if(typeof(_stateid)=='undefined')
        _stateid = States.CurrentState;

    return supervisorData()

    .then(function (data) {
        
        var state = "";
        if (data.monitor_count == 2) {
            if (data.supervisor_switch == 4) {
                state = "supervisor_gop";
            } else {
                state = "normal_gop";
            }
        } else {
            if (data.supervisor_switch == 4) {
                state = "supervisor";
            } else {
                state = "normal";
            }
        }

        data.state = state
        callback(data);

        if (States.CurrentState == _stateid)
            window.setTimeout(function () {
                supervisorSwitch(callback, _stateid);
            }, 1000);
    });
}
