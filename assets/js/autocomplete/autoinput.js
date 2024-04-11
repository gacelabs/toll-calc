function autocomplete(inp, arr, index) {
	/*the autocomplete function takes two arguments,
	the text field element and an array of possible autocompleted values:*/
	var currentFocus;
	/*execute a function when someone writes in the text field:*/
	inp.addEventListener("input", function (e) {
		var a, b, i, val = this.value;
		/*close any already open lists of autocompleted values*/
		closeAllLists();
		if (!val) { return false; }
		currentFocus = -1;
		/*create a DIV element that will contain the items (values):*/
		a = document.createElement("DIV");
		a.setAttribute("id", this.id + "autocomplete-list");
		a.setAttribute("class", "autocomplete-items justify-content-center");
		/*append the DIV element as a child of the autocomplete container:*/
		this.parentNode.appendChild(a);

		var index = index == undefined ? 'name' : index;
		
		/*for each item in the array...*/
		arr.forEach(function (matchValue) {
			matchValue = matchValue[index];
			/*check if the item starts with the same letters as the text field value:*/
			// if (matchValue.substr(0, val.length).toUpperCase() == val.toUpperCase()) {
			// console.log(matchValue, val);
			var valLength = matchValue.toUpperCase().indexOf(val.toUpperCase());
			if (valLength >= 0) {
				// console.log(matchValue);
				/*create a DIV element for each matching element:*/
				b = document.createElement("DIV");
				/*make the matching letters bold:*/
				// b.innerHTML = "<strong>" + matchValue.substr(valLength, val.length) + "</strong>";
				// b.innerHTML += matchValue.substr(val.length);
				b.innerHTML = matchValue.replace(matchValue.substr(valLength, val.length), "<strong>" + matchValue.substr(valLength, val.length) + "</strong>");
				/*insert a input field that will hold the current array item's value:*/
				b.innerHTML += "<input type='hidden' value='" + matchValue.trim() + "'>";
				/*execute a function when someone clicks on the item value (DIV element):*/
				b.addEventListener("click", function (e) {
					/*insert the value for the autocomplete text field:*/
					inp.value = this.getElementsByTagName("input")[0].value;
					/*close the list of autocompleted values,
					(or any other open lists of autocompleted values:*/
					closeAllLists();
				});
				a.appendChild(b);
			}
		});
	});
	/*execute a function presses a key on the keyboard:*/
	inp.addEventListener("keydown", function (e) {
		var x = document.getElementById(this.id + "autocomplete-list");
		if (x) x = x.getElementsByTagName("div");
		if (e.keyCode == 40) {
			/*If the arrow DOWN key is pressed,
			increase the currentFocus variable:*/
			currentFocus++;
			/*and and make the current item more visible:*/
			addActive(x);
		} else if (e.keyCode == 38) { //up
			/*If the arrow UP key is pressed,
			decrease the currentFocus variable:*/
			currentFocus--;
			/*and and make the current item more visible:*/
			addActive(x);
		} else if (e.keyCode == 13) {
			/*If the ENTER key is pressed, prevent the form from being submitted,*/
			e.preventDefault();
			if (currentFocus > -1) {
				/*and simulate a click on the "active" item:*/
				if (x) x[currentFocus].click();
			}
		}
	});
	function addActive(x) {
		/*a function to classify an item as "active":*/
		if (!x) return false;
		/*start by removing the "active" class on all items:*/
		if (currentFocus >= x.length) currentFocus = 0;
		if (currentFocus < 0) currentFocus = (x.length - 1);

		if (!isNaN(currentFocus)) {
			var callback = function (activeUI) {
				/*add class "autocomplete-active":*/
				activeUI[currentFocus].classList.add("autocomplete-active");
				scrollToItem(activeUI);
			};
			removeActive(x, callback);
		}
		
	}
	function removeActive(activeUI, fn) {
		/*a function to remove the "active" class from all autocomplete items:*/
		var x = document.getElementsByClassName("autocomplete-items");
		for (var i = 0; i < x[0].children.length; i++) {
			x[0].children[i].classList.remove("autocomplete-active");
		}
		fn(activeUI);
	}
	function closeAllLists(elmnt) {
		/*close all autocomplete lists in the document,
		except the one passed as an argument:*/
		var x = document.getElementsByClassName("autocomplete-items");
		for (var i = 0; i < x.length; i++) {
			if (elmnt != x[i] && elmnt != inp) {
				x[i].parentNode.removeChild(x[i]);
			}
		}
	}
	function scrollToItem(x) {
		if (x && x[currentFocus]) {
			var item = x[currentFocus];
			var container = document.getElementById(inp.id + "autocomplete-list");
			var itemHeight = item.offsetHeight;
			var containerScrollTop = container.scrollTop;
			var containerHeight = container.offsetHeight - 100;
			var itemTop = item.offsetTop - container.offsetTop;

			if (itemTop < containerScrollTop) {
				container.scrollTop = itemTop;
			} else if (itemTop + itemHeight > containerScrollTop + containerHeight) {
				container.scrollTop = itemTop + itemHeight - containerHeight;
			}
		}
	}
	/*execute a function when someone clicks in the document:*/
	document.addEventListener("click", function (e) {
		closeAllLists(e.target);
	});
}