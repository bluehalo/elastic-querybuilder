const BaseBuilder = require('../src/BaseBuilder');

describe('BaseBuilder - Nested Queries', () => {

	test('should build simple nested queries', () => {
		const query = new BaseBuilder()
			.query('nested', {
				path: 'locations',
				query: {
					match: {
						'locations.city': 'South Park'
					}
				}
			})
			.build();

		expect(query).toEqual({
			nested: {
				path: 'locations',
				query: {
					match: {
						'locations.city': 'South Park'
					}
				}
			}
		});
	});

	test('should build simple query using extra options', () => {
		const query = new BaseBuilder()
			.query('nested', 'path', 'locations', {
				query: {
					match: {
						'locations.city': 'South Park'
					}
				}
			})
			.build();

		// Note this is another way to build the same thing as above
		expect(query).toEqual({
			nested: {
				path: 'locations',
				query: {
					match: {
						'locations.city': 'South Park'
					}
				}
			}
		});
	});

	test('should build nested boolean queries *intelligently*', () => {
		const query = new BaseBuilder()
			.must((builder) => builder
				.should('match', 'preference_1', 'Apples')
				.should('match', 'preference_2', 'Bananas')
			)
			.build();

		/**
		* This particular query normally would be built like below when used in this
		* manner:
		* {
		*		bool: {
		*			must: {
		*				bool: {
		*					should: [
		*						{ match: { preference_1: "Apples" }},
		*						{ match: { preference_2: "Bananas" }}
		*					]
		*				}
		*			}
		*		}
		* }
		* but since there is only must, there is a better way to build this
		* see the results below
		*/

		expect(query).toEqual({
			bool: {
				should: [
					{ match: { preference_1: 'Apples' }},
					{ match: { preference_2: 'Bananas' }},
				]
			}
		});
	});

	test('should build nested boolean queries with filters', () => {
		const query = new BaseBuilder()
			.should((builder) => builder
				.must('match', 'preference_1', 'Apples')
				.must('match', 'preference_2', 'Bananas')
			)
			.should((builder) => builder
				.must('match', 'preference_1', 'Apples')
				.must('match', 'preference_2', 'Cherries')
			)
			.should((builder) => builder.must('match', 'preference_1', 'Grapefruit'))
			.filter('term', 'grade', '2')
			.build();

			expect(query).toEqual({
				bool: {
					should: [
						{
							bool: {
								must: [
									{ match: { preference_1: 'Apples' }},
									{ match: { preference_2: 'Bananas' }},
								]
							}
						},
						{
							bool: {
								must: [
									{ match: { preference_1: 'Apples' }},
									{ match: { preference_2: 'Cherries' }},
								]
							}
						},
						{ match: { preference_1: 'Grapefruit' }}
					],
					filter: {
						term: { grade: '2' }
					}
				}
			});
	});

	test('should be able to nest should in should', () => {
		const query = new BaseBuilder()
			.should('match', 'firstname', 'Joe')
			.should('match', 'firstname', 'John')
			.should(builder => builder
				.should('match', 'lastname', 'Smith')
				.should('match', 'lastname', 'Davis')
			)
			.build();

			expect(query).toEqual({
				bool: {
					should: [
						{ match: { firstname: 'Joe' }},
						{ match: { firstname: 'John' }},
						{
							bool: {
								should: [
									{ match: { lastname: 'Smith' }},
									{ match: { lastname: 'Davis' }}
								]
							}
						}
					]
				}
			});
	});

});
