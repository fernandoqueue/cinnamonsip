const { makeUdpTransport }= require('./transport/udp');
const Register = require('./register/register');
const Router = require('./core/router');
const Registrar = require('../registrar');
const Response = require('../response');
const Invite = require('../cinnamon/invite/invite');
class Cinnamon 
{
    constructor(options){
        this.name = 'Cinnamon Sip v.0.0.1'
        this.registrarService = new Registrar();
        //transpost service TODO
        this.socket = makeUdpTransport({address: options.address, port: options.port}, this.messageHandler.bind(this));

        let register = new Register(this.registrarService, this.socket);
        let invite = new Invite(this.registrarService,this.socket);

        this.router = new Router({
            register: register,
            invite: invite,
            ack: this.messageHandler,
        });

        console.log(this.name);
    }

    messageLogger(message,network){
        console.log(`[message Logger]${JSON.stringify(message)}`);
    }

    async command(chunk){
        var string = chunk.toString('binary').trim();
        var results = /([\w-]+) ?([\s\S]+)?/.exec(string);

        if(!results)return;

        let command = results[1] ?? null;
        let args = results[2] ?? null;

        switch(command){
            case 'name':
                console.log(this.name);
                break;
            case 'get-user':
                console.log(JSON.parse(await this.registrarService.getUser(args)) ?? 'User not found');
                break;
            case 'debugger':
                global.debugger = args === 'true' ? true : (args === 'false' ? false : global.debugger);
                break;
            case 'get-debugger':
                console.log(global.debugger);
                break;
            default:
                console.log('Command not found');
        }
    }


    async messageHandler(message, network){
        if(global.debugger)console.log(JSON.stringify(message));
        let method = message.method.toLowerCase();
        if(method){
            try{
                await this.router.route(method)(message,network);
            }catch{
                let socket = this.socket.open({address: network.address, port: network.port});
                message.headers.to.params.tag = Math.floor(Math.random() * 1e6);
                await socket.send(new Response({
                    via: message.headers.via,
                    to: message.headers.to,
                    from: message.headers.from,
                    contact: message.headers.contact,
                    cseq: message.headers.cseq,
                    'call-id': message.headers['call-id'],
                }).createResponse(405));
            }
        }else{

        }
    }
}


module.exports = Cinnamon;