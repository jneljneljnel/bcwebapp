import React, {Component} from 'react';
import {Card, CardHeader, CardBody, Button, NavLink} from 'reactstrap';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import 'react-bootstrap-table/dist//react-bootstrap-table-all.min.css';
import data from './_data';
import { createBrowserHistory } from 'history';
import { Route , withRouter} from 'react-router-dom';
import {withScriptjs, withGoogleMap, GoogleMap, Marker, InfoWindow } from 'react-google-maps';
const defaultZoom = 11;
const defaultCenter = {lat: 37.431489, lng: -122.163719};
const moment = require('moment');

const locations = [
  {
    lat: 37.431489,
    lng: -122.163719,
    label: 'S',
    draggable: false,
    title: 'Stanford',
    www: 'https://www.stanford.edu/'
  },
];


const dateFormatter = (cell, row) => {
  return(<div>{moment(cell).format('MMMM Do YYYY')}</div>)
}
const axios = require('axios')
const history = createBrowserHistory();


class MarkerWithInfoWindow extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false
    };
    this.toggle = this.toggle.bind(this);
  }

  toggle() {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }
  render() {
    const {location} = this.props;

    return (
      <Marker onClick={this.toggle} position={location} title={location.title} label={location.label}>
        {this.state.isOpen &&
        <InfoWindow onCloseClick={this.toggle}>
          <NavLink href={location.www} target="_blank">{location.title}</NavLink>
        </InfoWindow>}
      </Marker>
    )
  }
}



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

  componentDidMount(){
    let addy='819 north rockwell street chicago illinois'
    this.state.data.map( j => console.log('D',this.props.data))
    axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${addy}&key=AIzaSyA3FkbIxQAgVDWNej22DnBn6XzhHjoK5nc`).then(res => {
      //console.log(res.data.results[0].geometry.location)
    })
  }
  goButton(cell, row){
     return (<div><Button color="success" onClick={() =>  this.props.history.push('/jobs/'+row.id)}>Open</Button></div>)
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
            <TableHeaderColumn dataField="inspectionDate" dataFormat={dateFormatter}> Inspection Date</TableHeaderColumn>
            <TableHeaderColumn dataField="address" dataSort>Address</TableHeaderColumn>
            <TableHeaderColumn dataField="comments" dataSort>Comments</TableHeaderColumn>
            </BootstrapTable>
          </CardBody>
        </Card>
      </div>
    );
  }
}

export default withRouter(DataTable);
