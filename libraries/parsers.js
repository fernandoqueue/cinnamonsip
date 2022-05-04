function parseResponse(rs, m) {
    var r = rs.match(/^SIP\/(\d+\.\d+)\s+(\d+)\s*(.*)\s*$/);
  
    if(r) {
      m.version = r[1];
      m.status = +r[2];
      m.reason = r[3];
  
      return m;
    }  
  }
  
  function parseRequest(rq, m) {
    var r = rq.match(/^([\w\-.!%*_+`'~]+)\s([^\s]+)\sSIP\s*\/\s*(\d+\.\d+)/);
  
    if(r) {
      m.method = unescape(r[1]);
      m.uri = r[2];
      m.version = r[3];
  
      return m;
    }
  }
  
  function applyRegex(regex, data) {
    regex.lastIndex = data.i;
    var r = regex.exec(data.s);
  
    if(r && (r.index === data.i)) {
      data.i = regex.lastIndex;
      return r;
    }
  }
  
  function parseParams(data, hdr) {
    hdr.params = hdr.params || {};
  
    var re = /\s*;\s*([\w\-.!%*_+`'~]+)(?:\s*=\s*([\w\-.!%*_+`'~]+|"[^"\\]*(\\.[^"\\]*)*"))?/g; 
    
    for(var r = applyRegex(re, data); r; r = applyRegex(re, data)) {
      hdr.params[r[1].toLowerCase()] = r[2] || null;
    }
  
    return hdr;
  }
  
  function parseMultiHeader(parser, d, h) {
    h = h || [];
  
    var re = /\s*,\s*/g;
    do {
      h.push(parser(d));
    } while(d.i < d.s.length && applyRegex(re, d));
  
    return h;
  }
  
  function parseGenericHeader(d, h) {
    return h ? h + ',' + d.s : d.s;
  }
  
  function parseAOR(data) {
    var r = applyRegex(/((?:[\w\-.!%*_+`'~]+)(?:\s+[\w\-.!%*_+`'~]+)*|"[^"\\]*(?:\\.[^"\\]*)*")?\s*\<\s*([^>]*)\s*\>|((?:[^\s@"<]@)?[^\s;]+)/g, data);
    return parseParams(data, {name: r[1], uri: r[2] || r[3] || ''});
  }
  exports.parseAOR = parseAOR;
  
  function parseAorWithUri(data) {
    var r = parseAOR(data);
    r.uri = parseUri(r.uri);
    return r;
  }
  
  function parseVia(data) {
    var r = applyRegex(/SIP\s*\/\s*(\d+\.\d+)\s*\/\s*([\S]+)\s+([^\s;:]+)(?:\s*:\s*(\d+))?/g, data);
    return parseParams(data, {version: r[1], protocol: r[2], host: r[3], port: r[4] && +r[4]});
  }
  
  function parseCSeq(d) {
    var r = /(\d+)\s*([\S]+)/.exec(d.s);
    return { seq: +r[1], method: unescape(r[2]) };
  }
  
  function parseAuthHeader(d) {
    var r1 = applyRegex(/([^\s]*)\s+/g, d);
    var a = {scheme: r1[1]};
  
    var r2 = applyRegex(/([^\s,"=]*)\s*=\s*([^\s,"]+|"[^"\\]*(?:\\.[^"\\]*)*")\s*/g, d);
    a[r2[1]]=r2[2];
  
    while(r2 = applyRegex(/,\s*([^\s,"=]*)\s*=\s*([^\s,"]+|"[^"\\]*(?:\\.[^"\\]*)*")\s*/g, d)) {
      a[r2[1]]=r2[2];
    }
  
    return a;
  }
  
  function parseAuthenticationInfoHeader(d) {
    var a = {};
    var r = applyRegex(/([^\s,"=]*)\s*=\s*([^\s,"]+|"[^"\\]*(?:\\.[^"\\]*)*")\s*/g, d);
    a[r[1]]=r[2];
  
    while(r = applyRegex(/,\s*([^\s,"=]*)\s*=\s*([^\s,"]+|"[^"\\]*(?:\\.[^"\\]*)*")\s*/g, d)) {
      a[r[1]]=r[2];
    }
    return a;
  }
  
  var compactForm = {
    i: 'call-id',
    m: 'contact',
    e: 'contact-encoding',
    l: 'content-length',
    c: 'content-type',
    f: 'from',
    s: 'subject',
    k: 'supported',
    t: 'to',
    v: 'via'
  };
  
  var parsers = {
    'to': parseAOR,
    'from': parseAOR,
    'contact': function(v, h) {
      if(v == '*')
        return v;
      else
        return parseMultiHeader(parseAOR, v, h);
    },
    'route': parseMultiHeader.bind(0, parseAorWithUri),
    'record-route': parseMultiHeader.bind(0, parseAorWithUri),
    'path': parseMultiHeader.bind(0, parseAorWithUri),
    'cseq': parseCSeq,
    'content-length': function(v) { return +v.s; },
    'via': parseMultiHeader.bind(0, parseVia),
    'www-authenticate': parseMultiHeader.bind(0, parseAuthHeader),
    'proxy-authenticate': parseMultiHeader.bind(0, parseAuthHeader),
    'authorization': parseMultiHeader.bind(0, parseAuthHeader),
    'proxy-authorization': parseMultiHeader.bind(0, parseAuthHeader),
    'authentication-info': parseAuthenticationInfoHeader,
    'refer-to': parseAOR
  };
  
  function parse(data) {
    data = data.split(/\r\n(?![ \t])/);
  
    if(data[0] === '')
      return;
  
    var m = {};
  
    if(!(parseResponse(data[0], m) || parseRequest(data[0], m)))
      return;
  
    m.headers = {};
  
    for(var i = 1; i < data.length; ++i) {
      var r = data[i].match(/^([\S]*?)\s*:\s*([\s\S]*)$/);
      if(!r) {
        return;
      }
  
      var name = unescape(r[1]).toLowerCase();
      name = compactForm[name] || name;
  
      try {
        m.headers[name] = (parsers[name] || parseGenericHeader)({s:r[2], i:0}, m.headers[name]);
      }
      catch(e) {}
    }
  
    return m;
  }
  
  function parseUri(s) {
    if(typeof s === 'object')
      return s;
  
    var re = /^(sips?):(?:([^\s>:@]+)(?::([^\s@>]+))?@)?([\w\-\.]+)(?::(\d+))?((?:;[^\s=\?>;]+(?:=[^\s?\;]+)?)*)(?:\?(([^\s&=>]+=[^\s&=>]+)(&[^\s&=>]+=[^\s&=>]+)*))?$/;
  
    var r = re.exec(s);
  
    if(r) {
      return {
        schema: r[1],
        user: r[2],
        password: r[3],
        host: r[4],
        port: +r[5],
        params: (r[6].match(/([^;=]+)(=([^;=]+))?/g) || [])
          .map(function(s) { return s.split('='); })
          .reduce(function(params, x) { params[x[0]]=x[1] || null; return params;}, {}),
        headers: ((r[7] || '').match(/[^&=]+=[^&=]+/g) || [])
          .map(function(s){ return s.split('=') })
          .reduce(function(params, x) { params[x[0]]=x[1]; return params; }, {})
      }
    }
  }

  function parseMessage(s) {
    var r = s.toString('binary').match(/^\s*([\S\s]*?)\r\n\r\n([\S\s]*)$/);
    if(r) {
      var m = parse(r[1]);
  
      if(m) {
        if(m.headers['content-length']) {
          var c = Math.max(0, Math.min(m.headers['content-length'], r[2].length));
          m.content = r[2].substring(0, c);
        }
        else {
          m.content = r[2];
        }
        
        return m;
      }
    }
  }

  exports.parseMessage = parseMessage;
  exports.parseRequest = parseRequest;
  exports.parseUri = parseUri;