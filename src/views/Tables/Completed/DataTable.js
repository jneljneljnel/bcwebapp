import React, {Component} from 'react';
import {Card, CardHeader, CardBody, Button} from 'reactstrap';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import { createBrowserHistory } from 'history';
import { Route , withRouter} from 'react-router-dom';
import 'react-bootstrap-table/dist//react-bootstrap-table-all.min.css';
import data from './_data';
const axios = require('axios')
const history = createBrowserHistory();



class DataTable extends Component {
  constructor(props) {
    super(props);
    this.table = data.rows;
    this.uncomplete =this.uncomplete.bind(this)
    this.doneButton = this.doneButton.bind(this)
    this.goButton = this.goButton.bind(this)
    this.state = {
      data: []
    }
    this.options = {
      sortIndicator: true,
      hideSizePerPage: true,
      paginationSize: 3,
      hidePageListOnlyOnePage: true,
      clearSearch: true,
      alwaysShowAllBtns: false,
      withFirstAndLast: false
    }

  }


  doneButton(cell, row){
     return (<div> <Button style={{padding:'3px'}} onClick={() => {this.getReport(row)}} color="danger">Report</Button> <Button style={{padding:'3px'}}  color="success" onClick={() => this.uncomplete(row.id)}>Uncomplete</Button></div>)
  }

  goButton(cell, row){
     return (<div><Button color="success" onClick={() =>  this.props.history.push('/jobs/'+row.id)}>Open</Button> </div>)
  }

  address(cell,row){
       return (<div>{row.street +' '+ row.city}</div>)
  }

  uncomplete(id){
     axios.get(`/api/jobs/uncomplete/${id}`).then( res => {
       console.log('send back')
       window.location.reload();
     })
  }



  render() {

    return (
      <div className="animated">
        <Card>
          <CardHeader>
            <i className="icon-menu"></i>{this.props.name}{' '}
          </CardHeader>
          <CardBody>
            <BootstrapTable data={this.props.data || this.table} version="4" striped hover pagination search options={this.options}>
            <TableHeaderColumn dataFormat={this.goButton}></TableHeaderColumn>
            <TableHeaderColumn isKey dataField="id" dataSort>JobId</TableHeaderColumn>
            <TableHeaderColumn dataField="name">Job Name</TableHeaderColumn>
            <TableHeaderColumn dataField="homeownerName">Homeowner Name</TableHeaderColumn>
            <TableHeaderColumn dataField="contact" hidden={true}>Site Contact</TableHeaderColumn>
            <TableHeaderColumn dataField="cname" hidden={true}>Client Name</TableHeaderColumn>
            <TableHeaderColumn dataField="cphone" hidden={true}>Client Phone</TableHeaderColumn>
            <TableHeaderColumn dataField="street"hidden={true}>Street Address</TableHeaderColumn>
            <TableHeaderColumn dataField="cost" hidden={true}>cost</TableHeaderColumn>
            <TableHeaderColumn dataFormat={this.address} dataSort>Address</TableHeaderColumn>
            <TableHeaderColumn dataField='siteNumber' dataSort>Phone</TableHeaderColumn>
            <TableHeaderColumn dataField="comments" dataSort>Comments</TableHeaderColumn>
            <TableHeaderColumn dataFormat={this.doneButton}></TableHeaderColumn>
            </BootstrapTable>
          </CardBody>
        </Card>
      </div>
    );
  }
}

export default withRouter(DataTable);
