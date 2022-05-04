const App = require('./app');
const Registrar = require('./libraries/registrar');
const Cinnamon = require('./libraries/cinnamon/cinnamon');
global.debugger = true;
//Registrar/Location;
let registrar = new Registrar();

//Sip Agent
let cinnamonOptions = {
    registrar: registrar,
    address: '192.168.1.240',
    port: 41234,
};

new App(Cinnamon)
    .start(cinnamonOptions)
    .then(app=>app.read())
    







