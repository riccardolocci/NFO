export default (f) => {
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