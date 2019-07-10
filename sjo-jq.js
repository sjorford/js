var sjoQ = {};
sjoQ.version = '2019.07.10.0';

////////////////////////////////////////////////////////////////////////////////

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

////////////////////////////////////////////////////////////////////////////////

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

////////////////////////////////////////////////////////////////////////////////

// Collapsible section
(function($) {
	
	// Expand or collapse a section
	function _toggle(expand) {
		var wrapper = this.closest('.sjo-collapsible');
		var heading = $(wrapper.data('sjo').collapsible.heading);
		if (expand) {
			wrapper.show();
			heading.find('.sjo-collapsible-collapse').show();
			heading.find('.sjo-collapsible-expand').hide();
		} else {
			wrapper.hide();
			heading.find('.sjo-collapsible-collapse').hide();
			heading.find('.sjo-collapsible-expand').show();
		}
	}
	
	$.fn.expand = function() {
		_toggle.call(this, true);
	}
	
	$.fn.collapse = function() {
		_toggle.call(this, false);
	}
	
	// Make a section collapsible
	$.fn.collapsible = function(heading, expand) {
		
		var _heading = $(heading).get(0);
		
		// Add buttons to header
		var buttonWrapper = $('<span style="font-size: small;"></span>').appendTo(heading);
		var expandButton = $('<a class="sjo-collapsible-expand">[Expand]</a>').appendTo(buttonWrapper).click(() => this.expand());
		var collapseButton = $('<a class="sjo-collapsible-collapse">[Collapse]</a>').appendTo(buttonWrapper).click(() => this.collapse());
		
		// Wrap content in new div
		this.wrapAll('<div class="sjo-collapsible"></div>').closest('.sjo-collapsible').data({sjo: {collapsible: {heading: _heading}}});
		
		// Apply default state
		if (expand)
			this.expand();
		else
			this.collapse();
		
		return this;
		
	};
	
})(jQuery);
