export default (n, m, c=10) => {
    let nodes = [];
    for(let i=1; i<=n; i++){
        nodes.push({
            id: i,
            title: `${i}`,
            x: Math.random() * 600,
            y: Math.random() * 600,
            type: 'empty'
        });
    }

    let edges = [];
    let leavingStars = {};
    for(let j=0; j<m; j++){
        let source = 1 + Math.floor(Math.random() * (n - 1));

        if(!leavingStars[source]) leavingStars[source] = [];
        
        while (leavingStars[source].length === n - source){
            source = 1 + Math.floor(Math.random() * (n - 1));
            if(!leavingStars[source]) leavingStars[source] = [];
        }

        let target = source + Math.floor(Math.random() * (n - source)) + 1;

        while(leavingStars[source].includes(target)) target = source + Math.floor(Math.random() * (n - source)) + 1;
        leavingStars[source].push(target);

        let cost = Math.floor(Math.random() * c);
        
        edges.push({
            source,
            target,
            cost,
            type: 'emptyEdge',
            handleText: cost ? cost : '.'
        });
    }

    return { nodes, edges };
}