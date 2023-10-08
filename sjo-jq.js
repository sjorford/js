var sjoQ = {};
sjoQ.version = '2023.10.08.0';
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
		splitCell:       splitCell,
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
		this.filter('table').find('thead, tbody, tfoot').each((tbodyIndex, tbodyElement) => {
			
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
	
	// Split a cell into multiple cells, by rows or columns
	// TODO: normalize tables that have invalid specs (conflicting rowspan / colspan)
	// TODO: consider over/underhanging cells where some rows are incomplete
	// TODO: also adjust col and colgroup elements if any
	// TODO: copy attributes of existing row and cell
	function splitCell(numRows, numCols) {
		
		// Build a new return set
		// It makes sense to return a set of the new cells instead of returning the original cell for chaining, since:
		//     (i)  the original cell no longer exists in its original form, but has been replaced by multiple new cells
		//     (ii) the calling function will probably want to manipulate the new cells
		var returnSet = $();
		
		// Number of rows and columns to split this cell into
		numRows = parseInt(numRows, 10) || 1;
		numCols = parseInt(numCols, 10) || 1;
		if (numRows <= 1 && numCols <= 1) return;
		
		// Loop through selected cells
		this.filter('th, td').each((i, cellElement) => {
			var cell = $(cellElement);
			var table = cell.closest('table')
			
			// Get existing cell dimensions
			var rowSpanOrig = cellElement.rowSpan || 1;
			var colSpanOrig = cellElement.colSpan || 1;
			
			// Calculate new cell dimensions
			var rowSpanNew  = Math.max(rowSpanOrig, numRows);
			var colSpanNew  = Math.max(colSpanOrig, numCols);
			
			// Index all table cells with their actual row and column indexes (within sections)
			table.indexCells();
			
			// Get first and last row and column indexes of this cell
			var rowMin = cell.data('sjo-row-min');
			var rowMax = cell.data('sjo-row-max');
			var colMin = cell.data('sjo-col-min');
			var colMax = cell.data('sjo-col-max');
			
			// If we need to add columns, do that now
			// by expanding all cells that overlap with the last column of this cell
			// This will also expand the selected cell
			// TODO: also adjust col and colgroup elements if any
			if (colSpanNew > colSpanOrig) {
				var cellsInColumn = table.children('thead, tbody, tfoot').children('th, td').filter((i,e) => $(e).data('sjo-col-min') <= colMax && $(e).data('sjo-col-max') >= colMax);
				cellsInColumn.attr('colspan', i => (cellsInColumn[i].colSpan || 1) + (colSpanNew - colSpanOrig));
			}
			
			// If we need to add rows, do that now
			// by inserting rows after the last row of this cell
			// and expanding all cells in other columns that overlap that last row
			// TODO: copy attributes of existing row (class, style, ...?)
			if (rowSpanNew > rowSpanOrig) {
				var newRows = $('<tr></tr>'.repeat(rowSpanNew - rowSpanOrig));
				var tbody = cell.closest('thead, tbody, tfoot');
				tbody.children('tr').eq(rowMax).after(newRows);
				var cellsInRow = tbody.children('tr').children('th, td').filter((i,e) => $(e).data('sjo-row-min') <= rowMax && $(e).data('sjo-row-max') >= rowMax);
				cellsInRow.attr('rowspan', i => (cellsInRow[i].rowSpan || 1) + (rowSpanNew - rowSpanOrig));
			}
			
			// Loop through rows we need to split into
			var currentRow;
			for (var r = 0; r < numRows; r++) {
				
				// Get the current row:
				//     first, the <tr> element that is the parent of our <th> or <td> element
				//     then use succeeding rows
				if (r == 0) {
					currentRow = cell.parent('tr');
				} else {
					currentRow = currentRow.next('tr');
				}
				
				// Find all cells to the right of the current cell
				var followingCells = currentRow.children('th, td').filter((i,e) => $(e).data('sjo-col-min') > colMax);
				
				// Append new cells at the end of the row
				for (var c = 0; c < numCols; c++) {
					
					// Create a new cell
					// Use the current cell at the top-left, as it may have unknown attributes/properties we do not want to discard
					// TODO: clone attributes of existing cell (class, style, ...?)
					var newCell = (r == 0 && c == 0) ? cell : $('<td></td>');
					
					// Append the new cell at the end of the row
					currentRow.append(newCell);
					
					// Calculate the size of this cell
					// All new cells will have rowspan/colspan=1
					// unless the sum of the new rows/columns is less then the current rowspan/colspan,
					// in which case the remainder is added to the cells in the last row/column
					newCell.attr('rowspan', (r == numRows - 1 && rowSpanOrig > numRows) ? (rowSpanOrig - numRows + 1) : 1);
					newCell.attr('colspan', (c == numCols - 1 && colSpanOrig > numCols) ? (colSpanOrig - numCols + 1) : 1);
					
					// Add the new cell to the returned jQuery object
					returnSet = returnSet.add(newCell);
					
				}
				
				// Append the following cells after the new cells
				currentRow.append(followingCells);
				
			}
			
		});
		
		return returnSet;
		
	}
	
})(jQuery);
