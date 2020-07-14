import React , {Component} from 'react';
import axios from 'axios';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import * as jwt from 'jsonwebtoken';
import * as moment from 'moment';
import RaisedButton from 'material-ui/RaisedButton';
import { Redirect, withRouter } from 'react-router-dom';
import ReactTable from "react-table-v6";
import 'react-table-v6/react-table.css';


class PortfolioPage extends Component{
  constructor(props){
    super(props)
    this.state={
      Stocks : [],
      username:""
    };
  }

  tokenKey = 'auth_token';
  getUsername() {
    if(!this.getToken()){
      return false;
    }
    return this.decode(this.getToken()).useremail;
  }
  decode(token) {
    return jwt.decode(token);
  }
  getToken() {
    var localToken =  localStorage.getItem(this.tokenKey);
    const localtokenvalue = JSON.parse(localToken)
    if(localtokenvalue && localtokenvalue.key !== null){
      const now = new Date()
    if (now.getTime() > localtokenvalue.expiry) {
      localStorage.removeItem(this.tokenKey)
    }
      sessionStorage.setItem(this.tokenKey, localtokenvalue.key);
    }
    return sessionStorage.getItem(this.tokenKey) || localtokenvalue.key ;
  }

  invalidateUser() {
    sessionStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.tokenKey);
    this.props.history.push("/");
  }
  getExpiration(token) {
    const exp = this.decode(token).exp;

    return moment.unix(exp);
  }
  isValid(token) {
    return moment().isBefore(this.getExpiration(token));
  }


  

  componentDidMount(){
    window.addEventListener("unload", this.callEvent);
   const validity =  this.isValid(this.getToken());
   var newUsername = this.getUsername() || null;
  //  console.log(validity); 
   if (!validity){
     return this.invalidateUser();
   }
    
    axios.get('https://api.stockapp.cf/api/v1/stockcounts/getuserstocks', {

        headers: {'authorization': this.getToken()}
    })
    .then((response) => {
      var stocks = response.data;
      this.setState({
        Stocks: stocks,
        username: newUsername
      })
      var socket = require('socket.io-client')(`https://api.stockapp.cf`);
      socket.on('connection', function(clientdata){         
      });
      
      socket.on('broadcast',Stock=>{
        this.setState(prev => ({
          Stocks: prev.Stocks.map(Stocks => Stocks.stock.sharename === Stock.sharename ? { ...Stocks, stock:{ ...Stocks.stock,sharevalue : Stock.sharevalue} } : Stocks)
      }))
      });
    })
    .catch(function (error) {
      // console.log(error);
    })
    .then(function () {
      // always executed
    });  
  }


  
  setWithExpiry(key, value, ttl) {
    const now = new Date()
    const item = {
      key: value,
      expiry: now.getTime() + ttl
    }
    localStorage.setItem(key, JSON.stringify(item))
  }


 
 callEvent = e => {
    e.preventDefault();
    const tokenvalue = sessionStorage.getItem(this.tokenKey);
      this.setWithExpiry(`${this.tokenKey}`, tokenvalue, 60000);
    if(sessionStorage){
    sessionStorage.removeItem(this.tokenKey);
    }
    
  };

  componentWillUnmount(){
      window.removeEventListener("unload", this.callEvent);
  }

 render(){
   const Username = this.getUsername() || null ;
   if (!this.getUsername()){
     return this.invalidateUser();
   }
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
    <span><h3>Hi {this.state.username}</h3> <RaisedButton label="Logout" primary={true} style={style} onClick={() => this.invalidateUser()}/></span>
     

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
