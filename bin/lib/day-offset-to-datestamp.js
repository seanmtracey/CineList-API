const debug = require('debug')('bin:lib:day-offset-to-datestamp');
const moment = require('moment');

const DAY_IN_SECONDS = 86400;

module.exports = function(offset){
	debug(`Offset is ${offset}`);
	return moment( ( new Date() / 1000 ) + offset * DAY_IN_SECONDS , "X").format("YYYY-MM-DD");
};