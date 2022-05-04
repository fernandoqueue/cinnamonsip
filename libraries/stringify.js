function stringifyVersion(v) {
    return v || '2.0';
  }
  
  function stringifyParams(params) {
    var s = '';
    for(var n in params) {
        s += ';'+n+(params[n]?'='+params[n]:'');
    }
  
    return s;
  }
  
  function stringifyUri(uri) {
    if(typeof uri === 'string')
      return uri;
  
    var s = (uri.schema || 'sip') + ':';
  
    if(uri.user) {
      if(uri.password)
        s += uri.user + ':' + uri.password + '@';
      else
        s += uri.user + '@';
    }
  
    s += uri.host;
  
    if(uri.port)
      s += ':' + uri.port;
  
    if(uri.params)
      s += stringifyParams(uri.params);
  
    if(uri.headers) {
      var h = Object.keys(uri.headers).map(function(x){return x+'='+uri.headers[x];}).join('&');
      if(h.length)
        s += '?' + h; 
    }
    return s;
  }
  
  function stringifyAOR(aor) {
    return (aor.name || '') + ' <' + stringifyUri(aor.uri) + '>'+stringifyParams(aor.params); 
  }
  
  function stringifyAuthHeader(a) {
    var s = [];
  
    for(var n in a) {
      if(n !== 'scheme' && a[n] !== undefined) {
        s.push(n + '=' + '"' + a[n] + '"');
      }
    }
  
    return a.scheme ? a.scheme + ' ' + s.join(',') : s.join(',');
  }
  
  
  var stringifiers = {
    via: function(h) {
      return h.map(function(via) {
        if(via.host) {
          return 'Via: SIP/'+stringifyVersion(via.version)+'/'+via.protocol.toUpperCase()+' '+via.host+(via.port?':'+via.port:'')+stringifyParams(via.params)+'\r\n';
        }
        else {
          return '';
        }
      }).join('');
    },
    to: function(h) {
      return 'To: '+stringifyAOR(h) + '\r\n';
     },
    from: function(h) {
      return 'From: '+stringifyAOR(h)+'\r\n';
    },
    contact: function(h) { 
      return 'Contact: '+ ((h !== '*' && h.length) ? h.map(stringifyAOR).join(', ') : '*') + '\r\n';
    },
    route: function(h) {
      return h.length ? 'Route: ' + h.map(stringifyAOR).join(', ') + '\r\n' : '';
    },
    'record-route': function(h) {
      return h.length ? 'Record-Route: ' + h.map(stringifyAOR).join(', ') + '\r\n' : '';
    },
    'path': function(h) { 
      return h.length ? 'Path: ' + h.map(stringifyAOR).join(', ') + '\r\n' : '';
    },
    cseq: function(cseq) { 
      return 'CSeq: '+cseq.seq+' '+cseq.method+'\r\n';
    },
    'www-authenticate': function(h) { 
      return h.map(function(x) { return 'WWW-Authenticate: '+stringifyAuthHeader(x)+'\r\n'; }).join('');
    },
    'proxy-authenticate': function(h) { 
      return h.map(function(x) { return 'Proxy-Authenticate: '+stringifyAuthHeader(x)+'\r\n'; }).join('');
    },
    'authorization': function(h) {
      return h.map(function(x) { return 'Authorization: ' + stringifyAuthHeader(x) + '\r\n'}).join('');
    },
    'proxy-authorization': function(h) {
      return h.map(function(x) { return 'Proxy-Authorization: ' + stringifyAuthHeader(x) + '\r\n'}).join('');; 
    },
    'authentication-info': function(h) {
      return 'Authentication-Info: ' + stringifyAuthHeader(h) + '\r\n';
    },
    'refer-to': function(h) { return 'Refer-To: ' + stringifyAOR(h) + '\r\n'; }
  };
  
  function prettifyHeaderName(s) {
    if(s == 'call-id') return 'Call-ID';
  
    return s.replace(/\b([a-z])/g, function(a) { return a.toUpperCase(); });
  }
  
  function stringify(m) {
    var s;
    if(m.status) {
      s = 'SIP/' + stringifyVersion(m.version) + ' ' + m.status + ' ' + m.reason + '\r\n';
    }
    else {
      s = m.headers.cseq.method + ' ' + stringifyUri(m.uri) + ' SIP/' + stringifyVersion(m.version) + '\r\n';
    }
  
    m.headers['content-length'] = (m.content || '').length;
  
    for(var n in m.headers) {
      if(typeof m.headers[n] !== "undefined") {
        if(typeof m.headers[n] === 'string' || !stringifiers[n]) 
          s += prettifyHeaderName(n) + ': ' + m.headers[n] + '\r\n';
        else
          s += stringifiers[n](m.headers[n], n);
      }
    }
    
    s += '\r\n';
  
    if(m.content)
      s += m.content;
  
    return s;
  }
  
  exports.stringify = stringify;