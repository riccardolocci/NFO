import React, { Component } from 'react'
import Dropzone from './Dropzone';

import '../css/MCFP.css'

class MCFP extends Component {
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
            <div className="MCFP-root">
                <div><h1>MCFP</h1></div>
                <div className={this.state.file ? "MCFP-contentOneClosed" : "MCFP-contentOne"}>
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
export default MCFP;