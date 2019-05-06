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
        console.log(res)
        this.setState({clients: res.data})
      })
  }

  goButton(cell, row){
     return (<div><Button color="success" onClick={() =>  this.props.history.push('/client/'+row.id)}>Open</Button></div>)
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
                <TableHeaderColumn isKey dataField="name" dataSort>Name</TableHeaderColumn>
                <TableHeaderColumn dataField="phone1">Primary phone</TableHeaderColumn>
                <TableHeaderColumn dataField="email">Email</TableHeaderColumn>
              </BootstrapTable>
            </CardBody>
          </Card>
        </div>
    );
  }
}

export default withRouter(Clients);
