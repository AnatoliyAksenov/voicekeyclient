'use strict';

let express = require('express');
let http  = require('http');
let https = require('https');

let fs = require('fs');
let session = require('express-session');
let cookieParser = require('cookie-parser');
//let redis = require("connect-redis")(session);

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

let debug = require('./utils/index');
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

let sessionMiddleware = session({
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

//Check session status
app.all('*', function (req, res, next) {
  //init user_data variable
  if(req.session) {
    if(!req.session.user_data) {
		req.session.user_data = {};
    }
  }
  debug("session=" + JSON.stringify(req.session));
  debug("sessionID=" + req.sessionID);
  next(); // pass control to the next handler
});

app.get('/pushapi/send', function(req, res){
	if(Object.keys(webpush).length) {
		debug('/pushapi/send');
		debug('  req.query = ' + JSON.stringify(req.query));
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
		debug('  req.params=' + JSON.stringify(req.params));
		
		let func = req.params[0];
		let param = req.params[1];
		
		debug('  req.query=' + JSON.stringify(req.query));
		let options = req.query['options']? JSON.parse(req.query['options']): undefined;
		
		vk[func](param, options, req.session)
		.then( data => {
			debug('  data=' + JSON.stringify(data));
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
			debug('  req.params=' + JSON.stringify(req.params));
			
			let model = req.params[0];
			let query = req.params[1];
			if(query){
				debug('  req.query=' + JSON.stringify(req.query));
			
				let param = req.query[query];  //single parameter sends as a part of query where key is function name and parameter is value
				let options = req.query['options']? JSON.parse(req.query['options']): undefined;
				
				database[model][query](param || options).then(result => {
					res.json(result);
				});
			} else {
				database[model].findAll().then(result => {
					res.json(result);
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
	debug('get /api/internal_number\n' + JSON.stringify(req.session));
	if(req.session && req.session.user_data){
		debug('  req.session.user_data.internal_number == ' + req.session.user_data.internal_number);
		res.send(req.session.user_data.internal_number);
	} else {
		res.send('');
	}
});

app.post('/api/internal_number', (req, res) => {
	debug('post /api/internal_number');
	
	let internal_number = req.body.internal_number;
	debug('  req.body.internal_number == ' + req.body.internal_number);
	debug('  req.headers == ' + JSON.stringify(req.headers));
	debug('  req.body == ' + JSON.stringify(req.body));
	
	if(req.session){
		debug('  session is ok');
		req.session.user_data = {internal_number: internal_number};
		res.send('OK');
	} else {
		debug(' session is failed:\n'+ JSON.stringify(req.session))
		res.sendStatus(404);
	}
});

app.get('/api/call', (req, res) => {
	debug('get /api/call');
	
	let id = req.query.caller_id;
	debug('  req.query.caller_id == ' + req.query.caller_id);
	
	if(registred_numbers[id]){
		debug('  caller_id registred');
		registred_numbers[id].socket.emit('incomingcall', req.query);
		res.send('OK');
	} else {
		debug('  caller_id not registred');
		res.sendStatus(400);
	}
});

// WebSocket api
app.get('/wsapi/:event', (req, res) => {
	debug('get /wsapi/');
	debug('  req.params=' + JSON.stringify(req.params));
	let event = req.params.event;
	let caller_id = req.query.caller_id;
	let data = req.query.data;
	if( event && caller_id && data){
		registred_numbers[caller_id].socket.emit(event, data);
	} else {
		res.sendStatus(400);	
	}
});

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
		console.log('HTTP server listening on port ' + https_port );
	    debug('Debug enabled.');
	});
}

// WebSocket server
var io = require('socket.io')(server);

io.use((socket, next) => {
    sessionMiddleware(socket.request, socket.request.res, next);
});

io.on('connection', socket => {
	
	//TODO: do this automatically
	socket.on('listenner:add', (data) => {
		debug('socket: listenner:add');
		debug('  data == ' + data);
		registred_numbers[data] = {};
		registred_numbers[data].socket = socket;
		//socket.request.session
		socket.emit('listenner:add:response', 'OK');
	});
	
	//TODO: and this too
	socket.on('listenner:rm', data => {
		debug('socket: listenner:add');
		debug('  data == ' + data);
		delete registred_numbers[data];
		socket.emit('listenner:rm:response', 'OK');
	});
	
});