/**
* @typedef {number} DEFAULTS
*/

/**
* @enum {DEFAULTS}
*/
module.exports.DEFAULTS = {
	FROM: 0,
	SIZE: 15
};

/**
* @typedef {string} ERRORS
*/

/**
* @enum {ERRORS}
*/
module.exports.ERRORS = {
	RAW: 'Missing arguments, you must provide exactly 2 arguments, a path and a value.',
	APPLY_RAW_PARAMETER: 'Missing arguments, cannot `applyRawParameter` without a value, path, and object to add it to.',
	NOT_AN_ARRAY: 'Invalid argument type, argument must be of type Array',
	MULTI_MATCH_ARGS: 'Missing arguments or invalid type. You must provide a `query` string and an `Array` of fields.',
	NO_AGGS: 'No aggregations to build, make sure to add some with `aggs` before calling `buildAggregation`.'
};

/**
* @typedef {string} BOOL
*/

/**
* @enum {BOOL}
*/
module.exports.BOOL = {
	FILTER: 'filter',
	SHOULD: 'should',
	MUST_NOT: 'must_not',
	MUST: 'must'
};

/**
* @typedef {string} TERMS
*/

/**
* @enum {TERMS}
*/
module.exports.TERMS = {
	TERM: 'term',
	TERMS: 'terms',
	RANGE: 'range',
	EXISTS: 'exists',
	PREFIX: 'prefix',
	WILDCARD: 'wildcard',
	REGEXP: 'regexp',
	FUZZY: 'fuzzy',
	TYPE: 'type',
	IDS: 'ids'
};

/**
* @typedef {string} TEXT
*/

/**
* @enum {TEXT}
*/
module.exports.TEXT = {
	MATCH: 'match',
	MATCH_PHRASE: 'match_phrase',
	MATCH_PHRASE_PREFIX: 'match_phrase_prefix',
	MULTI_MATCH: 'multi_match',
	COMMON_TERMS: 'common_terms',
	QUERY_STRING: 'query_string',
	SIMPLE_QUERY_STRING: 'simple_query_string'
};

/**
* @typedef {string} MATCH
*/

/**
* @enum {MATCH}
*/
module.exports.MATCH = {
	ALL: 'match_all',
  NONE: 'match_none'
};
