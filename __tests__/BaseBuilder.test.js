const BaseBuilder = require('../src/BaseBuilder');

describe('BaseBuilder', () => {

	test('should return an empty object if no queries are made', () => {
		const query = new BaseBuilder().build();
		expect(query).toEqual({});
	});

	test('should create simple queries with query', () => {
		const query = new BaseBuilder()
			.query('match_all')
			.build();

		expect(query).toEqual({
			match_all: {}
		});
	});

	test('should create simple queries with options in a query call', () => {
		const query = new BaseBuilder()
			.query('match_all', { boost: 2.4, fuzziness: 'auto' })
			.build();

		expect(query).toEqual({
			match_all: {
				boost: 2.4,
				fuzziness: 'auto'
			}
		});
	});

	test('should create a simple query with the additional options', () => {
		const query = new BaseBuilder()
			.query('match', 'first_name', { query: 'Cartman', boost: 2.4, fuzziness: 'auto' })
			.build();

		expect(query).toEqual({
			match: {
				first_name: {
					query: 'Cartman',
					boost: 2.4,
					fuzziness: 'auto'
				}
			}
		});
	});

	test('should allow me to chain bool methods', () => {
		const query = new BaseBuilder()
			.must('match', 'material', 'cotton')
			.should('match', 'color', 'red')
			.filter('match_phrase', 'brand', 'Hanes')
			.must_not('range', 'age', { gte: 2 })
			.build();

		expect(query).toEqual({
			bool: {
				must: { match: { material: 'cotton' }},
				should: { match: { color: 'red' }},
				filter: { match_phrase: { brand: 'Hanes' }},
				must_not: { range: { age: { gte: 2 }}}
			}
		});
	});

	test('should clean values out if there are no queries of that type', () => {
		const query = new BaseBuilder()
			.should('match', 'state', 'Colorado')
			.build();

		// Results should not contain should, filter, or must_not
		expect(query.bool.must).toBeUndefined();
		expect(query.bool.filter).toBeUndefined();
		expect(query.bool.must_not).toBeUndefined();
		expect(query).toEqual({
			bool: {
				should: { match: { state: 'Colorado' }}
			}
		});
	});

	test('should parse queries only when one element is in the array', () => {
		const query = new BaseBuilder()
			.must('match', 'state', 'Colorado')
			.must('match', 'city', 'South Park')
			.filter('match', 'people', 'superheroes')
			.build();

		expect(query).toEqual({
			bool: {
				must: [
					{ match: { state: 'Colorado' }},
					{ match: { city: 'South Park' }}
				],
				filter: { match: { people: 'superheroes' }}
			}
		});
	});

});
