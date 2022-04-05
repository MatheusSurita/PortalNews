var mongoose = require('mongoose')
var Schema = mongoose.Schema;
//pegando table especifica 
var usersSchema = new Schema({
    user:String,
    password:String,
   
},{collection:'users'});


var users = mongoose.model("Users",usersSchema);

module.exports = users;