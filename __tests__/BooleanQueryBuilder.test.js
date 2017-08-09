const BooleanQueryBuilder = require('../src/BooleanQueryBuilder');

const {
	// ERRORS,
	DEFAULTS
} = require('../src/constants');

// const queries = {
//
// };

describe('BooleanQueryBuilder', () => {

	test('should use default values if none are provided in the constructor', () => {
		const builder = new BooleanQueryBuilder();
		// Check it's private properties to make sure they equal the defaults
		expect(builder._from).toEqual(DEFAULTS.FROM);
		expect(builder._size).toEqual(DEFAULTS.SIZE);
		expect(builder._explain).toEqual(DEFAULTS.EXPLAIN);
	});

});
