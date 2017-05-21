'use strict';

let express = require('express');
let http = require('http');
let fs = require('fs');
let session = require('express-session');
let cookieParser = require('cookie-parser');
//let redis = require("connect-redis")(session);

//let restful = require('sequelize-restful');
let database = require(__dirname + '/model/index.js');

let debug = require('./utils/index');
let vk = require('./utils/voicekey.js');

// Create a new Express application.
var app = express();

let port = process.env.port || 8080;

app.use(cookieParser());
app.use(require('body-parser').urlencoded({ extended: true }));

let sessionMiddleware = session({
    //store: new redis({}),
    saveUninitialized: true,
    resave: true,
    secret: "RosEuroBnak programmers been here.",
    name: 'session',
    keys: ['kkkey  1','iejdkj3 2'],
    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
});

app.use(sessionMiddleware);

app.use('/', express.static('public/app'));

//Global variables
let registred_numbers = [];

//app.use(restful(database.sequelize));
//app.use(restful(sequelize));

//Check session status
app.all('*', function (req, res, next) {
  //init user_data variable
  if(req.session)
    if(!req.session.user_data)
		req.session.user_data = {};
  debug("session="req.session);
  debug("sessionID="req.sessionID);
  next(); // pass control to the next handler
});

//VoiceKEY API
vk.init();
app.all(/\/vkapi\/(\w+)\/?(\w+)?/, function(req, res){    
	if(req.method == 'GET'){
		let func = req.params[0];
		let param = req.params[1];
		let options = req.query['options']? JSON.parse(req.query['options']): undefined;
		
		vk[func](param, options, req.session)
		.then( data => {
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
	if(req.method == 'GET'){
		if(req.params[0] && database[req.params[0]]){
			let model = req.params[0];
			let query = req.params[1];
			if(query){
				let param = req.query[query]; //single parameter sends as a part of query where key is function name and parameter is value
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
			
		}
	} else {
		res.sendStatus(404);
	}
});

//API
//Speech history
app.get('/api/hists', (req, res) => {
	debug('get /api/hists');
	if(fs.existsSync(__dirname + '/hists.json')){
		var hists = require(__dirname + '/hists.json');
		res.json( hists );
	} else {
		res.sendStatus(404);
	}
});

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

app.get('/api/call', (req,res) => {
	debug('get /api/call');
	
	let id = req.query.caller_id;
	debug('  req.query.caller_id == ' + req.query.caller_id);
	
	if(registred_numbers[id]){
		debug('  caller_id registred');
		registred_numbers[id].socket.emit('call', req.query);
		res.send('OK');
	} else {
		debug('  caller_id not registred');
		res.sendStatus(404);
	}
});

let httpServer = http.createServer(app);
httpServer.listen(port, () => {
  console.log('HTTP server listening on port:' + port);
  debug('Debug enabled.')
});

// WebSocket server
var io = require('socket.io')(httpServer);

io.use((socket, next) => {
    sessionMiddleware(socket.request, socket.request.res, next);
});

io.on('connection', (socket) => {
	
	//TODO: do this automatically
	socket.on('listenner:add', (data) => {
		debug('socket: listenner:add');
		debug('  data == ' + data);
		registred_numbers[data].socket = socket;
		//socket.request.session
		socket.emit('listenner:add:response', 'OK');
	});
	
	//TODO: and this too
	socket.on('listenner:rm', (data) => {
		debug('socket: listenner:add');
		debug('  data == ' + data);
		delete registred_numbers[data];
		socket.emit('listenner:rm:response', 'OK');
	});
	
});

