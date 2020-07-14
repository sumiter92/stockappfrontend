import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import AppBar from 'material-ui/AppBar';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import React , {Component} from 'react';
import axios from 'axios';
import * as jwt from 'jsonwebtoken';
import * as moment from 'moment';
import { Redirect, withRouter } from 'react-router-dom';
// import ShareList from './SharesList';
import SharesList from './SharesList';
import { Container, Row, Col } from 'react-grid-system';

class Login extends Component {
constructor(props){
  super(props);
  this.state={
  username:'',
  password:'',
  socketId:''
  }
 }
 tokenKey = 'auth_token';

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
  return sessionStorage.getItem(this.tokenKey);
}

  decode(token) {
    return jwt.decode(token);
  }

  saveToken(token) {
    sessionStorage.setItem(this.tokenKey, token);
  }

  invalidateUser() {
    sessionStorage.removeItem(this.tokenKey);
  }

  getExpiration(token) {
    const exp = this.decode(token).exp;

    return moment.unix(exp);
  }

  getUsername() {
    return this.decode(this.getToken()).username;
  }

  isValid(token) {
    return moment().isBefore(this.getExpiration(token));
  }

  isAuthenticated() {
    const token = this.getToken();
    console.log(token);
    return (token && this.isValid(token)) ? true : false;
  }

componentDidMount(){
  var socket = require('socket.io-client')(`https://api.stockapp.cf`);
      socket.on('connection', function(clientdata){
          console.log("clientsocket", clientdata)
          
      });
      socket.on('hello',SocketId=>{
       this.setState({socketId:SocketId});
      });
}


 handleClick(event){
    var apiBaseUrl = "https://api.stockapp.cf/api/v1/users/auth";
    var self = this;
    
    var payload={
    "email":this.state.username,
    "password":this.state.password
    }
    axios.post(apiBaseUrl, payload)
    .then(function (response) {
    
    if(response.status == 200){
      return response.data;
    }
    // else if(response.data.code == 204){
    // console.log("Username password do not match");
    // alert("username password do not match")
    // }
    // else{
    // return false
    // }
    }).then(token=>{
        this.saveToken(token);
        this.props.history.push("/PortfolioPage");       
    })
    .catch(function (error) {
    console.log(error);
    });
    }




render() {
    if (this.isAuthenticated()) {
        return <Redirect to={{pathname: '/Portfoliopage'}} />
      }
    return (
      <div>
        <MuiThemeProvider>
          <div>
          
          <AppBar
             title="Stock Application"
           />
           <Row>
             <Col sm={6} md={6} lg={6}>
            <h3>To get User Specific shares portfolio with current valuation Please login below with the credentials:- </h3>
           <p>Username:- testuser@gmail.com</p>
           <p>password:- test@1234</p>
           <h3>Or</h3>
           <p>Username:- testuser2@gmail.com</p>
           <p>password:- testuser2@1234</p>
           <TextField
             hintText="Enter your Username"
             floatingLabelText="Username"
             onChange = {(event,newValue) => this.setState({username:newValue})}
             />
           <br/>
             <TextField
               type="password"
               hintText="Enter your Password"
               floatingLabelText="Password"
               onChange = {(event,newValue) => this.setState({password:newValue})}
               />
             <br/>
             <RaisedButton label="Submit" primary={true} style={style} onClick={(event) => this.handleClick(event)}/>
             </Col>
             <Col sm={6} md={6} lg={6}>
             <h3>SocketId: {this.state.socketId}</h3>
             <SharesList/>
             </Col>
             </Row>
            
         </div>
         
         </MuiThemeProvider>
         
      </div>
    );
  }
}
const style = {
 margin: 15,
};
export default withRouter(Login);