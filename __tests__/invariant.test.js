const invariant = require('../src/invariant');

describe('invariant', () => {

	test('should throw an error if the bool condition is falsy', () => {
		const CartmanLost = false;
		const message = 'You failed Professor Chaos';

		function perform_check () {
			invariant(CartmanLost, message);
		}

		expect(perform_check).toThrowError(message);
	});

	test('should not throw an error if the bool condition is truthy', () => {
		const CartmanLost = true;
		const message = 'You won Professor Chaos';

		function perform_check () {
			invariant(CartmanLost, message);
		}

		expect(perform_check).not.toThrow();
	});

});
