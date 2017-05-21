'use strict';

let q = require('q');
let request = require('request');
var vk = {};

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
		endpoint: 'http://10.1.16.225/vkagent/',
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

let get_person = function(personId){
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
		uri: vk.options.endpoint + 'person/' + personId,
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
vk.get_person = get_person;

let create_model = function(personId, options, session){
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
		method: 'POST',
		uri: vk.options.endpoint + `person/${personId}/model`,
		headers: {"X-Session-Id": vk.session},
		body: { 
			"extension": 6007,
			"call_id": 1,
			"reset_sound": true,
			"audio_source": "SAMPLE",
			"split_speakers": false
		},
		json: true
	};
		
	request(opt, function(err, res, body){
	    if(!err){
			if(res.headers['x-transaction-id']){
				session.user_data.transaction = res.headers['x-transaction-id'];
				console.log(session.user_data.transaction);
			}
			
			deferred.resolve(body);
		} else {
			deferred.reject(err);
		}
	});	
	
	return deferred.promise;	
}
vk.create_model = create_model;

module.exports = vk;