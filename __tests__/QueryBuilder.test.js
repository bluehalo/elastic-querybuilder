const QueryBuilder = require('../src/index');

const {
	ERRORS,
	DEFAULTS
} = require('../src/constants');

const mocks = {
	dis_max_queries: [
		{ term: { age: 31 }},
		{ term: { age: 32 }},
		{ term: { age: 33 }}
	],
	multi_match: {
		query: 'The Coon',
		fields: ['superhero', 'name', 'alias']
	}
};

describe('QueryBuilder', () => {

	test('should use default values if none are provided in the constructor', () => {
		const builder = new QueryBuilder();
		// Check it's private properties to make sure they equal the defaults
		expect(builder._query.from).toEqual(DEFAULTS.FROM);
		expect(builder._query.size).toEqual(DEFAULTS.SIZE);
	});

	test('should be able to update the from, and size settings', () => {
		const builder = new QueryBuilder();
		const newFrom = 15;
		const newSize = 45;
		// Check it's private properties to make sure they equal the defaults
		expect(builder._query.from).toEqual(DEFAULTS.FROM);
		expect(builder._query.size).toEqual(DEFAULTS.SIZE);
		// Update them with valid values and make sure they changed
		builder.from(newFrom).size(newSize);
		expect(builder._query.from).toEqual(newFrom);
		expect(builder._query.size).toEqual(newSize);
		// Update them without a value and make sure they do not get set to undefined
		builder.from().size();
		expect(builder._query.from).toEqual(newFrom);
		expect(builder._query.size).toEqual(newSize);
	});

	describe('build', () => {

		test('should allow me to add raw parameters to the final query', () => {
			const query = new QueryBuilder()
				.raw('min_score', 2)
				.raw('query.bool.boost', 1.2)
				.raw('query.bool.minimum_should_match', 1)
				.build();

			expect(query).toEqual({
				from: 0,
				size: 15,
				min_score: 2,
				query: {
					bool: {
						boost: 1.2,
						minimum_should_match: 1
					}
				}
			});
		});

		test('should handle a simple match_none query', () => {
			const query = new QueryBuilder()
				.must('match_none')
				.build();

			expect(query).toEqual({
				from: 0,
				size: 15,
				query: {
					match_none: {}
				}
			});
		});

		test('should be able to build a boolean query', () => {
			const query = new QueryBuilder()
				.raw('query.bool.boost', 1.2)
				.must('match', 'name', 'Kenny')
				.must('match', 'alias', 'Mysterion')
				.build();

			expect(query).toEqual({
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
			});
		});

		test('should be able to build a compound boolean query', () => {
			const query = new QueryBuilder()
				.raw('query.bool.boost', 1.2)
				.must('match', 'name', 'Kenny')
				.must('match', 'alias', 'Mysterion')
				.should('match_phrase', 'most_common_question', 'Who is Mysterion?')
				.build();

			expect(query).toEqual({
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
			});
		});

	});

	describe('buildDisMax', () => {

		test('should throw an error if no queries are provided', () => {
			const builder = new QueryBuilder();
			function perform_check () {
				builder.buildDisMax();
			}

			expect(perform_check).toThrowError(ERRORS.NOT_AN_ARRAY);
		});

		test('should include default query params from and to', () => {
			const query = new QueryBuilder()
				.buildDisMax({ queries: mocks.dis_max_queries });

			expect(query.from).toEqual(DEFAULTS.FROM);
			expect(query.size).toEqual(DEFAULTS.SIZE);
		});

		test('should be able to add raw parameters', () => {
			const query = new QueryBuilder()
				.raw('query.dis_max.tie_breaker', 0.5)
				.buildDisMax({ queries: mocks.dis_max_queries });

			expect(query.query.dis_max.tie_breaker).toEqual(0.5);
		});

		test('should build a legitimate dis_max query with options', () => {
			const query = new QueryBuilder()
				.buildDisMax({
					queries: mocks.dis_max_queries,
					tie_breaker: 1.2,
					boost: 2
				});

			expect(query).toEqual({
				from: 0,
				size: 15,
				query: {
					dis_max: {
						queries: [
							{ term: { age: 31 }},
							{ term: { age: 32 }},
							{ term: { age: 33 }}
						],
						tie_breaker: 1.2,
						boost: 2
					}
				}
			});
		});

	});

	describe('buildMultiMatch', () => {

		test('should throw an error if no arguments at all are provided', () => {
			const builder = new QueryBuilder();
			function perform_check () {
				builder.buildMultiMatch();
			}

			expect(perform_check).toThrowError(ERRORS.MULTI_MATCH_ARGS);
		});

		test('should throw an error if no query is provided', () => {
			const builder = new QueryBuilder();
			function perform_check () {
				builder.buildMultiMatch({ fields: ['name', 'alias'] });
			}

			expect(perform_check).toThrowError(ERRORS.MULTI_MATCH_ARGS);
		});

		test('should throw an error if no fields are provided', () => {
			const builder = new QueryBuilder();
			function perform_check () {
				builder.buildMultiMatch({ query: 'Heyy, I\'m not fat I\'m big boned.' });
			}

			expect(perform_check).toThrowError(ERRORS.MULTI_MATCH_ARGS);
		});

		test('should include default query params from and to', () => {
			const query = new QueryBuilder()
				.buildMultiMatch({
					query: mocks.multi_match.query,
					fields: mocks.multi_match.fields
				});

			expect(query.from).toEqual(DEFAULTS.FROM);
			expect(query.size).toEqual(DEFAULTS.SIZE);
		});

		test('should be able to add raw parameters', () => {
			const query = new QueryBuilder()
				.raw('query.multi_match.tie_breaker', 0.5)
				.buildMultiMatch({
					query: mocks.multi_match.query,
					fields: mocks.multi_match.fields
				});

			expect(query.query.multi_match.tie_breaker).toEqual(0.5);
		});

		test('should build a legitimate multi_match query with options', () => {
			const query = new QueryBuilder()
				.buildMultiMatch({
					query: mocks.multi_match.query,
					fields: mocks.multi_match.fields,
					type: 'best_fields',
					tie_breaker: 0.3,
					minimum_should_match: '30%'
				});

			expect(query).toEqual({
				from: 0,
				size: 15,
				query: {
					multi_match: {
						query: 'The Coon',
						fields: ['superhero', 'name', 'alias'],
						type: 'best_fields',
						tie_breaker: 0.3,
						minimum_should_match: '30%'
					}
				}
			});
		});

	});

});
