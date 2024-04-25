$(document).ready(function() {
	$('[data-for]').on('click', function (e) {
		var ui = $('#' + $(e.target).data('for'));
		if (ui.length) {
			var tagName = ui.prop('tagName').toLowerCase();
			// console.log(tagName);
			if (tagName == 'input') {
				// console.log(ui.attr('type'), $('#'+$(e.target).data('for')));
				switch (ui.attr('type')) {
					case 'radio':
						$('#'+$(e.target).data('for')).trigger('click');
						break;
						
					default:
						$('#'+$(e.target).data('for')).trigger('click');
						break;
				}
			}
		}
	});
	
	$('.year-value').text(new Date().getFullYear());

	$(window).on('resize', function (e) {
		var nav = $('.navbar-nav.nav-dropdown');
		if ($(window).width() <= 768) {
			nav.removeClass('hide');
			$('#header-title').addClass('pt-5');
		} else {
			nav.addClass('hide');
			$('#header-title').removeClass('pt-5');
		}
	});

	$(window).trigger('resize');
	
	$('strong[data-for="north"]').disableSelection();
	$('strong[data-for="south"]').disableSelection();
	
	$('[name="bound"]').on('change', function (e) {
		// console.log($(e.target).is(':checked'), e.target.value, $(e.target));
		$('[name="bound"]').removeAttr('checked');
		$(e.target).attr('checked', 'checked');
		$('.cities-input').val('');
		$('.cities-input').removeAttr('data-set');
	});

	// console.log(Object.keys(dataObject).length, dataObject);
	if (Object.keys(dataObject).length == 0) {
		/* make a loader to wait for instanciation of the table datas when localStorage has no data */
		var i = setInterval(() => {
			if (Object.keys(dataObject).length > 0) {
				runCitySearchData();
				clearInterval(i);
			}
		}, 3);
	} else {
		runCitySearchData();
	}

	$('#search_form').on('submit', function (e) {
		e.preventDefault();

		// ORIGIN
		var origin = $('#im_from');
		// DESTINATION
		var dest = $('#going_to');

		if (origin.attr('data-set') != undefined && dest.attr('data-set') != undefined) {
			var sBound = $('[name="bound"]:checked').val();
			var origin_data = JSON.parse(origin.attr('data-set'));
			var dest_data = JSON.parse(dest.attr('data-set'));
			console.log(origin_data, dest_data);

			if (origin_data.start != sBound) {
				$(origin).val('');
				$(origin).removeAttr('data-set');
				var placeholder = $(origin).attr('placeholder');
				$(origin).attr('placeholder', 'Value is not bound to ' + sBound);
				setTimeout(() => {
					$(origin).attr('placeholder', placeholder);
				}, 3000);
			} else {
				var originRoutes = generateOriginRoutes(origin_data);
			}

			var sBound = $('[name="bound"]:checked').val();
			if (dest_data.start != sBound) {
				$(dest).val('');
				$(dest).removeAttr('data-set');
				var placeholder = $(dest).attr('placeholder');
				$(dest).attr('placeholder', 'Value is not bound to ' + sBound);
				setTimeout(() => {
					$(dest).attr('placeholder', placeholder);
				}, 3000);
			} else {
				var destinationRoutes = generateDestinationRoutes(originRoutes, dest_data);
			}

			console.log(originRoutes, destinationRoutes);
		}
	});
});

var generateOriginRoutes = function (oData) {
	var oRoutes = {};
	var oTollways = oData.tollways;
	var oTollSubjects = (oData.toll_subjects != undefined && oData.toll_subjects.length) ? oData.toll_subjects : false;
	var urBoundTo = $('[name="bound"]:checked').val();
	var bLastExit = false;
	if (urBoundTo == 'north') {
		if (oData.start == 'south') {
			oTollways = oTollways.reverse();
			if (oTollSubjects) {
				oTollSubjects = oTollSubjects.reverse();
			}
		}
	} else {
		if (oData.start == 'north') { // starting from north
			bLastExit = true;
		}
	}
	for (var c in oTollways) {
		var toll = oTollways[c];
		var tollway = dataObject[toll];
		var allow = true;
		if (oTollSubjects) {
			allow = oTollSubjects[c].cities.includes(oData.old_name);
		}

		if (allow) {
			oRoutes[toll] = {};
			for (var class_name in tollway) {
				if (tollway[class_name] != undefined) {
					var oClasses = tollway[class_name];
					var oClass = new JSONQuery(oClasses);
					oRoutes[toll][class_name] = [];
					// console.log(oRoutes, toll, oClass);
	
					if (oData.endline == true) {
						// console.log(oClass.data);
						if (oData.start == 'south') { // started from south
							var key = oClass.data.length - 1;
						} else {
							var key = 0;
						}
						var oTolls = oClass.data[key].tolls;
						if (bLastExit) {
							var sEntry = oTolls[oTolls.length - 1].exit;
							var sExit = oClass.data[key].entry;
							var iFee = oTolls[oTolls.length - 1].fee;
						} else {
							var sEntry = oClass.data[key].entry;
							var sExit = oTolls[0].exit;
							var iFee = oTolls[0].fee;
						}
						if (sEntry != sExit) {
							oRoutes[toll][class_name].push({
								'entry': sEntry,
								'tolls': oTolls,
								'exit': sExit,
								'fee': iFee,
								'start': oData.start,
							});
						}
					} else {
						var oCondition = [
							{ field: 'nearest', operator: 'in like', value: '%' + oData.old_name + '%' },
						];

						var query = {
							select: { fields: '*' },
							where: {
								condition: oCondition
							}
						};
						var result = oClass.execute(query);
						// console.log(result.data.length);
						if (result.data.length == 0) {
							query.where = {
								condition: [
									{ field: 'province', operator: 'in', value: oData.province },
								]
							}
							var oClass = new JSONQuery(oClasses);
							result = oClass.execute(query);
							// console.log(result, toll, oClass);
						}
						if (result.data.length) {
							if (toll == 'skyway_3') {
								query.where = {
									condition: [
										{ field: 'bound', operator: '=', value: urBoundTo },
									]
								};
								result = result.execute(query);
							}
							// console.log(result, toll);
							for (var x in result.data) {
								var oResult = result.data[x];
								var sEntry = oResult.entry;
								var oTolls = oResult.tolls;
								
								if (urBoundTo == 'south' && oData.start == 'south') {
									var sExit = sEntry;
									var sEntry = oTolls[oTolls.length - 1].exit;
									var iFee = oTolls[oTolls.length - 1].fee;
								} else {
									var sExit = oTolls[oTolls.length - 1].exit;
									var iFee = oTolls[oTolls.length - 1].fee;
								}

								oRoutes[toll][class_name].push({
									'entry': sEntry,
									'tolls': oTolls,
									'exit': sExit,
									'fee': iFee,
									'start': oData.start,
								});
							}
						}
					}
	
					if (oRoutes[toll][class_name].length == 0) {
						delete oRoutes[toll][class_name];
					} else {
						// oRoutes[toll][class_name] = removeDuplicates(oRoutes[toll][class_name], 'exit');
					}
				}
			}
			if (Object.keys(oRoutes[toll]).length == 0) {
				delete oRoutes[toll];
			}
		}
	}
	// console.log(oRoutes);
	return oRoutes;
}

var generateDestinationRoutes = function (originData, oData) {
	var oRoutes = {};
	var oTollways = oData.tollways;
	// console.log(originData, oTollways);
	for (var c in oTollways) {
		var toll = oTollways[c];
		if (originData[toll] == undefined) {
			oRoutes = generateOriginRoutes(oData);
		}
		if (oRoutes[toll] != undefined && Object.keys(oRoutes[toll]).length == 0) {
			delete oRoutes[toll];
		}
	}
	// console.log(oRoutes);
	return oRoutes;
}

var runCitySearchData = function () {
	$('.cities-input').each(function (i, elem) {
		// console.log(i, elem);
		$(elem).on('input', function (e) {
			// console.log(e.target.value);
			var jsonCities = new JSONQuery(dataObject.cities);
			const joinedData = jsonCities.join(dataObject.archipelago, "province");
			var sBound = $('[name="bound"]:checked').val();
			if (sBound == 'north') {
				if (e.target.id == 'im_from') {
					sBound = 'south';
				}
			} else {
				if (e.target.id == 'im_from') {
					sBound = 'north';
				}
			}
			var query = {
				select: { fields: '*' },
				where: { 
					condition: [
						// { field: 'bound', operator: '=', value: sBound },
						{ field: 'name', operator: 'LIKE', value: '%' + e.target.value + '%' },
						{ field: 'province', operator: 'LIKE', value: '%' + e.target.value + '%' },
					] 
				}
			};
			// console.log(query);
			var result = joinedData.execute(query, {
				'modify': ['name'],
				'expressions': [
					{ 'concat': ['city', ', ', 'province'] },
				]
			});
			// console.log(result);
			autocomplete(e.target, result.data, 'name');
		/* }).on('change', function (e) {
			if (e.target.dataset.set != undefined) {
				var sBound = $('[name="bound"]:checked').val();
				// console.log(e.target.dataset.set);
				var inputData = JSON.parse(e.target.dataset.set);
				// console.log(inputData.start, sBound);
				if (inputData.start != sBound) {
					$(e.target).val('');
					$(e.target).removeAttr('data-set');
					var placeholder = $(e.target).attr('placeholder');
					$(e.target).attr('placeholder', 'Value is not bound to ' + sBound);
				}
				setTimeout(() => {
					$(e.target).attr('placeholder', placeholder);
				}, 3000);
			} */
		});
	});
}

var renderPage = function (page, parent) {
	var options = {
		type: "GET",
		url: page,// "assets/web/styles.html"
		dataType: "html",
		success: function (html) {
			if ($(parent).length) {
				$(parent).append(html);
			} else {
				console.log('No such parent page!', parent);
			}
		},
		error: function () {
			console.log('No such page!', page);
		}
	};
	$.ajax(options);
}

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

