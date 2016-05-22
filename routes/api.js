var express = require('express');
var router = express.Router();
var request = require('request');
var fse = require('fs-extra');
var fs = require('fs');
var path = require('path');

router.get('/get/all', function (req, res, next) {
	fse.readJson(path.join(__dirname, "../stocks.json"), function (err, currentStocks) {
		if (err){
			console.log(err);
			res.json({status: "err", errorMessage: "Cannot read file."});
			return;
		}
		res.json({status: "OK", data: currentStocks});
	})
})

router.get('/stock/get/:stock', function(req, res, next) {
	request.get('http://amigobulls.com/ajax/feeds.php?tick=' + req.params.stock, function (err, response, body) {
		if (err){
			console.log(err);
			return;
		}

		if (body){
			// data to render chart
			var data = JSON.parse(body)[1][0];
			res.json({status: 'OK', stock: req.params.stock, data: data});
		}
		else{
			res.json({status: 'err'});
		}

	})
});

router.get('/stock/add/:stock', function (req, res, next) {
	var stockCode = req.params.stock.toUpperCase();
	fse.readJson(path.join(__dirname, "../stocks.json"), function (err, currentStocks) {
		if (err){
			console.log(err);
			res.json({status: "err", errorMessage: "Cannot read current stocks."});
			return;
		}
		if (currentStocks.indexOf(stockCode) >= 0){
			res.json({status: "err", errorMessage: "This stock has already been added."});
			return;
		}
		request.get('http://amigobulls.com/ajax/feeds.php?tick=' + stockCode, function (err, response, body) {
			if (err){
				console.log(err);
				res.json({status: 'err', errorMessage: "Cannot get data of this stock."});
				return;
			}

			if (body){
				// data to render chart
				var data = JSON.parse(body)[1][0];
				res.json({status: 'OK', stock: stockCode, data: data});
				currentStocks.push(stockCode);
				fse.writeJson(path.join(__dirname, "../stocks.json"), currentStocks, function (err) {
					if (err){
						console.log(err);
					}
				})

			}
			else{
				res.json({status: 'err', errorMessage: "Your input is not a stock."});
			}

		})
	});
});

router.get('/stock/delete/:stock', function (req, res, next) {
	var stockCode = req.params.stock.toUpperCase();
	fse.readJson(path.join(__dirname, "../stocks.json"), function (err, currentStocks) {
		if (err){
			console.log(err);
			res.json({status: "err", errorMessage: "Cannot read current stocks."});
			return;
		}
		if (currentStocks.indexOf(stockCode) < 0){
			res.json({status: "err", errorMessage: "Cannot delete a stock that hasn't been added before."});
			return;
		}
		currentStocks.splice(currentStocks.indexOf(stockCode), 1);
		fse.writeJson(path.join(__dirname, "../stocks.json"), currentStocks, function (err) {
			if (err){
				console.log(err);
				res.json({status: "err", errorMessage: "Cannot write file."});
			}
			else {
				res.json({status: "OK", stock: stockCode});
			}
		})
	})
})

module.exports = router;
