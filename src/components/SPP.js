import React, { Component } from 'react';
import Dropzone from './Dropzone';
import GraphBuilder from './GraphBuilder';
import { Paper } from '@material-ui/core';

import '../css/SPP.css'

class SPP extends Component {
    constructor(props){
        super(props)
        this.state = {
            file: null,
            message: ''
        }
    }

    getFile = (file) => this.setState({ file });

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
                {file && <GraphBuilder
                    labelSize = {13}
                    file={file}
                />}
            </div>
        )
    }
}
export default SPP;