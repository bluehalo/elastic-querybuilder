const BooleanBuilder = require('./BooleanBuilder');
const invariant = require('./invariant');

const {
	applyRawParameter
} = require('./utils');

const {
	ERRORS,
	DEFAULTS
} = require('./constants');

class QueryBuilder extends BooleanBuilder {

	constructor (options = {}) {
		super();
		this.query = {
			from: options.from || DEFAULTS.FROM,
			size: options.size || DEFAULTS.SIZE
		};

		// Items for the build method
		this._raw = [];
	}

	/**
	* @description Update the from setting
	* @param {number} from - New value for from
	* @return {QueryBuilder} this
	*/
	from (from) {
		if (from !== undefined) { this.query.from = from; }
		return this;
	}

	/**
	* @description Update the size setting
	* @param {number} newSize - New value for size
	* @return {QueryBuilder} this
	*/
	size (size) {
		if (size !== undefined) { this.query.size = size; }
		return this;
	}

	/**
	* @description Add a raw parameter to any part of your query
	* @param {Object} options - raw options
	* @param {String} options.path - The path to add the value at
	* @param {*} options.value - Value to add at the path
	* @return {BooleanQueryBuilder} this
	*/
	raw ({ path, value }) {
		invariant(path && value, ERRORS.RAW);
		this._raw.push({ path, value });
		return this;
	}

	/**
	* @description Build our ES query
	* @return An elasticsearch query
	*/
	build () {

		// finally add any raw parameter that may exist
		this._raw.forEach((param) => applyRawParameter(this.query, param));

		return this.query;
	}

}

module.exports = QueryBuilder;
