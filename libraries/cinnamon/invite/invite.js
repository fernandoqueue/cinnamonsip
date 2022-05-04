// const Session = require('./session');
const {parseUri} = require('../../parsers');
// const Client = require('rtpengine-client').Client;
// const rtpengine = new Client(2222,'192.168.1.240');
// class Invite 
// {
//     constructor(registrar, socket){
//         this.sessions = new Map();
//         this.socket = socket;
//         this.registrar = registrar;
//     }

//     uacSessionSetter(key,session){
//         this.sessions.set(key,session);
//     }

//     removeSession(key){
//         this.sessions.delete(key);
//     }

//     requestHandler(request,network){
//         if(this.sessions.has(request.headers['call-id'])){
//             this.sessions.get(request.headers['call-id']).emit('request',{request: request, network: network})
//         }else{
//             this.sessions.set(request.headers['call-id'], new Session({
//                 request: request, 
//                 network: network, 
//                 socket: this.socket, 
//                 registrar: this.registrar,
//                 rtpEngine: null,
//                 uacCB: this.uacSessionSetter.bind(this),  
//                 removeSession: this.removeSession.bind(this),            
//             }));
//         }

//     }
// }

class SessionManager
{
    constructor(){
        this.sessions = new Map();
    }

    async add(id,session){
        this.sessions.set(id,session);
        return true;
    }

    async delete(id){
        this.sessions.delete(id);
        return true;
    }

    async get(id){
        return this.sessions.get(id);
    }

    async getAll(){
        return this.sessions.entries();
    }
}

module.exports = class Invite{

    constructor(registrarService, transportService){
        this.registrarService = registrarService;
        this.transportService = transportService;

        this.sessionManager = new SessionManager();
    }

    async handle(message,network){
        await this.sessionManager.add(message.headers['call-id'],{status: true});
        await this.sessionManager.getAll().then((results)=> console.log(results));
    }



}