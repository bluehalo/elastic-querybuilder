const QueryBuilder = require('../src/index');

const { DEFAULTS } = require('../src/constants');

const queries = {
	simple_raw_query: {
		from: 0,
		size: 15,
		min_score: 2,
		query: {
			bool: {
				boost: 1.2,
				minimum_should_match: 1
			}
		}
	},
	match_none: {
		from: 0,
		size: 15,
		query: {
			match_none: {}
		}
	},
	simple_boolean_query: {
		from: 0,
		size: 15,
		query: {
			bool: {
				boost: 1.2,
				must: [
					{ match: { name: 'Kenny' }},
					{ match: { alias: 'Mysterion' }}
				]
			}
		}
	},
	compound_boolean_query: {
		from: 0,
		size: 15,
		query: {
			bool: {
				boost: 1.2,
				must: [
					{ match: { name: 'Kenny' }},
					{ match: { alias: 'Mysterion' }}
				],
				should: {
					match_phrase: { most_common_question: 'Who is Mysterion?' }
				}
			}
		}
	}
};

describe('QueryBuilder', () => {

	test('should use default values if none are provided in the constructor', () => {
		const builder = new QueryBuilder();
		// Check it's private properties to make sure they equal the defaults
		expect(builder.query.from).toEqual(DEFAULTS.FROM);
		expect(builder.query.size).toEqual(DEFAULTS.SIZE);
	});

	test('should be able to update the from, and size settings', () => {
		const builder = new QueryBuilder();
		const newFrom = 15;
		const newSize = 45;
		// Check it's private properties to make sure they equal the defaults
		expect(builder.query.from).toEqual(DEFAULTS.FROM);
		expect(builder.query.size).toEqual(DEFAULTS.SIZE);
		// Update them with valid values and make sure they changed
		builder.from(newFrom).size(newSize);
		expect(builder.query.from).toEqual(newFrom);
		expect(builder.query.size).toEqual(newSize);
		// Update them without a value and make sure they do not get set to undefined
		builder.from().size();
		expect(builder.query.from).toEqual(newFrom);
		expect(builder.query.size).toEqual(newSize);
	});

	test('should allow me to add raw parameters to the final query', () => {
		const query = new QueryBuilder()
			.raw({ path: 'min_score', value: 2 })
			.raw({ path: 'query.bool.boost', value: 1.2 })
			.raw({ path: 'query.bool.minimum_should_match', value: 1 })
			.build();

		expect(query).toEqual(queries.simple_raw_query);
	});

	test('should handle a simple match_none query', () => {
		const query = new QueryBuilder()
			.must('match_none')
			.build();

		expect(query).toEqual(queries.match_none);
	});

	test('should be able to build a boolean query', () => {
		const query = new QueryBuilder()
			.raw({ path: 'query.bool.boost', value: 1.2 })
			.must('match', 'name', 'Kenny')
			.must('match', 'alias', 'Mysterion')
			.build();

		expect(query).toEqual(queries.simple_boolean_query);
	});

	test('should be able to build a compound boolean query', () => {
		const query = new QueryBuilder()
			.raw({ path: 'query.bool.boost', value: 1.2 })
			.must('match', 'name', 'Kenny')
			.must('match', 'alias', 'Mysterion')
			.should('match_phrase', 'most_common_question', 'Who is Mysterion?')
			.build();

		expect(query).toEqual(queries.compound_boolean_query);
	});

});
