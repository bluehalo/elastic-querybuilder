/**
* @description Throw an error if the condition is falsy
* @param {Any} condition - Any truthy/falsy expression
* @param {String} message - Error message to throw if condition is falsy
*/
module.exports = function invariant (condition, message) {
	if (!condition) { throw new Error(message); }
};
