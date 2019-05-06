import React, {Component} from 'react';
import {Card, CardHeader, CardBody, Button} from 'reactstrap';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import 'react-bootstrap-table/dist//react-bootstrap-table-all.min.css';
import data from './_data';
import { createBrowserHistory } from 'history';
import { Route , withRouter} from 'react-router-dom';
const axios = require('axios')
const history = createBrowserHistory();


class DataTable extends Component {
  constructor(props) {
    super(props);
    this.table = data.rows;
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

  goButton(cell, row){
     return (<div><Button color="success" onClick={() =>  this.props.history.push('/create/'+row.id)}>Open</Button></div>)
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
            <TableHeaderColumn dataField="name"> Job Name</TableHeaderColumn>
            <TableHeaderColumn dataField="client"> Client Name</TableHeaderColumn>
            <TableHeaderColumn dataField="cost"> Cost</TableHeaderColumn>
            <TableHeaderColumn dataField="recievedDate"> Recieved Date</TableHeaderColumn>
            <TableHeaderColumn dataField="address" dataSort>Address</TableHeaderColumn>
            <TableHeaderColumn dataField="comments" dataSort>Comments</TableHeaderColumn>
            </BootstrapTable>
          </CardBody>
        </Card>
      </div>
    );
  }
}

export default  withRouter(DataTable);
