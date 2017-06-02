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
				vk.sessionid = res.headers['x-session-id'];
				deferred.resolve('OK');
			} else {
				delete vk.sessionid;
				deferred.reject( new Error('Header x-session-id undefined') );
			}			
		} else {
			delete vk.sessionid;
			deferred.reject(err);
		}
	});	
	
	return deferred.promise;
}
vk.create_session = create_session;

let get_session_id = function(){
	var deferred = q.defer();
	
	if(vk.session){
		deferred.resolve(vk.sessionid);	
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
	
	if(!vk.sessionid){
	    deferred.reject( new Error('Header x-session-id undefined'));
		return deferred.promise;
	}
	
	let opt = {
		method: 'GET',
		uri: vk.options.endpoint + 'session/',
		headers: { "X-Session-Id": vk.sessionid }
	};
	
	request(opt, function(err, res, body){
		if(!err){
			deferred.resolve(body);
		} else {
		    delete vk.sessionid;
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
	
	if(!vk.sessionid){
	    deferred.reject( new Error('Header x-session-id undefined'));
		return deferred.promise;
	}
	
	let opt = {
		method: 'DELETE',
		uri: vk.options.endpoint + 'session/',
		headers: {"X-Session-Id": vk.sessionid}
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
		debug(res + ' ' + vk.sessionid);
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
	
	if(!vk.options){
	    deferred.reject( new Error('VoiceKey module not initialized.'));
		return deferred.promise;
	}	
	
	if(!vk.sessionid){
	    deferred.reject( new Error('Header x-session-id undefined'));
		return deferred.promise;
	}
	
	let opt = {
		method: 'GET',
		uri: vk.options.endpoint + 'person',
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

let create_person = function(param, options, session){
	var deferred = q.defer();
	
	let personId = param;
	
	if(!vk.options){
	    deferred.reject( new Error('VoiceKey module not initialized.'));
		return deferred.promise;
	}	
	
	if(!vk.sessionid){
	    deferred.reject( new Error('Header x-session-id undefined'));
		return deferred.promise;
	}
	
	let opt = {
		method: 'POST',
		uri: vk.options.endpoint + 'person/' + personId,
		headers: { "X-Session-Id": vk.sessionid },
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
	
	if(!vk.sessionid){
	    deferred.reject( new Error('Header x-session-id undefined'));
		return deferred.promise;
	}
	
	let opt = {
		method: 'GET',
		uri: vk.options.endpoint + 'person/' + personId,
		headers: { "X-Session-Id": vk.sessionid }
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
let create_model = function(param, options, session){
	debug('voicekey.js create_model');
	var deferred = q.defer();
	
	let personId = param;
	
	if(!vk.options){
	    deferred.reject( new Error('VoiceKey module not initialized.'));
		return deferred.promise;
	}
	
	//Enable SAMPLE mode
	vk.options["audio_source"] = "SAMPLE";
	
	if(!vk.sessionid){
	    deferred.reject( new Error('Header x-session-id undefined'));
		return deferred.promise;
	}
		
	let opt = {
		method: 'POST',
		uri: vk.options.endpoint + `person/${personId}/model`,
		headers: { "X-Session-Id": vk.sessionid },
		body: options,
		json: true
	};
		
	request(opt, function(err, res, body){
	    if(!err){
	    	debug('  res.headers = ' + s(res.headers));
	    	
			if(res.headers['x-transaction-id']){
				session.user_data.transaction = res.headers['x-transaction-id'];
				debug('  x-transaction-id: ' + session.user_data.transaction);
			}
			
			debug('  res = ' + s(res));
			let obj, element_id;
			try{
				obj = JSON.parse(body);
				element_id = obj.element_id;
			} catch (e) {
				debug('  catch:body = ' + s(body));
				debug(`  catch:e = ${e.name}:${e.message}`);
			}
			
			session.user_data.element_id = element_id;
			
			deferred.resolve(body);
		} else {
			deferred.reject(err);
		}
	});	
	
	return deferred.promise;	
}
vk.create_model = create_model;

//SAMPLE mode
let status_model = function(param, options, session){
	debug('voicekey.js status_model');
	var deferred = q.defer();
	
	let personId = param;
	
	if(!vk.options){
	    deferred.reject( new Error('VoiceKey module not initialized.'));
		return deferred.promise;
	}
	
	if(!vk.sessionid){
	    deferred.reject( new Error('Header x-session-id undefined'));
		return deferred.promise;
	}
	
	if(!session && !session.user_data && !session.user_data.transaction){
		debug('  transaction = undefined');
	    deferred.reject( new Error('Header x-transaction-id undefined'));
		return deferred.promise;
	}
		
	let opt = {
		method: 'GET',
		uri: vk.options.endpoint + `person/${personId}/model`,
		headers: { 
			"X-Session-Id": vk.sessionid,
			"X-Transaction-id": session.user_data.transaction 
		}
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
vk.status_model = status_model;

//SAMPLE mode
let training_model = function(param, options, session){
	debug('voicekey.js training_model');
	var deferred = q.defer();
	
	let personId = param;
	
	if(!vk.options){
		debug('  options = undefined');
	    deferred.reject( new Error('VoiceKey module not initialized.'));
		return deferred.promise;
	}	
	
	if(!vk.sessionid){
		debug('  session = undefined');
	    deferred.reject( new Error('Header x-session-id undefined'));
		return deferred.promise;
	}
	
	if(!session && !session.user_data && !session.user_data.transaction){
		debug('  transaction = undefined');
	    deferred.reject( new Error('Header x-transaction-id undefined'));
		return deferred.promise;
	}
		
	let opt = {
		method: 'PUT',
		uri: vk.options.endpoint + `person/${personId}/model/sound`,
		headers: {
			"X-Session-Id": vk.sessionid,
			"X-Transaction-id": session.user_data.transaction
		},
		body: { 
			"data": options.data 
		},
		json: true
	};
	
	//debug('  opt = ' + s(opt));
	debug('  session = ' + s(session));
		
	request(opt, function(err, res, body){
	    if(!err){
	    	debug('  res.headers = ' + s(res.headers));
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

//SAMPLE mode
let finishing_model = function(param, options, session){
	debug('voicekey.js finishing_model');
	var deferred = q.defer();
	
	debug('  param = ' + param);
	
	let personId = param;
	
	if(!vk.options){
		debug('  options = undefined');
	    deferred.reject( new Error('VoiceKey module not initialized.'));
		return deferred.promise;
	}	
	
	debug('  vk.options = ' + s(vk.options));
	
	if(!vk.sessionid){
		debug('  session = undefined');
	    deferred.reject( new Error('Header x-session-id undefined'));
		return deferred.promise;
	}
	
	debug('  sessionid = ' + s(vk.sessionid));
	
	debug('  session = ' + s(session));
	
	if(!session && !session.user_data && !session.user_data.transaction){
		debug('  transaction = undefined');
	    deferred.reject( new Error('Header x-transaction-id undefined'));
		return deferred.promise;
	}
	
	debug('  transaction = ' + session.user_data.transaction);

	let opt = {
		method: 'PUT',
		uri: vk.options.endpoint + `person/${personId}/model`,
		headers: {
			"X-Session-Id": vk.sessionid,
			"X-Transaction-id": session.user_data.transaction
		}
	};
	
	debug('  session = ' );
		
	request(opt, function(err, res, body){
	    if(!err){
	    	debug('  body = ' + s(body));
	    	debug('  res = ' + s(res));
	    	try {
		    	delete session.user_data.transaction;
		    	delete session.user_data.element_id;
	    	} catch (e) {
	    		debug(`  e = ${e.name}:${e.message}`);
	    	}
			deferred.resolve(body);
		} else {
			debug('  err = ' + s(err));
			deferred.reject(err);
		}
	});	
	
	return deferred.promise;	
}
vk.finishing_model = finishing_model;

//SAMPLE mode
let init_test_model = function(param, options, session){
	debug('voicekey.js init_test_model');
	var deferred = q.defer();
	
	let personId = param;
	
	if(!vk.options){
	    deferred.reject( new Error('VoiceKey module not initialized.'));
		return deferred.promise;
	}
	
	//Enable SAMPLE mode
	vk.options["audio_source"] = "SAMPLE";
	
	if(!vk.sessionid){
	    deferred.reject( new Error('Header x-session-id undefined'));
		return deferred.promise;
	}
		
	let opt = {
		method: 'POST',
		uri: vk.options.endpoint + `person/${personId}/model`,
		headers: { "X-Session-Id": vk.sessionid },
		body: options,
		json: true
	};
		
	request(opt, function(err, res, body){
	    if(!err){
	    	debug('  res.headers = ' + s(res.headers));
	    	
			if(res.headers['x-transaction-id']){
				session.user_data.inittransaction = res.headers['x-transaction-id'];
				debug('  x-transaction-id: ' + session.user_data.inittransaction);
			}
			
			debug('  res = ' + s(res));
			// let obj, element_id;
			// try{
			// 	obj = JSON.parse(body);
			// 	element_id = obj.element_id;
			// } catch (e) {
			// 	debug('  catch:body = ' + s(body));
			// 	debug(`  catch:e = ${e.name}:${e.message}`);
			// }
			
			// session.user_data.element_id = element_id;
			
			deferred.resolve(body);
		} else {
			deferred.reject(err);
		}
	});	
	
	return deferred.promise;	
}
vk.init_test_model = init_test_model;

//SAMPLE mode
let test_model = function(param, options, session){
	debug('voicekey.js test_model');
	var deferred = q.defer();
	
	let personId = param;
	
	if(!vk.options){
		debug('  options = undefined');
	    deferred.reject( new Error('VoiceKey module not initialized.'));
		return deferred.promise;
	}	
	
	if(!vk.sessionid){
		debug('  session = undefined');
	    deferred.reject( new Error('Header x-session-id undefined'));
		return deferred.promise;
	}
	
	if(!session && !session.user_data && !session.user_data.inittransaction){
		debug('  transaction = undefined');
	    deferred.reject( new Error('Header x-transaction-id undefined'));
		return deferred.promise;
	}
		
	let opt = {
		method: 'PUT',
		uri: vk.options.endpoint + `person/${personId}/authentication/sound`,
		headers: {
			"X-Session-Id": vk.sessionid,
			"X-Transaction-id": session.user_data.inittransaction
		},
		body: { 
			"data": options.data 
		},
		json: true
	};
	
	//debug('  opt = ' + s(opt));
	debug('  session = ' + s(session));
		
	request(opt, function(err, res, body){
	    if(!err){
	    	debug('  res.headers = ' + s(res.headers));
	    	debug('  body = ' + s(body));
	    	debug('  res = ' + s(res));
	    	
	    	delete session.user_data.inittransaction;
			
			deferred.resolve(body);
		} else {
			debug('  err = ' + s(err));
			deferred.reject(err);
		}
	});	
	
	return deferred.promise;	
}
vk.test_model = test_model;

module.exports = vk;