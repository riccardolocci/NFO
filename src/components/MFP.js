import React, { Component } from 'react'
import Dropzone from './Dropzone';

import '../css/MFP.css'

class MFP extends Component {
    constructor(props){
        super(props)
        this.state = {
            file: null
        }
    }

    getFile = (f) => {
        this.setState({
            file: f
        })
    }

    render() {
        return (
            <div className="MFP-root">
                <div><h1>MFP</h1></div>
                <div className={this.state.file ? "MFP-contentOneClosed" : "MFP-contentOne"}>
                    TBI
                    <Dropzone
                        getFile={this.getFile}
                        hide={this.state.file}
                    />
                </div>
            </div>
        )
    }
}
export default MFP;