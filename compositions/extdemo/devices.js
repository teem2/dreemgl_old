// Access the `active` attribute on the command line with these:
//
// curl -d '{"rpcid":"devbus", "type":"attribute", "attribute":"active", "get":true}' http://localhost:2000/extdemo
//
// curl -d '{"rpcid":"devbus", "type":"attribute", "attribute":"active", "value":{ "My Phone":"phone", "SmartLamp":"smartbulb", "Brother 101":"printer" }}' http://localhost:2000/extdemo
//
// Use `notify` method via the command line with one of:
//
// curl -d '{"rpcid":"devbus", "type":"method", "method":"notify", "args":["ID", "TYPE", "join"]}' http://localhost:2000/extdemo
//
// curl -d '{"rpcid":"devbus", "type":"method", "method":"notify", "args":["ID", "TYPE", "part"]}' http://localhost:2000/extdemo

define.class(function (server) {

    this.attributes = {active: {type: Object, value:{}}};

    this.notify = function(id, type, action) {
        var active = this.active;

        if (action == 'join') {
            active[id] = type;
        } else if (action == 'part') {
            delete active[id];
        }

        this.active = active;
    }

});
