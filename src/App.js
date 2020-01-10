import React, {Component} from 'react';
import './css/App.css';

import Homepage from "./components/Homepage";
import LeftDrawer from './components/LeftDrawer';
import NavBar from './components/NavBar';

import { HashRouter as Router, Route, Switch } from 'react-router-dom';


class App extends Component {

  state = {
    open: false
  };

  onToggleDrawer = (open) => {
    this.setState({ open: open });
  }
  
  toggleDrawer() {
    this.sidebar.toggleDrawer();
  }

  render(){
    return (
      <div className="App">
        <div>
          <Router>
            <div className="App-root">
              <NavBar onClick={() => this.toggleDrawer()}></NavBar>
              <main className="App-container">
                <LeftDrawer onRef={ref => (this.sidebar = ref)} onToggle={this.onToggleDrawer}/>
                <div className="App-centerPane">
                  <Switch>
                    <Route 
                      exact path="/"
                      component={Homepage}
                    />
                  </Switch>
                </div>
              </main>
            </div>
          </Router>
        </div>
      </div>
    );
  }
}

export default App;
