const invariant = require('./invariant');

const {
	BOOL,
	ERRORS
} = require('./constants');

/**
* @description Adds a value to the object at the provided path
* @param {Object} obj - Original object to add value to
* @param {Object} options - options
* @param {string} options.path - path to add the object to
* @param {*} options.value - value to add to the object
*/
const applyRawParameter = (obj, { path, value }) => {
	invariant((obj && path && value), ERRORS.APPLY_RAW_PARAMETER);
	const props = path.split('.');

	if (props.length > 1) {
		const prop = props.shift();
		// Add the prop if it does not exist
		if (!obj[prop]) {
			obj[prop] = {};
		}
		// Check the next level down
		applyRawParameter(obj[prop], { path: props.join('.'), value } );
	} else {
		// assign our value
		obj[props[0]] = value;
	}
};

/**
* @description Parse query from an array
* @param {Array<*>} query - Array of obejcts
* @return {*|Array<*>} - if the array only has one element, return that, else, return the array
* @example
*		parseQuery([{ foo: 'bar' }]) => { foo: 'bar' }
*		parseQuery([{ foo: 'bar' }, { foo: 'bar' }]) => [{ foo: 'bar' }, { foo: 'bar' }]
*/
const parseQuery = (query) => {
	invariant(Array.isArray(query), ERRORS.NOT_AN_ARRAY);
	return query.length === 1	? query[0] : query;
};

/**
* @description Make the body part of the query
* @param {string} field - field name or options to use for a simpler query
* @param {*} value - value for the field
* @example
*  makeQuery('foo', 'bar') => { foo: 'bar' }
*  makeQuery({ boost: 1.2, fuzzinness: 'auto' }) => { boost: 1.2, fuzzinness: 'auto' }
*  makeQuery() => {}
*/
const makeQuery = (field, value) => {
	const isOptions = field === Object(field);
	const hasField = field !== undefined;
	const hasValue = value !== undefined;

	if (hasValue && hasField) {
		return { [field]: value };
	}
	else if (hasField && isOptions) {
		return field;
	}
	else {
		return {};
	}
};

/**
* @description Take a set of boolean filters and build a boolean query from it
* @param {Object} filters - Object containing all of our filters
* @param {Array<Object>} filters.must - must filters, contains type, field, value
* @param {Array<Object>} filters.should - should filters, contains type, field, value
* @param {Array<Object>} filters.filter - filter filters, contains type, field, value
* @param {Array<Object>} filters.must_not - must_not filters, contains type, field, value
* @return {Object} - boolean query
*/
const prepareBoolQuery = (filters) => {
	invariant(
		(
			Array.isArray(filters[BOOL.MUST]) &&
			Array.isArray(filters[BOOL.SHOULD]) &&
			Array.isArray(filters[BOOL.FILTER]) &&
			Array.isArray(filters[BOOL.MUST_NOT])
		),
		ERRORS.NOT_AN_ARRAY
	);

	// If we only have one must and nothing else, just return that query
	// this will allow us to build simple queries efficiently
	if (
		filters[BOOL.MUST].length === 1
		&& !(filters[BOOL.SHOULD].length || filters[BOOL.FILTER].length || filters[BOOL.MUST_NOT].length)
	) {
		return parseQuery(filters[BOOL.MUST]);
	}

	const bool = {};

	if (filters[BOOL.MUST].length) {
		bool[BOOL.MUST] = parseQuery(filters[BOOL.MUST]);
	}

	if (filters[BOOL.SHOULD].length) {
		bool[BOOL.SHOULD] = parseQuery(filters[BOOL.SHOULD]);
	}

	if (filters[BOOL.FILTER].length) {
		bool[BOOL.FILTER] = parseQuery(filters[BOOL.FILTER]);
	}

	if (filters[BOOL.MUST_NOT].length) {
		bool[BOOL.MUST_NOT] = parseQuery(filters[BOOL.MUST_NOT]);
	}

	return { bool };
};

module.exports = {
	makeQuery,
	prepareBoolQuery,
	applyRawParameter
};
