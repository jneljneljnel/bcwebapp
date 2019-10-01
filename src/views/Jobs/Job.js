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
  Media,
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
import Samples from './Samples/Samples.js'


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

function move(arr, old_index, new_index) {
    while (old_index < 0) {
        old_index += arr.length;
    }
    while (new_index < 0) {
        new_index += arr.length;
    }
    if (new_index >= arr.length) {
        let k = new_index - arr.length;
        while ((k--) + 1) {
            arr.push(undefined);
        }
    }
     arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
   return arr;
}


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
const portraitPageSize = 42;
const landscapePageSize = 29 ;


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
      <Marker onClick={this.toggle} icon={location.icon} position={location} title={location.title} label={location.label}>
        {this.state.isOpen &&
        <InfoWindow onCloseClick={this.toggle}>
        <div>
          <p>{location.title}</p>
          <p>{location.phone}</p>
          <NavLink href={location.link} target="_blank">
            <p>{location.address}</p>
          </NavLink>
        </div>
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

function show_percent (e) { return ( e == 0 ) ? "" : ( e + "% " ) }

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
    location = 'Calibration'
  }
  else {
    location = 'Exterior'
  }

  //console.log('state', props.stateId)
  //console.log('insid', props.inspectionId)
 // console.log('sheetid', props.sheetId)
//  console.log('itemId', props.itemId)
//  console.log('component', props.property)

  //console.log('pp',props , location)
  return(<tr style={{"backgroundColor":color}}>
      <td>{props.sampleId + 1|| "0"}</td>
      <td>{props.sheetIndex + 1|| "0"}</td>
      <td>{props.unit|| ''}</td>
      <td>{location + ' ' + props.room}</td>
      <td>{props.side|| ''}</td>
      <td>{props.item}</td>
      <td>{props.material}</td>
      <td>{props.condition || ''}</td>
      <td>{props.reading || '0'}</td>
      <td>{props.result || ' '}</td>
      <td>{props.type? props.type+' ': ""}{props.component!= "Other Item" ? props.comments || '' : ''}</td>
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
    this.getInterior2 = this.getInterior2.bind(this);
    this.getExterior = this.getExterior.bind(this);
    this.getExterior2 = this.getExterior2.bind(this);
    this.getCalibration = this.getCalibration.bind(this);


    this.dataReport = this.dataReport.bind(this);
    this.positiveInterior = this.positiveInterior.bind(this);
    this.positiveExterior = this.positiveExterior.bind(this);
    this.positiveCommon = this.positiveCommon.bind(this);

    this.getLandscapeHeader = this.getLandscapeHeader.bind(this);
    this.getLandscapeFooter = this.getLandscapeFooter.bind(this);
    this.getLastLandscapeFooter = this.getLastLandscapeFooter.bind(this);
    this.blankPageWithTitle = this.blankPageWithTitle.bind(this);

    // print 8552 Related Functions
    this.print8552 = this.print8552.bind(this);
    this.get8552Content = this.get8552Content.bind(this);

    this.openModal = this.openModal.bind(this);
    this.openPropModal = this.openPropModal.bind(this);
    this.openSampleModal = this.openSampleModal.bind(this);
    this.afterOpenPropModal = this.afterOpenPropModal.bind(this);
    this.afterOpenModal = this.afterOpenModal.bind(this);
    this.afterOpenSampleModal = this.afterOpenSampleModal.bind(this);
    this.closeSampleModal = this.closeSampleModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.closePropModal = this.closePropModal.bind(this);
    this.saveModal = this.saveModal.bind(this);
    this.savePropModal = this.savePropModal.bind(this);
    this.saveSampleModal = this.saveSampleModal.bind(this);
    this.deleteItemModal = this.deleteItemModal.bind(this);


    this.state = {
      data:false,
      collapse: true,
      fadeIn: true,
      timeout: 300,
      actionLevel: 0.7,
      locations:[],
      modalIsOpen: false,
      sampleModalIsOpen: false,
      samples:[]
    };
  }

  openModal(props) {
    this.setState({modalStuff: props});
    this.setState({modalStuffPreSave: props});
    this.setState({modalIsOpen: true});
    console.log('modalprops', props)
  }

  openPropModal(props) {
    console.log("yi",props)
    this.setState({propModalStuff: props});
    this.setState({propModalIsOpen: true});
  }

  openSampleModal(props) {
    console.log("yi",props)
    this.setState({sampleModalStuff: props});
    this.setState({sampleModalIsOpen: true});
  }

  afterOpenModal() {
   // references are now sync'd and can be accessed.
   console.log('mdata', this.state)
   this.subtitle.style.color = '#f00';
  }

  afterOpenPropModal() {
   // references are now sync'd and can be accessed.
   this.subtitle.style.color = '#f00';
  }

  afterOpenSampleModal() {
   // references are now sync'd and can be accessed.
  console.log('idk')
  }

  editSample(props) {
    console.log('yo')
    console.log("editSample from here", this.props)
  }


  deleteItemModal() {
   let { sheetIndex, inspectionId, stateId, sheetId, itemId, property, condition, comments, reading, item, material, side, type, room, unit } = this.state.modalStuff
   this.setState({modalIsOpen: false});
   let origIndex = this.state.modalStuffPreSave.sheetIndex
   console.log("origionalIndex", origIndex)
   // console.log('save newstuff',this.state.modalStuff)
   // console.log('save data',this.state.modalStuffData)
   // console.log('save',this.state.modalStuff.stateId)
   // console.log('save',this.state.modalStuff.sheetId)
   // console.log('save room',this.state.modalStuff.room)
   // console.log('save',this.state.modalStuff.itemId)
   console.log("where it is going to bee", sheetIndex)
   let data =  this.state.data;
   let sheets = data[stateId].insSheets
   let sheet = sheets.find((obj, i ) => i == origIndex)
   //let origIndex = sheets.indexOf(sheet)
   //console.log("obj sheet index", sheets, sheets.indexOf(sheet))
   //console.log("obj sheet", sheet)
   if (origIndex != sheetIndex  && sheetIndex <= sheets.length){
     console.log("obj MOVE",sheets, origIndex, sheetIndex)
     sheets = move(sheets, origIndex, sheetIndex)
   }
   let loc = sheet.type
   if(loc !== "ExtSheet" ){
     sheet.name = room
   }
   console.log("obj sheet type", loc)
   sheet.data.forEach(obj => {
     if(obj.title == "Sheet Details" && loc !== "ExtSheet" ){
       obj.unit = unit
     }
     if(obj.id == itemId){
        obj.comments = comments
        obj.doorType = type
        obj[property].name = item
        obj[property].R = null
        obj[property].M = material
        if(condition == "Intact"){
          obj[property].I = true
        } else {
          obj[property].I = false
        }

       if (obj.hasOwnProperty("side") && loc !== "ExtSheet") {

          console.log('obj changed side', loc)
          obj.side = side
        }
        else {
          if(obj[property].hasOwnProperty("S")){
            console.log('obj S true')
            obj[property].S = side
          }
          sheet.data.forEach(d => {
            if (d.title == 'Exterior Sheet Details'){
              console.log("obj CHANGE EXT SIDE", d)
              d.side = side
            }
           })
        }

        console.log('obj',obj)
        console.log('obj obj side', obj.side)
        console.log('obj side', side)
     }
   })

   sheets.forEach(obj => {
     if(obj.id == sheetId){
       obj = sheet
    }})

    data.forEach(obj => {
       if(obj.id == stateId){
          obj.insSheets = sheets
       }
    })

   this.setState(data)

   axios(
     {
       url: '/edit',
       method: 'POST',
       headers: {
         Accept: 'application/json',
         'Content-Type': 'application/json',
       },
       data: JSON.stringify({
         id: inspectionId,
         state: data
       })
     }).then(res => {
       console.log('update', res)
       this.getJobInfo().then( res => {
         console.log('DONE')
         this.getInspections()
       })
     })

   console.log("save newstate", data)

  }

  saveSampleModal() {
    let { inspectionId, title, R } = this.state.sampleModalStuff
    let data =  this.state.data;
    let sheets = data[0].insSheets
    sheets.map( sheet => {
      console.log('sh', sheet)
      sheet.data.map(sample => {
        if(sample.title == title){
          sample.R = R
        }

      })
    })

    let newdata = this.state.data
    newdata[0].insSheets = sheets
    console.log('newdata',newdata,this.state.jobInfo)
    axios(
      {
        url: '/edit',
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        data: JSON.stringify({
          id: inspectionId,
          state: newdata
        })
      }).then(res => {
        console.log('update', res)
        this.getJobInfo().then( res => {
          console.log('DONE')
          this.getInspections()
        })
        //window.location.reload();
      })
    this.setState(newdata)
    this.setState({sampleModalIsOpen: false});
  }

  savePropModal() {
    console.log(this.state.property_detail)
    let { bathnums,
    bay,
    bednums,
    brick,
    buildings,
    buildingstories,
    builtOther,
    builtover,
    children,
    done,
    dustnums,
    dwelling,
    dwellingOther,
    exterior,
    garage,
    garages,
    id,
    laundry,
    noaccess,
    paint,
    payment,
    serial,
    soilnums,
    stories,
    tested,
    title,
    type,
    units,
    unitstories,
    year } = this.state.propModalStuff
    console.log('pm save newstuff',this.state.propModalStuff)
    console.log('pm save data',this.state.data)
    let inspectionId
    let newdata = this.state.data;
    newdata.map( x => {
      x.data.map( sheet => {
      console.log("sjeet", sheet)
      inspectionId = sheet.inspectionId
      if(sheet.type == "property details"){
        sheet.bay = bay
        sheet.bednums = bednums
        sheet.brick = brick
        sheet.buildings = buildings
        sheet.buildingstories = buildingstories
        sheet.builtOther = builtOther
        sheet.builtover = builtover
        sheet.children = children
        sheet.done = done
        sheet.dustnums = dustnums
        sheet.dwelling = dwelling
        sheet.dwellingOther = dwellingOther
        sheet.exterior = exterior
        sheet.garage = garage
        sheet.garages = garages
        sheet.id = id
        sheet.laundry = laundry
        sheet.noaccess = noaccess
        sheet.paint = paint
        sheet.payment = payment
        sheet.serial = serial
        sheet.soilnums = soilnums
        sheet.stories = stories
        sheet.tested = tested
        sheet.title = title
        sheet.type = type
        sheet.units = units
        sheet.unitstories = unitstories
        sheet.year = year
      }
    })
    axios(
      {
        url: '/edit',
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        data: JSON.stringify({
          id: x.inspectionId,
          state: newdata
        })
      }).then(res => {
        console.log('update', res)
        this.getJobInfo().then( res => {
          console.log('DONE')
          this.getInspections()
        })
        //window.location.reload();
      })
   })
    this.setState({propModalIsOpen: false});
    console.log("new deets",newdata)
    console.log("new deets ins", this.state.propModalStuff.inspectionId)
    this.setState(newdata)
  }

  saveModal() {
   let { sheetIndex, inspectionId, stateId, sheetId, itemId, property, condition, comments, reading, item, material, side, type, room, unit } = this.state.modalStuff
   let origIndex = this.state.modalStuffPreSave.sheetIndex
   console.log("origionalIndex", origIndex)
   console.log("inspectionId", inspectionId)
   // console.log('save newstuff',this.state.modalStuff)
   // console.log('save data',this.state.modalStuffData)
   // console.log('save',this.state.modalStuff.stateId)
   // console.log('save',this.state.modalStuff.sheetId)
   // console.log('save room',this.state.modalStuff.room)
   // console.log('save',this.state.modalStuff.itemId)
   console.log("where it is going to bee", sheetIndex)
   let data =  this.state.data;
   let sheets = data[stateId].insSheets
   let sheet = sheets.find((obj, i ) => i == origIndex)
   //let origIndex = sheets.indexOf(sheet)
   //console.log("obj sheet index", sheets, sheets.indexOf(sheet))
   //console.log("obj sheet", sheet)
   if (origIndex != sheetIndex  && sheetIndex <= sheets.length){
     console.log("obj MOVE",sheets, origIndex, sheetIndex)
     sheets = move(sheets, origIndex, sheetIndex)
   }
   let loc = sheet.type
   if(loc !== "ExtSheet" ){
     sheet.name = room
   }
   sheet.data.forEach((obj, i) => {
     console.log('property',this.state.modalStuff.property, obj )
     //INTERIOR SHEET UNIT
     if(obj.title == "Sheet Details" && loc !== "ExtSheet" ){
       obj.unit = unit
     }
     //EXTERIOR SHEET ROOM EQUIVALENT
     if(obj.title == "Sheet Details" && loc == "ExtSheet" ){

     }

     if(obj.id == itemId){

        obj.comments = comments
        obj.doorType = type
        if(obj[property]){
          obj[property].name = item
          obj[property].R = reading
          obj[property].M = material
          if(condition == "Intact"){
            obj[property].I = true
          } else {
            obj[property].I = false
          }
        }
       if (obj.hasOwnProperty("side") && loc !== "ExtSheet") {
          console.log('obj changed side', loc)
          obj.side = side
        }
        else {
          if(obj[property] && obj[property].hasOwnProperty("S")){
            obj[property].S = side
          }
          sheet.data.forEach(d => {
            if (d.title == 'Exterior Sheet Details'){
              console.log("obj CHANGE EXT SIDE", d)
              d.direction = room
              d.side = side
            }
           })
        }
     }
   })

   sheets.forEach(obj => {
     if(obj.id == sheetId){
       obj = sheet
    }})

    data.forEach(obj => {
       if(obj.id == stateId){
          obj.insSheets = sheets
       }
    })
   //console.log("newdata", data)
   this.setState({modalIsOpen: false});


   axios(
     {
       url: '/edit',
       method: 'POST',
       headers: {
         Accept: 'application/json',
         'Content-Type': 'application/json',
       },
       data: JSON.stringify({
         id: inspectionId,
         state: data
       })
     }).then(res => {
       console.log('update', res)
       this.getJobInfo().then( res => {
         console.log('DONE')
         this.getInspections()
       })
       //window.location.reload();
     })

   console.log("save newstate", data)

  }

  closeModal() {
   this.setState({modalStuff: []});
   this.setState({modalStuffPreSave: []});
   this.setState({modalIsOpen: false});
  }

  closePropModal() {
   this.setState({propModalStuff: []});
   this.setState({propModalIsOpen: false});
  }

  closeSampleModal() {
   this.setState({sampleModalStuff: []});
   this.setState({sampleModalIsOpen: false});
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
    if(groupBylocation(data).Calibration){
      let material = groupByMaterial(groupBylocation(data).Calibration)
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
         final.push({component:mat[k][0].material + ' '+ k, material: mat[k][0].material, number:mat[k].length, numpos:pos.length, numneg:neg.length, percentpos:((pos.length * 100) / mat[k].length).toFixed(2), percentneg:((neg.length * 100) / mat[k].length).toFixed(2)})
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
         final.push({component:mat[k][0].material + ' '+ k, material: mat[k][0].material, number:mat[k].length, numpos:pos.length, numneg:neg.length, percentpos:((pos.length * 100) / mat[k].length).toFixed(2), percentneg:((neg.length * 100) / mat[k].length).toFixed(2)})
         //console.log('BIGDATA fin', final)
       })
      })
    }
    if(groupBylocation(fdat).PermitSheet){
      let material = groupByMaterial(groupBylocation(fdat).PermitSheet)
      //console.log('BIGINS', material)
      Object.keys(material).map( m => {
       //console.log('BIGINS COmp', groupByName(material[m]))
       let mat = groupByName(material[m])
       Object.keys(groupByName(material[m])).map(k => {
         let pos = []
         let neg = []
         mat[k].map( x => x.result == 'Negative'? neg.push(x): pos.push(x))
         final.push({component:mat[k][0].material + ' '+ k, material: mat[k][0].material, number:mat[k].length, numpos:pos.length, numneg:neg.length, percentpos:((pos.length * 100) / mat[k].length).toFixed(2), percentneg:((neg.length * 100) / mat[k].length).toFixed(2)})
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
    console.log('RUNNING')
    let jobid = this.props.match.params.id
    let that = this
    return new Promise(function(resolve, reject) {
    axios(
      {
        url: '/api/jobs/get',
        method: 'post',
        data: {
         id: jobid
        }
      })
      .then( res => {
        axios(
          {
            url: '/api/clients/get',
            method: 'post',
            data: {
             id: res.data[0].clientId
            }
          }).then(res2 => {
                that.state.jobInfo.clientInfo = res2
                that.setState({jobInfo:that.state.jobInfo})
          })
        //console.log('at this point',this.state.actionLevel, res.data[0].actionLevel)
        that.setState({jobInfo:res.data[0]})
        console.log(res.data[0])
        console.log(res.data[0].street)
        let image
        if(res.data[0].inspector == 1) {

         image = 'http://maps.google.com/mapfiles/ms/icons/green.png';
        }
        if(res.data[0].inspector == 2) {
         image = 'http://maps.google.com/mapfiles/ms/icons/red.png';
        }
        if(res.data[0].inspector == 3) {
         image = 'http://maps.google.com/mapfiles/ms/icons/blue.png';
        }
        ////action level async isue
        that.setState({actionLevel:res.data[0].actionLevel})
        resolve('setActionlvl')
        axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${res.data[0].street+ ' ' + res.data[0].city}&key=AIzaSyA3FkbIxQAgVDWNej22DnBn6XzhHjoK5nc`).then(results => {
          if( results.data.results[0] && results.data.results.length){
            let loc = {
              lat: results.data.results[0].geometry.location.lat,
              lng: results.data.results[0].geometry.location.lng,
              draggable: false,
              title: res.data[0].name,
              phone: res.data[0].siteNumber,
              address: res.data[0].street,
              icon:image,
              link: 'https://www.google.com/maps/dir/?api=1&destination='+res.data[0].street+'%2C'+res.data[0].city+'%2C'+res.data[0].state

            }
            //console.log(loc)
            that.setState({locations:[loc]})
          }
        })
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
        let state = JSON.parse(i.state)
        state.inspectionId = i.id
        console.log('res', state)
        return state
      })
      console.log(states)
      this.setState({data:states})
      let rows = [];
      let samples = [];
      let calibrationStart = []
      let calibrationEnd = []
      states.map((x,i) => {
        let inspectionId = x.inspectionId;
        let stateId = i
        x.data.map( checklist => {
          if(checklist.type=='calibration'){
            if( checklist.startone){
              let result = (Math.round(checklist.startone * 100) >= Math.round(this.state.actionLevel * 100)) ? 'POSITIVE': 'Negative'
              rows.push({reading: checklist.startone || 'n/a', result: result, name: '1.0 mg/cm2 Standard', material: "Wood", unit: 'Calibration', location:'Calibration', room: 'Start of Job', side:' ', condition:'Intact'})
            }
            if( checklist.starttwo){
              let result = (Math.round(checklist.starttwo * 100) >= Math.round(this.state.actionLevel * 100)) ? 'POSITIVE': 'Negative'
              rows.push({reading: checklist.starttwo || 'n/a', result: result, name: '1.0 mg/cm2 Standard', material: "Wood", unit: 'Calibration', location:'Calibration',  room: 'Start of Job', side:' ', condition:'Intact'})
            }
            if( checklist.startthree){
              let result = (Math.round(checklist.startthree * 100) >= Math.round(this.state.actionLevel * 100)) ? 'POSITIVE': 'Negative'
              rows.push({reading: checklist.startthree || 'n/a', result: result, name: '1.0 mg/cm2 Standard', material: "Wood", unit: 'Calibration', location:'Calibration', room: 'Start of Job', side:' ', condition:'Intact'})
            }
          }
          if(checklist.type == "property details"){
            console.log("property details", checklist)
            this.setState({
              property_detail : checklist
            })
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
        x.insSheets.map((s, i) => {
          let sheetIndex = i
          let room = s.name
          let location = s.type
          let extSide;
          let extDirecton;
          let unit
          let sheetId = s.id
          if(s.type == "ExtSheet"){
            extSide = s.data[0].side
            room = s.data[0].direction || ""
          }
//          console.log('sheet', s)
          s.data.map(d => {
            let itemId = d.id
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
            //console.log("Dee",d )
            if(d.title == 'Other Item'){
              d.other.name = d.comments
            }

            if (d.title !='Exterior Sheet Details' && d.title != 'Sheet Details' && d.title !='Soil Sample Details' && d.title !='Dust Sample Details' && d.type !='sample'){
              Object.keys(d).map( obj => {
                if (obj != 'id' && obj != 'loc' && obj != 'doorType' && obj != 'comments' && obj != 'side' &&  obj != 'type' && obj != 'expanded' && obj != 'done' && obj != 'title' && obj != 'leadsTo' && obj != 'windowType'
              && obj != 'unit'){
                  let item = obj
                  let property = obj
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
                    console.log('action.level',this.state.actionLevel, reading)
                    let result = (Math.round(reading * 100) >= Math.round(this.state.actionLevel * 100)) ? 'POSITIVE': 'Negative'
                    //console.log(item, material, condition, reading, side, result, room, name,location, component, comments, type, unit, sheetId)
                    //console.log('r', reading)
                    rows.push({item, property, material, condition, reading, result, side, room, name, location, component, comments, type, unit, extDirecton, inspectionId, stateId, sheetId, sheetIndex, itemId})
                  }

                }
              })
            }
            else if(d.type == 'sample'){
              d.inspectionId = inspectionId
              console.log('sample', d)
              samples.push(d)
            }
          })
        })
        x.data.map( checklist => {
          if(checklist.type=='calibration'){
            if(checklist.endone){
              let result = (Math.round(checklist.endone * 100) >= Math.round(this.state.actionLevel * 100)) ? 'POSITIVE': 'Negative'
              rows.push({reading: checklist.endone, result:result,  name: '1.0 mg/cm2 Standard', material: "Wood", unit: 'Calibration', location:'Calibration',  room: 'End of Job', side:' ', condition:'Intact'})
            }
            if(checklist.endtwo){
              let result = (Math.round(checklist.endtwo* 100) >= Math.round(this.state.actionLevel * 100)) ? 'POSITIVE': 'Negative'
              rows.push({reading: checklist.endtwo, result:result,  name: '1.0 mg/cm2 Standard', material: "Wood", unit: 'Calibration', location:'Calibration',  room: 'End of Job', side:' ', condition:'Intact'})
            }
            if(checklist.endthree){
              let result = (Math.round(checklist.endthree * 100) >= Math.round(this.state.actionLevel * 100)) ? 'POSITIVE': 'Negative'
              rows.push({reading: checklist.endthree, result:result, name: '1.0 mg/cm2 Standard', material: "Wood", unit: 'Calibration', location:'Calibration', room: 'End of Job', side:' ', condition:'Intact'})

            }
          }
        })
      })
      //console.log(rows)
      this.setState({rows:rows, samples:samples})
      //console.log(this.state.rows)
    })
  }

  toggle() {
    this.setState({ collapse: !this.state.collapse });
  }

  toggleFade() {
    this.setState((prevState) => { return { fadeIn: !prevState }});
  }

  componentDidMount(){
    this.getJobInfo().then( res => {
      console.log('DONE')
      this.getInspections()
    })
  }

  async print8552() {
    let css = `
      * {
        font-family: Arial;
      }
      h1, h3 {
        font-family: Arial;
      }

      .heading {
        text-align:center;
      }

      .header {
        text-align:left;
        font-size: 8px;
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

      .underline {
        border-bottom : black 1px solid;
      }

      .pink {
        color : #a342b5;
      }

      div input {
        margin : 10px;
        width : 40px;
        color: #a342b5;
      }

      div label {
        margin : 30px;
        width : 200px;
        font-size : 12px;
      }

      b {
        font-size: 14px;
      }

      .span-border span {
        border-right : 1px solid #a342b5;
        border-left : 1px solid #a342b5;
      }

      table {
        width: 100%;
      }

      table, td {
        border-top: 1px solid black;
        border-bottom: 1px solid black;
        border-spacing: 0px;
        border-collapse: collapse;
      }

      .font-small {
        font-size: 11px;
      }

      .font-smaller {
        font-size: 10px;
      }

      .side-border td {
        border-right: 1px solid black;
      }

      .side-border td:last-child {
        border-right: none;
      }

      table.no-border, table.no-border td {
        border: none;
      }

      .italic {
        font-style: italic;
      }

      .select-box label {
        font-size: 10px;
      }

      div {
        margin-top:0px;
        margin-bottom:0px;
        padding-top:0px;
        padding-bottom:0px;
      }

      .nopadding {
        padding: 0px;
      }

      .nomargin {
        margin: 0px;
      }
    `;

    let converted = '';
    let content = '';

    let image1, image2, image3;

    await this.getBase64('/assets/img/signs/sign1.jpg').then((data)=>{
      image1 = '<img width=160 height=40 src="' + data + '"/>';
    });

    await this.getBase64('/assets/img/signs/sign2.jpg').then((data)=>{
      image2 = '<img width=160 height=40 src="' + data + '"/>';
    });

    await this.getBase64('/assets/img/signs/sign3.jpg').then((data)=>{
      image3 = '<img width=160 height=36 src="' + data + '"/>';
    });


    content = this.get8552Content(image1, image2, image3);
    content = juice.inlineContent(content, css);
    converted = htmlDocx.asBlob(content, {orientation: 'portrait', margins: {top: 720, left : 400, right : 400, bottom: 400}});
    saveAs(converted, 'export8552.docx' );

    console.log(this.state.jobInfo);






    // await base64Img.base64('path/demo.png').then(function(data) {
    //   console.log(data);
    // });
    // console.log(base64Img.base64Sync('/assets/img/signs/sign1.jpg'));
    // content += base64Img.base64Sync('assets/img/signs/sign1.jpg');





  }

  get8552Content(image1, image2, image3) {
    let noneLead = true;
    this.state.rows.map( (x, i) => {
      if(x.result == "POSITIVE" && x.reading >= this.state.jobInfo.actionLevel)
      {
//        console.log(x);
        noneLead = false;
      }
    });
    console.log(noneLead);
    console.log(this.state.jobInfo);

    console.log('property', this.state.property_detail);

    let content = '';
    content += `
    <div class="header" style="padding-bottom:0px;margin-bottom:0px;line-height:10px;">
      State of California-Health and Human Services Agency</br>
      California Department of Public Health
    </div>
    `;

    content += `<h4 class="center">LEAD HAZARD EVALUATION REPORT</h4>`;

    content += `


      <div class="underline">
        <b>Section 1-Date of Lead Hazard Evaluation</b>
        <span>` + this.state.jobInfo.inspectionDate + `</span>
      </div>
      <div >
        <b>Section 2-Type of Lead Hazard Evaluation </b>
        <span>(Check one box only)</span>
      </div>
      <div>
        <input type="checkbox" name="lead_inspection" value="lead_inspection"/>
        <label style="font-size:10px">Lead inspection</label>
        <input type="checkbox" name="risk_assessment" value="risk_assessment" />
        <label>Risk Assessment</label>
        <input type="checkbox" name="clearance_inspection" value="clearance_inspection" />
        <label>Clearance inspection</label>
        <input type="checkbox" name="other" value="other" />
        <label>Other (Limited Inspection)</label>
      </div>

      <div>
        <b>Section 3-Structure Where Lead Hazard Evaluation Was Conducted</b>
      </div>
      <table class="font-small">
        <tr class="side-border">
          <td colspan="2">
            <p class="nomargin nopadding">Address (number, street, apartment (if applicable)</p>`
            + (this.state.jobInfo? this.state.jobInfo.address : '') +
          `</td>
          <td style="width:20%;">
            <p class="nomargin nopadding">City</p>
          </td>
          <td style="width:20%;">
            <p class="nomargin nopadding">County</p>
          </td>
          <td style="width:20%;">
            <p class="nomargin nopadding">ZIP code</p>
          </td>
        </tr>
      </table>
      <table class="select-box font-small">
        <tr>
          <td style="border-right: 1px solid black;">
            <div>Construction date (year) of structure</div>`
            + (typeof this.state.property_detail.year === 'undefined' ? 1 : this.state.property_detail.year) +
          `</td>
          <td colspan="2">
            <div>Type of structure (check one box only)</div>
            <div>
            <input type="checkbox" name="multi_unit" value="multi_unit"/>
            <label>Multi-unit building</label>
            <input type="checkbox" name="daycare" value="daycare"/>
            <label>School or Daycare</label>
            </div>
            <div>` +
            (this.state.property_detail.dwelling == "Single Family Home" ? (
              `<input type="checkbox" name="family" value="family" checked/>
            <label>Single Family Dwelling</label>
            <input type="checkbox" name="other" value="other"/>
            <label>Other (specify)</label>`
            ) : (
              `<input type="checkbox" name="family" value="family"/>
            <label>Single Family Dwelling</label>
            <input type="checkbox" name="other" value="other" checked/>
            <label>Other ` + (this.state.property_detail.dwelling) + `</label>`
            ))
             +
            `</div>
          </td>
          <td colspan="2">
            <div>Children Living in Structure?</div>
            <div>` +
            (this.state.property_detail.children == "Yes" ? (
              `<input type="checkbox" name="yes" value="yes" checked/>
              <label>Yes</label>
              <input type="checkbox" name="no" value="no" />
              <label>No</label>`
            ) : (
              `<input type="checkbox" name="yes" value="yes" />
              <label>Yes</label>
              <input type="checkbox" name="no" value="no" checked />
              <label>No</label>`
            ))
            +
            `</div>
            <div>
            <input type="checkbox" name="other" value="other"/>
            <label>Don't know</label>
            </div>
          </td>
        </tr>
      </table>

      <div>
        <b>Section 4-Owner of Structure</b> (If business/agency, list contact person)
      </div>

      <table class="side-border font-small">
        <tr>
          <td colspan="3">
          <p class="nopadding nomargin">Name</p><p class="nopadding nomargin">` //(this.state.jobInfo? this.state.jobInfo.siteName : '')
            + (this.state.jobInfo? this.state.jobInfo.homeownerName : '') +
          `</p></td>
          <td colspan="2">
          <p class="nopadding nomargin">Telephone number<p><p class="nopadding nomargin">`
            + (this.state.jobInfo? this.state.jobInfo.siteNumber : '') +
          `</p></td>
        </tr>
        <tr>
            <td colspan="2">
              <p class="nopadding nomargin">
              Address [number, street, apartment (if applicable)]
              </p><p class="nopadding nomargin">`
              + (this.state.jobInfo? this.state.jobInfo.address : '') +
            `</p></td>
            <td>
            <p class="nopadding nomargin">City</p>
            <p class="nopadding nomargin">${this.state.jobInfo.city}</p>
          </td>
          <td>
            <p class="nopadding nomargin">State</p>
            <p class="nopadding nomargin">CA</p>
          </td>
          <td>
            <p class="nopadding nomargin">ZIP code</p>
            <p class="nopadding nomargin">${this.state.jobInfo.postal}</p>
          </td>
      </tr>
    </table>


    <div class="left">
      <b>Section 5-Results of Lead Hazard Evaluation</b> (Check all that apply)
    </div>


      <div class="select-box left" style="font-size:12px;">
        <div>` +
          ( noneLead== true ? `<input type="checkbox" name="lead_inspection" value="lead_inspection" checked/>` : `<input type="checkbox" name="lead_inspection" value="lead_inspection"/>`) +
          `<label>No lead-based paint detected </label>
          <input type="checkbox" name="risk_assessment" value="risk_assessment" />
          <label>Intact Lead-based paint detected</label>
          <input type="checkbox" name="clearance_inspection" value="clearance_inspection" />
          <label>Deteriorated Lead-based paint detected</label>`
        + `</div>
        <div>` +

          `<input type="checkbox" name="clearance_inspection" value="clearance_inspection" />
          <label style="background-color: #4dbd74;">No lead hazards detected</label>
          <input type="checkbox" name="clearance_inspection" value="clearance_inspection" />
          <label>Lead Contaminated Dust Found</label>
          <input type="checkbox" name="clearance_inspection" value="clearance_inspection" />
          <label>Lead Contaminated Soil Found</label>
          <input type="checkbox" name="other" value="other" />
          <label>Other (specify) </label>`

        + `</div>
      </div>

      <div>
        <b>Section 6-Individual Conducting Lead Hazard Evaluation</b>
      </div>


      <table class="font-small">
        <tr >
          <td colspan="3">
            <p class="nopadding nomargin">Name</p>
            <p class="nopadding nomargin">Matthew Crochet, Jeremy Nguyen, Keith Piner</p>
          </td>
          <td colspan="2">
            <p class="nopadding nomargin">Telephone number</p>
            <p class="nopadding nomargin">714-894-5700</p>
          </td>
        </tr>
        <tr>
          <td colspan="2">
            <p class="nopadding nomargin">Address (number, street, apartment (if applicable)</p>
            <p class="nopadding nomargin">16531 Bolsa Chica, Suite 205</p>
          </td>
          <td>
            <p class="nopadding nomargin">City</p>
            <p class="nopadding nomargin">Huntington Beach</p>
          </td>
          <td>
            <p class="nopadding nomargin">State</p>
            <p class="nopadding nomargin">CA</p>
          </td>
          <td>
            <p class="nopadding nomargin">ZIP code</p>
            <p class="nopadding nomargin">92649</p>
          </td>
        </tr>
        <tr>
          <td >
          <p class="nopadding nomargin">CDPH certification number</p>
          <p class="nopadding nomargin">12   14441      25548</p>
          </td>
          <td><p class="nopadding nomargin">Signature</p>`
          + image1 +
          `</td>
          <td>`
          + image2 +
          `</td>
          <td>`
          + image3 +
          `</td>
          <td>
          <p class="nopadding nomargin">Date</p>
          <p class="nopadding nomargin">` + this.state.jobInfo.inspectionDate + `</p>
          </td>
        </tr>
        <tr>
          <td colspan="5">
            Name and CDPH certification number of any other individuals conducting sampling or testing (if applicable)
          </td>
        </tr>
      </table>

      <div>
        <b>Section 7-Attachments</b>
      </div>

      <div style="font-size: 11px;">
        <p class="nopadding nomargin"> A. A foundation diagram or sketch of the structure indicating the specific locations of each lead hazard or presence of lead-based paint; </p>
        <p class="nopadding nomargin"> B.  Each testing method, device, and sampling procedure used;</p>
        <p class="nopadding nomargin"> C. All data collected, including quality control data, laboratory results, including laboratory name, address, and phone number.</p>
       </div>

       <table style="font-size: 13px;" class="no-border">
        <tr class="italic">
          <td width="50%">
          First copy and attachments retained by inspector
          </td>
          <td width="50%">
          </td>
        </tr>
        <tr class="italic">
          <td>
            Second copy and attachments retained by owner
          </td>
          <td>
            Third copy only (no attachments) mailed to:
          </td>
        </tr>
        <tr>
          <td>

          </td>
          <td>
            California Department of Public Health<br/>
            Childhood Lead Poisoning Prevention Branch Reports<br/>
            850 Maria Bay Parkway, Building P, Third Floor<br/>
            Richmond, CA 94804-6403 Fax (510) 620-5656
          </td>
        </tr>
        <tr>
          <td>
          CDPH 8552 (6/07)
          </td>
          <td>

          </td>
        </tr>
      </table>



      <hr/>


      `;
    return content;
  }

  getBase64(url) {

    return new Promise((resolve, reject) => {

      let xhr = new XMLHttpRequest();
      xhr.onload = function() {
        let reader = new FileReader();
        reader.onloadend = function() {
          resolve(reader.result);
        }
        reader.readAsDataURL(xhr.response);
        reader.onerror = error => reject(error);
      };
      xhr.open('GET', url);
      xhr.responseType = 'blob';
      xhr.send();

    });
  }


  printSummary(jobId) {
    var css = `
      h1 {
        font-family: Arial;
      }
      .heading {
        text-align:center;
        font-family:sans-serif
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

        margin: 0 20 auto;
      }

      .filter-table-responsive table {
        font-size:10px
        width:95%;
        border-collapse: collapse;
      }

      .filter-table-responsive thead tr th{
        border-bottom: 3px solid black;
        margin-top:20px;
        height: 10px;
        vertical-align: middle;
        text-align: left;
      }

      .filter-table-responsive thead tr th:first-child {
        text-align: right;
        width : 60px;
        padding-right: 10px;
      }

      .filter-table-responsive thead tr th:nth-child(2) {
        width : 135px;
        text-align : left;
        /*unit id*/
      }

      .filter-table-responsive tbody tr td:nth-child(2) {
        text-align : left;
      }

      .filter-table-responsive thead tr th:nth-child(3) {
        width : 140px;
      }

      .filter-table-responsive thead tr th:nth-child(4) {
        width : 30px;
        /*side*/
      }

      .filter-table-responsive thead tr th:nth-child(5) {
        width : 165px;
      }

      .filter-table-responsive tbody tr td:nth-child(5) {
        //component
        text-align : left;
      }

      .filter-table-responsive thead tr th:nth-child(6) {
        width : 100px;
      }

      .filter-table-responsive thead tr th:nth-child(7) {
        width : 100px;
      }

      .filter-table-responsive thead tr th:nth-child(8) {
        width : 50px;
      }

      .filter-table-responsive thead tr th:nth-child(9) {
        width : 80px;
      }

      .filter-table-responsive thead tr th:nth-child(10) {
        width : 150px;
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

      .filter-table-responsive-cal{
        border-spacing: 0px;

        margin: 0 20 auto;
      }

      .filter-table-responsive-cal table {
        font-size:10px
        width:95%;
        border-collapse: collapse;
      }

      .filter-table-responsive-cal thead tr th{
        border-bottom: 3px solid black;
        margin-top:20px;
        height: 10px;
        vertical-align: middle;
        text-align: left;
      }

      .filter-table-responsive-cal thead tr th:first-child {
        text-align: right;
        width : 60px;
        padding-right: 10px;
      }

      .filter-table-responsive-cal thead tr th:nth-child(2) {
        width : 45px;
        text-align : left;
        /*side*/
      }

      .filter-table-responsive-cal tbody tr td:nth-child(2) {
        text-align : left;
      }

      .filter-table-responsive-cal thead tr th:nth-child(3) {
        width : 230px;
      }

      .filter-table-responsive-cal thead tr th:nth-child(4) {
        width : 230px;
        /*room*/
      }

      .filter-table-responsive-cal thead tr th:nth-child(5) {
        width : 50px;
      }

      .filter-table-responsive-cal tbody tr td:nth-child(5) {
        //component
        text-align : left;
      }

      .filter-table-responsive-cal thead tr th:nth-child(6) {
        width : 100px;
      }

      .filter-table-responsive-cal thead tr th:nth-child(7) {
        width : 100px;
      }

      .filter-table-responsive-cal thead tr th:nth-child(8) {
        width : 250px;
      }

      .filter-table-responsive-cal thead tr th:nth-child(9) {
        width : 80px;
      }

      .filter-table-responsive-cal thead tr th:nth-child(10) {
        width : 150px;
      }

      .filter-table-responsive-cal tbody tr td{
        border-bottom: 1px solid black;
        vertical-align: middle;
        text-align : left;
      }

      .filter-table-responsive-cal tbody tr{
        vertical-align: middle;
      }

      .filter-table-responsive-cal tbody tr td:first-child{
        text-align: right;
        padding-right: 10px;
      }

    `;
    var converted = '';
    var page = 1;
    var content='';

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
    var intSumRows = this.state.rows
    var intSumm = intSumRows.filter(function(x){
      if(x.location == 'InsSheet' && x.component != 'Exterior Doorway' && x.component != 'Exterior Window' && x.component != 'Misc Exterior'){
        return true;
      }
      else if(x.unit == 'Calibration'){
        return false;
      }
      return x.result == "POSITIVE";
    });

    // var content = this.getInterior(page, datetime);
    // page ++;

    var intPageCount = Math.floor( ( intSumm.length - 1) / portraitPageSize ) + 1 ;
    for ( var i = 0 ; i < intPageCount; i++)
    {
      content += this.getInterior2(intSumRows, page, datetime, i * portraitPageSize);
      page++;
    }


    ///EXT summ
    var extSumRows = this.state.rows
    var extSumm = extSumRows.filter(function(x){
      if(x.location == 'InsSheet' && x.component != 'Exterior Doorway' && x.component != 'Exterior Window' && x.component != 'Misc Exterior'){
        return false;
      }
      else if(x.unit == 'Calibration'){
        return false;
      }
      return x.result == "POSITIVE";
    });

    // // Exterior Summary
    // content += this.getExterior(page, datetime);
    // page ++;

    var extPageCount = Math.floor( ( extSumm.length - 1) / portraitPageSize ) + 1 ;
    for ( var i = 0 ; i < extPageCount; i++)
    {
      content += this.getExterior2(extSumRows, page, datetime, i * portraitPageSize);
      page++;
    }


    // Calibration Summary
    content += this.getCalibration(page, datetime);

    content = juice.inlineContent(content, css);
    var converted = htmlDocx.asBlob(content, {orientation: 'portrait', margins: {top: 720, left : 700, right : 700, footer:10, bottom: 0}});
    saveAs(converted, jobId+' Summaries.docx' );


    page ++;

    page = 1;
    content = '';

    var report = this.state.rows.map((x,i) => {
      x.sampleId = i+1
      return x
    });

    // Interior Lead Containing Components List
    var interiorReport = report.filter(function(x){
      if(x.location == 'ExtSheet' || x.component == 'Exterior Doorway' || x.component == 'Exterior Window' || x.component == 'Misc Exterior'){
        return false;
      }
      else if(x.unit == 'Calibration'){
        return false;
      }
      return x.result == "POSITIVE";
    });

    if(interiorReport.length > 0)
    {
      content += this.positiveInterior(interiorReport, page, datetime, 0);
      page ++;
    }

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

    saveAs(converted,  jobId+' Data.docx');

  }

  getPortraitHeader(header) {
    return `
    <hr>
    <div class="heading">
      <h2>` + header + `</h2>
    </div>
    <div class="row" style="text-align:center;">
    <table style="width : 80%; font-size:12px">
      <tr style="width : 100%;">
        <td style="width : 40%; margin:0px">
            <p style='display:inline; margin: 0px; font-family:sans-serif'><strong>Project Name:</strong>` + (this.state.jobInfo? this.state.jobInfo.name : '') + `</p>
        </td>
        <td style="width : 60%; text-align:right; margin:0px">
            <p style='display:inline; margin: 0px; font-family:sans-serif'><strong>Project Number:</strong>`+ (this.state.jobInfo? this.state.jobInfo.id : '') + `</span>
        </td>
      </tr>
      <tr style="width : 100%;">
        <td style="width : 70%;">
              <div style='float:left; display:inline;font-family:sans-serif';height:190px' class="bold"><strong>Address: </strong></div>
              <div style='margin:0px'><p style='display:inline; margin: 0px; font-family:sans-serif'>` + (this.state.jobInfo? this.state.jobInfo.street: '') + `</p></div>
              <div style='margin:0px'><p style='display:inline; margin: 0px; font-family:sans-serif'>` + (this.state.jobInfo? this.state.jobInfo.city+', '+this.state.jobInfo.state + ' ' +this.state.jobInfo.postal: '') + `</p></div>
        </td>
        <td style="width : 30px; text-align:right">

        </td>
      </tr>
    </table>
    </div>
    `;
  }

  getPortraitFooter(page, datetime) {
    let text
    if(this.state.actionLevel == 0.8){
      text = "Testing done in compliance with current L.A. County DHS guidelines for XRF";
    } else if(this.state.actionLevel == 0.5) {
      text = "Testing done in compliance with current City of San Diego guidelines for XRF";
    } else if (this.state.actionLevel == 1.0){
      text = "Testing done in compliance with current HUD guidelines for XRF";
    } else {
      text = "Testing done in compliance with current guidelines for XRF";
    }

    return `
    <div style="margin-top: 20px;margin-bottom: 0px" class="footer">
      <div><p style='display:inline; margin: 0px; font-family:sans-serif'>${text}</p></div>
      <hr style='margin:0px;height:0.5px;padding:0px'>
      <div class="row" style="text-align:center;">
      <table style="width : 100%;">
        <tr style="width : 100%;">
          <td style="width : 40%; text-align:left; font-style: italic">
              <span class="bold">Barr & Clark Environmental (714) 894-5700</span>
          </td>
          <td style="width : 20%; text-align:center">
          </td>
          <td style="width : 40%; text-align:right">
            ` + datetime + `
          </td>
        </tr>
       </table>
    </div>
    <br clear="all" style="page-break-before:always" >`;
  }

  getLastPortraitFooter(page, datetime) {
    return `
    <div style="margin-top: 20px" class="footer">
      <span> Testing done in compliance with current L.A. County DHS guidelines for XRF</span>
      <hr style='margin:0px;height:0.5px;padding:0px'>
      <div class="row" style="text-align:center;">
      <table style="width : 100%;">
        <tr style="width : 100%;">
          <td style="width : 40%; text-align:left; font-style: italic">
              <span class="bold">Barr & Clark Environmental (714) 894-5700</span>
          </td>
          <td style="width : 20%; text-align:center">
          </td>
          <td style="width : 40%; text-align:right">
            ` + datetime + `
          </td>
        </tr>
       </table>
    </div>
    `;
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

  getInterior2(report, page, datetime, startIndex) {

    var header = this.getPortraitHeader('SUMMARY OF INTERIOR');
    var footer = this.getPortraitFooter(page, datetime);
    var interior = this.formatIntData(report);
    var charSet = ' '


    var numberSum = 0, numberposSum = 0, numbernegSum = 0 ;
    interior.forEach( item => {
      numberSum += item.number;
      numberposSum += item.numpos;
      numbernegSum += item.numneg;
    })
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
      <tbody>
    `;

    if(interior) {
      for( i = startIndex; i < interior.length; i ++ ){
        var x = interior[i];
        console.log("is",x)
        if(i >= startIndex + portraitPageSize)
          break;

              table += `<tr style='font-size:10px'>`;
            table += `<td><p style='display:inline; margin: 0px; font-family:sans-serif'>` + x.component + '</p></td>';
            table += `<td><p style='display:inline; margin: 0px; font-family:sans-serif'>` + x.number + '</p></td>';
            table += `<td><p style='display:inline; margin: 0px; font-family:sans-serif'>` + x.numpos + '</p></td>';
            table += `<td><p style='display:inline; margin: 0px; font-family:sans-serif'>` + show_percent(x.percentpos) + '</p></td>';
            table += `<td><p style='display:inline; margin: 0px; font-family:sans-serif'>` + x.numneg + '</p></td>';
            table += `<td><p style='display:inline; margin: 0px; font-family:sans-serif'>` + show_percent(x.percentneg) + '</p></td>';
            table += '</tr>';
            if (i == interior.length -1){
              table += `<tr style='font-size:12px'  class="blank">`;
                table += `<td class="bold" style="text-align:right;"><p style='display:inline; margin: 0px; font-family:sans-serif'>Total</p></td>`;
                table += `<td class="bold"><p style='display:inline; margin: 0px; font-family:sans-serif'>` + numberSum + '</p></td>';
                table += `<td class="bold"><p style='display:inline; margin: 0px; font-family:sans-serif'>` + numberposSum + '</p></td>';
                table += `<td><p style='display:inline; margin: 0px; font-family:sans-serif'></p></td>`;
                table += `<td class="bold"><p style='display:inline; margin: 0px; font-family:sans-serif'>` + numbernegSum + '</p></td>';
                table += `<td><p style='display:inline; margin: 0px; font-family:sans-serif'></p></td>`;
                table += '</tr>';
            }
      }
      if( startIndex + portraitPageSize > interior.length) {
        for(var i = 0; i < startIndex + portraitPageSize - interior.length; i ++)
        {
          table += `<tr style='font-size:10px' class="blank">`;
          table += `<td><p style='display:inline; margin: 0px; font-family:sans-serif'>` + '&nbsp;' + '</p></td>';
          table += '</tr>';
        }
      }
    }
    table += `</tbody>
    </table></div>`;
    var content = charSet + header + table + footer;
    return content;
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
      interior = interior.sort( (a,b) => {
       var textA = a.component.toUpperCase();
       var textB = b.component.toUpperCase();
       return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
      })
      interior.forEach( item => {
        numberSum += item.number;
        numberposSum += item.numpos;
        numbernegSum += item.numneg;
        table += `<tr style='font-size:10px; margin-bottom:10px'>`;
        table += `<td><p style='display:inline; margin: 0px; font-family:sans-serif'>` + item.component + '</p></td>';
        table += `<td><p style='display:inline; margin: 0px; font-family:sans-serif'>` + item.number + '</p></td>';
        table += `<td><p style='display:inline; margin: 0px; font-family:sans-serif'>` + item.numpos + '</p></td>';
        table += `<td><p style='display:inline; margin: 0px; font-family:sans-serif'>` + show_percent(item.percentpos) + '</p></td>';
        table += `<td><p style='display:inline; margin: 0px; font-family:sans-serif'>` + item.numneg + '</p></td>';
        table += `<td><p style='display:inline; margin: 0px; font-family:sans-serif'>` + show_percent(item.percentneg) + '</p></td>';
        table += '</tr>';
      })
      table += '<tr style="font-size:12px" class="blank">';
        table += `<td class="bold" style="text-align:right;"><p style='display:inline; margin: 0px; font-family:sans-serif'>Total</p></td>`;
        table += `<td class="bold"><p style='display:inline; margin: 0px; font-family:sans-serif'>` + numberSum + '</p></td>';
        table += `<td class="bold"><p style='display:inline; margin: 0px; font-family:sans-serif'>` + numberposSum + '</p></td>';
        table += `<td><p style='display:inline; margin: 0px; font-family:sans-serif'></p></td>`;
        table += `<td class="bold"><p style='display:inline; margin: 0px; font-family:sans-serif'>` + numbernegSum + '</p></td>';
        table += `<td><p style='display:inline; margin: 0px; font-family:sans-serif'></p></td>`;
        table += '</tr>';

      for(var i = 0; i < portraitPageSize - interior.length; i ++)
      {
        table += `<tr style='font-size:10px' class="blank">`;
        table += `<td><p style='display:inline; margin: 0px; font-family:sans-serif'>` + '&nbsp;' + '</p></td>';
        table += '</tr>';
      }
      table += `</tbody>
    </Table>`;

    var content = charSet + header + table + footer;

    return content;

  }

  getExterior2(report, page, datetime, startIndex) {

    var header = this.getPortraitHeader('SUMMARY OF EXTERIOR');
    var footer = this.getPortraitFooter(page, datetime);
    var exterior = this.formatExtData(report);
    exterior = exterior.sort( (a,b) => {
     var textA = a.component.toUpperCase();
     var textB = b.component.toUpperCase();
     return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
    })
    var charSet = ' '


    var numberSum = 0, numberposSum = 0, numbernegSum = 0 ;
    exterior.forEach( item => {
      numberSum += item.number;
      numberposSum += item.numpos;
      numbernegSum += item.numneg;
    })
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
      <tbody>
    `;

    if(exterior) {
      for( i = startIndex; i < exterior.length; i ++ ){
        var x = exterior[i];
        console.log("is",x)
        if(i >= startIndex + portraitPageSize)
          break;

              table += `<tr style='font-size:10px'>`;
            table += `<td><p style='display:inline; margin: 0px; font-family:sans-serif'>` + x.component + '</p></td>';
            table += `<td><p style='display:inline; margin: 0px; font-family:sans-serif'>` + x.number + '</p></td>';
            table += `<td><p style='display:inline; margin: 0px; font-family:sans-serif'>` + x.numpos + '</p></td>';
            table += `<td><p style='display:inline; margin: 0px; font-family:sans-serif'>` + show_percent(x.percentpos) + '</p></td>';
            table += `<td><p style='display:inline; margin: 0px; font-family:sans-serif'>` + x.numneg + '</p></td>';
            table += `<td><p style='display:inline; margin: 0px; font-family:sans-serif'>` + show_percent(x.percentneg) + '</p></td>';
            table += '</tr>';
            if (i == exterior.length -1){
              table += `<tr style='font-size:12px'  class="blank">`;
                table += `<td class="bold" style="text-align:right;"><p style='display:inline; margin: 0px; font-family:sans-serif'>Total</p></td>`;
                table += `<td class="bold"><p style='display:inline; margin: 0px; font-family:sans-serif'>` + numberSum + '</p></td>';
                table += `<td class="bold"><p style='display:inline; margin: 0px; font-family:sans-serif'>` + numberposSum + '</p></td>';
                table += `<td><p style='display:inline; margin: 0px; font-family:sans-serif'></p></td>`;
                table += `<td class="bold"><p style='display:inline; margin: 0px; font-family:sans-serif'>` + numbernegSum + '</p></td>';
                table += `<td><p style='display:inline; margin: 0px; font-family:sans-serif'></p></td>`;
                table += '</tr>';
            }
      }
      if( startIndex + portraitPageSize > exterior.length) {
        for(var i = 0; i < startIndex + portraitPageSize - exterior.length; i ++)
        {
          table += `<tr style='font-size:10px' class="blank">`;
          table += `<td><p style='display:inline; margin: 0px; font-family:sans-serif'>` + '&nbsp;' + '</p></td>';
          table += '</tr>';
        }
      }
    }
    table += `</tbody>
    </table></div>`;
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
      exterior = exterior.sort( (a,b) => {
       var textA = a.component.toUpperCase();
       var textB = b.component.toUpperCase();
       return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
      })
      exterior.forEach( item => {
        numberSum += item.number;
        numberposSum += item.numpos;
        numbernegSum += item.numneg;
        table += `<tr style='font-size:10px'>`;
        table += `<td><p style='display:inline; margin: 0px; font-family:sans-serif'>` + item.component + '</p></td>';
        table += `<td><p style='display:inline; margin: 0px; font-family:sans-serif'>` + item.number + '</p></td>';
        table += `<td><p style='display:inline; margin: 0px; font-family:sans-serif'>` + item.numpos + '</p></td>';
        table += `<td><p style='display:inline; margin: 0px; font-family:sans-serif'>` + show_percent(item.percentpos) + '</p></td>';
        table += `<td><p style='display:inline; margin: 0px; font-family:sans-serif'>` + item.numneg + '</p></td>';
        table += `<td><p style='display:inline; margin: 0px; font-family:sans-serif'>` + show_percent(item.percentneg) + '</p></td>';
        table += '</tr>';
      })
      table += '<tr style="font-size:12px" class="blank">';
        table += `<td class="bold" style="text-align:right;"><p style='display:inline; margin: 0px; font-family:sans-serif'>Total</p></td>`;
        table += `<td class="bold"><p style='display:inline; margin: 0px; font-family:sans-serif'>` + numberSum + '</p></td>';
        table += `<td class="bold"><p style='display:inline; margin: 0px; font-family:sans-serif'>` + numberposSum + '</p></td>';
        table += `<td><p style='display:inline; margin: 0px; font-family:sans-serif'></p></td>`;
        table += `<td class="bold"><p style='display:inline; margin: 0px; font-family:sans-serif'>` + numbernegSum + '</p></td>';
        table += `<td><p style='display:inline; margin: 0px; font-family:sans-serif'></p></td>`;
        table += '</tr>';

      for(var i = 0; i < portraitPageSize - exterior.length; i ++)
      {
        table += `<tr style='font-size:10px' class="blank">`;
        table += `<td><p style='display:inline; margin: 0px; font-family:sans-serif'>` + '&nbsp;' + '</p></td>';
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
    var footer = this.getLastPortraitFooter(page, datetime);

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
        table += `<tr style='font-size:10px'>`;
        table += `<td><p style='display:inline; margin: 0px; font-family:sans-serif'>` + item.component + '</p></td>';
        table += `<td><p style='display:inline; margin: 0px; font-family:sans-serif'>` + item.number + '</p></td>';
        table += `<td><p style='display:inline; margin: 0px; font-family:sans-serif'>` + item.numpos + '</p></td>';
        table += `<td><p style='display:inline; margin: 0px; font-family:sans-serif'>` + show_percent(item.percentpos) + '</p></td>';
        table += `<td><p style='display:inline; margin: 0px; font-family:sans-serif'>` + item.numneg + '</td>';
        table += `<td><p style='display:inline; margin: 0px; font-family:sans-serif'>` + show_percent(item.percentneg) + '</p></td>';
        table += '</tr>';
      })
      table += '<tr style="font-size:12px" class="blank">';
        table += `<td class="bold" style="text-align:right;"><p style='display:inline; margin: 0px; font-family:sans-serif'>Total</p></td>`;
        table += `<td class="bold"><p style='display:inline; margin: 0px; font-family:sans-serif'>` + numberSum + '</p></td>';
        table += `<td class="bold"><p style='display:inline; margin: 0px; font-family:sans-serif'>` + numberposSum + '</p></td>';
        table += `<td><p style='display:inline; margin: 0px; font-family:sans-serif'></p></td>`;
        table += `<td class="bold"><p style='display:inline; margin: 0px; font-family:sans-serif'>` + numbernegSum + '</p></td>';
        table += `<td><p style='display:inline; margin: 0px; font-family:sans-serif'></p></td>`;
        table += '</tr>';

      for(var i = 0; i < portraitPageSize - calibration.length; i ++)
      {
        table += '<tr style="font-size:10px" class="blank">';
        table += `<td><p style='display:inline; margin: 0px; font-family:sans-serif'>` + '&nbsp;' + '</p></td>';
        table += '</tr>';
      }
      table += `</tbody>
    </Table>`;

    var content = charSet + header + table + footer;

    return content;

  }

  getLandscapeHeader(header) {
    let protocol
    if(this.state.actionLevel == 0.7){
      protocol = "LA County";
    } else if(this.state.actionLevel == 0.5) {
      protocol = "City of San Diegeo";
    } else if (this.state.actionLevel == 1.0){
      protocol = "HUD";
    } else {
      protocol = this.state.actionLevel;
    }
    return `
    <div style="padding-top:10px" class="heading">
      <h3>` + header + `</h3>
    </div>
    <div class="row" style="text-align:center;">
    <table style="width : 90%;">
      <tr style="width : 100%;">
        <td style="width : 72%; margin: 0px;">
        <p style='display:inline; margin: 0px; font-family:sans-serif'><strong>Project Name:</strong>` + (this.state.jobInfo? this.state.jobInfo.name : '') + `</p>
        </td>
        <td style="width : 50px; margin: 0px;">
        <p style='display:inline; margin: 0px; font-family:sans-serif'><strong>Project Number:</strong>` + (this.state.jobInfo? this.state.jobInfo.id : '') + `</p>

        </td>
      </tr>
      <tr style="width : 100%;">
      <td style="width : 72%;">
            <div style='float:left; display:inline;font-family:sans-serif';height:190px' class="bold"><strong>Address: </strong></div>
            <div style='margin:0px'><p style='display:inline; margin: 0px; font-family:sans-serif'>` + (this.state.jobInfo? this.state.jobInfo.street: '') + `</p></div>
            <div style='margin:0px'><p style='display:inline; margin: 0px; font-family:sans-serif'>` + (this.state.jobInfo? this.state.jobInfo.city+', '+this.state.jobInfo.state + ' ' +this.state.jobInfo.postal: '') + `</p></div>
      </td>
        <td style="width : 50px; vertical-align:top;text-align:left">
          <p style='display:inline; margin: 0px; font-family:sans-serif'><strong>Protocol:</strong>`+ protocol +`</p>
        </td>
      </tr>
    </table>
    </div>
    `;
  }

  getLandscapeFooter(page, datetime) {
    let text, text2
    if(this.state.actionLevel == 0.8){
      text = "LA County DHS action level for lead paint is 0.8.";
      text2 = "Positive is defined as XRF sampling with levels at or above 0.8 mg/cm2.";
    } else if(this.state.actionLevel == 0.5) {
      text = "City of San Diegeo DHS action level for lead paint is 0.5.";
      text2 = "Positive is defined as XRF sampling with levels in excess of 0.5 mg/cm2.";
    } else if (this.state.actionLevel == 1.0){
      text = "HUD DHS action level for lead-based paint is 1.0 mg/cm2.";
      text2 = "Positive is defined as XRF sampling with levels in excess of 1.0 mg/cm2.";
    } else {
      text = "DHS action level for lead paint is" + this.state.actionLevel+' mg/cm2.';
      text2 = "Positive is defined as XRF sampling with levels in excess of" + this.state.actionLevel + " mg/cm2.";
    }

    return `
    <div class="footer" style="font-size:12px">
      <p style="margin:0px 20px; padding:0px; font-family:sans-serif"> ${text}</p>
      <p style="margin:0px 20px; padding:0px; font-family:sans-serif"> ${text2}</p>
      <hr style="width : 95%;">

      <div class="row" style="text-align:center;">
      <table style="width : 95%;">
        <tr style="width : 95%;">
          <td style="width : 40%; text-align:left; font-style: italic">
              <span style="margin:30px" class="bold">Barr & Clark Environmental (714) 894-5700</span>
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

  getLastLandscapeFooter(page, datetime) {
    let text, text2
    if(this.state.actionLevel == 0.8){
      text = "LA County DHS action level for lead paint is 0.8.";
      text2 = "Positive is defined as XRF sampling with levels at or above 0.8 mg/cm2.";
    } else if(this.state.actionLevel == 0.5) {
      text = "City of San Diegeo DHS action level for lead paint is 0.5.";
      text2 = "Positive is defined as XRF sampling with levels in excess of 0.5 mg/cm2.";
    } else if (this.state.actionLevel == 1.0){
      text = "HUD DHS action level for lead-based paint is 1.0 mg/cm2.";
      text2 = "Positive is defined as XRF sampling with levels in excess of 1.0 mg/cm2.";
    } else {
      text = "DHS action level for lead paint is" + this.state.actionLevel+' mg/cm2.';
      text2 = "Positive is defined as XRF sampling with levels in excess of" + this.state.actionLevel + " mg/cm2.";
    }

    return `
    <div class="footer" style="font-size:12px">
      <p style="margin:0px 20px; padding:0px; font-family:sans-serif">last ${text}</p>
      <p style="margin:0px 20px; padding:0px; font-family:sans-serif"> ${text2}</p>
      <hr style="width : 95%;">

      <div class="row" style="text-align:center;">
      <table style="width : 95%;">
        <tr style="width : 95%;">
          <td style="width : 40%; text-align:left; font-style: italic">
              <span style="margin:30px" class="bold">Barr & Clark Environmental (714) 894-5700</span>
          </td>
          <td style="width : 20%; text-align:center">
            ` + page +
          `</td>
          <td style="width : 40%; text-align:right">
            ` + datetime + `
          </td>
        </tr>
       </table>
    </div>`;
  }

  dataReport(report, page, datetime, startIndex) { // data, page_number, current datetime, start index in the array

    var charSet = ' ';
    var last = false
    var landscapeHeader = this.getLandscapeHeader('FIELD DATA REPORT');
    var landscapeFooter = this.getLandscapeFooter(page, datetime);
    var lastlandscapeFooter = this.getLastLandscapeFooter(page, datetime);

    var table = `<div class="filter-table-responsive"> <table class="table font-smaller">
      <thead>
      <tr style="font-size:12.5px;">
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
      <tbody>`;



      if(report) {
        for( i = startIndex; i < report.length; i ++ )
        {
          console.log("ss",x)
          if(i >= startIndex + landscapePageSize)
            break;
          var x = report[i];

          let location;
          let color = "#fff";
          let condition = '';
          let reading = '';

          if(x && x.result == 'POSITIVE'){
            color = '#acb5bc'
          }

          if(x && x.condition == 'Deteriorated'){
            condition = 'DETERIORATED'
          } else {
            condition = x.condition
          }

          if(x && x.reading == '1'){
            reading = '1.0'
          } else {
            reading = x.reading
          }

          if(x.location == 'InsSheet' && x.component != 'Exterior Doorway' && x.component != 'Exterior Window' && x.component != 'Misc Exterior'){
            location = 'Interior'
          }
          else if(x.unit == 'Calibration'){
            location = 'Calibration'
          }
          else {
            location = 'Exterior'
          }

          let name = x.name;
          if( name.startsWith("Wall") )
            name = "Wall";

          table += `<tr style="font-size:11px; background-color:` + color + `">
              <td style='white-space:nowrap'><p style='display:inline; margin: 0px; font-family:sans-serif'>` + (i+1) + `</p></td>
              <td style='white-space:nowrap'><p style='display:inline; margin: 0px; font-family:sans-serif'>` + (x.unit|| '') + `</p></td>
              <td style='white-space:nowrap'><p style='display:inline; margin: 0px; font-family:sans-serif'>` + (location + ' ' + x.room) + `</p></td>
              <td style='white-space:nowrap'><p style='display:inline; margin: 0px; font-family:sans-serif'>` + (x.side|| '') + `</p></td>
              <td style='white-space:nowrap'><p style='display:inline; margin: 0px; font-family:sans-serif'>` + (name) + `</p></td>
              <td style='white-space:nowrap'><p style='display:inline; margin: 0px; font-family:sans-serif'>` + (x.material) + `</p></td>
              <td style='white-space:nowrap'><p style='display:inline; margin: 0px; font-family:sans-serif'>` + (condition || '') + `</p></td>
              <td style='white-space:nowrap' class="center"><p style='display:inline; margin: 0px; font-family:sans-serif'>` + (reading   || '0') + `</p></td>
              <td style='white-space:nowrap'><p style='display:inline; margin: 0px; font-family:sans-serif'>` + (x.result || ' ') + `</p></td>
              <td style='white-space:nowrap'><p style='display:inline; margin: 0px; font-family:sans-serif'>` + (x.type? x.type+' ': "") + (x.comments || ' ') + `</p></td>
            </tr>`;
        }
      }
      else {
        table += `<tr><td>"No Inspection Data"</td></tr>`;
      }

      if( startIndex + landscapePageSize > report.length) {
        last = true
        for(var i = 0; i < startIndex + landscapePageSize - report.length; i ++)
        {
          table += '<tr style="font-size:11px;" class="blank">';
          table += `<td><p style='display:inline; margin: 0px; font-family:sans-serif'>` + '&nbsp;' + '</p></td>';
          table += '</tr>';
        }
      }
      table += `</tbody>
    </table></div>`;

    var content
    if(last){
      content = charSet + landscapeHeader + table + lastlandscapeFooter;
    } else {
      content = charSet + landscapeHeader + table + landscapeFooter;
    }

    return content;


  }


  positiveInterior(report, page, datetime, startIndex) { // data, page_number, current datetime, start index in the array
    var charSet = ' ';
    var landscapeHeader = this.getLandscapeHeader('Interior Lead Containing Components List');
    var landscapeFooter = this.getLandscapeFooter(page, datetime);



    var table = `<div class="filter-table-responsive-cal"> <table class="table font-smaller">
      <thead>
      <tr style="font-size:12.5px;">
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
          let reading
          let condition
          let color = "#fff";


          if(x && x.condition == 'Deteriorated'){
            condition = 'DETERIORATED'
          } else {
            condition = x.condition
          }

          if(x && x.reading == '1'){
            reading = '1.0'
          } else {
            reading = x.reading
          }
          if(x && x.result == 'POSITIVE'){
            color = '#acb5bc'
          }
          if(x.location == 'InsSheet' && x.component != 'Exterior Doorway' && x.component != 'Exterior Window' && x.component != 'Misc Exterior'){
            location = 'Interior'
          }
          else if(x.unit == 'Calibration'){
            location = 'Calibration'
          }
          else {
            location = 'Exterior'
          }

          table += `<tr style="font-size:11px; background-color:` + color + `">
              <td style='white-space:nowrap'><p style='display:inline; margin: 0px; font-family:sans-serif'>` + (x.sampleId|| '') + `</p></td>
              <td style='white-space:nowrap'class="center"><p style='display:inline; margin: 0px; font-family:sans-serif'>` + (x.side|| '') + `</p></td>
              <td style='white-space:nowrap'><p style='display:inline; margin: 0px; font-family:sans-serif'>` + (x.name + ' ' + x.material) + `</p></td>
              <td style='white-space:nowrap'><p style='display:inline; margin: 0px; font-family:sans-serif'>` + (location + ' ' + x.room) + `</p></td>
              <td style='white-space:nowrap' class="center"><p style='display:inline; margin: 0px; font-family:sans-serif'>` + (reading || '0') + `</p></td>
              <td style='white-space:nowrap'><p style='display:inline; margin: 0px; font-family:sans-serif'>` + (x.result || ' ') + `</p></td>
              <td style='white-space:nowrap'><p style='display:inline; margin: 0px; font-family:sans-serif'>` + (condition || '') + `</p></td>
              <td style='white-space:nowrap'><p style='display:inline; margin: 0px; font-family:sans-serif'>` + (x.type? x.type+', ': "") + (x.comments || ' ') + `</p></td>
            </tr>`;
        }
      }
      else {
        table += `<tr><td>"No Inspection Data"</td></tr>`;
      }

      if( startIndex + landscapePageSize > report.length) {
        for(var i = 0; i < startIndex + landscapePageSize - report.length; i ++)
        {
          table += '<tr style="font-size:11px;" class="blank">';
          table += `<td><p style='display:inline; margin: 0px; font-family:sans-serif'>` + '&nbsp;' + '</p></td>';
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



    var table = `<div class="filter-table-responsive-cal"> <table class="table font-smaller">
      <thead>
      <tr style="font-size:12.5px;">
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
          let reading
          let condition
          let color = "#fff";


          if(x && x.condition == 'Deteriorated'){
            condition = 'DETERIORATED'
          } else {
            condition = x.condition
          }

          if(x && x.reading == '1'){
            reading = '1.0'
          } else {
            reading = x.reading
          }
          if(x && x.result == 'POSITIVE'){
            color = '#acb5bc'
          }
          if(x.location == 'InsSheet' && x.component != 'Exterior Doorway' && x.component != 'Exterior Window' && x.component != 'Misc Exterior'){
            location = 'Interior'
          }
          else if(x.unit == 'Calibration'){
            location = 'Calibration'
          }
          else {
            location = 'Exterior'
          }

          table += `<tr style="font-size:11px; background-color:` + color + `">
              <td style='white-space:nowrap'><p style='display:inline; margin: 0px; font-family:sans-serif'>` + (x.sampleId|| '') + `</p></td>
              <td style='white-space:nowrap'class="center"><p style='display:inline; margin: 0px; font-family:sans-serif'>` + (x.side|| '') + `</p></td>
              <td style='white-space:nowrap'><p style='display:inline; margin: 0px; font-family:sans-serif'>` + (x.name + ' ' + x.material) + `</p></td>
              <td style='white-space:nowrap'><p style='display:inline; margin: 0px; font-family:sans-serif'>` + (location + ' ' + x.room) + `</p></td>
              <td style='white-space:nowrap' class="center"><p style='display:inline; margin: 0px; font-family:sans-serif'>` + (reading || '0') + `</p></td>
              <td style='white-space:nowrap'><p style='display:inline; margin: 0px; font-family:sans-serif'>` + (x.result || ' ') + `</p></td>
              <td style='white-space:nowrap'><p style='display:inline; margin: 0px; font-family:sans-serif'>` + (condition || '') + `</p></td>
              <td style='white-space:nowrap'><p style='display:inline; margin: 0px; font-family:sans-serif'>` + (x.type? x.type+', ': "") + (x.comments || ' ') + `</p></td>
            </tr>`;
        }
      }
      else {
        table += `<tr><td>"No Inspection Data"</td></tr>`;
      }

      if( startIndex + landscapePageSize > report.length) {
        for(var i = 0; i < startIndex + landscapePageSize - report.length; i ++)
        {
          table += '<tr style="font-size:11px;" class="blank">';
          table += `<td><p style='display:inline; margin: 0px; font-family:sans-serif'>` + '&nbsp;' + '</p></td>';
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
    var landscapeHeader = this.getLandscapeHeader('Calibration Lead Containing Components List');
    var landscapeFooter = this.getLandscapeFooter(page, datetime);



    var table = `<div class="filter-table-responsive-cal"> <table class="table font-smaller">
      <thead>
      <tr style="font-size:12.5px;">
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
          let reading
          let color = "#fff";

          if(x && x.reading == '1'){
            reading = '1.0'
          } else {
            reading = x.reading
          }

          if(x && x.result == 'POSITIVE'){
            color = '#acb5bc'
          }
          if(x.location == 'InsSheet' && x.component != 'Exterior Doorway' && x.component != 'Exterior Window' && x.component != 'Misc Exterior'){
            location = 'Interior'
          }
          else if(x.unit == 'Calibration'){
            location = 'Calibration'
          }
          else {
            location = 'Exterior'
          }

          table += `<tr style="font-size:11px; background-color:` + color + `">
              <td style='white-space:nowrap'><p style='display:inline; margin: 0px; font-family:sans-serif'>` + (x.sampleId|| '') + `</p></td>
              <td style='white-space:nowrap' class="center"><p style='display:inline; margin: 0px; font-family:sans-serif'>` + (x.side|| '') + `</p></td>
              <td style='white-space:nowrap'><p style='display:inline; margin: 0px; font-family:sans-serif'>` + (x.name + ' ' + x.material) + `</p></td>
              <td style='white-space:nowrap'><p style='display:inline; margin: 0px; font-family:sans-serif'>` + (location + ' ' + x.room) + `</p></td>
              <td style='white-space:nowrap' class="center"><p style='display:inline; margin: 0px; font-family:sans-serif'>` + (reading || '0') + `</p></td>
              <td style='white-space:nowrap'><p style='display:inline; margin: 0px; font-family:sans-serif'>` + (x.result || ' ') + `</p></td>
              <td style='white-space:nowrap'><p style='display:inline; margin: 0px; font-family:sans-serif'>` + (x.condition || '') + `</p></td>
              <td style='white-space:nowrap'><p style='display:inline; margin: 0px; font-family:sans-serif'>` + (x.type? x.type+', ': "") + (x.comments || ' ') + `</p></td>
            </tr>`;
        }
      }
      else {
        table += `<tr><td>"No Inspection Data"</td></tr>`;
      }

      if( startIndex + landscapePageSize > report.length) {
        for(var i = 0; i < startIndex + landscapePageSize - report.length; i ++)
        {
          table += '<tr style="font-size:11px;" class="blank">';
          table += `<td><p style='display:inline; margin: 0px; font-family:sans-serif'>` + '&nbsp;' + '</p></td>';
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
          <div className="card-header-actions">
            <Button onClick={()=>{this.props.history.push('/create/'+this.state.jobInfo.id) }}>Edit</Button>
          </div>
        </div>
        <div className="card-body">
          <div className="bd-example">
            <dl className="row">
              <Media object style={{
  margin: "0 auto",
  maxHeight: 228,
  maxWidth: 228
}} src={"https://barrandclark.s3-us-west-1.amazonaws.com/uploads/"+this.props.match.params.id+".png"} />
            </dl>

            <dl className="row">
              <dd className="col-sm-3">Job Id:</dd>
              <dt className="col-sm-9">{this.state.jobInfo? this.state.jobInfo.id : ''}</dt>
              <dd className="col-sm-3">Job Name</dd>
              <dt className="col-sm-9">{this.state.jobInfo? this.state.jobInfo.name : ''}</dt>
              <dd className="col-sm-3">Homeowner Name</dd>
              <dt className="col-sm-9">{this.state.jobInfo? this.state.jobInfo.homeownerName : ''}</dt>
              <dd className="col-sm-3">Homeowner Number</dd>
              <dt className="col-sm-9">{this.state.jobInfo? this.state.jobInfo.homeownerNumber : ''}</dt>
              <dd className="col-sm-3">Client</dd>
              <dt className="col-sm-9">{this.state.jobInfo? this.state.jobInfo.clientInfo? this.state.jobInfo.clientInfo.data[0].name:'' : ''}</dt>
              <dd className="col-sm-3">Address</dd>
              <dt className="col-sm-9">{this.state.jobInfo? this.state.jobInfo.street + ' ' +this.state.jobInfo.city+', '+this.state.jobInfo.state: ''}</dt>
              <dd className="col-sm-3">Site Contact</dd>
              <dt className="col-sm-9">{this.state.jobInfo? this.state.jobInfo.siteName : ''}</dt>
              <dd className="col-sm-3">Site Contact Number</dd>
              <dt className="col-sm-9">{this.state.jobInfo? this.state.jobInfo.siteNumber : ''}</dt>
              <dd className="col-sm-3">Intake notes</dd>
              <dt className="col-sm-9">{this.state.jobInfo? this.state.jobInfo.comments : ''}</dt>
              <dd className="col-sm-3">Inspector</dd>
              <dt className="col-sm-9">{this.state.jobInfo? this.state.jobInfo.inspector : ''}</dt>
              <dd className="col-sm-3">Inspection Type</dd>
              <dt className="col-sm-9">{this.state.jobInfo? this.state.jobInfo.jobtype : ''}</dt>
              <dd className="col-sm-3">Arrive early</dd>
              <dt className="col-sm-9">{this.state.jobInfo? this.state.jobInfo.early? "Yes":"No" : ''}</dt>
              <dd className="col-sm-3">Dogs</dd>
              <dt className="col-sm-9">{this.state.jobInfo? this.state.jobInfo.dogs? "Yes":"No" : ''}</dt>
              <dd className="col-sm-3">Gates</dd>
              <dt className="col-sm-9">{this.state.jobInfo? this.state.jobInfo.gates? "Yes":"No" : ''}</dt>
              <dd className="col-sm-3">Cost</dd>
              <dt className="col-sm-9">{this.state.jobInfo? this.state.jobInfo.cost: ''}</dt>
              <dd className="col-sm-3">COD</dd>
              <dt className="col-sm-9">{this.state.jobInfo? this.state.jobInfo.cod: ''}</dt>
              <dd className="col-sm-3">Dust</dd>
              <dt className="col-sm-9">{this.state.jobInfo? this.state.jobInfo.numdust : ''}</dt>
              <dd className="col-sm-3">Soil</dd>
              <dt className="col-sm-9">{this.state.jobInfo? this.state.jobInfo.numsoil : ''}</dt>

              <dd className="col-sm-3">Parking inst.</dd>
              <dt className="col-sm-9">{this.state.jobInfo? this.state.jobInfo.parking : ''}</dt>
              <dd className="col-sm-3">Abatement contractor name</dd>
              <dt className="col-sm-9">{this.state.jobInfo? this.state.jobInfo.cname : ''}</dt>
              <dd className="col-sm-3">Abatement contractor phone</dd>
              <dt className="col-sm-9">{this.state.jobInfo? this.state.jobInfo.cphone : ''}</dt>

              <br></br>
              <br></br>
              <br></br>
            </dl>
            <dl>
            <dd className="col-sm-3">
              <Button color="success" onClick={() => this.printSummary(this.state.jobInfo.id)}>Print Summary</Button>
            </dd>
            {
            // <dd className="col-sm-2">
            //   <Button color="success" onClick={() => this.print8552()}>Print 8552</Button>
            // </dd>
            }
            {this.state.jobInfo && this.state.jobInfo.inspected!=1 ?
              <dd className="col-sm-3">
                <Button color="success" onClick={() => this.markInspected(this.state.jobInfo.id)}>Mark Inspected</Button>
              </dd>
            :
          ''}
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
                      <th>Sheet Number</th>
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
                      return <Insrow key={i} openModal={this.openModal} sheetIndex={x.sheetIndex} sampleId={i} side={x.side} item={x.name} property={x.property} material={x.material} room={x.room} reading={x.reading} result={x.result} condition={x.condition} type={x.type} comments={x.comments} location={x.location} component={x.component} unit={x.unit} inspectionId={x.inspectionId} stateId={x.stateId} sheetId={x.sheetId} itemId={x.itemId} />
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
                  <dd className="col-sm-3">Sheet Order</dd>
                  <dt className="col-sm-9">
                    <Input type="number" value={this.state.modalStuff.sheetIndex+1} onChange={(e) => {
                      let modalStuff = {...this.state.modalStuff};
                      modalStuff.sheetIndex = e.target.value -1
                      this.setState({modalStuff})
                    }}/>
                  </dt>
                </dl>

                <dl className="row">
                  <dd className="col-sm-3">unit</dd>
                  <dt className="col-sm-9">
                  <Input value={this.state.modalStuff.unit} onChange={(e) => {
                    let modalStuff = {...this.state.modalStuff};
                    modalStuff.unit = e.target.value
                    this.setState({modalStuff})
                  }}/>
                  </dt>
                </dl>

                {
                  //<dl className="row">
                //   <dd className="col-sm-3">location</dd>
                //   <dt className="col-sm-9">
                //   <Input value={this.state.modalStuff.location}/>
                //   </dt>
                // </dl>
                }

                <dl className="row">
                  <dd className="col-sm-3">room</dd>
                  <dt className="col-sm-9">
                  <Input value={this.state.modalStuff.room} onChange={(e) => {
                    let modalStuff = {...this.state.modalStuff};
                    modalStuff.room = e.target.value
                    this.setState({modalStuff})
                  }}/>
                  </dt>
                </dl>
                <dl className="row">
                  <dd className="col-sm-3">Side</dd>
                  <dt className="col-sm-9">
                    <Input value={this.state.modalStuff.side} onChange={(e) => {
                      let modalStuff = {...this.state.modalStuff};
                      modalStuff.side = e.target.value
                      this.setState({modalStuff})
                    }}/>
                  </dt>
                </dl>
                <dl className="row">
                  <dd className="col-sm-3">Component</dd>
                  <dt className="col-sm-9">
                  <Input value={this.state.modalStuff.item} onChange={(e) => {
                    let modalStuff = {...this.state.modalStuff};
                    modalStuff.item = e.target.value
                    this.setState({modalStuff})
                  }}/>
                  </dt>
                </dl>
                <dl className="row">
                  <dd className="col-sm-3">Material</dd>
                  <dt className="col-sm-9">
                  <Input value={this.state.modalStuff.material} onChange={(e) => {
                    let modalStuff = {...this.state.modalStuff};
                    modalStuff.material = e.target.value
                    this.setState({modalStuff})
                  }}/>
                  </dt>
                </dl>
                <dl className="row">
                  <dd className="col-sm-3">Intact</dd>
                  <dt className="col-sm-9">
                  <Input type="checkbox" checked={this.state.modalStuff.condition == "Intact"} onChange={(e) => {
                    let modalStuff = {...this.state.modalStuff};
                    if(this.state.modalStuff.condition == "Deteriorated"){
                      modalStuff.condition = "Intact"
                    } else{
                      modalStuff.condition = "Deteriorated"
                    }
                    this.setState({modalStuff})
                  }}/>
                  </dt>
                </dl>
                <dl className="row">
                  <dd className="col-sm-3">Reading</dd>
                  <dt className="col-sm-9">
                  <Input type="number" value={this.state.modalStuff.reading} onChange={(e) => {
                    let modalStuff = {...this.state.modalStuff};
                    modalStuff.reading = e.target.value
                    if(e.target.value == 999){
                      modalStuff.reading = null
                    }
                    this.setState({modalStuff})
                  }}/>
                  </dt>
                </dl>
                <dl className="row">
                  <dd className="col-sm-3">comments</dd>
                  <dt className="col-sm-9">
                  <Input value={this.state.modalStuff.comments} onChange={(e) => {
                    let modalStuff = {...this.state.modalStuff};
                    modalStuff.comments = e.target.value
                    this.setState({modalStuff})
                  }}/>
                  </dt>
                </dl>
                <dl className="row">
                  <dd className="col-sm-3">type</dd>
                  <dt className="col-sm-9">
                  <Input value={this.state.modalStuff.type} onChange={(e) => {
                    let modalStuff = {...this.state.modalStuff};
                    modalStuff.type = e.target.value
                    this.setState({modalStuff})
                  }}/>
                  </dt>
                </dl>

                </form>
                <Button onClick={this.saveModal}>Save</Button>

                  <Button style={{backgroundColor:"#e29898", margin: "20px" }} danger onClick={this.deleteItemModal}>Delete</Button>


              </Modal>
              :
              ''
            }


            {
              ////PROP Modal
            }
            { this.state.propModalStuff ?
              <Modal
                isOpen={this.state.propModalIsOpen}
                onAfterOpen={this.afterOpenPropModal}
                onRequestClose={this.closePropModal}
                style={customStyles}
                contentLabel="Example Modal"
              >
                <h2 ref={subtitle => this.subtitle = subtitle}>Edit</h2>
                <form>

                <dl className="row">

                  <dd className="col-lg-1">Type of dwelling</dd>
                  <dt className="col-lg-3">
                    <Input value={ this.state.propModalStuff.dwelling } onChange={(e) => {
                      let propModalStuff = {...this.state.propModalStuff};
                      propModalStuff.dwelling = e.target.value
                      this.setState({propModalStuff})
                    }}/>
                  </dt>

                  <dd className="col-lg-1">Year Build</dd>
                  <dt className="col-lg-3">
                    <Input type="number" value={ this.state.propModalStuff.year } onChange={(e) => {
                      let propModalStuff = {...this.state.propModalStuff};
                      propModalStuff.year = e.target.value
                      this.setState({propModalStuff})
                    }}/>
                  </dt>

                  <dd className="col-lg-1">Built over</dd>
                  <dt className="col-lg-3">
                    <Input value={ this.state.propModalStuff.builtover } onChange={(e) => {
                      let propModalStuff = {...this.state.propModalStuff};
                      propModalStuff.builtover = e.target.value
                      this.setState({propModalStuff})
                    }}/>
                  </dt>
                </dl>

                <dl className="row">
                  <dd className="col-lg-1">Type of Payment</dd>
                  <dt className="col-lg-3">
                    <Input value={ this.state.propModalStuff.payment } onChange={(e) => {
                      let propModalStuff = {...this.state.propModalStuff};
                      propModalStuff.payment = e.target.value
                      this.setState({propModalStuff})
                    }}/>
                  </dt>

                  <dd className="col-lg-1">Number of units</dd>
                  <dt className="col-lg-3">
                    <Input value={ this.state.propModalStuff.units } onChange={(e) => {
                      let propModalStuff = {...this.state.propModalStuff};
                      propModalStuff.units = e.target.value
                      this.setState({propModalStuff})
                    }}/>
                  </dt>

                  <dd className="col-lg-1">Number of stories</dd>
                  <dt className="col-lg-3">
                    <Input value={ this.state.propModalStuff.stories } onChange={(e) => {
                      let propModalStuff = {...this.state.propModalStuff};
                      propModalStuff.stories = e.target.value
                      this.setState({propModalStuff})
                    }}/>
                  </dt>
                </dl>

                <dl className="row">
                  <dd className="col-lg-1">Number of laundry</dd>
                  <dt className="col-lg-3">
                    <Input value={ this.state.propModalStuff.laundry } onChange={(e) => {
                      let propModalStuff = {...this.state.propModalStuff};
                      propModalStuff.laundry = e.target.value
                      this.setState({propModalStuff})
                    }}/>
                  </dt>

                  <dd className="col-lg-1">Number of garages</dd>
                  <dt className="col-lg-3">
                    <Input value={ this.state.propModalStuff.garages } onChange={(e) => {
                      let propModalStuff = {...this.state.propModalStuff};
                      propModalStuff.garages = e.target.value
                      this.setState({propModalStuff})
                    }}/>
                  </dt>

                  <dd className="col-lg-1">garage</dd>
                  <dt className="col-lg-3">
                    <Input value={ this.state.propModalStuff.garage } onChange={(e) => {
                      let propModalStuff = {...this.state.propModalStuff};
                      propModalStuff.garage = e.target.value
                      this.setState({propModalStuff})
                    }}/>
                  </dt>
                </dl>

               <dl className="row">
                  <dd className="col-lg-1">Units accessed via</dd>
                  <dt className="col-lg-3">
                    <Input value={ this.state.propModalStuff.exterior } onChange={(e) => {
                      let propModalStuff = {...this.state.propModalStuff};
                      propModalStuff.exterior = e.target.value
                      this.setState({propModalStuff})
                    }}/>
                  </dt>


                  <dd className="col-lg-1">Areas not accessable</dd>
                  <dt className="col-lg-3">
                    <Input value={ this.state.propModalStuff.noaccess } onChange={(e) => {
                      let propModalStuff = {...this.state.propModalStuff};
                      propModalStuff.noaccess = e.target.value
                      this.setState({propModalStuff})
                    }}/>
                  </dt>

                  <dd className="col-lg-1">Number of stories in building</dd>
                  <dt className="col-lg-3">
                    <Input value={ this.state.propModalStuff.buildingstories } onChange={(e) => {
                      let propModalStuff = {...this.state.propModalStuff};
                      propModalStuff.buildingstories = e.target.value
                      this.setState({propModalStuff})
                    }}/>
                  </dt>
                </dl>

              <dl className="row">
                  <dd className="col-lg-1">Number of stories in unit</dd>
                  <dt className="col-lg-3">
                    <Input value={ this.state.propModalStuff.unitstories } onChange={(e) => {
                      let propModalStuff = {...this.state.propModalStuff};
                      propModalStuff.unitstories = e.target.value
                      this.setState({propModalStuff})
                    }}/>
                  </dt>

                  <dd className="col-lg-1">Number of beds</dd>
                  <dt className="col-lg-3">
                    <Input value={ this.state.propModalStuff.bednums } onChange={(e) => {
                      let propModalStuff = {...this.state.propModalStuff};
                      propModalStuff.bednums = e.target.value
                      this.setState({propModalStuff})
                    }}/>
                  </dt>

                  <dd className="col-lg-1">Number of baths</dd>
                  <dt className="col-lg-3">
                    <Input value={ this.state.propModalStuff.bathnums } onChange={(e) => {
                      let propModalStuff = {...this.state.propModalStuff};
                      propModalStuff.bathnums = e.target.value
                      this.setState({propModalStuff})
                    }}/>
                  </dt>
                </dl>

                <dl className="row">
                  <dd className="col-lg-1">Number of dust samples</dd>
                  <dt className="col-lg-3">
                    <Input value={ this.state.propModalStuff.dustnums } onChange={(e) => {
                      let propModalStuff = {...this.state.propModalStuff};
                      propModalStuff.dustnums = e.target.value
                      this.setState({propModalStuff})
                    }}/>
                  </dt>

                  <dd className="col-lg-1">Number of soil samples</dd>
                  <dt className="col-lg-3">
                    <Input value={ this.state.propModalStuff.soilnums } onChange={(e) => {
                      let propModalStuff = {...this.state.propModalStuff};
                      propModalStuff.soilnums = e.target.value
                      this.setState({propModalStuff})
                    }}/>
                  </dt>

                  <dd className="col-lg-1">Do children live in the home</dd>
                  <dt className="col-lg-3">
                    <Input value={ this.state.propModalStuff.children } onChange={(e) => {
                      let propModalStuff = {...this.state.propModalStuff};
                      propModalStuff.children = e.target.value
                      this.setState({propModalStuff})
                    }}/>
                  </dt>
                </dl>

                </form>
                <Button onClick={this.savePropModal}>Save</Button>
                {
                  //<Button style={{backgroundColor:"#e29898", margin: "20px" }} danger onClick={this.deleteItemModal}>Delete</Button>
                }

              </Modal>
              :
              ''
            }

            { this.state.sampleModalStuff ?
              <Modal
                isOpen={this.state.sampleModalIsOpen}
                onAfterOpen={this.afterOpenSampleModal}
                onRequestClose={this.closeSampleModal}
                style={customStyles}
                contentLabel="Example Modal"
              >
              <h2 ref={subtitle => this.subtitle = subtitle}>Edit</h2>
              <form>

              <dl className="row">
              <dd className="col-lg-3">Reading</dd>
              <dt className="col-lg-6">
                <Input value={ this.state.sampleModalStuff.R } onChange={(e) => {
                  let sampleModalStuff = {...this.state.sampleModalStuff};
                  sampleModalStuff.R = e.target.value
                  this.setState({sampleModalStuff})
                }}/>
              </dt>
              </dl>
            </form>
              <Button onClick={this.saveSampleModal}>Save Sample</Button>
              </Modal>
              :
              ''
            }


        </Row>
              {
                this.state.samples ?
                <Samples editSample={this.openSampleModal} data={this.state.samples}/>
              :
              ''
              }

              {this.state.rows ?
                <div>
                <Summary name={'SUMMARY OF INTERIOR'} data={this.formatIntData(this.state.rows)}/>
                <Summary name={'SUMMARY OF EXTERIOR'} data={this.formatExtData(this.state.rows)}/>
                <Summary name={'SUMMARY OF CALIBRATION'} data={this.formatCommonData(this.state.rows)}/>
                </div>
                :
                ''
              }

              {this.state.data ?
                <div className="card">
                  <div className="card-header">
                  Property Details
                  <div className="card-header-actions">
                    {
                         <Button onClick={()=>{this.openPropModal(this.state.property_detail)}}>Edit</Button>
                    }
                  </div>
                  </div>
                  <div className="card-body">
                    <div className="bd-example">
                      <dl className="row">
                        <dd className="col-sm-3">Type of dwelling</dd>
                        <dt className="col-sm-9">{this.state.property_detail? this.state.property_detail.dwelling : ''}</dt>
                        <dd className="col-sm-3">Year built</dd>
                        <dt className="col-sm-9">{this.state.property_detail? this.state.property_detail.year : ''}</dt>
                        <dd className="col-sm-3">Built on/over</dd>
                        <dt className="col-sm-9">{this.state.property_detail? this.state.property_detail.builtover : ''}</dt>
                        <dd className="col-sm-3">Exterior</dd>
                        <dt className="col-sm-9">
                          {this.state.property_detail? this.state.property_detail.brick? "Brick ": '' : ''}
                          {this.state.property_detail? this.state.property_detail.wood? "Wood ": '' : ''}
                          {this.state.property_detail? this.state.property_detail.stucco? "Stucco ": '' : ''}
                          {this.state.property_detail? this.state.property_detail.transas? "Transite-Asbestos ": '' : ''}
                          {this.state.property_detail? this.state.property_detail.woodshing? "Wood-Shingles ": '' : ''}
                          {this.state.property_detail? this.state.property_detail.other? "Other ": '' : ''}
                        </dt>
                        <dd className="col-sm-3">COD payment type</dd>
                        <dt className="col-sm-9">{this.state.property_detail? this.state.property_detail.payment : ''}</dt>
                        <dd className="col-sm-3">Number of units</dd>
                        <dt className="col-sm-9">{this.state.property_detail? this.state.property_detail.units : ''}</dt>
                        <dd className="col-sm-3">Number of buildings</dd>
                        <dt className="col-sm-9">{this.state.property_detail? this.state.property_detail.buildings : ''}</dt>
                        <dd className="col-sm-3">Number of stories</dd>
                        <dt className="col-sm-9">{this.state.property_detail? this.state.property_detail.stories : ''}</dt>
                        <dd className="col-sm-3">Number of laundry facilities</dd>
                        <dt className="col-sm-9">{this.state.property_detail? this.state.property_detail.laundry : ''}</dt>
                        <dd className="col-sm-3">Types of windows</dd>
                        <dt className="col-sm-9">
                          {this.state.property_detail? this.state.property_detail.framed? "Aluminum Framed ": '' : ''}
                          {this.state.property_detail? this.state.property_detail.casement? "Casement ": '' : ''}
                          {this.state.property_detail? this.state.property_detail.dblhung? "Double Hung Sash ": '' : ''}
                          {this.state.property_detail? this.state.property_detail.fixed? "Fixed ": '' : ''}
                          {this.state.property_detail? this.state.property_detail.horz? "Horizontal Sliding ": '' : ''}
                          {this.state.property_detail? this.state.property_detail.louvered? "Louvered ": '' : ''}
                          {this.state.property_detail? this.state.property_detail.transom? "Transom ": '' : ''}
                          {this.state.property_detail? this.state.property_detail.vinyl? "Vinyl ": '' : ''}
                          {this.state.property_detail? this.state.property_detail.bay? "Bay Window ": '' : ''}
                          {this.state.property_detail? this.state.property_detail.garden? "Garden Window ": '' : ''}
                        </dt>
                        <dd className="col-sm-3">Number of garages</dd>
                        <dt className="col-sm-9">{this.state.property_detail? this.state.property_detail.garages : ''}</dt>
                        <dd className="col-sm-3">Garage</dd>
                        <dt className="col-sm-9">{this.state.property_detail? this.state.property_detail.garage : ''}</dt>
                        <dd className="col-sm-3">Units accessed via</dd>
                        <dt className="col-sm-9">{this.state.property_detail? this.state.property_detail.exterior : ''}</dt>
                        <dd className="col-sm-3">Areas not accessable</dd>
                        <dt className="col-sm-9">{this.state.property_detail? this.state.property_detail.noaccess : ''}</dt>
                        <dd className="col-sm-3">Number of stories in building</dd>
                        <dt className="col-sm-9">{this.state.property_detail? this.state.property_detail.buildingstories : ''}</dt>
                        <dd className="col-sm-3">Numberof stories in unit</dd>
                        <dt className="col-sm-9">{this.state.property_detail? this.state.property_detail.unitstories : ''}</dt>
                        <dd className="col-sm-3">Number of beds</dd>
                        <dt className="col-sm-9">{this.state.property_detail? this.state.property_detail.bednums : ''}</dt>
                        <dd className="col-sm-3">Number of baths</dd>
                        <dt className="col-sm-9">{this.state.property_detail? this.state.property_detail.bathnums : ''}</dt>
                        <dd className="col-sm-3">Number of dust samples</dd>
                        <dt className="col-sm-9">{this.state.property_detail? this.state.property_detail.dustnums : ''}</dt>
                        <dd className="col-sm-3">Number of soil samples</dd>
                        <dt className="col-sm-9">{this.state.property_detail? this.state.property_detail.soilnums : ''}</dt>
                        <dd className="col-sm-3">Do children live in the home</dd>
                        <dt className="col-sm-9">{this.state.property_detail? this.state.property_detail.children : ''}</dt>
                        <br></br>
                        <br></br>
                        <br></br>
                      </dl>
                      <dl>
                      </dl>
                    </div>
                  </div>
                </div>
                :
                ''
              }

      </div>



    );
  }
}

export default withRouter(Job);
