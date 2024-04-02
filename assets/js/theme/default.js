$(document).ready(function() {
	$('[data-for]').on('click', function (e) {
		var ui = $('#' + $(e.target).data('for'));
		if (ui.length) {
			var tagName = ui.prop('tagName').toLowerCase();
			console.log(tagName);
			if (tagName == 'input') {
				switch (ui.attr('type')) {
					case 'radio':
						$('#'+$(e.target).data('for')).trigger('click');
						break;
						
					default:
						$('#'+$(e.target).data('for')).trigger('focus');
						break;
				}
			}
		}
	});
	$('.year-value').text(new Date().getFullYear());
});

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