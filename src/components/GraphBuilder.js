import React, { Component } from 'react';
import { GraphView } from 'react-digraph';
import { Button } from '@material-ui/core';

import '../css/GraphBuilder.css';

// const data = {
//     nodes: [
//       {
//         id: 1,
//         title: "Node A",
//         x: Math.random() * 600, // "x": 258.3976135253906,
//         y: Math.random() * 600,// "y": 331.9783248901367,
//         type: "empty"
//       },
//       {
//         id: 2,
//         title: "Node B",
//         x: Math.random() * 600, // "x": 593.9393920898438,
//         y: Math.random() * 600,// "y": 260.6060791015625,
//         type: "empty"
//       },
//       {
//         id: 3,
//         title: "Node C",
//         x: Math.random() * 600, // "x": 237.5757598876953,
//         y: Math.random() * 600,// "y": 61.81818389892578,
//         type: "custom"
//       },
//       {
//         id: 4,
//         title: "Node C",
//         x: Math.random() * 600, // "x": 600.5757598876953,
//         y: Math.random() * 600,// "y": 600.81818389892578,
//         type: "custom"
//       }
//     ],
//     edges: [
//       {
//         source: 1,
//         target: 2,
//         type: "emptyEdge",
//         handleText: '5; 5',
//         cost: 3,
//         flow: 2,
//         capacity: 8
//       },
//       {
//         source: 2,
//         target: 4,
//         type: "emptyEdge",
//         handleText: '10; 5',
//         cost: 5,
//         flow: 4,
//         capacity: 6
//       }
//     ]
//   };

const GraphConfig =  {
    NodeTypes: {
        empty: {
            // typeText: "None",
            shapeId: "#empty", // relates to the type property of a node
            shape: (
                <symbol viewBox="0 0 100 100" id="empty" key="0">
                    <circle cx="50" cy="50" r="5" stroke="green" />
                </symbol>
            )
        },
        custom: {
            // typeText: "Custom",
            shapeId: "#custom", // relates to the type property of a node
            shape: (
                <symbol viewBox="0 0 100 100" id="custom" key="0">
                    <circle cx="50" cy="50" r="10" stroke="red" />
                </symbol>
            )
        }
    },
    NodeSubtypes: {},
    EdgeTypes: {
        emptyEdge: {  // required to show empty edges
            shapeId: "#emptyEdge",
            shape: (
                <symbol viewBox="0 0 50 50" id="emptyEdge" key="0" />
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

    setAttribute(c, aName, aValue, concat=true){
        var attr = concat ? c.getAttribute(aName) : document.createAttribute(aName);
        c.setAttribute(aName,  attr && concat ? attr + aValue : aValue);
    }
  
    render() {
        const NodeTypes = GraphConfig.NodeTypes;
        const NodeSubtypes = GraphConfig.NodeSubtypes;
        const EdgeTypes = GraphConfig.EdgeTypes;

        const { labelSize, file } = this.props;
        
        return(
            <div className="GraphBuilder-root">
                <div className="GraphBuilder-graph" >
                    <GraphView  ref='GraphView'
                        nodeKey="id"
                        nodes={file.nodes}
                        edges={file.edges}
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

                        edgeArrowSize={5}

                        afterRenderEdge={(id, element, edge, edgeContainer, isEdgeSelected) => {
                            /***** Setting edge color *****/ 

                            let comp = edgeContainer.querySelector('.edge');
                            this.setAttribute(comp, 'style', 'stroke: black;', false);

                            /***** Setting arrow end color *****/ 

                            comp = document.querySelector('.arrow');
                            this.setAttribute(comp, 'style', 'fill: black;', false);

                            comp = edgeContainer.querySelector('.edge-text');

                            /***** Rotating labels according to edge slope *****/ 

                            let {x: x1, y: y1} = element.props.sourceNode;
                            let {x: x2, y: y2} = element.props.targetNode;

                            let tan = (y2 - y1)/(x2 - x1);
                            let deg = Math.atan(tan)*180/Math.PI;;

                            this.setAttribute(comp, 'style', `fill: black; stroke: white; stroke-width: 0.5px; font-weight: bold; font-size: ${labelSize}`, false);
                            this.setAttribute(comp, 'transform', ` rotate(${deg}) translate(0, -${labelSize})`);
                            comp.innerHTML = edge.flow ? edge.flow : '';

                            /***** Labels for costs and maximum capacity *****/ 
                            
                            if(edge.cost){
                                let costTag = comp.cloneNode(true);
                                
                                this.setAttribute(costTag, 'transform', ` translate(-${edge.capacity ? labelSize : 0}, ${labelSize*2})`);
                                costTag.style.fill = 'red';
                                costTag.innerHTML = edge.cost;
                                
                                comp.parentElement.appendChild(costTag);
                            }
                            
                            if(edge.capacity){
                                let capacityTag = comp.cloneNode(true);

                                this.setAttribute(capacityTag, 'transform', ` translate(${edge.cost ? labelSize : 0}, ${labelSize*2})`);
                                capacityTag.style.fill = 'blue';
                                capacityTag.innerHTML = edge.capacity;
                                
                                comp.parentElement.appendChild(capacityTag);
                            }
                        }}
                    />
                </div>
                <Button className="GraphBuilder-button" onClick={(e) => this.props.onReset(null)}>RESET</Button>
            </div>
        ) 
    }
}

export default GraphBuilder;