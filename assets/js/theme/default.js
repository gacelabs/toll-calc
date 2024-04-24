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
	
	$('strong[data-for="bound"]').disableSelection();
	$('#bound').on('change', function (e) {
		var im_from = $('#im_from').clone(true);
		var going_to = $('#going_to').clone(true);
		if ($(e.target).is(':checked')) {
			$('strong[data-for="bound"]').text('North Bound');
			$(e.target).val('north');
		} else {
			$('strong[data-for="bound"]').text('South Bound');
			$(e.target).val('south');
		}
		if (im_from.val() != '' && going_to.val() == '') {
			$('#search_form').find('input#going_to').val(im_from.val()).attr('data-set', im_from.attr('data-set'));
			setTimeout(() => {
				$('#search_form').find('input#im_from').val('').removeAttr('data-set');
			}, 3);
		}
		if (im_from.val() == '' && going_to.val() != '') {
			$('#search_form').find('input#im_from').val(going_to.val()).attr('data-set', going_to.attr('data-set'));
			setTimeout(() => {
				$('#search_form').find('input#going_to').val('').removeAttr('data-set');
			}, 3);
		}
		if (im_from.val() != '' && going_to.val() != '') {
			$('#search_form').find('input#im_from').val(going_to.val()).attr('data-set', going_to.attr('data-set'));
			setTimeout(() => {
				$('#search_form').find('input#going_to').val(im_from.val()).attr('data-set', im_from.attr('data-set'));
			}, 3);
		}
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
		// e.stopPropagation();
		
		var archipelago = new JSONQuery(dataObject['archipelago']);

		// ORIGIN
		var origin = $('#im_from');
		// DESTINATION
		var dest = $('#going_to');

		if (origin.attr('data-set') != undefined && dest.attr('data-set') != undefined) {
			var origin_data = JSON.parse(origin.attr('data-set'));
			var dest_data = JSON.parse(dest.attr('data-set'));

			if (origin_data.name !== dest_data.name || origin_data.province !== dest_data.province) {
				var origin_result = archipelago.execute({
					select: { fields: '*' },
					where: {
						condition: [
							{ field: 'province', operator: '=', value: origin_data.province },
						]
					}
				});
				console.log(origin_result);
				if (origin_result.length) {
					var first = origin_result[0];
				}
				var dest_result = archipelago.execute({
					select: { fields: '*' },
					where: {
						condition: [
							{ field: 'province', operator: '=', value: dest_data.province },
						]
					}
				});
				console.log(dest_result);
				if (dest_result.length) {
					var second = dest_result[0];
				}
		
				if (first != undefined && second != undefined) {
					// get the tollways available
					var originRoutes = {}, destinationRoutes = {};
					var boundFrom = first.bound;
					var boundTo = second.bound;
					var search_string = origin_data.old_name;
					var search_string_2 = dest_data.old_name;
					var provinceFrom = first.province;
					var provinceTo = second.province;
					
					
					// first.tollways.forEach((toll, c) => {
					for (var c in first.tollways) {
						var toll = first.tollways[c];
						var allow = true;
						if (first.toll_subjects != undefined) {
							allow = (first.toll_subjects[c].cities.includes('All') || first.toll_subjects[c].cities.includes(origin_data.old_name));
						}
						// check if there are toll_subjects
						// console.log(allow, toll, origin_data.old_name);
						
						if (allow) {
							// console.log(toll);
							var tollway = new JSONQuery(dataObject[toll]);
							originRoutes[toll] = {};
							// traverse to per class
							for (var way in tollway) {
								// console.log(class_name);
								if (tollway[way] != undefined) {
									var oClasses = tollway[way];
									// console.log(oClasses);
									for (var class_name in oClasses) {
										if (Object.hasOwnProperty.call(oClasses, class_name)) {
											var oClass = oClasses[class_name];
											// console.log(class_name, oClass);
											originRoutes[toll][class_name] = [];
											// check the destination bound
											if (first.endline) {
												if (boundFrom == 'south') {
													var key = oClass.length - 1;
													var oTolls = oClass[key].tolls.reverse();
												} else {
													var key = 0;
													var oTolls = oClass[key].tolls;
												}
												originRoutes[toll][class_name].push({
													'entry': oClass[key].entry,
													'tolls': oTolls,
													'exit': oTolls.slice(-1)[0].exit,
													// 'province': oClass[key].province,
													// 'nearest': oClass[key].nearest
												});
												// console.log(originRoutes, oClass[key]);
											} else if (boundFrom == 'south') {
												// south
												if (first.island == second.island) {
													for (var key = (oClass.length - 1); key >= 0; key--) {
														if (oClass[key].nearest.includes(search_string)) {
															// console.log(oClass[key]);
															originRoutes[toll][class_name].push({
																'entry': oClass[key].entry,
																'tolls': oClass[key].tolls,
															});
														}
													}
													originRoutes[toll][class_name].forEach(function (avail, x) {
														for (var key = (oClass.length - 1); key >= 0; key--) {
															var sExit = oClass[key].entry;
															if (oClass[key].nearest.includes(search_string_2)) {
																originRoutes[toll][class_name][x]['exit'] = sExit;
																let oTolls = [];
																for (var jey in originRoutes[toll][class_name][x].tolls) {
																	var oExit = originRoutes[toll][class_name][x].tolls[jey];
																	oTolls.push(oExit);
																	if (oExit.exit == sExit) {
																		break;
																	}
																}
																originRoutes[toll][class_name][x].tolls = oTolls;
															} 
														}
													});
												} else {
													for (var key = (oClass.length - 1); key >= 0; key--) {
														var oNearest = oClass[key].nearest;
														// check nearest city
														for (var x in oNearest) {
															var ct = oNearest[x];
															if (search_string.indexOf(ct) >= 0 || ct === 'All') {
																// console.log(key, oClass[key]);
																var index = oClass.length - 1;
																var oTolls = [];
																for (var i = 0; i <= key; i++) {
																	// get entry tolls & fees
																	var arTolls = oClass[index].tolls[i];
																	if (arTolls != undefined) {
																		oTolls.push(arTolls);
																	}
																}
																if (oTolls.length) {
																	originRoutes[toll][class_name].push({
																		'entry': oClass[key].entry,
																		// 'tolls': oTolls.reverse(),
																		'exit': oClass[index].tolls[0].exit
																	});
																}
															}
														}
													}
												}
											} else if (boundFrom == 'north') {
												// north
												/* form same island */
												if (first.island == second.island) { 
													for (var key = 0; key < oClass.length; key++) {
														if (oClass[key].nearest.includes(search_string)) {
															originRoutes[toll][class_name].push({
																'entry': oClass[key].entry,
																'tolls': oClass[key].tolls,
															});
														}
													}
													originRoutes[toll][class_name].forEach(function (avail, x) {
														for (var key = 0; key < oClass.length; key++) {
															var sExit = oClass[key].entry;
															if (oClass[key].nearest.includes(search_string_2)) {
																originRoutes[toll][class_name][x]['exit'] = sExit;
																let oTolls = [];
																for (var jey in originRoutes[toll][class_name][x].tolls) {
																	var oExit = originRoutes[toll][class_name][x].tolls[jey];
																	oTolls.push(oExit);
																	if (oExit.exit == sExit) {
																		break;
																	}
																}
																originRoutes[toll][class_name][x].tolls = oTolls;
															}
														}
													});
												} else {
													for (var key = 0; key < oClass.length; key++) {
														var oNearest = oClass[key].nearest;
														// check nearest city
														for (var x in oNearest) {
															var ct = oNearest[x];
															if (search_string.indexOf(ct) >= 0 || ct === 'All') {
																// console.log(ct, search_string, origin_data.province, oClass[key].province);
																// console.log(key, oClass[key]);
																var oTolls = oClass[key].tolls;
																if (oTolls.length) {
																	originRoutes[toll][class_name].push({
																		'entry': oClass[key].entry,
																		// 'tolls': oTolls,
																		'exit': oClass[key].tolls[oTolls.length - 1].exit
																	});
																}
															}
														}
													}
												}
											}
											if (originRoutes[toll][class_name].length == 0) {
												delete originRoutes[toll][class_name];
											}
										}
									}
								}
							}
							if (Object.keys(originRoutes[toll]).length == 0) {
								delete originRoutes[toll];
							}
						}
					}
					// });
	
					console.log('origin', originRoutes);
	
					// second.tollways.forEach((toll, c) => {
					// for (var c in second.tollways) {
					// 	var toll = second.tollways[c];
					// 	// console.log(toll);
					// 	var allow = true;
					// 	if (second.toll_subjects != undefined) {
					// 		allow = (second.toll_subjects[c].cities.includes('All') || second.toll_subjects[c].cities.includes(dest_data.old_name));

					// 	}

					// 	if (allow) {
					// 		var tollway = new JSONQuery(dataObject[toll]);
					// 		destinationRoutes[toll] = {};
					// 		if (originRoutes[toll] == undefined) {
					// 			// traverse to per class
					// 			for (var way in tollway) {
					// 				// console.log(class_name);
					// 				if (tollway[way] != undefined) {
					// 					var oClasses = tollway[way];
					// 					// console.log(oClasses);
					// 					for (var class_name in oClasses) {
					// 						if (Object.hasOwnProperty.call(oClasses, class_name)) {
					// 							var oClass = oClasses[class_name];
					// 							// console.log(class_name, oClass);
					// 							destinationRoutes[toll][class_name] = [];
					// 							if (second.endline) {
					// 								if (boundFrom == 'south') {
					// 									var key = oClass.length - 1;
					// 									var oTolls = oClass[key].tolls.reverse();
					// 								} else {
					// 									var key = 0;
					// 									var oTolls = oClass[key].tolls;
					// 								}
					// 								destinationRoutes[toll][class_name].push({
					// 									'entry': oClass[key].entry,
					// 									'tolls': oTolls,
					// 									'exit': oTolls.slice(-1)[0].exit
					// 								});
					// 							} else if (boundFrom == 'south') {
					// 								for (var key = (oClass.length - 1); key >= 0; key--) {
					// 									var oNearest = oClass[key].nearest;
					// 									// check nearest city
					// 									for (var x in oNearest) {
					// 										var ct = oNearest[x];
					// 										// console.log(ct, search_string_2, oClass[key]);
					// 										if (search_string_2.indexOf(ct) >= 0 || ct === 'All') {
					// 											// console.log(key, oClass[key]);
					// 											var index = oClass.length - 1;
					// 											var oTolls = [];
					// 											for (var i = 0; i <= key; i++) {
					// 												// get entry tolls & fees
					// 												var arTolls = oClass[index].tolls[i];
					// 												if (arTolls != undefined) {
					// 													oTolls.push(arTolls);
					// 												}
					// 											}
					// 											if (oTolls.length) {
					// 												destinationRoutes[toll][class_name].push({
					// 													'entry': oClass[index].tolls[0].exit,
					// 													'tolls': oTolls,
					// 													'exit': oClass[key].entry
					// 												});
					// 											}
					// 										}
					// 									}
					// 								}
					// 							} else if (boundFrom == 'north') {
					// 								// north
					// 								for (var key = 0; key < oClass.length; key++) {
					// 									var oNearest = oClass[key].nearest;
					// 									// check nearest city
					// 									for (var x in oNearest) {
					// 										var ct = oNearest[x];
					// 										if (search_string_2.indexOf(ct) >= 0 || ct === 'All') {
					// 											// console.log(ct, search_string, origin_data.province, oClass[key].province);
					// 											// console.log(key, oClass[key]);
					// 											var oTolls = oClass[key].tolls;
					// 											if (oTolls.length) {
					// 												destinationRoutes[toll][class_name].push({
					// 													'entry': oClass[key].entry,
					// 													'tolls': oTolls,
					// 													'exit': oClass[key].tolls[oTolls.length - 1].exit
					// 												});
					// 											}
					// 										}
					// 									}
					// 								}
					// 							}
					// 							if (destinationRoutes[toll][class_name].length == 0) {
					// 								delete destinationRoutes[toll][class_name];
					// 							}
					// 						}
					// 					}
					// 				}
					// 			}
					// 			if (Object.keys(destinationRoutes[toll]).length == 0) {
					// 				delete destinationRoutes[toll];
					// 			}
					// 		} else {
					// 			for (var class_name in dataObject[toll]) {
					// 				if (Object.hasOwnProperty.call(dataObject[toll], class_name)) {
					// 					var oClass = dataObject[toll][class_name];
					// 					destinationRoutes[toll][class_name] = [];
					// 					// console.log(originRoutes[toll][class_name].tolls);
					// 					if (boundFrom == 'south') {
					// 						for (var key = (oClass.length - 1); key >= 0; key--) {
					// 							var oNearest = oClass[key].nearest;
					// 							// check nearest city
					// 							for (var x in oNearest) {
					// 								var ct = oNearest[x];
					// 								// console.log(ct, search_string_2, oClass[key]);
					// 								if (search_string_2.indexOf(ct) >= 0 || ct === 'All') {
					// 									// console.log(key, oClass[key]);
					// 									var index = oClass.length - 1;
					// 									var oTolls = [];
					// 									for (var i = 0; i <= key; i++) {
					// 										// get entry tolls & fees
					// 										var arTolls = oClass[index].tolls[i];
					// 										if (arTolls != undefined) {
					// 											oTolls.push(arTolls);
					// 										}
					// 									}
					// 									if (oTolls.length) {
					// 										destinationRoutes[toll][class_name].push({
					// 											'entry': oClass[index].tolls[0].exit,
					// 											'tolls': oTolls,
					// 											'exit': oClass[key].entry
					// 										});
					// 									}
					// 								}
					// 							}
					// 						}
					// 					} else if (boundFrom == 'north') {
					// 						// north
					// 						for (var key = 0; key < oClass.length; key++) {
					// 							var oNearest = oClass[key].nearest;
					// 							// check nearest city
					// 							for (var x in oNearest) {
					// 								var ct = oNearest[x];
					// 								if (search_string_2.indexOf(ct) >= 0 || ct === 'All') {
					// 									// console.log(ct, search_string, origin_data.province, oClass[key].province);
					// 									// console.log(key, oClass[key]);
					// 									var oTolls = oClass[key].tolls;
					// 									if (oTolls.length) {
					// 										destinationRoutes[toll][class_name].push({
					// 											'entry': oClass[key].entry,
					// 											'tolls': oTolls,
					// 											'exit': oClass[key].tolls[oTolls.length - 1].exit
					// 										});
					// 									}
					// 								}
					// 							}
					// 						}
					// 					}
					// 				}
					// 			}
					// 		}
					// 	}
					// }
					// });
	
					console.log('destination', destinationRoutes);
					/* var firstRoutes = routeGenerator(origin_data, first, origin_data.name);
					console.log(firstRoutes);
					var secondRoutes = routeGenerator(dest_data, second, dest_data.name);
					console.log(secondRoutes); */
				}
			} else {
				console.log("No results found!");
			}

		}

		/* dataObject.nlex.class_1.forEach(function (data) {
			var nlexSubjects = new JSONQuery(data.subjects);
			var query = {
				select: { fields: '*' },
				where: {
					condition: [
						{ field: 'name', operator: 'LIKE', value: '%Caloocan City, NCR%' },
					]
				}
			};
			var result = nlexSubjects.execute(query);

			if (result.length) {
				console.log(result, data);
			}
		}); */
	});
	
});

var routeGenerator = function (search_data, this_data, search_name) {
	var routes = {};
	var bound = this_data.bound;
	this_data.tollways.forEach(toll => {
		var tollway = new JSONQuery(dataObject[toll]);
		routes[toll] = {};
		// traverse to per class
		for (var way in tollway) {
			// console.log(class_name);
			if (tollway[way] != undefined) {
				var oClasses = tollway[way];
				// console.log(oClasses);
				for (var class_name in oClasses) {
					if (Object.hasOwnProperty.call(oClasses, class_name)) {
						var oClass = oClasses[class_name];
						// check the destination bound
						routes[toll][class_name] = [];
						if (this_data.endline == true) {
							if (bound == 'south') {
								var oClass = oClass.reverse();
							}
							// console.log(oClass, this_data, search_name);
							var bContinue = false;
							for (var key in oClass) {
								if (Object.hasOwnProperty.call(oClass, key)) {
									var oSubjects = new JSONQuery(oClass[key].subjects);
									var oRoute = oSubjects.execute({
										select: { fields: '*' },
										where: {
											condition: [
												{ field: 'name', operator: '=', value: search_name },
											]
										}
									});
									if (oRoute.length == 0 && bContinue == false) {
										delete oClass[key];
										bContinue = true;
									}
									
									if (oClass[key] != undefined) {
										oClass[key].tolls.forEach(function (oExit, d) {
											var oExSubjects = new JSONQuery(oExit.subjects);
											var oExRoute = oExSubjects.execute({
												select: { fields: '*' },
												where: {
													condition: [
														{ field: 'name', operator: 'like', value: '%' + this_data.entry_points.north + '%' },
														{ field: 'name', operator: 'like', value: '%' + this_data.entry_points.south + '%' },
													]
												}
											});
											if (oExRoute.length == 0) {
												delete oClass[key].tolls[d];
											}
										});
										if (oClass[key].tolls.length) {
											oClass[key].tolls = oClass[key].tolls.filter((_, index) => oClass[key].tolls.hasOwnProperty(index));
										} else {
											// delete oClass[key];
										}
									}
								}
							}
							routes[toll][class_name] = oClass;
						} else {
							for (var key in oClass) {
								if (Object.hasOwnProperty.call(oClass, key)) {
									var oData = oClass[key];
									if (oData.subjects != undefined) {
										var oSubjects = new JSONQuery(oData.subjects);
										// console.log(oSubjects);
										var route = oSubjects.execute({
											select: { fields: '*' },
											where: {
												condition: [
													{ field: 'name', operator: '=', value: search_name },
												]
											}
										});
										// console.log(dest_result, route, oData);
										if (route.length == 1) {
											oData.tolls.forEach(function (oExit, d) {
												var oExSubjects = new JSONQuery(oExit.subjects);
												var oExRoute = oExSubjects.execute({
													select: { fields: '*' },
													where: {
														condition: [
															{ field: 'name', operator: 'like', value: '%' + this_data.entry_points[bound] + '%' },
														]
													}
												});
												// console.log(this_data, oExSubjects.getQuery());
												if (oExRoute.length == 0) {
													delete oData.tolls[d];
												} else {
													if (parseInt(key) < parseInt(d)) {
														delete oData.tolls[d];
													}
												}
											});
											if (oData.tolls.length) {
												oData.tolls = oData.tolls.filter((_, index) => oData.tolls.hasOwnProperty(index));
												routes[toll][class_name].push(oData);
												var arClass = oClasses[class_name];
												routes = lookForTolls(bound, key, toll, arClass, routes, class_name, this_data, oClass);
											}
											break;
										}
									}
								}
							}
						}
					}
				}
			}
		}
	});

	return routes;
}

var lookForTolls = function (bound, key, toll, arClass, routes, class_name, this_data, oClass) {
	if (bound == 'south') {
		// route is north
		for (var x = (key - 1); x >= 0; x--) {
			if (arClass[x] != undefined) {
				var arData = arClass[x];
				if (arData.subjects != undefined) {
					var arSubjects = new JSONQuery(arData.subjects);
					var arRoute = arSubjects.execute({
						select: { fields: '*' },
						where: {
							condition: [
								{ field: 'name', operator: 'like', value: '%' + this_data.entry_points[bound] + '%' },
							]
						}
					});
					// console.log(search_name, arRoute, arData);
					if (arRoute.length) {
						arData.tolls.forEach(function (exit, i) {
							var exSubjects = new JSONQuery(exit.subjects);
							var exRoute = exSubjects.execute({
								select: { fields: '*' },
								where: {
									condition: [
										{ field: 'name', operator: 'like', value: '%' + this_data.entry_points[bound] + '%' },
									]
								}
							});
							if (exRoute.length == 0) {
								delete arData.tolls[i];
							} else {
								if (parseInt(key) < parseInt(i)) {
									delete arData.tolls[i];
								}
							}
						});
						if (arData.tolls.length) {
							arData.tolls = arData.tolls.filter((_, index) => arData.tolls.hasOwnProperty(index));
							routes[toll][class_name].push(arData);
						}
					}
				}
			}
		}
	} else {
		// route is south
		for (var x = (parseInt(key) + 1); x < arClass.length; x++) {
			if (arClass[x] != undefined) {
				var arData = arClass[x];
				if (arData.subjects != undefined) {
					var arSubjects = new JSONQuery(arData.subjects);
					var arRoute = arSubjects.execute({
						select: { fields: '*' },
						where: {
							condition: [
								{ field: 'name', operator: 'like', value: '%' + this_data.entry_points[bound] + '%' },
							]
						}
					});
					// console.log(search_name, arRoute, arData);
					if (arRoute.length) {
						arData.tolls.forEach(function (exit, i) {
							var exSubjects = new JSONQuery(exit.subjects);
							var exRoute = exSubjects.execute({
								select: { fields: '*' },
								where: {
									condition: [
										{ field: 'name', operator: 'like', value: '%' + this_data.entry_points[bound] + '%' },
									]
								}
							});
							if (exRoute.length == 0) {
								delete arData.tolls[i];
							} else {
								// console.log(x, arData.entry, i, arData.tolls[i].exit, oClass[0].tolls);
								if (parseInt(key) < parseInt(i)) {
									delete arData.tolls[i];
								}
							}
						});
						if (arData.tolls.length) {
							arData.tolls = arData.tolls.filter((_, index) => arData.tolls.hasOwnProperty(index));
							routes[toll][class_name].push(arData);
						}
					}
				}
			}
		}
	}
	return routes;
}

var runCitySearchData = function () {
	$('.cities-input').each(function (i, elem) {
		// console.log(i, elem);
		$(elem).on('input', function (e) {
			// console.log(e.target.value);
			var jsonCities = new JSONQuery(dataObject.cities);
			const joinedData = jsonCities.join(dataObject.archipelago, "province");
			// var sBound = e.target.id == 'going_to' ? ($('#bound').val() == 'north' ? 'south' : 'north') : $('#bound').val();
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
			autocomplete(e.target, result, 'name');
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

