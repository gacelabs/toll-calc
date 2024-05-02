var originJoinedData, destJoinedData;

$(document).ready(async function () {
	setInterval(() => {
		if ($('.tc1-loader-overlay.is-open').length) {
			$('.tc1-loader-overlay').removeClass('is-open');
			clearInterval();
		}
	}, 9000);

	$('[data-for]').on('click', function (e) {
		var ui = $('#' + $(e.target).data('for'));
		if (ui.length) {
			var tagName = ui.prop('tagName').toLowerCase();
			// console.log(tagName);
			if (tagName == 'input') {
				// console.log(ui.attr('type'), $('#'+$(e.target).data('for')));
				switch (ui.attr('type')) {
					case 'radio':
						$('#' + $(e.target).data('for')).trigger('click');
					break;
					default:
						$('#' + $(e.target).data('for')).trigger('click');
					break;
				}
			}
		}
	});

	$('.year-value').html(new Date().getFullYear());

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

	/* $('[name="bound"]').on('change', function (e) {
		// console.log($(e.target).is(':checked'), e.target.value, $(e.target));
		$('[name="bound"]').removeAttr('checked');
		$(e.target).attr('checked', 'checked');
		$('.cities-input').val('');
		$('.cities-input').removeAttr('data-set');
	}); */

	// console.log(Object.keys(dataObject).length, dataObject);
	if (Object.keys(dataObject).length == 0) {
		/* make a loader to wait for instanciation of the table datas when localStorage has no data */
		const i = setInterval(async () => {
			if (Object.keys(dataObject).length > 0) {
				var originJsonCities = new JSONQuery(dataObject.cities);
				originJoinedData = await originJsonCities.join(dataObject.archipelago, "province");
				var destJsonCities = new JSONQuery(dataObject.cities);
				destJoinedData = await destJsonCities.join(dataObject.archipelago, "province");

				runCitySearchData();
				clearInterval(i);
			}
		}, 333);
	} else {
		var originJsonCities = new JSONQuery(dataObject.cities);
		originJoinedData = await originJsonCities.join(dataObject.archipelago, "province");
		var destJsonCities = new JSONQuery(dataObject.cities);
		destJoinedData = await destJsonCities.join(dataObject.archipelago, "province");

		runCitySearchData();
	}

	$('#search_form').on('submit', function (e) {
		// ORIGIN
		var origin = $('#origin');
		// DESTINATION
		var dest = $('#destination');
		if (($.trim(origin.val()) != '' && $.trim(dest.val()) != '') && $.trim(origin.val()) === $.trim(dest.val())) {
			e.preventDefault();
			var placeHolder = dest.attr('placeholder');
			dest.val('');
			dest.removeAttr('data-set');
			dest.attr('placeholder', 'Same origin value failed!');
			showToast({ content: '<strong>The same inputed values are not allowed!</strong>', type: 'bad' });
			setTimeout(() => {
				dest.attr('placeholder', placeHolder);
			}, 2000);
		} else if ($.trim(origin.val()) == '' || $.trim(dest.val()) == '') {
			e.preventDefault();
			showToast({ content: '<strong>Please enter value on both fields!</strong>', type: 'bad' });
		} else {
			if (origin.attr('data-set') != undefined && dest.attr('data-set') != undefined) {
				var origin_data = JSON.parse(origin.attr('data-set'));
				var dest_data = JSON.parse(dest.attr('data-set'));
				// console.log(origin_data, dest_data);

				var originRoutes = generateRoutes(origin_data, dest_data.start);
				var destinationRoutes = generateRoutes(dest_data, origin_data.start);
				// console.log(originRoutes, destinationRoutes);

				/* var oAllData = runNCRData(origin_data, originRoutes, dest_data, destinationRoutes);
				originRoutes = oAllData.origin;
				destinationRoutes = oAllData.destination; */

				if (Object.keys(originRoutes).length && Object.keys(destinationRoutes).length) {
					localStorage.setItem('search_results', JSON.stringify({
						'origin': originRoutes, 'destination': destinationRoutes,
						'origin_dataset': origin_data, 'destination_dataset': dest_data,
					}));
					$('.tc1-loader-overlay').addClass('is-open');
					// console.log(localStorage.getItem('search_results'));
					/* setTimeout(() => {
						window.location = '/results?origin=' + encodeURI($.trim(origin.val())) + '&destination=' + encodeURI($.trim(dest.val()));
					}, 3000); */
				}
			}
		}
	});

	$('#detailed-routes').on('click', function (e) {
		var origin_all_routes_data = localStorage.getItem('origin_all_routes');
		var destination_all_routes_data = localStorage.getItem('destination_all_routes');
		if (origin_all_routes_data != null && destination_all_routes_data != null) {
			$('.tc1-loader-overlay').addClass('is-open');
			setTimeout(() => {
				// console.log(localStorage.getItem('search_results'));
				window.location = '/routes?mode=complete';
			}, 3000);
		}
	});
});

function generateNCRRoutes(direction, oData) {
	var oClass = new JSONQuery(dataObject.ncr[direction]);
	var inputValue = oData.old_name;
	var inputProv = oData.province;

	var oCondition = [
		{ field: 'nearest', operator: 'in like', value: '%' + inputValue + '%' },
		{ field: 'province', operator: 'in like', value: '%' + inputProv + '%' },
	];

	var query = {
		select: { fields: '*' },
		where: {
			condition_or: oCondition
		}
	};
	var result = oClass.execute(query);
	// console.log(result);
	return result;
}

var generateRoutes = function (oData, gointTo, urBoundTo) {
	var oRoutes = {};
	var oTollways = oData.tollways;
	var oTollSubjects = (oData.toll_subjects != undefined && oData.toll_subjects.length) ? oData.toll_subjects : false;
	// var urBoundTo = $('[name="bound"]:checked').val();
	if (urBoundTo == undefined) {
		var urBoundTo = 'north';
		if (oData.start == 'north' && gointTo == 'south') {
			urBoundTo = 'south';
		} else if (oData.start == gointTo) {
			urBoundTo = oData.start;
		}
	}
	console.log('started:', $.trim(oData.start), ', bound to:', $.trim(urBoundTo), 'ended:', $.trim(gointTo));

	if (urBoundTo == 'north') {
		if (oData.start == 'north') {
			oTollways = oTollways.reverse();
			if (oTollSubjects) {
				oTollSubjects = oTollSubjects.reverse();
			}
		}
	}
	for (var c in oTollways) {
		var toll = oTollways[c];
		if (oData.province == 'NCR' && toll == 'nlex' && urBoundTo == 'south') {
			// continue;
		}
		var tollway = dataObject[toll];
		var allow = true;
		if (oTollSubjects) {
			allow = oTollSubjects[c].cities.includes(oData.old_name)/*  && oTollSubjects[c].way === urBoundTo */;
		}

		if (allow) {
			oRoutes[toll] = {};
			for (var class_name in tollway) {
				if (toll == 'ncr') {
					class_name = urBoundTo;
					console.log(class_name, tollway);
				}
				if (tollway[class_name] != undefined) {
					var oClasses = tollway[class_name];
					var oClass = new JSONQuery(oClasses);
					oRoutes[toll][class_name] = [];
					// console.log(oRoutes, toll, oClass);

					if (oData.endline == true) {
						// console.log(urBoundTo, gointTo, oOrig);
						// console.log(oClass.data);
						if (oData.start == 'south') { // started from south
							var key = oClass.data.length - 1;
							if (toll === 'slex') key -= 1;
						} else {
							var key = 0;
						}
						var oTolls = oClass.data[key].tolls;
						// console.log(urBoundTo, gointTo);
						if (urBoundTo == gointTo) {
							var sEntry = oTolls[oTolls.length - 1].exit;
							var sExit = oTolls[0].exit;
						} else {
							var sEntry = oTolls[0].exit;
							var sExit = oTolls[oTolls.length - 1].exit;
						}
						var iFee = oTolls[oTolls.length - 1].fee == 0 ? oTolls[0].fee : oTolls[oTolls.length - 1].fee;
						if (gointTo == 'north') {
							iFee = oTolls[0].fee == 0 ? oTolls[oTolls.length - 1].fee : oTolls[0].fee;
						}

						if (sEntry != sExit) {
							oRoutes[toll][class_name].push({
								'entry': sEntry,
								'tolls': oTolls,
								'exit': sExit,
								'fee': iFee,
								'start': oData.start,
								'ended': gointTo,
							});
						}
					} else {
						var oCondition = [
							{ field: 'nearest', operator: 'in like', value: '%' + oData.old_name + '%' },
							{ field: 'province', operator: 'in', value: oData.province },
						];
						var query = {
							select: { fields: '*' },
							where: {
								condition: oCondition
							}
						};
						var result = oClass.execute(query);

						// console.log(result.data);
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
							var oGuideTolls = false, oGuideClass = false;
							var toNorth = $.trim(oData.start) == 'south' && $.trim(urBoundTo) == 'north' && $.trim(gointTo) == 'north';
							var toSouth = $.trim(oData.start) == 'north' && $.trim(urBoundTo) == 'south' && $.trim(gointTo) == 'south';

							if ($.inArray(toll, ['ncr', 'skyway_3']) < 0) {
								if (toSouth || gointTo == 'south') {
									oGuideClass = oClasses[oClasses.length - 1];
									oGuideTolls = oGuideClass.tolls;
								} else if (toNorth || gointTo == 'north') {
									oGuideClass = oClasses[0];
									oGuideTolls = oGuideClass.tolls;
								}
								// console.log(urBoundTo, oData.start, result.data, oGuideTolls);
							}
							// console.log(oGuideClass, toNorth, toSouth);

							for (var x in result.data) {
								var oResult = result.data[x];
								var sEntry = oResult.entry;
								var oTolls = oResult.tolls;

								if (oGuideTolls != false) {
									oTolls = [];
									for (var i in oGuideTolls) {
										var oGToll = oGuideTolls[i];
										oTolls.push(oGToll);
										if (oGToll.exit === sEntry) {
											break;
										}
									}

									if (toSouth) {
										var sExit = oTolls[0].exit;
										var iFee = oTolls[0].fee == 0 ? oTolls[oTolls.length - 1].fee : oTolls[0].fee;
									} else {
										var sExit = oGuideClass.entry;
										var iFee = oTolls[oTolls.length - 1].fee == 0 ? oTolls[0].fee : oTolls[oTolls.length - 1].fee;
									}
								} else {
									if (oData.start == 'south' && gointTo == 'north') {
										// sEntry = oTolls[oTolls.length - 1].exit;
										sExit = oTolls[0].exit;
										iFee = oTolls[0].fee == 0 ? oTolls[oTolls.length - 1].fee : oTolls[0].fee;
									} else if (oData.start == 'north' && gointTo == 'south') {
										sEntry = oTolls[0].exit;
										sExit = oTolls[oTolls.length - 1].exit;
										iFee = oTolls[oTolls.length - 1].fee == 0 ? oTolls[0].fee : oTolls[oTolls.length - 1].fee;
									} else {
										if (gointTo == 'north') {
											sEntry = oTolls[0].exit;
											sExit = oTolls[oTolls.length - 1].exit;
											iFee = oTolls[oTolls.length - 1].fee == 0 ? oTolls[0].fee : oTolls[oTolls.length - 1].fee;
										} else {
											sEntry = oTolls[oTolls.length - 1].exit;
											sExit = oTolls[0].exit;
											iFee = oTolls[0].fee == 0 ? oTolls[oTolls.length - 1].fee : oTolls[0].fee;
										}
									}
								}
								if (sEntry == sExit) {
									sEntry = oResult.entry;
								}

								oRoutes[toll][class_name].push({
									'entry': sEntry,
									'tolls': oTolls,
									'exit': sExit,
									'fee': iFee,
									'start': oData.start,
									'ended': gointTo,
								});
							}
						}
					}

					if (oRoutes[toll][class_name].length == 0) {
						delete oRoutes[toll][class_name];
					} else {
						oRoutes[toll][class_name] = removeDuplicates(oRoutes[toll][class_name], 'entry');
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

var runCitySearchData = function () {
	$('.cities-input').each(function (i, elem) {
		// console.log(i, elem);
		$(elem).on('input paste', async function (e) {
			// console.log(e);
			var jsonCities = new JSONQuery(dataObject.cities);
			const joinedData = await jsonCities.join(dataObject.archipelago, "province");
			var query = {
				select: { fields: '*' },
				where: {
					condition_or: [
						{ field: 'name', operator: 'like', value: '%' + e.target.value + '%' },
						{ field: 'province', operator: 'like', value: '%' + e.target.value + '%' },
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
		}).on('keyup', function (e) {
			if (e.keyCode == 13) {
				$('#search_form').trigger('submit');
			}
		}).on('change', function (e) {
			if (e.keyCode == 13) {
				$('#search_form').trigger('submit');
			}
		});

		if (i === ($('.cities-input').length - 1)) {
			switch (window.location.pathname) {
				case '/results':
					runSearchResults();
					break;
				case '/routes':
					runDetailedRoutes();
					break;
			}
		}
	});
}

var runSearchResults = function () {
	var search_results = localStorage.getItem('search_results');
	if (search_results != null) {
		search_results = JSON.parse(search_results);
		var urlParam = urlParams();
		
		if (urlParam.size) {
			var origin = $('#origin');
			var originValue = urlParam.get('origin').toString();
			origin.val(originValue);

			var dest = $('#destination');
			var destValue = urlParam.get('destination').toString();
			dest.val(destValue);
			
			// ORIGIN
			origin.attr('data-set', JSON.stringify(search_results.origin_dataset));
			// DESTINATION
			dest.attr('data-set', JSON.stringify(search_results.destination_dataset));

			$('.tc1-loader-overlay').addClass('is-open');
			setTimeout(() => {
				renderSearchResults();
			}, 1000);
		}
	}
}

var renderSearchResults = function () {
	var oResults = JSON.parse(localStorage.getItem('search_results'));
	console.log(oResults);
	var expresswayData = dataObject.expressways;
	// ORIGIN
	var origin = $('#origin');
	// DESTINATION
	var dest = $('#destination');
	// console.log(origin.val(), dest.val());
	var origin_data = JSON.parse(origin.attr('data-set'));
	var dest_data = JSON.parse(dest.attr('data-set'));

	if (origin_data == undefined || dest_data == undefined) {
		addTheDataSets(origin.val(), dest.val());
		var origin_data = JSON.parse(origin.attr('data-set'));
		var dest_data = JSON.parse(dest.attr('data-set'));
	}

	setTimeout(() => {
		var sameProvince = origin_data.province == dest_data.province;
		/* render origin */
		var oOrigin = oResults.origin;
		var uiOrigin = $('.origin-results');
		uiOrigin.find('.timeline-intro-head').html('From ' + origin.val());
		if (sameProvince) {
			var oOriginRev = Object.keys(oOrigin);
		} else {
			var oOriginRev = Object.keys(oOrigin).reverse();
		}

		for (var x in oOriginRev) {
			var route = oOriginRev[x];
			// for (var route in oOrigin) {
			var oItems = oOrigin[route];
			// console.log(oItems);
			var timelineTitle = expresswayData[route].fullname;
			var oCloneTimeline = uiOrigin.find('.timeline:first').clone();
			for (var classname in oItems) {
				// timelineTitle += ' - ' + classname.ucWords().replace('_', ' ');
				oCloneTimeline.find('.timeline-inverted .timeline-title').html('Take ' + timelineTitle);

				var oRoute = oItems[classname];
				let pUI = '';
				for (var i in oRoute) {
					if (sameProvince) {
						var toLook = oRoute[i].entry;
					} else {
						var toLook = oRoute[i].exit;
					}
					if (route == 'ncr') {
						toLook = toLook.toUpperCase();
					}
					var travelTo = (route == 'ncr' ? toLook.toUpperCase() + '</b>' : toLook + '</b> tollgate');
					if (pUI.indexOf(toLook) < 0) {
						if (route == 'ncr') {
							pUI += '<p>- Travel to <b>' + travelTo + '</p>'
						} else {
							pUI += '<p>- Enter <b>' + travelTo + '</p>'
						}
					}
				}
				oCloneTimeline.find('.timeline-inverted .timeline-body').append(pUI);
				break;
			}
			uiOrigin.find('.page-body').append(oCloneTimeline.removeClass('hide'));
		}
		// console.log(uiOrigin.get(0));
		localStorage.setItem('origin_all_routes', JSON.stringify(oOrigin));

		/* render destination */
		var oDestination = oResults.destination;
		var uiDestination = $('.destination-results');
		uiDestination.find('.timeline-intro-head').html('to ' + dest.val());
		if (sameProvince) {
			var oDestinationRev = Object.keys(oDestination).reverse();
		} else {
			var oDestinationRev = Object.keys(oDestination);
		}

		for (var x in oDestinationRev) {
			var route = oDestinationRev[x];
			// for (var route in oDestination) {
			var oItems = oDestination[route];
			// console.log(oItems, route);
			var timelineTitle = expresswayData[route].fullname;
			var oCloneTimeline = uiDestination.find('.timeline:first').clone();
			for (var classname in oItems) {
				// timelineTitle += ' - ' + classname.ucWords().replace('_', ' ');
				oCloneTimeline.find('.timeline-inverted .timeline-title').html('Take ' + timelineTitle);

				var oRoute = oItems[classname];
				let pUI = '';
				for (var i in oRoute) {
					var toLook = oRoute[i].entry;
					if (route == 'ncr') {
						toLook = oRoute[i].entry.toUpperCase();
					}
					var travelTo = (route == 'ncr' ? toLook.toUpperCase() + '</b>' : toLook + '</b> exit');
					if (pUI.indexOf(toLook) < 0) {
						if (route == 'ncr') {
							pUI += '<p>- Travel to <b>' + travelTo + '</p>'
						} else {
							pUI += '<p>- Exit through <b>' + travelTo + '</p>'
						}
					}
				}
				oCloneTimeline.find('.timeline-inverted .timeline-body').append(pUI);
				break;
			}
			uiDestination.find('.page-body').append(oCloneTimeline.removeClass('hide'));
		}
		localStorage.setItem('destination_all_routes', JSON.stringify(oDestination));
	}, 333);
}

function runNCRData(origin_data, originRoutes, dest_data, destinationRoutes) {
	if ($.inArray('ncr', origin_data.tollways) >= 0 || $.inArray('ncr', dest_data.tollways) >= 0) {
		var bBetweenMain = (originRoutes.slex != undefined && destinationRoutes.nlex != undefined)
			|| (originRoutes.nlex != undefined && destinationRoutes.slex != undefined)
			|| (originRoutes.nlex != undefined && destinationRoutes.tplex != undefined)
			|| (originRoutes.slex != undefined && destinationRoutes.tplex != undefined)
			|| (originRoutes.tplex != undefined && destinationRoutes.nlex != undefined)
			|| (originRoutes.tplex != undefined && destinationRoutes.slex != undefined)
			;

		var bNoNcr = originRoutes.ncr == undefined || destinationRoutes.ncr == undefined;
		var result = { data: [] };
		if (bBetweenMain) {
			var direction = origin_data.start;
			if (bNoNcr) {
				if (destinationRoutes.ncr == undefined) {
					direction = dest_data.start;
				}
			}
			if (direction == 'south') {
				result = generateNCRRoutes(direction, dest_data);
			} else {
				result = generateNCRRoutes(direction, origin_data);
			}
			// console.log(result);
			if (result.data.length) {
				var oPush = {
					'entry': result.data[0].entry,
					'tolls': result.data[0].tolls,
					'exit': result.data[0].tolls[result.data[0].tolls.length - 1].exit,
					'fee': result.data[0].tolls[result.data[0].tolls.length - 1].fee,
					'start': direction,
					'ended': direction == 'north' ? 'south' : direction,
				};

				if (direction == 'north') {
					originRoutes['ncr'] = {};
					originRoutes['ncr'][direction] = [];
					originRoutes['ncr'][direction].push(oPush);
				} else {
					destinationRoutes['ncr'] = {};
					destinationRoutes['ncr'][direction] = [];
					destinationRoutes['ncr'][direction].push(oPush);
				}
			}
		}

		var bothExpress = (originRoutes.nlex == undefined && destinationRoutes.nlex == undefined)
			|| (originRoutes.slex == undefined && destinationRoutes.slex == undefined)
			;

		if (bothExpress) {
			if (originRoutes.ncr == undefined) {
				var direction = origin_data.start;
				result = generateNCRRoutes(direction, origin_data);
				var oPush = {
					'entry': result.data[0].entry,
					'tolls': result.data[0].tolls,
					'exit': result.data[0].tolls[result.data[0].tolls.length - 1].exit,
					'fee': result.data[0].tolls[result.data[0].tolls.length - 1].fee,
					'start': direction,
					'ended': direction == 'north' ? 'south' : direction,
				};
				originRoutes['ncr'] = {};
				originRoutes['ncr'][direction] = [];
				originRoutes['ncr'][direction].push(oPush);
			}

			if (destinationRoutes.ncr == undefined) {
				var direction = dest_data.start;
				result = generateNCRRoutes(direction, dest_data);
				var oPush = {
					'entry': result.data[0].entry,
					'tolls': result.data[0].tolls,
					'exit': result.data[0].tolls[result.data[0].tolls.length - 1].exit,
					'fee': result.data[0].tolls[result.data[0].tolls.length - 1].fee,
					'start': direction,
					'ended': direction == 'north' ? 'south' : direction,
				};
				destinationRoutes['ncr'] = {};
				destinationRoutes['ncr'][direction] = [];
				destinationRoutes['ncr'][direction].push(oPush);
			}
		}

		return { origin: originRoutes, destination: destinationRoutes };
	}
}

function runDetailedRoutes() {
	var origin_all_routes_data = localStorage.getItem('origin_all_routes');
	var destination_all_routes_data = localStorage.getItem('destination_all_routes');
	if (origin_all_routes_data != null && destination_all_routes_data != null) {
		$('.tc1-loader-overlay').addClass('is-open');
		var origin_all_routes = JSON.parse(origin_all_routes_data);
		var destination_all_routes = JSON.parse(destination_all_routes_data);
		setTimeout(() => {
			console.log(origin_all_routes);
			console.log(destination_all_routes);
		}, 3000);
	}
}

function addTheDataSets(originValue, destValue) {
	// ORIGIN
	var origin = $('#origin');
	// DESTINATION
	var dest = $('#destination');
	var modObject = { 'modify': ['name'], 'expressions': [{ 'concat': ['city', ', ', 'province'] }] };

	var originData = originValue.replace(' City', '').split(', ');
	var cityOrigin = originData[0];
	var provinceOrigin = originData[1];

	var originQuery = {
		select: { fields: '*' },
		where: {
			condition: [
				{ field: 'name', operator: '=', value: cityOrigin },
				{ field: 'province', operator: '=', value: provinceOrigin },
			]
		}
	};
	var originResult = originJoinedData.execute(originQuery, modObject);
	// console.log(originResult, originResult.data);
	if (originResult.data.length) {
		origin.attr('data-set', JSON.stringify(originResult.data[0]));
	}

	var destData = destValue.replace(' City', '').split(', ');
	var cityDest = destData[0];
	var provinceDest = destData[1];
	var destQuery = {
		select: { fields: '*' },
		where: {
			condition: [
				{ field: 'name', operator: '=', value: cityDest },
				{ field: 'province', operator: '=', value: provinceDest },
			]
		}
	};
	var destResult = destJoinedData.execute(destQuery, modObject);
	// console.log(destResult, destResult.data);
	if (destResult.data.length) {
		dest.attr('data-set', JSON.stringify(destResult.data[0]));
	}
}
