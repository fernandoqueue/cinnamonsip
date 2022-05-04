const { EventEmitter } = require("rtpengine-client/lib/BaseClient");
const Dialog = require('../core/dialog')
const UAS = require('../core/uas');
const {parseUri} = require('../../parsers');
class Session extends EventEmitter
{
    constructor(data){
        super();
        this.from = data.request.headers.from.uri;
        this.to = data.request.headers.to.uri;
        this.registrar = data.registrar;
        this.rtpEngine = data.rtpengine;
        this.uacCB = data.uacCB;
        this.removeSession = data.removeSession;

        let to = parseUri(data.request.headers.to.uri);
        

        this.registrar.get(`${to.user}@${to.host}`)
                      .then(async (results)=>{
                          if(results){
                              let {uas, uac} = await this.createBackToBack(data);
                              console.log('from registrar async');
                              
                          }else{
                              console.log('user not found');
                          }
                      });
    
        this.on('request', this.request.bind(this));
        this.on('response', this.response.bind(this));
    }
    async createBackToBack(data){
        let uas = await this.createUAS(data);
        let uac = await this.createUAC(data);
      //  this.uacCB(uac.dialogId, this);

        //uas.on('destroy', this.removeSession(uas.dialogId));
        //uac.on('destroy', this.removeSession(uac.dialogId));

        return {uas: uas, uac: uac};
    }

    async createUAS(data){
        console.log('hello from uas');
        return new UAS(data);
    }

    createUAC(data){
        console.log('hello from uac');
        return null;
    }

    response({request,network}){
        console.log(request);
       
    }
    
    request({request,network}){
        console.log(request);
      
    }
}

module.exports = Session;

