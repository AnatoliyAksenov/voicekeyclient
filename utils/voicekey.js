'use strict';

let q = require('q');
let request = require('request');
let debug = require('./index.js').debug;
let config = require('../config.json');
let vk = {};
global.options = {};
let s = JSON.stringify;

let create_session = function(){
    var deferred = q.defer();
	
	if(!global.options){
	    deferred.reject( new Error('VoiceKey module not initialized.'));
		return deferred.promise;
	}
	
	let opt = {
		method: 'POST',
		uri: global.options.endpoint + 'session/',
		body: { user: global.options.user, password: global.options.phash, domain_id: global.options.domain },
		json: true
	};
		
	request(opt, function(err, res, body){
	    if(!err){
	    	debug(body);
		    if(res.headers['x-session-id']){
				global.sessionid = res.headers['x-session-id'];
				deferred.resolve('OK');
			} else {
				delete global.sessionid;
				deferred.reject( new Error('Header x-session-id undefined') );
			}			
		} else {
			delete global.sessionid;
			deferred.reject(err);
		}
	});	
	
	return deferred.promise;
}
vk.create_session = create_session;

let get_session_id = function(){
	var deferred = q.defer();
	
	if(global.sessionid){
		deferred.resolve(global.sessionid);	
	} else {
		deferred.reject( new Error('VoiceKey x-session-id undefined') );
	}
	
	return deferred.promise;
}
vk.get_session_id = get_session_id;

let check_session = function(){
	var deferred = q.defer();
	
	if(!global.options){
	    deferred.reject( new Error('VoiceKey module not initialized.'));
		return deferred.promise;
	}
	
	if(!global.sessionid){
	    deferred.reject( new Error('Header x-session-id undefined'));
		return deferred.promise;
	}
	
	let opt = {
		method: 'GET',
		uri: global.options.endpoint + 'session/',
		headers: { "X-Session-Id": global.sessionid }
	};
	
	request(opt, function(err, res, body){
		if(!err){
			debug('  body = ' + body);
			deferred.resolve(body);
		} else {
		    delete global.sessionid;
			deferred.reject(err);
		}
	});	
	
	return deferred.promise;	
}
vk.check_session = check_session;

let delete_session = function(){
	var deferred = q.defer();
	
	if(!global.options){
	    deferred.reject( new Error('VoiceKey module not initialized.'));
		return deferred.promise;
	}	
	
	if(!global.sessionid){
	    deferred.reject( new Error('Header x-session-id undefined'));
		return deferred.promise;
	}
	
	let opt = {
		method: 'DELETE',
		uri: global.options.endpoint + 'session/',
		headers: {"X-Session-Id": global.sessionid}
	};
		
	request(opt, function(err, res, body){
	    if(!err){
			deferred.resolve(body);
		} else {
			delete global.sessionid;
			deferred.reject(err);
		}
	});	
	
	return deferred.promise;	
}
vk.delete_session = delete_session;

let init = function(options){
	debug('voicekey.js init');
	let opt = {
		endpoint: process.env.VKENDPOINT || config.VKENDPOINT,
		user: config.VKADMIN,
		phash: process.env.phash,
		domain: config.VKDOMAIN
	};
	if (options){
		let options = {
			endpoint: options.endpoint || opt.endpoint,
			user: options.user || opt.user,
			phash: options.phash || opt.phash,
			domain: options.domain || opt.domain,
		};		
		global.options = options;
		debug('  options = ' + s(global.options));

	} else {
		global.options = opt;
		debug('  options = ' + s(global.options));
	}
	debug('  create_session');
	create_session()
	.then( res => {
		debug(res + ' ' + global.sessionid);
	})
	.fail(err => {
		debug(err.message);
	});

};
vk.init = init;


//person
//vkagent/person
let get_persons = function(){
	var deferred = q.defer();
	
	if(!global.options){
	    deferred.reject( new Error('VoiceKey module not initialized.'));
		return deferred.promise;
	}	
	
	if(!global.sessionid){
	    deferred.reject( new Error('Header x-session-id undefined'));
		return deferred.promise;
	}
	
	let opt = {
		method: 'GET',
		uri: global.options.endpoint + 'person',
		headers: { "X-Session-Id": vk.sessionid }
	};
		
	request(opt, function(err, res, body){
	    if(!err){
			deferred.resolve(body);
		} else {
			deferred.reject(err);
		}
	});	
	
	return deferred.promise;	
}
vk.get_persons = get_persons;

//DO NOT USE
let create_person = function(param, options, session){
	var deferred = q.defer();
	
	let personId = param;
	
	if(!global.options){
	    deferred.reject( new Error('VoiceKey module not initialized.'));
		return deferred.promise;
	}	
	
	if(!global.sessionid){
	    deferred.reject( new Error('Header x-session-id undefined'));
		return deferred.promise;
	}
	
	let opt = {
		method: 'POST',
		uri: global.options.endpoint + 'person/' + personId,
		headers: { "X-Session-Id": global.sessionid },
		body: options,
		json: true
	};
		
	request(opt, function(err, res, body){
	    if(!err){
			deferred.resolve(body);
		} else {
			deferred.reject(err);
		}
	});	
	
	return deferred.promise;	
}
vk.create_person = create_person;

let get_person = function(param, options, session){
	var deferred = q.defer();
	
	let personId = param;
	
	if(!global.options){
	    deferred.reject( new Error('VoiceKey module not initialized.'));
		return deferred.promise;
	}	
	
	if(!global.sessionid){
	    deferred.reject( new Error('Header x-session-id undefined'));
		return deferred.promise;
	}
	
	let opt = {
		method: 'GET',
		uri: global.options.endpoint + 'person/' + personId,
		headers: { "X-Session-Id": global.sessionid }
	};
		
	request(opt, function(err, res, body){
	    if(!err){
	    	debug('  res = ' + s(res));
			deferred.resolve(body);
		} else {
			deferred.reject(err);
		}
	});	
	
	return deferred.promise;	
}
vk.get_person = get_person;

//SAMPLE mode
let sample_mode = require('./voicekey.sample.js');
vk.get_test_model = sample_mode.get_test_model;
vk.test_model = sample_mode.test_model;
vk.init_test_model = sample_mode.init_test_model;
vk.finishing_model = sample_mode.finishing_model;
vk.training_model = sample_mode.training_model;
vk.status_model = sample_mode.status_model;
vk.create_model = sample_mode.create_model;

//TELEPHONY mode
let telephony_mode = require('./voicekey.telephony.js');
vk.t_get_test_model = telephony_mode.get_test_model;
vk.t_test_model = telephony_mode.test_model;
vk.t_init_test_model = telephony_mode.init_test_model;
vk.t_finishing_model = telephony_mode.finishing_model;
vk.t_training_model = telephony_mode.training_model;
vk.t_status_model = telephony_mode.status_model;
vk.t_create_model = telephony_mode.create_model;

module.exports = vk;