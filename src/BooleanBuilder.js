const { makeQuery, prepareBoolQuery } = require('./utils');
const { BOOL } = require('./constants');

class BooleanBuilder {

	constructor () {
		this._bool = {
			[BOOL.MUST]: [],
			[BOOL.SHOULD]: [],
			[BOOL.FILTER]: [],
			[BOOL.MUST_NOT]: []
		};
	}

	/**
	* @description Add must boolean queries
	* @param {string} type - Type of query to perform
	* @param {TERMS|TEXT} field - Field to apply the query to
	* @param {*} value - Value of the query
	* @param {Function} callback - Callback for nesting
	* @return {BooleanBuilder} this
	*/
	must (type, field, value) {
		this._bool[BOOL.MUST].push({
			[type]: makeQuery(field, value)
		});
		return this;
	}

	/**
	* @description Add must boolean queries
	* @param {string} type - Type of query to perform
	* @param {TERMS|TEXT} field - Field to apply the query to
	* @param {*} value - Value of the query
	* @param {Function} callback - Callback for nesting
	* @return {BooleanBuilder} this
	*/
	should (type, field, value) {
		this._bool[BOOL.SHOULD].push({
			[type]: makeQuery(field, value)
		});
		return this;
	}

	/**
	* @description Add must boolean queries
	* @param {string} type - Type of query to perform
	* @param {TERMS|TEXT} field - Field to apply the query to
	* @param {*} value - Value of the query
	* @param {Function} callback - Callback for nesting
	* @return {BooleanBuilder} this
	*/
	filter (type, field, value) {
		this._bool[BOOL.FILTER].push({
			[type]: makeQuery(field, value)
		});
		return this;
	}

	/**
	* @description Add must boolean queries
	* @param {string} type - Type of query to perform
	* @param {TERMS|TEXT} field - Field to apply the query to
	* @param {*} value - Value of the query
	* @param {Function} callback - Callback for nesting
	* @return {BooleanBuilder} this
	*/
	must_not (type, field, value) {
		this._bool[BOOL.MUST_NOT].push({
			[type]: makeQuery(field, value)
		});
		return this;
	}

	/**
	* @description Build an ES Boolean Query
	* @return {Object} result - ES Query
	*/
	build () {
		return this.canBuild()
			? prepareBoolQuery(this._bool)
			: {};
	}

	/**
	* @description Do we have any queries to build
	* @return {boolean}
	*/
	canBuild () {
		return Object.getOwnPropertyNames(this._bool).some(key => this._bool[key].length);
	}

}

module.exports = BooleanBuilder;
