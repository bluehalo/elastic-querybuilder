const utils = require('../src/utils');

const {
	ERRORS
} = require('../src/constants');

const mocks = {
	mixed_descriptors: [
		{
			type: 'must',
			query: { match: { school: 'South Park Elementary' }},
			field: 'school'
		},
		{
			type: 'must',
			query: { match: { grade: '4th' }},
			field: 'grade'
		},
		{
			type: 'must',
			query: { match: { enemy: 'Cartmen' }},
			field: 'enemy'
		},
		{
			type: 'should',
			query: { match: { gender: 'female' }},
			field: 'gender'
		}
	],
	single_must_descriptor: [
		{
			type: 'must',
			query: { match_all: {}},
			field: undefined
		}
	],
	single_should_descriptor: [
		{
			type: 'should',
			query: { match: { alias: 'Professor Chaos' }},
			field: 'alias'
		}
	],
	aggregations: [
		{
			field: 'grade',
			size: 20
		}
	]
};

const expected = {
	makeQuery: {
		fieldAndValue: {
			stans_dad: 'randy'
		},
		fieldIsObject: {
			favorite_channel: 'Food Network',
			favorite_ingredient: 'Creme Fraiche'
		},
		noop: {}
	},
	reducedBoolQueries: {
		must: [
			{ match: { school: 'South Park Elementary' }},
			{ match: { grade: '4th' }},
			{ match: { enemy: 'Cartmen' }}
		],
		should: {
			match: {
				gender: 'female'
			}
		}
	},
	prepareBoolQuery: {
		single_must: {
			match_all: {}
		},
		single_should: {
			bool: {
				should: {
					match: {
						alias: 'Professor Chaos'
					}
				}
			}
		},
		mixed: {
			bool: {
				must: [
					{ match: { school: 'South Park Elementary' }},
					{ match: { grade: '4th' }},
					{ match: { enemy: 'Cartmen' }}
				],
				should: {
					match: {
						gender: 'female'
					}
				}
			}
		}
	},
	prepareFilteredAggregation: {
		default_name: {
			aggs: {
				all: {
					global: {},
					aggs: {
						grade: {
							aggs: {
								grade: {
									terms: { field: 'grade', size: 20}
								}
							},
							filter: {
								bool: {
									should: { match: { alias: 'Professor Chaos' }}
								}
							}
						}
					}
				}
			}
		},
		custom_name: {
			aggs: {
				south_park_aggs: {
					global: {},
					aggs: {
						grade: {
							aggs: {
								grade: {
									terms: { field: 'grade', size: 20}
								}
							},
							filter: {
								bool: {
									should: { match: { gender: 'female' }},
									must: [
										{ match: { school: 'South Park Elementary' }},
										{ match: { enemy: 'Cartmen' }}
									]
								}
							}
						}
					}
				}
			}
		}
	}
};

describe('utils', () => {

	describe('applyRawParameter', () => {

		test('should throw an error if required arguments are not provided', () => {
			const south_park = {};
			function perform_check () {
				utils.applyRawParameter(south_park, { value: 'KFC' });
			}

			expect(perform_check).toThrowError(ERRORS.APPLY_RAW_PARAMETER);
		});

		test('should add top level properties to an object', () => {
			const south_park = {};
			utils.applyRawParameter(south_park, { path: 'state', value: 'Colorado' });
			expect(south_park.state).toEqual('Colorado');
		});

		test('should add nested properties to an object', () => {
			const south_park = { best: {}};
			utils.applyRawParameter(south_park, { path: 'best.chicken', value: 'KFC' });
			expect(south_park.best.chicken).toEqual('KFC');
		});

		test('should add properties to the object if the path does not yet exist', () => {
			const south_park = {};
			utils.applyRawParameter(south_park, {
				path: 'hare_club_for_men.rivals',
				value: ['Bill Donahue', 'Pope Benedict XVI']
			});

			expect(south_park.hare_club_for_men.rivals).toEqual(['Bill Donahue', 'Pope Benedict XVI']);
		});

	});

	describe('makeQuery', () => {

		test('should return field as key and value as value if both present', () => {
			const result = utils.makeQuery('stans_dad', 'randy');
			expect(result).toEqual(expected.makeQuery.fieldAndValue);
		});

		test('should return field as is if it is an object', () => {
			const result = utils.makeQuery({
				favorite_channel: 'Food Network',
				favorite_ingredient: 'Creme Fraiche'
			});
			expect(result).toEqual(expected.makeQuery.fieldIsObject);
		});

		test('should return an empty object if both field and value are not present', () => {
			const result = utils.makeQuery();
			expect(result).toEqual(expected.makeQuery.noop);
		});

	});

	describe('reduceBoolQueries', () => {

		test('should reduce the descriptors into an es bool query', () => {
			const result = mocks.mixed_descriptors.reduce(utils.reduceBoolQueries, {});
			expect(result).toEqual(expected.reducedBoolQueries);
		});

	});

	describe('prepareBoolQuery', () => {

		test('should throw an error if given something other than an array', () => {
			function perform_check () {
				utils.prepareBoolQuery({ value: 'KFC' });
			}

			expect(perform_check).toThrowError(ERRORS.NOT_AN_ARRAY);
		});

		test('should return a simple query if only one query and it\'s a must', () => {
			const result = utils.prepareBoolQuery(mocks.single_must_descriptor);
			expect(result).toEqual(expected.prepareBoolQuery.single_must);
		});

		test('should return a bool query if only one query and not a must', () => {
			const result = utils.prepareBoolQuery(mocks.single_should_descriptor);
			expect(result).toEqual(expected.prepareBoolQuery.single_should);
		});

		test('should return a valid es bool query for multiple descriptors', () => {
			const result = utils.prepareBoolQuery(mocks.mixed_descriptors);
			expect(result).toEqual(expected.prepareBoolQuery.mixed);
		});

	});

	describe('prepareFilteredAggregation', () => {

		test('should throw an error if all arguments are omitted', () => {
			function perform_check () {
				utils.prepareFilteredAggregation();
			}

			expect(perform_check).toThrowError(ERRORS.NOT_AN_ARRAY);
		});

		test('should throw an error if aggregations are not an array', () => {
			function perform_check () {
				utils.prepareFilteredAggregation({
					aggregations: {},
					descriptors: []
				});
			}

			expect(perform_check).toThrowError(ERRORS.NOT_AN_ARRAY);
		});

		test('should throw an error if descriptors are not an array', () => {
			function perform_check () {
				utils.prepareFilteredAggregation({
					aggregations: [],
					descriptors: {}
				});
			}

			expect(perform_check).toThrowError(ERRORS.NOT_AN_ARRAY);
		});

		test('should create an aggregation with the default `all` name if none is provided', () => {
			const result = utils.prepareFilteredAggregation({
				aggregations: mocks.aggregations,
				descriptors: mocks.single_should_descriptor
			});

			expect(result).toEqual(expected.prepareFilteredAggregation.default_name);
		});

		test('should create a valid aggregation object with the correct filters applied', () => {
			const result = utils.prepareFilteredAggregation({
				aggregations: mocks.aggregations,
				descriptors: mocks.mixed_descriptors,
				name: 'south_park_aggs'
			});

			expect(result).toEqual(expected.prepareFilteredAggregation.custom_name);
		});

	});

});
