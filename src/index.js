const BaseBuilder = require('./BaseBuilder');
const invariant = require('./invariant');

const {
	applyRawParameter,
	prepareFilteredAggregation
} = require('./utils');

const {
	ERRORS,
	DEFAULTS
} = require('./constants');

class QueryBuilder extends BaseBuilder {

	constructor (options = {}) {
		super();
		this._query = {
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
		if (from !== undefined) { this._query.from = from; }
		return this;
	}

	/**
	* @description Update the size setting
	* @param {number} newSize - New value for size
	* @return {QueryBuilder} this
	*/
	size (size) {
		if (size !== undefined) { this._query.size = size; }
		return this;
	}

	/**
	* @description Add a raw parameter to any part of your query
	* @param {string} path - The path to add the value at
	* @param {*} value - Value to add at the path
	* @return {BooleanQueryBuilder} this
	*/
	raw (path, value) {
		invariant(path && value && arguments.length === 2, ERRORS.RAW);
		this._raw.push({ path, value });
		return this;
	}

	/**
	* @description Build our boolean ES query
	* @param {Object} options
	* @param {boolean} options.name - Name for your filtered aggregations, default is 'all'
	* @return An elasticsearch query
	*/
	build (options = {}) {
		applyRawParameter(this._query, 'query', super.build());
		// Add filtered aggregations if necessary
		if (this._filteredAggs.length) {
			applyRawParameter(this._query, 'aggs', prepareFilteredAggregation({
				name: options.name || 'all',
				aggregations: this._filteredAggs,
				descriptors: this._queries
			}));
		}

		// finally add any raw parameter that may exist
		this._raw.forEach((param) => applyRawParameter(this._query, param.path, param.value));
		return this._query;
	}

	/**
	* @description Build our ES Aggregations
	* @return An elasticsearch aggregation query
	*/
	buildAggregation () {
		// Merge in our aggregations
		applyRawParameter(this._query, 'aggs', super.buildAggs());
		// finally add any raw parameter that may exist
		this._raw.forEach((param) => applyRawParameter(this._query, param.path, param.value));
		return this._query;
	}

	/**
	* @description Build our DisMax ES query. You can pass anything into options if you want.
	* We are not filtering any options, but keep in mind, anything you pass needs to be a valid
	* property for Elasticsearch
	* @param {Object} options
	* @param {number} options.tie_breaker - tie breaker for ranking terms
	* @param {number} options.boost - Boost to apply to the query
	* @param {Array<Object>} options.queries - Array of queries to use with the builder
	* @return An elasticsearch query
	*/
	buildDisMax (options = {}) {
		invariant(Array.isArray(options.queries), ERRORS.NOT_AN_ARRAY);
		// Add this to our query
		applyRawParameter(this._query, 'query.dis_max', options);
		// finally add any raw parameter that may exist
		this._raw.forEach((param) => applyRawParameter(this._query, param.path, param.value));
		return this._query;
	}

	/**
	* @description Build our MultiMatch ES query. You can pass anything into options if you want.
	* We are not filtering any options, but keep in mind, anything you pass needs to be a valid
	* property for Elasticsearch
	* @param {Object} options
	* @param {string} options.query - String to query for
	* @param {Array<string>} options.fields - Fields to apply this to
	* @param {string} options.type - type to use, default is mest_fields
	* @param {number} options.tie_breaker - tie breaker for ranking terms
	* @param {string} options.minimum_should_match - Boost to apply to the query
	* @return An elasticsearch query
	*/
	buildMultiMatch (options = {}) {
		invariant(Array.isArray(options.fields) && options.query, ERRORS.MULTI_MATCH_ARGS);
		// Add the options to our query
		applyRawParameter(this._query, 'query.multi_match', options);
		// finally add any raw parameter that may exist
		this._raw.forEach((param) => applyRawParameter(this._query, param.path, param.value));
		return this._query;
	}

}

module.exports = QueryBuilder;
