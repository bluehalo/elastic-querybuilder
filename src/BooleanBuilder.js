const { makeQuery, prepareBoolQuery } = require('./utils');
const { BOOL } = require('./constants');

class BooleanBuilder {

	constructor () {
		/**
		* These filters will be stored as query descriptions. Each push will contain
		* all the properties needed to generate the actualy query object at a later time.
		* We do this so it is trivial to filter them for filtered aggregations at a later point.
		*/
		this._bool = [];
	}

	/**
	* @description Add must boolean queries
	* @param {string} operation - Type of query to perform
	* @param {TERMS|TEXT} field - Field to apply the query to
	* @param {*} value - Value of the query
	* @return {BooleanBuilder} this
	*/
	must (operation, field, value) {
		this._bool.push({
			field,
			type: BOOL.MUST,
			query: { [operation]: makeQuery(field, value)}
		});
		return this;
	}

	/**
	* @description Add must boolean queries
	* @param {string} operation - Type of query to perform
	* @param {TERMS|TEXT} field - Field to apply the query to
	* @param {*} value - Value of the query
	* @return {BooleanBuilder} this
	*/
	should (operation, field, value) {
		this._bool.push({
			field,
			type: BOOL.SHOULD,
			query: { [operation]: makeQuery(field, value)}
		});
		return this;
	}

	/**
	* @description Add must boolean queries
	* @param {string} operation - Type of query to perform
	* @param {TERMS|TEXT} field - Field to apply the query to
	* @param {*} value - Value of the query
	* @return {BooleanBuilder} this
	*/
	filter (operation, field, value) {
		this._bool.push({
			field,
			type: BOOL.FILTER,
			query: { [operation]: makeQuery(field, value)}
		});
		return this;
	}

	/**
	* @description Add must boolean queries
	* @param {string} operation - Type of query to perform
	* @param {TERMS|TEXT} field - Field to apply the query to
	* @param {*} value - Value of the query
	* @return {BooleanBuilder} this
	*/
	must_not (operation, field, value) {
		this._bool.push({
			field,
			type: BOOL.MUST_NOT,
			query: { [operation]: makeQuery(field, value)}
		});
		return this;
	}

	/**
	* @description Build an ES Boolean Query
	* @return {Object} result - ES Query
	*/
	build () {
		return this._bool.length
			? prepareBoolQuery(this._bool)
			: {};
	}

}

module.exports = BooleanBuilder;
