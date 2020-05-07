import React, { Component } from 'react';
import Dropzone from './Dropzone';
import ExamplesManager from './ExamplesManager';
import GraphBuilder from './GraphBuilder';
import { Button, ButtonGroup, FormControlLabel, MenuItem, OutlinedInput, Paper, Switch, TextField } from '@material-ui/core';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@material-ui/icons';
import { SketchPicker } from 'react-color';


import '../css/SPP.css'

// var d3 = require('d3-force');

const PATH_SEPARATOR = ' → '

class SPP extends Component {
    constructor(props){
        super(props)
        this.state = {
            colorPicker: '',
            colors: {
                current: 'red',
                'not visited': 'black',
                end: 'green',
                path: 'blue',
                start: 'orange',
                visited: '#c9c900'
            },
            disableNext: true,
            endIndex: false,
            endNode: '',
            finished: false,
            indexes: {},
            message: '',
            nextSteps: [],
            selectedPath: '',
            startNode: '',
            stateIndex: 0,
            states: [],
            targetAll: true
        }
    }

    getFile = (file) => {
        var indexes = {};

        file.nodes.sort((a,b) => a.id - b.id)

        for(let [i, el] of file.nodes.entries()){
            indexes[el.id] = i;
        }

        var { states } = this.state;
        states.push({phase: 0, step: 0, substep: 0, currentNode: null, file});

        this.setState({ states, indexes });
    }

    onReset = () => this.setState({
        colorPicker: '',
        colors: {
            current: 'red',
            'not visited': 'black',
            end: 'green',
            path: 'blue',
            start: 'orange',
            visited: '#c9c900'
        },
        disableNext: true,
        endIndex: false,
        endNode: '',
        finished: false,
        indexes: {},
        message: '',
        nextSteps: [],
        selectedPath: '',
        startNode: '',
        stateIndex: 0,
        states: [],
        targetAll: true
    });

    onChange = (key) => (e) => {
        var { endNode, engine, startNode, stateIndex, states, targetAll } = this.state;

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
            disableNext: !(e.target.value && (key === 'startNode' ? targetAll || endNode : startNode)),
            finished: false,
            [key]: e.target.value,
            selectedPath: '',
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
        let { engine, finished, states, stateIndex } = this.state;

        if(states[++stateIndex]){
            let disableNext = !(stateIndex + 1 < states.length);

            this.setState({ stateIndex, engine: !engine, disableNext: finished && disableNext });
            return;
        }
        
        this.launchAlgorithm();
    }

    prevStep = () => {
        let { engine, stateIndex, states } = this.state;

        stateIndex--;
        
        this.setState({ stateIndex, engine: !engine, disableNext: !(stateIndex < states.length)});
    }

    launchAlgorithm(name = 'dijkstra'){
        var { disableNext, endNode, engine, finished, indexes, nextSteps, states, stateIndex, startNode, targetAll } = this.state;

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

                        if(targetAll){
                            disableNext = true;
                            finished = true;
                        }
                        else{
                            currentNode = endNode;
                            nodes[indexes[currentNode]].prevType = nodes[indexes[currentNode]].type;
                            nodes[indexes[currentNode]].type = 'currentNode';
                        
                            newState = JSON.parse(JSON.stringify(states[stateIndex]));
                            newState.phase++;
                            newState.step = 0;
                            newState.substep = 0;
                        }
                    }
                    else{
                        nodes[indexes[currentNode]].prevType = nodes[indexes[currentNode]].type;
                        nodes[indexes[currentNode]].type = 'currentNode';
                        
                        newState = JSON.parse(JSON.stringify(states[stateIndex]));
                        newState.substep = 0;
                        newState.step++;
                    }

                    if(newState) {
                        newState.currentNode = currentNode;
                        states.push(newState);
                    }
                    
                }

                if(!finished) stateIndex++;

                this.setState({ disableNext, engine: !engine, finished, nextSteps, states, stateIndex });
                break;
            case 2:
                {
                    currentNode = algorithm.postprocess(edges, nodes[indexes[currentNode]]);
                    nodes[indexes[currentNode]].prevType = nodes[indexes[currentNode]].type;
                    nodes[indexes[currentNode]].type = 'currentNode';

                    disableNext = currentNode === startNode;

                    let newState = JSON.parse(JSON.stringify(states[stateIndex]));
                    newState.step++;
                    
                    stateIndex++;

                    if(!disableNext){        
                        newState.currentNode = currentNode;
                        states.push(newState);
                        
                        this.setState({ engine: !engine, stateIndex, states });
                    }
                    else{
                        newState.file.nodes[indexes[currentNode]].type = newState.file.nodes[indexes[currentNode]].prevType;
                        delete newState.file.nodes[indexes[currentNode]].prevType;

                        newState.currentNode = null;
                        states.push(newState);
                        this.setState({ disableNext, endIndex: stateIndex, engine: !engine, finished: true, states });
                    }
                }

                break;
            default:
                break;
        }
    }

    targetAll = (e, value) => {
        const { endNode, startNode, states } = this.state;
        this.setState({ disableNext: value ? !startNode : !(endNode && startNode), endNode: '', finished: false, selectedPath: '', stateIndex: 0, states: [states[0]], targetAll: value });
    }

    getPaths = (file) => {
        if(!file) return {}

        const {indexes} = this.state;
        
        let paths = {}
        for(let node of file.nodes){
            if(node.pred){
                paths[node.id] = [node.id]

                let tmp_pred = node.pred;
                while(tmp_pred){
                    if(paths[tmp_pred]){
                        paths[node.id].unshift(...paths[tmp_pred]);
                        break;
                    }
                    else{
                        paths[node.id].unshift(tmp_pred);
                    }

                    tmp_pred = file.nodes[indexes[tmp_pred]].pred;
                }
            }
        }

        return paths;
    }

    togglePath = (selectedPath, path, prevPath) => {
        const { engine, finished, indexes, startNode, stateIndex, states } = this.state;

        if(!path || (stateIndex <= states.length - 1 && !finished) || (stateIndex < states.length - 1 && finished)) return;

        let { nodes, edges } = states[stateIndex].file;

        for(let i in prevPath){
            i = parseInt(i);
            let node = prevPath[i];
            let this_node = nodes[indexes[node]];

            this_node.type = this_node.prevType;
            delete this_node.prevType;

            if(i < prevPath.length - 1)
                for(let edge of edges){
                    if(edge.source === node && edge.target === prevPath[i+1]){
                        edge.type = edge.prevType;
                        delete edge.prevType;
                        break;
                    }
                }
        }

        if(this.state.selectedPath === selectedPath){
            selectedPath = '';
        }
        else {
            for(let i in path){
                i = parseInt(i);
                let node = path[i];
                let this_node = nodes[indexes[node]];
                
                this_node.prevType = this_node.type;
                switch(node){
                    case startNode:
                        this_node.type = 'startNode';
                        break;
                    case selectedPath:
                        this_node.type = 'endNode';
                        break;
                    default:
                        this_node.type = 'pathNode';
                        break;
                }

                if(i < path.length - 1)
                    for(let edge of edges){
                        if(edge.source === node && edge.target === path[i+1]){
                            edge.prevType = edge.type;
                            edge.type = 'pathEdge'
                            break;
                        }
                    }
            }
        }

        this.setState({ engine: !engine, selectedPath, states });
    }

    setColor = k => v => { let { colors, engine } = this.state; colors[k] = v.hex;  this.setState({ colors, engine: !engine }); }

    showPicker = (prev, next) => this.setState({colorPicker: prev===next ? '' : next})

    render() {
        const { colorPicker, colors, disableNext, finished, states, stateIndex, message, engine, selectedPath, startNode, endNode, targetAll} = this.state;
        const file = states[stateIndex] ? states[stateIndex].file : null;

        const shortestPaths = this.getPaths(file);
        
        return (
            <div className="SPP-root">
                <h2>SHORTEST PATH PROBLEM</h2>
                <div className={file ? "SPP-dropClosed" : "SPP-drop"}>
                    <Dropzone
                        getFile={this.getFile}
                        hide={file}
                        showMessage={this.showMessage}
                        validationMode="SPP"
                    />
                </div>

                <div className={file ? "SPP-dropClosed" : "SPP-drop"}>
                    <ExamplesManager getFile={this.getFile} />
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
                        colors={colors}
                        edges={file.edges}
                        labelSize = {13}
                        layoutEngineType={engine}
                        moveNode={this.moveNode}
                        nodes={file.nodes}
                        onSelectNode={this.moveNode}
                    />
                    
                    <div className="SPP-spacer">
                        <Button className="SPP-button" onClick={() => this.onReset()}>RESET</Button>

                        {Object.keys(colors).map(k => {
                            const v = colors[k]

                            return (
                                <div key={k} className={colorPicker===k ? "SPP-legendPicked" : "SPP-legend"} onClick={() => this.showPicker(colorPicker, k)}>
                                    <div style={{backgroundColor: v}} className="SPP-legendColor"/>
                                    <p className="SPP-legendKey">{k}</p>
                                    {colorPicker===k && <SketchPicker className='SPP-colorPicker' color={v} onChangeComplete={this.setColor(k)}/>}
                                </div>
                            )
                        })}

                        <ButtonGroup className="SPP-buttonRight">
                            <Button onClick={() => this.prevStep()} disabled={stateIndex === 0}>
                                <KeyboardArrowLeft/>
                            </Button>

                            <Button onClick={() => this.nextStep()} disabled={disableNext}>
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
                            disabled={targetAll}
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

                        <FormControlLabel
                            className="SPP-switch"
                            control={<Switch size="small" checked={targetAll} color="primary" onChange={this.targetAll} />}
                            label="Target all"
                        />
                    </div>

                    <div className="SPP-infoBox">
                        <h3>Info</h3>
                        <table>
                            <tbody>
                                 <tr><td>Phase:</td><td>{states[stateIndex].phase}</td></tr>
                                <tr><td>Step:</td><td>{states[stateIndex].step}</td></tr>
                                <tr><td>Substep:</td><td>{states[stateIndex].substep}</td></tr>
                            </tbody>
                               
                        </table>
                    </div>
                    <div className="SPP-infoBox">
                        <h3>Paths</h3>
                        <table className="SPP-paths">
                            <thead>
                                <tr>
                                    <td><strong>Node</strong></td>
                                    <td><strong>Shortest Path</strong>
                                    </td><td><strong>Path Cost</strong></td>
                                </tr>
                            </thead>
                            <tbody>
                                {file.nodes.map(e => (
                                    <tr key={e.id} className={e.id === startNode ? 'SPP-sourceRow SPP-unselectableRow' : stateIndex === states.length - 1 ? e.id === selectedPath ? 'SPP-selectedRow SPP-selectableRow' : shortestPaths[e.id] ? 'SPP-selectableRow' : 'SPP-unselectableRow' : 'SPP-unselectableRow'} onClick={() => this.togglePath(e.id, shortestPaths[e.id], shortestPaths[selectedPath])}>
                                        <td style={{width: '15%'}}>{e.id}</td>
                                        <td style={{width: '70%'}}>{e.id === startNode ? 'Source' : stateIndex === states.length - 1 && finished ? shortestPaths[e.id] ? shortestPaths[e.id].join(PATH_SEPARATOR) : 'No path found' : shortestPaths[e.id] ? shortestPaths[e.id].join(PATH_SEPARATOR)  : ''}</td>
                                        <td style={{width: '15%'}}>{stateIndex === states.length - 1 && finished ? e.distance >= 0 ? e.distance : '∞' : e.distance >= 0 ? e.distance : ''}</td>
                                    </tr>
                                ))}
                            </tbody>
                               
                        </table>
                    </div>
                </div>}
            </div>
        )
    }
}
export default SPP;