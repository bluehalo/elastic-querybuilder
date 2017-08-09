const invariant = require('./invariant');

const {
	ERRORS
} = require('./constants');

/**
* @description Adds a value to the object at the provided path
* @param {Object} obj - Original object to add value to
* @param {Object} options - options
* @param {String} options.path - path to add the object to
* @param {Any} options.value - value to add to the object
*/
const applyRawParameter = (obj, { path, value }) => {
	invariant((obj && path && value), ERRORS.APPLY_RAW_PARAMETER);
	const props = path.split('.');

	if (props.length > 1) {
		const prop = props.shift();
		// Add the prop if it does not exist
		if (!obj[prop]) {
			obj[prop] = {};
		}
		// Check the next level down
		applyRawParameter(obj[prop], { path: props.join('.'), value } );
	} else {
		// assign our value
		obj[props[0]] = value;
	}
};

module.exports = {
	applyRawParameter
};
