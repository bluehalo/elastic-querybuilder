const QueryBuilder = require('../src/index');

describe('QueryBuilder - Build Aggregations', () => {

	test('should be build a simple aggregation', () => {
		const query = new QueryBuilder()
			.aggs('avg', 'count')
			.buildAggregation();

		expect(query).toEqual({
			from: 0,
			size: 15,
			aggs: {
				count: {
					avg: {
						field: 'count'
					}
				}
			}
		});
	});

	test('should be build a simple aggregation with object value', () => {
		const query = new QueryBuilder()
			.aggs('terms', {
				field: 'games',
				exclude: 'Call.*'
			})
			.buildAggregation();

		// The below method is preferred, this is available since we need this method
		// for nested aggregations
		expect(query).toEqual({
			from: 0,
			size: 15,
			aggs: {
				games: {
					terms: {
						field: 'games',
						exclude: 'Call.*'
					}
				}
			}
		});
	});

	test('should be build a simple aggregation with some extra options', () => {
		const query = new QueryBuilder()
			.aggs('terms', 'games', { exclude: 'Call.*' })
			.buildAggregation();

		// Same as above except a little more obvious
		expect(query).toEqual({
			from: 0,
			size: 15,
			aggs: {
				games: {
					terms: {
						field: 'games',
						exclude: 'Call.*'
					}
				}
			}
		});
	});

	test('should be able to handle multiple aggregations in one query', () => {
		const query = new QueryBuilder()
			.aggs('geo_distance', 'location', {
				origin: '52.3760, 4.894',
				unit: 'km',
				ranges: [
					{ to: 100 },
					{ from: 100, to: 300 },
					{ from: 300 }
				]
			})
			.aggs('max', 'price')
			.aggs('sum', 'sales')
			.buildAggregation();

		expect(query).toEqual({
			from: 0,
			size: 15,
			aggs: {
				location: {
					geo_distance: {
						field: 'location',
						origin: '52.3760, 4.894',
						unit: 'km',
						ranges: [
							{ to: 100 },
							{ from: 100, to: 300 },
							{ from: 300 }
						]
					}
				},
				price: {
					max: {
						field: 'price'
					}
				},
				sales: {
					sum: {
						field: 'sales'
					}
				}
			}
		});
	});

	test('should build a nested type aggregation', () => {
		const query = new QueryBuilder()
			.aggs('nested', { path: 'locations' }, builder => builder
				.aggs('terms', 'locations.city')
			)
			.buildAggregation();

		expect(query).toEqual({
			from: 0,
			size: 15,
			aggs: {
				locations: {
					nested: {
						path: 'locations'
					},
					aggs: {
						'locations.city': {
							terms: {
								field: 'locations.city'
							}
						}
					}
				}
			}
		});
	});

	test('should be filtered aggregations on a boolean query', () => {
		const query = new QueryBuilder()
			.must('match', 'school', 'South Park Elementary')
			.must('match', 'grade', '4th')
			.must('match', 'enemy', 'Cartman')
			.should('match', 'gender', 'female')
			.filteredAggs({ field: 'grade', size: 12 })
			.buildBoolean();

		expect(query).toEqual({
			from: 0,
			size: 15,
			query: {
				bool: {
					must: [
						{ match: { school: 'South Park Elementary' }},
						{ match: { grade: '4th' }},
						{ match: { enemy: 'Cartman' }}
					],
					should: {
						match: { gender: 'female' }
					}
				}
			},
			aggs: {
				all: {
					global: {},
					aggs: {
						grade: {
							aggs: {
								grade: {
									terms: { field: 'grade', size: 12 }
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
			}
		});
	});

});
