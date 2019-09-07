import React, { Component } from 'react';
import {
  Badge,
  Button,
  ButtonDropdown,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Col,
  Collapse,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Fade,
  Form,
  FormGroup,
  FormText,
  FormFeedback,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Label,
  Row,
} from 'reactstrap';
import DataTable from '../Tables/DataTable/DataTable';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import { createBrowserHistory } from 'history';
import { Route , withRouter} from 'react-router-dom';
const axios = require('axios')
const history = createBrowserHistory();

class Clients extends Component {
  constructor(props) {
    super(props);
    this.getClients = this.getClients.bind(this)
    this.toggle = this.toggle.bind(this);
    this.toggleFade = this.toggleFade.bind(this);
    this.goButton = this.goButton.bind(this);
    this.state = {
      clients:[],
      collapse: true,
      fadeIn: true,
      timeout: 300
    };
  }
  async componentDidMount(){
    await this.getClients()
  }

  toggle() {
    this.setState({ collapse: !this.state.collapse });
  }

  toggleFade() {
    this.setState((prevState) => { return { fadeIn: !prevState }});
  }

  getClients(){
    axios(
      {
        url: '/api/clients/all',
        method: 'get'
      })
      .then( res => {
        console.log("clients", res)
        this.setState({clients: res.data})
      })
  }

  goButton(cell, row){
     return (<div><Button color="success" onClick={() =>  this.props.history.push('/client/'+row.id)}>Open</Button></div>)
  }

  name(cell, row){
    if (row.name!=="undefined" && row.name !=="null"){
      return <div style={{whiteSpace:"pre-wrap"}}>{row.name}</div>
    }
  }

  company(cell, row){
    if (row.company!=="undefined" && row.company !=="null"){
      return <div style={{whiteSpace:"pre-wrap"}}>{row.company}</div>
    }
  }

  street(cell, row){
    if (row.street!=="undefined" && row.street !=="null"){
      return <div style={{whiteSpace:"pre-wrap"}}>{row.street + ' ' + row.city}</div>
    }
  }

  city(cell, row){
    if (row.city!=="undefined" && row.city !=="null"){
      return row.city
    }
  }

  phone1(cell, row){
    if (row.phone1!=="undefined" && row.phone1 !=="null"){
      return row.phone1
    }
  }

  email(cell, row){
    if (row.email!=="undefined" && row.email !=="null"){
      return <div style={{whiteSpace:"pre-wrap"}}>{row.email}</div>
    }
  }


  render() {
    return (
        <div className="animated">
          <Card>
            <CardHeader>
              <i className="icon-menu"></i>Clients
            </CardHeader>
            <CardBody>
              <BootstrapTable data={this.state.clients} version="4" striped hover search options={this.options}>
              <TableHeaderColumn dataFormat={this.goButton}></TableHeaderColumn>
                <TableHeaderColumn isKey dataField="name" dataFormat={this.name}dataSort>Name</TableHeaderColumn>
                <TableHeaderColumn dataField="company" dataFormat={this.company} dataSort>Company Name</TableHeaderColumn>
                <TableHeaderColumn dataField="street" dataFormat={this.street} dataSort>Address</TableHeaderColumn>
                <TableHeaderColumn dataField="phone1" dataFormat={this.phone1}>Primary phone</TableHeaderColumn>
                <TableHeaderColumn dataField="email" dataFormat={this.email}>Email</TableHeaderColumn>
              </BootstrapTable>
            </CardBody>
          </Card>
        </div>
    );
  }
}

export default withRouter(Clients);
