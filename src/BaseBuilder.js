const {
	saveAggs,
	saveQuery,
	prepareBoolQuery
} = require('./utils');

const {
	BOOL
} = require('./constants');

class BaseBuilder {

	constructor () {
		/**
		* These filters will be stored as query descriptions. Each push will contain
		* all the properties needed to generate the actual query object at a later time.
		* We do this so it is trivial to filter them for filtered aggregations at a later point.
		*/
		this._queries = [];
		this._filteredAggs = [];
		/**
		* Let's build this one up as we go instead of pushing descriptors in it
		*/
		this._aggs = {};
	}

	/**
	* @description Add must boolean queries
	* @param {string} operation - Type of query to perform
	* @param {TERMS|TEXT} field - Field to apply the query to
	* @param {*} value - Value of the query
	* @param {Object} options - Options for the query
	* @param {Function} nester - Function that allows for nesting queries
	* @return {BaseBuilder} this
	*/
	query () {
		saveQuery(BaseBuilder, this._queries, BOOL.MUST, ...arguments);
		return this;
	}

	/**
	* @description Add a field that will be used to generate our aggregations
	* @param {string} type - Type of aggregation to perform
  * @param {string} field - Field name to aggregate on
	* @param {Object} options - Options to use
	* @param {Function} nester - Function that allows for nesting queries
	* @return {BaseBuilder} this
	*/
	aggs () {
		saveAggs(BaseBuilder, this._aggs, ...arguments);
		return this;
	}

	/**
	* @description Add a field that will be used to generate filtered aggregations
	* based on your current boolean filters. Use this for accurate facet counts.
	* @param {Object} agg - Options for the aggregation
	* @param {number} agg.size - Maximum number of aggregations to include in the response
  * @param {string} agg.field - Field name to aggregate on
	* @param {string} agg.include - pattern to include in the buckets list
	* @param {string} agg.exclude - pattern to exclude in the buckets list
	* @param {Function} nester - Function that allows for nesting queries
	* @return {BaseBuilder} this
	*/
	filteredAggs (agg) {
		this._filteredAggs.push(agg);
		return this;
	}

	/**
	* @description Add must boolean queries
	* @param {string} operation - Type of query to perform
	* @param {TERMS|TEXT} field - Field to apply the query to
	* @param {*} value - Value of the query
	* @param {Object} options - Options for the query
	* @param {Function} nester - Function that allows for nesting queries
	* @return {BaseBuilder} this
	*/
	must () {
		saveQuery(BaseBuilder, this._queries, BOOL.MUST, ...arguments);
		return this;
	}

	/**
	* @description Add should boolean queries
	* @param {string} operation - Type of query to perform
	* @param {TERMS|TEXT} field - Field to apply the query to
	* @param {*} value - Value of the query
	* @param {Object} options - Options for the query
	* @param {Function} nester - Function that allows for nesting queries
	* @return {BaseBuilder} this
	*/
	should () {
		saveQuery(BaseBuilder, this._queries, BOOL.SHOULD, ...arguments);
		return this;
	}

	/**
	* @description Add filter boolean queries
	* @param {string} operation - Type of query to perform
	* @param {TERMS|TEXT} field - Field to apply the query to
	* @param {*} value - Value of the query
	* @param {Object} options - Options for the query
	* @param {Function} nester - Function that allows for nesting queries
	* @return {BaseBuilder} this
	*/
	filter () {
		saveQuery(BaseBuilder, this._queries, BOOL.FILTER, ...arguments);
		return this;
	}

	/**
	* @description Add must_not boolean queries
	* @param {string} operation - Type of query to perform
	* @param {TERMS|TEXT} field - Field to apply the query to
	* @param {*} value - Value of the query
	* @param {Object} options - Options for the query
	* @param {Function} nester - Function that allows for nesting queries
	* @return {BaseBuilder} this
	*/
	must_not () {
		saveQuery(BaseBuilder, this._queries, BOOL.MUST_NOT, ...arguments);
		return this;
	}

	/**
	* @description Build an ES Boolean Query
	* @return {Object} - ES Query
	*/
	build () {
		return this._queries.length
			? prepareBoolQuery(this._queries)
			: {};
	}

	/**
	* @description Return our aggs, these were built up as we go
	* @return {Object} - ES Aggregations
	*/
	buildAggs () {
		return this._aggs;
	}

}

module.exports = BaseBuilder;
