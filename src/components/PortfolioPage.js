import React , {Component} from 'react';
import axios from 'axios';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import * as jwt from 'jsonwebtoken';
import RaisedButton from 'material-ui/RaisedButton';
import { Redirect, withRouter } from 'react-router-dom';
import ReactTable from "react-table-v6";
import 'react-table-v6/react-table.css';


class PortfolioPage extends Component{
  constructor(props){
    super(props)
    this.state={
      Stocks : [],
      
    };
  }

  tokenKey = 'auth_token';
  getUsername() {
    return this.decode(this.getToken()).useremail;
  }
  decode(token) {
    return jwt.decode(token);
  }
  getToken() {
    return localStorage.getItem(this.tokenKey);
  }

  invalidateUser() {
    localStorage.removeItem(this.tokenKey);
    this.props.history.push("/");
  }

  componentDidMount(){
    
    axios.get('http://localhost:4000/api/v1/stockcounts/getuserstocks', {

        headers: {'authorization': this.getToken()}
    })
    .then((response) => {
      var stocks = response.data;
      this.setState({
        Stocks: stocks
      })
      var socket = require('socket.io-client')(`http://localhost:4000`);
      socket.on('connection', function(clientdata){
          console.log("clientsocket", clientdata)
          
      });
      
      socket.on('broadcast',Stock=>{
        this.setState(prev => ({
          Stocks: prev.Stocks.map(Stocks => Stocks.stock.sharename === Stock.sharename ? { ...Stocks, stock:{ ...Stocks.stock,sharevalue : Stock.sharevalue} } : Stocks)
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

 render(){
   
    const data =  this.state.Stocks;

    const columns = [{
      Header: 'Company Name',
      accessor: 'stock.companyname' 
      }, {
      Header: 'Stock Name',
      accessor: 'stock.sharename',
      },
      {
      Header: 'Share Current Value',
      accessor: 'stock.sharevalue',
      getProps: (state, rowInfo, column) => {
        return {
            style: {
                background: '#00bcd4',
            },
        };
      }
      },
      {
        Header: 'No. of Shares You Have',
        accessor: 'sharescount',
      },
      {
        Header: 'Total Value according to shares (₹)',
        accessor: 'totalvalue',
        Cell : props =><span className='number'>{(props.original.stock.sharevalue * props.original.sharescount).toFixed(2)}</span>,
        getProps: (state, rowInfo, column) => {
          return {
              style: {
                  background: '#00bcd4',
              },
          };
        }
      }
      
  ]

    return(
      <div>
          
          <MuiThemeProvider>
    <span><h3>Hi {this.getUsername()}</h3> <RaisedButton label="Logout" primary={true} style={style} onClick={() => this.invalidateUser()}/></span>
     

    <ReactTable
    data={data}
    columns={columns}
    showPagination={false}
    defaultPageSize={5}
  />
      </MuiThemeProvider>
    </div>
    );
  }
}
const style = {
    margin: 15,
   };

export default withRouter(PortfolioPage);
