var originJoinedData, destJoinedData;
var isSubmitting = false;

var initMainFunctions = function () {
	$('.socicon.socicon-facebook').parent('a').attr({
		'href': 'https://www.facebook.com/groups/phtollfeecalculator/',
		'target': '_blank',
	});

	$('.social05 h3:first p').html("Join the ultimate destination for Philippine road warriors!<br>Whether you're navigating the North Luzon Expressway or cruising through the Southern Tagalog Arterial Road,<br>this community is your pit stop for toll fee insights, travel hacks, and highway adventures.<br>Buckle up and join us on the journey!");
	
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
		const i = setInterval(() => {
			if (Object.keys(dataObject).length > 0) {
				var originJsonCities = new JSONQuery(dataObject.cities);
				originJoinedData = originJsonCities.join(dataObject.archipelago, "province");
				var destJsonCities = new JSONQuery(dataObject.cities);
				destJoinedData = destJsonCities.join(dataObject.archipelago, "province");
				runCitySearchData();
				clearInterval(i);
			}
		}, 333);
	} else {
		var originJsonCities = new JSONQuery(dataObject.cities);
		originJoinedData = originJsonCities.join(dataObject.archipelago, "province");
		var destJsonCities = new JSONQuery(dataObject.cities);
		destJoinedData = destJsonCities.join(dataObject.archipelago, "province");
		runCitySearchData();
	}

	$('#search_form').on('submit', function (e) {
		if (isSubmitting == false) {
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
				e.preventDefault();
				if (origin.attr('data-set') != undefined && dest.attr('data-set') != undefined) {
					var origin_data = JSON.parse(origin.attr('data-set'));
					var dest_data = JSON.parse(dest.attr('data-set'));
					getSearchResults(origin_data, dest_data, this, true);
				} else {
					showToast({ content: 'Please enter the origin and detination routes you want to know', type: 'info' });
				}
			}
		}
	});

	$('#detailed-routes').on('click', function (e) {
		var detailed_routes = localStorage.getItem('detailed_routes');
		if (detailed_routes != null) {
			setTimeout(() => {
				// console.log(localStorage.getItem('detailed_routes'));
				window.location = '/routes' + window.location.search;
			}, 777);
		}
	});
};

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

var generateRoutes = function (oData, oData2) {
	// console.log(oData, oData2, urBoundTo);
	var oRoutes = {};
	var oTollways = oData.tollways;
	var oTollSubjects = (oData.toll_subjects != undefined && oData.toll_subjects.length) ? oData.toll_subjects : false;
	// var urBoundTo = $('[name="bound"]:checked').val();
	var gointTo = oData2.start;
	var urBoundTo = 'north';
	if (oData.start == 'north' && gointTo == 'south') {
		urBoundTo = 'south';
	} else if (oData.start == gointTo) {
		urBoundTo = oData.start;
	}
	console.log('started:', $.trim(oData.start), ', bound to:', $.trim(urBoundTo), 'ended:', $.trim(gointTo));

	for (var c in oTollways) {
		var toll = oTollways[c];
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
					// console.log(class_name, tollway);
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
							var sEntryProvince = oTolls[oTolls.length - 1].province;
							var sExit = oTolls[0].exit;
							var sExitProvince = oTolls[0].province;
						} else {
							var sEntry = oTolls[0].exit;
							var sEntryProvince = oTolls[0].province;
							var sExit = oTolls[oTolls.length - 1].exit;
							var sExitProvince = oTolls[oTolls.length - 1].province;
						}
						var iFee = oTolls[oTolls.length - 1].fee == 0 ? oTolls[0].fee : oTolls[oTolls.length - 1].fee;
						if (gointTo == 'north') {
							iFee = oTolls[0].fee == 0 ? oTolls[oTolls.length - 1].fee : oTolls[0].fee;
						}

						if (sEntry != sExit) {
							oRoutes[toll][class_name].push({
								'tolls': oTolls,
								'entry': sEntry,
								'entry_province': sEntryProvince,
								'exit': sExit,
								'exit_province': sExitProvince,
								'fee': iFee,
								'start': oData.start,
								'ended': gointTo,
								'region': oData.region,
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
								var sEntryProvince = oResult.province[0];
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
										var sExitProvince = oTolls[0].province;
										var sExit = oTolls[0].exit;
										var iFee = oTolls[0].fee == 0 ? oTolls[oTolls.length - 1].fee : oTolls[0].fee;
									} else {
										var sExit = oGuideClass.entry;
										var iFee = oTolls[oTolls.length - 1].fee == 0 ? oTolls[0].fee : oTolls[oTolls.length - 1].fee;
										var sExitProvince = oTolls[oTolls.length - 1].fee == 0 ? oTolls[oTolls.length - 1].province : oTolls[0].province;
									}
								} else {
									if (oData.start == 'south' && gointTo == 'north') {
										// sEntry = oTolls[oTolls.length - 1].exit;
										sExit = oTolls[0].exit;
										var sExitProvince = oTolls[0].exit;
										iFee = oTolls[0].fee == 0 ? oTolls[oTolls.length - 1].fee : oTolls[0].fee;
									} else if (oData.start == 'north' && gointTo == 'south') {
										sEntry = oTolls[0].exit;
										sEntryProvince = oTolls[0].province;
										sExit = oTolls[oTolls.length - 1].exit;
										var sExitProvince = oTolls[oTolls.length - 1].province;
										iFee = oTolls[oTolls.length - 1].fee == 0 ? oTolls[0].fee : oTolls[oTolls.length - 1].fee;
									} else {
										if (gointTo == 'north') {
											sEntry = oTolls[0].exit;
											sEntryProvince = oTolls[0].province;
											sExit = oTolls[oTolls.length - 1].exit;
											var sExitProvince = oTolls[oTolls.length - 1].province;
											iFee = oTolls[oTolls.length - 1].fee == 0 ? oTolls[0].fee : oTolls[oTolls.length - 1].fee;
										} else {
											sEntry = oTolls[oTolls.length - 1].exit;
											sEntryProvince = oTolls[oTolls.length - 1].province;
											sExit = oTolls[0].exit;
											var sExitProvince = oTolls[0].province;
											iFee = oTolls[0].fee == 0 ? oTolls[oTolls.length - 1].fee : oTolls[0].fee;
										}
									}
								}
								if (sEntry == sExit) {
									sEntry = oResult.entry;
									sEntryProvince = oResult.province[0];
								}

								oRoutes[toll][class_name].push({
									'tolls': oTolls,
									'entry': sEntry,
									'entry_province': sEntryProvince,
									'exit': sExit,
									'exit_province': sExitProvince,
									'fee': iFee,
									'start': oData.start,
									'ended': gointTo,
									'region': oData.region,
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
	console.log(oRoutes);
	return oRoutes;
}

var runCitySearchData = function () {
	$('.cities-input').each(function (i, elem) {
		// console.log(i, elem);
		$(elem).on('input paste', function (e) {
			// console.log(e);
			var jsonCities = new JSONQuery(dataObject.cities);
			const joinedData = jsonCities.join(dataObject.archipelago, "province");
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
				var origin = $('#origin');
				var dest = $('#destination');
				if (origin.val().trim() != '' && dest.val().trim()) {
					$('#search_form').trigger('submit');
				} else {
					if (e.target.id == 'origin') {
						$('.cities-input').get(1).focus();
					} else {
						$('.cities-input').get(0).focus();
					}
				}
			}
		}).on('change', function (e) {
			if (e.keyCode == 13) {
				var origin = $('#origin');
				var dest = $('#destination');
				if (origin.val().trim() != '' && dest.val().trim()) {
					$('#search_form').trigger('submit');
				} else {
					if (e.target.id == 'origin') {
						$('.cities-input').get(1).focus();
					} else {
						$('.cities-input').get(0).focus();
					}
				}
			}
		}).on('search', function (e) {
			$(e.target).removeAttr('data-set');
		});
	});
	switch (window.location.pathname) {
		case '/results':
			runSearchResults();
			break;
		case '/routes':
			runDetailedRoutes();
			break;
		default:
			$('.tc1-loader-overlay').removeClass('is-open');
			break;
	}
}

var getSearchResults = function (origin_data, dest_data, oThis, isTest) {
	// console.log(origin_data, dest_data, oThis);
	var originRoutes = generateRoutes(origin_data, dest_data);
	var destinationRoutes = generateRoutes(dest_data, origin_data);
	// console.log(originRoutes, destinationRoutes);

	var oAllData = runNCRData(origin_data, originRoutes, dest_data, destinationRoutes);
	originRoutes = oAllData.origin;
	destinationRoutes = oAllData.destination;

	if (Object.keys(originRoutes).length && Object.keys(destinationRoutes).length) {
		localStorage.setItem('search_results', JSON.stringify({
			'origin': originRoutes, 'destination': destinationRoutes,
			'origin_dataset': origin_data, 'destination_dataset': dest_data,
		}));
		
		// console.log(localStorage.getItem('search_results'));
		if (oThis != true) {
			// window.location = '/results?origin=' + encodeURI($.trim(origin.val())) + '&destination=' + encodeURI($.trim(dest.val()));
			isSubmitting = true;
			if (isTest != true) {
				$('.tc1-loader-overlay').addClass('is-open');
				$(oThis).submit();
			}
		} else {
			switch (window.location.pathname) {
				case '/results':
					runSearchResults();
					break;
				case '/routes':
					runDetailedRoutes();
					break;
			}
		}
	} else {
		showToast({
			content: 'We are trying to gather accurate data for this query, We will inform you as soon as we have gathered the data. Thanks!',
			type: 'alert',
			closure: function () {
				if ("Notification" in window == false) {
					console.error("This browser does not support desktop notification");
					showToast({ content: 'This browser does not support desktop notification', type: 'bad' });
				} else {
					Notification.requestPermission().then(function (permission) {
						if (permission === "granted") {
							showToast({ content: 'We will notify you in regarding routes & data updates.', type: 'success' });
						}
					});
				}
			}
		});
	}
}

var runSearchResults = function () {
	var urlParam = urlParams();
	var origin = $('#origin');
	var dest = $('#destination');

	if (urlParam.size) {
		var originValue = urlParam.get('origin').toString();
		origin.val(originValue);

		var destValue = urlParam.get('destination').toString();
		dest.val(destValue);
	}

	var search_results = localStorage.getItem('search_results');
	// console.log(search_results);
	if (search_results != null) {
		search_results = JSON.parse(search_results);

		// ORIGIN
		origin.attr('data-set', JSON.stringify(search_results.origin_dataset));
		// DESTINATION
		dest.attr('data-set', JSON.stringify(search_results.destination_dataset));

		setTimeout(() => {
			switch (window.location.pathname) {
				case '/results':
					renderSearchResults();
					break;
				case '/routes':
					
					break;
			}
		}, 1000);
	} else {
		$('.cities-input').each(function (i, elem) {
			var jsonCities = new JSONQuery(dataObject.cities);
			var joinedData = jsonCities.join(dataObject.archipelago, "province");
			var splited = elem.value.split(', ');
			var cityname = splited[0].replace(' City', '');
			var provincename = splited[1];

			var query = {
				select: { fields: '*' },
				where: {
					condition: [
						{ field: 'name', operator: 'like', value: '%' + cityname + '%' },
						{ field: 'province', operator: 'like', value: '%' + provincename + '%' },
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
			if (result.data.length) {
				if (elem.id == 'origin') {
					// ORIGIN
					origin.attr('data-set', JSON.stringify(result.data[0]));
				} else {
					// DESTINATION
					dest.attr('data-set', JSON.stringify(result.data[0]));
				}
			}
			if (i == ($('.cities-input').length - 1)) {
				var origin_data = JSON.parse(origin.attr('data-set'));
				var dest_data = JSON.parse(dest.attr('data-set'));
				// console.log(origin_data, dest_data);
				setTimeout(() => {
					getSearchResults(origin_data, dest_data, true, true);
				}, 333);
			}
		});
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

	var oDetailedOrigin = [];
	var oDetailedDestination = [];
	var oFinalDetailed = [];

	setTimeout(() => {
		var sameProvince = origin_data.province == dest_data.province;
		/* render origin */
		var oOrigin = oResults.origin;
		var uiOrigin = $('.origin-results');
		uiOrigin.find('.timeline-intro-head').html('From ' + origin.val());
		var oOriginRev = Object.keys(oOrigin);

		for (var x in oOriginRev) {
			var route = oOriginRev[x];
			var oItems = oOrigin[route];
			var oDetailedRoute = {};
			// console.log(oItems);
			var timelineTitle = expresswayData[route].fullname;
			var oCloneTimeline = uiOrigin.find('.timeline:first').clone();
			// timelineTitle += ' - ' + classname.ucWords().replace('_', ' ');
			oCloneTimeline.find('.timeline-inverted .timeline-title').html('Take ' + timelineTitle);
			oDetailedRoute[route] = {};
			var cnt = 0, sEnter = '', sEntryProvince = '';
			for (var classname in oItems) {
				var oRoute = oItems[classname];
				oDetailedRoute[route][classname] = [];
				let pUI = '<ul>';
				for (var i in oRoute) {
					if (sameProvince) {
						var toLook = oRoute[i].entry;
						oDetailedRoute[route][classname].push({
							entry: oRoute[i].exit,
							entry_province: oRoute[i].exit_province,
							exit: oRoute[i].entry,
							exit_province: oRoute[i].entry_province,
							fee: oRoute[i].fee,
						});
					} else {
						var toLook = oRoute[i].exit;
						oDetailedRoute[route][classname].push({
							entry: oRoute[i].entry,
							entry_province: oRoute[i].entry_province,
							exit: oRoute[i].exit,
							exit_province: oRoute[i].exit_province,
							fee: oRoute[i].fee,
						});
					}
					if (route == 'ncr') {
						toLook = ($.inArray(toLook, ['nlex', 'slex']) >= 0) ? toLook.toUpperCase() : toLook;
					}
					var travelTo = ((route == 'ncr' && $.inArray(toLook.toLowerCase(), ['nlex', 'slex', 'skyway']) < 0) ? toLook + ' City</b>' : toLook + '</b> tollgate');
					if (pUI.indexOf(toLook) < 0) {
						if (route == 'ncr') {
							pUI += '<li>Travel to <b>' + travelTo.ucWords() + '</li>'
						} else {
							pUI += '<li>Enter <b>' + travelTo + '</li>'
						}
					}
				}
				if (cnt == 0) {
					sEnter = oRoute[i].entry;
					sEntryProvince = oRoute[i].entry_province;
					oCloneTimeline.find('.timeline-inverted .timeline-body').append(pUI + '</ul>');
				}
				cnt++;
				// break;
			}
			var sExit = oRoute[i].exit;
			var sExitProvince = oRoute[i].exit_province;
			uiOrigin.find('.page-body').append(oCloneTimeline.removeClass('hide'));

			oDetailedOrigin.push({
				'expressway': 'Take ' + timelineTitle,
				'enter': route == 'ncr' ? ($.inArray(sEnter.toLowerCase(), ['nlex', 'slex', 'skyway']) >= 0 ? sEnter.toUpperCase() + ' tollgate' : sEnter + ' City') : sEnter + ' tollgate',
				'enter_province': sEntryProvince,
				'exit': route == 'ncr' ? ($.inArray(sExit.toLowerCase(), ['nlex', 'slex', 'skyway']) >= 0 ? sExit.toUpperCase() + ' tollgate' : sExit + ' City') : sExit + ' tollgate',
				'exit_province': sExitProvince,
				'way': route,
				'details': oDetailedRoute[route]
			});
		}
		oFinalDetailed.push({ from: origin.val(), routes: oDetailedOrigin, province: origin_data.province });
		// console.log(oFinalDetailed);
		// console.log(uiOrigin.get(0));

		/* render destination */
		var oDestination = oResults.destination;
		var uiDestination = $('.destination-results');
		uiDestination.find('.timeline-intro-head').html('to ' + dest.val());
		var oDestinationRev = Object.keys(oDestination).reverse();

		for (var x in oDestinationRev) {
			var route = oDestinationRev[x];
			var oItems = oDestination[route];
			var oDetailedRoute = {};
			// console.log(oItems, route);
			var timelineTitle = expresswayData[route].fullname;
			var oCloneTimeline = uiDestination.find('.timeline:first').clone();
			// timelineTitle += ' - ' + classname.ucWords().replace('_', ' ');
			oCloneTimeline.find('.timeline-inverted .timeline-title').html((route == 'ncr' ? 'Upon ' : 'Take ') + timelineTitle);

			oDetailedRoute[route] = {};
			var cnt = 0, sEnter = '', sEntryProvince = '';
			for (var classname in oItems) {
				var oRoute = oItems[classname];
				oDetailedRoute[route][classname] = [];

				let pUI = '<ul>';
				for (var i in oRoute) {
					if (oRoute[i].entry != oRoute[i].exit) {
						var toLook = oRoute[i].entry;
						if (sameProvince) {
							oDetailedRoute[route][classname].push({
								entry: oRoute[i].entry,
								entry_province: oRoute[i].entry_province,
								exit: oRoute[i].exit,
								exit_province: oRoute[i].exit_province,
								fee: oRoute[i].fee,
							});
						} else {
							oDetailedRoute[route][classname].push({
								entry: oRoute[i].exit,
								entry_province: oRoute[i].exit_province,
								exit: oRoute[i].entry,
								exit_province: oRoute[i].entry_province,
								fee: oRoute[i].fee,
							});
						}
						if (route == 'ncr') {
							toLook = ($.inArray(toLook, ['nlex', 'slex']) >= 0) ? toLook.toUpperCase() : toLook;
						}
						var travelTo = ((route == 'ncr' && $.inArray(toLook.toLowerCase(), ['nlex', 'slex', 'skyway']) < 0) ? toLook + ' City</b>' : toLook + '</b> tollgate');
						if (pUI.indexOf(toLook) < 0) {
							if (route == 'ncr') {
								pUI += '<li>Travel to <b>' + travelTo.ucWords() + '</li>'
							} else {
								if (origin_data.start == 'north') {
									pUI += '<li>Exit through <b>' + travelTo + '</li>'
								} else {
									pUI += '<li>Enter <b>' + travelTo + '</li>'
								}
							}
						}
					}
				}
				if (cnt == 0) {
					sEnter = oRoute[i].exit;
					sEntryProvince = oRoute[i].exit_province;
					oCloneTimeline.find('.timeline-inverted .timeline-body').append(pUI + '</ul>');
				}
				cnt++;
				// break;
			}
			var sExit = oRoute[i].entry;
			var sExitProvince = oRoute[i].entry_province;
			uiDestination.find('.page-body').append(oCloneTimeline.removeClass('hide'));

			oDetailedDestination.push({
				'expressway': (route == 'ncr' ? 'Upon ' : 'Take ') + timelineTitle,
				'enter': route == 'ncr' ? ($.inArray(sEnter.toLowerCase(), ['nlex', 'slex', 'skyway']) >= 0 ? sEnter.toUpperCase() + ' tollgate' : sEnter + ' City') : sEnter + ' tollgate',
				'enter_province': sEntryProvince,
				'exit': route == 'ncr' ? ($.inArray(sExit.toLowerCase(), ['nlex', 'slex', 'skyway']) >= 0 ? sExit.toUpperCase() + ' tollgate' : sExit + ' City') : sExit + ' tollgate',
				'exit_province': sExitProvince,
				'way': route,
				'details': oDetailedRoute[route]
			});
		}
		oFinalDetailed.push({ to: dest.val(), routes: oDetailedDestination, province: dest_data.province });
		console.log(oFinalDetailed);
		localStorage.setItem('detailed_routes', JSON.stringify(oFinalDetailed));

		if (sameProvince) {
			$('<p class="mbr-fonts-style mbr-text display-7">* Routes may not be accurate when the origin and destination are close to each other.<br>Please ensure that the desired routes are sufficiently distant from each other for accurate results.</p>').insertBefore($('#detailed-routes'));
		}

		$('.tc1-loader-overlay').removeClass('is-open');
	}, 1000);
}

function runNCRData(origin_data, originRoutes, dest_data, destinationRoutes) {
	// if ($.inArray('ncr', origin_data.tollways) >= 0 || $.inArray('ncr', dest_data.tollways) >= 0) {
		/* var bBetweenMain = (originRoutes.slex != undefined && destinationRoutes.nlex != undefined)
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
		} */

		var bothExpress = (originRoutes.nlex != undefined && destinationRoutes.slex != undefined)
			|| (originRoutes.slex != undefined && destinationRoutes.nlex != undefined)
			;

		if (bothExpress) {
			if (originRoutes.ncr == undefined && origin_data.region != 'NCR') {
				var direction = dest_data.start;
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
			} else if (destinationRoutes.ncr == undefined && dest_data.region != 'NCR') {
				var direction = origin_data.start;
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
	// }
}

function runDetailedRoutes() {
	var detailed_routes = localStorage.getItem('detailed_routes');
	if (detailed_routes != null) {
		var routes = JSON.parse(detailed_routes);

		if (routes.length) {
			console.log(routes);
			runSearchResults();
			setTimeout(() => {
				var uiRoute = $('.routes-results');
				var oOrigin = routes[0];
				var oDestination = routes[1];

				var uiFromContent = uiRoute.find('.page-content:first').clone(true).removeClass('hide');
				uiFromContent.find('.page-header .timeline-intro-head').html('From ' + oOrigin.from + '<sup class="text-danger"><big>*</big></sup>');
				var uiFromTimeline = uiFromContent.find('.page-body .timeline').clone(true).removeClass('hide');

				for (var x in oOrigin.routes) {
					var oFromGate = oOrigin.routes[x];
					var sWay = oFromGate.way;
					var isOR = false;
					if (x == 0) {
						var uiTimeline = uiFromTimeline;
					} else {
						var uiOther = uiFromTimeline.clone(true);
						var uiTimeline = uiOther;
						if (oOrigin.province == 'NCR') {
							uiTimeline.find('.timeline-badge').append('OR');
							isOR = true;
						}
					}

					uiTimeline.find('.timeline-title').html(oFromGate.expressway);
					
					var sPrefix = 'Enter ';
					var sSuffix = 'exit to ';
					if (sWay == 'ncr') {
						sPrefix = 'Travel from ';
						sSuffix = 'enter ';
						var uiRoutes = '<ul><li>' + sPrefix + '<b>' + oFromGate.enter + '</b> and ' + sSuffix + '<b>' + oFromGate.exit + '</b></li><li class="toll" style="margin-left: 15px;"><a href="https://www.google.com/maps/dir/' + oFromGate.enter + ',' + oFromGate.enter_province + '/' + oFromGate.exit + ',' + oFromGate.exit_province + '" target="_blank"><b>Show Direction Map</b></a></li></ul>';
						uiTimeline.find('.timeline-body').html(uiRoutes);
					} else {
						var wayCount = oFromGate.details.class_1.length;
						var sText = isOR ? '<small class="text-info">Click below to expand</small>' : '';
						var uiRoutes = sText + '<ul style="cursor: pointer;" onclick="runCollapseEvent(this);"><li>There ' + (wayCount > 1 ? 'are ' : 'is ') + '<b>' + (wayCount > 1 ? wayCount + ' ways' : 'way') + '</b> to enter <b>' + oFromGate.exit + '</b></li></ul><ul class="expandable"' + (isOR ? ' style="display: none;"' : '') + '>';
						for (var classname in oFromGate.details) {
							var oToll = oFromGate.details[classname];
							var uiTolls = '';
							for (var i in oToll) {
								var oItem = oToll[i];
								if (i == 0) {
									uiTolls += '<li class="toll" style="margin-left: 15px; margin-top: 10px;"><b>' + classname.ucWords().replace('_', ' ') + ' - Vehicles:</b></li>';
								}
								var iFee = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(oItem.fee);
								uiTolls += '<li class="toll route" style="margin-left: 30px;">' + (wayCount > 1 ? (parseInt(i) + 1) + '. ' : '') + 'Enter ' + oItem.entry + ' and exit ' + oItem.exit + '</li><li class="toll fee" style="margin-left: 45px;"><b>Fee: ' + iFee + '</b></li><li class="toll fee" style="margin-left: 45px;"><a href="https://www.google.com/maps/dir/' + oItem.entry + ',' + oItem.entry_province + '/' + oItem.exit + ',' + oItem.exit_province + '" target="_blank"><b>Show Direction Map</b></a></li>';
							}
							uiRoutes += uiTolls;
						}
						uiTimeline.find('.timeline-body').html('</ul>' + uiRoutes + '</ul>');
					}

					uiFromContent.find('.page-body').append(uiTimeline);
					
				}
				uiFromContent.find('.page-body .timeline.hide').remove();
				uiRoute.append(uiFromContent);

				var uiToContent = uiRoute.find('.page-content:first').clone(true).removeClass('hide');
				uiToContent.find('.page-header .timeline-intro-head').addClass('mt-3').html('To ' + oDestination.to + '<sup class="text-danger"><big>*</big></sup>');
				var uiToTimeline = uiToContent.find('.page-body .timeline').clone(true).removeClass('hide');

				for (var x in oDestination.routes) {
					var oToGate = oDestination.routes[x];
					var sWay = oToGate.way;
					var isOR = false;
					if (x == 0) {
						var uiTimeline = uiToTimeline;
					} else {
						var uiOther = uiToTimeline.clone(true);
						var uiTimeline = uiOther;
						if (oDestination.province == 'NCR') {
							uiTimeline.find('.timeline-badge').append('OR');
							isOR = true;
						}
					}

					uiTimeline.find('.timeline-title').html(oToGate.expressway);

					var sPrefix = 'Enter ';
					var sSuffix = 'exit to ';
					if (sWay == 'ncr') {
						sPrefix = 'Travel from ';
						sSuffix = 'enter ';
						var uiRoutes = '<ul><li>' + sPrefix + '<b>' + oToGate.enter + '</b> and ' + sSuffix + '<b>' + oToGate.exit + '</b></li><li class="toll" style="margin-left: 15px;"><a href="https://www.google.com/maps/dir/' + oToGate.enter + ',' + oToGate.enter_province + '/' + oToGate.exit + ',' + oToGate.exit_province + '" target="_blank"><b>Show Direction Map</b></a></li></ul>';
						uiTimeline.find('.timeline-body').html(uiRoutes);
					} else {
						var wayCount = oToGate.details.class_1.length;
						var sText = isOR ? '<small class="text-info">Click below to expand</small>' : '';
						var uiRoutes = sText + '<ul style="cursor: pointer;" onclick="runCollapseEvent(this);"><li>There ' + (wayCount > 1 ? 'are ' : 'is ') + '<b>' + (wayCount > 1 ? wayCount + ' ways' : 'way') + '</b> to enter <b>' + oToGate.exit + '</b></li></ul><ul class="expandable"' + (isOR ? ' style="display: none;"' : '') + '>';
						for (var classname in oToGate.details) {
							var oToll = oToGate.details[classname];
							var uiTolls = '';
							for (var i in oToll) {
								var oItem = oToll[i];
								if (i == 0) {
									uiTolls += '<li class="toll" style="margin-left: 15px; margin-top: 10px;"><b>' + classname.ucWords().replace('_', ' ') + ' - Vehicles:</b></li>';
								}
								var iFee = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(oItem.fee);
								uiTolls += '<li class="toll route" style="margin-left: 30px;">' + (wayCount > 1 ? (parseInt(i) + 1) + '. ' : '') + 'Enter ' + oItem.entry + ' and exit ' + oItem.exit + '</li><li class="toll fee" style="margin-left: 45px;"><b>Fee: ' + iFee + '</b></li><li class="toll fee" style="margin-left: 45px;"><a href="https://www.google.com/maps/dir/' + oItem.entry + ',' + oItem.entry_province + '/' + oItem.exit + ',' + oItem.exit_province + '" target="_blank"><b>Show Direction Map</b></a></li>';
							}
							uiRoutes += uiTolls;
						}
						uiTimeline.find('.timeline-body').html('</ul>' + uiRoutes + '</ul>');
					}

					uiToContent.find('.page-body').append(uiTimeline);
				}
				uiToContent.find('.page-body .timeline.hide').remove();
				uiRoute.append(uiToContent);

				$('.timeline-body').disableSelection();
				$('.tc1-loader-overlay').removeClass('is-open');
			}, 777);
		}
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

function runCollapseEvent(target) {
	var oThis = $(target);
	// console.log(oThis.next('.expandable').is(':visible'));
	if (oThis.next('.expandable').is(':visible') == false) {
		oThis.next('.expandable').slideDown();
		oThis.prev('small').html('Click below to collapse');
	} else {
		oThis.next('.expandable').slideUp();
		oThis.prev('small').html('Click below to expand');
	}
}
