/*
*/

var UserFuns = {

    descProductses : [
        [1, "Cuenta corriente", "CC"],
        [2, "Caja de ahorros", "CA"],
        [3, "Caja y valores", "CV"],        
        [4, "Plazo fijo", "PF"],
        [5, "Recaudaciones", "RC"],
        [6, "Prestamos", "PP"],
        [8, "Garantias", "NN"],
        [9, "Cambios", "AE"],
        [10, "Títuos", "AT"],
        [12, "Caja de ahorros", "CA"], 
        [15, "Contabilidad auxiliar", "AI"],
        [25, "Tarjeta de crédito", "TJC"],
        [26, "Tarjeta de débito", "TDB"],
        [27, "Títulos - Ctas. Comitentes", "TIT"],
        [28, "Cuentas de comercio exterior", "CEX"],
        [29, "Tarjetas de débito", "TDB"],
        [30, "Caja de seguridad", "CSE"],
        [31, "Leasing", "LEA"],
        [32, "Tarjeta de débito", "TDB"],
        [40, "Seguros", "SEG"],
        [45, "Títulos", "TIT"],
        [51, "Refinanciados", "RAS"],
    ],

    descMonedas: [ 
        ["ARS", "$", 80, "Pesos"],
        ["USD", "U$S", 2, "Dólar"],
    ],

    getDateString: function(m) {
        return ("0" + m.getDate()).slice(-2) + "/" +
            ("0" + (m.getMonth() + 1)).slice(-2) + "/" +
            (m.getFullYear());
    },

    getTimeString: function(m) {
        return ("0" + m.getHours()).slice(-2) + ":" +
           ("0" + m.getMinutes()).slice(-2)
    },

    getConfig: function () {

        var lconfig = "";
        var configurl = SSUtil.getLocal("ConfigServer", "");;
        var terminalname = SSUtil.getLocal("TerminalName", "");
        var appversion = SSUtil.getLocal("AppVersion", "");

        var ipesb = SSUtil.getLocal("IPESB", "");
        configurl = configurl.replace("[IPESB]", ipesb);

        return SSFramework.callESB({
            "TerminalName": terminalname, "AppVersion": appversion
        }, configurl)

        .then(function (config) {
            lconfig = config;
            return setRegistry("config.server", JSON.stringify(lconfig));
        })

        .then(function () {
            return SSUtil.storeLocalConfig(lconfig);
        })

        .then(function () {
            return lconfig;
        });

    },
	
	getFeriados: function () {


		var config = SSUtil.getStoredConfig();
		
        var postobj = {};
		postobj.trx = "WSCCF";
		postobj.protocol = SSUtil.getValue(config.ConfigurationProtocol, "petersen");
		postobj.auth = SSUtil.getValue(config.ConfigurationAuthorizer, "petersen");
		postobj.branch = SSUtil.getValue(config.BranchNumber, "1");
		postobj.machine = SSUtil.getLocal("TerminalName", "");
		postobj.debug = SSUtil.getValue(config.TerminalDebug, "1");
		postobj.testcase = SSUtil.getValue(config.TerminalTestCase, "case0");
		postobj.numtrx = States.getSequencialNumber("config.numtrx", postobj.repeat_trx!=true);
		
		States.storeNamedValue("comms.last_esb_request", postobj)

		var esb = SSUtil.getLocal("ESB", null);
		esb = esb.replace("[IPESB]", SSUtil.getLocal("IPESB"));

		SSFramework.callESB(postobj, esb)

		.then(function (response) {
			var resnode = SSUtil.findChild(response, UserFuns.findResultNode);
			
			if (resnode != null) {
				var feriado1 = resnode.LineItems.DFE_FERIAD;
				var feriado2 = resnode.LineItems.AFE_TRANS;
				var feriado3 = resnode.LineItems.AFE_ALTA;
				var feriados = feriado1+","+feriado2+","+feriado3;
				console.log("Proximos feriados: " + feriados);
				SSUtil.setLocal("config.feriados", feriados);
				setRegistry("config.feriados", feriados);
			} else {
				SSUtil.setLocal("config.feriados", readRegistry("config.feriados", ",,"));
				
                ///respuesta del esb u otro servicio
                if(response.hasOwnProperty("error")) {
                    response.commserror = response.error;
                    audit(response, response.error);
                } else {
                    //respuesta desconocida
                    audit(response, "invalid_msg");
                }
            }
			
		})

		.catch(function (ex) {
			SSUtil.setLocal("config.feriados", readRegistry("config.feriados", ",,"));
			console.log(JSON.stringify(ex));
		});

    },
	
	isFunctionEnabled: function(functionsNames) {
		var config = SSUtil.getStoredConfig();
		var horarioLaboral = this.isHorarioLaboral();
		
		for(var i=0;i<functionsNames.length;i++) {
			var functionName = functionsNames[i];
			if ( ( horarioLaboral && config.FunctionsLaboral.includes(functionName) )
				|| ( !horarioLaboral && config.FunctionsNoLaboral.includes(functionName) ) )
				return true;
		}
        return false;
	},
	
	isHorarioLaboral: function() {
		var config = SSUtil.getStoredConfig();
		
		// Si es sábado o domingo
		var now = new Date();
		var day = now.getDay();
		if (day == 0 || day == 6)
			return false;
		
		// Si está fuera del horario laboral
		var timeFrom = config.LaboralDesde;
		var timeTo = config.LaboralHasta;
		var timeNow = now.getHours() * 100 + now.getMinutes();
		if ( timeNow < timeFrom || timeNow > timeTo )
			return false;
		
		// Si es feriado
		var day = now.getDate() < 10 ? "0" + (now.getDate()) : now.getDate();
		var month = now.getMonth() + 1 < 10 ? "0" + (now.getMonth() + 1) : (now.getMonth() + 1);
		var year = now.getFullYear().toString().substr(2,2);
		var dateString = day + month +year;
		return readRegistry("config.feriados", ",,")
			.then(function (feriados) {
				if (feriados.includes(dateString))
					return false;
				else
					return true; // Es horario laboral
			});
	},
	
	getEnabledIdentifyingModes: function() {
		var identifyingModes = "";
		switch (States.getStoredValue("data.menu_principal").value) {
			case "consultas":
				if ( this.isFunctionEnabled(["CoTSa","CoTTa","CoTMo","CoTCbu","CoTPf","CoTRh"]) )
					identifyingModes += "T";
				if ( this.isFunctionEnabled(["CoMSa","CoMTa","CoMMo","CoMCbu","CoMPf","CoMRh"]) )
					identifyingModes += "M";
				break;
			case "extraccion":
			case "transferencia":
			case "pago_ttcc":
			case "pago_impuestos":
				identifyingModes += "T";
				break;
			case "entrega_documentacion":
				if ( this.isFunctionEnabled(["EdTVn","EdTVc"]) )
					identifyingModes += "T";
				if ( this.isFunctionEnabled(["EdMVn","EdMVc"]) )
					identifyingModes += "M";
				if ( this.isFunctionEnabled(["EdNVn","EdNVc"]) )
					identifyingModes += "N";
				break;
			case "cambio_pin":
				if ( this.isFunctionEnabled(["CpTPin"]) )
					identifyingModes += "T";
				if ( this.isFunctionEnabled(["CpMPin"]) )
					identifyingModes += "M";
				break;
			case "deposito":
				if ( this.isFunctionEnabled(["DpTEf","DpTCh"]) )
					identifyingModes += "T";
				if ( this.isFunctionEnabled(["DpMEf","DpMCh"]) )
					identifyingModes += "M";
				break;
			case "deposito_terceros":
				if ( this.isFunctionEnabled(["DtTEf","DtTCh"]) )
					identifyingModes += "T";
				if ( this.isFunctionEnabled(["DtMEf","DtMCh"]) )
					identifyingModes += "M";
				if ( this.isFunctionEnabled(["DtNEf","DtNCh"]) )
					identifyingModes += "N";
				break;
			case "mensajes":
				if ( this.isFunctionEnabled(["PmTPm"]) )
					identifyingModes += "T";
				if ( this.isFunctionEnabled(["PmMPm"]) )
					identifyingModes += "M";
				break;
		}
		return identifyingModes;
	},
	
	deleteUnenabledSelects: function(selectObj, tipo) {
		if (typeof tipo == 'undefined')
			tipo = States.getStoredValue("tipo_identificacion");
		
		for (var i=0; i<10; i++) {
			if ( selectObj.hasOwnProperty("select"+i) && selectObj["select"+i].hasOwnProperty("funciones") ) {
				if ( !this.isFunctionEnabled( selectObj["select"+i]["funciones"][tipo] ) )
					delete selectObj["select"+i];
			}
		}
	},
	
	executeUniqueSelect: function(selectObj) {
		var component = null;
		
		for (var i=0; i<10; i++) {
			if ( selectObj.hasOwnProperty("select"+i) ) {
				if (component == null)
					component = selectObj["select"+i];
				else
					return false;
			}
		}
		
		if (component != null) {
			if(component.hasOwnProperty('value')) {
				States.storeValue(component.value);                    
			}
			States.handleEvent(component.event);
			return true;
		}
		
		return false;
	},
	
	reorganizeSelects: function(selectObj, orden) {
		if (typeof orden == 'undefined')
			orden = [0,4,1,5,2,6,3,7,8,9];
		
		for (var i=0; i<10; i++) {
			if ( !selectObj.hasOwnProperty("select"+orden[i]) ) {
				for (var j=i+1; j<10; j++) {
					if ( selectObj.hasOwnProperty("select"+orden[j]) ) {
						selectObj["select"+orden[i]] = selectObj["select"+orden[j]];
						delete selectObj["select"+orden[j]];
						break;
					}
				}
			}
		}
	},

    getHash: function(e) {
        for(var r=0,i=0;i<e.length;i++)
            r=(r<<5)-r+e.charCodeAt(i),r&=r;
        return r;
    },

    findInArray: function (arr, code) {
        for (var c = 0; c < arr.length; c++)
            if (arr[c].indexOf(code) != -1)
                return arr[c];
        return null;
    },

    findProductDesc: function (code) {
        return this.findInArray(this.descProductses, code);
    },

    findCurrDesc: function(code) {
        return this.findInArray(this.descMonedas, code);
    },

    findPCode: function(code) {
        var d = this.findProductDesc(code);
        if(d!=null)
            return d[0];
        return null;
    },

    findPDesc: function (code) {
        var d = this.findProductDesc(code);
        if (d != null)
            return d[1];
        return null;
    },

    findPDescCorta: function (code) {
        var d = this.findProductDesc(code);
        if (d != null)
            return d[2];
        return null;
    },

    findCName: function (code) {
        var d = this.findCurrDesc(code);
        if (d != null)
            return d[0];
        return null;
    },

    findCSign: function (code) {
        var d = this.findCurrDesc(code);
        if (d != null)
            return d[1];
        return null;
    },

    findCCode: function (code) {
        var d = this.findCurrDesc(code);
        if (d != null)
            return d[2];
        return null;
    },

    findCText: function (code) {
        var d = this.findCurrDesc(code);
        if (d != null)
            return d[3];
        return null;
    },

    getProducts: function() {
        return States.getStoredValue("data.cuentas");
    },
	
	getFilteredProducts: function(conceptos, flags, monedas) {
		var cuentas = UserFuns.getProducts();
		
        var cuentasFiltradas = [];	            
	            
		for(var c=0; c<cuentas.length; c++) {
			var agregada = false;
			if(conceptos==null || conceptos.indexOf(cuentas[c].ACO_CONCE)!=-1) {
				if(flags!=null) {
					for(var f=0; f<flags.length; f++) {
						if(cuentas[c][flags[f]]=='S') {
							if(monedas==null || monedas.indexOf(cuentas[c].ACO_MONED)!=-1) {
								cuentasFiltradas.push(cuentas[c]);
								agregada = true;
							}
							break;
						}
					}
				} else {
					if(monedas==null || monedas.indexOf(cuentas[c].ACO_MONED)!=-1) {
						cuentasFiltradas.push(cuentas[c]);
						agregada = true;
					}
				}	                    
			}
			if (!agregada)
				cuentasFiltradas.push(null);
		}
		
		return cuentasFiltradas;
    },

    getProduct: function(store_offset) {
        var ret = this.getProducts();
        var offset = States.getStoredValue(store_offset, -1)

        if (ret != "" && ret != -1) {
            return ret[offset];
        }
        return null;
    },

    createObjectFromCuenta: function(tipo_producto, numero) {
        var oficinalen = 3;
        var cuentalen = 6;
        var digitolen = 1;
        numero = numero.toString();
        return {
            "ACO_CONCE": parseInt(tipo_producto.concepto),
            "ACO_MONED": parseInt(tipo_producto.moneda),
            "ACU_OFICI": numero.slice(0, oficinalen),
            "WCUNUMCUE": numero.slice(oficinalen, oficinalen + cuentalen),
            "ACUDIGVER": numero.slice(oficinalen + cuentalen, oficinalen + cuentalen + digitolen),
        }
    },

    formatTarjeta: function (args) {

        args = args.toString();
        var p1 = args.slice(0, 4);
        var p2 = args.slice(4, 8);
        var p3 = args.slice(8, 12);
        var p4 = args.slice(12, 16);

        var ret =
            SSUtil.pad(p1, "_", 4, -1) + "-" +
            SSUtil.pad(p2, "_", 4, -1) + "-" +
            SSUtil.pad(p3, "_", 4, -1) + "-" +
            SSUtil.pad(p4, "_", 4, -1);

        return ret;
    },

    formatCuenta: function (numero, sinsucursal) {
        numero = numero.toString();
        var oficinalen = 3;
        var cuentalen = 6;
        var digitolen = 1;
        var oficina = numero.slice(0, oficinalen);
        var num = numero.slice(oficinalen, oficinalen + cuentalen);
        var digito = numero.slice(oficinalen + cuentalen, oficinalen + cuentalen + digitolen);
        if (sinsucursal) {
            num = numero.slice(-cuentalen-digitolen, -digitolen);
            digito = numero.slice(-digitolen, numero.length);
            return SSUtil.pad(num, "_", cuentalen, 1) + "/" + SSUtil.pad(digito, "_", digitolen, 1);

        } else {
            return SSUtil.pad(oficina, "_", oficinalen, -1) + "-" + SSUtil.pad(num, "_", cuentalen, -1) + "/" + SSUtil.pad(digito, "_", digitolen, -1);
        }
    },

    
    formatProductValue: function (product, format) {
        if (typeof format == 'undefined')
            format = 0;

        switch (product.ACO_CONCE) {
            case 1:
            case 2:
                var oficinalen = 3;
                var cuentalen = 6;
                var digitolen = 1;
                var p1 = SSUtil.pad(product.ACU_OFICI, "0", oficinalen, 1);
                var p2 = SSUtil.pad(product.WCUNUMCUE, "0", cuentalen, 1);
                var p3 = SSUtil.pad(product.ACUDIGVER, "0", digitolen, 1); 
                if (format == 0) {
                    return p1 + "-" + p2 + "/" + p3;
                } else {
                    return p2 + "/" + p3;
                }
                
            case 4:
                return product.WCUNUMCUE;

            case 25: {
                var num = product.WCUNUMCUE.toString();
                if (product.hasOwnProperty("WCUNUMCUE")) {
                    num = product.WCUNUMCUE.toString();
                }
                return num.slice(0, 4) + "-" + num.slice(4, 8) + "-" + num.slice(8, 12) + "-" + num.slice(12, 16);
            }
        }
        return "";
    },

    formatProductName: function (product) {
        var desc = this.findPDesc(product.ACO_CONCE);
        if(desc==null)
            return "";
        if (product.ACO_CONCE == 1 || product.ACO_CONCE == 2) {
            var moneda = this.findCSign(product.ACO_MONED);
            if (moneda != null)
                desc += " " + moneda;
        }

        if (product.ACO_CONCE == 25 && product.hasOwnProperty("WNO_CLIE1")) {
            desc = product.WNO_CLIE1;
        }
        return desc;
    },


    formatProduct: function (product, addbreak) {
        var sep = " ";
        if (addbreak == true)
            sep = "<br>";
        return this.formatProductName(product) + sep + this.formatProductValue(product);
    },


    formatFecha: function (fecha) {
        var f = "000000" + fecha.toString();
        return f.substr(-6, 2) + "/" + f.substr(-4, 2) + "/" + f.substr(-2);
    },

    formatFloatMonto: function(monto, sign) {
        return this.formatMonto(parseFloat(monto.toString()) * 100, sign, 2);
    },
    
    formatMonto: function (monto, sign, strip_numbers) {
        if (typeof strip_numbers == 'undefined')
            strip_numbers = 2;
        if (SSUtil.isDef(monto) == false)
            monto = "0";
        monto = monto.toString();
        var float = SSUtil.intAsFloat(monto, strip_numbers);
        var formatted = SSUtil.formatNumber(float, 2);
        if (monto.indexOf('-') != -1) {
            formatted += "-";
        } else {
            formatted += "+";
        }
        if (typeof sign != 'undefined' && sign != "")
            formatted = sign + " " + formatted;
        return formatted;
    }, 

    findResultNode: function (key, value) {
        if (key.indexOf("Result") > -1)
            return true;
        return false;
    },

    addPrinterHeader: function (obj, numtrx) {
        var config = SSUtil.getStoredConfig();
        var msg = States.getStoredValue("comms.last_esb_request");
        obj.nombreSucursal = SSUtil.getValue(config.BranchNumber, "1") + "-" + SSUtil.getValue(config.BranchName, "");
        obj.logo = config.ConfigurationStyle;
        obj.machine = SSUtil.getLocal("TerminalName", "");
        
        if (msg && msg.numtrx)
            obj.numtrx = msg.numtrx;
        else
            obj.numtrx = 0;
    },

    identifyCardReader: function() {
        var idc = new XFSDevice("idc");
        var _this = this;

        return idc.getInfo("WFS_INF_IDC_CAPABILITIES")
        
        .then(function (caps) {
            if (SSUtil.getObj("lpBuffer.fwType", caps) == 1) {
                return "motorized";
            } else {
                return "dip";
            }

        }) .catch(function(ex) {
            return "motorized";
        });

    },

    storeStatus: function() {
        
        var dev = new XFSDevice("ptr");

        return dev.available()

        .then(function(res) {
            SSUtil.setLocal("ptr_available", res.available);
            dev = new XFSDevice("pin");
            return dev.getInfo("WFS_INF_PIN_STATUS");
        })

        .then(function(res) {
            if (res.lpBuffer.fwDevice != 0 || (res.lpBuffer.fwEncStat != 0 && res.lpBuffer.fwEncStat != 5)) {
                SSUtil.setLocal("pin_available", false);
            } else {
                SSUtil.setLocal("pin_available", true);
            }
            dev = new XFSDevice("dep");
            return dev.available();
        })
    
    
        .then(function(res) {
            SSUtil.setLocal("dep_available", res.available);
            dev = new XFSDevice("cdm");
            return dev.available();
        })

        .then(function(res) {
            SSUtil.setLocal("cdm_available", res.available);
        })

        .catch(function(ex) {
        });
    },

    getStatus: function(conn) {
        return SSUtil.getLocal(conn + "_available", false);
    },
	
    identifyATM: function (callback) {       
        readRegistry("ForcedType")
        .then(function (res) {

            if (res == "dep") {
                SSUtil.setLocal("type", "dep");
                callback("dep");
            }
            else if (res == "cash") {
                SSUtil.setLocal("type", "cash");
                callback("cash");
            }
            else if (res == "ambos") {
                SSUtil.setLocal("type", "ambos");
                callback("ambos");
            } else {

                var cdm = new XFSDevice("cdm");
                cdm.available()

                .then(function (res) {
                    if (res.hasOwnProperty('fwDevice') && res.fwDevice != 3) {
                        SSUtil.setLocal("type", "cash");
                        callback("cash");
                    } else {
                        SSUtil.setLocal("type", "dep");
                        callback("dep");
                    }
                })

                .catch(function (ex) {
                    SSUtil.setLocal("type", "dep");
                    callback("dep");
                });
            }
        });
    },

    selectFromList: function (screen, list, order, hidenext) {
        var pos_inicial = 0;
        if(States.CurrentState == States.PreviousState) {
            pos_inicial = parseInt(sessionStorage["temp.select_from_list"], 10);
            pos_inicial += order.length;
            if (pos_inicial >= list.length)
                pos_inicial = 0;
            sessionStorage["temp.select_from_list"] = pos_inicial;

        } else {
            sessionStorage["temp.select_from_list"] = 0;
        }

        for (var c = 0; c < order.length; c++) {
            if (c + pos_inicial < list.length) {
                screen.select[order[c]] = {
                    "text": list[c + pos_inicial].text,
                    "value": list[c + pos_inicial].value,
                    "event": "select"
                };
            } else {
                screen.select[order[c]] = "";
            }
        }
        
        if (list.length <= order.length && (typeof hidenext == 'undefined')) {
            screen.select["select7"] = "";
        };


        if (list.length == 0) {
            States.handleEvent("sin_opciones");
        };

    },

    selectFromListNamed: function (screen, list, order, containerName, hidenext) {
        var pageKey = "temp.select_from_list." + containerName;
        var pos_inicial = parseInt(sessionStorage[pageKey] || "0", 10);
        var itemsPorPagina = order.length;
        var totalPaginas = Math.ceil(list.length / itemsPorPagina);

        
        if (pos_inicial >= list.length) pos_inicial = 0;
        sessionStorage[pageKey] = pos_inicial;

        if (!screen[containerName]) screen[containerName] = {};

        for (var c = 0; c < order.length; c++) {
            var index = c + pos_inicial;
            screen[containerName][order[c]] = (index < list.length) ? {
                "text": list[index].text,
                "value": list[index].value,
                "event": "select"
            } : "";
        }

        
        var paginaActual = Math.floor(pos_inicial / itemsPorPagina);
        var enPrimera = (paginaActual === 0);
        var enUltima = (paginaActual === totalPaginas - 1);
        screen.nav = screen.nav || {}; 

        if (list.length > itemsPorPagina) { 
            if (enPrimera) {
                screen.nav["nav3"] = {
                    "text": "Más cuentas",
                    "event": "mas"
                };
            }
            // Páginas intermedias: "Más" y "Menos"
            else if (!enUltima) {
                screen.nav["nav3"] = {
                    "text": "Más cuentas",
                    "event": "mas"
                };
                screen.nav["nav2"] = {
                    "text": "Menos cuentas",
                    "event": "menos"
                };
            }
            // Última página: solo "Menos cuentas"
            else if (enUltima) {
                screen.nav["nav3"] = {
                    "text": "Menos cuentas",
                    "event": "menos"
                };
            }
        }
        
    },
    
    stack: {

        stack: new Array(),

        push: function (name) {
            stack.push(name);
        },

        pop: function (num) {
            if(num && num>0)
                for (var c = 0; c < num-1; c++)
                    stack.pop();
            return stack.pop();
        },

        clear: function () {
            stack = new Array();
        },

        list: function () {
            return stack;
        }

    }

};
