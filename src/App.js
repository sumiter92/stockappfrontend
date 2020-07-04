import React, { Component } from 'react';
import PortfolioPage from './components/PortfolioPage';
import LoginPage from './components/LoginPage';
import { BrowserRouter, Route, Switch, Redirect, withRouter } from 'react-router-dom';
import './App.css';

function App() {
  
  return (
    <div className="App">
       <BrowserRouter>
      <Switch>
        <Route exact 
        path="/" render={(props)=>(<LoginPage {...props}/>)}></Route>
        <Route exact 
        path="/Portfoliopage" render={(props)=>(<PortfolioPage {...props}/>)}></Route>
      </Switch>
      </BrowserRouter>
    </div>
  );
}

export default App;
