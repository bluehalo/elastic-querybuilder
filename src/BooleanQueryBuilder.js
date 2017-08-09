const { invariant } = require('./invariant');
const { ERRORS } = require('./constants');

class BooleanQueryBuilder {

	constructor (options = {}) {
		this._rawParams = [];
	}

	/**
	* @description Add a raw parameter to any part of your query
	* @param {String} path - The path to add the value at
	* @param {Any} value - Value to add at the path
	* @return {BooleanQueryBuilder} this
	*/
	raw (path, value) {
		invariant(path && value, ERRORS.RAW);
		this._rawParams.push({ path, value });
		return this;
	}

}

module.exports = BooleanQueryBuilder;
