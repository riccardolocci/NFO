import React, { Component } from 'react';
import { GraphView } from 'react-digraph';

import '../css/GraphBuilder.css';


const ARROW_SIZE = 5;

class GraphBuilder extends Component {
    constructor(props){
        super(props);

        this.state = {
            selected: null,
            renderedEdges: 0
        }

        this.moveNode = this.props.moveNode;
    }

    componentDidUpdate(prevProps){
        if(prevProps.layoutEngineType !== this.props.layoutEngineType){
            this.setState({renderedNodes: 0, renderedEdges: 0});
        }
    }

    setAttribute(c, aName, aValue, concat=true){
        var attr = concat ? c.getAttribute(aName) : document.createAttribute(aName);
        c.setAttribute(aName,  attr && concat ? attr + aValue : aValue);
    }
  
    render() {
        const { colors, edges, labelSize, layoutEngineType, nodes, onRenderComplete } = this.props;
        const { renderedEdges, selected } = this.state;
        
        const GraphConfig =  {
            NodeTypes: {
                currentNode: {
                    shapeId: "#currentNode",
                    shape: (
                        <symbol viewBox="0 0 150 150" id="currentNode" key="3">
                            <circle cx="75" cy="75" r="15" stroke={colors.current} strokeWidth="2"/>
                        </symbol>
                    )
                },
                empty: {
                    shapeId: "#empty",
                    shape: (
                        <symbol viewBox="0 0 150 150" id="empty" key="0">
                            <circle cx="75" cy="75" r="15" stroke={colors.empty}  />
                        </symbol>
                    )
                },
                endNode: {
                    shapeId: "#endNode",
                    shape: (
                        <symbol viewBox="0 0 150 150" id="endNode" key="2">
                            <circle cx="75" cy="75" r="15" stroke={colors.end} strokeWidth="2"/>
                        </symbol>
                    )
                },
                markedNode: {
                    shapeId: "#markedNode",
                    shape: (
                        <symbol viewBox="0 0 150 150" id="markedNode" key="6">
                            <circle cx="75" cy="75" r="15" stroke={colors.marked} strokeWidth="2"/>
                        </symbol>
                    )
                },
                pathNode: {
                    shapeId: "#pathNode",
                    shape: (
                        <symbol viewBox="0 0 150 150" id="pathNode" key="4">
                            <circle cx="75" cy="75" r="15" stroke={colors.path} strokeWidth="2"/>
                        </symbol>
                    )
                },
                startNode: {
                    shapeId: "#startNode",
                    shape: (
                        <symbol viewBox="0 0 150 150" id="startNode" key="1">
                            <circle cx="75" cy="75" r="15" stroke={colors.start} strokeWidth="2"/>
                        </symbol>
                    )
                },
                visitedNode: {
                    shapeId: "#visitedNode",
                    shape: (
                        <symbol viewBox="0 0 150 150" id="visitedNode" key="5">
                            <circle cx="75" cy="75" r="15" stroke={colors.visited} strokeWidth="2"/>
                        </symbol>
                    )
                }
            },
            NodeSubtypes: {},
            EdgeTypes: {
                currentEdge: {
                    shapeId: "#currentEdge",
                    shape: (
                        <symbol viewBox="0 0 50 50" id="currentEdge" key="3"/>
                    ),
                    color: colors.current
                },
                emptyEdge: {  // required to show empty edges
                    shapeId: "#emptyEdge",
                    shape: (
                        <symbol viewBox="0 0 50 50" id="emptyEdge"  key="0"/>
                    ),
                    color: colors['not visited']
                },
                pathEdge: {
                    shapeId: "#pathEdge",
                    shape: (
                        <symbol viewBox="0 0 50 50" id="pathEdge" key="1" />
                    ),
                    color: colors.path
                },
                visitedEdge: {
                    shapeId: "#visitedEdge",
                    shape: (
                        <symbol viewBox="0 0 50 50" id="visitedEdge" key="2" />
                    ),
                    color: colors.visited
                }
            }
        }

        const NodeTypes = GraphConfig.NodeTypes;
        const NodeSubtypes = GraphConfig.NodeSubtypes;
        const EdgeTypes = GraphConfig.EdgeTypes;

        return(
            <div className="GraphBuilder-root">
                <GraphView  ref='GraphView'
                    nodeKey="id"
                    nodes={nodes}
                    edges={edges}
                    selected={selected}
                    nodeTypes={NodeTypes}
                    nodeSubtypes={NodeSubtypes}
                    edgeTypes={EdgeTypes}
                    readOnly
                    onSelectNode={(e) => e === selected ? this.setState({selected: null}) : this.setState({selected: e})}
                    onCreateNode={() => {}}
                    onUpdateNode={() => {}}
                    onDeleteNode={() => {}}
                    onSelectEdge={() => {}}
                    onCreateEdge={() => {}}
                    onSwapEdge={() => {}}
                    onDeleteEdge={() => {}}
                    canCreateEdge={() => {}}

                    onBackgroundClick={(x, y) => this.moveNode(selected, {x,y})}

                    layoutEngineType={layoutEngineType ? null : false}

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

                        this.setState({ renderedEdges: this.state.renderedEdges+1});
                        if(renderedEdges + 1 === edges.length) onRenderComplete();
                    }}
                />
            </div>
        ) 
    }
}

export default GraphBuilder;