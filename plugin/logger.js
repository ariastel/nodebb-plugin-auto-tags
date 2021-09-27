'use strict';

const { winston } = require('./nodebb');


module.exports = {
	verbose: msg => winston.verbose('[auto-tags]', msg),
	error: msg => winston.error('[auto-tags]', msg),
	warn: msg => winston.warn('[auto-tags]', msg),
};
