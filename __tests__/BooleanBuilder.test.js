const BooleanBuilder = require('../src/BooleanBuilder');

const queries = {
	no_build: {},
	match_all: {
		match_all: {}
	},
	match_all_options: {
		match_all: {
			boost: 2.4,
			fuzzinness: 'auto'
		}
	},
	chain: {
		bool: {
			must: { match: { material: 'cotton' }},
			should: { match: { color: 'red' }},
			filter: { match_phrase: { brand: 'Hanes' }},
			must_not: { range: { age: { gte: 2 }}}
		}
	},
	clean: {
		bool: {
			should: { match: { state: 'Colorado' }}
		}
	},
	parsed: {
		bool: {
			must: [
				{ match: { state: 'Colorado' }},
				{ match: { city: 'South Park' }}
			],
			filter: { match: { people: 'superheroes' }}
		}
	}
};

describe('BooleanBuilder', () => {

	test('should return an empty object if no queries are made', () => {
		const query = new BooleanBuilder().build();
		expect(query).toEqual(queries.no_build);
	});

	test('should create simple queries with must', () => {
		const query = new BooleanBuilder()
			.must('match_all')
			.build();

		expect(query).toEqual(queries.match_all);
	});

	test('should create simple queries with options with must', () => {
		const query = new BooleanBuilder()
			.must('match_all', { boost: 2.4, fuzzinness: 'auto' })
			.build();

		expect(query).toEqual(queries.match_all_options);
	});

	test('should allow me to chain bool methods', () => {
		const query = new BooleanBuilder()
			.must('match', 'material', 'cotton')
			.should('match', 'color', 'red')
			.filter('match_phrase', 'brand', 'Hanes')
			.must_not('range', 'age', { gte: 2 })
			.build();

		expect(query).toEqual(queries.chain);
	});

	test('should clean values out if there are no queries of that type', () => {
		const query = new BooleanBuilder()
			.should('match', 'state', 'Colorado')
			.build();

		// Results should not contain should, filter, or must_not
		expect(query).toEqual(queries.clean);
		expect(query.bool.must).toBeUndefined();
		expect(query.bool.filter).toBeUndefined();
		expect(query.bool.must_not).toBeUndefined();
	});

	test('should parse queries only when only one element is in the array', () => {
		const query = new BooleanBuilder()
			.must('match', 'state', 'Colorado')
			.must('match', 'city', 'South Park')
			.filter('match', 'people', 'superheroes')
			.build();

		expect(query).toEqual(queries.parsed);
		expect(query.bool.should).toBeUndefined();
		expect(query.bool.must_not).toBeUndefined();
	});

});
