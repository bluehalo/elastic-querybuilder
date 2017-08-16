# elastic-querybuilder [![Build Status](https://travis-ci.org/Asymmetrik/elastic-querybuilder.svg?branch=develop)](https://travis-ci.org/Asymmetrik/elastic-querybuilder)
> A collection of query builders and composers for Elasticsearch

## Install

```shell
# Coming soon, this is not published to npm yet
# Install with Yarn
yarn add @asymmetrik/elastic-querybuilder
# Install with npm
npm install --save @asymmetrik/elastic-querybuilder
```

## API
> For a more comprehensive set of examples, see the [`__tests__`](https://github.com/Asymmetrik/elastic-querybuilder/blob/master/__tests__) directory

First you need to create an instance of the query builder class:
```javascript
const QueryBuilder = require('@asymmetrik/elastic-querybuilder');
const builder = new QueryBuilder();
```

### Builder Methods

##### `from`
> Change the starting point for paging to a new number. Default value is 0.

```javascript
builder.from(from: number): QueryBuilder
```

##### `size`
> Change the number of results to a new number. Default value is 15.

```javascript
builder.size(size: number): QueryBuilder
```

##### `raw`
> Allows to set a value on the query object at your path.

```javascript
builder.raw(size: number): QueryBuilder
```

###### Examples
```javascript
const query = new QueryBuilder()
  .raw('query.bool.boost', 1.2)
  .must('match', 'name', 'Kenny')
  .build();

//- Generates the following query
{
  from: 0,
  size: 15,
  query: {
    bool: {
      boost: 1.2, // was set by raw
      must: [ { match: { name: 'Kenny' }} ]
    }
  }
}

```

##### `query`
> Build up a query object. If your last or only argument is a function, it will be passed a builder object that can be used to nest boolean queries or build nested queries. The `must`, `should`, `filter`, and `must_not` all have the same API and can be used in the same way.

```javascript
builder.query(
  operation: string,
  field?: string|Object,
  value?: string,
  options?: Object,
  nester?: Function
): QueryBuilder
```

###### Examples
Simple Query
``` javascript
const query = new QueryBuilder()
  .query('match_all')
  .build();

//- Generates the following query
{
  from: 0,
  size: 15,
  query: {
    match_all: {}
  }
}
```

Simple Query with options
``` javascript
const query = new QueryBuilder()
  .query('match_all', { boost: 2.4, fuzziness: 'auto' })
  .build();

//- Generates the following query
{
  from: 0,
  size: 15,
  query: {
    match_all: {
      boost: 2.4,
      fuzziness: 'auto'
    }
  }
}
```

Simple Query with field and value
``` javascript
const query = new QueryBuilder()
  .query('match', 'location', 'South Park')
  .build();

//- Generates the following query  
{
  from: 0,
  size: 15,
  query: {
    match: {
      location: 'SouthPark'
    }
  }
}
```

Query with callback to build nested queries.
```javascript
const query = new QueryBuilder()
  .should('match', 'firstname', 'Joe')
  .should('match', 'firstname', 'John')
  .should(builder => builder
    .should('match', 'lastname', 'Smith')
    .should('match', 'lastname', 'Davis')
  )
  .build();

//- Generates the following query  
{
  from: 0,
  size: 15,
  query: {
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
  }
}
```

##### `must`
> Add a must boolean query to your ES query. See `query` above and [`__tests__`](https://github.com/Asymmetrik/elastic-querybuilder/blob/master/__tests__) for examples.

```javascript
builder.must(
  operation: string,
  field?: string|Object,
  value?: string,
  options?: Object,
  nester?: Function
): QueryBuilder
```

##### `should`
> Add a should boolean query to your ES query. See `query` above and [`__tests__`](https://github.com/Asymmetrik/elastic-querybuilder/blob/master/__tests__) for examples.

```javascript
builder.should(
  operation: string,
  field?: string|Object,
  value?: string,
  options?: Object,
  nester?: Function
): QueryBuilder
```

##### `filter`
> Add a filter boolean query to your ES query. See `query` above and [`__tests__`](https://github.com/Asymmetrik/elastic-querybuilder/blob/master/__tests__) for examples.

```javascript
builder.filter(
  operation: string,
  field?: string|Object,
  value?: string,
  options?: Object,
  nester?: Function
): QueryBuilder
```

##### `must_not`
> Add a must_not boolean query to your ES query. See `query` above and [`__tests__`](https://github.com/Asymmetrik/elastic-querybuilder/blob/master/__tests__) for examples.

```javascript
builder.must_not(
  operation: string,
  field?: string|Object,
  value?: string,
  options?: Object,
  nester?: Function
): QueryBuilder
```

##### `aggs`
> Generate aggregation type queries. This will build up the `aggs` property on an ES query.

```javascript
builder.aggs(
  type: string
  field?: string|Object
  options?: Object,
  nester?: Function
): QueryBuilder
```

###### Examples
Simple Aggregation
```javascript
const query = new QueryBuilder()
  .raw('explain', true)
  .aggs('avg', 'count')
  .buildAggregation();

//- Generates the following query
{
  from: 0,
  size: 15,
  explain: true,
  aggs: {
    count: {
      avg: {
        field: 'count'
      }
    }
  }
}
```

Multiple Aggregations
```javascript
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
  .buildAggregation()

//- Generates the following query
{
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
}

```

Nested Aggregations
```javascript
const query = new QueryBuilder()
  .aggs('nested', { path: 'locations' }, builder => builder
    .aggs('terms', 'locations.city')
  )
  .buildAggregation()

//- Generates the following query
{
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
}
```

##### `filteredAggs`
> Add aggregations to your query that will be filtered based on the current query. These will also filter out any filters that would apply to the aggregation field so that agg counters (facet counters) would be correct. See [this article](https://blog.madewithlove.be/post/faceted-search-using-elasticsearch/) for a good explanation

```javascript
builder.filteredAggs(
  options: {
    field: string,
    size: number,
    include: string, 
    exclude: string,
    // Can include any other valid properties to associate with an aggregation 
  }
)
```

###### Examples
> See  [`__tests__`](https://github.com/Asymmetrik/elastic-querybuilder/blob/master/__tests__) for more examples.

Adding filtered aggreations to a boolean query
```javascript
const query = new QueryBuilder()
  .must('match', 'grade', '4th')
  .must('match', 'gender', 'female')
  .filteredAggs({ field: 'grade', size: 12, exclude: 'Kindergarten' })
  .build();

//- Generates the following query
{
  from: 0,
  size: 15,
  query: {
    bool: {
      must: [
        { match: { grade: '4th' }},
        { match: { gender: 'female' }}
      ]
    }
  },
  aggs: {
    all: {
      global: {},
      aggs: {
        grade: {
          aggs: {
            grade: {
              terms: {
                field: 'grade',
                size: 12,
                exclude: 'Kindergarten'
              }
            }
          },
          filter: {
            bool: {
              must: [
                { match: { gender: 'female' }}
              ]
            }
          }
        }
      }
    }
  }
}
```

### Build Functions

##### `build`
> Build your basic query. This includes parameters set using `query`, `must`, `should`, `filter`, `must_not`, `filteredAggs`, `from`, `size`, and `raw`. See [`__tests__`](https://github.com/Asymmetrik/elastic-querybuilder/blob/master/__tests__) for more examples.

```javascript
builder.build(
  options?: {
    // Name for your top level aggregations, default is 'all'
    name?: string
  }
): Object
```

##### `buildAggregation`
> Build your basic query. This includes parameters set using `aggs`, `from`, `size`, and `raw`. See [`__tests__`](https://github.com/Asymmetrik/elastic-querybuilder/blob/master/__tests__) for more examples.

```javascript
builder.buildAggregation(): Object
```

##### `buildDisMax`
> Build your basic query. This includes parameters set using `from`, `size`, and `raw`. See [`__tests__`](https://github.com/Asymmetrik/elastic-querybuilder/blob/master/__tests__) for more examples.

```javascript
builder.buildDisMax(
  options: {
    tie_breaker: number,
    boost: number,
    queries: Array<Object>,
    // You can add more parameters that belong on the
    // top level of a dis_max query. These are directly
    // passed in so if it is an invalid prop, your 
    // query will fail
  }
): Object
```

###### Examples
Building a `dis_max` query
```javascript
const query = new QueryBuilder()
  .buildDisMax({
    queries: [
      { term: { age: 31 }},
      { term: { age: 32 }}
    ],
    tie_breaker: 1.2,
    boost: 2
  })
//- Generates the following query
{
  from: 0,
  size: 15,
  query: {
    dis_max: {
      queries: [
        { term: { age: 31 }},
        { term: { age: 32 }}
      ],
      tie_breaker: 1.2,
      boost: 2
    }
  }
}
```

##### `buildMultiMatch`
> Build your basic query. This includes parameters set using `from`, `size`, and `raw`. See [`__tests__`](https://github.com/Asymmetrik/elastic-querybuilder/blob/master/__tests__) for more examples.

```javascript
builder.buildMultiMatch(
  options: {
    query: string,
    fields: Array<string>,
    type: string,
    tie_breaker: number,
    minimum_should_match: string
    // You can add more parameters that belong on the
    // top level of a dis_max query. These are directly
    // passed in so if it is an invalid prop, your 
    // query will fail
  }
): Object
```

###### Examples
Building a `multi_match` query
```javascript
const query = new QueryBuilder()
  .buildMultiMatch({
    query: 'The Coon',
    fields: ['superhero', 'name', 'alias'],
    type: 'best_fields',
    tie_breaker: 0.3,
    minimum_should_match: '30%'
  });

//- Generates the following query
{
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
}
```

## Contributing
See our [contributors guide](https://github.com/Asymmetrik/elastic-querybuilder/blob/master/.github/CONTRIBUTING.md).
