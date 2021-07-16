var express = require('express');
const mongoose = require('mongoose');

const dbName = 'tokensDB'
const dbURL = `mongodb://localhost:27017/${dbName}`


// Connection to MongoDB database	
mongoose
	.connect(dbURL, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
	.then(console.log("Connection successfully established"))
	.catch( err => console.error(err))

var tokensRouter = require('./routes/tokens');

var app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/', express.static(__dirname + '/views')); //Serves resources from public folder

const TokenController = require('./controllers/TokenController');
//First time Fetch call
TokenController.saveTokens();

//Call at fixed interval (Value = 30 Min, Here: 1000 = 1 sec)
setInterval(TokenController.saveTokens, (30*60*1000));

app.use('/', tokensRouter);

module.exports = app;
