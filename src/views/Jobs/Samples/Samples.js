import React, { Component } from 'react';
import {Card, CardHeader, CardBody, Button} from 'reactstrap';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import 'react-bootstrap-table/dist//react-bootstrap-table-all.min.css';

class Samples extends Component {
  constructor(props) {
    super(props);

    this.editButton = this.editButton.bind(this)

  }
    editButton(cell, row) {
      return  <Button onClick={() => this.props.editSample(row)}>edit</Button>
    }

  render(){
        //console.log("HHHH",this.props)
    return(
      <div className="animated">
        <Card>
          <CardHeader>
            <i className="icon-menu"></i>Samples
          </CardHeader>
          <CardBody>
            <BootstrapTable data={this.props.data} version="4" striped hover search options={this.options}>
              <TableHeaderColumn isKey dataField="title" dataSort>Title</TableHeaderColumn>
              <TableHeaderColumn  dataField="area" dataSort>area</TableHeaderColumn>
              <TableHeaderColumn  dataField="surface" dataSort>Surface</TableHeaderColumn>
              <TableHeaderColumn  dataField="R" dataSort>Reading</TableHeaderColumn>
              <TableHeaderColumn  dataFormat={this.editButton} dataSort></TableHeaderColumn>
            </BootstrapTable>
          </CardBody>
        </Card>
      </div>)
  }
}


export default Samples;
