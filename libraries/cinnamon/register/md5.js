const { filter } = require('../../helpers');
const {createHash} = require('crypto');

exports.authenticate = function(auth,method,password){
    let realm = filter(auth.realm);
    let username = filter(auth.username);
    let uri = filter(auth.uri);
    let nonce = filter(auth.nonce);
    let authResponse = filter(auth.response);
    let nc = auth.nc ? filter(auth.nc) :  null;
    let cnonce = auth.cnonce ? filter(auth.cnonce) : null;
    let qop = auth.qop ? filter(auth.qop) : null;

    const ha1 = createHash('md5');
    ha1.update([username, realm, password].join(':'));
    let ha1_string = ha1.digest('hex');

    const ha2 = createHash('md5');
    ha2.update([method, uri].join(':'));
    let ha2_string = ha2.digest('hex');

    
    const response = createHash('md5');
    const responseParams = [
    ha1_string,
    nonce
    ];

    if (cnonce) {
    responseParams.push(nc);
    responseParams.push(cnonce);
    }

    if (qop) {
    responseParams.push(qop);
    }

    responseParams.push(ha2_string);

    response.update(responseParams.join(':'));

    const calculated = response.digest('hex');

    return (calculated === authResponse);
}