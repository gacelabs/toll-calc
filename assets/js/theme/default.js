if (window.location.pathname == '/') {
	// localStorage.removeItem('search_results');
	// localStorage.removeItem('origin_all_routes');
	// localStorage.removeItem('destination_all_routes');
}

$(document).ready(function () {
	/* setInterval(() => {
		if ($('.tc1-loader-overlay.is-open').length) {
			$('.tc1-loader-overlay').removeClass('is-open');
			clearInterval();
		}
	}, 3000); */

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
		}, 333);
	} else {
		runCitySearchData();
	}

	$('#search_form').on('submit', function (e) {
		e.preventDefault();

		// ORIGIN
		var origin = $('#origin');
		// DESTINATION
		var dest = $('#destination');
		if (($.trim(origin.val()) != '' && $.trim(dest.val()) != '') && $.trim(origin.val()) === $.trim(dest.val())) {
			var placeHolder = dest.attr('placeholder');
			dest.val('');
			dest.removeAttr('data-set');
			dest.attr('placeholder', 'Same origin value failed!');
			showToast({content: '<b>The same inputed values are not allowed!</b>', type: 'bad'});
			setTimeout(() => {
				dest.attr('placeholder', placeHolder);
			}, 2000);
		} else {
			if (origin.attr('data-set') != undefined && dest.attr('data-set') != undefined) {
				var origin_data = JSON.parse(origin.attr('data-set'));
				var dest_data = JSON.parse(dest.attr('data-set'));
				// console.log(origin_data, dest_data);

				var originRoutes = generateRoutes(origin_data, dest_data.start);
				var destinationRoutes = generateRoutes(dest_data, origin_data.start);
				// console.log(originRoutes, destinationRoutes);

				/* if ($.inArray('ncr', origin_data.tollways) >= 0 || $.inArray('ncr', dest_data.tollways) >= 0) {
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
				} */

				if (Object.keys(originRoutes).length && Object.keys(destinationRoutes).length) {
					localStorage.setItem('search_results', JSON.stringify({ 'origin': originRoutes, 'destination': destinationRoutes }));
					$('.tc1-loader-overlay').addClass('is-open');
					setTimeout(() => {
						// console.log(localStorage.getItem('search_results'));
						window.location = '/results?origin=' + encodeURI($.trim(origin.val())) + '&destination=' + encodeURI($.trim(dest.val()));
					}, 3000);
				}
			}
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

var generateRoutes = function (oData, gointTo, urBoundTo, oOrig) {
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
				$('#search_form').trigger('submit');
			}
		});

		if (i === ($('.cities-input').length - 1)) {
			runSearchResults();
		}
	});
}

var runSearchResults = function () {
	if (localStorage.getItem('search_results') != null) {
		var urlParam = urlParams();

		if (urlParam.size) {
			var originValue = urlParam.get('origin').toString();
			var destValue = urlParam.get('destination').toString();
			var modObject = { 'modify': ['name'], 'expressions': [{ 'concat': ['city', ', ', 'province'] }] };

			setTimeout(() => {
				var originJsonCities = new JSONQuery(dataObject.cities);
				var originJoinedData = originJsonCities.join(dataObject.archipelago, "province");
				var destJsonCities = new JSONQuery(dataObject.cities);
				var destJoinedData = destJsonCities.join(dataObject.archipelago, "province");
	
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
		
				// ORIGIN
				var origin = $('#origin');
				origin.val(originValue).attr('data-set', JSON.stringify(originResult.data[0]));
				// DESTINATION
				var dest = $('#destination');
				dest.val(destValue).attr('data-set', JSON.stringify(destResult.data[0]));
				
				renderSearchResults();
			}, 333);
		}
	}
}

var renderSearchResults = function () {
	var oResults = JSON.parse(localStorage.getItem('search_results'));
	// console.log(oResults);
	var expresswayData = dataObject.expressways;
	// ORIGIN
	var origin = $('#origin');
	// DESTINATION
	var dest = $('#destination');
	// console.log(origin.val(), dest.val());
	var origin_data = JSON.parse(origin.attr('data-set'));
	var dest_data = JSON.parse(dest.attr('data-set'));

	var sameProvince = origin_data.province == dest_data.province;
	
	/* render origin */
	var oOrigin = oResults.origin;
	var uiOrigin = $('.origin-results');
	uiOrigin.find('.timeline-intro-head').html(origin.val());
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
			oCloneTimeline.find('.timeline-inverted .timeline-title').html(timelineTitle);
			
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
	uiDestination.find('.timeline-intro-head').html(dest.val());
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
			oCloneTimeline.find('.timeline-inverted .timeline-title').html(timelineTitle);

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

function urlParams() {
	var url = new URL(window.location.href);
	return url.searchParams;
}

function showToast(params) {
	$('#tc-toast').find('.toast-body').html(params.content);
	$('#tc-toast').removeClass('bg-success bg-danger bg-warning bg-info');
	switch (params.type) {
		case 'good':
			$('#tc-toast').addClass('bg-success');
		break;
		case 'bad':
			$('#tc-toast').addClass('bg-danger');
		break;
		case 'alert':
			$('#tc-toast').addClass('bg-warning');
		break;
		case 'info':
			$('#tc-toast').addClass('bg-info');
		break;
	}
	$('#tc-toast').toast('show');
}