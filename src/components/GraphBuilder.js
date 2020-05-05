import React, { Component } from 'react';
import { GraphView } from 'react-digraph';

import '../css/GraphBuilder.css';


const GraphConfig =  {
    NodeTypes: {
        empty: {
            // typeText: "None",
            shapeId: "#empty", // relates to the type property of a node
            shape: (
                <symbol viewBox="0 0 150 150" id="empty" key="0">
                    <circle cx="75" cy="75" r="15" stroke="grey" />
                </symbol>
            )
        },
        startNode: {
            shapeId: "#startNode", // relates to the type property of a node
            shape: (
                <symbol viewBox="0 0 150 150" id="startNode" key="1">
                    <circle cx="75" cy="75" r="15" stroke="orange" strokeWidth="2"/>
                </symbol>
            )
        },
        endNode: {
            shapeId: "#endNode", // relates to the type property of a node
            shape: (
                <symbol viewBox="0 0 150 150" id="endNode" key="2">
                    <circle cx="75" cy="75" r="15" stroke="green" strokeWidth="2"/>
                </symbol>
            )
        },
        currentNode: {
            // typeText: "currentNode",
            shapeId: "#currentNode", // relates to the type property of a node
            shape: (
                <symbol viewBox="0 0 150 150" id="currentNode" key="3">
                    <circle cx="75" cy="75" r="15" stroke="red" strokeWidth="2"/>
                </symbol>
            )
        },
        pathNode: {
            shapeId: "#pathNode", // relates to the type property of a node
            shape: (
                <symbol viewBox="0 0 150 150" id="pathNode" key="4">
                    <circle cx="75" cy="75" r="15" stroke="blue" strokeWidth="2"/>
                </symbol>
            )
        },
        visitedNode: {
            // typeText: "visitedNode",
            shapeId: "#visitedNode", // relates to the type property of a node
            shape: (
                <symbol viewBox="0 0 150 150" id="visitedNode" key="5">
                    <circle cx="75" cy="75" r="15" stroke="yellow" strokeWidth="2"/>
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
            ),
            color: 'black'
        },
        pathEdge: {  // required to show empty edges
            shapeId: "#pathEdge",
            shape: (
                <symbol viewBox="0 0 50 50" id="pathEdge" key="1" />
            ),
            color: 'blue'
        },
        visitedEdge: {  // required to show empty edges
            shapeId: "#visitedEdge",
            shape: (
                <symbol viewBox="0 0 50 50" id="visitedEdge" key="2" />
            ),
            color: '#c9c900'
        },
        currentEdge: {
            shapeId: "#currentEdge",
            shape: (
                <symbol viewBox="0 0 50 50" id="currentEdge" key="3"/>
            ),
            color: 'red'
        }
    }
}

const ARROW_SIZE = 5;

class GraphBuilder extends Component {
    constructor(props){
        super(props);

        this.state = {
            selected: null
        }

        this.moveNode = this.props.moveNode;
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

        layoutEngineType = layoutEngineType ? null : false;

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
                    readOnly
                    onSelectNode={(e) => e === this.state.selected ? this.setState({selected: null}) : this.setState({selected: e})}
                    onCreateNode={() => {}}
                    onUpdateNode={() => {}}
                    onDeleteNode={() => {}}
                    onSelectEdge={() => {}}
                    onCreateEdge={() => {}}
                    onSwapEdge={() => {}}
                    onDeleteEdge={() => {}}
                    canCreateEdge={() => {}}

                    onBackgroundClick={(x, y) => this.moveNode(this.state.selected, {x,y})}

                    layoutEngineType={layoutEngineType}

                    edgeArrowSize={ARROW_SIZE}

                    renderDefs={() => {
                        return Object.entries(EdgeTypes).map((o) => {
                            let k=o[0], v=o[1];

                            return <marker
                                id={`end-arrow-${k}`}
                                key={`end-arrow-${k}`}
                                viewBox={`0 -${ARROW_SIZE / 2} ${ARROW_SIZE} ${ARROW_SIZE}`}
                                refX={`${ARROW_SIZE / 2}`}
                                markerWidth={`${ARROW_SIZE}`}
                                markerHeight={`${ARROW_SIZE}`}
                                orient="auto"
                            >
                                <path
                                    className="arrow"
                                    d={`M0,-${ARROW_SIZE / 2}L${ARROW_SIZE},0L0,${ARROW_SIZE / 2}`}
                                    style={{fill: v.color}}
                                />
                            </marker>
                        })
                    }}

                    renderNodeText={(data, id, isSelected) => {
                        return <text className="node-text" textAnchor="middle" color="white">
                            <tspan x="0" dy="3" fontSize="7px">{data.title}</tspan>
                            <tspan fill="blue" stroke="white" strokeWidth="0.3" fontWeight="bold" x="0" dy="25" fontSize="10px">{'distance' in data ? data.distance < 0 ? '∞' : data.distance : ''}</tspan>
                            <title>{data.title}</title>
                        </text>
                    }}

                    afterRenderEdge={(id, element, edge, edgeContainer, isEdgeSelected) => {
                        edgeContainer.parentNode.insertBefore( edgeContainer, edgeContainer.parentNode.firstChild);
                        
                        var edgeColor = EdgeTypes[edge.type ? edge.type : 'emptyEdge'].color;
                        /***** Setting edge color *****/ 
                        
                        let comp = edgeContainer.querySelector('.edge');
                        if(!comp) return;

                        this.setAttribute(comp, 'style', `stroke: ${edgeColor};  marker-end: url(#end-arrow-${edge.type})`, false);
                        /***** Setting arrow end color *****/ 

                        comp = document.querySelector('.arrow');
                        this.setAttribute(comp, 'style',  `fill: ${edgeColor};`, false);

                        //Because at first there is only one element, but then it would create 2 new elements per render
                        let comp_list = edgeContainer.querySelectorAll('.edge-text');

                        //When edge is moving ".edge-text" elements do not exist
                        if(!comp_list.length) return;

                        comp = comp_list[0]; 

                        /***** Rotating labels according to edge slope *****/ 

                        let {x: x1, y: y1} = element.props.sourceNode;
                        let {x: x2, y: y2} = element.props.targetNode;

                        let x = (x1+x2)/2, y = (y1+y2)/2;

                        let tan = (y2 - y1)/(x2 - x1);
                        let deg = Math.atan(tan)*180/Math.PI;;

                        this.setAttribute(comp, 'style', `fill: ${edgeColor}; stroke: white; stroke-width: 0.5px; font-weight: bold; font-size: ${labelSize}`, false);
                        this.setAttribute(comp, 'transform', `translate(${x}, ${y}) rotate(${deg}) translate(0, -${labelSize})`, false);
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
                        
                    }}
                />
            </div>
        ) 
    }
}

export default GraphBuilder;