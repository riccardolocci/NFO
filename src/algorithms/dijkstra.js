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

    state.info = [`Permanently marked node ${nodes[indexes[currentNode]].title}`, `Scanning leaving star for node ${nodes[indexes[currentNode]].title}`, `Found node ${nodes[indexes[edge.target]].title}`]
    
    if(edge.target !== endNode && nodes[indexes[edge.target]].type !== 'visitedNode'){
        nextSteps.push(edge.target);
    }

    let node = nodes[indexes[edge.target]];

    if(node.type === 'empty') {
        node.type = 'visitedNode';
        state.info.push(`Marking node ${nodes[indexes[edge.target]].title} as a visited node`);
    }

    var { distance } = nodes[indexes[currentNode]]
    let newDistance = (edge.cost ? edge.cost : 1) + distance
    
    /******* If distance < 0, node was never explored *******/
    if(node.distance < 0 || node.distance > newDistance){
        node.distance < 0 ? 
            state.info.push(`Updating node ${nodes[indexes[edge.target]].title}'s distance from the source since it was found for the first time`) :
            state.info.push(`Updating node ${nodes[indexes[edge.target]].title}'s distance from the source since a shorter path was found`);
        
        state.info.push(`Setting node ${nodes[indexes[edge.source]].title} as predecessor of node ${nodes[indexes[edge.target]].title}`);

        node.distance = newDistance;
        node.pred = edge.source;
    }
}

export function postprocess(state, indexes, currentNode){
    let { file: { edges, nodes } } = state;
    
    if(currentNode.prevType === 'visitedNode') currentNode.prevType = 'pathNode';

    let previousNode = nodes[indexes[currentNode.pred]];

    for(let idx of previousNode.leavingStar) {
        let edge = edges[idx];
        if(currentNode.id === edge.target){
            edge.type = 'pathEdge';
            state.info = [`Found node ${nodes[indexes[edge.source]].title} while following the path backwards`, `Marking edge ${nodes[indexes[edge.source]].title}-${nodes[indexes[edge.target]].title} as path edge`]
            break;
        }
    }

    state.info.push(`Marking node ${nodes[indexes[currentNode.id]].title} as path node`);

    currentNode.type = currentNode.prevType;
    delete currentNode.prevType;
}