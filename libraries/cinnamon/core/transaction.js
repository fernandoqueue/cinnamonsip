const { EventEmitter } = require("rtpengine-client/lib/BaseClient");


class Transaction extends EventEmitter
{

    constructor(request){
        super();
        this.branch = request
        this.cseq = request.headers.cseq.seq;
        this.state = null;
        this.transmissions = [];

        this.on('request', this.processRequest.bind(this));
        this.on('response', this.processResponse.bind(this));
    }

    processRequest(request){
        this.transmissions.push(request);
        return this;
    }

    updateState(newState){
        this.state = newState;
        return this;
    }

    processResponse(response){
        this.transmissions.push(response);
        return this;
    }

}

module.exports = Transaction;