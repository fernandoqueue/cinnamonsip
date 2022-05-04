let { parseUri } = require('./parsers');

exports.getRealm = function(uri) {
    let parsedData = parseUri(uri);
    return parsedData.host;
}

exports.filter = function(string)
{
    return string.replace('"', '').replace('"', '');
}