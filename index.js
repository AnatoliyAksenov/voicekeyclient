'use strict';

let express = require('express');
let http  = require('http');
let https = require('https');

const fs = require('fs');
const crypto = require("crypto");

//let session = require('express-session');
let cookieParser = require('cookie-parser');
let multipart = require('connect-multiparty');
let cookieSession = require('cookie-session');

let q = require('q');

let s = JSON.stringify;

let ENABLE_HTTPS = process.env.ENABLE_HTTPS || 0;

let privateKeyFile, certificateFile, privateKey, certificate, credentials;
	
if (ENABLE_HTTPS == 1){
	privateKeyFile = process.env.PRIVATE_KEY_FILE || '/etc/ssl/private/ssl.key';
	certificateFile = process.env.CERTIFICATE_FILE || '/etc/ssl/certs/ssl.cert';
	privateKey  = fs.readFileSync(privateKeyFile, 'utf8');
	certificate = fs.readFileSync(certificateFile, 'utf8');
	
	credentials = {key: privateKey, cert: certificate};
}

//let restful = require('sequelize-restful');
let database = require(__dirname + '/model/index.js');

let debug = require('./utils/index').debug;
let qreq = require('./utils/index').qreq;
let vk = require('./utils/voicekey.js');

//PUSH Notification
let webpush = {}

if(process.env.GOOGLE_SERVER_KEY){
	webpush = require('web-push');
	debug('Set firebase google server key web_push');
	
	
	// VAPID keys should only be generated only once.
	const vapidKeys = webpush.generateVAPIDKeys();

	webpush.setGCMAPIKey(process.env.GOOGLE_SERVER_KEY);

	webpush.setVapidDetails(
	  'mailto:a.aksenov@roseurobank.ru',
	  'BPs8iWzHvo6i-bLRyr57pohjunO4EKOdQ8fYNOWKgkOPH_ZVAlZRQvWW7NMUFXFGCYMWRUdqT232X0dKIfA6P2E',
	  process.env.PRIVATE_APP_KEY
	);
}
// Create a new Express application.
var app = express();

let port = process.env.port || 8080;
let https_port = process.env.HTTPS_PORT || 443;

app.use(cookieParser());
app.use(require('body-parser').urlencoded({ extended: true }));

let sessionMiddleware = cookieSession({
    //store: new redis({}),
    saveUninitialized: true,
    resave: true,
    secret: "RosEuroBnak programmers been here.",
    name: 'session',
    keys: ['rumba pumba pum pum pum  1','dijid jsie ejdkj3 2'],
    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
});

app.use(sessionMiddleware);
app.use('/', express.static('public/app'));

//Global variables
let registred_numbers = [];

let emit = function(ext, event, data){
	var deferred = q.defer();
	if(registred_numbers[ext]){
		registred_numbers[ext].socket.emit(event, data);
		deferred.resolve('OK');		
	} else {
		deferred.reject(new Error('Extension not registred'));
	}

	return deferred.promise;
}

//Check session status
app.all('*', function (req, res, next) {
  //init user_data variable
  if(req.session) {
    if(!req.session.user_data) {
		req.session.user_data = {};
    }
  }
  debug("session=" + s(req.session));
  debug("sessionID=" + req.sessionID);
  next(); // pass control to the next handler
});

app.get('/pushapi/send', function(req, res){
	if(Object.keys(webpush).length) {
		debug('/pushapi/send');
		debug('  req.query = ' + s(req.query));
		let text = req.query['text'];
		let subscription = JSON.parse(req.query['subscription']);
		if(text && subscription){
			webpush.sendNotification(subscription, text);
			res.send('OK');
		} else {
			res.sendStatus(400);
		}
	} else {
		debug('/pushapi/send');
		debug(' pushapi disabled');
		
		res.send(400);
	}
	
});

//VoiceKEY API
vk.init();
app.all(/\/vkapi\/(\w+)\/?(\w+)?/, function(req, res){    
	debug('/vkapi/');
	if(req.method == 'GET'){
		debug('  req.params=' + s(req.params));
		
		let func = req.params[0];
		let param = req.params[1];
		
		debug('  req.query=' + s(req.query));
		let options = req.query['options']? JSON.parse(req.query['options']): undefined;
		
		vk[func](param, options, req.session)
		.then( data => {
			debug('  data=' + s(data));
			res.send(data);
		})
		.fail( err => {
			res.send(err);
		});
	} else if(req.method == 'POST'){
		res.send('POST');
	} else {
		res.send(req.method);
	}
});

//DB API
app.all(/\/dbapi\/(\w+)\/?(\w+)?\/?/, function(req, res){
	debug('/dbapi/');
	if(req.method == 'GET'){
		if(req.params[0] && database[req.params[0]]){
			debug('  req.params=' + s(req.params));
			
			let model = req.params[0];
			let query = req.params[1];
			if(query){
				debug('  req.query=' + s(req.query));
			
				let param = req.query[query];  //single parameter sends as a part of query where key is function name and parameter is value
				let options = req.query['options']? JSON.parse(req.query['options']): undefined;
				let options1 = req.query['options1']? JSON.parse(req.query['options1']): undefined; //for update function
				
				if(!options1){
					//find*, create, destroy
					database[model][query](param || options)
					.then( result => {
						debug('  result = ' + s(result));
						res.json(result);
					})
					.catch( error => {
						debug('  error = ' + error.message);
						res.sendStatus(400);
					});
				} else {
					//update
					database[model][query](param || options, options1)
					.then( result => {
						debug('  result = ' + s(result));
						res.json(result);
					})
					.catch( error => {
						debug('  error = ' + error.message);
						res.sendStatus(400);
					});
				}

			} else {
				debug('  findAll');
				database[model].findAll()
				.then( result => {
					debug('  findAll result rows count ' + result.length);
					res.json(result);
				})
				.catch( error => {
					debug('  findAll error = ' + error.message);
					res.sendStatus(400);
				});	
			}
		} else {
			res.sendStatus(400);
		}
	} else {
		res.sendStatus(400);
	}
});

//API
//Internal phone number
app.get('/api/internal_number', (req, res) => {
	debug('get /api/internal_number\n' + s(req.session));
	if(req.session && req.session.user_data){
		debug('  req.session.user_data.internal_number == ' + req.session.user_data.internal_number);
		res.send(req.session.user_data.internal_number);
	} else {
		res.sendStatus(400);
	}
});

app.post('/api/internal_number', (req, res) => {
	debug('post /api/internal_number');
	
	let internal_number = req.body.internal_number;
	debug('  req.body.internal_number == ' + req.body.internal_number);
	debug('  req.headers == ' + s(req.headers));
	debug('  req.body == ' + s(req.body));
	
	if(req.session){
		debug('  session is ok');
		req.session.user_data = {internal_number: internal_number};
		res.send('OK');
	} else {
		debug(' session is failed:\n'+ s(req.session));
		res.sendStatus(404);
	}
});

app.post('/api/call', (req, res) => {
	debug('post /api/call');
	
	let id = req.body.param_input || 6007;
	let calluuid = req.body.param_calluuid;
	let ani = req.body.param_ani;

	debug('  req.body = ' + s(req.body));
	database.calls.create({calluuid: calluuid, ani: ani, dnis: id})
	emit(id, 'incomingcall', req.body)
	.then( data => {
		debug('  data = ' + s(data));
		//initial session
		
		const model_id = crypto.randomBytes(16).toString("hex");
		debug('  model_id = ' + model_id);

		const extension = req.body.param_input || 6007;
		const call_id = req.body.calluuid || '';

		const options = {
			"extension": extension,
			"call_id": call_id,
			"reset_sound": true,
			"audio_source": "SAMPLE",
			"split_speakers": false
		};
		vk.t_test_model(model_id, options, req.session)
		.progress( data => {
			debug('  t_test_model.progress = '+ s(data));
		})
		.then( data => {
			debug('  t_test_model.data = ' + s(data));
			res.send(data);

		})
		.fail( err => {
			debug('  t_test_model.err = ' + s(err));
			res.send(401);
		});


		res.send('OK');
	})
	.fail( err => {
		debug('  err = ' + err.message);
		res.sendStatus(400);
	});

});

let multipartMiddleware = multipart();

app.all('/test/echo', multipartMiddleware, (req, res) => {
	let echo = `
	/api/echo:req.method = ${req.method }
	/api/echo:connection.remoteAddress = ${req.connection.remoteAddress}
	/api/echo:headers = ${s(req.headers)}
	/api/echo:body = ${s(req.body)}
	/api/echo:file = ${s(req.files)}
	`;

	console.log(echo);

	res.send(echo);
});

app.get('/test/checkfile', (req, res) => {
	debug('get /api/checkfile');	
	qreq({
		method: 'GET', 
		uri: process.env.FILESERVER + req.query.filename,
	    proxy: process.env.HTTP_PROXY
	})
	.then( (body) => {
		res.send('OK');
	})
	.fail( (err) => {
		res.sendStatus(400);
	});
	
});


//create model from file
app.post('/api/mediafile', multipartMiddleware, (req, res) => {
	debug('post /api/mediafile');

	if(req.body && req.files){
		
		let fileContent = fs.readFileSync(req.files.file.path, 'binary');
		let buff = new Buffer(fileContent, 'binary');
		debug('  req.body == ' + s(req.body));
		debug('  req.files == ' + s(req.files));
		debug('  req.files.file == ' + buff.toString('base64').substr(0, 100));
		
		const model_id = crypto.randomBytes(16).toString("hex");
		debug('  model_id = ' + model_id);

		const extension = req.body.param_input || 6007;
		const call_id = req.body.calluuid || '';

		const options = {
			"extension": extension,
			"call_id": call_id,
			"reset_sound": true,
			"audio_source": "SAMPLE",
			"split_speakers": false
		};
		
		const fileOptions = {
			"data": buff.toString('base64')
		};
		
		//SAMPLE mode
		vk.new_model(model_id, options, fileOptions, req.session)
		.progress( data => {
			debug(data.status);
			emit(extension, data.status, data.data);
		})
		.then( data => {
			debug('  new_model.data = ' + s(data));
			res.send(data);
		})
		.fail( err => {
			debug(`  new_model.fail = ${err.code}:${err.name}:${err.message}`);
			res.sendStatus(400);
		});		
		
	} else {
		res.sendStatus(400);
	}
});

//create model from request resource
app.post('/api/media', multipartMiddleware, (req, res) => {
	debug('post /api/media');

	if(req.body){
		
		debug('  req.body == ' + s(req.body));
		debug('  req.files == ' + s(req.files));
		
		const model_id = crypto.randomBytes(16).toString("hex");
		debug('  model_id = ' + model_id);

		const extension = req.body.param_input || 6007;
		const call_id = req.body.param_calluuid || '';
		const ani     = req.body.param_ani;

		const options = {
			"extension": extension,
			"call_id": call_id,
			"reset_sound": true,
			"audio_source": "SAMPLE",
			"split_speakers": false
		};
			

		qreq({
			method: 'GET', 
			uri: process.env.FILESERVER + call_id + '.wav',
			encoding: null,
			proxy: process.env.HTTP_PROXY
		})
		.then( body => {
			
			debug('  qreq body = ' + body.substr(0, 100));

			const fileOptions = {
			  "data": body 
			};

			vk.new_test_model(personId, options, fileOptions, req.session)
			.progress( data => {
				debug(data.status);
				emit(extension, data.status, data.data);
			}).then( data => {
				debug('  new_test_model.data = ' + s(data));
				
				// Checking score
				if(data.score < 99){

					vk.create_model(model_id, options, req.session)
					.then( data => {
						debug('  create_model.data = ' + s(data))
						
						vk.training_model(model_id, fileOptions, req.session)
						.then( data => {
							debug('  training_model.data = ' + s(data));
							
							vk.status_model(model_id, {}, req.session)
							.then( data => {
								debug('  status_model.data = ' + s(data));
								
								emit(extension, 'status_model', data);
								
								vk.finishing_model(model_id, {}, req.session)
								.then( data => {
									debug('  finishing_model:data = ' + s(data));
									let obj = {data: data};
									obj.model_id = model_id;
									emit(extension, 'complete_model', obj);

									res.send('OK');	
								})
								.fail( err => {
									debug(`  finishing_model:err = ${err.code}:${err.name}:${err.message}`);
									res.send('FAIL');
								});
							});
						})
						.fail( err => {
							debug('  training_model fail');
							debug(`  finishing_model:err = ${err.code}:${err.name}:${err.message}`);
							emit(extension, 'error_model', err);
							res.sendStatus(400);
						});
					})
					.fail( err => {
						debug('  create_model fail. ');
						debug(`  finishing_model:err = ${err.code}:${err.name}:${err.message}`);
						emit(extension, 'error_model', err);
						res.sendStatus(400);	
					});
				} else {
					// Here we can update or enrich finded profile
					res.send(data);
				}



			})
			.fail( err => {
				debug(`  new_test_model.fail = ${err.code}:${err.name}:${err.message}`);
				res.sendStatus(400);
			});	

			//SAMPLE mode
			
		})	
		.fail( err => {
			debug(' qreq fail = ' + err.message);
			res.sendStatus(400);
		});
		
	} else {
		res.sendStatus(400);
	}
});

app.post('/api/testfile', multipartMiddleware, (req, res) => {
	debug('post /api/testfile');
	if(req.body && req.files){
		let fileContent = fs.readFileSync(req.files.file.path, 'binary');
		let buff = new Buffer(fileContent, 'binary');
		debug('  req.body == ' + s(req.body));
		debug('  req.files == ' + s(req.files));
		debug('  req.files.file == ' + buff.toString('base64').substr(0, 500));
		
		const personId = req.body.title;
		const extension = req.body.extension || 1234;
		const call_id = req.body.call_id || 1;
		
		const options = {
			"extension": extension,
			"call_id": call_id,
			"reset_sound": true,
			"audio_source": "SAMPLE",
			"split_speakers": false
		};
		
		const fileOptions = {
			"data": buff.toString('base64')
		};
		
		//SAMPLE mode
		vk.new_test_model(personId, options, fileOptions, req.session)
		.progress( data => {
			debug(data.status);
			emit(extension, data.status, data.data);
		}).then( data => {
			debug('  new_test_model.data = ' + s(data));
			res.send(data);
		})
		.fail( err => {
			debug(`  new_test_model.fail = ${err.code}:${err.name}:${err.message}`);
			res.sendStatus(400);
		});	
	} else {
		res.sendStatus(400);
	}
});

app.post('/api/mediatelephony', (req, res) => {
	if(req.body){
		
		debug('  req.body == ' + s(req.body));
		
		const model_id = crypto.randomBytes(16).toString("hex");
		debug('  model_id = ' + model_id);

		const extension = req.body.param_input || 6007;
		const call_id = req.body.param_calluuid || '';
		const ani     = req.body.param_ani;

		const options = {
			"extension": extension,
			"call_id": call_id,
			"reset_sound": true,
			"audio_source": "TELEPHONY",
			"split_speakers": false
		};
		vk.t_create_model(model_id, options, req.session)
		.then( data => {
			debug('  create_model.data = ' + s(data));
			vk.t_status_model(model_id, options, req.session)
			.then( data => {
				res.send(data);
			})
			.fail( err => {
				res.send(err.message);
			});
		})
		.fail( err => {

		});

	} else {
		res.sendStatus(400);
	}
});

// WebSocket api
app.get('/wsapi/:event', (req, res) => {
	debug('get /wsapi/');
	debug('  req.params=' + s(req.params));
	let event = req.params.event;
	let caller_id = req.query.caller_id;
	let data = req.query.data;
	if( event && caller_id && data){
		registred_numbers[caller_id].socket.emit(event, data);
		res.send('OK');	
	} else {
		res.sendStatus(400);	
	}
});

app.get('/api/xml', (req, res) => {
	const jsonxml = require('jsontoxml');
	const query = JSON.parse(req.query.data);

	let data = [];
	for(let row in query){
		data.push({"row": query[row]});
	}
	const result = {"data": data};
	debug('  data = ' + s(result));
	res.send(jsonxml(result));

})

//WEB Server
let server = {};

if(ENABLE_HTTPS == 1){
	server = https.createServer(credentials, app);
	server.listen(https_port, function(){
		console.log('HTTPS server listening on port ' + https_port );
	    debug('Debug enabled.');
	});
} else {
	server = http.createServer(app);
	server.listen(port, function(){
		console.log('HTTP server listening on port ' + port );
	    debug('Debug enabled.');
	});
}

// WebSocket server
var io = require('socket.io')(server);

io.use((socket, next) => {
    sessionMiddleware(socket.request, socket.request.res, next);
});

//map to global
global.io = io;

io.on('connection', socket => {
	
	socket.on('listenner:add', (data) => {
		debug('socket: listenner:add');
		debug('  data == ' + data);
		registred_numbers[data] = {};
		registred_numbers[data].socket = socket;
		//socket.request.session
		socket.emit('listenner:add:response', 'OK');
	});
	
	socket.on('listenner:rm', data => {
		debug('socket: listenner:add');
		debug('  data == ' + data);
		delete registred_numbers[data];
		socket.emit('listenner:rm:response', 'OK');
	});
	
	socket.on('modelling', data => {
		debug('socket: modelling');
		debug('  data == ' + data);
		let personId = socket.request.session.user_data.personId;
		let options = {};
	
		vk.model_info(personId, options, socket.request.session)
		.then(data => {
			socket.emit('modelling_result', data);
		})
		.fail(err => {
			socket.emit('server_error', err);
		});
	});
	
	socket.on('disconnected', () =>{
		if(socket.request.session){
			if(socket.request.session.user_data.internal_number){
				debug('socket: disconnected');
				delete registred_numbers[socket.request.session.user_data.internal_number];
			}
		}
	})
	
});