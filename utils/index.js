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

    request(options, (err, req, body) => {
        debug('request ' + options.url);
        if(!err){
            debug('  body = ' + body.substring(0,500));
            deferred.resolve(body);
        } else {
            debug('  error = '+ err.message);
            deferred.reject(err.message)
        }
    });

    return deferred.promise;
}
module.exports.qreq = qreq;
