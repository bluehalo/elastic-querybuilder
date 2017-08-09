const { invariant } = require('./invariant');
const {
	ERRORS,
	DEFAULTS
} = require('./constants');

class BooleanQueryBuilder {

	constructor (options = {}) {
		// Set up our default options
		this._from = options.from || DEFAULTS.FROM;
		this._size = options.size || DEFAULTS.SIZE;
		this._explain = options.explain || DEFAULTS.EXPLAIN;

		// Items that will be used in the build function
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

	/**
	* @description Build an ES Boolean Query
	* @return {Object} result - ES Query
	*/
	build () {
		const result = {};

		// finally add all the raw parameters
		this._rawParams.forEach((param));
		return result;
	}

}

module.exports = BooleanQueryBuilder;
