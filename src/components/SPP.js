import React, { Component } from 'react';
import Dropzone from './Dropzone';
import ExamplesManager from './ExamplesManager';
import RandomManager from './RandomManager';
import GraphBuilder from './GraphBuilder';
import { Button, ButtonGroup, CircularProgress, FormControlLabel, MenuItem, Paper, Switch, TextField } from '@material-ui/core';
import { KeyboardArrowLeft, KeyboardArrowRight, GetApp } from '@material-ui/icons';
import { SketchPicker } from 'react-color';


import '../css/SPP.css'
import InfoBox from './InfoBox';

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
            loading: false,
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
        this.setState({loading: true});

        var indexes = {};

        file.nodes.sort((a,b) => a.id - b.id)

        for(let [i, el] of file.nodes.entries()){
            indexes[el.id] = i;
        }

        for(let [i, el] of file.edges.entries()){
            let node =  file.nodes[indexes[el.source]];
            
            if(!node.leavingStar) node.leavingStar = [];

            node.leavingStar.push(i);
        }

        var { states } = this.state;
        states.push({phase: 0, step: 0, substep: 0, currentNode: null, file});

        this.setState({ states, indexes, loading: false });
    }

    onReset = (clear=false) => this.setState({
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
        engine: !this.state.engine,
        finished: false,
        indexes: clear ? {} : this.state.indexes,
        message: '',
        nextSteps: [],
        selectedPath: '',
        startNode: '',
        stateIndex: 0,
        states: clear ? [] : function(state){
            let { indexes, startNode, states } = state;
            states.length = 1;
            if(startNode) states[0].file.nodes[indexes[startNode]].type = 'empty'
            states[0].info = []
            return states
        }(this.state),
        targetAll: true
    });

    onChange = (key) => (e) => {
        var { endNode, engine, indexes, startNode, stateIndex, states, targetAll } = this.state;

        let { nodes } = states[stateIndex].file;

        const { value } = e.target;

        states.splice(1, states.length - 1);
        stateIndex = 0;

        for(let n of states[stateIndex].file.nodes){
            if(n.id === value){
                n.type = key
            }
            else if(n.type === key) n.type = 'empty';
        }

        for(let n of states[stateIndex].file.edges) n.type = 'emptyEdge';
        states[stateIndex].currentNode = null

        if(!states[stateIndex].info) states[stateIndex].info = ['', '']

        if(value && key === 'startNode')  states[stateIndex].info[0] = `Setting node ${nodes[indexes[value]].title} as starting node`
        if(value && key === 'endNode')  states[stateIndex].info[1] = `Setting node ${nodes[indexes[value]].title} as ending node`
        if(targetAll) states[stateIndex].info[1] = `All the other nodes will be targeted`

        this.setState({
            disableNext: !(value && (key === 'startNode' ? targetAll || endNode : startNode)),
            finished: false,
            [key]: value,
            selectedPath: '',
            states,
            stateIndex,
            engine: !engine, 
            nextSteps: [], 
            endIndex: false
        })
    }

    onDownload = () => {
        const { states } = this.state;
        const { nodes, edges } = states[0].file;

        let fileNodes = nodes.map((n) => { return {id: n.id, title: n.title}});
        let fileEdges = edges.map((n) => { return {source: n.source, target: n.target, cost: n.cost}});

        let file = JSON.stringify({nodes: fileNodes, edges: fileEdges});

        let link = document.createElement('a');
        link.href =  window.URL.createObjectURL(new Blob([file],{type: 'application/json'}));
        link.setAttribute('download', `graph-${nodes.length}-${edges.length}-${Date.now()}`);
        document.body.appendChild(link);
        link.click();
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

    nextStep = () => {
        let { engine, finished, states, stateIndex } = this.state;
        this.setState({ loading: true });

        if(states[++stateIndex]){
            let disableNext = !(stateIndex + 1 < states.length);

            this.setState({ stateIndex, engine: !engine, disableNext: finished && disableNext });
            return;
        }
        
        this.launchAlgorithm();
    }

    prevStep = () => {
        let { engine, stateIndex, states } = this.state;
        this.setState({ loading: true });

        stateIndex--;
        
        this.setState({ stateIndex, engine: !engine, disableNext: !(stateIndex < states.length)});
    }

    launchAlgorithm(name = 'dijkstra'){
        var { disableNext, endNode, engine, finished, indexes, nextSteps, states, stateIndex, startNode, targetAll } = this.state;

        var { file: { nodes }, currentNode, phase, step, substep } = states[stateIndex];

        var algorithm = require(`../algorithms/${name}`);

        switch(phase){
            case 0:
                {
                    let newState = JSON.parse(JSON.stringify(states[stateIndex]));

                    currentNode = startNode;
                    
                    let node = newState.file.nodes[indexes[currentNode]];
                    node.prevType = node.type
                    node.type = 'currentNode';
                    newState.currentNode = currentNode;

                    algorithm.preprocess(newState);

                    newState.phase++;
                    states.push(newState);

                    stateIndex++;

                    this.setState({ states, stateIndex, engine: !engine });
                }
                break;
            case 1:
                let newState = JSON.parse(JSON.stringify(states[stateIndex]));

                if(substep > 0){
                    // Edge at the previous step need to be rerendered as visited edge
                    let edge = newState.file.edges[nodes[indexes[currentNode]].leavingStar[substep-1]];
                    edge.type = edge.prevType;
                    delete edge.prevType;
                }

                if(nodes[indexes[currentNode]].leavingStar && substep < nodes[indexes[currentNode]].leavingStar.length){
                    let idx = newState.file.nodes[indexes[currentNode]].leavingStar[substep];
                    let edge = newState.file.edges[idx];

                    algorithm.process(newState, edge, endNode, nextSteps, indexes);

                    edge.prevType = edge.type;
                    edge.type = 'currentEdge';


                    newState.substep++;
                    states.push(newState);
                }
                else{
                    let node = newState.file.nodes[indexes[currentNode]]
                    node.type = node.prevType;
                    delete node.prevType;

                    currentNode = nextSteps[step];

                    if(!currentNode){
                        phase++;
                        step = 0;

                        if(targetAll){
                            disableNext = true;
                            finished = true;

                            newState.info = [`All paths explored, algorithm completed`]
                        }
                        else{
                            currentNode = endNode;
                            node = newState.file.nodes[indexes[currentNode]]
                            node.prevType = node.type;
                            node.type = 'currentNode';
                        
                            newState.phase++;
                            newState.step = 0;
                            newState.substep = 0;
                            
                            newState.info = [`Setting node ${nodes[indexes[endNode]].title} (ending node) as current node since there is no node left to explore`]
                        }
                    }
                    else{
                        node = newState.file.nodes[indexes[currentNode]]
                        node.prevType = node.type;
                        node.type = 'currentNode';
                        
                        newState.info = [`Setting node ${nodes[indexes[currentNode]].title} as the current node`]
                        newState.substep = 0;
                        newState.step++;
                    }

                    newState.currentNode = currentNode;
                    states.push(newState);
                    
                }

                stateIndex++;

                this.setState({ disableNext, engine: !engine, finished, nextSteps, states, stateIndex });
                break;
            case 2:
                {
                    let newState = JSON.parse(JSON.stringify(states[stateIndex]));

                    let node = newState.file.nodes[indexes[currentNode]];

                    algorithm.postprocess(newState, indexes, node);

                    currentNode = node.pred;

                    node = newState.file.nodes[indexes[currentNode]];
                    node.prevType = node.type;
                    node.type = 'currentNode';

                    disableNext = currentNode === startNode;

                    newState.step++;
                    
                    stateIndex++;

                    if(!disableNext){        
                        newState.currentNode = currentNode;
                        states.push(newState);
                        
                        this.setState({ engine: !engine, stateIndex, states });
                    }
                    else{
                        node.type = node.prevType;
                        delete node.prevType;

                        newState.info.push(`Found shortest path that leads node ${nodes[indexes[startNode]].title} to node ${nodes[indexes[endNode]].title}`);

                        newState.currentNode = null;
                        states.push(newState);
                        this.setState({ disableNext, endIndex: stateIndex, engine: !engine, finished: true, stateIndex, states });
                    }
                }

                break;
            default:
                break;
        }
    }

    targetAll = (e, value) => {
        const { endNode, engine, indexes, startNode, states } = this.state;
        if( value ){
            states[0].info[1] = `All the other nodes will be targeted`
            states[0].file.nodes[indexes[endNode]].type = 'empty'
        }
 
        this.setState({ disableNext: value ? !startNode : !(endNode && startNode), endNode: '', engine: !engine, finished: false, selectedPath: '', stateIndex: 0, states: [states[0]], targetAll: value });
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

    showPicker = (prev, next) => this.setState({colorPicker: prev===next ? '' : next});

    computeObjective = (edges, paths) => {
        const { endNode, targetAll } = this.state;

        let objective = 0
        let costs = {}

        for(let edge of edges) 
            costs[`${edge.source}${edge.target}`] = edge.cost ? edge.cost : 1;

        if(targetAll) 
            for(let node in paths){
                let path = paths[node]

                for(let i=0; i<path.length-1; i++)
                    objective += costs[`${path[i]}${path[i+1]}`]
            }
        else {
            let path = paths[endNode]

            for(let i=0; i<path.length-1; i++)
                objective += costs[`${path[i]}${path[i+1]}`]
        }

        return objective;
    }

    stringPath = (nodes, path) => {
        const { indexes } = this.state;

        return path.map(n => nodes[indexes[n]].title).join(PATH_SEPARATOR);
    }

    render() {
        const { colorPicker, colors, disableNext, finished, loading, states, stateIndex, message, engine, selectedPath, startNode, endNode, targetAll} = this.state;
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

                <div className={file ? "SPP-dropClosed" : "SPP-generator"}>
                    <ExamplesManager getFile={this.getFile} loading={loading} />
                </div>

                <div className={file ? "SPP-dropClosed" : "SPP-generator"}>
                    <RandomManager getFile={this.getFile} loading={loading} />
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
                        onRenderComplete={() => this.setState({ loading: false })}
                        onSelectNode={this.moveNode}
                    />
                    
                    <div className="SPP-spacer">
                        <Button className="SPP-button" onClick={() => this.onReset(true)}>CLEAR</Button>
                        <Button className="SPP-button" onClick={() => this.onReset()}>RESET</Button>
                        <Button className="SPP-button" onClick={() => this.onDownload()}><GetApp/></Button>

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
                            <Button onClick={() => this.prevStep()} disabled={stateIndex === 0  || loading}>
                                <KeyboardArrowLeft/>
                            </Button>

                            <Button onClick={() => this.nextStep()} disabled={disableNext || loading}>
                                <KeyboardArrowRight/>
                            </Button>
                        </ButtonGroup>
                        
                        <div className="SPP-loading" >
                            {loading && <CircularProgress color='inherit' size={35}/>}
                        </div>
                    </div>
                    
                    <div className="SPP-spacer">
                        <TextField
                            select
                            className="SPP-select"
                            label="Start Node"
                            value={startNode}
                            onChange={this.onChange('startNode')}
                            margin="normal"
                            variant="outlined" 
                            SelectProps={{MenuProps: { className: 'SPP-menu'}}} 
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
                            variant="outlined" 
                            SelectProps={{MenuProps: { className: 'SPP-menu'}}} 
                        >
                            <MenuItem key={'empty'} value='' />
                            {file.nodes.filter(e => e.id !== startNode).map(e => (
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
                        <InfoBox phase={states[stateIndex].phase} step={states[stateIndex].step} substep={states[stateIndex].substep} info={states[stateIndex].info} />
                    </div>
                    <div className="SPP-infoBox">
                        <h3>Paths {stateIndex === states.length - 1 && finished ? `(O.F. ${this.computeObjective(file.edges, shortestPaths)})`: ''}</h3>
                        <table className="SPP-paths">
                            <thead>
                                <tr>
                                    <th style={{width: '15%'}}><strong>Node</strong></th>
                                    <th style={{width: '70%'}}><strong>Shortest Path</strong></th>
                                    <th style={{width: '15%'}}><strong>Path Cost</strong></th>
                                </tr>
                            </thead>
                            <tbody>
                                {file.nodes.map(e => (
                                    <tr key={e.title} className={e.id === startNode ? 'SPP-sourceRow SPP-unselectableRow' : stateIndex === states.length - 1 ? e.id === selectedPath ? 'SPP-selectedRow SPP-selectableRow' : shortestPaths[e.id] ? 'SPP-selectableRow' : 'SPP-unselectableRow' : 'SPP-unselectableRow'} onClick={() => this.togglePath(e.id, shortestPaths[e.id], shortestPaths[selectedPath])}>
                                        <td style={{width: '15%'}}>{e.title}</td>
                                        <td style={{width: '70%'}}>{e.id === startNode ? 'Source' : stateIndex === states.length - 1 && finished ? shortestPaths[e.id] ? this.stringPath(file.nodes, shortestPaths[e.id]) : 'No path found' : shortestPaths[e.id] ? this.stringPath(file.nodes, shortestPaths[e.id])  : ''}</td>
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