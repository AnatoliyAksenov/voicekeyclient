'use strict';

let q = require('q');
let request = require('request');
let debug = require('./index.js').debug;
let config = require('../config.json');
let s = JSON.stringify;

let create_model = function(param, options, session){
	debug('voicekey.telephony.js create_model');
	var deferred = q.defer();
	
	let personId = param;
	
    debug('  vk.options = ' + s(global.options));
	if(!global.options){
	    deferred.reject( new Error('VoiceKey module not initialized.'));
		return deferred.promise;
	}
	
	//Enable TELEPHONY mode
	options["audio_source"] = "TELEPHONY";
	
	if(!global.sessionid){
	    deferred.reject( new Error('Header x-session-id undefined'));
		return deferred.promise;
	}
		
	let opt = {
		method: 'POST',
		uri: global.options.endpoint + `person/${personId}/model`,
		headers: { "X-Session-Id": global.sessionid },
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
				obj = body;
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
module.exports.create_model = create_model;

let status_model = function(param, options, session){
	debug('voicekey.telephony.js status_model');
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
	
	if(!session && !session.user_data && !session.user_data.transaction){
		debug('  transaction = undefined');
	    deferred.reject( new Error('Header x-transaction-id undefined'));
		return deferred.promise;
	}
		
	let opt = {
		method: 'GET',
		uri: global.options.endpoint + `person/${personId}/model`,
		headers: { 
			"X-Session-Id": global.sessionid,
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
module.exports.status_model = status_model;

let training_model = function(param, options, session){
	debug('voicekey.telephony.js training_model');
	var deferred = q.defer();
	
	let personId = param;
	
	if(!global.options){
		debug('  options = undefined');
	    deferred.reject( new Error('VoiceKey module not initialized.'));
		return deferred.promise;
	}	
	
	if(!global.sessionid){
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
		uri: global.options.endpoint + `person/${personId}/model/sound`,
		headers: {
			"X-Session-Id": global.sessionid,
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
module.exports.training_model = training_model;

let finishing_model = function(param, options, session){
	debug('voicekey.telephony.js finishing_model');
	var deferred = q.defer();
	
	debug('  param = ' + param);
	
	let personId = param;
	
	if(!global.options){
		debug('  options = undefined');
	    deferred.reject( new Error('VoiceKey module not initialized.'));
		return deferred.promise;
	}	
	
	debug('  vk.options = ' + s(global.options));
	
	if(!global.sessionid){
		debug('  session = undefined');
	    deferred.reject( new Error('Header x-session-id undefined'));
		return deferred.promise;
	}
	
	debug('  sessionid = ' + s(global.sessionid));
	
	debug('  session = ' + s(session));
	
	if(!session && !session.user_data && !session.user_data.transaction){
		debug('  transaction = undefined');
	    deferred.reject( new Error('Header x-transaction-id undefined'));
		return deferred.promise;
	}
	
	debug('  transaction = ' + session.user_data.transaction);

	let opt = {
		method: 'PUT',
		uri: global.options.endpoint + `person/${personId}/model`,
		headers: {
			"X-Session-Id": global.sessionid,
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
module.exports.finishing_model = finishing_model;

let init_test_model = function(param, options, session){
	debug('voicekey.telephony.js init_test_model');
	var deferred = q.defer();
	
	let personId = param;
	
	if(!global.options){
	    deferred.reject( new Error('VoiceKey module not initialized.'));
		return deferred.promise;
	}
	
	//Enable TELEPHONY mode
	options["audio_source"] = "TELEPHONY";
	
	if(!global.sessionid){
	    deferred.reject( new Error('Header x-session-id undefined'));
		return deferred.promise;
	}
		
	let opt = {
		method: 'POST',                                
		uri: global.options.endpoint + `person/${personId}/authentication`,
		headers: { "X-Session-Id": global.sessionid },
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
module.exports.init_test_model = init_test_model;

let test_model = function(param, options, session){
	debug('voicekey.telephony.js test_model');
	var deferred = q.defer();
	
	let personId = param;
	
	if(!global.options){
		debug('  options = undefined');
	    deferred.reject( new Error('VoiceKey module not initialized.'));
		return deferred.promise;
	}	
	
	if(!global.sessionid){
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
		uri: global.options.endpoint + `person/${personId}/authentication/sound`,
		headers: {
			"X-Session-Id": global.sessionid,
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
	    	
	    	//delete session.user_data.inittransaction;
			
			deferred.resolve(body);
		} else {
			debug('  err = ' + s(err));
			deferred.reject(err);
		}
	});	
	
	return deferred.promise;	
}
module.exports.test_model = test_model;

let get_test_model = function(param, options, session){
	debug('voicekey.telephony.js get_test_model');
	var deferred = q.defer();
	
	let personId = param;
	
	if(!global.options){
		debug('  options = undefined');
	    deferred.reject( new Error('VoiceKey module not initialized.'));
		return deferred.promise;
	}	
	
	if(!global.sessionid){
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
		method: 'GET',
		uri: global.options.endpoint + `person/${personId}/authentication`,
		headers: {
			"X-Session-Id": global.sessionid,
			"X-Transaction-id": session.user_data.inittransaction
		}
	};
	
	debug('  session = ' + s(session));
		
	request(opt, function(err, res, body){
	    if(!err){
	    	debug('  res.headers = ' + s(res.headers));
	    	debug('  body = ' + s(body));
	    	debug('  res = ' + s(res));
	    	
	    	//delete session.user_data.inittransaction;
			
			deferred.resolve(body);
		} else {
			debug('  err = ' + s(err));
			deferred.reject(err);
		}
	});	
	
	return deferred.promise;	
}
module.exports.get_test_model = get_test_model;
