let { makeUdpTransport }= require('./transport/udp');
var Register = require('./register/register');
var Invite = require('./invite/invite');

class Cinnamon 
{
    constructor(options){
        this.sipName = options.name;

        let registrar = options.registrar;
        let socket = makeUdpTransport({address: options.address, port: options.port}, this.messageHandler.bind(this));

        this.register = new Register(registrar,socket);
        this.invite = new Invite(registrar,socket)

        console.log('Cinnamon Sip v.0.0.1')
    }

    messageHandler(request, network){
        console.log(request);
        if(request.method){
            this.request(request,network);
        }else{
            this.response(request,network);
        }
    }

    request(request, network){
        let method = request.method.toLowerCase();
        switch(method){
            case 'register':
                this.register.handle(request,network);
                break;
            case 'invite':
                this.invite.requestHandler(request,network);
                break;
            default:
              throw new Error('Request method not supported');
        };
    }

    response(){

    }

}


module.exports = Cinnamon;