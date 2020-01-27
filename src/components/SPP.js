import React, { Component } from 'react';
import Dropzone from './Dropzone';
import GraphBuilder from './GraphBuilder';
import { Button, MenuItem, OutlinedInput, Paper, TextField } from '@material-ui/core';
import { PlayArrow } from '@material-ui/icons';

import '../css/SPP.css'

class SPP extends Component {
    constructor(props){
        super(props)
        this.state = {
            file: {"nodes":[{"id":1,"title":"Node A","x":261.3662526072377,"y":380.4085763646997,"type":"empty"},{"id":2,"title":"Node B","x":48.797954180041046,"y":495.6765459517936,"type":"empty"},{"id":3,"title":"Node C","x":530.6759939811406,"y":471.05519601885425,"type":"empty"},{"id":4,"title":"Node D","x":46.537057671810174,"y":419.07888034272423,"type":"empty"}],"edges":[{"source":1,"target":2,"type":"emptyEdge","handleText":"."},{"source":2,"target":4,"type":"emptyEdge","handleText":"."},{"source":4,"target":3,"type":"emptyEdge","handleText":"."}]},
            message: '',
            start_node: '',
            end_node: ''
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
        
        // If distance < 0, node was never explored
        if(el.distance < 0 || el.distance > dist){
            el.distance = dist;
            el.pred = pred;
        }
    }

    launchAlgorithm(name = 'dijkstra'){
        var { file: { nodes, edges }, start_node, end_node, engine } = this.state;

        /** INITIALIZATION */

        var current_node = start_node.id;
        var next_steps = [];
        var indexes = {};

        for(let [i, el] of nodes.entries()){
            el.distance = el.id === current_node ? 0 : -1;
            delete el.pred;
            indexes[el.id] = i;
        }

        while(current_node){
            /** UPDATE */

            for(let el of edges){
                if(el.source === current_node){
                    if(el.target !== end_node.id) next_steps.push(el.target);
                    this.updateNode(nodes, el.source, indexes[el.target], el.cost ? el.cost : 1 + nodes[indexes[current_node]].distance);
                }
            }

            current_node = next_steps.shift();
        }

        this.setState({file:{nodes, edges}, engine: !engine})
    }

    render() {
        const { file, message, engine, start_node, end_node } = this.state;
        
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
                        <Button className="SPP-button" onClick={(e) => this.setState({file: null, start_node: '', end_node: ''})}>RESET</Button>
                    </div>
                    
                    <div className="SPP-spacer">
                        <TextField
                            select
                            className="SPP-select"
                            label="Start Node"
                            value={this.state.start_node}
                            onChange={this.onChange('start_node')}
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
                            value={this.state.end_node}
                            onChange={this.onChange('end_node')}
                            margin="normal"
                            input={<OutlinedInput/>}
                        >
                            <MenuItem key={'empty'} value='' />
                            {file.nodes.map(e => (
                                <MenuItem key={e.id} value={e}>{e.title}</MenuItem>
                            ))}
                        </TextField>

                        <Button disabled={!start_node || !end_node} className="SPP-button" onClick={() => this.launchAlgorithm()}>
                            <PlayArrow/>
                        </Button>
                    </div>
                </div>}
            </div>
        )
    }
}
export default SPP;