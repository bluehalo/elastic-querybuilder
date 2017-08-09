module.exports.ERRORS = {
	RAW: 'Missing arguments, you must provide a path and a value.',
	APPLY_RAW_PARAMETER: 'Missing arguments, cannot `applyRawParameter` without a value, path, and object to add it to.'
};

module.exports.BOOL = {
	FILTER: 'filter',
  SHOULD: 'should',
  MUST_NOT: 'must_not',
  MUST: 'must'
};

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

module.exports.TEXT = {
	MATCH: 'match',
  MATCH_PHRASE: 'match_phrase',
  MATCH_PHRASE_PREFIX: 'match_phrase_prefix',
  MULTI_MATCH: 'multi_match',
  COMMON_TERMS: 'common_terms',
  QUERY_STRING: 'query_string',
  SIMPLE_QUERY_STRING: 'simple_query_string'
};

module.exports.MATCH = {
	ALL: 'match_all',
  NONE: 'match_none'
};
