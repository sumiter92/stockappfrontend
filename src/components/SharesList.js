import React , {Component} from 'react';
import axios from 'axios';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import * as jwt from 'jsonwebtoken';
import AppBar from 'material-ui/AppBar';
import RaisedButton from 'material-ui/RaisedButton';
import { Redirect, withRouter } from 'react-router-dom';
import TextField from 'material-ui/TextField';
import ReactTable from "react-table-v6";
import 'react-table-v6/react-table.css';


class ShareList extends Component{
  constructor(props){
    super(props)
    this.state={
      Stocks : [],
      
    };
  }

  componentDidMount(){
    axios.get('https://api.stockapp.cf')
    .then((response) => {
      var stocks = response.data.Stock;
      this.setState({
        Stocks: stocks
      })
    
      var socket = require('socket.io-client')(`https://api.stockapp.cf`);
      socket.on('connection', function(clientdata){
          console.log("clientsocket", clientdata)
          
      });
      socket.on('broadcast',Stock=>{
        this.setState(prev => ({
          Stocks: prev.Stocks.map(Stocks => Stocks.sharename === Stock.sharename ? { ...Stocks, sharevalue: Stock.sharevalue } : Stocks)
      }))
      });
    })
    .catch(function (error) {
      console.log(error);
    })
    .then(function () {
      // always executed
    });  
  }

  handleClick(event){
    var userId= this.state.userId;
    var apiBaseUrl = `https://api.stockapp.cf/api/Users/${event}`;
    var self = this;
    var payload={
    
    }
    
    axios.delete(apiBaseUrl, payload)
    .then(function (response) {
    if(response.status == 200){
    alert("Deletion of User is Successfull");
   
    }
    else if(response.data.code == 204){
    console.log("Username password do not match");
    alert("username password do not match")
    }
    else{
    console.log("Username does not exists");
    alert("Username does not exist");
    }
    })
    .catch(function (error) {
    console.log(error);
    });
    }
  render(){

    const data =  this.state.Stocks;

    const columns = [{
      Header: 'Company Name',
      accessor: 'companyname' 
      }, {
      Header: 'Stock Name',
      accessor: 'sharename',
      },
      {
      Header: 'Share Value Changes with Time',
      accessor: 'sharevalue',
      getProps: (state, rowInfo, column) => {
        return {
            style: {
                background: '#00bcd4',
            },
        };
    },
      }]

    const {Stocks} =this.state;
    // console.log(this.state);
    return(
      <div>
        
      <MuiThemeProvider>
      <h3>Shares Listing</h3>
      <ReactTable
      data={data}
      columns={columns}
      showPagination={false}
      defaultPageSize={10}
    />     
      </MuiThemeProvider>
    </div>
    );
  }
}
const style = {
    margin: 15,
   };

export default withRouter(ShareList);
