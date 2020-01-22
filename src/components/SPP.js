import React, { Component } from 'react';
import Dropzone from './Dropzone';
import GraphBuilder from './GraphBuilder';
import { Button, MenuItem, OutlinedInput, Paper, TextField } from '@material-ui/core';

import '../css/SPP.css'

class SPP extends Component {
    constructor(props){
        super(props)
        this.state = {
            file: null,
            message: '',
            start_node: '',
            end_node: ''
        }
    }

    getFile = (file) => this.setState({ file });

    onChange = (key) => (e) => {
        var { file } = this.state;

        for(let n of file.nodes){
            if(n.id === e.target.value.id){
                n.type = key
                n.title = 'START'
            }
            else if(n.type === key) n.type = 'empty';
        }

        this.setState({
            [key]: e.target.value,
            file
        })
    }

    showMessage = (message) => {
        this.setState({ message });
        message = '';
        setTimeout(() => this.setState({ message }), 5000);
    }

    render() {
        const { file, message } = this.state;
        
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
                        file={file}
                    />
                    
                    <div className="SPP-spacer"><Button className="SPP-button" onClick={(e) => this.setState({file: null, start_node: '', end_node: ''})}>RESET</Button></div>
                    
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
                    </div>
                </div>}
            </div>
        )
    }
}
export default SPP;