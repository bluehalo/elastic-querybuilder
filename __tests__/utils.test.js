const {
	applyRawParameter
} = require('../src/utils');

const {
	ERRORS
} = require('../src/constants');



describe('utils', () => {

	describe('applyRawParameter', () => {

		test('should throw an error if required arguments are not provided', () => {
			const south_park = {};
			function perform_check () {
				applyRawParameter(south_park, { value: 'KFC' });
			}

			expect(perform_check).toThrowError(ERRORS.APPLY_RAW_PARAMETER);
		});

		test('should add top level properties to an object', () => {
			const south_park = {};
			applyRawParameter(south_park, { path: 'state', value: 'Colorado' });
			expect(south_park.state).toEqual('Colorado');
		});

		test('should add nested properties to an object', () => {
			const south_park = { best: {}};
			applyRawParameter(south_park, { path: 'best.chicken', value: 'KFC' });
			expect(south_park.best.chicken).toEqual('KFC');
		});

		test('should add properties to the object if the path does not yet exist', () => {
			const south_park = {};
			applyRawParameter(south_park, {
				path: 'hare_club_for_men.rivals',
				value: ['Bill Donahue', 'Pope Benedict XVI']
			});

			expect(south_park.hare_club_for_men.rivals).toEqual(['Bill Donahue', 'Pope Benedict XVI']);
		});

	});

});
