let balancedArrange = (f) => {
    const d3 = require('d3');
    let { nodes, edges } = f;

    let sim = d3.forceSimulation(nodes)
        .force("charge", d3.forceManyBody().strength(-100 * (nodes.length ** 2 / edges.length)).distanceMin(50).distanceMax(100))

    
    sim.tick([10])

    f.nodes = nodes.map( n => ({
        id: n.id,
        title: n.title,
        x: n.x,
        y: n.y,
        type: 'empty'
    }));

    for(let el of edges){
        el.type = 'emptyEdge';
        el.handleText = '.';
    }

    return f;
}

let forceArrange = (f) => {
    const d3 = require('d3');
    let { nodes, edges } = f;

    let sim = d3.forceSimulation(nodes)
        .force("link", 
            d3.forceLink(JSON.parse(JSON.stringify(edges)))
            .id(n => n.id).distance(e => e.cost ? e.cost*100 : 100))

    sim.tick([10])

    sim.force("charge", d3.forceManyBody().strength(-1000).distanceMin(100))

    
    sim.tick([10])

    f.nodes = nodes.map( n => ({
        id: n.id,
        title: n.title,
        x: n.x,
        y: n.y,
        type: 'empty'
    }));

    for(let el of edges){
        el.type = 'emptyEdge';
        el.handleText = '.';
    }

    return f;
}

let randomArrange = (f) => {
    for(let el of f.nodes){
        el.x = Math.random() * 600;
        el.y = Math.random() * 600;
        el.type = 'empty';
    }

    for(let el of f.edges){
        el.type = 'emptyEdge';
        el.handleText = '.';
    }

    return f;
}

export default (f, mode = 'balanced') => {
    switch(mode){
        case 'balanced':
            return balancedArrange(f);
        case 'force':
            return forceArrange(f);
        case 'random':
            return randomArrange(f);
        default:
            return f;
    }
}