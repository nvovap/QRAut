var express = require('express')
	 , app = express()
     , sse = require('./sse')
	 , server;

var cookieParser = require('cookie-parser');
var session = require('express-session');

var uuid = require('node-uuid');


app.engine('jade', require('jade').__express) //__
app.set('view engine', 'jade')

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

    var client = connectionsForSSE[randomQR];

    if (client) {
        console.log(client.req.session.login)
        console.log(req.session.login)

        res.sseSetup()
        res.sseSend("refresh")
        client.res = res
    }
})


app.get('/', function(req, res){

    var randomQR = uuid.v1()

    req.session.QR = randomQR
    

    connectionsForSSE[randomQR] = {res: res, req: req};

	var qr = require('qr-image');
 
	var qr_svg = qr.image(req.session.QR, { type: 'png' });
	

    console.log(req.session.QR)

    res.render('result', {QR: randomQR})

	//qr_svg.pipe(req.session.QR);



});


app.get('/compareQR/:QRCode', function(req, res){

	var currentQRCode = req.params.QRCode;

	


	var client = connectionsForSSE[currentQRCode];

	if (client) {

        client.req.session.login = true
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