String.prototype.ucWords = function () {
	return this.toLowerCase().replace(/\b[a-z]/g, function (letter) {
		return letter.toUpperCase();
	});
}

window.mobileCheck = function () {
	let check = false;
	(function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window.opera);
	return check;
};

window.mobileAndTabletCheck = function () {
	let check = false;
	(function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window.opera);
	return check;
};

(function ($) {
	$.fn.disableSelection = function () {
		return this
			.attr('unselectable', 'on')
			.css('user-select', 'none')
			.on('selectstart', false);
	};
})(jQuery);

function removeDuplicates(array, key) {
	return array.filter((item, index, self) =>
		index === self.findIndex((t) => (
			t[key] === item[key]
		))
	);
}

function mergeAndRemoveDuplicates(obj1, obj2, key) {
	// Combine objects into a single array
	const combinedArray = [...obj1, ...obj2];

	// Create a new object with unique keys
	const uniqueObject = combinedArray.reduce((acc, item) => {
		if (!acc[item[key]]) {
			acc[item[key]] = item;
		}
		return acc;
	}, {});

	// Return values of the resulting object as an array
	return Object.values(uniqueObject);
}

function urlParams() {
	var url = new URL(window.location.href);
	return url.searchParams;
}

function showToast(params) {
	let toastClone = $('#tc-toast').clone().removeAttr('id');
	toastClone.find('.toast-body').html(params.content);
	toastClone.removeClass('bg-success bg-danger bg-warning bg-info');
	switch (params.type) {
		case 'good':
			toastClone.addClass('bg-success');
			break;
		case 'bad':
			toastClone.addClass('bg-danger');
			break;
		case 'alert':
			toastClone.addClass('bg-warning');
			break;
		case 'info':
			toastClone.addClass('bg-info');
			break;
	}
	$('.toast-container').prepend(toastClone);
	toastClone.toast('show');
	if (typeof params.closure == 'function') {
		params.closure();
	}
}

function showNotification(title, body, redirectUrl) {
	if (("Notification" in window) == false) {
		console.error("This browser does not support desktop notification");
		showToast({ conten: 'This browser does not support desktop notification', type: 'bad' });
		return;
	}
	
	var options = {
		body: body,
		icon: '/assets/icons/toll-calc-b.png'
	};

	// Check if the user has granted permission to show notifications
	if (Notification.permission === "granted") {
		// If permission is granted, create a notification
		var notification = new Notification(title, options);

		notification.onclick = function (event) {
			event.preventDefault(); // Prevent the browser from focusing the Notification's tab
			window.open(redirectUrl, '_blank');
			notification.close();
		};
	} else if (Notification.permission !== "denied") {
		// If permission has not been denied, request permission
		Notification.requestPermission().then(function (permission) {
			if (permission === "granted") {
				var notification = new Notification(title, options);
	
				notification.onclick = function (event) {
					event.preventDefault(); // Prevent the browser from focusing the Notification's tab
					window.open(redirectUrl, '_blank');
					notification.close();
				};
			}
		});
	} else {
		showToast({ content: 'Cannot accept Notifications, site must be secured and on HTTPS protocol!', type: 'bad' });
	}
}

// Example function to get directions on Philippine expressways
async function getPhilippineExpresswayDirections(origin, destination, apiKey) {
	const expresswayWaypoints = ["NLEX", "SLEX", /* Add more expressway waypoints */];

	// Construct waypoints string for the request
	const waypointsString = expresswayWaypoints.map(waypoint => `via:${waypoint}`).join('|');

	// Construct the URL for the directions request
	const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&waypoints=${waypointsString}&key=${apiKey}`;

	try {
		const response = await fetch(url);
		const data = await response.json();

		// Filter routes to include only those passing through expressway waypoints
		const filteredRoutes = data.routes.filter(route => {
			return expresswayWaypoints.some(waypoint => {
				return route.summary.includes(waypoint);
			});
		});

		return filteredRoutes;
	} catch (error) {
		console.error('Error:', error);
		return null;
	}
}

/* // Example usage
const origin = "Manila, Philippines";
const destination = "Quezon City, Philippines";
const apiKey = "AIzaSyD0akNdbYMmrk7YqPVC7pHSU0x2iXgYlVw";

getPhilippineExpresswayDirections(origin, destination, apiKey).then(routes => {
	console.log(routes);
}).catch(error => {
	console.error('Error:', error);
}); */

function getMapDirections(params) {
	window.open('https://www.google.com/maps/dir/Marikina,+Metro+Manila/Valenzuela,+Metro+Manila/', '_blank');
}
