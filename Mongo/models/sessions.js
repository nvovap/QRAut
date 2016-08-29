

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var UserSchema  = new Schema({
	user: String,
	password: String
});


// // assign a function to the "methods" object of our animalSchema
// UserSchema.methods.findUser = function (cb) {
//   return this.model('users').find({ user: this.user }, cb);
// }

mongoose.model('users', UserSchema);

