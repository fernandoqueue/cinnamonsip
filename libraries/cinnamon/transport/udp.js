var dgram = require('dgram');
var net = require('net');
var { stringify } = require('../../stringify');
var parsers = require('../../parsers');

function checkMessage(msg) {
    return (msg.method || (msg.status >= 100 && msg.status <= 999)) &&
      msg.headers &&
      Array.isArray(msg.headers.via) &&
      msg.headers.via.length > 0 &&
      msg.headers['call-id'] &&
      msg.headers.to &&
      msg.headers.from &&
      msg.headers.cseq;
  }
  
function makeUdpTransport(options, callback) {
    function onMessage(data, rinfo) {
      var msg = parsers.parseMessage(data);
      if(msg && checkMessage(msg)) {
        if(msg.method) {
          msg.headers.via[0].params.received = rinfo.address;
          if(msg.headers.via[0].params.hasOwnProperty('rport'))
            msg.headers.via[0].params.rport = rinfo.port;
            
        }
        msg.type = msg.method ? 'req' :'res';
        callback(msg, {protocol: 'UDP', address: rinfo.address, port: rinfo.port, local: {address: address, port: port}});
      }
    }
  
    var address = options.address || '0.0.0.0';
    var port = options.port || 5060;
  
    var socket = dgram.createSocket(net.isIPv6(address) ? 'udp6' : 'udp4', onMessage); 
    
    socket.on('listening', () => {
      const address = socket.address();
      console.log(`server listening ${address.address}:${address.port}`);
    });
  
    socket.bind(port, address);
  
  
  
    function open(remote, error) {
      return {
        send: function(m) {
          var s = stringify(m);
          if(global.debugger)console.log(s);
          socket.send(new Buffer.from(s, 'binary'), 0, s.length, remote.port, remote.address);          
        },
        protocol: 'UDP',
        release : function() {}
      }; 
    };
    
    return {
      open: open,
      get: open,
      destroy: function() { socket.close(); }
    }
  }

  exports.makeUdpTransport = makeUdpTransport;