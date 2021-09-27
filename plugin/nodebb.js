'use strict';

module.exports = {

	meta: require.main.require('./src/meta'),
	routesHelpers: require.main.require('./src/routes/helpers'),
	topics: require.main.require('./src/topics'),

	nconf: require.main.require('nconf'),
	_: require.main.require('lodash'),
	winston: require.main.require('winston'),
};
