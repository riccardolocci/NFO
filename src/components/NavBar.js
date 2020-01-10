import React, { Component } from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import { Typography, IconButton } from '@material-ui/core/';
import MenuIcon from '@material-ui/icons/Menu';

import '../css/NavBar.css';

class NavBar extends Component {
  render() {
    
    return(
      <AppBar position="absolute" className="NavBar-appBar">
        <Toolbar className="NavBar-toolbar">
            <IconButton
              color="inherit"
              aria-label="Open drawer"
              onClick={this.props.onClick}
            >
              <MenuIcon/>
            </IconButton>
            <span className="NavBar-spacer"/>
            <Typography variant="h6" color="inherit" className="NavBar-typography">
                NETWORK FLOWS OPTIMIZATION
            </Typography>
        </Toolbar>
      </AppBar>
    ) 
  }
}

export default NavBar;