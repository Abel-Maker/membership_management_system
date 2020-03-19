/*jshint unused:false */

(function (exports) {

	'use strict';

	var STORAGE_KEY = 'gckj-todos';

	exports.todoStorage = {
		fetch: function () {
			console.log(localStorage.getItem(STORAGE_KEY));
			return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
		},
		save: function (todos) {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
		}
	};

})(window);
