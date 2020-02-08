export function preprocess(nodes, edges, currentNode){
    for(let el of nodes){
        el.distance = el.id === currentNode.id ? 0 : -1;
        if(!['startNode', 'endNode', 'currentNode'].includes(el.type)) el.type = 'empty';
        delete el.pred;
    }

    for(let el of edges){
        el.type = 'emptyEdge';
    }
}

export function process(nodes, edge, currentNode, endNode, nextSteps, indexes, updateNode){
    // for(let el of edges){
    //     if(el.source === currentNode.id){
            edge.type = 'visitedEdge';
            if(edge.target !== endNode.id && nodes[indexes[edge.target]].type !== 'visitedNode') nextSteps.push(nodes[indexes[edge.target]]);
            var { distance } = nodes[indexes[currentNode.id]]
            updateNode(nodes, edge.source, indexes[edge.target], (edge.cost ? edge.cost : 1) + distance);
    //     }
    // }
}

export function postprocess(nodes, edges, currentNode, indexes){
    if(currentNode.prevType === 'visitedNode') currentNode.prevType = 'pathNode';

    for(let el of edges) if(currentNode.pred === el.source && currentNode.id === el.target){
        el.type = 'pathEdge';
        break;
    }

    currentNode.type = currentNode.prevType;
    delete currentNode.prevType;

    return nodes[indexes[currentNode.pred]];
}