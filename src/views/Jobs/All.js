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
  NavLink
} from 'reactstrap';
import AllJobs from '../Tables/All/DataTable';import {withScriptjs, withGoogleMap, GoogleMap, Marker, InfoWindow } from 'react-google-maps';
const defaultZoom = 11;
const defaultCenter = {lat: 37.431489, lng: -122.163719};
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

const axios = require('axios')

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
    const {location, icon} = this.props;

    return (
      <Marker onClick={this.toggle} icon={location.icon} position={location} title={location.title} label={location.label}>
        {this.state.isOpen &&
        <InfoWindow onCloseClick={this.toggle}>
        <div>
            <p>{location.title}</p>
            <p>{location.hname}</p>
            <p>{location.phone}</p>
          <NavLink href={location.www} target="_blank">
            <p>{location.address}</p>
          </NavLink>
        </div>
        </InfoWindow>}
      </Marker>
    )
  }
}

class MarkerList extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return this.props.locations.map((location, index) => {
        console.log('l', location)
        if(location && location.title){
          return (
            <MarkerWithInfoWindow key={index.toString()} location={location}/>
          )
        }
      }
    );
  }
}

  const GoogleMapsComponent = withScriptjs(withGoogleMap((props) => {
      return (
        <GoogleMap defaultZoom={defaultZoom} defaultCenter={props.center}>
          {<MarkerList locations={props.locations}/>}
        </GoogleMap>
      );
    }
  ));

class All extends Component {
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.toggleFade = this.toggleFade.bind(this);
    this.state = {
      data: [],
      collapse: true,
      fadeIn: true,
      timeout: 300,
      locations:[]
    };
  }

  toggle() {
    this.setState({ collapse: !this.state.collapse });
  }

  toggleFade() {
    this.setState((prevState) => { return { fadeIn: !prevState }});
  }

  componentDidMount(){
    this.getDoneJobs()
    console.log(this.state)
  }
  getDoneJobs(){
    console.log('get all')
    axios.get('/api/jobs/all').then( res => {
      console.log(res.data)
      this.setState({data:res.data})
      let promises = [];
      res.data.map( j => {
        let label;
        let image = ''
        if(j.inspector == "1") {
         //label = 'M'
         image = 'http://maps.google.com/mapfiles/ms/icons/green.png';
        }
        if(j.inspector == "2") {
         //label = 'J'
         image = 'http://maps.google.com/mapfiles/ms/icons/red.png';
        }
        if(j.inspector == "3") {
         //label = 'K'
         image = 'http://maps.google.com/mapfiles/ms/icons/blue.png';
        }
        if(j.street){
          promises.push(
            axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${j.street + ' ' + j.city +' '+ j.state + '' + j.postal}&key=AIzaSyA3FkbIxQAgVDWNej22DnBn6XzhHjoK5nc`)
              .then(result => {
                console.log('JAY',j)
                if( result.data.results[0] && result.data.results.length){
                  return {
                        lat: result.data.results[0].geometry.location.lat,
                        lng: result.data.results[0].geometry.location.lng,
                        hname: j.homeownerName,
                        label: label,
                        draggable: false,
                        title: j.name,
                        icon:image,
                        phone:j.siteNumber,
                        address: j.street + ' ' + j.city
                      }
                }
                else {
                  console.log('dont push')
                }
              })
            )
        }
      })
      Promise.all(promises).then(res => {
       this.setState({locations:res});
      })
    })
  }

  render() {
    return (
      <div className="animated fadeIn">
        <Row>
          <Col xs="12" md="12">
            <AllJobs name='All Jobs' data={this.state.data}/>
            <div className="animated fadeIn">
              <Card>
                <CardHeader>
                  <i className="icon-map"></i> Google Maps
                </CardHeader>
                <CardBody>
                {this.state.locations.length ?  <GoogleMapsComponent
                    locations={this.state.locations}
                    center={this.state.locations[0]}
                    key="map"
                    googleMapURL="https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places&key=AIzaSyA3FkbIxQAgVDWNej22DnBn6XzhHjoK5nc"
                    loadingElement={<div style={{height: `100%`}}/>}
                    containerElement={<div style={{height: `400px`}}/>}
                    mapElement={<div style={{height: `100%`}}/>}
                  />: null }
                </CardBody>
              </Card>
            </div>
          </Col>
        </Row>
      </div>
    );
  }
}

export default All;
