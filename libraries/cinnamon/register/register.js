const nonce = require('../../nonce');
const { actions } = require('../../actions');
const { parseUri } = require('../../parsers');
const { getRealm } = require('../../helpers');
const { authenticate } = require('./md5');

class Register 
{
    constructor(registrar, socket){
        this.socket = socket;
        this.registrar = registrar
    }
    
    async handle(request, network){
        let socket = this.socket.open({address: network.address, port: network.port});

        let data = {request: request, network: network, socket: socket};

        request.headers.authorization
        ? this.authenticate(data)
        : this.challenge(data);
    }
    authenticate({request,network,socket}){
        //get password from database for user
        let password = 'password';
        if(authenticate(request.headers.authorization[0], request.method, password)){   
            console.log("\x1b[33m%s\x1b[0m",`authentication success for ${request.headers.from.uri}` + '\n')
            var contact = parseUri(request.headers.contact[0].uri);
            let user = parseUri(request.headers.to.uri);
            let aor = `${user.user}@${user.host}`;
            this.registrar.add(aor, {
                schema: user.params.transport,
                transport: network.protocol,
                expires: 300,
                sbcAddress: network.local,
                contact: contact,
                date: new Date(),
            });
            
            let response = this.createSuccessResponse(request);
            socket.send(response)
        }else{
            console.log('auth failed');
        }
    }

    challenge({request,network,socket}){
        console.log("\x1b[35m%s\x1b[0m", `Responding to ${request.headers.from.uri} with authentication challenge`  + '\n');
        let response = this.createChallengeResponse(request);
        socket.send(response);
    }

    createSuccessResponse(request){
        return {
            version: request.version,
            status: 200,
            reason: 'Ok',
            headers: {
                via: request.headers.via,
                to: request.headers.to,
                from: request.headers.from,
                contact: request.headers.contact,
                allow: actions.join(','),
                cseq: request.headers.cseq,
                'user-agent': 'cinnamon-sip',
                'call-id': request.headers['call-id'],
            },
        }
    }

    createChallengeResponse(request){
        let realm = getRealm(request.headers.from.uri);
        request.headers.to.params.tag = Math.floor(Math.random() * 1e6);
        return {
            version: request.version,
            status: 401,
            reason: 'Unauthorized',
            headers: {
                via: request.headers.via,
                to: request.headers.to,
                from: request.headers.from,
                allow: actions.join(','),
                cseq: request.headers.cseq,
                'user-agent': 'cinnamon-sip',
                'www-authenticate' : [{
                    scheme: 'Digest',
                    realm: realm, 
                    algorithm: 'MD5',
                    qop: 'auth',
                    nonce: nonce.nonce(),
                }],
                'call-id': request.headers['call-id'],
            }
        };
    }
    


}

module.exports = Register;