export function preprocess(state){
    let { file: { nodes, edges }, currentNode } = state;
    for(let el of nodes){
        el.distance = el.id === currentNode ? 0 : -1;
        if(!['startNode', 'endNode', 'currentNode'].includes(el.type)) el.type = 'empty';
        delete el.pred;
    }

    for(let el of edges){
        el.type = 'emptyEdge';
    }

    state.info = [`Setting starting node distance to 0`, `Setting other nodes' distance to ∞`]
}

export function process(state, edge, endNode, nextSteps, indexes){
    var {file: {nodes}, currentNode } = state;
    edge.type = 'visitedEdge';

    state.info = [`Scanning leaving star for node ${currentNode}`, `Found node ${edge.target}`]
    
    if(edge.target !== endNode && nodes[indexes[edge.target]].type !== 'visitedNode'){
        nextSteps.push(edge.target);
    }

    let node = nodes[indexes[edge.target]];

    if(node.type === 'empty') {
        node.type = 'visitedNode';
        state.info.push(`Marking node ${edge.target} as a visited node`);
    }

    var { distance } = nodes[indexes[currentNode]]
    let newDistance = (edge.cost ? edge.cost : 1) + distance
    
    /******* If distance < 0, node was never explored *******/
    if(node.distance < 0 || node.distance > newDistance){
        node.distance < 0 ? 
            state.info.push(`Updating node ${edge.target}'s distance from the source since it was found for the first time`) :
            state.info.push(`Updating node ${edge.target}'s distance from the source since a shorter path was found`);
        
        state.info.push(`Setting node ${edge.source} as predecessor of node ${edge.target}`);

        node.distance = newDistance;
        node.pred = edge.source;
    }
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