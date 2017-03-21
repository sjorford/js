// Add a new cell to a table row
(function($) {
	
	// Add cell with text content
	$.fn.addCell = function(text, className, id) {
		return _addCell(this, false, text, className, id, false);
	};
	
	// Add cell with HTML content
	$.fn.addCellHTML = function(html, className, id) {
		return _addCell(this, true, html, className, id, false);
	};
	
	// Add header cell with text content
	$.fn.addHeader = function(text, className, id) {
		return _addCell(this, false, text, className, id, true);
	};
	
	// Add header cell with HTML content
	$.fn.addHeaderHTML = function(html, className, id) {
		return _addCell(this, true, html, className, id, true);
	};
	
	function _addCell(obj, isHTML, content, className, id, header) {
		for (var i = 0; i < obj.length; i++) {
			var row = obj[i];
			if (row.tagName == 'TR') {
				var cell = header ? $('<th></th>') : $('<td></td>');
				if (content !== null && content !== undefined) {
					if (isHTML) cell.html(content); 
					else cell.text(content);
				}
				if (className) cell.addClass(className);
				if (id) cell.attr('id', id);
				cell.appendTo(row);
			}
		}
		return obj;
	}
	
})(jQuery);

// Select range
(function($) {
	$.fn.selectRange = function() {
		var range = document.createRange();
		range.selectNodeContents(this.get(0));
		var selection = getSelection();
		selection.removeAllRanges();
		selection.addRange(range);
		return this;
	};
})(jQuery);
