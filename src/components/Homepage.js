import React, { Component } from 'react'
import { withStyles } from "@material-ui/core/styles";

const styles = theme =>  ({
    root: {
      minWidth: "40%",
      overflowX: "auto"
    },
    table: {
      minWidth: 250
    },
    top: {
        marginTop: 70,
        width: '100%'
    },
    textField: {
        minWidth: 250,
        margin: 0,
        width: '100%'
    },
    appLogo: {
        display: 'block',
        padding: 0,
        width: '60%',
        height: '60%',
        margin: '0 auto 0 auto'
      },
    divLogo:{
        height: '50%',
        width: '100%',
        margin: 0,
        padding: 0
    },
    appLogoFooter: {
        border: 'solid 1px',
        display: 'block',
        margin: '0 auto',
        paddingLeft: 0,
        paddingRight: 0,
        width: '50%',
        height: '50%'
    },
    divFooter:{
        position: 'absolute',
        bottom: 0,
        padding: 0,
        width: '93%',
        margin: 0
    }
  });


class Homepage extends Component {
    constructor(props){
        super(props)
        this.state = {}
    }

    render() {
        const { classes } = this.props;
        return (
            <div className={classes.top}>
                <div className={classes.divLogo}>
                    <div style={{extAlign: 'center'}}><h1>NETWORK FLOWS OPTIMIZATION</h1></div>
                </div>
                <div className={classes.divFooter}>
                </div>
            </div>
        )
    }
}
export default (withStyles(styles)(Homepage));