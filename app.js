var express = require('express')
	 , app = express()
     , sse = require('./sse')
	 , server;

var cookieParser = require('cookie-parser');
var session = require('express-session');

var fs = require('fs')

var uuid = require('node-uuid');


app.engine('jade', require('jade').__express) //__
app.set('view engine', 'jade')


app.use(express.static(__dirname+'/public'));

app.use(sse)

//Setup Jade
// app.disable('x-powered-by');
// app.set('view engine', 'jade');
// //app.set('view engine', 'hjs');

// app.use(express.static(__dirname+'/public')); //it is DIR for content
// app.set('views', __dirname + '/views'); //it is DIT for templase 

const MongoStore = require('connect-mongo')(session);


app.use(cookieParser());
app.use(session({
	secret: "qazxsw",
	store: new MongoStore({
      url: 'mongodb://user2:1qazxsw2@ds013486.mlab.com:13486/test_nvovap_mongodb'
    })
}));





app.use(function(req, res, next){
	// req.session.numberOfVisits = req.session.numberOfVisits + 1;
	// console.log(req.session.numberOfVisits);
	// console.log(req.session.login);
	next();
})


var connectionsForSSE = []

app.get('/stream', function(req, res) {

    var randomQR = req.query.randomQR


    connectionsForSSE[randomQR] = {res: res, user: "", login: false};
    res.sseSetup()
    res.sseSend("begin")

})


app.get('/login', function(req, res){

	console.log("Login")

	var currentQRCode = req.query.id


	var client = connectionsForSSE[currentQRCode];

	if (client) {
		if (client.login) {

			res.send("Hello " + client.user);
			req.session.user = client.user

		} else {
			res.redirect('/');
		}

		

		fs.unlink('public/'+ currentQRCode + '.png', function(err) {
		    if (err) return console.error(err);
		});

		delete connectionsForSSE[currentQRCode]
	} else {
		res.send("error");
	};

})



app.get('/', function(req, res){

    var randomQR = uuid.v1()

   

    

	var qr = require('qr-image');
 
	var qr_svg = qr.image(req.session.QR, { type: 'png' });

	var imageg = fs.createWriteStream('public/' +randomQR+'.png')
	qr_svg.pipe(imageg);
	

    res.render('result', {QR: randomQR, QRCode: randomQR+'.png'})

	//qr_svg.pipe(req.session.QR);



});


app.get('/compareQR/:QRCode', function(req, res){

	var currentQRCode = req.params.QRCode;
	var user = req.query.user

	var client = connectionsForSSE[currentQRCode];

	if (client) {

 		client.user = user
 		client.login = true
        client.res.sseSend(currentQRCode)

		res.send("OK");
	} else {
		res.send("error");
	};
});

//================ Start SERVER ================  
var server = app.listen(process.env.PORT || 3000, function(){
	console.log('Server running on port '+(process.env.PORT || 3000)+'.');
	console.log('-----------------------------------');
	console.log(express.static(__dirname+'/public'));
	console.log(__dirname+'/public');
	console.log('-----------------------------------');

})