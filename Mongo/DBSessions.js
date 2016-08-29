

var mongoose = require('mongoose')
    , usersModel = require('./models/sessions'),
     Session = mongoose.model('sessions');



exports.findSession =  function(QRCode, callback) {

    Devices.find({'QR': QRCode}, function(err, QRCodes){
         if (QRCodesQRCodes.length > 0) {

            console.log(QRCodes[0]);


            callback(true);
            //callback(QRCodes[0]);
         } else {
            console.log("Not find token!")
            callback(false);
        }
     });
    
}

var db  = "";

exports.connect = function(){
    //mongoose.connection.close();

    mongoose.connect('mongodb://user2:1qazxsw2@ds013486.mlab.com:13486/test_nvovap_mongodb');
    db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function callback () {
    console.log('Successfully mongodb is connected');
  });
};

exports.disconnect = function(){

    if (db != ""){
        db.disconnect();
    }
};

//exports.disconnect();

