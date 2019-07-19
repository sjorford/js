function getSelectedNodes() {
	
	// This function will return all nodes (including text nodes) that are in the current selection
	
	var nodeA = $(window.getSelection().anchorNode);
	var nodeB = $(window.getSelection().focusNode);
	
	// Find the closest common parent
	// Assuming that both nodes have at least one parent (i.e. both ends of the selection will be below the <html> node)
	var commonParent = nodeA.parents().filter(nodeB.parents()).first();
	var commonParentChildren = commonParent.contents();
	
	// Find the ancestor of each node (or possibly the node itself) that is a child of the common parent
	var nodeAAncestor = commonParentChildren.filter(nodeA.parents().add(nodeA));
	var nodeBAncestor = commonParentChildren.filter(nodeB.parents().add(nodeB));
	
	// If the focus is before the anchor, swap the nodes
	if (commonParentChildren.index(nodeAAncestor) > commonParentChildren.index(nodeBAncestor)) {
		[nodeA, nodeB] = [nodeB, nodeA];
		[nodeAAncestor, nodeBAncestor] = [nodeBAncestor, nodeAAncestor];
	}
	
	// Traverse the tree below the common parent
	var allNodes = [];
	var passedNodeA = false;
	return getNodes(commonParent);
	
	function getNodes(node) {
		
		// Check if this is nodeA
		if (!passedNodeA && node.is(nodeA)) {
			passedNodeA = true;
		}
		
		// If we have not yet found nodeA, and we are not one of its ancestors, skip this node
		if (!passedNodeA && !node.is(nodeA.parents())) {
			return true;
		}
		
		// If we have found nodeA, add this node to the collection
		if (passedNodeA) {
			allNodes.push(node.get(0));
		}
		
		// Loop through child nodes
		var children = node.contents();
		for (var i = 0; i < children.length; i++) {
			
			// If nodeB is found in this node's descendants, end the search
			if (!getNodes(children.eq(i))) return false;
			
		}
		
		// If we have reached nodeB, end the search
		if (node.is(nodeB)) {
			return false;
		} else {
			return true;
		};
		
	}
	
}
