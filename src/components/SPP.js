import React, { Component } from 'react';
import Dropzone from './Dropzone';
import GraphBuilder from './GraphBuilder';
import { Button, ButtonGroup, MenuItem, OutlinedInput, Paper, TextField } from '@material-ui/core';
import { PlayArrow, KeyboardArrowLeft, KeyboardArrowRight } from '@material-ui/icons';

import '../css/SPP.css'

// var d3 = require('d3-force');

class SPP extends Component {
    constructor(props){
        super(props)
        this.state = {
            file: {"nodes":[{"id":1,"title":"Node A","x":261.3662526072377,"y":380.4085763646997,"type":"empty"},{"id":2,"title":"Node B","x":48.797954180041046,"y":495.6765459517936,"type":"empty"},{"id":3,"title":"Node C","x":530.6759939811406,"y":471.05519601885425,"type":"empty"},{"id":4,"title":"Node D","x":46.537057671810174,"y":419.07888034272423,"type":"empty"}],"edges":[{"source":1,"target":2,"type":"emptyEdge","handleText":"."},{"source":2,"target":4,"type":"emptyEdge","handleText":"."},{"source":4,"target":3,"type":"emptyEdge","handleText":"."}]},
            message: '',
            currentNode: '',
            startNode: '',
            endNode: '',
            indexes: {1: 0, 2: 1, 3:2, 4:3},
            phase: 0,
            step: 0,
            substep: 0,
            nextSteps: [],
            disableNext: false,
            disablePrev: true,
            phases: [{
                name: 'Initialization'
            },{
                name: 'Processing'
            },{
                name: 'Conclusion'
            }]
        }
    }

    getFile = (file) => {
        var indexes = {};

        for(let [i, el] of file.nodes.entries()){
            indexes[el.id] = i;
        }

        this.setState({ file, indexes });
    }

    onChange = (key) => (e) => {
        var { file, engine } = this.state;

        for(let n of file.nodes){
            if(n.id === e.target.value.id){
                n.type = key
            }
            else if(n.type === key) n.type = 'empty';
        }

        this.setState({
            [key]: e.target.value,
            file,
            engine: !engine, 
            currentNode: '',
            phase: 0, 
            step: 0, 
            substep: 0, 
            nextSteps: [], 
            disableNext: false, 
            disablePrev: true
        })
    }

    showMessage = (message) => {
        this.setState({ message });
        message = '';
        setTimeout(() => this.setState({ message }), 5000);
    }

    moveNode = (n, e) => {
        if(!n) return;
        
        var { file, indexes } = this.state;

        var i = indexes[n.id]; 

        file.nodes[i].x = e.x;
        file.nodes[i].y = e.y;
    }

    updateNode(nodes, pred, i, dist){
        let el = nodes[i];

        if(el.type === 'empty') el.type = 'visitedNode';
        
        // If distance < 0, node was never explored
        if(el.distance < 0 || el.distance > dist){
            el.distance = dist;
            el.pred = pred;
        }
    }

    launchAlgorithm(name = 'dijkstra'){
        var { file: { nodes, edges }, currentNode, startNode, endNode, engine, indexes, nextSteps, phase, step, substep, disableNext } = this.state;

        var algorithm = require(`../algorithms/${name}`);

        switch(phase){
            case 0:
                currentNode = startNode;
                currentNode.prevType = currentNode.type;
                currentNode.type = 'currentNode';

                algorithm.preprocess(nodes, edges, currentNode);
                phase++;
                this.setState({ file:{nodes, edges}, phase, currentNode, engine: !engine });
                break;
            case 1:
                if(step === 0 && substep === 0){
                    for(let [i, el] of edges.entries()){
                        let node =  nodes[indexes[el.source]];
                        
                        if(!node.leavingStar) node.leavingStar = [];

                        node.leavingStar.push(i);
                    }
                }
                
                if(substep < currentNode.leavingStar.length){
                    if(substep > 0){
                        let idx = currentNode.leavingStar[substep-1]
                        edges[idx].type = edges[idx].prevType;
                        delete edges[idx].prevType;
                    }
                    
                    let idx = currentNode.leavingStar[substep]

                    algorithm.process(nodes, edges[idx], currentNode, endNode, nextSteps, indexes, this.updateNode);
                    
                    edges[idx].prevType = edges[idx].type;
                    edges[idx].type = 'currentEdge';

                    substep++;
                }
                else{
                    if(substep > 0){
                        let idx = currentNode.leavingStar[substep-1]
                        edges[idx].type = edges[idx].prevType;
                        delete edges[idx].prevType;
                    }

                    currentNode.type = currentNode.prevType;
                    delete currentNode.prevType;
                    
                    currentNode = nextSteps[step++];
                    substep = 0;
                    
                    if(!currentNode){
                        phase++;
                        step = 0;

                        currentNode = endNode;
                        currentNode.prevType = currentNode.type;
                        currentNode.type = 'currentNode';
                    }
                    else{
                        currentNode.prevType = currentNode.type;
                        currentNode.type = 'currentNode';
                    }
                }

                this.setState({ file:{nodes, edges}, currentNode, nextSteps, phase, step, substep, engine: !engine });
                break;
            case 2:
                currentNode = algorithm.postprocess(nodes, edges, currentNode, indexes);
                currentNode.prevType = currentNode.type;
                currentNode.type = 'currentNode';

                disableNext = currentNode.id === startNode.id;

                this.setState({ file:{nodes, edges}, currentNode, phase, step, engine: !engine, disableNext });
                break;
            default:
                break;
        }
    }

    render() {
        const { file, message, engine, startNode, endNode, disableNext, disablePrev } = this.state;
        
        return (
            <div className="SPP-root">
                <div><h1>SPP</h1></div>
                <div className={this.state.file ? "SPP-dropClosed" : "SPP-drop"}>
                    <Dropzone
                        getFile={this.getFile}
                        hide={this.state.file}
                        showMessage={this.showMessage}
                        validationMode="SPP"
                    />
                </div>
                
                {!file && <div className="SPP-spacer">
                    <Paper className="SPP-paper">
                        <div className={message ? "SPP-paperDiv" : "SPP-paperDivHide"}>
                            {message}
                        </div>
                    </Paper>
                </div>}
                
                {file && <div className="SPP-graph">
                    <GraphBuilder
                        labelSize = {13}
                        nodes={file.nodes}
                        edges={file.edges}
                        layoutEngineType={engine}
                        onSelectNode={this.moveNode}
                        moveNode={this.moveNode}
                    />
                    
                    <div className="SPP-spacer">
                        <Button className="SPP-button" onClick={(e) => this.setState({file: null, currentNode: '', startNode: '', endNode: '', phase: 0, step: 0, substep: 0, nextSteps: [], disableNext: false, disablePrev: true})}>RESET</Button>

                        <ButtonGroup className="SPP-buttonRight">
                            <Button onClick={() => {}} disabled={disablePrev}>
                                <KeyboardArrowLeft/>
                            </Button>

                            <Button onClick={() => this.launchAlgorithm()} disabled={disableNext}>
                                <KeyboardArrowRight/>
                            </Button>
                        </ButtonGroup>
                    </div>
                    
                    <div className="SPP-spacer">
                        <TextField
                            select
                            className="SPP-select"
                            label="Start Node"
                            value={this.state.startNode}
                            onChange={this.onChange('startNode')}
                            margin="normal"
                            input={<OutlinedInput/>}
                        >
                            <MenuItem key={'empty'} value='' />
                            {file.nodes.map(e => (
                                <MenuItem key={e.id} value={e}>{e.title}</MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            select
                            className="SPP-select"
                            label="End Node"
                            value={this.state.endNode}
                            onChange={this.onChange('endNode')}
                            margin="normal"
                            input={<OutlinedInput/>}
                        >
                            <MenuItem key={'empty'} value='' />
                            {file.nodes.map(e => (
                                <MenuItem key={e.id} value={e}>{e.title}</MenuItem>
                            ))}
                        </TextField>

                        <Button disabled={!startNode || !endNode} className="SPP-button" onClick={() => this.launchAlgorithm()}>
                            <PlayArrow/>
                        </Button>
                    </div>
                </div>}
            </div>
        )
    }
}
export default SPP;