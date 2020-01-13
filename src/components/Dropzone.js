import React, { Component } from 'react'
import Drop from 'react-dropzone';
import {Paper} from '@material-ui/core';

import '../css/Dropzone.css'

class Dropzone extends Component {

    constructor(props){
        super(props);
        this.getFile = this.props.getFile;
    }

    onDrop = (accepted, rejected) => {
        const scope = this;

        var reader = new FileReader();
        
        reader.onload = function(progressEvent){
            scope.getFile(this.result);
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