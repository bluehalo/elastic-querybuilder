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
	* @param {number} size - New value for size
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
	* @param {boolean} options.filterAggs - Whether of not to apply filters to an aggregation
	* @return An elasticsearch query
	*/
	build (options = {}) {
		const path = this.hasShould() ? 'query.bool.filter' : 'query';
		applyRawParameter(this._query, path, super.build());
		// Add filtered aggregations if we have any
		if (this.hasAggs() && options.filterAggs) {
			applyRawParameter(this._query, 'aggs', prepareFilteredAggregation(
				this.getAggs(),
				this.getQueries(),
				options.name
			));
		}
		// Add aggregations if we have any
		else if (this.hasAggs()) {
			applyRawParameter(this._query, 'aggs', this.getAggs());
		}

		// Add our sorting options
		if (this.hasSort()) {
			applyRawParameter(this._query, 'sort', this.getSorts());
		}

		// finally add any raw parameter that may exist
		this._raw.forEach((param) => applyRawParameter(this._query, param.path, param.value));
		return Object.assign({}, this._query);
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
		// Check if we have other queries to apply
		if (this.hasQuery()) {
			// Add the options to a boolean filter
			applyRawParameter(this._query, 'query.bool.filter', [
				super.build(),
				{ dis_max: options }
			]);
		} else {
			// Add the options to our query
			applyRawParameter(this._query, 'query.dis_max', options);
		}

		// finally add any raw parameter that may exist
		this._raw.forEach((param) => applyRawParameter(this._query, param.path, param.value));
		return Object.assign({}, this._query);
	}

	/**
	* @description Build our MultiMatch ES query. You can pass anything into options if you want.
	* We are not filtering any options, but keep in mind, anything you pass needs to be a valid
	* property for Elasticsearch
	* @param {Object} options
	* @param {string} options.query - String to query for
	* @param {Array<string>} options.fields - Fields to apply this to
	* @param {string} options.type - type to use, default is most_fields
	* @param {number} options.tie_breaker - tie breaker for ranking terms
	* @param {string} options.minimum_should_match - Boost to apply to the query
	* @return An elasticsearch query
	*/
	buildMultiMatch (options = {}) {
		invariant(Array.isArray(options.fields) && options.query, ERRORS.MULTI_MATCH_ARGS);
		// Check if we have other queries to apply
		if (this.hasQuery()) {
			// Add the options to a boolean filter
			applyRawParameter(this._query, 'query.bool.filter', [
				super.build(),
				{ multi_match: options }
			]);
		} else {
			// Add the options to our query
			applyRawParameter(this._query, 'query.multi_match', options);
		}

		// Add our sorting options
		if (this.hasSort()) {
			applyRawParameter(this._query, 'sort', this.getSorts());
		}
		// finally add any raw parameter that may exist
		this._raw.forEach((param) => applyRawParameter(this._query, param.path, param.value));
		return Object.assign({}, this._query);
	}

	/**
	* @description Build our function_score ES query
	* @param {Object} options
	* @param {boolean} options.name - Name for your filtered aggregations, default is 'all'
	* @param {boolean} options.filterAggs - Whether of not to apply filters to an aggregation
	* @return An elasticsearch query
	*/
	buildFunctionScore (options = {}) {
		// Apply all of our queries
		applyRawParameter(this._query, 'query.function_score.query', super.build());
		// Apply any functions
		applyRawParameter(this._query, 'query.function_score.functions', this.getFuncs());
		// Add filtered aggregations if we have any
		if (this.hasAggs() && options.filterAggs) {
			applyRawParameter(this._query, 'aggs', prepareFilteredAggregation(
				this.getAggs(),
				this.getQueries(),
				options.name
			));
		}
		// Add aggregations if we have any
		else if (this.hasAggs()) {
			applyRawParameter(this._query, 'aggs', this.getAggs());
		}
		// Add any raw parameters
		this._raw.forEach((param) => applyRawParameter(this._query, param.path, param.value));
		return Object.assign({}, this._query);
	}

}

module.exports = QueryBuilder;
