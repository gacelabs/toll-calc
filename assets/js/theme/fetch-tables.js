var dataObject = {};

(function() {
	var tables = ['cities', 'tplex', 'nlex', 'cavitex', 'naiax', 'skyway', 'superhighway', 'calax', 'skyway_3'];

	if (isSessionExpired()) {
		localStorage.setItem('lastActive', new Date());
		tables.forEach(function (table) {
			// console.log(table);
			localStorage.removeItem(table);
			dataObject = {};
		});
	}

	tables.forEach(function (table) {
		// console.log(table);
		if (!localStorage.getItem(table)) {
			var options = {
				type: 'GET',
				url: 'assets/web/data/' + table + '.json',
				dataType: 'json',
				success: function (data) {
					localStorage.setItem(table, JSON.stringify(data));
					dataObject[table] = data;
				},
				error: function () {
					console.log('error!', table + ' not found');
				}
			};
			$.ajax(options);
		} else {
			dataObject[table] = JSON.parse(localStorage.getItem(table));
		}
	});
	// console.log(dataObject);
})();

function isSessionExpired(day) {
	day = day == undefined ? 3 : day;
	var lastActive = localStorage.getItem('lastActive');
	if (!lastActive) {
		return true; // If no previous activity, consider session expired
	}
	var lastActiveTime = new Date(lastActive).getTime();
	var currentTime = new Date().getTime();
	var sessionDuration = day * 24 * 60 * 60 * 1000; // default 3 days in milliseconds
	return currentTime - lastActiveTime > sessionDuration;
}