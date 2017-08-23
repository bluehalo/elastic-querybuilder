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
			query: { match: { enemy: 'Cartman' }},
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
	aggregations: {
		grade: {
			terms: {
				field: 'grade',
				size: 20
			}
		}
	}
};

describe('utils', () => {

	describe('last', () => {

		test('should return the last element in the array', () => {
			expect(utils.last([1, 2, 3])).toEqual(3);
		});

		test('should return undefined if the length property is missing or 0', () => {
			expect(utils.last([])).toBeUndefined();
			expect(utils.last(3)).toBeUndefined();
		});

	});

	describe('getAggName', function () {

		test('should return the field if the field is a string', function () {
			expect(utils.getAggName('type', 'hanky')).toEqual('hanky');
		});

		test('should return the field or path property if the field is an object', function () {
			expect(utils.getAggName('type', { field: 'the_christmas_poo' })).toEqual('the_christmas_poo');
			expect(utils.getAggName('type', { path: 'imagination_land' })).toEqual('imagination_land');
		});

		test('should return `agg_${type}` when there is no string, or there is no field or path prop', function () {
			expect(utils.getAggName('max', {})).toEqual('agg_max');
		});

	});

	describe('applyRawParameter', () => {

		test('should throw an error if the required arguments are not provided', () => {
			const south_park = {};
			function perform_check () {
				utils.applyRawParameter(south_park, 'KFC');
			}

			expect(perform_check).toThrowError(ERRORS.APPLY_RAW_PARAMETER);
		});

		test('should add top level properties to an object', () => {
			const south_park = {};
			utils.applyRawParameter(south_park, 'state', 'Colorado');

			expect(south_park.state).toEqual('Colorado');
		});

		test('should add nested properties to an object', () => {
			const south_park = { best: {}};
			utils.applyRawParameter(south_park, 'best.chicken', 'KFC');

			expect(south_park.best.chicken).toEqual('KFC');
		});

		test('should be able to add an existent but falsy value', () => {
			const query = {};
			utils.applyRawParameter(query, 'min_score', 0);
		});

		test('should add properties to the object if the path does not yet exist', () => {
			const south_park = {};
			utils.applyRawParameter(south_park, 'hare_club_for_men.rivals', ['Bill Donahue', 'Pope Benedict XVI']);

			expect(south_park.hare_club_for_men.rivals).toEqual(['Bill Donahue', 'Pope Benedict XVI']);
		});

	});

	describe('makeQuery', () => {

		test('should return field as key and value as value if both present', () => {
			const result = utils.makeQuery('stans_dad', 'randy');

			expect(result).toEqual({
				stans_dad: 'randy'
			});
		});

		test('should return field as is if it is an object', () => {
			const result = utils.makeQuery({
				favorite_channel: 'Food Network',
				favorite_ingredient: 'Creme Fraiche'
			});

			expect(result).toEqual({
				favorite_channel: 'Food Network',
				favorite_ingredient: 'Creme Fraiche'
			});
		});

		test('should return an empty object if both field and value are not present', () => {
			const result = utils.makeQuery();
			expect(result).toEqual({});
		});

	});

	describe('reduceBoolQueries', () => {

		test('should reduce the descriptors into an ES bool query', () => {
			const result = mocks.mixed_descriptors.reduce(utils.reduceBoolQueries, {});

			expect(result).toEqual({
				must: [
					{ match: { school: 'South Park Elementary' }},
					{ match: { grade: '4th' }},
					{ match: { enemy: 'Cartman' }}
				],
				should: {
					match: {
						gender: 'female'
					}
				}
			});
		});

	});

	describe('prepareBoolQuery', () => {

		test('should throw an error if given something other than an array', () => {
			function perform_check () {
				utils.prepareBoolQuery({ value: 'KFC' });
			}

			expect(perform_check).toThrowError(ERRORS.NOT_AN_ARRAY);
		});

		test('should return a simple query if only one query provided and it\'s a must', () => {
			const result = utils.prepareBoolQuery(mocks.single_must_descriptor);

			expect(result).toEqual({
				match_all: {}
			});
		});

		test('should return a bool query if only one query provided and it\'s not a must', () => {
			const result = utils.prepareBoolQuery(mocks.single_should_descriptor);

			expect(result).toEqual({
				bool: {
					should: {
						match: {
							alias: 'Professor Chaos'
						}
					}
				}
			});
		});

		test('should return a valid ES bool query for multiple descriptors', () => {
			const result = utils.prepareBoolQuery(mocks.mixed_descriptors);

			expect(result).toEqual({
				bool: {
					must: [
						{ match: { school: 'South Park Elementary' }},
						{ match: { grade: '4th' }},
						{ match: { enemy: 'Cartman' }}
					],
					should: {
						match: {
							gender: 'female'
						}
					}
				}
			});
		});

	});

	describe('prepareFilteredAggregation', () => {

		test('should throw an error if all arguments are omitted', () => {
			function perform_check () {
				utils.prepareFilteredAggregation();
			}

			expect(perform_check).toThrowError(ERRORS.NOT_AN_ARRAY);
		});

		test('should throw an error if descriptors are not an array', () => {
			function perform_check () {
				const aggs = {};
				const descriptors = {};
				utils.prepareFilteredAggregation(aggs, descriptors);
			}

			expect(perform_check).toThrowError(ERRORS.NOT_AN_ARRAY);
		});

		test('should create an aggregation with the default `all` name if no name is provided', () => {
			const result = utils.prepareFilteredAggregation(
				mocks.aggregations,
				mocks.single_should_descriptor
			);

			expect(result).toEqual({
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
			});
		});

		test('should create a valid aggregation object with the correct filters applied', () => {
			const result = utils.prepareFilteredAggregation(
				mocks.aggregations,
				mocks.mixed_descriptors,
				'south_park_aggs'
			);

			expect(result).toEqual({
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
										{ match: { enemy: 'Cartman' }}
									]
								}
							}
						}
					}
				}
			});
		});

	});

});
