var mongoose = require('mongoose');

var Metrics = mongoose.Schema({
	kpi: String,
	date:[],
	number:[],
	values:[],
	data:[],
	criticalValues:[],
	minForValues: {
		type:Number,
		default:-1
	},
	maxForValues: {
		type:Number,
		default:-1
	},
	minForNumber: {
		type:Number,
		default:-1
	},
	maxForNumber: {
		type:Number,
		default:-1
	}
	
})

module.exports = mongoose.model('Metrics',Metrics);
