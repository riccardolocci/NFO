import React, { Component } from 'react';
import { GraphView } from 'react-digraph';

import '../css/GraphBuilder.css';

const data = {
    "nodes": [
      {
        "id": 1,
        "title": "Node A",
        x: Math.random() * 600, // "x": 258.3976135253906,
        y: Math.random() * 600,// "y": 331.9783248901367,
        "type": "empty"
      },
      {
        "id": 2,
        "title": "Node B",
        x: Math.random() * 600, // "x": 593.9393920898438,
        y: Math.random() * 600,// "y": 260.6060791015625,
        "type": "empty"
      },
      {
        "id": 3,
        "title": "Node C",
        x: Math.random() * 600, // "x": 237.5757598876953,
        y: Math.random() * 600,// "y": 61.81818389892578,
        "type": "custom"
      },
      {
        "id": 4,
        "title": "Node C",
        x: Math.random() * 600, // "x": 600.5757598876953,
        y: Math.random() * 600,// "y": 600.81818389892578,
        "type": "custom"
      }
    ],
    "edges": [
      {
        "source": 1,
        "target": 2,
        "type": "emptyEdge",
        handleText: '5; 5'
      },
      {
        "source": 2,
        "target": 4,
        "type": "emptyEdge"
      }
    ]
  };

const GraphConfig =  {
    NodeTypes: {
        empty: {
            // typeText: "None",
            shapeId: "#empty", // relates to the type property of a node
            shape: (
                <symbol viewBox="0 0 100 100" id="empty" key="0">
                    <circle cx="50" cy="50" r="5" stroke="green" ></circle>
                </symbol>
            )
        },
        custom: {
            // typeText: "Custom",
            shapeId: "#custom", // relates to the type property of a node
            shape: (
                <symbol viewBox="0 0 100 100" id="custom" key="0">
                    <circle cx="50" cy="50" r="10" stroke="red"></circle>
                </symbol>
            )
        }
    },
    NodeSubtypes: {},
    EdgeTypes: {
        emptyEdge: {  // required to show empty edges
            shapeId: "#emptyEdge",
            shape: (
                <symbol viewBox="0 0 50 50" id="emptyEdge" key="0"></symbol>
            )
        }
    }
}

class GraphBuilder extends Component {
    constructor(props){
        super(props);

        this.state = {
            selected: {}
        }
    }

    findByClass(e, cls) {
        if (e.className.baseVal === cls) return e;
        if (!e.children) return;
        for(let el of e.children){
            let res = this.findByClass(el ,cls);
            if (res) return res
        }

        return;
    }
  
    render() {
        const NodeTypes = GraphConfig.NodeTypes;
        const NodeSubtypes = GraphConfig.NodeSubtypes;
        const EdgeTypes = GraphConfig.EdgeTypes;
        
        return(
            <div className="GraphBuilder-root">
                <GraphView  ref='GraphView'
                    nodeKey="id"
                    nodes={data.nodes}
                    edges={data.edges}
                    selected={this.state.selected}
                    nodeTypes={NodeTypes}
                    nodeSubtypes={NodeSubtypes}
                    edgeTypes={EdgeTypes}
                    readOnly
                    onSelectNode={() => {}}
                    onCreateNode={() => {}}
                    onUpdateNode={() => {}}
                    onDeleteNode={() => {}}
                    onSelectEdge={() => {}}
                    onCreateEdge={() => {}}
                    onSwapEdge={() => {}}
                    onDeleteEdge={() => {}}

                    afterRenderEdge={(id, element, edge, edgeContainer, isEdgeSelected) => {
                        let comp = this.findByClass(edgeContainer, 'edge-path');
                        comp.style.stroke = 'black';
                    }}
                />
            </div>
        ) 
    }
}

export default GraphBuilder;