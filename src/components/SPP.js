import React, { Component } from 'react';
import Dropzone from './Dropzone';
import GraphBuilder from './GraphBuilder';
import { Button, MenuItem, OutlinedInput, Paper, TextField } from '@material-ui/core';
import { PlayArrow } from '@material-ui/icons';

import '../css/SPP.css'

// var d3 = require('d3-force');

class SPP extends Component {
    constructor(props){
        super(props)
        this.state = {
            file: {"nodes":[{"id":1,"title":"Node A","x":261.3662526072377,"y":380.4085763646997,"type":"empty"},{"id":2,"title":"Node B","x":48.797954180041046,"y":495.6765459517936,"type":"empty"},{"id":3,"title":"Node C","x":530.6759939811406,"y":471.05519601885425,"type":"empty"},{"id":4,"title":"Node D","x":46.537057671810174,"y":419.07888034272423,"type":"empty"}],"edges":[{"source":1,"target":2,"type":"emptyEdge","handleText":"."},{"source":2,"target":4,"type":"emptyEdge","handleText":"."},{"source":4,"target":3,"type":"emptyEdge","handleText":"."}]},
            message: '',
            startNode: '',
            endNode: ''
        }
    }

    getFile = (file) => this.setState({ file });

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
            engine: !engine
        })
    }

    showMessage = (message) => {
        this.setState({ message });
        message = '';
        setTimeout(() => this.setState({ message }), 5000);
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
        var { file: { nodes, edges }, startNode, endNode, engine } = this.state;

        /** INITIALIZATION */

        var currentNode = startNode.id;
        var next_steps = [];
        var indexes = {};

        for(let [i, el] of nodes.entries()){
            el.distance = el.id === currentNode ? 0 : -1;
            if(!['startNode', 'endNode'].includes(el.type)) el.type = 'empty';
            delete el.pred;
            indexes[el.id] = i;
        }

        for(let el of edges){
            el.type = 'emptyEdge';
        }

        while(currentNode){
            /** UPDATE */

            for(let el of edges){
                if(el.source === currentNode){
                    el.type = 'visitedEdge';
                    if(el.target !== endNode.id) next_steps.push(el.target);
                    var { distance } = nodes[indexes[currentNode]]
                    this.updateNode(nodes, el.source, indexes[el.target], (el.cost ? el.cost : 1) + distance);
                }
            }

            currentNode = next_steps.shift();
        }

        currentNode = endNode;

        var path = []

        while(currentNode.id !== startNode.id){
            if(currentNode.type === 'visitedNode') currentNode.type = 'pathNode';
            path.push({source: currentNode.pred, target: currentNode.id});

            currentNode = nodes[indexes[currentNode.pred]]
        }

        for(let el of edges) if(path.some(e => e.source === el.source && e.target === el.target)) el.type = 'pathEdge';

        this.setState({file:{nodes, edges}, engine: !engine})
    }

    render() {
        const { file, message, engine, startNode, endNode } = this.state;
        
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
                    />
                    
                    <div className="SPP-spacer">
                        <Button className="SPP-button" onClick={(e) => this.setState({file: null, startNode: '', endNode: ''})}>RESET</Button>
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