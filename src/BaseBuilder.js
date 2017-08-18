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

		this._funcs = [];
		this._sorts = [];
		this._aggs = {};
	}

	/**
	* @description Add must boolean queries
	* @param {string} operation - Type of query to perform
	* @param {TERMS|TEXT|Object} field - Field to apply the query to
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
	* @description Add must boolean queries
	* @param {string} operation - Type of query to perform
	* @param {TERMS|TEXT|Object} field - Field to apply the query to
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
	* @param {TERMS|TEXT|Object} field - Field to apply the query to
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
	* @param {TERMS|TEXT|Object} field - Field to apply the query to
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
	* @param {TERMS|TEXT|Object} field - Field to apply the query to
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
	* @description Add a field that will be used to generate our aggregations
	* @param {string} type - Type of aggregation to perform
	* @param {string|Object} field - Field name to aggregate on
	* @param {Object} options - Options to use
	* @param {Function} nester - Function that allows for nesting queries
	* @return {BaseBuilder} this
	*/
	aggs () {
		saveAggs(BaseBuilder, this._aggs, ...arguments);
		return this;
	}

	/**
	* @description Add options for sorting
	* @param {string} field - Field/type for sorting
	* @param {string|Object} value - Value of the Field/Type
	* @return {BaseBuilder} this
	*/
	sort (field, value) {
		this._sorts.push({ [field]: value });
		return this;
	}

	/**
	* @description Add functions for function_score queries
	* @param {string|Object} field - Field/type for sorting
	* @param {string|Object} value - Value of the Field/Type
	* @return {BaseBuilder} this
	*/
	func (field, value) {
		// If field is an object, push the whole function object in, else, make it an object
		const func = typeof field === 'string'
			? { [field]: value }
			: field;

		this._funcs.push(func);
		return this;
	}

	/**
	* @description Do we have boolean queries to build
	* @return {boolean}
	*/
	hasQuery () {
		return this._queries.length;
	}

	/**
	* @description Do we have non-filtered aggregations to build
	* @return {boolean}
	*/
	hasAggs () {
		return Object.getOwnPropertyNames(this._aggs).length;
	}

	/**
	* @description Do we have any sorting operations to apply
	* @return {boolean}
	*/
	hasSort () {
		return this._sorts.length;
	}

	/**
	* @description Return our query descriptors
	* @return {Array<Object>} - Array of query objects
	*/
	getQueries () {
		return this._queries;
	}

	/**
	* @description Return our aggs, these were built up as we go
	* @return {Object} - ES Aggregations
	*/
	getAggs () {
		return this._aggs;
	}

	/**
	* @description Return our sorting options
	* @return {Array<Object>} - Array of sort objects
	*/
	getSorts () {
		return this._sorts;
	}

	/**
	* @description Return our sorting options
	* @return {Array<Object>} - Array of functions
	*/
	getFuncs () {
		return this._funcs;
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

}

module.exports = BaseBuilder;
