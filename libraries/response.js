const {responseCodes} = require('./responde-codes');
const {actions} = require('./actions');
module.exports =  class Response{
    constructor(headers){
        this.version = '2.0';
        this.userAgentName = 'Cinnamon SIP'
        this.headers = headers;
    }

    createResponse(statusCode, ...extraHeaders){
        return {
            version: this.version,
            status: statusCode,
            reason: responseCodes[statusCode],
            headers: {
                ...this.headers,
                'user-agent': this.userAgentName,
                'allow': actions.join(','),
                ...extraHeaders
            },
        }
    }

    createSuccessfulResponse(statusCode, ...extraHeaders){
        return {
            version: this.version,
            status: statusCode,
            reason: responseCodes[statusCode],
            headers: {
                ...this.headers,
                ...extraHeaders
            },
        }
    }

    createRedirectionResponse(statusCode, ...extraHeaders){
        return {
            version: this.version,
            status: statusCode,
            reason: responseCodes[statusCode],
            headers: {
                ...this.headers,
                ...extraHeaders
            },
        }
    }

    createClientFailureResponse(statusCode, ...extraHeaders){
        return {
            version: this.version,
            status: statusCode,
            reason: responseCodes[statusCode],
            headers: {
                ...this.headers,
                ...extraHeaders
            },
        }
    }

    createServerFailureResponse(statusCode, ...extraHeaders){
        return {
            version: this.version,
            status: statusCode,
            reason: responseCodes[statusCode],
            headers: {
                ...this.headers,
                ...extraHeaders
            },
        }
    }

    createGlobalFailureResponse(statusCode, ...extraHeaders){
        return {
            version: this.version,
            status: statusCode,
            reason: responseCodes[statusCode],
            headers: {
                ...this.headers,
                ...extraHeaders
            },
        }
    }

}