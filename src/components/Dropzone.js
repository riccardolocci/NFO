import React, { Component } from 'react'
import Drop from 'react-dropzone';
import {Paper} from '@material-ui/core';

import adapt from '../utilities/arrangeNodes';

import '../css/Dropzone.css'

class Dropzone extends Component {

    constructor(props){
        super(props);
        this.state = {
            message: ''
        }

        this.getFile = this.props.getFile;
        this.showMessage = this.props.showMessage;
        this.mode = this.props.validationMode;

        this.modes = {
            SPP: {
                nodes: ['id'],
                edges: ['source', 'target']
            }
        }
    }

    validate(f){
        if(!(f.nodes && f.edges)){
            this.showMessage('Missing at least one of the following keywords: nodes | edges');
            return false;
        }

        if(!(Array.isArray(f.nodes) && Array.isArray(f.edges))){
            this.showMessage('Type error: nodes & edges must be array of objects');
            return false;
        }

        let {nodes, edges} = this.modes[this.mode];

        let nodesIds = [];
        for(const [i, el] of f.nodes.entries()){
            if(!nodes.every((e) => Object.keys(el).includes(e))){
                this.showMessage(`Node at index [${i}] misses at least one of the following keywords: ${nodes.join(' | ')}`);
                return false;
            }
            nodesIds.push(el.id);
        }

        for(const [i, el] of f.edges.entries()){
            if(!edges.every((e) => Object.keys(el).includes(e))){
                this.showMessage(`Edge at index [${i}] misses at least one of the following keywords: ${edges.join(' | ')}`);
                return false;
            }

            if(!(nodesIds.includes(el.source) && nodesIds.includes(el.target))){
                this.showMessage(`Edge at index [${i}]: source or target node does not exist`);
                return false;
            }
        }

        return true;
    }

    onDrop = (accepted, rejected) => {
        const scope = this;

        var reader = new FileReader();
        
        reader.onload = function(progressEvent){
            try{
                let f = JSON.parse(this.result);
                if(!scope.validate(f)) return;

                f = adapt(f);
                scope.getFile(f);
            }
            catch(e){
                if (e instanceof SyntaxError) {
                    scope.showMessage('Not a JSON file');
                    return;
                }
                else throw(e);
            }
        };

        for (var f of accepted) {
            reader.readAsText(f);
        }
    }

    render(){
        return (
            <div className="Dropzone-root">
                <Paper className={this.props.hide ? "Dropzone-paperHide" : "Dropzone-paper"}>
                    <Drop accept=".json" onDrop={this.onDrop}>
                        {({ getRootProps, getInputProps }) => (
                            <div {...getRootProps()} className="Dropzone-dropDiv">
                                <Paper className="Dropzone-dropPaper">
                                    <input {...getInputProps()}/>
                                    <div>
                                        <p>Try dropping the file here, or click to select a file to upload.</p>
                                    </div>
                                </Paper>
                            </div>
                        )}
                    </Drop>
                </Paper>
            </div>
        )
    }
}

export default Dropzone;