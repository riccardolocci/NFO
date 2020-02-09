export function preprocess(nodes, edges, currentNode){
    for(let el of nodes){
        el.distance = el.id === currentNode ? 0 : -1;
        if(!['startNode', 'endNode', 'currentNode'].includes(el.type)) el.type = 'empty';
        delete el.pred;
    }

    for(let el of edges){
        el.type = 'emptyEdge';
    }
}

export function process(nodes, edge, currentNode, endNode, nextSteps, indexes, updateNode){
    edge.type = 'visitedEdge';
    
    if(edge.target !== endNode && nodes[indexes[edge.target]].type !== 'visitedNode') nextSteps.push(edge.target);
    var { distance } = nodes[indexes[currentNode]]
    updateNode(nodes, edge.source, indexes[edge.target], (edge.cost ? edge.cost : 1) + distance);
}

export function postprocess(edges, currentNode){
    if(currentNode.prevType === 'visitedNode') currentNode.prevType = 'pathNode';

    for(let el of edges) if(currentNode.pred === el.source && currentNode.id === el.target){
        el.type = 'pathEdge';
        break;
    }

    currentNode.type = currentNode.prevType;
    delete currentNode.prevType;

    return currentNode.pred;
}