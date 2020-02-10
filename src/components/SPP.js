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
            message: '',
            startNode: '',
            endNode: '',
            indexes: {},
            nextSteps: [],
            endIndex: false,
            stateIndex: 0,
            states: []
        }
    }

    getFile = (file) => {
        var indexes = {};

        for(let [i, el] of file.nodes.entries()){
            indexes[el.id] = i;
        }

        var { states } = this.state;
        states.push({phase: 0, step: 0, substep: 0, currentNode: null, file});

        this.setState({ states, indexes });
    }

    onReset = () => this.setState({states: [], indexes: {}, stateIndex: 0, startNode: '', endNode: '', endIndex: false, nextSteps: []});

    onChange = (key) => (e) => {
        var { states, engine, stateIndex } = this.state;

        states.splice(1, states.length - 1);
        stateIndex = 0;

        for(let n of states[stateIndex].file.nodes){
            if(n.id === e.target.value){
                n.type = key
            }
            else if(n.type === key) n.type = 'empty';
        }

        for(let n of states[stateIndex].file.edges) n.type = 'emptyEdge';
        states[stateIndex].currentNode = null

        this.setState({
            [key]: e.target.value,
            states,
            stateIndex,
            engine: !engine, 
            nextSteps: [], 
            endIndex: false
        })
    }

    showMessage = (message) => {
        this.setState({ message });
        message = '';
        setTimeout(() => this.setState({ message }), 5000);
    }

    moveNode = (n, e) => {
        if(!n) return;
        
        var { states, indexes } = this.state;

        var i = indexes[n.id]; 

        for(let s of states){
            s.file.nodes[i].x = e.x;
            s.file.nodes[i].y = e.y;
        }
    }

    updateNode(nodes, pred, i, dist){
        let el = nodes[i];

        if(el.type === 'empty') el.type = 'visitedNode';
        
        /******* If distance < 0, node was never explored *******/
        if(el.distance < 0 || el.distance > dist){
            el.distance = dist;
            el.pred = pred;
        }
    }

    nextStep = () => {
        let { states, stateIndex, engine } = this.state;

        if(states[++stateIndex]){
            this.setState({ stateIndex, engine: !engine});
        }
        else{
            this.launchAlgorithm();
        }
    }

    prevStep = () => {
        let { stateIndex, engine } = this.state;

        stateIndex--;
        
        this.setState({ stateIndex, engine: !engine });
    }

    launchAlgorithm(name = 'dijkstra'){
        var { states, stateIndex, startNode, endNode, engine, indexes, nextSteps} = this.state;

        var {file: {nodes, edges}, currentNode, phase, step, substep} = states[stateIndex];

        var algorithm = require(`../algorithms/${name}`);

        switch(phase){
            case 0:
                {
                    let newState = JSON.parse(JSON.stringify(states[stateIndex]));

                    /******* POTENTIALLY AMBIGUOUS *******/
                    let {file: {nodes, edges}} = newState;

                    currentNode = startNode;
                    nodes[indexes[currentNode]].prevType = nodes[indexes[currentNode]].type
                    nodes[indexes[currentNode]].type = 'currentNode';

                    algorithm.preprocess(nodes, edges, currentNode);

                    newState.currentNode = currentNode;
                    newState.phase++;
                    states.push(newState);

                    stateIndex++;

                    this.setState({ states, stateIndex, engine: !engine });
                }
                break;
            case 1:
                if(step === 0 && substep === 0){
                    for(let [i, el] of edges.entries()){
                        let node =  nodes[indexes[el.source]];
                        
                        if(!node.leavingStar) node.leavingStar = [];

                        node.leavingStar.push(i);
                    }
                }
                
                if(nodes[indexes[currentNode]].leavingStar && substep < nodes[indexes[currentNode]].leavingStar.length){
                    if(substep > 0){
                        let idx = nodes[indexes[currentNode]].leavingStar[substep-1]
                        edges[idx].type = edges[idx].prevType;
                        delete edges[idx].prevType;
                    }
                    
                    let idx = nodes[indexes[currentNode]].leavingStar[substep]

                    algorithm.process(nodes, edges[idx], currentNode, endNode, nextSteps, indexes, this.updateNode);

                    edges[idx].prevType = edges[idx].type;
                    edges[idx].type = 'currentEdge';

                    let newState = JSON.parse(JSON.stringify(states[stateIndex]));

                    newState.substep++;
                    states.push(newState);
                }
                else{
                    if(substep > 0){
                        let idx = nodes[indexes[currentNode]].leavingStar[substep-1]
                        edges[idx].type = edges[idx].prevType;
                        delete edges[idx].prevType;
                    }

                    nodes[indexes[currentNode]].type = nodes[indexes[currentNode]].prevType;
                    delete nodes[indexes[currentNode]].prevType;

                    currentNode = nextSteps[step];

                    let newState = null;

                    if(!currentNode){
                        phase++;
                        step = 0;

                        currentNode = endNode;
                        nodes[indexes[currentNode]].prevType = nodes[indexes[currentNode]].type;
                        nodes[indexes[currentNode]].type = 'currentNode';
                        
                        newState = JSON.parse(JSON.stringify(states[stateIndex]));
                        newState.phase++;
                        newState.step = 0;
                        newState.substep = 0;
                    }
                    else{
                        nodes[indexes[currentNode]].prevType = nodes[indexes[currentNode]].type;
                        nodes[indexes[currentNode]].type = 'currentNode';
                        
                        newState = JSON.parse(JSON.stringify(states[stateIndex]));
                        newState.substep = 0;
                        newState.step++;
                    }

                    newState.currentNode = currentNode;

                    states.push(newState);
                }

                stateIndex++;

                this.setState({ states, stateIndex, nextSteps, engine: !engine });
                break;
            case 2:
                currentNode = algorithm.postprocess(edges, nodes[indexes[currentNode]]);
                nodes[indexes[currentNode]].prevType = nodes[indexes[currentNode]].type;
                nodes[indexes[currentNode]].type = 'currentNode';

                let disableNext = currentNode === startNode;

                let newState = JSON.parse(JSON.stringify(states[stateIndex]))
                newState.step++;
                
                stateIndex++;

                if(!disableNext){        
                    newState.currentNode = currentNode;
                    states.push(newState);
                    
                    this.setState({  states, stateIndex, engine: !engine});
                }
                else{
                    newState.file.nodes[indexes[currentNode]].type = newState.file.nodes[indexes[currentNode]].prevType;
                    delete newState.file.nodes[indexes[currentNode]].prevType;

                    newState.currentNode = null;
                    states.push(newState);
                    this.setState({  states, engine: !engine, endIndex: stateIndex });
                }

                break;
            default:
                break;
        }
    }

    render() {
        const { states, stateIndex, message, engine, startNode, endNode, endIndex} = this.state;
        const file = states[stateIndex] ? states[stateIndex].file : null;
        
        return (
            <div className="SPP-root">
                <div><h1>SPP</h1></div>
                <div className={file ? "SPP-dropClosed" : "SPP-drop"}>
                    <Dropzone
                        getFile={this.getFile}
                        hide={file}
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
                        <Button className="SPP-button" onClick={() => this.onReset()}>RESET</Button>

                        <ButtonGroup className="SPP-buttonRight">
                            <Button onClick={() => this.prevStep()} disabled={stateIndex === 0}>
                                <KeyboardArrowLeft/>
                            </Button>

                            <Button onClick={() => this.nextStep()} disabled={!startNode || !endNode || stateIndex === endIndex}>
                                <KeyboardArrowRight/>
                            </Button>
                        </ButtonGroup>
                    </div>
                    
                    <div className="SPP-spacer">
                        <TextField
                            select
                            className="SPP-select"
                            label="Start Node"
                            value={startNode}
                            onChange={this.onChange('startNode')}
                            margin="normal"
                            input={<OutlinedInput/>}
                        >
                            <MenuItem key={'empty'} value='' />
                            {file.nodes.map(e => (
                                <MenuItem key={e.id} value={e.id}>{e.title}</MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            select
                            className="SPP-select"
                            label="End Node"
                            value={endNode}
                            onChange={this.onChange('endNode')}
                            margin="normal"
                            input={<OutlinedInput/>}
                        >
                            <MenuItem key={'empty'} value='' />
                            {file.nodes.map(e => (
                                <MenuItem key={e.id} value={e.id}>{e.title}</MenuItem>
                            ))}
                        </TextField>

                        <Button disabled={!startNode || !endNode} className="SPP-button" onClick={() => this.launchAlgorithm()}>
                            <PlayArrow/>
                        </Button>
                    </div>
                    <div className="SPP-infoBox">
                        <h1>Info</h1>
                        <table>
                            <tr><td>Phase:</td><td>{states[stateIndex].phase}</td></tr>
                            <tr><td>Step:</td><td>{states[stateIndex].step}</td></tr>
                            <tr><td>Substep:</td><td>{states[stateIndex].substep}</td></tr>
                        </table>
                    </div>
                </div>}
            </div>
        )
    }
}
export default SPP;