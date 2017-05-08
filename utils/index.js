'use strict';

let debug = function(text){
    if(process.env.debug || process.env.DEBUG){
        let d = process.env.debug || process.env.DEBUG;
        if(d == 'voicekeyclient'){
            console.log(text);
        }
    }
}

module.exports = debug;