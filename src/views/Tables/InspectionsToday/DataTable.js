import React, {Component} from 'react';
import {Card, CardHeader, CardBody} from 'reactstrap';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import 'react-bootstrap-table/dist//react-bootstrap-table-all.min.css';
import data from './_data';


class DataTable extends Component {
  constructor(props) {
    super(props);
    this.table = data.rows;
    this.options = {
      sortIndicator: true,
      hideSizePerPage: true,
      paginationSize: 3,
      hidePageListOnlyOnePage: true,
      clearSearch: true,
      alwaysShowAllBtns: false,
      withFirstAndLast: false
    }
    this.filterJobs = this.filterJobs.bind(this)
  }

  componentDidMount(){
    this.filterJobs(this.props.data)
  }

  filterJobs(data){
    console.log('filter', data)
    console.log('filter2', this.props.data)
  }

  address(cell, row){
    console.log('address props', cell, row)
   return(row.street +' '+ row.city +' '+ row.state +' '+ row.postal)
  }

  render() {

    return (
      <div className="animated">
        <Card>
          <CardHeader>
            <i className="icon-menu"></i>{this.props.name}{' '}
          </CardHeader>
          <CardBody>
            <BootstrapTable data={this.props.data} version="4" striped hover pagination search options={this.options}>
              <TableHeaderColumn isKey dataField="id" dataSort>JobId</TableHeaderColumn>
              <TableHeaderColumn dataField="name">Job Name</TableHeaderColumn>
              <TableHeaderColumn dataField="company">Company</TableHeaderColumn>
              <TableHeaderColumn dataField="homeownerName">Homeowner Name</TableHeaderColumn>
              <TableHeaderColumn dataField="homeownerNumber">Homeowner Phone</TableHeaderColumn>
              <TableHeaderColumn dataField="address" dataFormat={this.address} dataSort></TableHeaderColumn>
              <TableHeaderColumn dataField="comments" dataSort>Comments</TableHeaderColumn>
            </BootstrapTable>
          </CardBody>
        </Card>
      </div>
    );
  }
}

export default DataTable;
