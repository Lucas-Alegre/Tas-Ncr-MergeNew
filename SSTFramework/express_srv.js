var express = require('express');
var bodyParser = require('body-parser')
var app = express();
var fs = require("fs");
var ejs = require("ejs");
var extend = require('extend');

return function(params, cb) {

    ///todo modify path to point to workspace

    //var rootpath = params.workspace;
    //app.use("/", express.static(__dirname + '/../public'));
    var rootpath = __dirname + '/../';
    //var rootpath = "C:/Users/mg200011.CORP/Documents/Visual Studio 2013/Projects/SSTFramework/SSTFramework/src/";
    app.use("/", express.static(rootpath + "public"));

    
    app.set('view engine', 'html');
    app.engine('html', ejs.renderFile);

    app.use(bodyParser.json());

    app.listen(params.port, cb);
    
    app.get('/state', function(req, res) {
        
        //leo el estado
        var obj = {};
        obj.path = rootpath + "/states/";
        obj.filename = req.param("name")+".json";
 
        params.readJSON(obj, function(err, statedata) {
            if(err) {
                console.error("err loading state " + req.param("name"));
                res.send(404, "not found "+ req.param("name"));
                res.end();
                return;
            }

            //bug reading utf8 file with readFile
            statedata = ""+statedata; //jic
            statedata = statedata.replace(/^\uFEFF/, '');
        
            //serializo las funciones
            var sret = "";
            
            try {                
                eval("var ret = " + statedata);

                while(ret.base) {
                    var obj = ret.base;
                    delete ret.base;
                    ret = extend(true, {}, obj, ret);
                }

                sret = JSON.stringify(ret, function(key, value) {                   
                    if (typeof value === 'function') {
                        return value.toString();
                    }
                    return value;
                });

            } catch(ex) {
                console.error("err " + ex.toString() + " parsing state " + req.param("name"));
                res.send(404, "not found "+ req.param("name"));
                res.end();     
                return;
            }

            var cookies = req.headers.cookie;
            params.parseState({name: req.param("name"), data : sret, cookies: cookies}, function(err, result) {
                if(err)
                    throw err;
                res.setHeader('Content-Type', 'text');
                res.end(result);
            });
        }); 
    });

    

    function buildReceipt(req, res) {
        app.render("receipt/"+req.param("name"), req.body, function(err, html) {
            if(!req.body) {
                req.body = {};
            }
            req.body.name = req.param("name"); //jic
            req.body.rawhtml = html; //agrego el html generado
            req.body.rootpath = rootpath;
            if(!req.body.width)
                req.body.width = 600;             
 
            params.createReceipt(req.body, function(err, result) {
                if(err)
                    throw err;
                res.setHeader('Content-Type', 'text');
                res.end(result);            
            });
        });
    }

    app.get('/', function(req, res) {
        res.render("boot.html");
    });

    app.get('/receipt', function(req, res) {
        buildReceipt(req, res);
    });

    app.get('/receipt_test', function(req, res) {
        res.render("receipt/"+req.param("name"), req.body, function(err, html) {
            if(err) {
                console.error("err in receipt " + req.param("name"));
                //res.send(404, "not found "+ req.param("name"));
                res.end();
                return;
            }
            res.end(html);            
        });
    });


    app.post('/receipt', function(req, res) {
        buildReceipt(req, res);
    });

    
    app.get('/screen', function(req, res) {
        fs.readFile(rootpath + "screens/"+req.param("name")+".json", "utf8", function(err, screendata) {
            screendata = ""+screendata;
            screendata = screendata.replace(/^\uFEFF/, '');
            res.render("main", JSON.parse(screendata));
        });
    });

    app.post('/screen', function(req, res) {
        res.render("main", req.body);
    });

}