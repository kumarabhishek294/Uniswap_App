var express = require('express');
var router = express.Router();
const TokenController = require('../controllers/TokenController');

//Homepage
router.get('/', function(req, res, next) {
	res.render('index', { title: 'Express' });
});

//Route to view token with sort & limit 
router.get('/tokens', TokenController.viewTokens);
	
module.exports = router;
	