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

import Modal from 'react-modal';
import DataTable from '../Tables/DataTable/DataTable';
import { createBrowserHistory } from 'history';
import { Route , withRouter} from 'react-router-dom';
import {withScriptjs, withGoogleMap, GoogleMap, Marker, InfoWindow } from 'react-google-maps';

import htmlDocx from 'html-docx-js/dist/html-docx';
import { saveAs } from 'file-saver';
import juice from 'juice';
//var DocxMerger = require('docx-merger');

import fs from 'fs';
import path from 'path';

import Summary from './Summary/Summary.js'


const defaultZoom = 11;
const defaultCenter = {lat: 37.431489, lng: -122.163719};

const customStyles = {
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)'
  }
};

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
const portraitPageSize = 15;
const landscapePageSize = 11;


var MyBlobBuilder = function() {
  this.parts = [];
}

MyBlobBuilder.prototype.append = function(part) {
  this.parts.push(part);
  this.blob = undefined; // Invalidate the blob
};

MyBlobBuilder.prototype.getBlob = function() {
  if (!this.blob) {
    this.blob = new Blob(this.parts, { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
  }
  return this.blob;
};

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
    //console.log('loc', location)
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

function show_percent (e) { return ( e == 0 ) ? "" : ( e + ".00 % " ) }

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
    location = 'Common'
  }
  else {
    location = 'Exterior'
  }
  //console.log('pp',props , location)
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
      <td>  <Button onClick={() => props.openModal(props)}>edit</Button></td>
    </tr>)
}


  const GoogleMapsComponent = withScriptjs(withGoogleMap((props) => {
    //console.log('gprops',props)
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
    this.markInspected = this.markInspected.bind(this);

    // print Summary Related Functions
    this.printSummary = this.printSummary.bind(this);

    this.getPortraitHeader = this.getPortraitHeader.bind(this);
    this.getPortraitFooter = this.getPortraitFooter.bind(this);
    this.getInterior = this.getInterior.bind(this);
    this.getExterior = this.getExterior.bind(this);
    this.getCalibration = this.getCalibration.bind(this);


    this.dataReport = this.dataReport.bind(this);
    this.positiveExterior = this.positiveExterior.bind(this);
    this.positiveCommon = this.positiveCommon.bind(this);

    this.getLandscapeHeader = this.getLandscapeHeader.bind(this);
    this.getLandscapeFooter = this.getLandscapeFooter.bind(this);
    this.blankPageWithTitle = this.blankPageWithTitle.bind(this);
    this.openModal = this.openModal.bind(this);
    this.afterOpenModal = this.afterOpenModal.bind(this);
    this.closeModal = this.closeModal.bind(this);


    this.state = {
      data:false,
      collapse: true,
      fadeIn: true,
      timeout: 300,
      actionlevel: 0.7,
      locations:[],
      modalIsOpen: false
    };
  }

  openModal(props) {
    //console.log("yo",props)
    this.setState({modalStuff: props});
    this.setState({modalIsOpen: true});
  }

  afterOpenModal() {
   // references are now sync'd and can be accessed.
   this.subtitle.style.color = '#f00';
  }

  closeModal() {
   this.setState({modalIsOpen: false});
  }

  EditModal(){
    return (
        <button onClick={this.openModal}>Open Modal</button>
    );
  }

  formatCommonData(data){
    const final = []
    const groupBylocation= groupBy('location');
    const groupByMaterial= groupBy('material');
    const groupByName= groupBy('name');
    if(groupBylocation(data).Common){
      let material = groupByMaterial(groupBylocation(data).Common)
      //console.log('BIGDATA', material)
      //console.log('BIGDATA COmp', groupByName(material.Wood))
      let wood = groupByName(material.Wood)
      Object.keys(groupByName(material.Wood)).map(k => {
        let pos = []
        let neg = []
        wood[k].map( x => x.result == 'Negative'? neg.push(x): pos.push(x))
        final.push({component:wood[k][0].material+' '+k, material: wood[k][0].material, number:wood[k].length, numpos:pos.length, numneg:neg.length, percentpos:((pos.length * 100) / wood[k].length), percentneg:((neg.length * 100) / wood[k].length)})
        //console.log('BIGDATA fin', final)
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
            //console.log(loc)
            this.setState({locations:[loc]})
          }
        })
      })
  }

  getInspections(){
    //console.log('called get')
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
              rows.push({reading: checklist.startone || 'n/a', result: result, name: '1.0 mg/cm2 Standard', material: "Wood", unit: 'Calibration', location:'Common', room: 'Start of Job', side:' ', condition:'Intact'})
            }
            if( checklist.starttwo){
              let result = (Math.round(checklist.starttwo * 100) >= Math.round(this.state.actionLevel * 100)) ? 'POSITIVE': 'Negative'
              rows.push({reading: checklist.starttwo || 'n/a', result: result, name: '1.0 mg/cm2 Standard', material: "Wood", unit: 'Calibration', location:'Common',  room: 'Start of Job', side:' ', condition:'Intact'})
            }
            if( checklist.startthree){
              let result = (Math.round(checklist.startthree * 100) >= Math.round(this.state.actionLevel * 100)) ? 'POSITIVE': 'Negative'
              rows.push({reading: checklist.startthree || 'n/a', result: result, name: '1.0 mg/cm2 Standard', material: "Wood", unit: 'Calibration', location:'Common', room: 'Start of Job', side:' ', condition:'Intact'})
            }
          }
          if(checklist.type == "property details"){
            console.log("property details", checklist)
          }
          if(checklist.type == "5.0"){
            console.log("5.0", checklist)
          }
          if(checklist.type == "5.1"){
            console.log("5.1", checklist)
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
            //console.log('data', d)
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
                  //console.log('ah', d[obj])
                  let material
                    if(d[obj] && d[obj].M){
                     material = d[obj].M
                    }
                    else{
                     //console.log('no material' , d, obj)
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
                    //console.log(item, material, condition, reading, side, result, room, name,location, component, comments, type, unit)
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
              rows.push({reading: checklist.endone, result:result,  name: '1.0 mg/cm2 Standard', material: "Wood", unit: 'Calibration', location:'Common',  room: 'End of Job', side:' ', condition:'Intact'})
            }
            if(checklist.endtwo){
              let result = (Math.round(checklist.endtwo* 100) >= Math.round(this.state.actionLevel * 100)) ? 'POSITIVE': 'Negative'
              rows.push({reading: checklist.endtwo, result:result,  name: '1.0 mg/cm2 Standard', material: "Wood", unit: 'Calibration', location:'Common',  room: 'End of Job', side:' ', condition:'Intact'})
            }
            if(checklist.endthree){
              let result = (Math.round(checklist.endthree * 100) >= Math.round(this.state.actionLevel * 100)) ? 'POSITIVE': 'Negative'
              rows.push({reading: checklist.endthree, result:result, name: '1.0 mg/cm2 Standard', material: "Wood", unit: 'Calibration', location:'Common', room: 'End of Job', side:' ', condition:'Intact'})

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
    await this.getInspections()

  }



  printSummary() {
    var css = `
      h1 {
        font-family: Arial;
      }
      .heading {
        text-align:center;
      }

      hr {
        height : 3px;
        color: black;
      }

      .row {
        padding-left : 100px;
        padding-right : 100px;
      }

      .bold {
        font-weight: 700;
      }

      .footer div {
        display: block;
      }

      .right {
        text-align : right;
      }

      .left {
        text-align : left;
      }

      .center {
        text-align : center;
      }

      table thead tr th{
        border-bottom: 3px solid black;
        height: 50px;
        vertical-align: middle;
        text-align: center ;
        width : 30px;
      }

      table thead tr th:first-child{
        width : 300px;
        padding-right : 30px;
      }

      table thead tr th.number{
        width : 70px;
      }

      table thead tr th.percent{
        width : 150px;
      }

      table tbody tr td{
        border-bottom: 1px solid black;
        vertical-align: middle;
        text-align : center;
      }

      table tbody tr.blank, table tbody tr.blank td{
        border-bottom: none;
      }

      table tbody tr{
        vertical-align: middle;
      }

      table tbody tr td:first-child{
        padding-right : 30px;
        padding-left : 30px;
        text-align : left;
      }

      .table-responsive{
        border-spacing: 0px;

        margin: 0 auto;
      }

      .table-responsive table {
        border-collapse: collapse;
      }

      .table-responsive thead tr th{
        border-bottom: 3px solid black;
        height: 50px;
        vertical-align: middle;
        text-align: left;
      }

      .table-responsive thead tr th:first-child{
        text-align: right;
        width : 70px;
        padding-right: 10px;
      }

      .table-responsive thead tr th:nth-child(2) {
        width : 250px;
      }

      .table-responsive thead tr th:nth-child(3) {
        width : 300px;
      }

      .table-responsive thead tr th:nth-child(4) {
        width : 70px;
        text-align: center;
      }

      .table-responsive tbody tr td:nth-child(4) {
        text-align: center;
      }

      .table-responsive thead tr th:nth-child(5) {
        width : 250px;
      }

      .table-responsive thead tr th:nth-child(6) {
        width : 150px;
      }

      .table-responsive thead tr th:nth-child(7) {
        width : 150px;
      }

      .table-responsive thead tr th:nth-child(8) {
        width : 70px;
        text-align: center;
      }

      .table-responsive tbody tr td:nth-child(8) {
        text-align: center;
      }

      .table-responsive thead tr th:nth-child(9) {
        width : 150px;
      }

      .table-responsive thead tr th:nth-child(10) {
        width : 250px;
      }

      .table-responsive tbody tr td{
        border-bottom: 1px solid black;
        vertical-align: middle;
        text-align : left;
      }

      .table-responsive tbody tr{
        vertical-align: middle;
      }

      .table-responsive tbody tr td:first-child{
        text-align: right;
        padding-right: 10px;
      }

      .filter-table-responsive{
        border-spacing: 0px;

        margin: 0 auto;
      }

      .filter-table-responsive table {
        border-collapse: collapse;
      }

      .filter-table-responsive thead tr th{
        border-bottom: 3px solid black;
        height: 50px;
        vertical-align: middle;
        text-align: left;
      }

      .filter-table-responsive thead tr th:first-child{
        text-align: right;
        width : 100px;
        padding-right: 10px;
      }

      .filter-table-responsive thead tr th:nth-child(2) {
        width : 70px;
        text-align : center;
      }

      .filter-table-responsive tbody tr td:nth-child(2) {
        text-align : center;
      }

      .filter-table-responsive thead tr th:nth-child(3) {
        width : 300px;
      }

      .filter-table-responsive thead tr th:nth-child(4) {
        width : 300;
      }

      .filter-table-responsive thead tr th:nth-child(5) {
        width : 70px;
        text-align : center;
      }

      .filter-table-responsive tbody tr td:nth-child(5) {
        text-align : center;
      }

      .filter-table-responsive thead tr th:nth-child(6) {
        width : 100px;
      }

      .filter-table-responsive thead tr th:nth-child(7) {
        width : 120px;
      }

      .filter-table-responsive tbody tr td{
        border-bottom: 1px solid black;
        vertical-align: middle;
        text-align : left;
      }

      .filter-table-responsive tbody tr{
        vertical-align: middle;
      }

      .filter-table-responsive tbody tr td:first-child{
        text-align: right;
        padding-right: 10px;
      }

    `;
    var converted = '';
    var page = 1;

    //Get current date time
    var now = new Date();
    var isPM = now.getHours() >= 12;
    var isMidday = now.getHours() == 12;
    var time = [now.getHours() - (isPM && !isMidday ? 12 : 0),
      now.getMinutes(),
      now.getSeconds() || '00'].join(':') +
     (isPM ? ' PM' : ' AM');
    var datetime = "" + (now.getMonth()+1) + "/"
                    + now.getDate()  + "/"
                    + now.getFullYear() + " "
                    + time;

    // Interior Summary
    var content = this.getInterior(page, datetime);
    page ++;

    // Exterior Summary
    content += this.getExterior(page, datetime);
    page ++;

    // Calibration Summary
    content += this.getCalibration(page, datetime);

    content = juice.inlineContent(content, css);
    var converted = htmlDocx.asBlob(content, {orientation: 'portrait', margins: {top: 720, left : 700, right : 700, bottom: 400}});
    saveAs(converted, 'portrait.docx' );


    page ++;

    page = 1;
    content = '';

    var report = this.state.rows;

    // Exterior Lead Containing Components List
    var exteriorReport = report.filter(function(x){
      if(x.location == 'InsSheet' && x.component != 'Exterior Doorway' && x.component != 'Exterior Window' && x.component != 'Misc Exterior'){
        return false;
      }
      else if(x.unit == 'Calibration'){
        return false;
      }
      return x.result == "POSITIVE";
    });

    if(exteriorReport.length > 0)
    {
      content += this.positiveExterior(exteriorReport, page, datetime, 0);
      page ++;
    }

    // Common Lead Containing Components List
    var commonReport = report.filter(function(x){
      if(x.unit == 'Calibration'){
        return x.result == "POSITIVE";
      }
      return false;
    });


    if(commonReport.length > 0)
    {
      content += this.positiveCommon(commonReport, page, datetime, 0);
      page ++;
    }

    content += this.blankPageWithTitle("FIELD DATA");
    page =  1;


    // FIELD DATA REPORT
    var page_count = Math.floor( (report.length - 1) / landscapePageSize ) + 1 ;

    for ( var i = 0 ; i < page_count; i ++)
    {
      content += this.dataReport(report, page, datetime, i * landscapePageSize);
      page++;
    }


    // export to Docx
    content = juice.inlineContent(content, css);
    var converted = htmlDocx.asBlob(content, {orientation: 'landscape', margins: {top: 720, left : 100, right : 100, bottom : 400}});


    // two Blobs appending
    // var myBlobBuilder = new MyBlobBuilder();
    // myBlobBuilder.append(temp);
    // myBlobBuilder.append(converted);
    // console.log(new Blob([temp, converted]));

    saveAs(converted, 'landscape.docx');

  }

  getPortraitHeader(header) {
    return `
    <hr>
    <div class="heading">
      <h1>` + header + `</h1>
    </div>
    <div class="row" style="text-align:center;">
    <table style="width : 80%;">
      <tr style="width : 100%;">
        <td style="width : 50%;">
            <span class="bold">Project Name : </span>
            <span >` + (this.state.jobInfo? this.state.jobInfo.name : '') + `</span>
        </td>
        <td style="width : 50px; text-align:right">
            <span class="bold">Project Number : </span>
            <span >` + (this.state.jobInfo? this.state.jobInfo.id : '') + `</span>
        </td>
      </tr>
      <tr style="width : 100%;">
        <td style="width : 70%;">
            <span class="bold">Address : </span>
            <span >` + (this.state.jobInfo? this.state.jobInfo.address : '') + `</span>
        </td>
        <td style="width : 30px; text-align:right">

        </td>
      </tr>
    </table>
    </div>
    `;
  }

  getPortraitFooter(page, datetime) {

    return `
    <div class="footer">
      <span> Testing done in compliance with current L.A. County DHS guidelines for XRF</span>
      <hr>

      <div class="row" style="text-align:center;">
      <table style="width : 100%;">
        <tr style="width : 100%;">
          <td style="width : 40%; text-align:left; font-style: italic">
              <span class="bold">Barr & Clark Environmental (714) 894-5700</span>
          </td>
          <td style="width : 20%; text-align:center">
            ` + page +
          `</td>
          <td style="width : 40%; text-align:right">
            ` + datetime + `
          </td>
        </tr>
       </table>
    </div>
    <br clear="all" style="page-break-before:always" >`;
  }

  blankPageWithTitle(title) {
    return `<div >
    <br><br><br><br><br><br><br><br><br><br>
    <h2 style="font-size : 100px; text-align : center; vertical-align: middle;">`
    + title +
    `</h2>
    </div>
    <br clear="all" style="page-break-before:always" >`;
  }

  getInterior(page, datetime) {
    var interior = this.formatIntData(this.state.rows);

    var header = this.getPortraitHeader('SUMMARY OF INTERIOR');
    var footer = this.getPortraitFooter(page, datetime);

//    var contentDocument = document.getElementsByClassName('react-bs-table');
    var charSet = ' '

    var table = `<Table responsive>
      <thead>
      <tr>
        <th>Component</th>
        <th class="number">Number Tested</th>
        <th class="number">Number Positive</th>
        <th class="percent">Percent Positive</th>
        <th class="number">Number Negative</th>
        <th class="percent">Percent Negative</th>
      </tr>
      </thead>
      <tbody>`;
      var numberSum = 0, numberposSum = 0, numbernegSum = 0 ;
      interior.forEach( item => {
        numberSum += item.number;
        numberposSum += item.numpos;
        numbernegSum += item.numneg;
        table += '<tr>';
        table += '<td>' + item.component + '</td>';
        table += '<td>' + item.number + '</td>';
        table += '<td>' + item.numpos + '</td>';
        table += '<td>' + show_percent(item.percentpos) + '</td>';
        table += '<td>' + item.numneg + '</td>';
        table += '<td>' + show_percent(item.percentneg) + '</td>';
        table += '</tr>';
      })
      table += '<tr class="blank">';
        table += '<td class="bold" style="text-align:right;">ssTotal</td>';
        table += '<td class="bold">' + numberSum + '</td>';
        table += '<td class="bold">' + numberposSum + '</td>';
        table += '<td> </td>';
        table += '<td class="bold">' + numbernegSum + '</td>';
        table += '<td> </td>';
        table += '</tr>';

      for(var i = 0; i < portraitPageSize - interior.length; i ++)
      {
        table += '<tr class="blank">';
        table += '<td>' + '&nbsp;' + '</td>';
        table += '</tr>';
      }
      table += `</tbody>
    </Table>`;

    var content = charSet + header + table + footer;

    return content;

  }


  getExterior(page, datetime) {
    var exterior = this.formatExtData(this.state.rows);

    var header = this.getPortraitHeader('SUMMARY OF EXTERIOR');
    var footer = this.getPortraitFooter(page, datetime);

    var charSet = ' ';

    var table = `<Table responsive>
      <thead>
      <tr>
        <th>Component</th>
        <th class="number">Number Tested</th>
        <th class="number">Number Positive</th>
        <th class="percent">Percent Positive</th>
        <th class="number">Number Negative</th>
        <th class="percent">Percent Negative</th>
      </tr>
      </thead>
      <tbody>`;
      var numberSum = 0, numberposSum = 0, numbernegSum = 0 ;
      exterior.forEach( item => {
        numberSum += item.number;
        numberposSum += item.numpos;
        numbernegSum += item.numneg;
        table += '<tr>';
        table += '<td>' + item.component + '</td>';
        table += '<td>' + item.number + '</td>';
        table += '<td>' + item.numpos + '</td>';
        table += '<td>' + show_percent(item.percentpos) + '</td>';
        table += '<td>' + item.numneg + '</td>';
        table += '<td>' + show_percent(item.percentneg) + '</td>';
        table += '</tr>';
      })
      table += '<tr class="blank">';
        table += '<td class="bold" style="text-align:right;">Total</td>';
        table += '<td class="bold">' + numberSum + '</td>';
        table += '<td class="bold">' + numberposSum + '</td>';
        table += '<td> </td>';
        table += '<td class="bold">' + numbernegSum + '</td>';
        table += '<td> </td>';
        table += '</tr>';

      for(var i = 0; i < portraitPageSize - exterior.length; i ++)
      {
        table += '<tr class="blank">';
        table += '<td>' + '&nbsp;' + '</td>';
        table += '</tr>';
      }
      table += `</tbody>
    </Table>`;

    var content = charSet + header + table + footer;

    return content;

  }

  getCalibration(page, datetime) {
    var calibration = this.formatCommonData(this.state.rows);

    var header = this.getPortraitHeader('SUMMARY OF CALIBRATION');
    var footer = this.getPortraitFooter(page, datetime);

    var charSet = ' ';

    var table = `<Table responsive>
      <thead>
      <tr>
        <th>Component</th>
        <th class="number">Number Tested</th>
        <th class="number">Number Positive</th>
        <th class="percent">Percent Positive</th>
        <th class="number">Number Negative</th>
        <th class="percent">Percent Negative</th>
      </tr>
      </thead>
      <tbody>`;
      var numberSum = 0, numberposSum = 0, numbernegSum = 0 ;
      calibration.forEach( item => {
        numberSum += item.number;
        numberposSum += item.numpos;
        numbernegSum += item.numneg;
        table += '<tr>';
        table += '<td>' + item.component + '</td>';
        table += '<td>' + item.number + '</td>';
        table += '<td>' + item.numpos + '</td>';
        table += '<td>' + show_percent(item.percentpos) + '</td>';
        table += '<td>' + item.numneg + '</td>';
        table += '<td>' + show_percent(item.percentneg) + '</td>';
        table += '</tr>';
      })
      table += '<tr class="blank">';
        table += '<td class="bold" style="text-align:right;">Total</td>';
        table += '<td class="bold">' + numberSum + '</td>';
        table += '<td class="bold">' + numberposSum + '</td>';
        table += '<td> </td>';
        table += '<td class="bold">' + numbernegSum + '</td>';
        table += '<td> </td>';
        table += '</tr>';

      for(var i = 0; i < portraitPageSize - calibration.length; i ++)
      {
        table += '<tr class="blank">';
        table += '<td>' + '&nbsp;' + '</td>';
        table += '</tr>';
      }
      table += `</tbody>
    </Table>`;

    var content = charSet + header + table + footer;

    return content;

  }

  getLandscapeHeader(header) {
    return `
    <div class="heading">
      <h2>` + header + `</h2>
    </div>
    <div class="row" style="text-align:center;">
    <table style="width : 80%;">
      <tr style="width : 100%;">
        <td style="width : 50%;">
            <span class="bold">Project Name : </span>
            <span >` + (this.state.jobInfo? this.state.jobInfo.name : '') + `</span>
        </td>
        <td style="width : 50px; text-align:right">
            <span class="bold">Project Number : </span>
            <span >` + (this.state.jobInfo? this.state.jobInfo.id : '') + `</span>
        </td>
      </tr>
      <tr style="width : 100%;">
        <td style="width : 50%;">
            <span class="bold">Address : </span>
            <span >` + (this.state.jobInfo? this.state.jobInfo.address : '') + `</span>
        </td>
        <td style="width : 50px; text-align:right">
            <span class="bold">Protocol : </span>
            <span >` + 'LA Country' + `</span>
        </td>
      </tr>
    </table>
    </div>
    `;
  }

  getLandscapeFooter(page, datetime) {

    return `
    <div class="footer">
      <div> L.A. County DHS action level for lead paint is 0.7 mg/cm2.</div>
      <div> Positive is defined as XRF sampling with levels at or above 0.7 mg/cm2.</div>
      <hr>

      <div class="row" style="text-align:center;">
      <table style="width : 100%;">
        <tr style="width : 100%;">
          <td style="width : 40%; text-align:left; font-style: italic">
              <span class="bold">Barr & Clark Environmental (714) 894-5700</span>
          </td>
          <td style="width : 20%; text-align:center">
            ` + page +
          `</td>
          <td style="width : 40%; text-align:right">
            ` + datetime + `
          </td>
        </tr>
       </table>
    </div>
    <br clear="all" style="page-break-before:always" >`;
  }

  dataReport(report, page, datetime, startIndex) { // data, page_number, current datetime, start index in the array

    var charSet = ' ';
    var landscapeHeader = this.getLandscapeHeader('FIELD DATA REPORT');
    var landscapeFooter = this.getLandscapeFooter(page, datetime);

    var table = `<div class="table-responsive"> <table class="table">
      <thead>
      <tr>
        <th>Sample</th>
        <th>Unit ID/Location</th>
        <th>Room Equivalent</th>
        <th class="center">Side</th>
        <th>Component</th>
        <th>Substraste</th>
        <th>Condition</th>
        <th class="center">Lead</th>
        <th>Results</th>
        <th>Comments</th>
      </tr>
      </thead>
      <tbody>`;



      if(report) {
        for( i = startIndex; i < report.length; i ++ )
        {
          if(i >= startIndex + landscapePageSize)
            break;
          var x = report[i];

          let location;
          let color = "#fff";

          if(x && x.result == 'POSITIVE'){
            color = '#acb5bc'
          }
          if(x.location == 'InsSheet' && x.component != 'Exterior Doorway' && x.component != 'Exterior Window' && x.component != 'Misc Exterior'){
            location = 'Interior'
          }
          else if(x.unit == 'Calibration'){
            location = 'Common'
          }
          else {
            location = 'Exterior'
          }

          table += `<tr style="background-color:` + color + `">
              <td>` + (i+1) + `</td>
              <td>` + (x.unit|| '') + `</td>
              <td>` + (location + ' ' + x.room) + `</td>
              <td class="center">` + (x.side|| '') + `</td>
              <td>` + (x.name) + `</td>
              <td>` + (x.material) + `</td>
              <td>` + (x.condition || '') + `</td>
              <td class="center">` + (x.reading   || '0') + `</td>
              <td>` + (x.result || ' ') + `</td>
              <td>` + (x.type? x.type+', ': "") + (x.comments || ' ') + `</td>
            </tr>`;
        }
      }
      else {
        table += `<tr><td>"No Inspection Data"</td></tr>`;
      }

      if( startIndex + landscapePageSize > report.length) {
        for(var i = 0; i < startIndex + landscapePageSize - report.length; i ++)
        {
          table += '<tr class="blank">';
          table += '<td>' + '&nbsp;' + '</td>';
          table += '</tr>';
        }
      }
      table += `</tbody>
    </table></div>`;


    var content = charSet + landscapeHeader + table + landscapeFooter;

    return content;


  }

  positiveExterior(report, page, datetime, startIndex) { // data, page_number, current datetime, start index in the array

    var charSet = ' ';

    var landscapeHeader = this.getLandscapeHeader('Exterior Lead Containing Components List');
    var landscapeFooter = this.getLandscapeFooter(page, datetime);



    var table = `<div class="filter-table-responsive"> <table class="table">
      <thead>
      <tr>
        <th>Sample</th>
        <th class="center">Side</th>
        <th>Testing Combination</th>
        <th>Room Equivalent</th>
        <th class="center">Lead</th>
        <th>Results</th>
        <th>Condition</th>
        <th>Comments</th>
      </tr>
      </thead>
      <tbody>`;

      if(report) {
        for( i = startIndex; i < report.length; i ++ )
        {
          if(i >= startIndex + landscapePageSize)
            break;
          var x = report[i];

          let location;
          let color = "#fff";

          if(x && x.result == 'POSITIVE'){
            color = '#acb5bc'
          }
          if(x.location == 'InsSheet' && x.component != 'Exterior Doorway' && x.component != 'Exterior Window' && x.component != 'Misc Exterior'){
            location = 'Interior'
          }
          else if(x.unit == 'Calibration'){
            location = 'Common'
          }
          else {
            location = 'Exterior'
          }

          table += `<tr style="background-color:` + color + `">
              <td>` + (i+1) + `</td>
              <td class="center">` + (x.side|| '') + `</td>
              <td>` + (x.name + ' ' + x.material) + `</td>
              <td>` + (location + ' ' + x.room) + `</td>
              <td class="center">` + (x.reading || '0') + `</td>
              <td>` + (x.result || ' ') + `</td>
              <td>` + (x.condition || '') + `</td>
              <td>` + (x.type? x.type+', ': "") + (x.comments || ' ') + `</td>
            </tr>`;
        }
      }
      else {
        table += `<tr><td>"No Inspection Data"</td></tr>`;
      }

      if( startIndex + landscapePageSize > report.length) {
        for(var i = 0; i < startIndex + landscapePageSize - report.length; i ++)
        {
          table += '<tr class="blank">';
          table += '<td>' + '&nbsp;' + '</td>';
          table += '</tr>';
        }
      }
      table += `</tbody>
    </table></div>`;


    var content = charSet + landscapeHeader + table + landscapeFooter;

    return content;


  }

  positiveCommon(report, page, datetime, startIndex) { // data, page_number, current datetime, start index in the array

    var charSet = ' ';
    var landscapeHeader = this.getLandscapeHeader('Common Lead Containing Components List');
    var landscapeFooter = this.getLandscapeFooter(page, datetime);



    var table = `<div class="filter-table-responsive"> <table class="table">
      <thead>
      <tr>
        <th>Sample</th>
        <th class="center">Side</th>
        <th>Testing Combination</th>
        <th>Room Equivalent</th>
        <th class="center">Lead</th>
        <th>Results</th>
        <th>Condition</th>
        <th>Comments</th>
      </tr>
      </thead>
      <tbody>`;

      if(report) {
        for( i = startIndex; i < report.length; i ++ )
        {
          if(i >= startIndex + landscapePageSize)
            break;
          var x = report[i];

          let location;
          let color = "#fff";

          if(x && x.result == 'POSITIVE'){
            color = '#acb5bc'
          }
          if(x.location == 'InsSheet' && x.component != 'Exterior Doorway' && x.component != 'Exterior Window' && x.component != 'Misc Exterior'){
            location = 'Interior'
          }
          else if(x.unit == 'Calibration'){
            location = 'Common'
          }
          else {
            location = 'Exterior'
          }

          table += `<tr style="background-color:` + color + `">
              <td>` + (i+1) + `</td>
              <td class="center">` + (x.side|| '') + `</td>
              <td>` + (x.name + ' ' + x.material) + `</td>
              <td>` + (location + ' ' + x.room) + `</td>
              <td class="center">` + (x.reading || '0') + `</td>
              <td>` + (x.result || ' ') + `</td>
              <td>` + (x.condition || '') + `</td>
              <td>` + (x.type? x.type+', ': "") + (x.comments || ' ') + `</td>
            </tr>`;
        }
      }
      else {
        table += `<tr><td>"No Inspection Data"</td></tr>`;
      }

      if( startIndex + landscapePageSize > report.length) {
        for(var i = 0; i < startIndex + landscapePageSize - report.length; i ++)
        {
          table += '<tr class="blank">';
          table += '<td>' + '&nbsp;' + '</td>';
          table += '</tr>';
        }
      }
      table += `</tbody>
    </table></div>`;


    var content = charSet + landscapeHeader + table + landscapeFooter;

    return content;


  }

  render() {
    //console.log('y',this.state.jobInfo)
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
              <dd className="col-sm-3">Action Level</dd>
              <dt className="col-sm-9">{this.state.jobInfo? this.state.jobInfo.actionLevel : ''}</dt>
              <dd className="col-sm-3">Recieved date</dd>
              <dt className="col-sm-9">{this.state.jobInfo? this.state.jobInfo.recievedDate : ''}</dt>
              <dd className="col-sm-3">Intake notes</dd>
              <dt className="col-sm-9">{this.state.jobInfo? this.state.jobInfo.comments : ''}</dt>
              <br></br>
              <br></br>
              <br></br>
              <dd className="col-sm-3">
                <Button color="success" onClick={() => this.printSummary()}>Print Summary</Button>
              </dd>

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
                      <th>Substraste</th>
                      <th>Condition</th>
                      <th>Lead</th>
                      <th>Results</th>
                      <th>Comments</th>
                      <th></th>
                    </tr>
                    </thead>
                    <tbody>
                    {this.state.calibrationStart ? this.state.calibrationStart.map((c, i) => {
                      return <Insrow key={i} sampleId={i} item={"Calibration"} reading={c} openModal={this.openModal}/>
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
                      return <Insrow key={i} openModal={this.openModal} sampleId={i} side={x.side} item={x.name} material={x.material} room={x.room} reading={x.reading} result={x.result} condition={x.condition} type={x.type} comments={x.comments} location={x.location} component={x.component} unit={x.unit} />
                    }): <tr><td>"No Inspection Data"</td></tr>}
                    </tbody>
                  </Table>
                </CardBody>
              </Card>
            </Col>

            { this.state.modalStuff ?
              <Modal
                isOpen={this.state.modalIsOpen}
                onAfterOpen={this.afterOpenModal}
                onRequestClose={this.closeModal}
                style={customStyles}
                contentLabel="Example Modal"
              >

                <h2 ref={subtitle => this.subtitle = subtitle}>Edit</h2>
                <form>

                <dl className="row">
                  <dd className="col-sm-3">Id</dd>
                  <dt className="col-sm-9">
                    <Input value={this.state.modalStuff.sampleId + 1}/>
                  </dt>
                </dl>

                <dl className="row">
                  <dd className="col-sm-3">unit</dd>
                  <dt className="col-sm-9">
                    <Input value={this.state.modalStuff.unit}/>
                  </dt>
                </dl>

                <dl className="row">
                  <dd className="col-sm-3">location</dd>
                  <dt className="col-sm-9">
                  <Input value={this.state.modalStuff.location}/>
                  </dt>
                </dl>
                <dl className="row">
                  <dd className="col-sm-3">room</dd>
                  <dt className="col-sm-9">
                  <Input value={this.state.modalStuff.room }/>
                  </dt>
                </dl>
                <dl className="row">
                  <dd className="col-sm-3">side</dd>
                  <dt className="col-sm-9">
                    <Input value={this.state.modalStuff.side}/>
                  </dt>
                </dl>
                <dl className="row">
                  <dd className="col-sm-3">item</dd>
                  <dt className="col-sm-9">
                  <Input value={this.state.modalStuff.item}/>
                  </dt>
                </dl>
                <dl className="row">
                  <dd className="col-sm-3">material</dd>
                  <dt className="col-sm-9">
                  <Input value={this.state.modalStuff.material}/>
                  </dt>
                </dl>
                <dl className="row">
                  <dd className="col-sm-3">reading</dd>
                  <dt className="col-sm-9">
                  <Input value={this.state.modalStuff.reading}/>
                  </dt>
                </dl>
                <dl className="row">
                  <dd className="col-sm-3">result</dd>
                  <dt className="col-sm-9">
                  <Input value={this.state.modalStuff.result}/>
                  </dt>
                </dl>
                <dl className="row">
                  <dd className="col-sm-3">comments</dd>
                  <dt className="col-sm-9">
                  <Input value={this.state.modalStuff.comments}/>
                  </dt>
                </dl>
                <dl className="row">
                  <dd className="col-sm-3">type</dd>
                  <dt className="col-sm-9">
                  <Input value={this.state.modalStuff.type}/>
                  </dt>
                </dl>

                </form>
                <Button onClick={this.closeModal}>close</Button>

              </Modal>
              :
              ''
            }


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
