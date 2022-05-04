const {v4} = require('uuid');
const {actions} = require('../../actions');
const { EventEmitter } = require('./transaction');
const Transaction = require('./transaction');
class UAS extends EventEmitter
{
    constructor({request,network,socket}){
        super()
        this.socket = socket.open({address: network.address, port: network.port});
        this.currentCSeq = request.headers.cseq.seq;
        this.dialogId = request.headers['call-id']
        this.fromTag = request.headers.from.params.tag;
        this.toTag = v4()
        this.headers = request.headers;
        this.headers.to.params.tag = this.toTag;
        this.dialogs = new Map();

        this.createTransaction(request);
        this.start(request);
    }

    updateUAC(){

    }

    closeTransaction(){
        this.currentCSeq = null;
    }

    start(request){
        let response = this.responseTrying(request);
        this.sendResponse(response);
        this.dialogs.get(this.currentCSeq)
                    .processRequest(response)
                    .updateState('Trying');
    }
    

    responseTrying(request){
        return {
            version: request.version,
            status: 100,
            reason: 'Trying',
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



    createTransaction(request){
        let transaction = new Transaction(request);
        this.dialogs.set(transaction.cseq, transaction);
    }

    sendResponse(response){
        this.socket.send(response);
    }

}

function makeRtpEngineOpts(req, srcIsUsingSrtp, dstIsUsingSrtp) {
    const from = req.headers.from;
    const srtpCharacteristics = {
      'transport-protocol': 'UDP/TLS/RTP/SAVPF',
      'ICE': 'force',
      'rtcp-mux': ['require'],
      'flags': ['SDES-no', 'generate mid']
    };
    
    const rtpCharacteristics = {
      'transport protocol': 'RTP/AVP',
      'DTLS': 'off',
      'ICE': 'remove',
      'rtcp-mux': ['demux'], 
      'flags':['SDES-no']
    };
  
    const dstOpts = dstIsUsingSrtp ? srtpCharacteristics : rtpCharacteristics;
    const srctOpts = srcIsUsingSrtp ? srtpCharacteristics : rtpCharacteristics;
    const callDirection = 'outbound';
    const common = {
      'call-id': req.headers['call-id'],
      'replace': ['origin', 'session-connection'],
    };
    return {
      common,
      uas: {
        tag: from.params.tag,
        mediaOpts: srctOpts
      },
      uac: {
        tag: null,
        mediaOpts: dstOpts
      },
      callDirection
    };
  }



module.exports = UAS;