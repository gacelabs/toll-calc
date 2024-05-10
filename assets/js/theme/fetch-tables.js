(function () {
	switch (window.location.pathname) {
		case '/results':
			break;
		case '/routes':
			break;
		default:
			var prev_records = localStorage.getItem('notify_no_records');
			if (prev_records != null) {
				var arPrevData = JSON.parse(prev_records);
			}
			localStorage.clear();
			if (typeof arPrevData != 'undefined') {
				localStorage.setItem('notify_no_records', JSON.stringify(arPrevData));
			}
			/* if (isSessionExpired()) {
				localStorage.clear();
				dataObject = {};
				localStorage.setItem('lastActive', new Date());
			} */
			break;
	}

	var others = ['archipelago', 'cities', 'regions'];

	var options = {
		type: 'GET',
		url: 'assets/web/data/default/expressways.json',
		dataType: 'json',
		success: function (expressways) {
			// console.log(expressways);
			if (Object.keys(expressways).length) {
				dataObject['expressways'] = expressways;
				let cnt = 0;
				for (let table in expressways) {
					cnt++;
					// if (!localStorage.getItem(table)) {
						var options = {
							type: 'GET',
							url: 'assets/web/data/expressways/' + table + '.json',
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
					// } else {
					// 	dataObject[table] = JSON.parse(localStorage.getItem(table));
					// }
					if (cnt == Object.keys(expressways).length) {
						setTimeout(() => {
							// console.log('init');
							initMainFunctions();
						}, 2000);
					}
				}
				others.forEach(function (other, i) {
					// console.log(other);
					if (!localStorage.getItem(other)) {
						var options = {
							type: 'GET',
							url: 'assets/web/data/default/' + other + '.json',
							dataType: 'json',
							success: function (data) {
								localStorage.setItem(other, JSON.stringify(data));
								dataObject[other] = data;
							},
							error: function () {
								console.log('error!', other + ' not found');
							}
						};
						$.ajax(options);
					} else {
						dataObject[other] = JSON.parse(localStorage.getItem(other));
					}
				});
			}
		},
		error: function () {
			console.log('error! expressways.json not found');
		}
	};
	$.ajax(options);
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

function loadJSON(path, success, error) {
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function () {
		if (xhr.readyState === XMLHttpRequest.DONE) {
			if (xhr.status === 200) {
				if (success) {
					success(JSON.parse(xhr.responseText));
				}
			} else {
				if (error) {
					error(xhr);
				}
			}
		}
	};
	xhr.open("GET", path, true);
	xhr.send();
}