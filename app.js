var express = require('express'),
	 app = express(),
	 server;

var cookieParser = require('cookie-parser');
var session = require('express-session');

var uuid = require('node-uuid');

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


var Clients = {
    /**
     * Дескрипторы клиентов
     *
     * @type Object[]
     */
    _clients: [],

    /**
     * Количество клиентов онлайн
     *
     * @type Number
     */
    count: 0,

    /**
     * Удаляем клиента
     * 
     * @param {Number} clientId
     */
    remove: function (clientId) {
        // Если клиента нет, то ничего не делаем
        var client = this._clients[clientId];
        if (!client) {
            return;
        }
        // Закрываем соединение
        client.response.end();
        // Удаляем клиента
        delete this._clients[clientId];
        this.count--;
        
        // Сообщаем всем оставшимся, что он вышел
        // Рассылаем сообщения от имени бота
        //this.broadcast(client.name);
    },

    /**
     * Добавляем клиента
     *
     * @param {Number}   clientId
     * @param {Response} response
     * @param {String}   name
     */
    add: function (clientId, response, request) {
        this._clients[clientId] = {response: response, request: request};
        this.count++;
    },

    /**
     * Рассылаем всем сообщение
     *
     * @param {String}  message
     * @param {String}  name
     * @param {Boolean} isbot
     */
    broadcast: function (message) {
        this._send(this._clients, message);
    },

    /**
     * Отправляем сообщение одному клиенту
     *
     * @param {Number}  clientId
     * @param {String}  message
     * @param {String}  name
     * @param {Boolean} isbot
     */
    unicast: function (clientId, message) {
        var client = this._clients[clientId];
        if (!client) {
            return;
        }

        this._send([client], message);
    },

    /**
     * Общий метод для отправки сообщений
     *
     * @param {Object[]} clients
     * @param {String}   message
     * @param {String}   name
     * @param {Boolean}  isbot
     */
    _send: function (clients, message) {
        if (!message) {
            return;
        }
        // Подготавливаем сообщение
        var data = JSON.stringify({
            message: message.substr(0, 1000)
        });

        // Создаем новый буфер, чтобы при большом количестве клиентов
        // Отдача была более быстрой из-за особенностей архитектуры Node.js
        data = new Buffer("data: " + data + "\n\n", 'utf8');

        // Рассылаем всем
        clients.forEach(function (client) {
            client.response.write(data); // Отсылаем буфер
        });
    },

    /**
     * Метод для получения ид следующего клиента
     */
    generateClientId: function () {
        return this._clients.length;
    }
};

app.use(function(req, res, next){
	// req.session.numberOfVisits = req.session.numberOfVisits + 1;
	// console.log(req.session.numberOfVisits);
	// console.log(req.session.login);
	next();
})

app.get('/', function(req, res, next){



	// if (req.session.login == true) {

	// 	res.send("Authentication OK")

	// } else {

		var idQR = uuid.v1();

		

		req.session.QR = idQR;


		req.socket.setTimeout(1000 * 60 * 60); // 1 Час

		//res.writeHead(200, {'Content-Type': 'text/event-stream'});

		console.log(res._headers);

		res.removeHeader('x-powered-by');

		console.log(res._headers);

	

		

        // Если соединение упало - удаляем этого клиента
        req.on('close', function () {
            Clients.remove(idQR);
        });

        Clients.add(idQR, res, req);

		//qr_svg.pipe(res);

		//res.send(idQR);

		next();

	//}

	

	//res.send("OK")
});

app.get('/', function(req, res){



	// var qr = require('qr-image');
 
	// var qr_svg = qr.image(idQR, { type: 'png' });
	// qr_svg.pipe(require('fs').createWriteStream('i_love_qr.png'));

	//qr_svg.pipe(req.session.QR);

	//res.send("http://localhost:3000/compareQR/"+req.session.QR);

	

	//res.send("OK")
});


app.get('/compareQR/:QRCode', function(req, res){

	var currentQRCode = req.params.QRCode;

	// console.log(currentQRCode);

	//console.log(Clients._clients);


	var client = Clients._clients[currentQRCode];

	if (client) {

		if (client.request.session.QR == currentQRCode ) {

			client.request.session.login = true;

			console.log("login 1");




			client.response.writeHead(200, {
			    'Content-Type': 'text/event-stream',
			    'Cache-Control': 'no-cache',
			    'Connection': 'keep-alive'
			 });
			client.response.write('\n');
			

			//client.request.res.send("OK Authentication");


			console.log("login 2");

			Clients.remove(currentQRCode);

			console.log("login 3");


		} else {
			client.request.session.login = false;
			client.response.send("Error Authentication");
		};
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