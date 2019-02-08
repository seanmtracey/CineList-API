const moment = require('moment');

module.exports = () => {

	const rightNow = moment();
	const midnight = rightNow.clone().endOf('day');
	const millisecondsLeftInDay = midnight.diff(rightNow, 'milliseconds');

	return millisecondsLeftInDay;

};