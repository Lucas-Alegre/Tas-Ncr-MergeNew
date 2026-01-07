/// no text selection
document.onselectstart = function () { return false; };

(function lockBrowserBackFromPinpad() {
  function pushLock() {
    try { history.pushState({ __lock: true }, "", location.href); } catch (e) {}
  }

  function showAndStay(reason) {
    alert("Operación cancelada: uso del botón de retroceso del navegador no permitido (" + reason + ").");
    pushLock();
  }

  pushLock();

  if (window.addEventListener) {
    window.addEventListener("popstate", function () {
      showAndStay("popstate");
    }, false);

    window.addEventListener("hashchange", function () {
      showAndStay("hashchange");
    }, false);

    window.addEventListener("keydown", function (e) {
      e = e || window.event;

      var t = e.target || e.srcElement;
      var tag = (t && t.tagName) ? String(t.tagName).toUpperCase() : "";
      var isEditable = !!(t && (tag === "INPUT" || tag === "TEXTAREA" || t.isContentEditable === true));

      var key = e.key;
      var kc = e.keyCode || e.which;

      var isBackspace = (key === "Backspace") || (kc === 8);
      var isBrowserBack = (key === "BrowserBack") || (kc === 166) || (kc === 177);
      var isAltLeft = !!(e.altKey && ((key === "ArrowLeft") || (kc === 37)));

      if (!isEditable && (isBackspace || isBrowserBack || isAltLeft)) {
        if (e.preventDefault) e.preventDefault(); else e.returnValue = false;
        if (e.stopPropagation) e.stopPropagation(); else e.cancelBubble = true;
        if (e.stopImmediatePropagation) e.stopImmediatePropagation();

        showAndStay("keydown");
        return false;
      }
    }, true);
  }
})();

/**
    * @class Vars
    * @namespace Vars
    * @description Herramienta utilizada para el manejo de variables del framework
*/
var Vars = {
    

    

    /**
        * @memberof Vars
        * @method clearSession
        * @description Elimina todas las variables almacenadas en el framework
    */
    clearSession: function () {
        sessionStorage.clear();
    },


    /**
        * @memberof Vars
        * @method set
        * @param path {string} Nombre de la variable a almacenar
        * @param value {object} Valor de la variable a almacenar
        * @param persistent {bool} Determina si se debe persistir en memoria volatil la variable en cuestion
        * @description Setea una variable en memoria
    */
    set: function (path, value, persistent) {
        if (typeof persistent === 'undefined') {
            persistent = false;
        }

        if (typeof value === 'undefined' || value===null) {
            sessionStorage.removeItem(name);
            localStorage.removeItem(name);
            return;
        }

        value = JSON.stringify(value);

        sessionStorage[path] = value;
        if (persistent) {
            localStorage[path] = value;
        }
    },

    /**
        * @memberof Vars
        * @method get
        * @param path {string} Nombre de la variable a obtener
        * @param def {object} Valor default a devolver en caso de no encontrar la variable
        * @description Obtiene el valor de una variable o un default.
    */
    get: function (path, def) {
        var ret = def;
        if (sessionStorage[path] != null)
            ret = sessionStorage[path];
        else if (localStorage[path] != null)
            ret = localStorage[path];
        if (ret === def)
            return def;
        try {
            return JSON.parse(ret);
        } catch (ex) {
        }
        return ret;
    },

    /**
        * @memberof Vars
        * @method exists
        * @param path {string} Nombre de la variable a consultar existencia
        * @description Consulta existencia de una variable.
    */
    exists: function (path) {
        return sessionStorage[path] != null || localStorage[path] != null;
    },

    /**
        * @memberof Vars
        * @method remove
        * @param path {string} Nombre de la variable a eliminar
        * @description Elimina una variable del framework.
    */
    remove: function (path) {
        sessionStorage.removeItem(path);
        localStorage.removeItem(path);
    },
};



var SSUtil = {

     getBankLogo:function(){
        var entity = Vars.get("entidad"); 
        return entity; 
    },
    getBankColor: function() {
        var bank = this.getBankLogo();

        switch (bank) {
            case "bersa":
                color = "#8B0000"; 
                break;
            case "santacruz":
                color = "#0047AB"; 
                break;
            case "sanjuan":
                color = "#FFC107"; 
                break;
            default:
                color = "#8B0000"; 
        }

        return color;
    },
    getLogoPatch: function (isDarkColor){
        var bank = this.getBankLogo();
        var logo = "";
        switch (bank) {
            case "bersa":
                    logo = isDarkColor ? "/images/logo_bersa_dark.svg" : "/images/logo_bersa_white.svg";
                    break;
            case "santacruz":
                   logo = isDarkColor ? "/images/logo_santacruz_dark.svg" : "/images/logo_santacruz_white.svg";
                  break;
            case "sanjuan": 
                   logo= isDarkColor? "/images/bsj-full-logo-darker.svg": "/images/logo_sanjuan_white.svg";
                   break;
            default:
                return logo;
        } 
        return logo;
    },
    
    run: function(callback) {
        try {
            callback();
        } catch (ex) {
            console.log(ex.message);
            throw ex;
        }
    },

    isDef: function(val) {
        if (typeof (val != 'undefined') && val != null && val != "")
            return true;
        return false;
    },

    getObjValue: function(obj, field) {
        if(obj.hasOwnProperty(field))
            return obj[field].toString();
        return "";
    },

    toHex: function(str) {
        var result = "";
        for (var c = 0; c < str.length; c++) {
            if (str[c] == "#") {
                result += str.slice(c + 1, c + 3);
                c += 2;
            } else {
                result += ("00" + str.charCodeAt(c).toString(16)).slice(-2);
            }
        }
        return result.toUpperCase();
    },

    readCSS: function (cls, attribute) {
        if (this.isDef(attribute) == false)
            attribute = "content";
        var $div = $("<div class='"+cls+"'></div>").hide().appendTo("body");
        var ret = $div.css(attribute);
        ret = ret.replace(/'/g, "");
        ret = ret.replace(/"/g, "");
        $div.remove();
        return ret;
    },

    getLocal: function (key, def) {
        if (localStorage[key] == null)
            return def;
        return JSON.parse(localStorage[key]);
    },

    setLocal: function(key, value) {
        localStorage[key] = JSON.stringify(value);
    },

    setApplicationState: function (appname, value) {
        var app = appname + "_status";
        this.setLocal(app, value);
        setRegistry(app, value);
    },

    getApplicationState: function (appname) {
        var app = appname + "_status";
        return this.getLocal(app);
    },
    
    setSetting: function (name, value) {
        return this.setLocal("settings." + name, value);
    },

    getSetting: function (name, def) {
        var key = "settings." + name;
        return this.getLocal(key, def);
    },
    
    getValue: function(value, def) {
        if (value == null || typeof (value) == 'undefined' || value == "")
            return def;
        return value;
    },

    storeLocalConfig: function (serverconfig) {

        if (serverconfig == null || serverconfig == "") {
            serverconfig = {};
        } else {
            SSUtil.setLocal("config.server", serverconfig);
        }
        
        if (serverconfig.hasOwnProperty("ConfigurationVideo")) {
            SSUtil.setLocal("ConfigurationVideo", serverconfig.ConfigurationVideo);
            //setRegistry("video", serverconfig.ConfigurationVideo);
        }

        if (serverconfig.hasOwnProperty("Update_Folder")) {
            //SSUtil.setLocal("Update_Folder", serverconfig.Update_Folder);
            setRegistry("Update_Folder", serverconfig.Update_Folder);
        }

        if (serverconfig.hasOwnProperty("Update_UserName")) {
            //SSUtil.setLocal("Update_UserName", serverconfig.Update_UserName);
            setRegistry("Update_UserName", serverconfig.Update_UserName);
        }

        if (serverconfig.hasOwnProperty("Update_UserPassword")) {
            //SSUtil.setLocal("Update_UserPassword", serverconfig.Update_UserPassword);
            setRegistry("Update_UserPassword", serverconfig.Update_UserPassword);
        }

        if (serverconfig.hasOwnProperty("Audit_Folder")) {
            //SSUtil.setLocal("Audit_Folder", serverconfig.Audit_Folder);
            setRegistry("Audit_Folder", serverconfig.Audit_Folder);
        }

        if (serverconfig.hasOwnProperty("Audit_UserName")) {
            //SSUtil.setLocal("Audit_UserName", serverconfig.Audit_UserName);
            setRegistry("Audit_UserName", serverconfig.Audit_UserName);
        }

        if (serverconfig.hasOwnProperty("Audit_UserPassword")) {
            //SSUtil.setLocal("Audit_UserPassword", serverconfig.Audit_UserPassword);
            setRegistry("Audit_UserPassword", serverconfig.Audit_UserPassword);
        }

        if (serverconfig.hasOwnProperty("ConfigurationTimeout")) {
            SSUtil.setLocal("ConfigurationTimeout", serverconfig.ConfigurationTimeout);
            if (parseInt(serverconfig.ConfigurationTimeout) > 0) {
                SSFramework.timeout_secs = parseInt(serverconfig.ConfigurationTimeout);
            }
        }

        if (serverconfig.hasOwnProperty("TerminalSupervisorPassword"))
            SSUtil.setLocal("TerminalSupervisorPassword", serverconfig.TerminalSupervisorPassword);
        
        return readRegistry("IPESB")

        .then(function (val) {
            SSUtil.setLocal("IPESB", val);
            return readRegistry("ConfigServer");
        })

        .then(function (val) {
            SSUtil.setLocal("ConfigServer", val);
            return readRegistry("sup");
        })
            
        .then(function (val) {
            SSUtil.setLocal("sup", val);
            return readRegistry("AppVersion");
        })

        .then(function (val) {
            SSUtil.setLocal("AppVersion", val);
            return readRegistry("TerminalName");
        })

        .then(function (val) {
            SSUtil.setLocal("TerminalName", val);
            return readRegistry("ESB");
        })
            
        .then(function (val) {
            SSUtil.setLocal("ESB", val);
            return readRegistry("Entity");
        })

        .then(function (val) {
            SSUtil.setLocal("Entity", val);
            return readRegistry("Keyhash");
        })
                    
        .then(function (val) {
            SSUtil.setLocal("Keyhash", val);
        })

    },

        
    getStoredConfig: function () {
        try {
            return JSON.parse(this.getLocal("config.server", {}));
        } catch (ex) {
            return this.getLocal("config.server", {});
        }
    },


    findChild: function (o, func) {
        for (var i in o) {
            if (func.apply(this, [i, o[i]]))
                return o[i];

            if (o[i] !== null && typeof (o[i]) == "object") {
                return this.findChild(o[i], func);
            }
        }
    },


    setObj: function (path, value, root) {
        var segments = path.split('.'),
            cursor = root || window,
            segment,
            i;

        for (i = 0; i < segments.length - 1; ++i) {
            segment = segments[i];
            cursor = cursor[segment] = cursor[segment] || {};
        }
        cursor[segments[i]] = value;
        return root;
    },

    getObj: function (path, root, def) {
        var segments = path.split('.'),
            cursor = root || window,
            segment,
            i;

        for (i = 0; i < segments.length; ++i) {
            segment = segments[i];
            if (!cursor.hasOwnProperty(segment))
                return def;
            cursor = cursor[segment];
        }
        return cursor;
    },

    QueryString : function () {
        // This function is anonymous, is executed immediately and 
        // the return value is assigned to QueryString!
        var query_string = {};
        var query = window.location.search.substring(1);
        var vars = query.split("&");
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split("=");
            // If first entry with this name
            if (typeof query_string[pair[0]] === "undefined") {
                query_string[pair[0]] = pair[1];
                // If second entry with this name
            } else if (typeof query_string[pair[0]] === "string") {
                var arr = [query_string[pair[0]], pair[1]];
                query_string[pair[0]] = arr;
                // If third or later entry with this name
            } else {
                query_string[pair[0]].push(pair[1]);
            }
        }
        return query_string;
    }(),

    getHost: function() {
        var http = location.protocol;
        var slashes = http.concat("//");
        var host = slashes.concat(window.location.hostname);
        if (location.port)
            host += ":" + location.port;
        return host;
    },

    toBool: function (value) {
        if (typeof value == 'undefined')
            return false;
        if (value == null || value == 0 || parseInt(value) == 0 || ("" + value) == "false")
            return false;
        return true;
    },

    intAsFloat: function (number, decimal) {
        if (typeof decimal == 'undefined')
            decimal = 2;
        var div = Math.pow(10, parseInt(decimal, 10));
        var num = parseFloat(number);
        return (num / div).toFixed(2);
    },


    formatNumber: function (number, decimal) {
        var num = new NumberFormat();
        num.setInputDecimal('.');
        num.setNumber(number);
        if (this.toBool(decimal))
            num.setPlaces("" + decimal, true);
        else
            num.setPlaces('0', true);
        num.setCurrency(false);
        num.setSeparators(true, '.', ',');
        return num.toFormatted();
    },


    pad: function (str, padstr, len, dir) {
        var filler = "";
        if (!dir)
            dir = 1;
        str = str.toString();
        while (filler.length < len - str.length)
            filler += padstr;
        if (dir == 1) {
            return (filler + str).slice(-len);
        }
        return (str + filler).slice(0, len);
    },

    
    obtieneDetalle: function (noteid) {
        var arr = States.getStoredValue("CimNoteTypes");
        for (var c = 0; c < arr.length; c++) {
            if (noteid == arr[c].usNoteID) {
                return arr[c].ulValues;
            }
        }
        return null;
    }

}


var SSFramework = {

    timeout_secs: 30,

    applyStyle: function (newstyle) {
        var appstyle = document.getElementById('appstyle');
        if(appstyle.current_style!=newstyle) {
            appstyle.setAttribute('href', '/style/' + newstyle + '.css');
            appstyle.current_style = newstyle;
            console.log("style: " + newstyle);
            return true;
        }
        return false;
    },

    changeStyle: function (newstyle) {
        if (typeof newstyle == 'undefined') {
            newstyle = SSUtil.getSetting("style");
        }
        if (typeof newstyle != 'undefined') {
            SSUtil.setSetting("style", newstyle);
            return this.applyStyle(newstyle);            
        }
        return false;
    },

    last_audio: {},

    playAudio: function (file) {
        try {
            //hacer el cache por filename
            if (this.last_audio[file] == null) {
                this.last_audio[file] = new Audio();
                this.last_audio[file].src = "/audio/" + file;
                this.last_audio[file].play();
            } else {
                this.last_audio[file].currentTime = 0;
                this.last_audio[file].play();
            }        
        } catch (ex) { }
    },


    grabResource: function (resource, obj, cb) {
        return new Promise(function(resolve, reject) {
            $.ajax("/" + resource, {
                data: JSON.stringify(obj),
                type: 'POST',
                contentType: 'application/json',
                success: function (data) {
                    resolve(data);
                },
                error: function (err) {
                    reject(err);
                }
            });
        });
    },

    grabResourceGet: function (resource, name) {
        return new Promise(function(resolve, reject) {
            $.ajax("/"+resource+"?name=" + name, {
                type: 'GET',
                success: function (data) {
                    resolve(data);
                },
                error: function (err) {
                    reject(err);
                }
            });
        });
    },

    last_screen_data: null,

    buildReceipt: function(data) {

        ///actualizo el recibo
        if (data["update"]) {
            data.receipt = data["update"](data);
        }

        console.log("[[" + JSON.stringify(data) + "]]");

        return SSFramework.grabResource("receipt?name=" + data.name, data)        
        
        .then(function (data) {
            return JSON.parse(data);
        });
    },

    fireTimeout: function() {
        States.storeNamedValue("temp.timeout_state", States.CurrentState);
        States.storeNamedValue("temp.params", JSON.stringify(States.CurrentStateData.params));
        if (States.CurrentStateData.events.hasOwnProperty("timeout")) {
            States.handleEvent("timeout");
        };
        
    },

    id_timeout: 0,

    abortTimeout: function () {
        if (this.id_timeout != 0) {
            window.clearTimeout(this.id_timeout);
            this.id_timeout = 0;
        }
    },

    initTimeout: function () {
        this.abortTimeout();
        window.clearTimeout(this.id_timeout);
        if (States.CurrentStateData.events.hasOwnProperty("timeout")) {
            this.id_timeout = window.setTimeout(function () {
                SSFramework.fireTimeout();
            }, parseInt(this.timeout_secs) * 1000);
        }
    },

    displayScreen: function (data, screen_number, screen_group, screen_data, fields) {
        if (typeof data == "string") {
            console.log("Display Screen " + data);
            data = States.CurrentStateData.screens[data];
        }
        if (data == undefined){
            console.log("state: Try to display undefined screen");
            return;
        }
        States.CurrentScreen = data;
        States.fireCustomEvent("display_screen");
        
        ///borro los event handlers
        $(document).off();
        //$("#MainPanel *").children().off();

        ///actualizo la pantalla
        if (data["update"]) {
            data["update"](data, screen_number, screen_group, screen_data, fields);
        }

        var screen_data = null;
        var main_panel = $("#MainPanel");
        return SSFramework.grabResource("screen", data)
        
        .then(function (screen_datap) {
            //SSFramework.stopAudio();

            if (States.CurrentStateData.hasOwnProperty("properties") == false)
                States.CurrentStateData.properties = {};

            screen_datap = new EJS({ text: screen_datap }).render(States.CurrentStateData.properties);
            //console.log(screen_datap);
            ///check if style needs to be updated
            var main_panel = $("#MainPanel");

            SSFramework.last_screen_data = data;
            screen_data = screen_datap;
            //VG.init(screen_data);
            var style_updated = SSFramework.changeStyle();
            if (style_updated==false) {
                main_panel.tween(TweenHelpers.tweenOpacity(main_panel, true, 0, 0.1)).play();
            } else {
                main_panel.html("");
            }
            return Promise.delay(100);
        })
            
        .then(function () {            

            var screen_panel = $("#ScreenPanel");
            screen_panel.html("<div id='MainPanel'>" + screen_data + "</div>");
            $.play();
            SSFramework.initTimeout();
            return screen_data;       
        });
    },

    centerInDiv: function (jquerystring) {
        $.each($(jquerystring), function (index, value) {
            $(value).html("<table class='full'><tr class='full'><td class='full'>" + $(value).html() + "</td></tr></table>");
        });
    },

    callESB: function (args, url) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var esb = "https://localhost:8243/services/TransformTransaction";
            if (typeof url != 'undefined' && url!=null)
                esb = url;

            console.log(esb);
            var strargs = JSON.stringify(args);
            States.storeNamedValue("trx_timeout", false);
            $.ajax({
                type: "POST",
                contentType: "application/json; charset=utf-8",
                url: esb,
                data: strargs,
                timeout: 10000,
                dataType: "json",
                success: function (data) {
                    resolve(data);
                },
                error: function (xhr, opt, error) {
                    if (opt === "timeout") {
                        States.storeNamedValue("trx_timeout", true);
                    }
                    reject(xhr);
                }
            });
        });
    },

    initApp: function () {
        var run_state = States.CurrentState;
        if (run_state == null)
            run_state = SSUtil.QueryString.name;
        SSFramework.changeStyle(); //fix
        return States.runState(run_state);
    }
}


var States = {

    ///stores temporary data for state execution
    TempStateData: {},

    StateStack: [],

    PreviousState: null,

    CurrentState: null,

    CurrentStateData: null,
    
    setProperty: function (name, value) {
        if (this.CurrentStateData == null)
            this.CurrentStateData = {};
        if (this.CurrentStateData.hasOwnProperty("properties") == false)
            this.CurrentStateData.properties = {};
        this.CurrentStateData.properties[name] = value;
    },

    getProperty: function (name, def) {
        if (typeof def === 'undefined') 
            def = null;
        return SSUtil.getObj("properties."+name, this.CurrentStateData, def);
    },


    storeNamedValue: function (name, value) {
        if (value == null)
            sessionStorage.removeItem(name);
        else {
            if (typeof value === 'object') {
                sessionStorage[name] = JSON.stringify(value);
            } else {
                sessionStorage[name] = value;
            }
        }
    },

    
    storeValue: function(value) {
        var name = this.getProperty("storename");        
        if (name != null) {
            this.storeNamedValue(name, value);
            var fun = this.getProperty("storeCallback");
            if (fun != null) {
                value = fun(value);
            }
            this.storeNamedValue(name, value);            
        } else {
            console.log("not found storename in " + this.CurrentState);
        }
    },

    getStoredValue: function (key, def) {
        if (sessionStorage[key]) {
            var res = sessionStorage[key];
            try {
                return JSON.parse(res);
            } catch (ex) {
                return res;
            }
        }
        if (typeof def == 'undefined')
            return null;
        return def;
    },

    getSequencialNumber: function(key, add) {
        if(typeof add=='undefined')
            add = false;

        var num = SSUtil.getLocal(key, 0);

        if (add) {
            num++;
            if (num > 99999)
                num = 1;

            //var getCurrentDay = function () {
            //    return new Date().getDay();
            //}
            new Date().getDay(); //para que chrome se actualice. 
            var seq = SSUtil.getLocal("last_sequential_reset", -1);
            var today = new Date().getDay();
            if (seq != today) {
                if (seq != -1) {
                    num = 1;
                }
                SSUtil.setLocal("last_sequential_reset", today);
                setRegistry("last_sequential_reset", today);
            }
        }

        SSUtil.setLocal(key, num);
        setRegistry(key, num);
        console.log("numtrx: " + num);
        return num;
    },

    getSequencialChequeNumber: function(key, add) {
        if(typeof add=='undefined')
            add = false;

        var num = SSUtil.getLocal(key, 0);

        if (add) {
            num++;
            if (num > 999999) {
                num = 1;
            }
        }
        
        var numero = ("000000" + num).slice(-6);
        SSUtil.setLocal(key, numero);
        setRegistry(key, numero);
        console.log(key + ": " + numero);
        return numero;
    },

    getSequencialChequeCloseNumber: function(key, add) {
        if(typeof add=='undefined')
            add = false;

        var num = SSUtil.getLocal(key, 100000);

        if (add) {
            num++;
            if ((num < 100000) || (num > 999999)) {
                num = 100000;
            }
        }
        
        var numero = ("000000" + num).slice(-6);
        SSUtil.setLocal(key, numero);
        setRegistry(key, numero);
        console.log(key + ": " + numero);
        return numero;
    },


        handleEvent: function (eventargs, param) {
        try {
            if (this.ignore_events)
                return; //new state loading... ignore previous events.

            var event_name = "";
            var event_obj = "";

            if (typeof eventargs == 'string') {
                event_name = eventargs;
                event_obj = eventargs;
            }
            else {
                event_name = eventargs.attr("id");
                if (eventargs.data()["event"]) {
                    event_name = eventargs.data()["event"];
                    event_obj = eventargs.data();
                }
            }


            console.log('event: ' + event_name);

            var obj = this.CurrentStateData.events[event_name];
            try{OnlyView.handleEvent(event_name)}catch(e){}
            if (!obj || obj=="return") {
                for (var c = this.StateStack.length - 1; c >= 0; c--) {
                    if (this.StateStack[c].events && this.StateStack[c].events[event_name]) {
                        obj = this.StateStack[c].events[event_name];
                        this.StateStack = this.StateStack.slice(0, c);
                        break;
                    }
                }
                /*if (!obj){
                    obj = this.DefaultStateData.events[event_name];
                }*/

            }


            if (obj && obj != "return") {
                var params = null;
                var ret = obj;
                if (typeof obj == "function"){ 
                    ret = obj(eventargs, param);
                }
                if (typeof obj == "object") {
                    if (obj.call) {
                        ret = obj.call;
                        params = obj.params;
                        this.StateStack.push(obj);
                    }
                }

                if(ret){
                    this.runState(ret, params, event_obj);
                }
                return true;
            } 

            return false;
        } catch(e) {
            console.error(e);
            return false;
        }
    },

    custom_events: {},

    registerCustomEvent: function (event_name, handler) {
        if (this.custom_events.hasOwnProperty(event_name) == false) {
            this.custom_events[event_name] = [];            
        }
        this.custom_events[event_name].push(handler);
    },

    fireCustomEvent: function (event_name, eventargs) {
        if (this.custom_events.hasOwnProperty(event_name)) {
            if (typeof eventargs == "undefined")
                eventargs = null;
            for (var c = 0; c < this.custom_events[event_name].length; c++) {
                var handler = this.custom_events[event_name][c];
                if (handler != null) {                    
                    handler(eventargs);
                }
            };
        }
        return false;
    },

    handleGUIEvent: function (event_name, eventargs) {
        var obj = this.getProperty(event_name);
        if (obj) {
            if (typeof obj == "function") {
                return obj(eventargs);
            } else {
                return obj; ///string
            }
        }
        return eventargs; //no tenia el handler para manejarlo
    },

    getState: function (name) {
        return new Promise(function (resolve, reject) {
            var app = Vars.get("app");
            var url = "/state?name=" + name;
            if (app != null)
                url += "&app=" + app;
            $.ajax(url, {
                type: 'GET',
                dataType: "text",
                error: reject,
                success: function (data) {
                    var ret = JSON.parse(data, function (key, value) {
                        if (value
                                 && typeof value === "string"
                                 && value.substr(0, 8) == "function") {
                            var startBody = value.indexOf('{') + 1;
                            var endBody = value.lastIndexOf('}');
                            var startArgs = value.indexOf('(') + 1;
                            var endArgs = value.indexOf(')');

                            return new Function(value.substring(startArgs, endArgs)
                                              , value.substring(startBody, endBody));
                        }
                        return value;
                    });

                    resolve(ret);
                }
            });
        });
    },


    refreshState: function () {
        return this.runState(States.CurrentState, States.CurrentStateData.params);
    },


    repeatState: function () {
        return this.runState(States.CurrentState, States.CurrentStateData.params);
    },


    handleStateError: function (ex, event) {
        console.log(ex);
        console.log(ex.stack);
        if (event) {
            States.handleEvent(event);
        }
    },

    ignore_events: false,
    
    runStateType: function (type) {
        var fun = null;
        if (typeof type == 'function') {
            fun = type;
        } else
            fun = States.StateTypes[type];
        if (fun ) {
            if (States.CurrentStateData.hasOwnProperty("run")) {
                return new Promise(function (resolve, reject) {
                    var ret = States.CurrentStateData.run(States.CurrentStateData);
                    resolve(ret);
                    return ret;
                })
                .then(function (res) {
                    if (res != false)
                        fun(States.CurrentStateData);
                })
                .catch(function (ex) {
                    console.log("run: " + ex);
                    fun(States.CurrentStateData);
                });
            } else {
                fun(States.CurrentStateData);
            } 
        } else {
            console.log("invalid state type: " + type);
        }
    },

    updateTheme: function(state) {
        var body = document.body;
    
        if (state === "p/menu_principal" || state === "p/menu_principal_no_cliente"|| state === "p/identificacion_start" || 
            state === "p/status_inservice" || state === "p/check_printer") {
            body.classList.add("theme-dark");
            body.classList.remove("theme-white");
        } else {
            body.classList.add("theme-white");
            body.classList.remove("theme-dark");
        }
    },

runState: function (name, params, eventargs) {

        $("#state").html(name);
        var _this = this;
        SSFramework.abortTimeout();
        _this.ignore_events = true;
        console.log("running state: " + name);
        var exitobj = { state: States.CurrentState };
        if(typeof eventargs!='undefined') 
            exitobj.event = eventargs;
        this.fireCustomEvent("state_exit", exitobj);
        
        States.PreviousState     = States.CurrentState;
        States.PreviousStateData = States.CurrentStateData;
        return this.getState(name)
        .then(function (result) {
            _this.custom_events = {};
            _this.components_custom_events = {};

            States.CurrentState = name;
           
            States.CurrentStateData = result;
            try{
                                OnlyView.checkState();
            }catch(e){}
            setTimeout(function () {
                _this.updateTheme(name);
            }, 0);
            if (!States.CurrentStateData.hasOwnProperty('screens'))
                States.CurrentStateData.screens = {};
            if (params) {
                States.CurrentStateData.params = params;
                if (!States.CurrentStateData.hasOwnProperty('properties'))
                    States.CurrentStateData.properties = {};
                for (var p in params) {
                    States.CurrentStateData.properties[p] = params[p];
                }
            }
            var storename = States.getProperty("storename", null);
            if (storename != null) {
                Vars.set(storename, null);
            }
            _this.ignore_events = false;
            _this.fireCustomEvent("state_entry", { state: States.CurrentState });
            _this.runStateType(States.CurrentStateData["type"]);      

        })

        .caught(function () {
            _this.ignore_events = false;
        })
        .catch(function(e){
            Logger.error("Error in runState:  " + e);
            console.log(States.CurrentState)
            console.log(Config.defaultState)
            if ( States.CurrentState == Config.defaultState)
                return;
            States.CurrentState     = States.PreviousState;
            States.CurrentStateData = States.PreviousStateData;
            States.handleEvent("unhandle_error");
        });
    },

    StateTypes: {

        ///catches events not handled by a sub state.
        Director: function(statedata) {
            StateStack.push(States.CurrentStateData);
            States.runState(statedata.properties.next);
        },

        ///runs the logic of the screen components.
        General: function (statedata) {
            SSFramework.displayScreen(statedata.screens.default);
        },

        ///runs the logic of the screen components.
        Custom: function (statedata) {
        },

        ///releases all resources and tries to go back to normal
        Close: function (statedata) {
            
            States.StateStack = []; ///skip all directors

            var idc = new XFSDevice("idc");
            var _this = this;

            /*try { //JIC
                var dep = new XFSDevice("dep");
                dep.execute("WFS_CMD_DEP_RETRACT");
            } catch (ex) { };*/

            idc.getInfo("WFS_INF_IDC_STATUS")

            .then(function (res) {

                if (res.lpBuffer.fwMedia == 1) {

                    SSFramework.displayScreen(statedata.screens.idc_card_eject);

                    idc.setCallback(function (msg) {
                        if (msg.commandDesc == "WFS_SRVE_IDC_MEDIAREMOVED") {
                            console.log("card taken");
                            States.handleEvent("card_complete");
                        }
                    });

                    return idc.execute("WFS_CMD_IDC_EJECT_CARD");
                } else {

                    console.log("no card");
                    States.handleEvent("card_complete");
                    return "no_card";
                }
            })

            .then(function (data) {
                if (data == "no_card")
                    return true;

                if (data.hasOwnProperty("hResult") && data.hResult == 0) {
                } else {
                    console.log("eject error");
                    States.handleEvent("card_complete");
                }

            })

            .finally(function () {
                sessionStorage.clear(); //Naranja
            })
                
            .catch(function (ex) {
                console.log(ex.stack);
            });
        },

        ///sends a transaction request to the server
        Comms: function (statedata) {

            if (States.getProperty("hidescreen")!=true)
                SSFramework.displayScreen(statedata.screens.default);

            States.storeNamedValue("comms.error", null);

            var postobj = {};
            postobj.trx = States.getProperty("trx");
            for (var c = 0; c < sessionStorage.length; c++) {
                var k = sessionStorage.key(c);
                if (k && k.indexOf(".")==-1) {
                    try {
                        postobj[k] = JSON.parse(sessionStorage[k]);
                    } catch (ex) {
                        postobj[k] = sessionStorage[k];
                    }
                }
            }

            //todo: load from config
            var config = SSUtil.getStoredConfig();
            postobj.protocol = SSUtil.getValue(config.ConfigurationProtocol, "petersen");
            postobj.auth = SSUtil.getValue(config.ConfigurationAuthorizer, "petersen");
            postobj.branch = SSUtil.getValue(config.BranchNumber, "1");
            postobj.machine = SSUtil.getLocal("TerminalName", "");
            postobj.debug = SSUtil.getValue(config.TerminalDebug, "1");
            postobj.testcase = SSUtil.getValue(config.TerminalTestCase, "case0");

            var reqfun = States.getProperty("requestHandler");
            if (reqfun)
                reqfun(postobj);
                        
            postobj.numtrx = States.getSequencialNumber("config.numtrx", postobj.repeat_trx!=true);
            
            States.storeNamedValue("comms.last_esb_request", postobj)
            //Valor de mensaje Payload completo
            console.log("Valor de mensaje comms de request completo: " + JSON.stringify(postobj));


            var esb = SSUtil.getLocal("ESB", null);
            esb = esb.replace("[IPESB]", SSUtil.getLocal("IPESB"));

            SSFramework.callESB(postobj, esb)

            .then(function (data) {

                var general_handler = States.getProperty("generalResponseHandler");
                var fun = States.getProperty("responseHandler");
                var msg = data;

                if (general_handler) {
                    msg = general_handler(msg);
                }

                if (msg!=null && fun && !msg.hasOwnProperty("commserror")) {
                    msg = fun(msg);
                }

                if (msg == null) {
                    if (data != null) {
                        States.storeNamedValue("comms.last_esb_reply", JSON.stringify(data));
                        States.storeValue(JSON.stringify(data));
                    }
                    States.handleEvent("comms_error")
                } else {

                    States.storeNamedValue("comms.last_esb_reply", JSON.stringify(msg));
                    //Valor de mensaje de respuesta completo
                    console.log("Valor de mensaje comms de respuesta completo: " + JSON.stringify(msg));

                    if (States.getProperty("storename", null) != null)
                        States.storeValue(JSON.stringify(msg));

                    if (msg.hasOwnProperty("commserror")) {
                        console.log("comms: " + msg.commserror);
                        if (States.handleEvent(msg.commserror) == false) {
                            States.handleEvent("comms_general_error")
                        }

                    } else {
                        States.handleEvent("comms_ok");
                    }

                }
            })

            .catch(function (ex) {
                console.log(JSON.stringify(ex));
                States.handleEvent("comms_error");
            });
        },

        CimCashIn: function(statedata) {
            var cim = new XFSDevice("cim");
            var _this = this;
            SSFramework.displayScreen(statedata.screens.espera)  
            .then(function () {
                cim.setCallback(function (eventos) {
                    States.handleEvent("CimCashIn_" + eventos.commandDesc);
                    switch (eventos.commandDesc) {
                        case "WFS_EXEE_CIM_CASHUNITERROR":
                            break;
                        case "WFS_EXEE_CIM_INPUT_P6":
                            break;
                        case "WFS_EXEE_CIM_INPUTREFUSE":
                            break;
                        case "WFS_EXEE_CIM_NOTEERROR": //Never returned
                            break;
                        case "WFS_EXEE_CIM_SUBCASHIN": //Never returned
                            break;
                        case "WFS_SRVE_CIM_ITEMSINSERTED":
                            SSFramework.displayScreen(statedata.screens.espera);
                            break;
                        case "WFS_SRVE_CIM_ITEMSTAKEN":
                            SSFramework.displayScreen(statedata.screens.espera);
                            break;
                        case "WFS_SRVE_CIM_ITEMSPRESENTED":
                            SSFramework.displayScreen(statedata.screens.retire_billetes);
                            break;
                        case "WFS_EXEE_CIM_INFO_AVAILABLE":
                            break;
                        case "WFS_EXEE_CIM_INSERTITEMS":
                            SSFramework.displayScreen(statedata.screens.ingrese_billetes);
                            break;
                        default:       
                            break;
                    }
                });
                return cim.execute("WFS_CMD_CIM_CASH_IN"); 
            })
            .then(function (result) {
                switch (result.hResult) {
                    case 0:
                        States.storeNamedValue("deposito_operacion", result.lpBuffer);
                        var arrbilletes = States.getStoredValue("deposito_operacion").lppNoteNumber;
                        var mount = 0;
                        for (var c = 0; c < arrbilletes.length; c++) {
                            mount += SSUtil.obtieneDetalle(arrbilletes[c].usNoteID) * arrbilletes[c].ulCount;
                        }
                        States.storeNamedValue("monto_operacion", mount + States.getStoredValue("monto_operacion"));
                        States.handleEvent("CimCashIn_OK");
                        break;
                    case -48:
                        States.handleEvent("CimCashIn_Timeout");
                        break;
                    case -4:
                        States.handleEvent("CimCashIn_Cancel");
                        break;
                    default:
                        if (result.hResultDesc.len > 0) {
                            States.handleEvent("CimCashIn_" + result.hResultDesc);
                        }
                        States.handleEvent("CimCashIn_Error");
                        break;
                }
            })
            .catch(function (ex) {
                States.handleStateError(ex, "CimCashIn_Hardware_Error");
            });
        },

        CimCashInEnd: function(statedata) {
            var cim = new XFSDevice("cim");
            var _this = this;
            SSFramework.displayScreen(statedata.screens.espera)
            .then(function () {
                cim.setCallback(function (eventos) {
                    States.handleEvent("CimCashInEnd_" + eventos.commandDesc);
                    switch (eventos.commandDesc) {
                        case "WFS_USRE_CIM_CASHUNITTHRESHOLD":
                            break;
                        case "WFS_SRVE_CIM_CASHUNITINFOCHANGED":
                            break;
                        case "WFS_EXEE_CIM_CASHUNITERROR":
                            break;
                        case "WFS_EXEE_CIM_INPUT_P6":
                            break;
                        case "WFS_EXEE_CIM_INFO_AVAILABLE":
                            break;
                        case "WFS_EXEE_CIM_NOTEERROR": //Never Returned
                            break;
                        default:
                            break;
                    }
                });
                return cim.execute("WFS_CMD_CIM_CASH_IN_END");
            })
            .then(function (result) {
                switch (result.hResult) {
                    case 0:
                        States.handleEvent("CimCashInEnd_OK");
                        break;
                    case -48:
                        States.handleEvent("CimCashInEnd_Timeout");
                        break;
                    case -4:
                        States.handleEvent("CimCashInEnd_Cancel");
                        break;
                    default:
                        if (result.hResultDesc.len > 0) {
                            States.handleEvent("CimCashInEnd_" + result.hResultDesc);
                        }
                        States.handleEvent("CimCashInEnd_Error");
                        break;
                }
            })
            .catch(function (ex) {
                States.handleStateError(ex, "CimCashInEnd_Hardware_Error");
            });
        },

        CimRetract: function(statedata) {
            var cim = new XFSDevice("cim");
            var _this = this;
            SSFramework.displayScreen(statedata.screens.espera)
            .then(function () {
                cim.setCallback(function (eventos) {
                    States.handleEvent("CimRetract_" + eventos.commandDesc);
                    switch (eventos.commandDesc) {
                        case "WFS_USRE_CIM_CASHUNITTHRESHOLD":
                            break;
                        case "WFS_EXEE_CIM_CASHUNITERROR":
                            break;
                        case "WFS_EXEE_CIM_NOTEERROR": //Never Returned
                            break;
                        case "WFS_EXEE_CIM_INPUT_P6":
                            break;
                        case "WFS_SRVE_CIM_ITEMSTAKEN":
                            break;
                        case "WFS_EXEE_CIM_INFO_AVAILABLE":
                            break;
                        default:
                            break;
                    }
                });
                return cim.execute("WFS_CMD_CIM_RETRACT");
            })
            .then(function (result) {
                switch (result.hResult) {
                    case 0:
                        States.handleEvent("CimRetract_OK");
                        break;
                    case -48:
                        States.handleEvent("CimRetract_Timeout");
                        break;
                    case -4:
                        States.handleEvent("CimRetract_Cancel");
                        break;
                    case -1316:
                        States.handleEvent("CimRetract_WFS_ERR_CIM_NOITEMS");
                        break;
                    default:
                        if (result.hResultDesc.len > 0) {
                            States.handleEvent("CimRetract_" + result.hResultDesc);
                        }
                        States.handleEvent("CimRetract_Error");
                        break;
                }
            })
            .catch(function (ex) {
                States.handleStateError(ex, "CimRetract_Hardware_Error");
            });
        },

        CimReset: function (statedata) {
            var cim = new XFSDevice("cim");
            var _this = this;
            SSFramework.displayScreen(statedata.screens.espera)
            .then(function () {
                cim.setCallback(function (eventos) {
                    States.handleEvent("CimReset_" + eventos.commandDesc);
                    switch (eventos.commandDesc) {
                        case "WFS_USRE_CIM_CASHUNITTHRESHOLD":
                            break;
                        case "WFS_EXEE_CIM_CASHUNITERROR":
                            break;
                        case "WFS_SRVE_CIM_MEDIADETECTED":
                            break;
                        case "WFS_EXEE_CIM_INPUT_P6":
                            break;
                        case "WFS_SRVE_CIM_ITEMSTAKEN":
                            break;
                        case "WFS_EXEE_CIM_INFO_AVAILABLE":
                            break;
                        default:
                            break;
                    }
                });
                return cim.execute("WFS_CMD_CIM_RESET");
            })
            .then(function (result) {
                switch (result.hResult) {
                    case 0:
                        States.handleEvent("CimReset_OK");
                        break;
                    case -48:
                        States.handleEvent("CimReset_Timeout");
                        break;
                    case -4:
                        States.handleEvent("CimReset_Cancel");
                        break;
                    default:
                        if (result.hResultDesc.len > 0) {
                            States.handleEvent("CimReset_" + result.hResultDesc);
                        }
                        States.handleEvent("CimReset_Error");
                        break;
                }
            })
            .catch(function (ex) {
                States.handleStateError(ex, "CimReset_Hardware_Error");
            });
        },

        CimRollback: function (statedata) {
            var cim = new XFSDevice("cim");
            var _this = this;
            SSFramework.displayScreen(statedata.screens.espera)
            .then(function () {
                cim.setCallback(function (eventos) {
                    States.handleEvent("CimRollback_" + eventos.commandDesc);
                    switch (eventos.commandDesc) {
                        case "WFS_EXEE_CIM_CASHUNITERROR":
                            break;
                        case "WFS_SRVE_CIM_ITEMSTAKEN":
                            SSFramework.displayScreen(statedata.screens.espera);
                            break;
                        case "WFS_SRVE_CIM_ITEMSPRESENTED":
                            SSFramework.displayScreen(statedata.screens.retire_billetes);
                            break;
                        case "WFS_EXEE_CIM_INPUT_P6":
                            break;
                        case "WFS_EXEE_CIM_INFO_AVAILABLE":
                            break;                         
                        default:
                            break;
                    }
                });
                return cim.execute("WFS_CMD_CIM_CASH_IN_ROLLBACK");
            })
            .then(function (result) {
                switch (result.hResult) {
                    case 0:
                        States.handleEvent("CimRollback_OK");
                        break;
                    case -48:
                        States.handleEvent("CimRollback_Timeout");
                        break;
                    case -4:
                        States.handleEvent("CimRollback_Cancel");
                        break;
                    case -1316:
                        States.handleEvent("CimRollback_WFS_ERR_CIM_NOITEMS");
                        break;
                    default:
                        if (result.hResultDesc.len > 0) {
                            States.handleEvent("CimRollback_" + result.hResultDesc);
                        }
                        States.handleEvent("CimRollback_Error");
                        break;
                }
            })
            .catch(function (ex) {
                States.handleStateError(ex, "CimRollback_Hardware_Error");
            });
        },

        CimStartExchange: function (statedata) {
            var cim = new XFSDevice("cim");
            var _this = this;
            SSFramework.displayScreen(statedata.screens.espera)
            .then(function () {
                cim.setCallback(function (eventos) {
                    States.handleEvent("CimStartExchange_" + eventos.commandDesc);
                    switch (eventos.commandDesc) {
                        case "WFS_EXEE_CIM_CASHUNITERROR":
                            break;
                        case "WFS_EXEE_CIM_NOTEERROR": //WFS_CMD_CIM_CASH_IN
                            break;
                        default:
                            break;
                    }
                });
                return cim.execute("WFS_CMD_CIM_START_EXCHANGE");
            })
            .then(function (result) {
                switch (result.hResult) {
                    case 0:
                        States.handleEvent("CimStartExchange_OK");
                        break;
                    case -48:
                        States.handleEvent("CimStartExchange_Timeout");
                        break;
                    case -4:
                        States.handleEvent("CimStartExchange_Cancel");
                        break;
                    //case -1317:
                    //    States.handleEvent("CimStartExchange_WFS_ERR_CIM_EXCHANGEACTIVE");
                    //    break;
                    default:
                        if (result.hResultDesc.len > 0) {
                            States.handleEvent("CimStartExchange_" + result.hResultDesc);
                        }
                        States.handleEvent("CimStartExchange_Error");
                        break;
                }
            })
            .catch(function (ex) {
                States.handleStateError(ex, "CimStartExchange_Hardware_Error");
            });
        },

        CimEndExchange: function (statedata) {
            var cim = new XFSDevice("cim");
            var _this = this;
            SSFramework.displayScreen(statedata.screens.espera)
            .then(function () {
                cim.setCallback(function (eventos) {
                    States.handleEvent("CimEndExchange_" + eventos.commandDesc);
                    switch (eventos.commandDesc) {
                        case "WFS_USRE_CIM_CASHUNITTHRESHOLD":
                            break;
                        case "WFS_SRVE_CIM_CASHUNITINFOCHANGED":
                            //SSFramework.displayScreen(statedata.screens.espera);
                            break;
                        case "WFS_EXEE_CIM_CASHUNITERROR": //Never returned
                            //SSFramework.displayScreen(statedata.screens.retire_billetes);
                            break;
                        default:
                            break;
                    }
                });
                //alert(JSON.stringify(States.getStoredValue("CimCashUnitInfo")));
                return cim.execute("WFS_CMD_CIM_END_EXCHANGE", States.getStoredValue("CimCashUnitInfo"));
            })
            .then(function (result) {
                switch (result.hResult) {
                    case 0:
                        States.handleEvent("CimEndExchange_OK");
                        break;
                    case -48:
                        States.handleEvent("CimEndExchange_Timeout");
                        break;
                    case -4:
                        States.handleEvent("CimEndExchange_Cancel");
                        break;
                    default:
                        if (result.hResultDesc.len > 0) {
                            States.handleEvent("CimEndExchange_" + result.hResultDesc);
                        }
                        States.handleEvent("CimEndExchange_Error");
                        break;
                }
            })
            .catch(function (ex) {
                States.handleStateError(ex, "CimEndExchange_Hardware_Error");
            });
        },

        CimCashUnitInfo: function (statedata) {
            States.storeNamedValue("CimCashUnitInfo", null);
            var cim = new XFSDevice("cim");
            var _this = this;
            SSFramework.displayScreen(statedata.screens.espera)
            .then(function () {
                cim.setCallback(function (eventos) {
                    States.handleEvent("CimCashUnitInfo_" + eventos.commandDesc);
                });
                return cim.getInfo("WFS_INF_CIM_CASH_UNIT_INFO");
            })
            .then(function (result) {
                switch (result.hResult) {
                    case 0:
                        States.storeNamedValue("CimCashUnitInfo", result.lpBuffer);
                        States.handleEvent("CimCashUnitInfo_OK");
                        break;
                    case -48:
                        States.handleEvent("CimCashUnitInfo_Timeout");
                        break;
                    case -4:
                        States.handleEvent("CimCashUnitInfo_Cancel");
                        break;
                    default:
                        if (result.hResultDesc.len > 0) {
                            States.handleEvent("CimCashUnitInfo_" + result.hResultDesc);
                        }
                        States.handleEvent("CimCashUnitInfo_Error");
                        break;
                }
            })
            .catch(function (ex) {
                States.handleStateError(ex, "CimCashUnitInfo_Hardware_Error");
            });
        },

        CimConfigureNotetypes: function (statedata) {
            var Notetypes = [];
            var cCurrencyID = States.getStoredValue("cCurrencyID");
            var CimNoteTypes = States.getStoredValue("CimNoteTypes");
            var cim = new XFSDevice("cim");
            var _this = this;
            SSFramework.displayScreen(statedata.screens.espera)
            .then(function () {
                if (CimNoteTypes != null) {
                    for (var c = 0; c < CimNoteTypes.length; c++) {
                        if (CimNoteTypes[c].cCurrencyID == cCurrencyID) {
                            Notetypes.push(CimNoteTypes[c].usNoteID);
                        }
                    }
                }
            })
            .then(function () {
                cim.setCallback(function (eventos) {
                    States.handleEvent("CimConfigureNotetypes_" + eventos.commandDesc);
                });
                return cim.execute("WFS_CMD_CIM_CONFIGURE_NOTETYPES", Notetypes);
            })
            .then(function (result) {
                switch (result.hResult) {
                    case 0:
                        States.handleEvent("CimConfigureNotetypes_OK");
                        break;
                    case -48:
                        States.handleEvent("CimConfigureNotetypes_Timeout");
                        break;
                    case -4:
                        States.handleEvent("CimConfigureNotetypes_Cancel");
                        break;
                    default:
                        if (result.hResultDesc.len > 0) {
                            States.handleEvent("CimConfigureNotetypes_" + result.hResultDesc);
                        }
                        States.handleEvent("CimConfigureNotetypes_Error");
                        break;
                }
            })
            .catch(function (ex) {
                States.handleStateError(ex, "CimConfigureNotetypes_Hardware_Error");
            });
        },

        CimBanknoteTypes: function (statedata) {
            var cim = new XFSDevice("cim");
            var _this = this;
            SSFramework.displayScreen(statedata.screens.espera)
            .then(function () {
                cim.setCallback(function (eventos) {
                    States.handleEvent("CimBanknoteTypes_" + eventos.commandDesc);
                });
                return cim.getInfo("WFS_INF_CIM_BANKNOTE_TYPES");
            })
            .then(function (result) {
                switch (result.hResult) {
                    case 0:
                        States.storeNamedValue("CimBanknoteTypes", result.lpBuffer);
                        States.storeNamedValue("CimNoteTypes", result.lpBuffer.lppNoteTypes);
                        States.handleEvent("CimBanknoteTypes_OK");
                        break;
                    case -48:
                        States.handleEvent("CimBanknoteTypes_Timeout");
                        break;
                    case -4:
                        States.handleEvent("CimBanknoteTypes_Cancel");
                        break;
                    default:
                        if (result.hResultDesc.len > 0) {
                            States.handleEvent("CimBanknoteTypes_" + result.hResultDesc);
                        }
                        States.handleEvent("CimBanknoteTypes_Error");
                        break;
                }
            })
            .catch(function (ex) {
                States.handleStateError(ex, "CimBanknoteTypes_Hardware_Error");
            });
        },

        ///handles envelope deposit logic
        EnvelopeDispense: function(statedata) {

            var dep = new XFSDevice("dep");
            var _this = this;
            var button = null;

            SSFramework.displayScreen(statedata.screens.default)

            .then(function() {
                var strbutton = States.getProperty("button");
                if (SSUtil.isDef(strbutton)) {
                    button = $(strbutton);
                }
                if (button != null)
                    button.hide();
                return dep.available();
            })

            .then(function (res) {

                if (res.fwDevice == 4 || res.fwDevice == 3)
                    throw "no_dep";

                return dep.getInfo("WFS_INF_DEP_CAPABILITIES");
            })

            .then(function (caps) {

                if (caps.lpBuffer.fwEnvSupply == 1) {
                    var postobj = States.getStoredValue("comms.last_esb_request");
                    var postobj2 = States.getStoredValue("comms.env_last_esb_request");
                    if (JSON.stringify(postobj) != JSON.stringify(postobj2)) {
                        States.storeNamedValue("comms.env_last_esb_request", postobj)
                        return dep.execute("WFS_CMD_DEP_DISPENSE");
                    } else {
                        return "no_dispenser";
                    }
                 
                }
                return "no_dispenser";
            })

            .then(function (res) {
                if(button!=null)
                    button.show();
                if (res != "no_dispenser") {
                    //nothing much
                }
            })

            .catch(function (ex) {
                States.handleStateError(ex, "hardware_error_dep_env");
            });

        },

        EnvelopeDeposit: function (statedata) {

            var dep = new XFSDevice("dep");
            var _this = this;

            dep.getInfo("WFS_INF_DEP_STATUS")


            .then(function (res) {

                if (res.lpBuffer.fwDevice != 0 || res.lpBuffer.fwDepContainer != 0 || res.lpBuffer.fwDepTransport != 0)
                    throw "no_dep";

                dep.setCallback(function (msg) {

                        if (msg.commandDesc == "WFS_EXEE_DEP_DEPOSITERROR") {
                            xfslogger("WFS_EXEE_DEP_DEPOSITERROR " + msg.lpBuffer.lplError)
                        }
                });
                
                SSFramework.displayScreen(statedata.screens.default);

                var tline = "";
                var line = States.getProperty("printLine");
                if(typeof line ==='function') {
                    tline = line().toUpperCase();
                }
                var timeout = SSFramework.timeout_secs * 1000;
                return dep.execute("WFS_CMD_DEP_ENTRY", { "lpszPrintData": tline }, timeout);
            })

            .then(function (res) {

                if (res.hResult == 0) {
                    States.handleEvent("deposit_ok");

                } else {
                    
                    if (res.hResult == -4) {
                        States.handleEvent("cancel");

                        //ignore 
                    } else {
                        if (res.hResult == -48) {
                            States.handleEvent("manual_timeout");                            

                        } else {
                            States.handleEvent("deposit_error");
                        }
                    }
                }
            })

            .catch(function (ex) {
                States.handleStateError(ex, "hardware_error_dep");
            });

        },


        ///handles dispense logic
        Dispense: function (statedata) {

            var cdm = new XFSDevice("cdm");
            var dispense_result = "";
            var _this = this;
            var test_mix = States.getProperty("test_mix");
            var taken = false;

            if(statedata.screens.hasOwnProperty("wait")) 
                SSFramework.displayScreen(statedata.screens.wait);

            cdm.extension("CDMController", { "method": "available" })

            .then(function (val) {
                
                if (val.available == false)
                    throw "no_cdm";

                var amount = States.getStoredValue("monto", "0");
                
                var currency = UserFuns.findCurrDesc(States.getStoredValue("moneda", 80))[0];
                
                var cmddispense = {
                    "method": "checkDispense",
                    "currency": currency,
                    "amount": amount,
                    "account": States.getStoredValue("customer", "0"),
                    "transaction": States.getSequencialNumber("config.numtrx", false)
                };

                if (test_mix == false) {
                    cmddispense.method = "dispense";
                    cdm.setCallback(function (msg) {
                        console.log(JSON.stringify(msg));
                        if (msg.commandDesc == "WFS_SRVE_CDM_ITEMSTAKEN") {
                            taken = true;
                            States.handleEvent("dispense_ok");                            
                        }
                    });
                }
                return cdm.extension("CDMController", cmddispense);
            })

           .then(function (val) {
               
               if (val.hasOwnProperty("suggested")) {
                   var logstr = "WFS_CMD_CDM_DISPENSE invalid_mix suggested: " + val.suggested;
                   if (parseInt(val.suggested) > 0) {
                       States.storeNamedValue("data.suggested", val.suggested);
                       throw "invalid_mix";
                   } else {
                       throw "no_valid_mix";
                   }
               }

               if (test_mix) {
                   if (val.error == "ok") {
                       throw "valid_mix";
                   } else {
                       throw "no_valid_mix";
                   }
               }

               if (val.hasOwnProperty("hResult")) {

                   var logstr = "WFS_CMD_CDM_DISPENSE " + val.hResult + " (" + val.hResultDesc + ")";

                   if (val.hasOwnProperty("lpBuffer"))
                       logstr += " " + JSON.stringify(val.lpBuffer);

                   if (val.hasOwnProperty("present_state"))
                       logstr += " present_state:" + val.present_state;

                   xfslogger(logstr);

                   if (val.hResult == 0) {
                       SSFramework.displayScreen(statedata.screens.default);

                   } else {
                       if (val.present_state.toString() == "1") {
                           ///dejar que siga, dice que presento los billetes
                           SSFramework.displayScreen(statedata.screens.default);

                       } else {
                           throw "not_presented";
                       }
                   }
               } else {
                   throw "invalid_response";
               }
                
           })


            .delay(25000)

            .then(function (result) {
                if(!taken)
                    States.handleEvent("dispense_ok");
            })


            .catch(function (ex) {
                if (ex == "invalid_response") {
                    States.handleStateError(ex, "hardware_error_cdm");
                }

                if (ex == "invalid_mix") {
                    States.handleEvent("invalid_mix");
                }

                if (ex == "valid_mix") {
                    States.handleEvent("valid_mix");
                }

                if (ex == "no_valid_mix") {
                    States.handleStateError(ex, "hardware_error_cdm");
                }

                if (ex == "not_presented") {
                    States.handleStateError(ex, "hardware_error_cdm");
                }

                if (ex == "no_cdm") {
                    States.handleStateError(ex, "hardware_error_cdm");
                }

            });

        },

        ///pin entry
        PinEntry: function(statedata) {

            var pin = new XFSDevice("pin");
            var _this = this;

            pin.getInfo("WFS_INF_PIN_STATUS")

            .then(function (result) {

                if (result.lpBuffer.fwDevice != 0 || (result.lpBuffer.fwEncStat != 0 && result.lpBuffer.fwEncStat != 5))
                    throw "hardware_error";

                States.registerCustomEvent("state_exit", function (evt) {
                    pin.cancelAsyncRequest({ RequestID: 0 });
                });

                pin.setCallback(function (msg) {
                    
                    if (msg.message_type_desc == "WFS_EXECUTE_EVENT") {
                        if (msg.commandDesc == "WFS_EXEE_PIN_KEY") {

                            if (msg.lpBuffer.wCompletion == 6) {
                                if (msg.lpBuffer.ulDigit == 1 || msg.lpBuffer.ulDigit == 0) {
                                    States.fireCustomEvent("input.key", "*");
                                }
                            }

                            //if (msg.lpBuffer.wCompletion == 8) {
                                if (msg.lpBuffer.ulDigit == 0x2000) {
                                    ///clear
                                    States.fireCustomEvent("input.clear");
                                }
                            //}

                            if (msg.lpBuffer.wCompletion == 2) {
                                if (msg.lpBuffer.ulDigit == 0x800) {
                                    States.handleEvent("cancel");
                                }
                            }
                        }
                    }
                });

                SSFramework.displayScreen(statedata.screens.default);

                return pin.execute("WFS_CMD_PIN_GET_PIN");


            }).then(function(result) {
                
                if (result.hResult == -4 || result.hResult == -48)
                    throw "timeout";

                var customer = States.getStoredValue("customer");
                var input = { "lpsCustomerData": SSUtil.pad(customer, "0", 12) };
                return pin.execute("WFS_CMD_PIN_GET_PINBLOCK", input);
                
            }).then(function(result) {

                if (result.hResult == 0) {
                    var pinblock = result.lpBuffer.lpbData;
                    var hexpinblock = SSUtil.toHex(pinblock);
                    States.storeValue(hexpinblock);
                    States.handleEvent("pin_entered");

                } else {
                    throw "hardware_error";
                }

            }).catch(function (ex) {
                if (ex == "timeout") {
                    ///nothing much
                } else {
                    States.handleStateError(ex, "hardware_error_pin");
                }
            });
        },
        
        ///asks for a card entry
        CardEntry: function(statedata) {
            
            // First evaluate enabled identifying modes
            /*var identifyingModes = UserFuns.getEnabledIdentifyingModes();
            States.storeNamedValue("identifying_modes", identifyingModes);
            
            // If ttcc not enabled return
            if ( !identifyingModes.includes("T") ) {
                SSFramework.displayScreen(statedata.screens.no_dip);
                if ( identifyingModes == "M" )
                    States.handleEvent("identificacion_manual");
                else if ( identifyingModes == "N" )
                    States.handleEvent("no_cliente");
                return;
            }*/ //Esta logica primero seleccionabas la transaccion y segun esa transaccion te dejaba ingresar con tarjeta/documento o no cliente
            console.log("Entering CardEntry state");
            //SSFramework.displayScreen(statedata.screens.idc_ok); probar aca si dejo o quito esa linea

            var idc = new XFSDevice("idc");
            var _this = this;

            idc.available()

            .then(function (val) {

                if (val.available == false)
                    throw "no_idc";
                
            })
            .then(function () {
                return idc.getInfo("WFS_INF_IDC_CAPABILITIES");
            })

            .then(function (caps) {

                if (SSUtil.getObj("lpBuffer.fwType", caps) == 1) {
                    SSFramework.displayScreen(statedata.screens.idc_ok);
                } else {
                    SSFramework.displayScreen(statedata.screens.idc_ok_dip);
                }

            })

            .then(function () {

                States.registerCustomEvent("state_exit", function (evt) {
                    idc.cancelAsyncRequest({ RequestID: 0 });
                });

                return idc.execute("WFS_CMD_IDC_READ_RAW_DATA");                
            })

            .then(function (result) {

                if (result.hResult == 0) {
                    var arr = result.lpBuffer;
                    var tracks = {};
                    for (var c = 0; c < arr.length; c++) {
                        if (arr[c].wDataSource == 1)
                            tracks.track1 = arr[c].lpbData;
                        if (arr[c].wDataSource == 2)
                            tracks.track2 = arr[c].lpbData;
                        if (arr[c].wDataSource == 4)
                            tracks.track3 = arr[c].lpbData;
                    }

                    States.storeValue(JSON.stringify(tracks));
                    console.log("Card data read: " + JSON.stringify(tracks));
                    States.handleEvent("card_read");                                   


                } else {
                    if (result.hResult != -4)
                        throw "no_idc";
                }

            })

            .catch(function (ex) {
                SSFramework.displayScreen(statedata.screens.idc_error);
                States.handleEvent("hardware_error_idc");                                   
            });

        },

        ///prints a receipt
        Receipt: function (statedata) {

            var ptr = new XFSDevice("ptr"); 
            var receipt_server = null;

            ptr.available()
                    
            .then(function (data) {
                if (data.available == false) {
                    throw "printer_error";
                }
            })

            .then(function () {
                return readRegistry("receipt_server");
            })

            .then(function (server) {
                receipt_server = server;
                SSFramework.displayScreen(statedata.screens.printing);
                return ptr.extension("LoadSettings", null);
            })

            .then(function (settings) {
                return SSFramework.buildReceipt(statedata.screens.receipt);
            })

            .then(function (result) {
                var host = SSUtil.getHost();
                if (receipt_server != "")
                    host = receipt_server;
                result.url = host + result.url;
                return ptr.extension("PrintURL", result);
            })

            .then(function (result) {
                //result.hResult = 0; //TODO volver a comentar
                if (result.hResult != 0) {
                    throw "printer_error";
                } else {
                    SSFramework.displayScreen(statedata.screens.print_ok);
                }
                return result;                   
            })

            .delay(5000)

            .then(function(result) {
                States.handleEvent("print_ok");                                   
            })

            .catch(function (ex) {
                States.handleStateError(ex, "hardware_error_ptr");
            });
            
        },

        // Validate connection
        ConnValidator: function (statedata) {
            
        },
    }
};


// ===================================
// PINPAD CLEAR GUARD GLOBAL
// ===================================
(function pinpadClearGuard() {
  if (!States || !States.fireCustomEvent) return;

  const _fire = States.fireCustomEvent.bind(States);

  States.fireCustomEvent = function(name, data) {
    // Si viene del PINPAD (CLEAR) y la pantalla no tiene inputarea
    if (name === "input.clear") {
      var hasInput = !!document.getElementById("inputarea_panel");
      if (!hasInput) {
        // Bloquea el clear para evitar reinicio del app
        return;
      }
    }
    return _fire(name, data);
  };
})();