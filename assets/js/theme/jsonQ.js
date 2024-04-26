class JSONQuery {
	constructor(data) {
		this.data = data;
		this.view = data;
		this.query = null;
	}

	select(fields) {
		if (!fields || fields === "*") {
			return this.data;
		} else {
			const selectedData = [];
			this.data.forEach((item) => {
				const selectedItem = {};
				fields.forEach(field => {
					if (item.hasOwnProperty(field)) {
						selectedItem[field] = item[field];
					}
				});
				selectedData.push(selectedItem);
			});
			return selectedData;
		}
	}

	where(conditions) {
		if (!conditions) {
			return this.data;
		} else {
			const filteredData = [];
			this.data.forEach((item, i) => {
				conditions.forEach(condition => {
					// console.log(condition);
					if (this.evaluateCondition(item, condition)) {
						if (filteredData.includes(item) == false) {
							item['index'] = i;
							filteredData.push(item);
						}
					}
				});
			});
			return filteredData;
		}
	}

	evaluateCondition(item, condition) {
		let operator = condition.operator.toLowerCase();
		let field = condition.field;
		let value = condition.value;
		let needed = item[field];

		if (typeof value == 'string' && typeof needed == 'string') {
			value = value.toLowerCase();
			// console.log(needed, field);
			needed = needed.toLowerCase();
		}

		switch (operator) {
			case "=":
				return needed === value;
			case ">":
				return needed > value;
			case "<":
				return needed < value;
			case ">=":
				return needed >= value;
			case "<=":
				return needed <= value;
			case "!=": case "<>":
				return needed !== value;
			case "like":
				if (typeof needed === 'string') {
					const pattern = new RegExp('^' + value.replace(/%/g, '.*') + '$');
					// console.log(pattern, needed);
					return pattern.test(needed);
				} else {
					return false;
				}
			case "not like":
				if (typeof needed === 'string') {
					const pattern = new RegExp('^' + value.replace(/%/g, '.*') + '$');
					// console.log(pattern, needed);
					return pattern.test(needed) == false;
				} else {
					return false;
				}
			case "in":
				// console.log(operator, value, needed);
				return needed.includes(value);
			case "in like":
				if (typeof value === 'string') {
					var results = [];
					for (const key in needed) {
						var val = needed[key];
						const pattern = new RegExp('^' + value.replace(/%/g, '.*') + '$');
						// console.log(value, pattern, needed[key], val);
						results.push(pattern.test(val));
					}
					return results.includes(true);
				} else {
					return needed === value;
				}
			case "not in":
				return needed.includes(value) == false;
			case "not in like":
				if (typeof value === 'string') {
					var results = [];
					for (const key in needed) {
						var val = needed[key];
						const pattern = new RegExp('^' + value.replace(/%/g, '.*') + '$');
						// console.log(value, pattern, needed[key], val);
						results.push(pattern.test(val));
					}
					return results.includes(false);
				} else {
					return needed !== value;
				}
			case "is null":
				return needed === null || needed === undefined;
			case "is not null": case "not null":
				return needed !== null && needed !== undefined;
			default:
				return false;
		}
	}

	join(otherData, joinField) {
		const joinedData = [];

		this.data.forEach(item1 => {
			otherData.forEach(item2 => {
				if (item1[joinField] === item2[joinField]) {
					const joinedItem = { ...item1, ...item2 };
					joinedData.push(joinedItem);
				}
			});
		});

		if (joinedData.length) {
			this.data = joinedData;
		}
		return this;
	}

	execute(query, format) {
		var _this = this;
		var { select, where } = query;
		this.query = query;
		var result = this.data.length ? this.data : this.view;

		if (select) {
		} else if (this.query != null) {
			select = this.query.select
		}
		result = this.select(select.fields);

		if (where) {
			result = this.where(where.condition);
		}

		if (format != undefined) {
			var oldResult = result;
			result = [];
			oldResult.forEach(function (item, i) {
				if (Array.isArray(format.expressions) && Object.keys(format.expressions).length) {
					if (Array.isArray(format.modify)) {
						format.modify.forEach(function (field) {
							if (item[field] != undefined) {
								format.expressions.forEach(function (object) {
									for (var expression in object) {
										// console.log(object, expression);
										switch (expression) {
											case 'concat':
												var obj = {};
												/* copy all key value pairs */
												Object.keys(oldResult[0]).forEach(function (column) {
													if (column !== field && item[column] != undefined) {
														obj[column] = item[column];
													} else if (column === field && item[column] != undefined) {
														obj['old_'+column] = item[column];
													}
												});
												obj[field] = item[field];
												object[expression].forEach(extraField => {
													var sValue = '';
													// console.log(extraField, item, item[extraField]);
													if (item[extraField] != undefined) {
														if (typeof item[extraField] == 'boolean') {
															if (item[extraField] == true) {
																sValue = ' ' + extraField.ucWords();
															}
														} else {
															sValue = item[extraField];
														}
													} else {
														sValue = extraField;
													}
													// obj[field] += (item[extraField] != undefined) ? item[extraField] : extraField;
													obj[field] += sValue;
												});
												result.push(obj);
											break;
										}
									}
								});
							}
						});
					}
				}
			});

			if (result.length == 0) {
				result = oldResult;
			}
		}

		this.data = result;
		return this;
	}

	getQuery() {
		return this.query;
	}
}
