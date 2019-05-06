import React, { Component } from 'react';
import {Card, CardHeader, CardBody} from 'reactstrap';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import 'react-bootstrap-table/dist//react-bootstrap-table-all.min.css';

class Summary extends Component {
  render(){
        console.log("HHHH",this.props)
    return(
      <div className="animated">
        <Card>
          <CardHeader>
            <i className="icon-menu"></i>{this.props.name}{' '}
          </CardHeader>
          <CardBody>
            <BootstrapTable data={this.props.data} version="4" striped hover search options={this.options}>
              <TableHeaderColumn isKey dataField="component" dataSort>Component</TableHeaderColumn>
              <TableHeaderColumn dataField="number">Number Tested</TableHeaderColumn>
              <TableHeaderColumn dataField="numpos" dataSort>Number Positive</TableHeaderColumn>
              <TableHeaderColumn dataField="percentpos" dataSort>Percent Positive</TableHeaderColumn>
              <TableHeaderColumn dataField="numneg" dataSort>Number Negative</TableHeaderColumn>
              <TableHeaderColumn dataField="percentneg" dataSort>Percent Negative</TableHeaderColumn>
            </BootstrapTable>
          </CardBody>
        </Card>
      </div>)
  }
}


export default Summary;
