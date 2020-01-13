import React, { Component } from 'react';
import Dropzone from './Dropzone';

import '../css/SPP.css'

class SPP extends Component {
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
            <div className="SPP-root">
                <div><h1>SPP</h1></div>
                <div className={this.state.file ? "SPP-contentOneClosed" : "SPP-contentOne"}>
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
export default SPP;