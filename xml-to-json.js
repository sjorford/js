function XMLToJSON(xml) {
	
	var obj = {};
	
	for (var i = 0; i < xml.childNodes.length; i++) {
		
		var child = xml.childNodes.item(i);
		var childValue;
		
		if (!child.hasChildNodes()) {

			// Empty node
			childValue = null;

		} else if (child.childNodes.length == 1 && child.childNodes.item(0).nodeType == Node.TEXT_NODE) {

			// Text node
			childValue = child.childNodes.item(0).nodeValue;
			if (childValue.toLowerCase() === 'true') {
				childValue = true;
			} else if (childValue.toLowerCase() === 'false') {
				childValue = false;
			} else if (childValue.match(/^-?[1-9][0-9]*(\.[0-9]+)?$/)) {
				childValue = childValue - 0;
			}

		} else {

			// Composite node
			childValue = XMLToJSON(child);

		}

		if (!obj.hasOwnProperty(child.nodeName)) {

			// New key
			obj[child.nodeName] = childValue;

		} else {

			if (!Array.isArray(obj[child.nodeName])) {

				// Convert existing key to array
				obj[child.nodeName] = [obj[child.nodeName]];

			}

			// Add to array
			obj[child.nodeName].push(childValue);

		}

		// Attributes
		for (var j = 0; j < child.attributes.length; j++) {
			var attribute = child.attributes.item(j);
			var index = Array.isArray(obj[child.nodeName]) ? obj[child.nodeName].length - 1 : 0;
			obj[child.nodeName + '%' + index + '$' + attribute.nodeName] = attribute.nodeValue;
		}
		
	}
	
	return obj;
	
}
