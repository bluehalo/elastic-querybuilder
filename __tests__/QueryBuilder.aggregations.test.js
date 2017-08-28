const QueryBuilder = require('../src/index');

describe('QueryBuilder - Build Aggregations', () => {

	test('should build a simple aggregation', () => {
		const query = new QueryBuilder()
			.query('match_all')
			.raw('explain', true)
			.aggs('avg', 'count')
			.build();

		expect(query).toEqual({
			from: 0,
			size: 15,
			explain: true,
			query: {
				match_all: {}
			},
			aggs: {
				count: {
					avg: {
						field: 'count'
					}
				}
			}
		});
	});

	test('should build a simple aggregation with an object for the value arg', () => {
		const query = new QueryBuilder()
			.query('match_all')
			.aggs('terms', {
				field: 'games',
				exclude: 'Call.*'
			})
			.build();

		// The below method is preferred, this is available since we need this method
		// for nested aggregations
		expect(query).toEqual({
			from: 0,
			size: 15,
			query: {
				match_all: {}
			},
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

	test('should build a simple aggregation with some extra options', () => {
		const query = new QueryBuilder()
			.query('match_all')
			.aggs('terms', 'games', { exclude: 'Call.*' })
			.build();

		// Same as above except a little more obvious
		expect(query).toEqual({
			from: 0,
			size: 15,
			query: {
				match_all: {}
			},
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
			.query('match_all')
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
			.build();

		expect(query).toEqual({
			from: 0,
			size: 15,
			query: {
				match_all: {}
			},
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
			.query('match_all')
			.aggs('nested', { path: 'locations' }, builder => builder
				.aggs('terms', 'locations.city')
			)
			.build();

		expect(query).toEqual({
			from: 0,
			size: 15,
			query: {
				match_all: {}
			},
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

	test('should build multiple nested aggregations with the same path', () => {
		const query = new QueryBuilder()
			.query('match_all')
			/**
			* Note this is not the ideal way to build these, you should just
			* add the locations.state aggregation inside the first nesting. However,
			* sometimes these are built dynamically and from config files, and may not
			* be structured in a way that makes that easy, so building should be aware
			* that there is already an agg at the same path and merge the aggregations
			* instead of overriding them.
			*/
			.aggs('nested', { path: 'locations' }, builder => builder
				.aggs('terms', 'locations.city')
			)
			.aggs('nested', { path: 'locations' }, builder => builder
				.aggs('terms', 'locations.state')
			)
			.build();

		expect(query).toEqual({
			from: 0,
			size: 15,
			query: {
				match_all: {}
			},
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
						},
						'locations.state': {
							terms: {
								field: 'locations.state'
							}
						}
					}
				}
			}
		});
	});

	test('should allow filters to be added to a normal aggregation', () => {
		const query = new QueryBuilder()
			.must('match', 'school', 'South Park Elementary')
			.aggs('avg', 'count')
			.build();

		expect(query).toEqual({
			from: 0,
			size: 15,
			query: {
				match: {
					school: 'South Park Elementary'
				}
			},
			aggs: {
				count: {
					avg: {
						field: 'count'
					}
				}
			}
		});
	});

	test('should build filtered aggregations on a boolean query', () => {
		const query = new QueryBuilder()
			.must('match', 'school', 'South Park Elementary')
			.must('match', 'grade', '4th')
			.must('match', 'enemy', 'Cartman')
			.should('match', 'gender', 'female')
			.aggs('terms', 'grade', { size: 12 })
			.build({ filterAggs: true });

		expect(query).toEqual({
			from: 0,
			size: 15,
			query: {
				bool: {
					filter: {
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
