import React from 'react';
import { Drawer, Tooltip } from '@material-ui/core';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import {Home, Directions, TrendingDown, TrendingUp} from '@material-ui/icons';
import { Link } from 'react-router-dom';

import '../css/LeftDrawer.css';


class LeftDrawer extends React.Component {

  constructor(props) {
    super(props);
    this.toggleDrawer = this.toggleDrawer.bind(this);
    this.state = {
      open: false
    }
  }

  componentDidMount() {
    this.props.onRef(this);
  }
  
  componentWillUnmount() {
    this.props.onRef(undefined);
  }

  toggleDrawer() {
    var open = this.state.open;

    this.setState({
      open: !this.state.open
    });
    this.props.onToggle(!open);
  }

  render() {
    return (
      <Drawer
        variant="permanent"
        classes={{
          paper: this.state.open ? "LeftDrawer-drawerPaper" : "LeftDrawer-drawerPaperClose"
        }}
        open={this.state.open}
      >
        <div style={{height: 65}}/>
        <Link to={'/'} style={{ textDecoration: 'none' }}>
          <Tooltip title="HOMEPAGE">
            <MenuItem className="LeftDrawer-menuItem">
              <ListItemIcon>
                <Home />
              </ListItemIcon>
              <ListItemText primary="HOMEPAGE" />
            </MenuItem>
          </Tooltip>
        </Link>
        
        <Link to={'/spp'} style={{ textDecoration: 'none' }}>
          <Tooltip title="SHORTEST PATH">
            <MenuItem className="LeftDrawer-menuItem">
              <ListItemIcon>
                <Directions />
              </ListItemIcon>
              <ListItemText primary="SHORTEST PATH" />
            </MenuItem>
          </Tooltip>
        </Link>

        {/* <Link to={'/mfp'} style={{ textDecoration: 'none' }}>
          <Tooltip title="MAX FLOW">
            <MenuItem className="LeftDrawer-menuItem">
              <ListItemIcon>
                <TrendingUp />
              </ListItemIcon>
              <ListItemText primary="MAX FLOW" />
            </MenuItem>
          </Tooltip>
        </Link>

        <Link to={'/mcfp'} style={{ textDecoration: 'none' }}>
          <Tooltip title="MIN COST FLOW">
            <MenuItem className="LeftDrawer-menuItem">
              <ListItemIcon>
                <TrendingDown />
              </ListItemIcon>
              <ListItemText primary="MIN COST FLOW" />
            </MenuItem>
          </Tooltip>
        </Link> */}

      </Drawer>
    );
  }
}

export default LeftDrawer;