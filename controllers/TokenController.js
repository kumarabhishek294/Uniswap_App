const got = require("got");
const mongoose = require('mongoose');

//Token Schema
const tokenSchema = mongoose.Schema({
	id: String,
	symbol: String,
	name: String,
	decimals: Number,
	totalSupply: Number,
	tradeVolume: Number,
	tradeVolumeUSD: Number,
	untrackedVolumeUSD: Number,
	txCount: Number,
	totalLiquidity: Number,
	derivedETH: Number,
	mostLiquidPairs: Array,
})
tokenSchema.index({ id: 1}, { unique: true });
const Token = mongoose.model('Token', tokenSchema)

// constructor
const TokenController = function() {
  
};

//Save tokens to mongo db
TokenController.saveTokens = (req, res) => {
	console.log("Add token called...");
	{
		const accessToken =  "QmWTrJJ9W8h3JE19FhCzzPYsJ2tgXZCdUqnbyuo64ToTBN";
		const endpoint = "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2";
		
		const query = 
		  `{
			tokens {
				id
				symbol
				name
				decimals
				totalSupply
				tradeVolume
				tradeVolumeUSD
				untrackedVolumeUSD
				txCount
				totalLiquidity
				derivedETH
			}
		  }`;
		
		const options = {
		  headers: {
			Authorization: "Bearer " + accessToken,
			"Content-Type": "application/json",
		  },
		  body: JSON.stringify({ query }),
		};
		
		got
		  .post(endpoint, options)
		  .then((response) => {
			var myData = response.body;
			let tokens = (JSON.parse(myData)).data.tokens;
			// console.log(tokens);
			// return;
			tokens.forEach(async token => {
				// Create new document inside collection
				const currentTokenID = token.id;
				const filter = { id: currentTokenID };
				const update = {
					symbol: token.symbol,
					name: token.name,
					decimals: token.decimals,
					totalSupply: token.totalSupply,
					tradeVolume: token.tradeVolume,
					tradeVolumeUSD: token.tradeVolumeUSD,
					untrackedVolumeUSD: token.untrackedVolumeUSD,
					txCount: token.txCount,
					totalLiquidity: token.totalLiquidity,
					derivedETH: token.derivedETH,
				};
				try {
				  //Update if already exist
				  let doc = await Token.findOneAndUpdate(filter, update);
		
				  // Add new entry
				  if(!doc){
					// addCount++;
					const currentToken = new Token ({
						id: token.id,
						symbol: token.symbol,
						name: token.name,
						decimals: token.decimals,
						totalSupply: token.totalSupply,
						tradeVolume: token.tradeVolume,
						tradeVolumeUSD: token.tradeVolumeUSD,
						untrackedVolumeUSD: token.untrackedVolumeUSD,
						txCount: token.txCount,
						totalLiquidity: token.totalLiquidity,
						derivedETH: token.derivedETH,
					})
		
					currentToken.save()
					.then(doc => {
						//console.log('save done');
					})
					.catch(err => {
					  if(err.code == 11000) {
						console.log(currentToken.id, errCount);
					  }
					});
				  }
				} catch (error) {
					console.log(error);
				}
			});

		  })
		  .catch((error) => {
			console.log(error);
		  });
	}
}

//Load and view Tokens
TokenController.viewTokens = async (req, res) => {
	const sortBy = req.query.sortBy;
	const limit = parseInt(req.query.limit);
	// const sortBy = req.query.page;
	if((sortBy == "tradeVolumeUSD" || sortBy == "totalLiquidity" || sortBy == "untrackedVolumeUSD") && (limit > 0)){
		let search = {};
		let filter = '-_id id symbol name decimals totalSupply tradeVolume tradeVolumeUSD untrackedVolumeUSD txCount totalLiquidity derivedETH';
		let result = await Token.find(search, filter).sort(sortBy).limit(limit).exec();
		res.send(result);
	}else{
		res.send("Invalid search parameters");
	}
	
}

module.exports = TokenController;