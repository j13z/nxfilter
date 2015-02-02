'use strict';

module.exports = {
	/**
	 * Copies properties from a `source` object to a `target` object.
	 */
	extend: function (target, source) {
		// Mutates the `target`

		for (var property in source) {
			if (source.hasOwnProperty(property)) {
				target[property] = source[property];
			}
		}

		return target;
	}
};
