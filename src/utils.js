const invariant = require('./invariant');

const {
	BOOL,
	ERRORS
} = require('./constants');

//**************
// Basic Helpers
//**************
const last = (collection) => {
	return collection.length ? collection[collection.length - 1] : undefined;
};

const getAggName = (type, field) => {
	return typeof field !== 'string'
		? field.path || field.field || `agg_${type}`
		: field;
};

/**
* @description Adds a value to the object at the provided path
* @param {Object} object - Original object to add value to
* @param {string} path - path to add the object to
* @param {*} value - value to add to the object
*/
const applyRawParameter = (object, path, value) => {
	invariant((object && path !== undefined && value !== undefined), ERRORS.APPLY_RAW_PARAMETER);
	const props = path.split('.');

	if (props.length > 1) {
		const prop = props.shift();
		// Add the prop if it does not exist
		if (!object[prop]) {
			object[prop] = {};
		}
		// Check the next level down
		applyRawParameter(object[prop], props.join('.'), value );
	} else {
		// assign our value
		object[props[0]] = value;
	}
};

/**
* @description Make the body part of the query
* @param {string} field - field name or options to use for a simpler query
* @param {*} value - value for the field
* @example
*  makeQuery('foo', 'bar') => { foo: 'bar' }
*  makeQuery({ boost: 1.2, fuzziness: 'auto' }) => { boost: 1.2, fuzziness: 'auto' }
*  makeQuery() => {}
*/
const makeQuery = (field, value, options) => {
	const isObject = field === Object(field);
	const hasField = field !== undefined;
	const hasValue = value !== undefined;
	let returnQuery = {};

	if (hasValue && hasField) {
		returnQuery = { [field]: value };
	}
	else if (hasField && isObject) {
		returnQuery = field;
	}
	else if (hasField) {
		returnQuery = { field };
	}

	return Object.assign(returnQuery, options);
};

/**
* @description Reducer function for boolean descriptors
* @param {Object} descriptor - Array of items describing a boolean query
* @param {string} descriptor.type - Boolean type (must, should, filter, must_not)
* @param {string} descriptor.query - Query type, like match, match_all, range, etc.
*/
const reduceBoolQueries = (all, descriptor) => {
	if (Array.isArray(all[descriptor.type])) {
		all[descriptor.type].push(descriptor.query);
	} else if (all[descriptor.type]) {
		// Convert the object into an array
		all[descriptor.type] = [all[descriptor.type]];
		all[descriptor.type].push(descriptor.query);
	} else {
		all[descriptor.type] = descriptor.query;
	}
	return all;
};

/**
* @description Take a set of boolean descriptors and builds a boolean query from it
* @param {Object} descriptors - Object containing all of our descriptors
* @return {Object} - boolean query
*/
const prepareBoolQuery = (descriptors) => {
	invariant(Array.isArray(descriptors), ERRORS.NOT_AN_ARRAY);
	// If the length is 1 and it is a must, we can return just the query
	if (descriptors.every(descriptor => descriptor.type === BOOL.MUST) && descriptors.length === 1) {
		return descriptors[0].query;
	}

	return {
		bool: descriptors.reduce(reduceBoolQueries, {})
	};
};

/**
* @description Add filters to our aggregations
* @param {Array<Object>} aggs - Array of aggregation objects containing at minimum a field property
* @param {Array<Object>} descriptors - Array of boolean descriptors used to filter our aggs
* @param {string} name - top-level name for the aggregations
* @return {Object} Aggregations with filters applied
*/
const prepareFilteredAggregation = (aggs, descriptors, name = 'all') => {
	invariant(Array.isArray(descriptors), ERRORS.NOT_AN_ARRAY);
	// This function is modifying already built aggregations
	const filtered = Object.getOwnPropertyNames(aggs).reduce((all, agg_name) => {
		// Remove any descriptors if they have the same field as this aggregation
		const bool = descriptors
			.filter(descriptor => descriptor.field !== agg_name)
			.reduce(reduceBoolQueries, {});

		all[agg_name] = {
			filter: { bool },
			aggs: { [agg_name]: aggs[agg_name] }
		};

		return all;
	}, {});

	return {
		[name]: {
			aggs: filtered,
			global: {}
		}
	};
};

/**
* @description Save our aggregations and handle any nested cases
*/
const saveAggs = (...params) => {
	const [ Builder, collection, ...args ] = params;
	const nested = {};

	if (typeof last(args) === 'function') {
		const func = args.pop();
		const results = func(new Builder());
		nested.aggs = results.getAggs();
	}

	// Parse out remaining values and store them for later
	const [ type, field, options ] = args;
	const agg = Object.assign({
		[type]: makeQuery(field, undefined, options)
	}, nested);

	const name = getAggName(type, field);
	// Handle nested aggregations with the same path, which ends up being the same name
	if (nested.aggs && collection[name] && collection[name].aggs) {
		Object.assign(collection[name].aggs, nested.aggs);
	} else {
		collection[name] = agg;
	}
};

/**
* @description Save our query and handle any nested cases
*/
const saveQuery = (...params) => {
	const [ Builder, collection, type, ...args ] = params;
	const nested = {};

	if (typeof last(args) === 'function') {
		const func = args.pop();
		const results = func(new Builder());
		nested.query = results.build();
	}

	// Try to parse these values from the remaining args
	const [ operation, field, value, options ] = args;

	// If the only argument was a function and we have a nested query, return only that
	const query = nested.query && !operation
		? nested.query
		: { [operation]: Object.assign(makeQuery(field, value, options), nested) };

	collection.push({
		type,
		field,
		query
	});
};

module.exports = {
	last,
	saveAggs,
	makeQuery,
	saveQuery,
	getAggName,
	prepareBoolQuery,
	applyRawParameter,
	reduceBoolQueries,
	prepareFilteredAggregation
};
