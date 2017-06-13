'use strict';

let request = require('request');
let q = require('q');

let debug = function(text){
    if(process.env.debug || process.env.DEBUG){
        let d = process.env.debug || process.env.DEBUG;
        if(d == 'voicekeyclient'){
            console.log(text);
        }
    }
}
module.exports.debug = debug;

let qreq = function(options){
    var deferred = q.defer();

    debug('utils/index.js qreq');
    debug('  options = ' + JSON.stringify(options));

    request(options, (err, response, body) => {
        debug('request ' + options.url);
        if(!err){
            
            debug('  body = ' + body.substring(0,500));
            debug('  response.statusCode = ' + response.statusCode);
            if (response.statusCode == 200){
                deferred.resolve(body);
            } else {
                debug('  statusCode = ' + response.statusCode);
                debug('  body = ' + body.substring(0, 100));
                deferred.reject(new Error('Status code not equal 200. StatusCode = ' + response.statusCode));
            }
            
        } else {
            debug('  error = ' + err.message);
            deferred.reject(err.message)
        }
    });

    return deferred.promise;
}
module.exports.qreq = qreq;
