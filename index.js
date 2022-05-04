const App = require('./app');
var ip = require("ip");
const Registrar = require('./libraries/registrar');
const Cinnamon = require('./libraries/cinnamon/cinnamon');
global.debugger = true;
//Registrar/Location;
let registrar = new Registrar();

//Sip Agent
let cinnamonOptions = {
    registrar: registrar,
    address: ip.address(),
    port: 41234,
};

new App(Cinnamon)
    .start(cinnamonOptions)
    .then(app=>app.read())
    







