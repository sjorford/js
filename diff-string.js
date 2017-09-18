function diffString(oldText, newText) {
	
	var debug = true;
	
	// Split incoming text
	var oldWords = splitText(oldText);
	var newWords = splitText(newText);
	if (debug) console.log('diffString', oldWords);
	if (debug) console.log('diffString', newWords);
	
	// Process the initial set of words
	return findDifferences(oldWords, newWords, 0);
	
	// Split a string into word-space pairs
	function splitText(text) {
		var numWords = 0;
		var words = [], spaces = [];
		while (text.length > 0) {
			numWords++;
			var split = text.match(/^(\S+)?(\s+)?([\S\s]*)$/);
			words.push(split[1]);
			spaces.push(split[2]);
			text = split[3];
		}
		return {words: words, spaces: spaces};
	}
	
	// Markup a section of text
	function findDifferences(oldWords, newWords, depth) {
		var logPrefix = ' '.repeat(depth * 4) + 'findDifferences';
		if (debug) console.log(logPrefix, oldWords);
		if (debug) console.log(logPrefix, newWords);

		// Find the longest consecutive run of matching words
		var bestOldStart = 0, bestNewStart = 0, bestRun = 0;
		var oldStart = 0, newStart = 0, testRun = 0, foundRun = 0;
		
		// Loop through potential starting points in the old set
		while (oldStart < oldWords.words.length - bestRun) {
			
			// Loop through potential starting points in the new set
			newStart = 0;
			while (newStart < newWords.words.length - bestRun) {
				
				// Find the longest run from this point
				foundRun = 0;
				while (oldStart + foundRun < oldWords.words.length && newStart + foundRun < newWords.words.length) {
					if (oldWords.words[oldStart + foundRun] != newWords.words[newStart + foundRun]) {
						break;
					} else {
						foundRun++;
					}
				}
				
				// Save this run if it is the best yet
				if (foundRun > bestRun) {
					bestOldStart = oldStart;
					bestNewStart = newStart;
					bestRun = foundRun;
				}
				
				newStart++;
			}
			
			oldStart++;
		}
		
		// Check if a match was found
		var mergedText = '';
		if (bestRun === 0) {
			
			// If no words match, return this whole set as dirty
			// TODO: check for matching spaces at the edge of a dirty set
			
			// Concatenate the old words
			var oldText = '';
			for (var oldIndex = 0; oldIndex < oldWords.words.length; oldIndex++) {
				oldText += oldWords.words[oldIndex];
				oldText += ifNull(oldWords.spaces[oldIndex], '');
			}
			
			// Concatenate the new words
			var newText = '';
			for (var newIndex = 0; newIndex < newWords.words.length; newIndex++) {
				newText += newWords.words[newIndex];
				newText += ifNull(newWords.spaces[newIndex], '');
			}
			
			// Concatenate the two sets
			mergedText += oldText.length === 0 ? '' : '<del>' + escapeHtml(oldText) + '</del>';
			mergedText += newText.length === 0 ? '' : '<ins>' + escapeHtml(newText) + '</ins>';
			
		} else {
			
			// Process the preceding words
			if (bestOldStart > 0 || bestNewStart > 0) {
				var precedingOldWords = {words: oldWords.words.slice(0, bestOldStart), spaces: oldWords.spaces.slice(0, bestOldStart)};
				var precedingNewWords = {words: newWords.words.slice(0, bestNewStart), spaces: newWords.spaces.slice(0, bestNewStart)};
				mergedText += findDifferences(precedingOldWords, precedingNewWords, depth + 1);
			}
			
			// Concatenate this clean set
			for (var index = bestOldStart; index < bestOldStart + bestRun; index++) {
				
				// Add the matching word
				mergedText += escapeHtml(ifNull(oldWords.words[index], ''));
				
				// Add the spaces
				var newIndex = index - bestOldStart + bestNewStart;
				if (oldWords.spaces[index] === newWords.spaces[newIndex]) {
					mergedText += escapeHtml(ifNull(oldWords.spaces[index], ''));
				} else {
					mergedText += ifNull(oldWords.spaces[index], '') === '' ? '' : '<del>' + escapeHtml(oldWords.spaces[index]) + '</del>';
					mergedText += ifNull(newWords.spaces[newIndex], '') === '' ? '' : '<ins>' + escapeHtml(newWords.spaces[newIndex]) + '</ins>';
				}
				
			}
			
			// Process the following words
			if (bestOldStart + bestRun < oldWords.words.length || bestNewStart + bestRun < newWords.words.length) {
				var followingOldWords = {words: oldWords.words.slice(bestOldStart + bestRun), spaces: oldWords.spaces.slice(bestOldStart + bestRun)};
				var followingNewWords = {words: newWords.words.slice(bestNewStart + bestRun), spaces: newWords.spaces.slice(bestNewStart + bestRun)};
				mergedText += findDifferences(followingOldWords, followingNewWords, depth + 1);
			}
			
		}
		
		if (debug) console.log(logPrefix, mergedText);
		return mergedText;
		
	}
		
	function escapeHtml(string) {
		return string.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
	}

	function ifNull(string, replace) {
		return string === null || string === undefined ? replace : string; 
	}
	
}
