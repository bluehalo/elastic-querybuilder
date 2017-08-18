# elastic-querybuilder [![Build Status](https://travis-ci.org/Asymmetrik/elastic-querybuilder.svg?branch=develop)](https://travis-ci.org/Asymmetrik/elastic-querybuilder)
> A query builder for Elasticsearch.

## Install

```shell
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
  .query('match_all')
  .raw('explain', true)
  .aggs('avg', 'count')
  .build();

//- Generates the following query
{
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
}
```

Multiple Aggregations
```javascript
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
  .build()

//- Generates the following query
{
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
}

```

Nested Aggregations
```javascript
const query = new QueryBuilder()
  .query('match_all')
  .aggs('nested', { path: 'locations' }, builder => builder
    .aggs('terms', 'locations.city')
  )
  .build()

//- Generates the following query
{
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
}
```

##### `sort`
> Add sorting options. This method essentially just takes a key and a value for an object.

```javascript
builder.sort(
  field?: string, // or Type of sort, could be something like _geo_distance
  value?: string|Object
)
```

###### Examples

Simple sort
```javascript
const query = new QueryBuilder()
  .query( ... )
  .sort('age', 'desc')
  .build();
  
//- Generates the following query
{
  from: 0,
  size: 15,
  query: { ... },
  sort: [
    { age: 'desc' }
  ]
}
```

Geo distance sort
```javascript
const query = new QueryBuilder()
  .query( ... )
  .sort('_geo_distance', {
    coordinates: [ -70, 40 ],
    distance_type: 'arc',
    order: 'asc',
    unit: 'mi',
    mode: 'min'
  })
  .build();
  
//- Generates the following query
{
  from: 0,
  size: 15,
  query: { ... },
  sort: [
    {
      _geo_distance: {
        coordinates: [ -70, 40 ],
        distance_type: 'arc',
        order: 'asc',
        unit: 'mi',
        mode: 'min'
      }
    }
  ]
}
```

##### `func`
> Add functions to be used in function_score queries. This method essentially just takes a key and a value for an object and is only used when calling `buildFunctionScore`.

```javascript
builder.func(
  field?: string|Object, // or Type of function
  value?: string|Object
)
```

###### Examples

Field value factor function
```javascript
const query = new QueryBuilder()
  .query( ... )
  .func('field_value_factor', {
    field: 'number_of_something',
    modifier: 'ln2p',
    factor: 1
  })
  .buildFunctionScore();
  
//- Generates the following query
{
  from: 0,
  size: 15,
  query: {
    function_score: {
      query: { ... },
      functions: [{
        field_value_factor: {
          field: 'number_of_something',
          modifier: 'ln2p',
          factor: 1
        }
      }]
    }
  }
}
```

Filter function
```javascript
const query = new QueryBuilder()
  .query( ... )
  .func({
    weight: 100,
    filter: {
      match: {
        state: 'Colorado'
      }
    }
  })
  .buildFunctionScore();
  
//- Generates the following query
{
  from: 0,
  size: 15,
  query: {
    function_score: {
      query: { ... },
      functions: [{
        weight: 100,
        filter: {
          match: {
            state: 'Colorado'
          }
        }
      }]
    }
  }
}
```

### Build Functions

##### `build`
> Build your basic query. This includes parameters set using `query`, `must`, `should`, `filter`, `must_not`, `aggs`, `from`, `size`, and `raw`. See [`__tests__`](https://github.com/Asymmetrik/elastic-querybuilder/blob/master/__tests__) for more examples.

```javascript
builder.build(
  options?: {
    // Name for your filtered aggregations, default is 'all'
    name?: string,
    // Add filters to your aggregations, better for accurate facet counts
    filterAggs?: boolean
  }
): Object
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

##### `buildFunctionScore`
> Build your basic query. This includes parameters set using `query`, `must`, `should`, `filter`, `must_not`, `aggs`, `func`, `from`, `size`, and `raw`. See [`__tests__`](https://github.com/Asymmetrik/elastic-querybuilder/blob/master/__tests__) for more examples.

```javascript
builder.buildFunctionScore(
  options?: {
    // Name for your filtered aggregations, default is 'all'
    name?: string,
    // Add filters to your aggregations, better for accurate facet counts
    filterAggs?: boolean
  }
): Object
```

## Contributing
See our [contributors guide](https://github.com/Asymmetrik/elastic-querybuilder/blob/master/.github/CONTRIBUTING.md).
