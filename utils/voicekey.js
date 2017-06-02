'use strict';

let q = require('q');
let request = require('request');
let debug = require('./index.js');
var vk = {};
let s = JSON.stringify;

let create_session = function(){
    var deferred = q.defer();
	
	if(!vk.options){
	    deferred.reject( new Error('VoiceKey module not initialized.'));
		return deferred.promise;
	}
	
	let opt = {
		method: 'POST',
		uri: vk.options.endpoint + 'session/',
		body: { user: vk.options.user, password: vk.options.phash, domain_id: vk.options.domain },
		json: true
	};
		
	request(opt, function(err, res, body){
	    if(!err){
	    	debug(body);
		    if(res.headers['x-session-id']){
				vk.session = res.headers['x-session-id'];
				deferred.resolve('OK');
			} else {
				delete vk.session;
				deferred.reject( new Error('Header x-session-id undefined') );
			}			
		} else {
			delete vk.session;
			deferred.reject(err);
		}
	});	
	
	return deferred.promise;
}
vk.create_session = create_session;

let get_session_id = function(){
	var deferred = q.defer();
	
	if(vk.session){
		deferred.resolve(vk.session);	
	} else {
		deferred.reject( new Error('VoiceKey x-session-id undefined') );
	}
	
	return deferred.promise;
}
vk.get_session_id = get_session_id;

let check_session = function(){
	var deferred = q.defer();
	
	if(!vk.options){
	    deferred.reject( new Error('VoiceKey module not initialized.'));
		return deferred.promise;
	}
	
	if(!vk.session){
	    deferred.reject( new Error('Header x-session-id undefined'));
		return deferred.promise;
	}
	
	let opt = {
		method: 'GET',
		uri: vk.options.endpoint + 'session/',
		headers: {"X-Session-Id": vk.session}
	};
	
	request(opt, function(err, res, body){
		if(!err){
			deferred.resolve(body);
		} else {
		    delete vk.session;
			deferred.reject(err);
		}
	});	
	
	return deferred.promise;	
}
vk.check_session = check_session;

let delete_session = function(){
	var deferred = q.defer();
	
	if(!vk.options){
	    deferred.reject( new Error('VoiceKey module not initialized.'));
		return deferred.promise;
	}	
	
	if(!vk.session){
	    deferred.reject( new Error('Header x-session-id undefined'));
		return deferred.promise;
	}
	
	let opt = {
		method: 'DELETE',
		uri: vk.options.endpoint + 'session/',
		headers: {"X-Session-Id": vk.session}
	};
		
	request(opt, function(err, res, body){
	    if(!err){
			deferred.resolve(body);
		} else {
			delete vk.session;
			deferred.reject(err);
		}
	});	
	
	return deferred.promise;	
}
vk.delete_session = delete_session;

let init = function(options){
	let opt = {
		endpoint: process.env.VKENDPOINT || 'http://10.1.16.225/vkagent/',
		user: 'admin',
		phash: process.env.phash,
		domain: '201'
	};
	if (options){
		vk.options = {
			endpoint: options.endpoint || opt.endpoint,
			user: options.user || opt.user,
			phash: options.phash || opt.phash,
			domain: options.domain || opt.domain,
		};		
	} else {
		vk.options = opt;
	}
	create_session()
	.then( res => {
		console.log(res + ' ' + vk.session);
	})
	.fail(err => {
		console.log(err.message);
	});

};
vk.init = init;


//person
//vkagent/person
let get_persons = function(){
	var deferred = q.defer();
	
	if(!vk.options){
	    deferred.reject( new Error('VoiceKey module not initialized.'));
		return deferred.promise;
	}	
	
	if(!vk.session){
	    deferred.reject( new Error('Header x-session-id undefined'));
		return deferred.promise;
	}
	
	let opt = {
		method: 'GET',
		uri: vk.options.endpoint + 'person',
		headers: {"X-Session-Id": vk.session}
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

let create_person = function(param, options, session){
	var deferred = q.defer();
	
	let personId = param;
	
	if(!vk.options){
	    deferred.reject( new Error('VoiceKey module not initialized.'));
		return deferred.promise;
	}	
	
	if(!vk.session){
	    deferred.reject( new Error('Header x-session-id undefined'));
		return deferred.promise;
	}
	
	let opt = {
		method: 'POST',
		uri: vk.options.endpoint + 'person/' + personId,
		headers: {"X-Session-Id": vk.session},
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
	
	if(!vk.options){
	    deferred.reject( new Error('VoiceKey module not initialized.'));
		return deferred.promise;
	}	
	
	if(!vk.session){
	    deferred.reject( new Error('Header x-session-id undefined'));
		return deferred.promise;
	}
	
	let opt = {
		method: 'GET',
		uri: vk.options.endpoint + 'person/' + personId,
		headers: {"X-Session-Id": vk.session}
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

let create_model = function(param, options, session){
	debug('voicekey.js create_model');
	var deferred = q.defer();
	
	let personId = param;
	
	if(!vk.options){
	    deferred.reject( new Error('VoiceKey module not initialized.'));
		return deferred.promise;
	}	
	
	if(!vk.session){
	    deferred.reject( new Error('Header x-session-id undefined'));
		return deferred.promise;
	}
		
	let opt = {
		method: 'POST',
		uri: vk.options.endpoint + `person/${personId}/model`,
		headers: { "X-Session-Id": vk.session },
		body: options,
		json: true
	};
		
	request(opt, function(err, res, body){
	    if(!err){
			if(res.headers['x-transaction-id']){
				session.user_data.transaction = res.headers['x-transaction-id'];
				console.log(session.user_data.transaction);
			}
			debug('  res = ' + s(res));
			deferred.resolve(body);
		} else {
			deferred.reject(err);
		}
	});	
	
	return deferred.promise;	
}
vk.create_model = create_model;

let training_model = function(param, options, session){
	debug('voicekey.js training_model');
	var deferred = q.defer();
	
	let personId = param;
	
	if(!vk.options){
	    deferred.reject( new Error('VoiceKey module not initialized.'));
		return deferred.promise;
	}	
	
	if(!vk.session){
	    deferred.reject( new Error('Header x-session-id undefined'));
		return deferred.promise;
	}
	
	if(!session && !session.user_data && !session.user_data.transaction){
	    deferred.reject( new Error('Header x-transaction-id undefined'));
		return deferred.promise;
	}
		
	let opt = {
		method: 'PUT',
		uri: vk.options.endpoint + `person/${personId}/model`,
		headers: {
			"X-Session-Id": vk.session,
			"X-Transaction-id": session.user_data.transaction
		},
		body: { 
			"file": options.file 
		},
		json: true
	};
	
	debug('  session = ' + s(session));
		
	request(opt, function(err, res, body){
	    if(!err){
	    	debug('  body = ' + s(body));
	    	debug('  res = ' + s(res));
			deferred.resolve(body);
		} else {
			debug('  err = ' + s(err));
			deferred.reject(err);
		}
	});	
	
	return deferred.promise;	
}
vk.training_model = training_model;

let model_info = function(personId, options, session){
	var deferred = q.defer();
	
	if(!vk.options){
	    deferred.reject( new Error('VoiceKey module not initialized.'));
		return deferred.promise;
	}	
	
	if(!vk.session){
	    deferred.reject( new Error('Header x-session-id undefined'));
		return deferred.promise;
	}
	
	if(!session && session.user_data.transaction){
	    deferred.reject( new Error('Header x-transaction-id undefined'));
		return deferred.promise;
	}
		
	let opt = {
		method: 'GET',
		uri: vk.options.endpoint + `person/${personId}/model`,
		headers: {
			"X-Session-Id":     vk.session,
			"X-Transaction-id": session.user_data.transaction
		}
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
vk.model_info = model_info;

module.exports = vk;