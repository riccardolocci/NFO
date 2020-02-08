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

export function process(nodes, edges, currentNode, endNode, nextSteps, indexes, updateNode){
    for(let el of edges){
        if(el.source === currentNode.id){
            el.type = 'visitedEdge';
            if(el.target !== endNode.id) nextSteps.push(nodes[indexes[el.target]]);
            var { distance } = nodes[indexes[currentNode.id]]
            updateNode(nodes, el.source, indexes[el.target], (el.cost ? el.cost : 1) + distance);
        }
    }
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