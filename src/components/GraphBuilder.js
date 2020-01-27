import React, { Component } from 'react';
import { GraphView } from 'react-digraph';

import '../css/GraphBuilder.css';


const GraphConfig =  {
    NodeTypes: {
        empty: {
            // typeText: "None",
            shapeId: "#empty", // relates to the type property of a node
            shape: (
                <symbol viewBox="0 0 100 100" id="empty" key="0">
                    <circle cx="50" cy="50" r="5" stroke="grey" />
                </symbol>
            )
        },
        start_node: {
            shapeId: "#start_node", // relates to the type property of a node
            shape: (
                <symbol viewBox="0 0 100 100" id="start_node" key="1">
                    <circle cx="50" cy="50" r="5" stroke="orange" strokeWidth="2"/>
                </symbol>
            )
        },
        end_node: {
            shapeId: "#end_node", // relates to the type property of a node
            shape: (
                <symbol viewBox="0 0 100 100" id="end_node" key="2">
                    <circle cx="50" cy="50" r="5" stroke="green" strokeWidth="2"/>
                </symbol>
            )
        },
        path_node: {
            shapeId: "#path_node", // relates to the type property of a node
            shape: (
                <symbol viewBox="0 0 100 100" id="path_node" key="2">
                    <circle cx="50" cy="50" r="5" stroke="yellow" strokeWidth="2"/>
                </symbol>
            )
        },
        visited: {
            // typeText: "visited",
            shapeId: "#visited", // relates to the type property of a node
            shape: (
                <symbol viewBox="0 0 100 100" id="visited" key="3">
                    <circle cx="50" cy="50" r="10" stroke="blue" strokeWidth="2"/>
                </symbol>
            )
        }
    },
    NodeSubtypes: {},
    EdgeTypes: {
        emptyEdge: {  // required to show empty edges
            shapeId: "#emptyEdge",
            shape: (
                <symbol viewBox="0 0 50 50" id="emptyEdge" key="0"/>
            )
        },
        pathEdge: {  // required to show empty edges
            shapeId: "#visitedEdge",
            shape: (
                <symbol viewBox="0 0 50 50" id="visitedEdge" key="1" />
            )
        },
        visitedEdge: {  // required to show empty edges
            shapeId: "#visitedEdge",
            shape: (
                <symbol viewBox="0 0 50 50" id="visitedEdge" key="2" />
            )
        }
    }
}

class GraphBuilder extends Component {
    constructor(props){
        super(props);

        this.state = {
            selected: {},
            engine: false
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

        var { labelSize, nodes, edges, layoutEngineType } = this.props;

        return(
            <div className="GraphBuilder-root">
                <GraphView  ref='GraphView'
                    nodeKey="id"
                    nodes={nodes}
                    edges={edges}
                    selected={this.state.selected}
                    nodeTypes={NodeTypes}
                    nodeSubtypes={NodeSubtypes}
                    edgeTypes={EdgeTypes}
                    // readOnly
                    onSelectNode={() => {}}
                    onCreateNode={() => {}}
                    onUpdateNode={() => {}}
                    onDeleteNode={() => {}}
                    onSelectEdge={() => {}}
                    onCreateEdge={() => {}}
                    onSwapEdge={() => {}}
                    onDeleteEdge={() => {}}

                    layoutEngineType={layoutEngineType}

                    edgeArrowSize={5}

                    renderNodeText={(data, id, isSelected) => {
                        return <text className="node-text" textAnchor="middle">
                            <tspan x="0" dy="18" fontSize="10px">{data.title}</tspan>
                            <tspan fill="red" fontWeight="bold" x="0" dy="15" fontSize="10px">{'distance' in data ? data.distance < 0 ? '∞' : data.distance : ''}</tspan>
                            <title>{data.title}</title>
                        </text>
                    }}

                    afterRenderEdge={(id, element, edge, edgeContainer, isEdgeSelected) => {
                        /***** Setting edge color *****/ 

                        let comp = edgeContainer.querySelector('.edge');
                        this.setAttribute(comp, 'style', 'stroke: black;', false);

                        /***** Setting arrow end color *****/ 

                        comp = document.querySelector('.arrow');
                        this.setAttribute(comp, 'style', 'fill: black;', false);

                        //Because at first there is only one element, but then it would create 2 new elements per render
                        let comp_list = edgeContainer.querySelectorAll('.edge-text');
                        comp = comp_list[0]; 

                        /***** Rotating labels according to edge slope *****/ 

                        let {x: x1, y: y1} = element.props.sourceNode;
                        let {x: x2, y: y2} = element.props.targetNode;

                        let tan = (y2 - y1)/(x2 - x1);
                        let deg = Math.atan(tan)*180/Math.PI;;

                        this.setAttribute(comp, 'style', `fill: black; stroke: white; stroke-width: 0.5px; font-weight: bold; font-size: ${labelSize}`, false);
                        this.setAttribute(comp, 'transform', ` rotate(${deg}) translate(0, -${labelSize})`);
                        comp.innerHTML = edge.flow ? edge.flow : '';

                        /***** Labels for costs and maximum capacity *****/ 
                        
                        if(edge.cost && comp_list.length === 1){
                            let costTag = comp.cloneNode(true);
                            
                            this.setAttribute(costTag, 'transform', ` translate(-${edge.capacity ? labelSize : 0}, ${labelSize*2})`);
                            costTag.id = "cost-tag";
                            costTag.style.fill = 'red';
                            costTag.innerHTML = edge.cost;
                            
                            comp.parentElement.appendChild(costTag);
                        }
                        else if(comp_list[1] && comp_list[1].id === 'cost-tag'){
                                let transform = comp_list[0].getAttribute('transform');
                                this.setAttribute(comp_list[1], 'transform', `${transform} translate(-${edge.capacity ? labelSize : 0}, ${labelSize*2})`, false);
                        }
                        
                        if(edge.capacity && comp_list.length === 1){
                            let capacityTag = comp.cloneNode(true);

                            this.setAttribute(capacityTag, 'transform', ` translate(${edge.cost ? labelSize : 0}, ${labelSize*2})`);
                            capacityTag.id = "capacity-tag";
                            capacityTag.style.fill = 'blue';
                            capacityTag.innerHTML = edge.capacity;
                            
                            comp.parentElement.appendChild(capacityTag);
                        }
                        else {
                            let transform = comp_list[0].getAttribute('transform');
                            if(comp_list[1] && comp_list[1].id === 'capacity-tag'){
                                this.setAttribute(comp_list[1], 'transform', `${transform} translate(${edge.cost ? labelSize : 0}, ${labelSize*2})`, false);
                            }
                            else if(comp_list[2] && comp_list[2].id === 'capacity-tag'){
                                this.setAttribute(comp_list[2], 'transform', `${transform} translate(${edge.cost ? labelSize : 0}, ${labelSize*2})`, false);
                            }
                        }

                        console.log('After')
                    }}
                />
            </div>
        ) 
    }
}

export default GraphBuilder;