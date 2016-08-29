var express = require('express'),
	 app = express(),
	 server;

var cookieParser = require('cookie-parser');
var session = require('express-session')

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
	req.session.numberOfVisits = req.session.numberOfVisits + 1;
	console.log(req.session.numberOfVisits);
	console.log(req.session.login);
	next();
})

app.get('/', function(req, res){
	if (req.session.login == true) {

		res.send("OK login")

	} else {
		var qr = require('qr-image');
 
		var qr_svg = qr.image('I love QR!', { type: 'png' });
		qr_svg.pipe(require('fs').createWriteStream('i_love_qr.png'));

		req.session.QR = "I love QR";

		qr_svg.pipe(res);

	}

	

	//res.send("OK")
});


app.get('/compareQR/:QRCode', function(req, res){

	var currentQRCode = req.params.QRCode;


	var DBSession  = 	require('./Mongo/DBSessions');

	DBSession.findDeviceUser(value, function(findOK){
		if (findOK) {
			console.log("OK Login");
		} else {
			console.log("No Login");
		};
	});


	if (req.session.QR == currentQRCode) {

		req.session.login = true;

		res.send("OK");

	} else {
		req.session.login = false;
		res.send("Error");
	};
	//res.send("OK")
});

//================ Start SERVER ================  
var server = app.listen(process.env.PORT || 3000, function(){
	console.log('Server running on port '+(process.env.PORT || 3000)+'.');
	console.log('-----------------------------------');
	console.log(express.static(__dirname+'/public'));
	console.log(__dirname+'/public');
	console.log('-----------------------------------');

})