var sjoQ = {};
sjoQ.version = '2023.10.05.1';
console.log('sjoQ version ' + sjoQ.version);

(function($) {
	
	$.fn.extend({
		addCell:         addCell,
		addCellHTML:     addCellHTML,
		addHeader:       addHeader,
		addHeaderHTML:   addHeaderHTML,
		selectRange:     selectRange,
		expand:          expand,
		collapse:        collapse,
		collapsible:     collapsible,
		getTableHeaders: getTableHeaders,
		numCols:         numCols,
		indexCells:      indexCells,
	});
	
	// Add cell with text content
	function addCell(text, className, id) {
		return _addCell(this, false, text, className, id, false);
	}
	
	// Add cell with HTML content
	function addCellHTML(html, className, id) {
		return _addCell(this, true, html, className, id, false);
	}
	
	// Add header cell with text content
	function addHeader(text, className, id) {
		return _addCell(this, false, text, className, id, true);
	}
	
	// Add header cell with HTML content
	function addHeaderHTML(html, className, id) {
		return _addCell(this, true, html, className, id, true);
	}
	
	// Add a new cell to a table row
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
	
	// Select range
	function selectRange() {
		var range = document.createRange();
		range.selectNodeContents(this.get(0));
		var selection = getSelection();
		selection.removeAllRanges();
		selection.addRange(range);
		return this;
	}
	
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
	
	function expand() {
		_toggle.call(this, true);
	}
	
	function collapse() {
		_toggle.call(this, false);
	}
	
	// Make a section collapsible
	function collapsible(heading, expand) {
		
		var _heading = $(heading).get(0);
		
		// Add buttons to header
		var buttonWrapper = $('<span style="font-size: small;"></span>').appendTo(heading);
		$('<a class="sjo-collapsible-expand">[Expand]</a>').appendTo(buttonWrapper).click(() => this.expand());
		$('<a class="sjo-collapsible-collapse">[Collapse]</a>').appendTo(buttonWrapper).click(() => this.collapse());
		
		// Wrap content in new div
		this.wrapAll('<div class="sjo-collapsible"></div>').closest('.sjo-collapsible').data({sjo: {collapsible: {heading: _heading}}});
		
		// Apply default state
		if (expand)
			this.expand();
		else
			this.collapse();
		
		return this;
		
	}
	
	// Get array of table headers 
	function getTableHeaders() {
		
		var headers = [];
		if (!(this.is('table'))) return headers;
		
		this.find('thead:first-of-type').find('th, td').each((i,e) => {
			
			var th = $(e);
			headers.push(th.text().replace(/\s+/, ' ').trim());
			
			var colspan = th.attr('colspan');
			if (colspan && colspan - 0 > 1) {
				for (var i = 1; i < colspan - 0; i++) {
					headers.push(null);
				}
			}
			
		});
		
		return headers;
		
	}
	
	// Get number of columns in table, based on first row
	function numCols() {
		if (!this.first().is('table')) return 0;
		return this.first().find('tr').first().find('td,th').toArray().map(e => e.colSpan ? (e.colSpan - 0) : 1).reduce((s, a) => s + a, 0);
	}
	
	// Index cells by actual row and column number, accounting for spanned cells
	function indexCells() {
		
		// Index each table section separately
		this.filter('table').find('thead, tbody').each((tbodyIndex, tbodyElement) => {
			
			// Keep track of cells on later rows and columns
			var spannedCells = [];
			
			// Loop through all rows in table
			$('tr', tbodyElement).each((rowIndex, rowElement) => {
				
				// Reset column index 
				var colIndexActual = 0;
				
				// Initialise row of array if not already
				if (!spannedCells[rowIndex]) spannedCells[rowIndex] = [];				
				
				// Loop through cells
				$('th, td', rowElement).each((colIndexOriginal, cellElement) => {
					
					// Skip over any spanned cells
					while (spannedCells[rowIndex][colIndexActual]) {
						colIndexActual++;
					}
					
					// Get dimensions of cell
					var rowSpan = cellElement.rowSpan || 1;
					var colSpan = cellElement.colSpan || 1;
					
					// Write indexes to cell
					$(cellElement).data('sjo-row-min', rowIndex)              .data('sjo-col-min', colIndexActual);
					$(cellElement).data('sjo-row-max', rowIndex + rowSpan - 1).data('sjo-col-max', colIndexActual + colSpan - 1);
					
					// Mark spanned cells on later rows and columns
					for (var r = rowIndex; r < rowIndex + rowSpan; r++) {
						if (!spannedCells[r]) spannedCells[r] = [];
						for (var c = colIndexActual; c < colIndexActual + colSpan; c++) {
							spannedCells[r][c] = true;
						}
					}
					
				});
				
			});
			
		});
		
		return this;
	}
	
})(jQuery);
