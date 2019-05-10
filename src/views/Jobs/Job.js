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
  NavLink,
  Pagination,
  PaginationItem,
  PaginationLink,
  Table
} from 'reactstrap';

import DataTable from '../Tables/DataTable/DataTable';
import { createBrowserHistory } from 'history';
import { Route , withRouter} from 'react-router-dom';
import {withScriptjs, withGoogleMap, GoogleMap, Marker, InfoWindow } from 'react-google-maps';
import Summary from './Summary/Summary.js'


const defaultZoom = 11;
const defaultCenter = {lat: 37.431489, lng: -122.163719};

const groupBy = key => array =>
  array.reduce((objectsByKeyValue, obj) => {
    const value = obj[key];
    objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
    return objectsByKeyValue;
  }, {});
// const locations = [
//   {
//     lat: 37.431489,
//     lng: -122.163719,
//     label: 'S',
//     draggable: false,
//     title: 'Stanford',
//     www: 'https://www.stanford.edu/'
//   }
// ];

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
    console.log('loc', location)
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

// class MarkerList extends Component {
//   constructor(props) {
//     super(props);
//     this.state = {};
//   }
//
//   render() {
//     return this.props.locations.map((location, index) => {
//         return (
//           <MarkerWithInfoWindow key={index.toString()} location={location}/>
//         )
//       }
//     );
//   }
// }

const Insrow = (props) => {
  let location;
  let color;

  if(props && props.result == 'POSITIVE'){
    color = '#acb5bc'
  }
  if(props.location == 'InsSheet' && props.component != 'Exterior Doorway' && props.component != 'Exterior Window' && props.component != 'Misc Exterior'){
    location = 'Interior'
  }
  else if(props.unit == 'Calibration'){
    location = ''
  }
  else {
    location = 'Exterior'
  }
  console.log('pp',props , location)
  return(<tr style={{"backgroundColor":color}}>
      <td>{props.sampleId + 1|| "0"}</td>
      <td>{props.unit|| ''}</td>
      <td>{location + ' ' + props.room}</td>
      <td>{props.side|| ''}</td>
      <td>{props.item}</td>
      <td>{props.material}</td>
      <td>{props.condition || ''}</td>
      <td>{props.reading || '0'}</td>
      <td>{props.result || ' '}</td>
      <td>{props.type? props.type+', ': ""}{props.comments || ' '}</td>
    </tr>)
}


  const GoogleMapsComponent = withScriptjs(withGoogleMap((props) => {
    console.log('gprops',props)
      if(props && props.center && props.locations[0].title){
        return (
          <GoogleMap defaultZoom={defaultZoom} defaultCenter={{lat:props.center.lat, lng:props.center.lng}}>
            <MarkerWithInfoWindow location={props.locations[0]}/>
          </GoogleMap>
        );
      }
    }
  ));


class Job extends Component {
  constructor(props) {
    super(props);
    this.toggle = this.toggle.bind(this);
    this.toggleFade = this.toggleFade.bind(this);
    this.formatCommonData = this.formatCommonData.bind(this);
    this.formatIntData = this.formatIntData.bind(this);
    this.formatExtData = this.formatExtData.bind(this);
    this.getInspections = this.getInspections.bind(this);
    this.getJobInfo = this.getJobInfo.bind(this);
    this.markInspected = this.markInspected.bind(this)
    this.state = {
      data:false,
      collapse: true,
      fadeIn: true,
      timeout: 300,
      actionlevel: 0.7,
      locations:[]
    };
  }
  formatCommonData(data){
    const final = []
    const groupBylocation= groupBy('location');
    const groupByMaterial= groupBy('material');
    const groupByName= groupBy('name');
    if(groupBylocation(data).Common){
      let material = groupByMaterial(groupBylocation(data).Common)
      console.log('BIGDATA', material)
      console.log('BIGDATA COmp', groupByName(material.Wood))
      let wood = groupByName(material.Wood)
      Object.keys(groupByName(material.Wood)).map(k => {
        let pos = []
        let neg = []
        wood[k].map( x => x.result == 'Negative'? neg.push(x): pos.push(x))
        final.push({component:wood[k][0].material+' '+k, material: wood[k][0].material, number:wood[k].length, numpos:pos.length, numneg:neg.length, percentpos:((pos.length * 100) / wood[k].length), percentneg:((neg.length * 100) / wood[k].length)})
        console.log('BIGDATA fin', final)
      })
    }
    return final
  }
  formatIntData(data){
    const final = []
    let fdat = data.map( d =>
      {
        if(d.name == "Wall A" || d.name == "Wall B" || d.name == "Wall C" || d.name == "Wall D"){
          d.name = 'Wall'
        }
        return d
      })
    const groupBylocation= groupBy('location');
    const groupByMaterial= groupBy('material');
    const groupByName= groupBy('name');
    if(groupBylocation(fdat).InsSheet){
      let material = groupByMaterial(groupBylocation(fdat).InsSheet)
      //console.log('BIGINS', material)
      Object.keys(material).map( m => {
       //console.log('BIGINS COmp', groupByName(material[m]))
       let mat = groupByName(material[m])
       Object.keys(groupByName(material[m])).map(k => {
         let pos = []
         let neg = []
         mat[k].map( x => x.result == 'Negative'? neg.push(x): pos.push(x))
         final.push({component:mat[k][0].material + ' '+ k, material: mat[k][0].material, number:mat[k].length, numpos:pos.length, numneg:neg.length, percentpos:((pos.length * 100) / mat[k].length), percentneg:((neg.length * 100) / mat[k].length)})
         //console.log('BIGDATA fin', final)
       })
      })
    }
    return final
  }

  formatExtData(data){
    const final = []
    let fdat = data.map( d =>
      {
        if(d.name == "A - Wall" || d.name == "B - Wall" || d.name == "C - Wall" || d.name == "D - Wall" ){
          d.name = 'Wall'
        }
        return d
      })
    const groupBylocation= groupBy('location');
    const groupByMaterial= groupBy('material');
    const groupByName= groupBy('name');
    if(groupBylocation(fdat).ExtSheet){
      let material = groupByMaterial(groupBylocation(fdat).ExtSheet)
      //console.log('BIGINS', material)
      Object.keys(material).map( m => {
       //console.log('BIGINS COmp', groupByName(material[m]))
       let mat = groupByName(material[m])
       Object.keys(groupByName(material[m])).map(k => {
         let pos = []
         let neg = []
         mat[k].map( x => x.result == 'Negative'? neg.push(x): pos.push(x))
         final.push({component:mat[k][0].material + ' '+ k, material: mat[k][0].material, number:mat[k].length, numpos:pos.length, numneg:neg.length, percentpos:((pos.length * 100) / mat[k].length), percentneg:((neg.length * 100) / mat[k].length)})
         //console.log('BIGDATA fin', final)
       })
      })
    }
    return final
  }

  markInspected(id) {
      axios.get(`/api/jobs/markInspected/${id}`)
       .then( res => {
         this.props.history.push('/dashboard')
       })
  }

  getJobInfo(){
    axios(
      {
        url: '/api/jobs/get',
        method: 'post',
        data: {
         id: this.props.match.params.id
        }
      })
      .then( res => {
        this.setState({jobInfo:res.data[0]})
        ////action level async isue
        this.setState({actionLevel:res.data[0].actionLevel})
        axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${res.data[0].address}&key=AIzaSyA3FkbIxQAgVDWNej22DnBn6XzhHjoK5nc`).then(results => {
          if( results.data.results[0] && results.data.results.length){
            let loc = {
              lat: results.data.results[0].geometry.location.lat,
              lng: results.data.results[0].geometry.location.lng,
              draggable: false,
              title: res.data[0].address,
            }
            console.log(loc)
            this.setState({locations:[loc]})
            this.getInspections()
          }
        })
      })
  }

  getInspections(){
    console.log('called get')
     axios({
      url: '/api/inspections/get',
      method: 'post',
      data: {
        id: this.props.match.params.id
      }
    }).then( res => {
      let states = res.data.map( i => {
        return JSON.parse(i.state)
      })
      //console.log(states)
      this.setState({data:states})
      let rows = [];
      let calibrationStart = []
      let calibrationEnd = []
      states.map(x => {
        x.data.map( checklist => {
          if(checklist.type=='calibration'){
            if( checklist.startone){
              let result = (Math.round(checklist.startone * 100) >= Math.round(this.state.actionLevel * 100)) ? 'POSITIVE': 'Negative'
              rows.push({reading: checklist.startone || 'n/a', result: result, name: '1.0 mg/cm2 Standard', material: "Wood", unit: 'Calibration', location:'', room: 'Start of Job', side:' ', condition:'Intact'})
            }
            if( checklist.starttwo){
              let result = (Math.round(checklist.starttwo * 100) >= Math.round(this.state.actionLevel * 100)) ? 'POSITIVE': 'Negative'
              rows.push({reading: checklist.starttwo || 'n/a', result: result, name: '1.0 mg/cm2 Standard', material: "Wood", unit: 'Calibration', location:'',  room: 'Start of Job', side:' ', condition:'Intact'})
            }
            if( checklist.startthree){
              let result = (Math.round(checklist.startthree * 100) >= Math.round(this.state.actionLevel * 100)) ? 'POSITIVE': 'Negative'
              rows.push({reading: checklist.startthree || 'n/a', result: result, name: '1.0 mg/cm2 Standard', material: "Wood", unit: 'Calibration', location:'', room: 'Start of Job', side:' ', condition:'Intact'})
            }
          }
        })
        //console.log("sheets and checklists", x)
        let sample = {};
        x.insSheets.map(s => {
          let room = s.name
          let location = s.type
          let extSide;
          let extDirecton;
          let unit
          if(s.type == "ExtSheet"){
            extSide = s.data[0].side
            room = s.data[0].direction
          }
          //console.log('sheet', s)
          s.data.map(d => {
            console.log('data', d)
            let comments = d.comments
            let side

            if(s.type == "ExtSheet"){
               side = extSide
            }
            else{
               side = d.side
            }
            if(d.title == 'Sheet Details' || d.title =='Exterior Sheet Details' ){
              unit = d.unit + ' ' + d.building
              if(s.type == "ExtSheet"){
                unit = unit + ' '+ s.name
              }
            }

            let component = d.title
            let type = d.doorType || d.type

            //console.log(d.title)
            if (d.title !='Exterior Sheet Details' && d.title != 'Sheet Details' && d.title !='Soil Sample Details' && d.title !='Dust Sample Details' && d.type !='sample'){
              Object.keys(d).map( obj => {
                if (obj != 'id' && obj != 'loc' && obj != 'doorType' && obj != 'comments' && obj != 'side' &&  obj != 'type' && obj != 'expanded' && obj != 'done' && obj != 'title' && obj != 'leadsTo' && obj != 'windowType'
              && obj != 'unit'){
                  let item = obj
                  console.log('ah', d[obj])
                  let material
                    if(d[obj] && d[obj].M){
                     material = d[obj].M
                    }
                    else{
                     console.log('no material' , d, obj)
                     material = null
                    }
                    if(d[obj] && d[obj].S){
                     side = d[obj].S
                    }
                  let condition = d[obj].I? 'Intact':'Deteriorated'
                  let reading = d[obj].R
                  let name = d[obj].name
                  if(reading != null){
                    let result = (Math.round(reading * 100) >= Math.round(this.state.actionLevel * 100)) ? 'POSITIVE': 'Negative'
                    console.log(item, material, condition, reading, side, result, room, name,location, component, comments, type, unit)
                    //console.log('r', reading)
                    rows.push({item, material, condition, reading, result, side, room, name,location, component, comments, type, unit, extDirecton})
                  }

                }
              })
            }
          })
        })
        x.data.map( checklist => {
          if(checklist.type=='calibration'){
            if(checklist.endone){
              let result = (Math.round(checklist.endone * 100) >= Math.round(this.state.actionLevel * 100)) ? 'POSITIVE': 'Negative'
              rows.push({reading: checklist.endone, result:result,  name: '1.0 mg/cm2 Standard', material: "Wood", unit: 'Calibration', location:'',  room: 'End of Job', side:' ', condition:'Intact'})
            }
            if(checklist.endtwo){
              let result = (Math.round(checklist.endtwo* 100) >= Math.round(this.state.actionLevel * 100)) ? 'POSITIVE': 'Negative'
              rows.push({reading: checklist.endtwo, result:result,  name: '1.0 mg/cm2 Standard', material: "Wood", unit: 'Calibration', location:'',  room: 'End of Job', side:' ', condition:'Intact'})
            }
            if(checklist.endthree){
              let result = (Math.round(checklist.endthree * 100) >= Math.round(this.state.actionLevel * 100)) ? 'POSITIVE': 'Negative'
              rows.push({reading: checklist.endthree, result:result, name: '1.0 mg/cm2 Standard', material: "Wood", unit: 'Calibration', location:'', room: 'End of Job', side:' ', condition:'Intact'})

            }
          }
        })
      })
      //console.log(rows)
      this.setState({rows:rows})
      //console.log(this.state.rows)
    })
  }

  toggle() {
    this.setState({ collapse: !this.state.collapse });
  }

  toggleFade() {
    this.setState((prevState) => { return { fadeIn: !prevState }});
  }

  async componentDidMount(){
    await this.getJobInfo()
  }

  render() {
    console.log('y',this.state.jobInfo)
    return (
      <div className="animated fadeIn">

      <div className="card">
        <div className="card-header">
          Job Info
        </div>
        <div className="card-body">
          <div className="bd-example">
            <dl className="row">
              <dd className="col-sm-3">Job Id:</dd>
              <dt className="col-sm-9">{this.state.jobInfo? this.state.jobInfo.id : ''}</dt>
              <dd className="col-sm-3">Project Name</dd>
              <dt className="col-sm-9">{this.state.jobInfo? this.state.jobInfo.name : ''}</dt>
              <dd className="col-sm-3">Address</dd>
              <dt className="col-sm-9">{this.state.jobInfo? this.state.jobInfo.address : ''}</dt>
              <dd className="col-sm-3">Site Contact</dd>
              <dt className="col-sm-9">{this.state.jobInfo? this.state.jobInfo.siteName : ''}</dt>
              <dd className="col-sm-3">Site Contact Number</dd>
              <dt className="col-sm-9">{this.state.jobInfo? this.state.jobInfo.siteNumber : ''}</dt>
              <dd className="col-sm-3">Homeowner Name</dd>
              <dt className="col-sm-9">{this.state.jobInfo? this.state.jobInfo.homeownerName : ''}</dt>
              <dd className="col-sm-3">Homeowner Number</dd>
              <dt className="col-sm-9">{this.state.jobInfo? this.state.jobInfo.homeownerNumber : ''}</dt>
              <dd className="col-sm-3">Billing Name</dd>
              <dt className="col-sm-9">{this.state.jobInfo? this.state.jobInfo.billingName : ''}</dt>
              <dd className="col-sm-3">Action Level</dd>
              <dt className="col-sm-9">{this.state.jobInfo? this.state.jobInfo.actionLevel : ''}</dt>
              <dd className="col-sm-3">Recieved date</dd>
              <dt className="col-sm-9">{this.state.jobInfo? this.state.jobInfo.recievedDate : ''}</dt>
              <dd className="col-sm-3">Scheduled date</dd>
              <dt className="col-sm-9">{this.state.jobInfo? this.state.jobInfo.scheduledDate : ''}</dt>
              <dd className="col-sm-3">Intake notes</dd>
              <dt className="col-sm-9">{this.state.jobInfo? this.state.jobInfo.comments : ''}</dt>
              <dd className="col-sm-3">Number of Beds</dd>
              <dt className="col-sm-9">{this.state.jobInfo? this.state.jobInfo.numbeds : ''}</dt>
              <dd className="col-sm-3">Number of Baths</dd>
              <dt className="col-sm-9">{this.state.jobInfo? this.state.jobInfo.numbaths : ''}</dt>
              <dd className="col-sm-3">Square feet</dd>
              <dt className="col-sm-9">{this.state.jobInfo? this.state.jobInfo.sqft : ''}</dt>
              <dd className="col-sm-3">Arrive Early?</dd>
              <dt className="col-sm-9">{this.state.jobInfo && this.state.jobInfo.early? 'yes': 'no'}</dt>
              <dd className="col-sm-3">Dogs?</dd>
              <dt className="col-sm-9">{this.state.jobInfo && this.state.jobInfo.dogs? 'yes': 'no'}</dt>
              <dd className="col-sm-3"></dd>
              <dt className="col-sm-9">{this.state.jobInfo ? this.state.jobInfo.gooddogs : ''}</dt>
              <br></br>
              <br></br>
              <br></br>
              {this.state.jobInfo && this.state.jobInfo.inspected!=1 ?
                <dd className="col-sm-3">
                  <Button color="success" onClick={() => this.markInspected(this.state.jobInfo.id)}>Mark Inspected</Button>
                </dd>
              :
            ''}

            </dl>
            <dl>
            </dl>
          </div>
        </div>
      </div>


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

        <Row>
            <Col xs="12" lg="12">
              <Card>
                <CardHeader>
                  <i className="fa fa-align-justify"></i> Field Data
                </CardHeader>
                <CardBody>
                  <Table responsive>
                    <thead>
                    <tr>
                      <th>Sample</th>
                      <th>Unit ID/Location</th>
                      <th>Room Equivalent</th>
                      <th>Side</th>
                      <th>Component</th>
                      <th>Substrate</th>
                      <th>Condition</th>
                      <th>Lead</th>
                      <th>Results</th>
                      <th>Comments</th>
                    </tr>
                    </thead>
                    <tbody>
                    {this.state.calibrationStart ? this.state.calibrationStart.map((c, i) => {
                      return <Insrow key={i} sampleId={i} item={"Calibration"} reading={c} />
                    }): '' }
                    {this.state.rows ? this.state.rows.map( (x, i) => {

                      //let result = (Math.round(x.reading * 100) >= Math.round(this.state.actionLevel * 100)) ? 'POSITIVE': 'Negative'
                      // fieldData.push({
                      //   key:i,
                      //   sampleId:i,
                      //   side:x.side,
                      //   item:x.name,
                      //   material:x.material,
                      //   room:x.room,
                      //   reading:x.reading,
                      //   result:result,
                      //   condition:x.condition,
                      //   type:x.type,
                      //   comments:x.comments,
                      //   location:x.location,
                      //   component:x.component,
                      //   unit:x.unit
                      // })
                      return <Insrow key={i} sampleId={i} side={x.side} item={x.name} material={x.material} room={x.room} reading={x.reading} result={x.result} condition={x.condition} type={x.type} comments={x.comments} location={x.location} component={x.component} unit={x.unit} />
                    }): <tr><td>"No Inspection Data"</td></tr>}
                    </tbody>
                  </Table>
                </CardBody>
              </Card>
            </Col>

        </Row>
              {this.state.rows ?
                <div>
                <Summary name={'SUMMARY OF INTERIOR'} data={this.formatIntData(this.state.rows)}/>
                <Summary name={'SUMMARY OF EXTERIOR'} data={this.formatExtData(this.state.rows)}/>
                <Summary name={'SUMMARY OF CALIBRATION'} data={this.formatCommonData(this.state.rows)}/>
                </div>
                :
                ''
              }

      </div>



    );
  }
}

export default withRouter(Job);
