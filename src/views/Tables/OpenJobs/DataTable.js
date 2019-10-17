import React, {Component} from 'react';
import {Card, Button,  CardHeader, CardBody} from 'reactstrap';
import { Link } from 'react-router-dom';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import 'react-bootstrap-table/dist//react-bootstrap-table-all.min.css';
import data from './_data';
import { createBrowserHistory } from 'history';
import { Route , withRouter} from 'react-router-dom';
import { Document, Packer, Paragraph, TextRun, Media, File, StyleLevel, TableOfContents } from "docx";
import FileBase64 from 'react-file-base64';

import htmlDocx from 'html-docx-js/dist/html-docx';
import { saveAs } from 'file-saver';
import juice from 'juice';
import domtoimage from 'dom-to-image';
import jsPDF from "jspdf";

const fetch64 = require('fetch-base64');
const axios = require('axios')
const history = createBrowserHistory();

const portraitPageSize = 13;



class DataTable extends Component {
  constructor(props) {
    super(props);
    //console.log(props)
    this.table = data.rows;
    this.doneButton = this.doneButton.bind(this)
    this.markDone = this.markDone.bind(this)
    this.sendBack = this.sendBack.bind(this)
    this.backButton = this.backButton.bind(this)
    this.getOpenJobs = this.getOpenJobs.bind(this)
    this.getReport = this.getReport.bind(this)
    this.goButton = this.goButton.bind(this)
    this.state = {
      data:'',
      samples:'',
      isPrintPreview: false,
      heightArr: [],
      pdfTitle: ''
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

  updateDimensions = () =>{
    var all = document.getElementsByClassName('pages');
    for (var i = 0; i < all.length; i++) {
      let strWidth = all[i].offsetWidth + 80;
      all[i].style.height = (strWidth / 595 * 842) + "px";
    }
  }

  componentDidMount() {
    // window.addEventListener("resize", this.updateDimensions);
  }

  componentWillUnmount() {
    // window.removeEventListener("resize", this.updateDimensions);
  }

  sendBack(id){
     axios.get(`/api/jobs/sendBack/${id}`).then( res => {
       console.log('send back')
       this.props.history.push('/dashboard/');
       this.props.history.push('/inspected/');
     })
  }

  markDone(id){
     axios.get(`/api/jobs/markDone/${id}`).then( res => {
       console.log('done')
       this.props.history.push('/dashboard/');
       this.props.history.push('/inspected/');
     })
  }

  getOpenJobs(){
    axios.get('/api/jobs/open').then( res => {
      this.setState({data:res.data})
    })
  }

async getReport(row){
  console.log('report', row);
  if(row.type == 0)
  {
    alert('Type == 0');
    return;
  }
  let pic = await axios({
    url: '/api/jobs/pic',
    method: 'get',
  }).then(img => {console.log(typeof img.data); this.setState({propimg:img.data})})

// fetch64.local('/house.jpg').then((data) => {
//   console.log(data[1]); this.setState({propimg:data[1]})
// }).catch((reason) => {console.log(reason)});
//
//     // fetch64.remote('https://amp.thisisinsider.com/images/59d523ba2ff63064008b4ab5-750-500.jpg')
//     //   .then((data) => {console.log(data[1]); this.setState({propimg:data[1]})})
//     //   .catch((reason) => {console.log(reason)});

  let rest = await axios({
    url: '/api/jobs/pdf',
    method: 'get',
  }).then((response) => {
 const url = window.URL.createObjectURL(new Blob([response.data]));
 const link = document.createElement('a');
 // link.href = url;
 // link.setAttribute('download', row.name+'-rest.docx'); //or any other extension
 // document.body.appendChild(link);
 // link.click();
});
  let res = await axios({
    url: '/api/inspections/get',
    method: 'post',
    data: {
      id: row.id
    }
  })
  let states = res.data.map( i => {
    return JSON.parse(i.state)
  })

  let res2 = await axios({
    url: '/api/clients/get',
    method: 'post',
    data: {
      id: row.clientId
    }
  })

  let res3 = await axios({
    url: '/api/jobs/inspector',
    method: 'post',
    data: {
      id: row.inspector
    }
  })
  this.setState({client:res2.data[0]})
  this.setState({inspector:res3.data[0]})
  this.setState({data:states})
  let rows = [];
  let soil = [];
  let dust = [];

  //prop details
// acess: "Courtyard"
// bathnums: "2"
// bednums: "2"
// brick: true
// buildings: "1"
// buildingstories: "1"
// builtover: "hillside"
// children: "No"
// done: true
// dustnums: "123"
// dwelling: "Single Family Home"
// framed: true
// garage: "None"
// garages: "1"
// garden: true
// id: 1
// laundry: "1"
// paint: "Good"
// payment: "Cash"
// serial: "Serialnumber123"
// soilnums: "123"
// stories: "1"
// stucco: true
// tested: "1"
// title: "Property Description Checklist"
// type: "property details"
// units: "1"
// unitstories: "1"
// year: "1989"
  //console.log(states)
    states.map(x => {
        x.data.map(d => {
          if(d && d.title == 'Property Description Checklist'){
            console.log('checklist', d);
            this.setState({details: d})
          }
        })
      })
      console.log('details', this.state.details);
  ///inspection samples
  states.map(x => {
    x.insSheets.map(s => {
      console.log('sheet', s)
      let room = s.name
      let loc = s.type
      s.data.map(d => {
        let side = d.side
        let item = d.title
        let unit = ''
        let extside = ''
        let extdir = ''
        let comments = d.comments
//        console.log('item', d)
        if(d.title == 'Sheet Details'){
          unit = d.unit
        }
        if(d.title == 'Exterior Sheet Details'){
          extside = d.side
          extdir = d.direction
        }
        if (d.title !='Exterior Sheet Details' && d.title !='Soil Sample Details' && d.title !='Dust Sample Details' && d.type !='sample'){
          Object.keys(d).map( obj => {
            if (obj != 'id' && obj != 'loc' && obj != 'doorType' && obj != 'comments' && obj != 'side' &&  obj != 'type' && obj != 'expanded' && obj != 'done'
            && obj != 'title' && obj != 'leadsTo' && obj != 'windowType' && obj != 'unit'){
              let material = d[obj].M
              let condition = d[obj].I? 'Intact':'Deteriorated'
              let reading = d[obj].R
              let name = d[obj].name
              //console.log(item, material, condition, reading, side, room)
              if(reading && reading != '0.'){
                rows.push({item, material, condition, reading, side, room, name, loc, unit, extside, extdir, comments})
              }
            }
          })
        }
        if(d.type =='sample' ){
          soil.push(d)
        }
      })
    })
  })
  console.log('rows', rows);
  this.setState({samples:rows})

  this.css = `
      * {
        font-family: Times New Roman ;
      }
      h1, h2, h3 {
        font-family: Times New Roman ;
      }

      h2{
        font-size: 18pt;
      }

      .heading {
        text-align:center;
      }

      .header {
        text-align:left;
        font-size: 12pt;
        font-weight: bold;
        line-height: normal;
        padding-top:15px;
        padding-bottom:20px;
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
      .footer p {
        letter-spacing: 1px;
        font-weight: bold;
        font-size: 9pt;
        margin-bottom: 0px;
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

      .side-border td {
        border-right: 1px solid black;
      }

      .side-border td:last-child {
        border-right: none;
      }

      table.no-border, table.no-border td {
        border: none;
      }

      table.grid {
        border: 1px solid black;
        border-collapse:collapse;
      }

      .italic {
        font-style: italic;
      }

      .text-underline {
        text-decoration: underline;
      }

      .select-box label {
        font-size: 10px;
      }

      div {
        margin-top:0px;
        margin-bottom:0px;
        padding-top:0px;
        padding-bottom:0px;
        font-size: 12pt;
      }

      span {
        display: block;
      }

      .nopadding {
        padding: 0px;
      }

      .nomargin {
        margin: 0px;
      }
      p, li {
        text-align: left;
        line-height: normal;
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
        border-bottom: none;
      }

      .table-responsive table tbody tr.blank, .table-responsive table tbody tr.blank td{
        border-bottom: none;
        border: none;
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

      .pages{
        width: 100%;
        min-height: 792pt;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        border-bottom-style:solid;
      }

      h1{
        font-size: 22pt;
      }
      .big-font{
        text-align: left;
        line-height: 200%;
      }
      .text-10{
        font-size: 10pt;
      }
      .top-margin{
        margin: 1rem 0px 0px 0px;
      }
      .padding-left-20{
        padding-left: 20px;
      }
      .yellow{
        color: #ffc000;
      }
      .content-wrapper{
        width: 100%;
        display: flex;
        justify-content: space-between;
        padding-right: 20px;
        align-items: center;
      }
      .content-title{
        white-space: nowrap;
        width: 99%;
        overflow: hidden;
      }
      .content-wrapper-padding{
        padding: 5px 20px 5px 0px;
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

    let property_picture;
    // src={"https://barrandclark.s3-us-west-1.amazonaws.com/uploads/"+row.id+".png"}
    await this.getBase64("https://barrandclark.s3-us-west-1.amazonaws.com/uploads/"+row.id+".png").then((data)=>{
      if(data!==400)
        property_picture = '<img width=160 height=100 style = "margin-bottom: 30px;" src="' + data + '"/>';
      else
        property_picture = `<div style = "height: 100px;"></div>`
    });

    let bc3_image;
    await this.getBase64('/assets/img/BC3.png').then((data)=>{
      bc3_image = '<img width=125 height=125 src="' + data + '"/>';
    });

    let bc3_small_image;
    await this.getBase64('/assets/img/BC3.png').then((data)=>{
      bc3_small_image = '<img width=50 height=50 src="' + data + '"/>';
    });
//    content = this.get8552Content(row, image1, image2, image3);
    var today = new Date().toISOString().slice(0, 10);

    /***********************           page 1               ****************************/
    let typeInspection = (row.jobtype!=="null" && row.jobtype !== "undefined")?row.jobtype:"";
    let firstPageTitle = row.type === 2? "LEAD-BASED PAINT INSPECTION/RISK ASSESSMENT REPORT": `LIMITED LEAD-BASED PAINT<br>INSPECTION REPORT<br>${typeInspection}`;
    let page1 = `<div id="page1" class = "pages" style = "padding-top: 20px;"><div>
    <div class="header">
      <table class="no-border">
      <tr>
        <td style="text-align: right;" width="40%">
          ${bc3_image}
        </td>
        <td width="60%">
          <div class="center" style = "width: fit-content;">
          <h1 style="color:#003300; font-weight: bold; margin-bottom: 0px;">BARR & CLARK</h1>
          <p class="nomargin nopadding center" style = "line-height: normal;font-size:10pt;">Independent Environmental Testing</p>
          <p class="nomargin nopadding center" style = "line-height: normal;font-size:10pt;">Asbestos • Lead • Mold • Phase I</p>
          </div>
        </td>
      </tr>
      </table>
    </div>

    <div class="center" style = "margin-top: 15px;">
    <h1 style="font-style:italic; font-weight: bold;">${firstPageTitle}</h1>
    <p class="center" >OF</p>
    <p class="center nomargin nopadding italic">${this.state.client.phone1}</p>
    <p class="center nomargin nopadding">${row.name}</p>
    <p class="center nomargin nopadding">${row.address}</p>
    <p class="center nopadding">${this.state.client.city}, ${this.state.client.state}</p>

    <p class="center">PROJECT NO. ${row.id}</p>
    <p class="center">${today}</p>
    </div>

    <div class="center">${property_picture}</div>
    <div>
    Prepared For
    <p class="nomargin nopadding">${this.state.client.company}</p>
    <p class="nomargin nopadding">${this.state.client.street}, ${this.state.client.city}</p>
    <p class="nomargin nopadding" style="margin-bottom: 10px;"> ${this.state.client.city} , ${this.state.client.state} , ${this.state.client.postal}</p>
    </div>

    <table class="no-border">
    <tr>
      <td>
        Inspected & Prepared By:
      </td>
      <td width="100px;">
      </td>
      <td>
        Reviewed by
      </td>
    </tr>
    <tr>
      <td>
        ${image3}
        ${image2}
      </td>
      <td>
      </td>
      <td>
        ${image1}
      </td>
    </tr>
    <tr>
      <td style="border-top: 1px solid black; max-width: 100px;">
      <p class="nopadding nomargin" >${this.state.inspector.name}</p>
        <p class="nopadding nomargin">State of California Certified</p>
        <p class="nopadding nomargin">Lead Inspector / Risk Assessor</p>
      </td>
      <td>
      </td>
      <td style="border-top: 1px solid black; max-width: 100px;">
        <p class="nopadding nomargin" >Matt Crochet</p>
        <p class="nopadding nomargin">State of California Certified</p>
        <p class="nopadding nomargin">Lead Inspector / Risk Assessor</p>
      </td>
    </tr>
    </table></div>
    ` + this.getFooter(150) + `</div>`;

//    row.type = 1;

    if(row.type === 2)
    {

  /***********************           page 2               ****************************/


    let page2 = `<div id="page2" class = "pages"><div>` + this.getHeader(row, bc3_small_image, 2) + `

    <div class="center">
    <h2 style= "font-weight: bold; padding-top: 30px;">TABLE OF CONTENTS</h2>
    <div style = "text-transform: uppercase; width: 100%;">
      <div class="content-wrapper">
        <p style="text-decoration: underline;font-weight:bold;">DESCRIPTION</p>
        <div>
          <p style="text-decoration: underline;text-align:center;font-weight:bold;">PAGE NO</p>
        </div>
      </div>
      <div class="content-wrapper">
        <span class="big-font content-title">1.0 Executive Summary-----------------------------------------------------------------------------------------------------</span>
        <div style="padding-right: 25px;"><p class = "center nomargin">3</p></div>
      </div>
      <div class="content-wrapper">
        <span class="big-font content-title">2.0 Identified Lead Hazards & Summary of Results-----------------------------------------------------------------</span>
        <div style="padding-right: 25px;"><p class = "center nomargin">3</p></div>
      </div>
      <div class="content-wrapper">
        <span class="big-font content-title">3.0 Identifying Information & Purpose of Inspection-----------------------------------------------------------------</span>
        <div style="padding-right: 25px;"><p class = "center nomargin">5</p></div>
      </div>
      <div class="content-wrapper">
        <span class="big-font content-title">4.0 Ongoing Monitoring----------------------------------------------------------------------------------------------------</span>
        <div style="padding-right: 25px;"><p class = "center nomargin">6</p></div>
      </div>
      <div class="content-wrapper">
        <span class="big-font content-title">5.0 Disclosure Regulations and Title X Requirements----------------------------------------------------------------------------------------------------</span>
        <div style="padding-right: 25px;"><p class = "center nomargin">7</p></div>
      </div>
      <div class="content-wrapper">
        <span class="big-font content-title">6.0 Future Remodeling Precautions----------------------------------------------------------------------------------------------------</span>
        <div style="padding-right: 25px;"><p class = "center nomargin">7</p></div>
      </div>
      <div class="content-wrapper">
        <span class="big-font content-title">7.0 Conditions & Inspection Limitations----------------------------------------------------------------------------------------------------</span>
        <div style="padding-right: 25px;"><p class = "center nomargin">8</p></div>
      </div>
      <div class="content-wrapper">
        <span class="big-font content-title">8.0 Site Information----------------------------------------------------------------------------------------------------</span>
        <div style="padding-right: 25px;"><p class = "center nomargin">8</p></div>
      </div>
      <div class="content-wrapper">
        <span class="big-font content-title">9.0 Lead Hazard Control Options & Recommendations----------------------------------------------------------------------------------------------------</span>
        <div style="padding-right: 25px;"><p class = "center nomargin">9</p></div>
      </div>
      <div class="content-wrapper">
        <span class="big-font content-title">10.0 Testing Protocol----------------------------------------------------------------------------------------------------</span>
        <div style="padding-right: 25px;"><p class = "center nomargin">11</p></div>
      </div>
      <div class="content-wrapper">
        <span class="big-font content-title">11.0 Method of Testing----------------------------------------------------------------------------------------------------</span>
        <div style="padding-right: 25px;"><p class = "center nomargin">13</p></div>
      </div>
    </div>
    <table class="no-border" style="text-transform: uppercase;margin-top:20px;">
      <tr>
        <td width="30%">
          <p style="text-decoration: underline;">Appendicies</p>
        </td>
        <td width="70%">
        </td>
      </tr>
      <tr>
        <td width="30%" style = "vertical-align: top;">
          <span class="big-font">APPENDIX A </span>
        </td>
        <td width="70%">
          <p class="nomargin nopadding">SUMMARIES</p>
          <p class="nomargin nopadding">LEAD CONTAINING COMPONENTS LIST</p>
          <p class="nomargin nopadding">XRF FIELD DATA</p>
        </td>
      </tr>
      <tr>
        <td width="30%; vertical-align: top;">
          <span class="big-font">APPENDIX B </span>
        </td>
        <td width="70%">
          <p class="nomargin nopadding">FLOORPLAN/MAP(S)</p>
          <p class="nomargin nopadding">RESIDENT QUESTIONNAIRE</p>
          <p class="nomargin nopadding">BUILDING CONDITIONS SURVEY</p>
          <p class="nomargin nopadding">CDPH 8552</p>
          <p class="nomargin nopadding">INSPECTOR'S CERTIFICATES (CALIFORNIA CERTIFICATION & XRF TRAINING)</p>
          <p class="nomargin nopadding">INSURANCE CERTIFICATE</p>
        </td>
      </tr>
      <tr>
        <td width="30%; vertical-align: top;">
          <span class="big-font">APPENDIX C </span>
        </td>
        <td width="70%">
          <p class="nomargin nopadding">PERFORMANCE CHARACTERISTIC SHEET (PCS)</p>
          <p class="nomargin nopadding">LEAD SPEAK - A BRIEF GLOSSARY & KEY UNITS OF MEASUREMENT</p>
          <p class="nomargin nopadding">ADDITIONAL LEAD & LEAD SAFETY RESOURCE DATA</p>
        </td>
      </tr>
      <tr>
        <td width="30%; vertical-align: top;">
          <span class="big-font">APPENDIX D </span>
        </td>
        <td width="70%">
          <p class="nomargin nopadding">DUST WIPE & SOIL SAMPLE LABORATORY MANIFESTS AND RESULTS</p>
         </td>
      </tr>
    </table></div></div>
    ` + this.getFooter(100) + `</div>`;



/***********************           page 3              ****************************/


    let page3 = `<div id="page3" class = "pages"><div>` + this.getHeader(row, bc3_small_image, 3) + `

    <div style="text-transform: uppercase;">
    <h1 class="center italic bold" style="font-size:16pt;">LEAD-BASED PAINT INSPECTION/RISK ASSESSMENT REPORT</h1>
    <p class="center bold"> 1.0 Executive Summary</p>
    </div>
    <p class="left">
    This report presents the results of Barr and Clark Lead-Based Paint (LBP) Inspection/Risk
    Assessment of the ${row.name} located at ${row.address}, California (Subject Property). This Document is Prepared for the Sole use of
    ${this.state.client.company} and any regulatory agencies that are directly involved in this project. No other party should rely on the information
    contained herein without prior consent of ${this.state.client.company}
    </p>`

    let hottile = []
    let hot = []
    this.state.samples.map(s => {
      if(s.reading > row.actionLevel ){
        hot.push(s)
        if(s.material == 'Tile'){
        hottile.push(s)
        }
      }
    })

    if (hot.length){
      page3 += `<p class="left">
        As a result of the Lead Based Paint (LBP) Inspection/risk Assessment Conducted on ${row.inspectionDate},
        lead-based paint/lead hazards were present at the subject property on the date of this assessment.
        The analyitical results from this assessment, the scope of services, inspection, methodology, and results are presented below.
      </p>`;
    }
    else{
      page3 += `<p class="left">
        As a result of the Lead Based Paint (LBP) Inspection/risk Assessment Conducted on ${row.inspectionDate},
        lead-based paint/lead hazards were not present at the subject property on the date of this assessment.
        The analyitical results from this assessment, the scope of services, inspection, methodology, and results are presented below
      </p>`;
    }

    page3 += `<p class="center bold">2.0 IDENTIFIED LEAD HAZARDS & SUMMARY OF RESULTS </p>`;
    if (hot.length){
      page3 += `<p class="left">
          <font class="text-underline bold">Paint Sampling:</font> Throughout the subject property, several of the painted components
          indicated the presence of lead based paint (LBP) at or above the respective action level.
          The following summary lists the specific components that tested above the action level and their respective locations:
        </p>`;

      page3 += `<p class="text-underline italic bold left nomargin">Interior</p>`;
      page3 += '<ul>';
      hot.map( h => {
        if(h.loc == 'InsSheet')
          page3 += `<li class="left">${h.room} - ${h.material} ${h.item} ${h.name}</li>`;
      })

      page3 += '</ul>';
      if(hottile.length){

        page3 += `<p class="left">Some of the tiled surfaces in the `;

        hottile.map( h => page3 += `${h.room} `)

        page3 += `also tested positive for lead. These surfaces were not painted and the lead is most likely in the glazing or the matrix of the tile itself</p>`;
      }

      page3 += `<p class="text-underline italic bold left nomargin">Exterior</p>`;


      hot.map( h => {
        if(h.loc == 'ExtSheet')
          page3 += `<li class="left">${h.room} - ${h.material} ${h.item} ${h.name}</li>`;
      })

      page3 += `<p class="left italic">
      Sampling for this inspection/risk assessment was representative and any components that were not tested but similar to those components
       that tested positive for LBP should be considered and treated as lead laden.
       </p>`;

      page3 += `<p class="left">The field data and results for paint sampling may be found in Appendix A</p>`;

    }
    else {
      page3 += `<p class="left">
      <font class="text-underline italic bold">Paint Sampling:</font> Throughout the subject property, none of the tested painted surfaces indicated
      the presence of lead based paint (LBP) at or above the respective action level.</p>`;


      if(hottile.length){
        page3 += `<p class="left">However, Some of the tiled surfaces in the `;
        hottile.map( h => page3 += `${h.room} `)
        page3 += `tested positive for lead. These surfaces were not painted and the lead is most likely in the glazing or the matrix of the tile itself</p>`;
      }

      page3 += `<p class="left"><font class="italic bold">Sampling for this inspection/risk assessment was representative.</font> The field data and results for paint sampling may be found in <span class="italic bold">Appendix A.</span></p>`;

    }

    page3 += `<p class="left"><font class="text-underline bold">Dust / Soil Sampling:</font> `;

    if(soil.length) {
      page3 += `The tested items indicated a level of lead above the specified regulatory limit.
        A copy of the laboratory manifest and results may be found in <span class="italic bold">Appendix D.</span></p>`;

      page3 += `
        <table class="grid">
          <tr>
            <th>Sample #</th>
            <th>Type</th>
            <th>Location</th>
            <th>Test Results (ug/ft)</th>
          </tr>
      `;

      soil.map((s,i) => {
        page3 += `
            <tr><td>${s.title}</td>`;
            if(s.title.startsWith("SS")){
              page3 += `<td>Soil (composite)</td>`;
            }
            else{
              page3 += `<td>Dust Wipe</td>`;
            }

            page3 += `<td>${s.area}</td>
            <td></td></tr>
        `;
      })

      page3 += `</table>`;

    }
    else {
      page3 += `None of the tested items indicated a level of lead above the specified regulatory limit.
        A copy of the laboratory manifest and results may be found in <span class="italic bold">Appendix D.</span></p>`;



    }

    page3 += `</div>` + this.getFooter(100) + `</div>`;


/***********************           page 5               ****************************/

    let page5 = `<div id="page5" class = "pages"><div>` + this.getHeader(row, bc3_small_image, 4) + `
    <p class="left text-underline italic bold top-margin">Laboratory Information:</p>
    <p class="left nopadding nomargin">Laboratory: <font class="italic">LA Testing</font></p>
    <p class="left nopadding nomargin"><font class="italic">5431 Industrial Drive, Huntington Beach, CA 92649</font></p>
    <p class="left nopadding nomargin">Dust Wipe Analysis Protocol: <font class="italic">EPA 3050B/7000A</font></p>
    <p class="left nopadding nomargin">Dust Wipe Media: <font class="italic">Lead-Wipes ASTM E1792</font></p>
    <p class="left nopadding nomargin">Accreditation Program Number: <font class="italic">DOSH ELAP No. 1406</font></p>

    <p class="center bold" style = "margin-top:20px;">3.0 IDENTIFYING INFORMATION & PURPOSE OF INSPECTION/RISK ASSESSMENT</p>

    <p class="left">
    The purpose of this inspection/risk assessment is to identify and assess the presence of Lead Hazards and Lead-Based Paint (LBP)
      present at the subject property as well as to identify the presence of deteriorated LBP and LBP that may be disturbed during planned renovations.
    </p>

    <p class="left">
      On ${row.inspectionDate}, Barr And Clark paint inspection and risk assessment performed an inspection/risk assessment
      for lead-based paint at the subject property at ${row.address}.
      As part of the assessment, a visual survey of the property was conducted, dust wipe sampling was performed on a limited number of interior surfaces,
      and composite soil samples were collected. In addition, painted and varnished surfaces in every accessible "room equivalent" were sampled via x-ray fluorescence (XRF)
      for the presence of LBP. The intent was to ascertain the presence of lead-based paint above the federal action level.
      If LBP was found, the inspection would identify individual architectural components and their respective concentrations of lead in such a manner
      that this report would be used to characterize the presence of LBP at this property.
    </p>

    <p class="left">
     This inspection/risk assessment will help determine if the unit is eligible for <font class="italic bold">U.S. Department of Housing and Urban Development</font>
      (HUD)-funded renovation activities. The inspection/risk assessment is required for federally assisted renovation.
    </p>

    <p class="left">
      ${this.state.inspector.name} of BARR AND CLARK performed the inspection/risk assessment at the site using an RMD LPA-1 XRF spectrum analyzer instrument.
      He has attended the radiation safety course for handling the instrument,
      and completed an EPA approved curriculum in Lead in Construction Inspector / Risk Assessor Training.
    </p>

    <p class="left">
      At the time of this report, the California Department of Health Services, Childhood Lead Poisoning Branch,
      has implemented a State Certification Model Accreditation Plan adopted from the EPA. ${this.state.inspector.name} has received certification.
      Personnel certificate(s) have been provided in <font class="italic bold">Appendix B</font>.
    </p></div>
    `;


    page5 +=  this.getFooter(100) + `</div>`;



/***********************           page 6              ****************************/



    let page6 = `<div id="page6" class = "pages"><div>` + this.getHeader(row, bc3_small_image, 5) + `

    <p class="center bold">4.0 ONGOING MONITORING</p>

    <p class="left">
      Ongoing monitoring is necessary in all dwellings in which LBP is known or presumed to be present. At these dwellings, the very real potential exists for LBP hazards to develop. Hazards can develop by means such as, but not limited to: the failure of lead hazard control measures; previously intact LBP becoming deteriorated; dangerous levels of lead-in-dust (dust lead) re-accumulating through friction, impact, and deterioration of paint; or, through the introduction of contaminated exterior dust and soil into the interior of the structure. Ongoing monitoring typically includes two different activities: re-evaluation and annual visual assessments. A re-evaluation is a risk assessment that includes limited soil and dust sampling and a visual evaluation of paint films and any existing lead hazard controls. Re-evaluations are supplemented with visual assessments by the Client, which should be conducted at least once a year, when the Client or its management agent (if th housing is rented in the future) receives complaints from residents about deteriorated paint or other potential lead hazards, when the residence (or if, in the future, the house will have more than one dwelling unit, any unit that turns over or becomes vacant), or when significant damage occurs that could affect the integrity of hazard control treatments (e.g., flooding, vandalism, fire). The visual assessment should cover the dwelling unit (if, in the future, the housing will have more than one dwelling unit, each unit and each common area used by residents), exterior painted surfaces, and ground cover (if control of soil-lead hazards is required or recommended). Visual assessments should confirm that all Paint with known or suspected LBP is not deteriorating, that lead hazard control methods have not failed, and that structural problems do not threaten the integrity of any remaining known, presumed or suspected LBP.
    </p>

    <p class="left">The visual assessments do not replace the need for professional re-evaluations by a certified risk assessor. The re-evaluation should include:
    <ol>
      <li class="left">A review of prior reports to determine where lead-based paint and lead-based paint hazards have been found, what controls were done, and when these findings and controls happened;</li>
      <li class="left">A visual assessment to identify deteriorated paint, failures of previous hazard controls, visible dust and debris, and bare soil;</li>
      <li class="left">Environmental testing for lead in dust, newly deteriorated paint, and newly bare soil; and</li>
      <li class="left">A report describing the findings of the reevaluation, including the location of any lead-based paint hazards, the location of any failures of previous hazard controls, and, as needed, acceptable options for the control of hazards, the repair of previous controls, and modification of monitoring and maintenance practices.</li>
    </ol>
    </p>
    </div>

    `;


    page6 +=  this.getFooter(100) + `</div>`;



/***********************           page 7              ****************************/


    let page7 = `<div id="page7" class = "pages"><div>` + this.getHeader(row, bc3_small_image, 6) + `

    <p class="center bold">5.0 DISCLOSURE REGULATIONS & TITLE X REQUIREMENTS</p>`;

    if (hot.length){
      page7 += `<p class="left">
        A copy of this complete report must be provided to new lessees (tenants) and purchasers of this property under Federal law
        (Section 1018 of Title X - 24 CFR part 35 and 40 CFR part 745) before they become obligated under a lease or sales contract.
        The complete report must also be provided to new purchasers and it must be made available to new tenants.
        Landlords (lessors) and sellers are also required to distribute an educational pamphlet approved by the U.S.
        Environmental Protection Agency entitled  <font class="italic bold">Protect Your Family From Lead in Your Home"</font>
        and include standard warning language in their leases
        or sales contracts to ensure that parents have the information they need to protect their children from lead-based paint hazards.
        This report should be maintained and updated as a permanent maintenance record for this property.
      </p>`;
    }else{
      page7 += `<p class="left">
        The results of this inspection/risk assessment indicate that no lead in amounts greater than or equal to 1.0 mg/cm<sup>2</sup>
        in paint was found on any building components, using the inspection protocol in Chapter 7 of the
        <font class="italic">HUD Guidelines for the Evaluation and Control of Lead-Based Paint Hazards in Housing (2012 Revision)</font>.
        <font class="bold">Therefore, this dwelling qualifies for the exemption in 24 CFR part 35 and 40 CFR part 745 for target housing being leased that is
        free of lead-based paint, as defined in the rule.</font> <font class="italic">However, some painted surfaces may contain levels of lead below 1.0 mg/cm<sup>2</sup> ,
        which could create lead dust or lead-contaminated soil hazards if the paint is turned into dust by abrasion, scraping, or sanding.</font>
        This report should be maintained as a permanent maintenance record for this property.
      </p>`
    }

    page7 += `<p class="center bold">6.0 FUTURE REMODELING PRECAUTIONS</p>`;

    page7 += `<p class="left">
      It should be noted that during this Assessment, a number of areas were tested for the presence of LBP. All LBP, dust, and soil hazards that were identified are addressed in this report.
      Additional dust and/or soil sample collection and analysis should follow any hazard control activity, repair, remodeling, or renovation effort,
      and any other work efforts that may in any way disturb LBP and/or any lead containing materials.
      These Assessment activities will help the Client and owner to ensure the health and safety of the occupants and the neighborhood.
      Details concerning lead-safe work techniques and approved hazard control methods can be found in the HUD publication entitled:
      <font class="italic">"Guidelines for the Evaluation and Control of LBP Hazards in Housing"</font> (<font class="italic" style="color: blue">www.hud.gov/offices/lead</font>).
      Remodeling, repair, renovation and painting at the residence beyond the scale of minor repair and maintenance activities must be conducted in accordance
      with the EPA's Lead Repair, Renovation, and Painting Rule (within 40 CFR part 745); see the EPA's website on the RRP Rule at
      <font class="italic" style="color: #1b9bc1">http://www.epa.gov/lead/pubs/renovation.htm</font> for the scope and requirements of that Rule.
      Lead-based paint abatement or lead-based paint hazard abatement at the residence must be conducted in accordance with the EPA's Lead Abatement Rule (also within 40 CFR 745);
      see the EPA's website for Lead Abatement Professionals at <font class="italic" style="color: #1b9bc1">http://www.epa.gov/lead/pubs/traincert.htm</font>.
    </p>
    </div>
    `;

    page7 +=  this.getFooter(100) + `</div>`;


/***********************           page 8              ****************************/



    let page8 = `<div id="page8" class = "pages"><div>` + this.getHeader(row, bc3_small_image, 7) + `

    <p class="center bold">7.0 CONDITIONS & INSPECTION LIMITATIONS</p>`;


    page8 += `<p class="left">
      This inspection/risk assessment was planned, developed, and implemented based on BARR & CLARK's previous experience in performing lead-based paint
      inspections/risk assessments. This inspection was patterned after
      <font class="italic bold">Chapter 7 of the HUD Guidelines for the Evaluation and Control of Lead-Based Paint Hazards in Housing (2012 Revision).</font>
      BARR & CLARK utilized state-of-the-art-practices and techniques in accordance with regulatory standards while performing this inspection/risk assessment.
      BARR & CLARK's evaluation of the relative risk of exposure to lead identified during this inspection/risk assessment is based on conditions observed
      at the time of the inspection. BARR & CLARK cannot be responsible for changing conditions that may alter the relative exposure risk or for future changes
      in accepted methodology.
    </p>`


    page8 += `<p class="left">
      BARR & CLARK cannot guarantee and does not warrant that this inspection/risk assessment has identified all adverse environmental factors and/or conditions
      affecting the subject property on the date of the assessment. BARR & CLARK cannot and will not warrant that the inspection/risk assessment that was requested
      by the client will satisfy the dictates of, or provide a legal defense in connection with, any environmental laws or regulations. It is the responsibility of
      the client to know and abide by all applicable laws, regulations, and standards, including EPAs Renovation, Repair and Painting regulation.
    </p>
    `;

    page8 += `<p class="left">
      The results reported and conclusions reached by BARR & CLARK are solely for the benefit of the client.
      The results and opinions in this report, based solely upon the conditions found on the property as of the
      date of the assessment, will be valid only as of the date of the assessment. BARR & CLARK assumes no
      obligation to advise the client of any changes in any real or potential lead hazards at this residence that may or may not be later brought to our attention.
    </p>
    `;

    page8 += `<p class="center bold">8.0 SITE INFORMATION</p>`;

    if(this.state.details){
      let windows = [];
      if(this.state.details.framed){
        windows.push({name: 'framed '})
      }
      if(this.state.details.casement){
        windows.push({name:'casement'})
      }
      if(this.state.details.dblhung){
        windows.push({name: 'double hung sash'})
      }
      if(this.state.details.fixed){
        windows.push({name: 'fixed'})
      }
      if(this.state.details.horz){
        windows.push({name: 'horizontal sliding'})
      }
      if(this.state.details.louvered){
        windows.push({name: 'louvered'})
      }
      if(this.state.details.woodshing){
        windows.push({name: 'wood shingles'})
      }
      if(this.state.details.transom){
        windows.push({name: 'transom'})
      }
      if(this.state.details.vinyl){
        windows.push({name: 'vinyl'})
      }
      if(this.state.details.bay){
        windows.push({name: 'bay window'})
      }
      if(this.state.details.garden){
        windows.push({name: 'garden window'})
      }


      page8 += `<p class="left">
        The subject property is a ${this.state.details.dwelling} that was built circa  ${this.state.details.year}.
        It is a  ${this.state.details.stories}-story building that is constructed over a  ${this.state.details.builtover}.
        The exterior walls are covered with ${this.state.details.brick? 'brick, ': ''}  ${this.state.details.stucco? 'stucco, ': ''}  ${this.state.details.transas? 'transite-asbestos, ': ''} ${this.state.details.other? 'other materials ': ''}
      `;

      if (windows.length == 1){
        page8 += `and all of the windows are ${windows[0].name} types.`;
      }
      else{
        page8 += `the windows are a combination of `+windows.map(x => x.name+' ')+` types.`;
      }

      page8 += `The home consists of ${this.state.details.bednums} bedrooms, ${this.state.details.bathnums} bathrooms`;

      if(this.state.details.garage == 'Attached' || this.state.details.garage == 'Detached'){
        page8 += (this.state.details.garage == 'Attached' ?  `and an attached garage` : `and a detached garage`);
       }


      page8 += `. At the time of this inspection/risk assessment, most of the painted surfaces were in ${this.state.details.paint} condition</p>`;
    }


    page8 += `</div>` + this.getFooter(100) + `</div>`;



    /***********************           page 9              ****************************/



    let page9 = `<div id="page9" class = "pages"><div>` + this.getHeader(row, bc3_small_image, 8) + `

    <p class="center bold">9.0 LEAD HAZARD CONTROL OPTIONS & RECOMMENDATIONS</p>`;

    if (hot.length){
      page9 += `<p class="left">
          Lead-safe work practices and worker/occupant protection practices complying with current EPA, HUD and OSHA standards will be necessary to safely complete all work involving the disturbance of LBP coated surfaces and components.
          In addition, any work considered lead hazard control will enlist the use of interim control (temporary) methods and/or abatement (permanent) methods.
          It should be noted that all lead hazard control activities have the potential of creating additional hazards or hazards that were not present before.
        </p>`;
      page9 += `<p class="left">
          Details for the listed lead hazard control options and issues surrounding occupant/worker protection practices can be found in the publication entitled:
          <font class="italic">Guidelines for the Evaluation and Control of LBP Hazards in Housing</font> published by HUD,
          the Environmental Protection Agency (EPA) lead-based paint regulations, and the Occupational Safety and Health Administration (OSHA) regulations
          found in its Lead in Construction Industry Standard.
        </p>`;
      page9 += `<p class="left">
          Cost estimates should be obtained from a certified LBP abatement contractor or a contractor trained in lead-safe work practices.
          Properly trained and/or licensed persons, as well as properly licensed firms (as mandated) should accomplish all abatement/interim control activities conducted at this property.
        </p>`;

      page9 += `<p class="left">
        <font class="bold">Interim controls</font>, as defined by HUD, means a set of measures designed to temporarily reduce human
        exposure to LBP hazards and/or lead containing materials. These activities include, but are not limited to:
        component and/or substrate repairs; paint and varnish repairs; the removal of dust-lead hazards; maintenance; temporary containment; placement of seed,
        sod or other forms of vegetation over bare soil areas; the placement of at least 6 inches of an appropriate mulch material over an impervious material,
        laid on top of bare soil areas; the tilling of bare soil areas; extensive and specialized cleaning; and, ongoing LBP maintenance activities.
      </p>`;

      page9 += `<p class="left">
        <font class="bold">Abatement</font>, as defined by HUD, means any set of measures designed to permanently eliminate LBP and/
        or LBP hazards. The product manufacturer and/or contractor must warrant abatement methods to last a
        minimum of twenty (20) years, or these methods must have a design life of at least twenty (20) years. These activities include, but are not necessarily limited to:
        the removal of LBP from substrates and components; the replacement of components or fixtures with lead containing materials and/or lead containing paint;
        the permanent enclosure of LBP with construction materials; the encapsulation of LBP with approved products;
        the removal or permanent covering (concrete or asphalt) of soil-lead hazards; and, extensive and specialized cleaning activities.
        (EPA's definition is substantively the same.)
      </p>`;

      page9 += `<p class="left nomargin">The greatest potential for lead exposure from lead painted architectural components occurs when:</p>`;

      page9 += `<ul><li class="left">the paint has become defective; or</li>`;
      page9 += `<li class="left">when the paint is applied to a friction / impact component where the paint is continually disturbed; or</li>`;
      page9 += `<li class="left">when the paint is disturbed through routine maintenance or renovation activities.</li></ul>`;

      page9 += `<p class="left nomargin">With this in mind, the following are our recommendations for this property:</p>`;

      page9 += `<ul><li class="left">The results from this inspection should be provided to any individuals that may disturb the painted surfaces. It is encouraged to utilize certified professionals that have experience working with LBP if the work is performed by someone other than the homeowner.</li>`;
      page9 += `<li class="left">If renovation is scheduled in the near future (less than three months), all lead painted components that have been previously targeted for replacement should be replaced utilizing "lead safe" containment and work practices.</li>`;
      page9 += `<li class="left">ALL components that have been identified with defective lead paint should have the paint repaired as soon as possible. Any paint repair should be done utilizing "lead safe" containment, work practices, and clean-up techniques.</li>`;
      page9 += `<li class="left">All components with lead painted friction / impact surfaces should be treated to minimize the friction or impact as necessary.</li>`;
      page9 += `<li class="left">Lead painted components that <font class="bold">have not</font> been targeted for replacement should either be considered for abatement (replacement, enclosure, encapsulation, etc.) or included in an Operations & Management (O & M) Plan that will help to minimize exposures to lead hazards.</li>`;
      page9 += `<li class="left">All lead painted surfaces that are not expected to be impacted in the near future (less than three months) should also be included the O & M plan.</li>`;
      page9 += `<li class="left">In addition, the tenants or occupants of the dwelling should be notified of the test results and instructed in actions that they may perform to keep the living areas "lead safe."</li>`;

      if(hottile.length){
      page9 += `<li>The tile surfaces are not a likely source of lead dust contamination as long as they remain intact. If future renovation or repair activities require that the tile be removed, or the surfaces disturbed, it should be done in a manner that does not break the tiles. If this is not feasible, this task should be assigned to a lead certified contractor.</li>`;
      }
      page9 += `</ul>`;

     ///TODO if soil sample

    }
    else{
      page9 += `<p class="left">
        Since none of the tested painted surfaces indicated the presence of lead based paint (LBP) at or above the respective action level,
        <font class="italic bold">no further testing is required at this time.</font>
      </p>`;
    }

    page9 +=  `</div>` + this.getFooter(100) + `</div>`;



    /***********************           page 11              ****************************/



    let page11 = `<div id="page11" class = "pages"><div>` + this.getHeader(row, bc3_small_image, 9) + `

    <p class="center bold">10.0 TESTING PROTOCOL</p>`;


    page11 += `<p class="left">
        <font class="text-underline bold">XRF Testing:</font> Testing of the painted surfaces was patterned after the inspection protocol in Chapter 7 of
        the <font class="text-underline">HUD Guidelines for the Evaluation and Control of Lead-Based Paint Hazards in Housing<sup>1</sup>
        <font class="italic">(2012 Revision)</font></font>.
        In every "room equivalent" within the tested property, one representative surface of each "testing combination" was tested.
        Multiple readings were collected to resolve inconsistencies in the test results.
      </p>`;

    page11 += `<p class="left">
        <font class="text-underline bold">Regulatory Compliance:</font>  Several public (government) agencies have a published "regulatory action level"  to classify LBP.
        To further complicate matters, some of the established "levels" are quantified in different units of measurement.
        Listed below are the current regulatory agencies that have defined LBP, along with the respective action level:
      </p>`;

    page11 += `
    <table class="no-border">
      <tr>
        <td class="text-underline">Agency</td>
        <td class="text-underline">Ordinance #</td>
        <td class="text-underline">Action level (mg / cm<sup>2</sup>)</td>
        <td class="text-underline">Action level (ppm<sup>2</sup> )</td>
      </tr>
    `;

    if(row.actionLevel == '0.7'){
      page11 += `
      <tr class="nomargin nopadding text-10">
        <td>San Diego Lead Ordinance </td>
        <td>Section 54.1005-1015  </td>
        <td>0.5 mg / cm<sup>2</sup></td>
        <td>1000 ppm<sup>3</sup></td>
      </tr>`;

      page11 += `
      <tr class="nomargin nopadding text-10">
        <td>L.A. County</td>
        <td>Title 11, 11.28.010</td>
        <td>0.7 mg / cm<sup>2</sup></td>
        <td>600 ppm<sup>4</sup></td>
      </tr>`;

      page11 += `
      <tr class="nomargin nopadding text-10">
        <td class="bold">HUD / EPA</td>
        <td>24 CFR 35.86 & 40 CFR 745.103</td>
        <td>1.0 mg / cm<sup>2</sup></td>
        <td>5,000 ppm</td>
      </tr>`;

      page11 += `
      <tr class="nomargin nopadding text-10">
        <td class="bold">OSHA / CAL OSHA</td>
        <td>29 CFR 1926.62 & Title 8, 1532.1</td>
        <td class="italic">Not Specified</td>
        <td>600 ppm<sup>5</sup></td>
      </tr>`;
    }
    page11 += `</table>`;

    page11 += `<div style="border: 1px solid black; font-size: 10pt; line-height:normal; padding:5px; margin-top:5px;">`;
    page11 += `<p class="left text-underline" style="margin-bottom: 10px;">HUD / EPA have recently issued the following guidance regarding units of measurement for paint samples:</p>`;
    page11 += `<p class="left nomargin">
    "Report lead paint amounts in mg/cm<sup>2</sup> because this unit of measurement does not depend on the number of layers of non-lead-based paint and
    can usually be obtained without damaging the painted surface. All measurements of lead in paint should be in mg/cm<sup>2</sup>,
    unless the surface area cannot be measured or if all paint cannot be removed from the measured surface area.
    In such cases, concentrations may be reported in weight percent (%) or parts per million by weight (ppm)."<sup>6</sup>
        </p>`;

    page11 += `<p class="left text-underline nomargin" style="margin-bottom: 10px;margin-top: 10px;">Furthermore, EPA has previously issued guidance on lead content classification as follows:</p>`;
    page11 += `<p class="left nomargin">
    "... The rule, at 24 CFR 35.86 and 40 CFR 745.103 states that a lead-based paint free finding must demonstrate that the building is free of
    'paint or other surface coatings that contain lead in excess of 1.0 milligrams per square centimeter (1.0 mg / cm<sup>2</sup>) or 0.5 percent by weight (5000 ppm).'
    <u>The State standards are not applicable, whether more or less stringent, since a State cannot amend Federal requirements."<sup>7</sup>
        </u></p>`;
    page11 += `</div>`;


    page11 += `
    <hr class="left" style="height:1px; width: 230px;"/>
    <div style="font-size: 8pt;">
      <p class="nopadding nomargin" style="line-height:150%;">1. &nbsp; &nbsp; &nbsp; &nbsp; 2012 Revision</p>
      <p class="nopadding nomargin" style="line-height:150%;">2. &nbsp; &nbsp; &nbsp; &nbsp; Parts per million</p>
      <p class="nopadding nomargin" style="line-height:150%;">3. &nbsp; &nbsp; &nbsp; &nbsp; pplies to sale and application of LBP.</p>
      <p class="nopadding nomargin" style="line-height:150%;">4. &nbsp; &nbsp; &nbsp; &nbsp; Applies to sale and application of LBP.</p>
      <p class="nopadding nomargin" style="line-height:150%;">5. &nbsp; &nbsp; &nbsp; &nbsp; Applies to construction related activities</p>
      <p class="nopadding nomargin" style="line-height:150%;">6. &nbsp; &nbsp; &nbsp; &nbsp; Chapter 7 of the HUD Guidelines for the Evaluation and Control of Lead-Based Paint Hazards in Housing (2012 Revision).</p>
      <p class="nopadding nomargin" style="line-height:150%;">7. &nbsp; &nbsp; &nbsp; &nbsp; Office of Pollution Prevention and Toxics, (August 20, 1996)</p>
    </div></div>
    `;

    page11 +=  this.getFooter(60) + `</div>`;


    /***********************           page 12              ****************************/



    let page12 = `<div id="page12" class = "pages"><div>` + this.getHeader(row, bc3_small_image, 10);

    if(row.actionLevel == '0.5'){
      page12 += `<p class="left">In recognition of the various action levels the testing results are classified as follows for this report:</p>`;

      page12 += `<ul>`;
      page12 += `<li class="left">Painted surfaces with readings at or above 0.5 mg / cm<sup>2</sup> are considered 	-	Positive</li>`;
      page12 += `<li class="left">Painted surfaces with readings at or below 0.4 mg / cm<sup>2</sup> are considered	-	Negative</li>
      </ul>`;

    }

    if(row.actionLevel == '0.7'){
      page12 += `<p class="left">In recognition of the various action levels the testing results are classified as follows for this report:</p>`;

      page12 += `<ul>`;
      page12 += `<li class="left">Painted surfaces with readings at or above 0.7 mg / cm<sup>2</sup> are considered 	-	Positive</li>`;
      page12 += `<li class="left">Painted surfaces with readings at or below 0.6 mg / cm<sup>2</sup> are considered	-	Negative</li>
      </ul>`;
    }

    if(row.actionLevel == '1.0'){
      page12 += `<p class="left">In recognition of the various action levels the testing results are classified as follows for this report:</p>`;

      page12 += `<ul>`;
      page12 += `<li class="left">Painted surfaces with readings at or above 1.0 mg / cm<sup>2</sup> are considered 	-	Positive</li>`;
      page12 += `<li class="left">Painted surfaces with readings at or below 0.9 mg / cm<sup>2</sup> are considered	-	Negative</li>
      </ul>`;
    }

    page12 += `<p class="left italic bold">
        The individual readings have been provided on all field data sheets. Any future change in action levels by one of the regulating agencies may affect the classification of results.
      </p>`;

    page12 += `<p class="left">
        <font class="text-underline bold">Dust Wipe Sampling:</font> The California Department of Public Health/HUD action level for lead dust
        is 10&#181;g/ft<sup>2</sup> for floors, 100&#181;g / ft<sup>2</sup> for window sills, 100&#181;g / ft<sup>2</sup> for window troughs/wells,
        and 40&#181;g / ft<sup>2</sup> for exterior porches -  <font class="italic bold">see note*.</font>
      </p>`;

    page12 += `<p class="left">
        <font class="text-underline bold">Soil Sampling:</font> The California Department of Public Health /HUD action level for lead in soil is 400 parts per million (ppm)
        for bare soil and 1000 ppm for soil covered with vegetation (ground cover, grass, etc.).
      </p>`;

    page12 += `<p class="left">
        <font class="italic bold">*NOTE:</font> Per the U.S. Department of Housing and Urban Development <font class="italic">(HUD)</font> Guidelines for the Evaluation and Control of Lead-Based Paint Hazards (Office of Healthy Homes and Lead Hazard
        <font class="italic">Office of Pollution Prevention and Toxics, (August 20, 1996)</font>
        <font class="italic">Control Second Edition, July 2012)</font>,
        if Federal standards differ from State, Tribal or local standards, <font class="italic text-underline bold">the most stringent (protective) standards must be applied.</font>
      </p>`;

    page12 += `<p class="left">
        The U.S. Department of Housing and Urban Development <font class="italic">(HUD)</font> has revised the Dust-Lead Action Levels for Risk Assessment and Clearance;
        Clearance of Porch Floors <font class="italic bold">(Policy Guidance Number: 2017-01 Date: January 31, 2017).</font>
        Effective April 1, 2017, the following lead dust hazard and clearance action levels <font class="italic">(or lower levels if required by their state regulations)</font> should be followed:
      </p>`;

    page12 += `<p class="left">
        <font class="text-underline">New Lead Dust Hazard Action Levels:</font> <font class="bold">Floors: &#8805; 10 &#181;g/ft<sup>2</sup> and Window Sills: &#8805; 100 &#181;g/ft<sup>2</sup>, </font>
      </p>`;

    page12 += `<p class="left">
        <font class="text-underline">New Lead Clearance Action Levels:</font> <font class="bold">Interior Floors: < 10 &#181;g/ft<sup>2</sup>; Porch Floors: < 40 &#181;g/ft<sup>2</sup>, Window Sills: < 100 &#181;g/ft<sup>2</sup>, and Window Troughs: < 100 &#181;g/ft<sup>2</sup> </font>
      </p></div>`;
    page12 +=  this.getFooter(100) + `</div>`;


    /***********************           page 13              ****************************/



    let page13 = `<div id="page13" class = "pages"><div>` + this.getHeader(row, bc3_small_image, 11) + `
    <p class="center bold">11.0 METHOD OF TESTING</p>`;
    page13 += `<p class="left"><font class="text-underline bold">Paint Testing:</font> The method employed was X-ray fluorescence (XRF) using a Radiation Monitoring Device Lead Paint Analyzer (RMD LPA-1). The instrument was operated in "Quick Mode," where the duration for each test result is determined by a combination of:
      </p>`;

    page13 += `
      <ul>
      <li>the actual reading relative to the designated action level;</li>
      <li>the age of the radioactive source; and</li>
      <li>*	the substrate on which the test was taken.</li>
      </ul>
      `;

    page13 += `<p class="left">The instrument's calibration was verified according to the manufacturer's specifications in compliance with the Performance Characteristic Sheet (PCS) developed for this instrument. A copy of the PCS for this instrument may be found in <font class="italic bold">Appendix C.</font>
      </p>`;

    page13 += `<p class="left">The readings from this instrument produce a 95% confidence level that the "lead" reading accurately reflects the actual level of lead in the tested surfaces, relative to the federal action level.
      </p>`;

    page13 += `<p class="left"><font class="text-underline bold">Laboratory Sample Analysis:</font> Soil and dust samples were collected from this property and analyzed for lead content by an independent environmental laboratory which is accredited by the American Industrial Association (AIHA), the National Institute for Standards and Technology (NVLAP) and the California Department of Health Services (ELAP). The samples were analyzed as follows:
      </p>`;

    page13 += `
      <ul>
      <li><font class="text-underline">Dust Wipe Sampling</font> - The method of analysis was <font class="text-underline">Flame Atomic Absorption Spectroscopy</font> (EPA 3050B/7000A, Flame AA) performed on samples collected from measured areas.</li>
      <li><font class="text-underline">Soil Sampling</font> - The method of analysis was <font class="text-underline">Flame Atomic Absorption Spectroscopy</font> (EPA 3050B/7000A, Flame AA) performed on samples collected from the top &#189; of bare soil areas (drip line, etc.). </li>
      </ul></div>
      `;
    page13 +=  this.getFooter(100) + `</div>`;


    content += page1 + page2 + page3 + page5 + page6 + page7 + page8 + page9 + page11 + page12 + page13;

    content += `<div id="page14" class = "pages"><div>
    <div style="margin-bottom: 100px;">&nbsp;</div>
    <p class="center bold" style="font-size:72pt;">APPENDIX</p>
    <p class="center bold" style="font-size:72pt;">A</p>
    <p class="center bold italic">XRF FIELD DATA</p>
    <br clear="all" style="page-break-before:always" ></br></div></div>
    `;

    // content += this.getSummary(row);


    content += `<div id="page15" class = "pages"><div>
    <div style="margin-bottom: 200px;">&nbsp;</div>
    <p class="center bold" style="font-size:72pt;">APPENDIX</p>
    <p class="center bold" style="font-size:72pt;">B</p>
    <p class="center bold italic nomargin">FLOORPLAN/MAPS</p>
    <p class="center bold italic nomargin">RESIDENT QUESTIONNAIRE</p>
    <p class="center bold italic nomargin">BUILDING CONDITIONS SURVEY</p>
    <p class="center bold italic nomargin">CDPH 8552</p>
    <p class="center bold italic nomargin">INSPECTOR'S CERTIFICATES</p>
    <p class="center bold italic nomargin">INSURANCE CERTIFICATE</p>
    <br clear="all" style="page-break-before:always" ></br>    <br clear="all" style="page-break-before:always" ></br></div></div>

    `;

    let b1, b2, b3, b4;

    await this.getBase64('/assets/img/attachments/b1.jpg').then((data)=>{
      b1 = '<img width=750 height=850 src="' + data + '"/>';
    });

    await this.getBase64('/assets/img/attachments/b2.jpg').then((data)=>{
      b2 = '<img width=750 height=850 src="' + data + '"/>';
    });

    await this.getBase64('/assets/img/attachments/b3.jpg').then((data)=>{
      b3 = '<img width=750 height=850 src="' + data + '"/>';
    });

    await this.getBase64('/assets/img/attachments/b4.jpg').then((data)=>{
      b4 = '<img width=750 height=850 src="' + data + '"/>';
    });

    content += this.putImage(b1, "page16");
    content += this.putImage(b2, "page17");
    content += this.putImage(b3, "page18");
    content += this.putImage(b4, "page19");

    content += `<div id = "page20" class = "pages"><div>
    <div style="margin-bottom: 200px;">&nbsp;</div>
    <p class="center bold" style="font-size:72pt;">APPENDIX</p>
    <p class="center bold" style="font-size:72pt;">C</p>
    <p class="center bold italic nomargin">PERFORMANCE CHARACTERISTIC SHEET (PCS)</p>
    <p class="center bold italic nomargin">LEAD SPEAK – A BRIEF GLOSSARY & KEY UNITS OF MEASUREMENT</p>
    <p class="center bold italic nomargin">ADDITIONAL LEAD & LEAD SAFETY RESOURCE DATA</p>
    <br clear="all" style="page-break-before:always" ></br></div></div>
    `;

    let c1, c2, c3, c4, c5, c6, c7, c8;

    await this.getBase64('/assets/img/attachments/c1.jpg').then((data)=>{
      c1 = '<img width=750 height=850 src="' + data + '"/>';
    });

    await this.getBase64('/assets/img/attachments/c2.jpg').then((data)=>{
      c2 = '<img width=750 height=850 src="' + data + '"/>';
    });

    await this.getBase64('/assets/img/attachments/c3.jpg').then((data)=>{
      c3 = '<img width=750 height=850 src="' + data + '"/>';
    });

    await this.getBase64('/assets/img/attachments/c4.jpg').then((data)=>{
      c4 = '<img width=750 height=850 src="' + data + '"/>';
    });

    await this.getBase64('/assets/img/attachments/c5.jpg').then((data)=>{
      c5 = '<img width=750 height=850 src="' + data + '"/>';
    });

    await this.getBase64('/assets/img/attachments/c6.jpg').then((data)=>{
      c6 = '<img width=750 height=850 src="' + data + '"/>';
    });

    await this.getBase64('/assets/img/attachments/c7.jpg').then((data)=>{
      c7 = '<img width=750 height=850 src="' + data + '"/>';
    });

    await this.getBase64('/assets/img/attachments/c8.jpg').then((data)=>{
      c8 = '<img width=750 height=850 src="' + data + '"/>';
    });

    content += this.putImage(c1, "page21");
    content += this.putImage(c2, "page22");
    content += this.putImage(c3, "page23");
    content += this.putImage(c4, "page24");
    content += this.putImage(c5, "page25");
    content += this.putImage(c6, "page26");
    content += this.putImage(c7, "page27");
    content += this.putImage(c8, "page28");

    content += `<div id="page29" class = "pages"><div>
    <div style="margin-bottom: 200px;">&nbsp;</div>
    <p class="center bold" style="font-size:72pt;">APPENDIX</p>
    <p class="center bold" style="font-size:72pt;">D</p>
    <p class="center bold italic nomargin">DUST WIPE & SOIL SAMPLE LABORATORY MANIFESTS AND RESULTS</p>
    <br clear="all" style="page-break-before:always" ></br></div></div>
    `;

    console.log('----state----', this.state);
    content = juice.inlineContent(content, this.css);

    this.setState({isPrintPreview: true});
    var node = document.querySelector('#printElement');
    node.innerHTML = content;
    let heightArr = [];
    for(let i = 1; i < 30; i++){
      let page = document.querySelector(`#page${i}`);
      if(page) {
        let height = page.offsetHeight;
        heightArr.push(height);
      }
    }
    this.setState({heightArr, pdfTitle: "Full HUD - Master"});
  }
  else if( row.type === 1)
  {
    let page2 = `<div id="page2" class = "pages"><div>` + this.getHeader(row, bc3_small_image, 2) + `

    <div class="center">
    <h2 style= "font-weight: bold; padding-top: 30px;">TABLE OF CONTENTS</h2>
    <div style = "text-transform: uppercase; width: 100%;">
      <div class="content-wrapper">
        <p style="text-decoration: underline;font-weight:bold;">DESCRIPTION</p>
        <div>
          <p style="text-decoration: underline;text-align:center;font-weight:bold;">PAGE NO</p>
        </div>
      </div>
      <div class="content-wrapper content-wrapper-padding">
        <span class="big-font content-title">1.0 INTRODUCTION-----------------------------------------------------------------------------------------------------------------------</span>
        <div style="padding-right: 25px;"><p class = "center nomargin">3</p></div>
      </div>
      <div class="content-wrapper content-wrapper-paddingr">
        <span class="big-font content-title">2.0 SCOPE OF WORK---------------------------------------------------------------------------------------------------------------</span>
        <div style="padding-right: 25px;"><p class = "center nomargin">3</p></div>
      </div>
      <div class="content-wrapper content-wrapper-padding">
        <span class="big-font content-title">3.0 INSPECTOR'S QUALIFICATIONS---------------------------------------------------------------------------------------------------</span>
        <div style="padding-right: 25px;"><p class = "center nomargin">3</p></div>
      </div>
      <div class="content-wrapper content-wrapper-padding">
        <span class="big-font content-title">4.0 TESTING PROTOCOL----------------------------------------------------------------------------------------------------------------</span>
        <div style="padding-right: 25px;"><p class = "center nomargin">4</p></div>
      </div>
      <div class="content-wrapper content-wrapper-padding">
        <span class="big-font content-title">5.0 METHOD OF TESTING--------------------------------------------------------------------------------------------------------------------</span>
        <div style="padding-right: 25px;"><p class = "center nomargin">5</p></div>
      </div>
      <div class="content-wrapper content-wrapper-padding">
        <span class="big-font content-title">6.0 SUMMARY OF RESULTS---------------------------------------------------------------------------------------------------------------</span>
        <div style="padding-right: 25px;"><p class = "center nomargin">5</p></div>
      </div>
      <div class="content-wrapper content-wrapper-padding">
        <span class="big-font content-title">7.0 RECOMMENDATIONS---------------------------------------------------------------------------------------------------------------</span>
        <div style="padding-right: 25px;"><p class = "center nomargin">6</p></div>
      </div>
      <div class="content-wrapper content-wrapper-padding">
        <span class="big-font content-title">8.0 TITLE X REQUIREMENTS-------------------------------------------------------------------------------------------------------------</span>
        <div style="padding-right: 25px;"><p class = "center nomargin">7</p></div>
      </div>
      <div class="content-wrapper content-wrapper-padding">
        <span class="big-font content-title">9.0 INSPECTION LIMITATIONS----------------------------------------------------------------------------------------------------</span>
        <div style="padding-right: 25px;"><p class = "center nomargin">8</p></div>
      </div>
    </div>
    <table class="no-border" style="text-transform: uppercase;margin-top:20px;">
      <tr>
        <td width="30%">
          <p style="text-decoration: underline;">APPENDIX</p>
        </td>
        <td width="70%">
        </td>
      </tr>
      <tr style="margin-top:20px">
        <td width="30%">
        <p class="nomargin nopadding" style="margin-left:10px;">SUMMARIES</p>
        <p class="nomargin nopadding" style="margin-left:10px;">LEAD CONTAINING COMPONENTS LIST</p>
        <p class="nomargin nopadding" style="margin-left:10px;">XRF FIELD DATA</p>
        <p class="nomargin nopadding" style="margin-left:10px;">CDPH 8552</p>
        <p class="nomargin nopadding" style="margin-left:10px;">INSPECTOR'S CERTIFICATE(S)</p>
        <p class="nomargin nopadding" style="margin-left:10px;">INSURANCE CERTIFICATE</p>
        <p class="nomargin nopadding" style="margin-left:10px;">MAP</p>
        </td>
        <td width="70%">
        </td>
      </tr>
    </table></div></div>
    ` + this.getFooter(100) + `</div>`;



/***********************           page 3              ****************************/

    let page3 = `<div id="page3" class = "pages"><div>` + this.getHeader(row, bc3_small_image, 3) + `

    <div style="text-transform: uppercase;">
      <h1 class="center italic bold" style="font-size:20pt;">LIMITED LEAD-BASED PAINT INSPECTION REPORT</h1>
      <h1 class="center italic bold" style="font-size:20pt;">${typeInspection}</h1>
      <p class="center bold" font> 1.0 Introduction </p>
    </div>
    <p class="left">
      This report presents the results of Barr & Clark's limited lead-based paint (LBP) inspection of the ${row.name} located at ${row.street}, ${row.city}, California (Subject Property).
      This document is prepared for the sole use of the ${this.state.client.company}, and any regulatory agencies that are directly involved in this project.
      No other party should rely on the information contained herein without prior written consent of the ${this.state.client.company}.
      The scope of services, inspection methodology, and results are presented below.
    </p>`

    let hottile = []
    let hot = []
    this.state.samples.map(s => {
      if(s.reading > row.actionLevel ){
        hot.push(s)
        if(s.material == 'Tile'){
        hottile.push(s)
        }
      }
    })


    page3 += `<p class="center bold">2.0 SCOPE OF WORK</p>`;
    page3 += `<p class="left">
      The purpose of this limited inspection is to identify and assess the Lead-Based Paint (LBP) present on select painted components at the subject property.
    </p>`;

    page3 += `<p class="left">
      On ${row.inspectionDate}, Barr & Clark performed a limited inspection for lead-based paint at the subject property in ${row.city}, California.
      The intent was to ascertain the presence of lead-based paint above the federal action level.
      If LBP was found, the limited inspection would identify individual architectural components and their respective concentrations of lead in such a manner that this report would be used to
      characterize the presence of LBP at this property.
    </p>`;

    page3 += `<p class="left italic bold">
    Only select window components and/or door components and the adjacent walls were sampled for the presence of LBP.
    </p>`;

    page3 += `<p class="left italic bold">
      Note: This is a limited inspection - only XXX was inspected and tested.
      It is important to note that other lead containing materials or surfaces may exist in this structure but were not identified and sampled.
     </p>`;

    page3 += `<p class="center bold">3.0 INSPECTOR'S QUALIFICATIONS</p>`;
    page3 += `<p class="left">
      ${this.state.inspector.name} of Barr & Clark performed the inspection/risk assessment at the site using an RMD LPA-1 XRF spectrum analyzer instrument.
      He has attended the radiation safety course for handling the instrument, and completed an EPA approved curriculum in Lead in Construction Inspector / Risk Assessor Training.
     </p>`;

     page3 += `<p class="left">
      At the time of this report, the California Department of Health Services, Childhood Lead Poisoning Branch,
      has implemented a State Certification Model Accreditation Plan adopted from the EPA.
      ${this.state.inspector.name} has received certification. Personnel certificate(s) have been provided.
     </p></div>`;
    page3 +=  this.getFooter(50) + `</div>`;



    /***********************           page 4              ****************************/


    let page4 = `<div id="page4" class = "pages"><div>` + this.getHeader(row, bc3_small_image, 4) + `

    <p class="center bold">4.0 TESTING PROTOCOL</p>`;
    page4 += `<p class="left">
        <font class="text-underline bold">XRF Testing:</font> Testing of the painted surfaces was patterned after the inspection protocol in Chapter 7 of
        the <font class="text-underline">HUD Guidelines for the Evaluation and Control of Lead-Based Paint Hazards in Housing<sup>1</sup><font class="italic">(2012 Revision)</font></font>.
        In every "room equivalent" within the tested property, one representative surface of each "testing combination" was tested. Multiple readings were collected to resolve inconsistencies in the test results.
      </p>`;

    page4 += `<p class="left"><font class="text-underline bold">Regulatory Compliance:</font> Several public (government) agencies have a published "regulatory action level"
        to classify LBP. To further complicate matters, some of the established "levels" are quantified in different units of measurement.
        Listed below are the current regulatory agencies that have defined LBP, along with the respective action level:
        </p>`;

    page4 += `
    <table class="no-border">
      <tr>
        <td class="text-underline">Agency</td>
        <td class="text-underline">Ordinance #</td>
        <td class="text-underline">Action level (mg / cm<sup>2</sup>)</td>
        <td class="text-underline">Action level (ppm<sup>2</sup> )</td>
      </tr>
    `;

    if(row.actionLevel == '0.7'){
      page4 += `
      <tr class="nopadding nomargin text-10">
        <td class="nopadding nomargin">San Diego Lead Ordinance </td>
        <td class="nopadding nomargin">Section 54.1005-1015  </td>
        <td class="nopadding nomargin">0.5 mg / cm<sup>2</sup></td>
        <td class="nopadding nomargin">1000 ppm<sup>3</sup></td>
      </tr>`;

      page4 += `
      <tr class="nopadding nomargin text-10">
        <td class="nopadding nomargin bold">L.A. County</td>
        <td class="nopadding nomargin">Title 11, 11.28.010</td>
        <td class="nopadding nomargin">0.7 mg / cm<sup>2</sup></td>
        <td class="nopadding nomargin">600 ppm<sup>4</sup></td>
      </tr>`;

      page4 += `
      <tr class="nomargin nopadding text-10">
        <td class="bold">HUD / EPA</td>
        <td>24 CFR 35.86 & 40 CFR 745.103</td>
        <td>1.0 mg / cm<sup>2</sup></td>
        <td>5,000 ppm</td>
      </tr>`;

      page4 += `
      <tr class="nomargin nopadding text-10">
        <td class="bold">OSHA / CAL OSHA</td>
        <td>29 CFR 1926.62 & Title 8, 1532.1</td>
        <td class="italic">Not Specified</td>
        <td>600 ppm<sup>5</sup></td>
      </tr>`;
    }
    page4 += `</table>`;

    page4 += `<div style="border: 1px solid black;line-height:normal;" class="text-10">`;
    page4 += `<p class="left text-underline nomargin" style="margin-bottom: 10px;">HUD / EPA have recently issued the following guidance regarding units of measurement for paint samples:</p>`;
    page4 += `<p class="left nomargin">
    "Report lead paint amounts in mg/cm<sup>2</sup> because this unit of measurement does not depend on the number of layers of non-lead-based paint and
    can usually be obtained without damaging the painted surface. All measurements of lead in paint should be in mg/cm<sup>2</sup>,
    unless the surface area cannot be measured or if all paint cannot be removed from the measured surface area.
    In such cases, concentrations may be reported in weight percent (%) or parts per million by weight (ppm)."<sup>6</sup>
        </p>`;

    page4 += `<p class="left text-underline nomargin" style="margin-bottom: 10px;margin-top: 10px;">Furthermore, EPA has previously issued guidance on lead content classification as follows:</p>`;
    page4 += `<p class="left nomargin">
    "... The rule, at 24 CFR 35.86 and 40 CFR 745.103 states that a lead-based paint free finding must demonstrate that the building is free of
    'paint or other surface coatings that contain lead in excess of 1.0 milligrams per square centimeter (1.0 mg / cm<sup>2</sup>) or 0.5 percent by weight (5000 ppm).'
    <u >The State standards are not applicable, whether more or less stringent, since a State cannot amend Federal requirements."<sup>7</sup>
        </u></p>`;
    page4 += `</div>`;

    if(row.actionLevel == '0.5'){
      page4 += `<p class="left top-margin">In recognition of the various action levels the testing results are classified as follows for this report:</p>`;

      page4 += `<ul class="padding-left-20">`;
      page4 += `<li class="left">Painted surfaces with readings at or above 0.5 mg / cm<sup>2</sup> are considered 	-	Positive</li>`;
      page4 += `<li class="left">Painted surfaces with readings at or below 0.4 mg / cm<sup>2</sup> are considered	-	Negative</li>
      </ul>`;

    }

    if(row.actionLevel == '0.7'){
      page4 += `<p class="left top-margin">In recognition of the various action levels the testing results are classified as follows for this report:</p>`;

      page4 += `<ul class="padding-left-20">`;
      page4 += `<li class="left">Painted surfaces with readings at or above 0.7 mg / cm<sup>2</sup> are considered 	-	Positive</li>`;
      page4 += `<li class="left">Painted surfaces with readings at or below 0.6 mg / cm<sup>2</sup> are considered	-	Negative</li>
      </ul>`;
    }

    if(row.actionLevel == '1.0'){
      page4 += `<p class="left top-margin">In recognition of the various action levels the testing results are classified as follows for this report:</p>`;

      page4 += `<ul class="padding-left-20">`;
      page4 += `<li class="left">Painted surfaces with readings at or above 1.0 mg / cm<sup>2</sup> are considered 	-	Positive</li>`;
      page4 += `<li class="left">Painted surfaces with readings at or below 0.9 mg / cm<sup>2</sup> are considered	-	Negative</li>
      </ul>`;
    }

    page4 += `
    <hr class="left" style="height:1px; width: 230px;"/>
    <div style="font-size: 8pt;">
      <p class="nopadding nomargin" style="line-height:150%;">1. &nbsp; &nbsp; &nbsp; &nbsp; 2012 Revision</p>
      <p class="nopadding nomargin" style="line-height:150%;">2. &nbsp; &nbsp; &nbsp; &nbsp; Parts per million</p>
      <p class="nopadding nomargin" style="line-height:150%;">3. &nbsp; &nbsp; &nbsp; &nbsp; pplies to sale and application of LBP.</p>
      <p class="nopadding nomargin" style="line-height:150%;">4. &nbsp; &nbsp; &nbsp; &nbsp; Applies to sale and application of LBP.</p>
      <p class="nopadding nomargin" style="line-height:150%;">5. &nbsp; &nbsp; &nbsp; &nbsp; Applies to construction related activities</p>
      <p class="nopadding nomargin" style="line-height:150%;">6. &nbsp; &nbsp; &nbsp; &nbsp; Chapter 7 of the HUD Guidelines for the Evaluation and Control of Lead-Based Paint Hazards in Housing (2012 Revision).</p>
      <p class="nopadding nomargin" style="line-height:150%;">7. &nbsp; &nbsp; &nbsp; &nbsp; Office of Pollution Prevention and Toxics, (August 20, 1996)</p>
    </div></div>
    `;



    page4 +=  this.getFooter(0) + `</div>`;


    /***********************           page 5              ****************************/


    let page5 = `<div id="page5" class = "pages"><div>` + this.getHeader(row, bc3_small_image, 5);

    page5 += `<p class="left italic bold">
    The individual readings have been provided on all field data sheets. Any future change in action levels by one of the regulating agencies may affect the classification of results.
      </p>`;
    page5 += `<p class="center bold">5.0 METHOD OF TESTING</p>`;


    page5 += `<p class="left nomargin">
    <font class="text-underline bold">Paint Testing:</font> The method employed was X-ray fluorescence (XRF) using a Radiation Monitoring Device Lead Paint Analyzer (RMD LPA-1).
    The instrument was operated in "Quick Mode," where the duration for each test result is determined by a combination of:
      </p>`;

      page5 += `
      <ul>
      <li>the actual reading relative to the designated action level;</li>
      <li>the age of the radioactive source; and</li>
      <li>the substrate on which the test was taken. </li>
      </ul>
      `;

      page5 += `<p class="left">
      The instrument's calibration was verified according to the manufacturer's specifications in compliance with the Performance Characteristic Sheet (PCS) developed for this instrument.
      </p>`;

      page5 += `<p class="left">
      The readings from this instrument produce a 95% confidence level that the "lead" reading accurately reflects the actual level of lead in the tested surfaces, relative to the federal action level.
      </p>`;

      page5 += `<p class="center bold">6.0 SUMMARY OF RESULTS</p>`;

      if (hot.length){
        page5 += `<p class="left"><font class="text-underline bold">Paint Sampling:</font> Throughout the subject property, several of the painted components
          indicated the presence of lead based paint (LBP) at or above the respective action level.
          The following summary lists the specific components that tested above the action level and their respective locations:</p>`;

        page5 += `<p class="text-underline italic bold left nomargin">Interior</p>`;

        page5 += '<ul>';
        hot.map( h => {
          if(h.loc == 'InsSheet')
            page5 += `<li class="left">${h.room} - ${h.material} ${h.item} ${h.name}</li>`;
        })
        page5 += '</ul>';
        if(hottile.length){

          page5 += `<p class="left">Some of the tiled surfaces in the `;

          hottile.map( h => page5 += `${h.room} `)

          page5 += `also tested positive for lead. These surfaces were not painted and the lead is most likely in the glazing or the matrix of the tile itself</p>`;
        }

        page5 += `<p class="text-underline italic bold left nomargin">Exterior</p>`;


        hot.map( h => {
          if(h.loc == 'ExtSheet')
            page5 += `<li class="left">${h.room} - ${h.material} ${h.item} ${h.name}</li>`;
        })

        page5 += `<p class="left italic bold">***Homeowner only wanted components that will be affected by replacement to be tested.***</p>`;
        page5 += `<p class="left italic bold">Sampling for this inspection was representative and any components that were not tested but similar to those components that tested positive for LBP should be considered and treated as lead laden.</p>`;

        page5 += `<p>The field data and results for paint sampling may be found in Appendix</p>`;
        page5 += `<p class="left italic bold">Only select window components and/or door components and the adjacent walls were sampled for the presence of LBP. </p>`;
        page5 += `<p class="left italic bold">Note: This is a limited inspection – only XXX was inspected and tested.   It is important to note that other lead containing materials or surfaces may exist in this structure but were not identified and sampled. </p>`;
      }
      else {
        page5 += `<p class="left"><font class="text-underline italic bold">Paint Sampling:</font> Throughout the subject property, none of the tested painted surfaces indicated the presence of lead based paint (LBP) at or above the respective action level.</p>`;


        if(hottile.length){
          page5 += `<p class="left">However, Some of the tiled surfaces in the `;
          hottile.map( h => page5 += `${h.room} `)
          page5 += `tested positive for lead. These surfaces were not painted and the lead is most likely in the glazing or the matrix of the tile itself</p>`;
        }
        page5 += `<p class="left italic bold">***Homeowner only wanted components that will be affected by replacement to be tested.***</p>`;
        page5 += `<p class="left"><font class="italic bold">Sampling for this inspection/risk assessment was representative.</font> The field data and results for paint sampling may be found in <span class="italic bold">Appendix.</span></p>`;
        page5 += `<p class="left italic bold">Only select window components and/or door components and the adjacent walls were sampled for the presence of LBP. </p>`;
        page5 += `<p class="left italic bold">Note: This is a limited inspection – only XXX was inspected and tested.   It is important to note that other lead containing materials or surfaces may exist in this structure but were not identified and sampled. </p>`;

      }

    page5 +=  `</div>` + this.getFooter(50) + `</div>`;




    /***********************           page 6              ****************************/


    let page6 = `<div id="page6" class = "pages"><div>` + this.getHeader(row, bc3_small_image, 6);
    page6 += `<p class="center bold">7.0 RECOMMENDATIONS</p>`;
    if (hot.length !== 0){
      page6 += `<p class="left nomargin">The greatest potential for lead exposure from lead painted architectural components occurs when:</p>`;
      page6 += `<ul><li class="left">the paint has become defective; or</li>`;
      page6 += `<li class="left">when the paint is applied to a friction / impact component where the paint is continually disturbed; or</li>`;
      page6 += `<li class="left">when the paint is disturbed through routine maintenance or renovation activities.</li></ul>`;
      page6 += `<p class="left nomargin">With this in mind, the following are our recommendations for this property:</p>`;
      page6 += `<ul><li class="left">The results from this inspection should be provided to any individuals that may disturb the painted surfaces. It is encouraged to utilize certified professionals that have experience working with LBP if the work is performed by someone other than the homeowner.</li>`;
      page6 += `<li class="left text-underline">If renovation is scheduled in the near future (less than three months), all lead painted components that have been previously targeted for replacement should be replaced utilizing "lead safe" containment and work practices.</li>`;
      page6 += `<li class="left">ALL components that have been identified with defective lead paint should have the paint repaired as soon as possible. Any paint repair should be done utilizing "lead safe" containment, work practices, and clean-up techniques.</li>`;
      page6 += `<li class="left">All components with lead painted friction / impact surfaces should be treated to minimize the friction or impact as necessary.</li>`;
      page6 += `<li class="left">Lead painted components that <font class="bold">have not</font> been targeted for replacement should either be considered for abatement (replacement, enclosure, encapsulation, etc.) or included in an Operations & Management (O & M) Plan that will help to minimize exposures to lead hazards.</li>`;
      page6 += `<li class="left">All lead painted surfaces that are not expected to be impacted in the near future (less than three months) should also be included the O & M plan.</li>`;
      page6 += `<li class="left">In addition, the tenants or occupants of the dwelling should be notified of the test results and instructed in actions that they may perform to keep the living areas "lead safe."</li>`;
      if(hottile.length){
        page6 += `<li class="left">The tile surfaces are not a likely source of lead dust contamination as long as they remain intact. If future renovation or repair activities require that the tile be removed, or the surfaces disturbed, it should be done in a manner that does not break the tiles. If this is not feasible, this task should be assigned to a lead certified contractor.</li>`;
      }
      page6 += `</ul>`;

    }
    else{
      page6 += `<p class="left">
      Since none of the tested painted surfaces indicated the presence of lead based paint (LBP) at or above the respective action level,
      <font class="italic bold">no further testing is required at this time.</font>
      </p>`;
      page6 += `<p class="left italic bold">Only select window components and/or door components and the adjacent walls were sampled for the presence of LBP. </p>`;
      page6 += `<p class="left italic bold">Note: This is a limited inspection - only XXX was inspected and tested.
         It is important to note that other lead containing materials or surfaces may exist in this structure but were not identified and sampled. </p>`;
    }

    page6 +=  `</div>` + this.getFooter(50) + `</div>`;



    /***********************           page 7              ****************************/


    let page7 = `<div id="page7" class = "pages"><div>` + this.getHeader(row, bc3_small_image, 7);

    page7 += `<p class="center bold">8.0 TITLE X REQUIREMENTS</p>`;

    page7 += `<p class="left">
      A copy (or summary) of this report must be provided to new lessees (tenants) and purchasers of this property under Federal law (24 CFR part 35 and 40 CFR part 745)
      before they become obligated under a lease or sales contract.
      The complete report must also be provided to new purchasers and it must be made available to new tenants.
      Landlords (lessors) and sellers are also required to distribute an educational pamphlet approved by the U.S. Environmental Protection Agency and
      include standard warning language in their leases or sales contracts to ensure that parents have the information they need to protect their children
      from lead-based paint hazards. This report should be maintained and updated as a permanent maintenance record for this property.
      </p></div>`;

    page7 +=  this.getFooter(200) + `</div>`;


    /***********************           page 8              ****************************/


    let page8 = `<div id="page8" class = "pages"><div>` + this.getHeader(row, bc3_small_image, 8);

    page8 += `<p class="center bold">9.0 INSPECTION LIMITATIONS</p>`;

    page8 += `<p class="left">
      This limited inspection was planned, developed, and implemented based on Barr & Clark's previous experience in performing lead-based paint inspections.
      This limited inspection was patterned after Chapter 7 of the <font class="italic">HUD Guidelines for the Evaluation and Control of Lead-Based Paint Hazards in Housing (2012 Revision).</font>
      Barr & Clark utilized state-of-the-art-practices and techniques in accordance with regulatory standards while performing this limited inspection.
      Barr & Clark's evaluation of the relative risk of exposure to lead identified during this limited inspection is based on conditions observed at the time of the limited
      inspection. Barr & Clark cannot be responsible for changing conditions that may alter the relative exposure risk or for future changes in accepted methodology.
      </p>`;

    page8 += `<p class="left">
      Enclosed are the actual test results and all relevant certifications/licenses.
      </p></div>`;

    page8 +=  this.getFooter(200) + `</div>`;



    content += page1 + page2 + page3 + page4 + page5 + page6 + page7 + page8;




    content += `<div id="page9" class = "pages"><div>
    <div style="margin-bottom: 200px;">&nbsp;</div>
    <p class="center bold" style="font-size:72pt;">APPENDIX</p>
    <p class="center bold italic nomargin">XRF FIELD DATA</p>
    <p class="center bold italic nomargin">CDPH 8552</p>
    <p class="center bold italic nomargin">INSPECTOR CERTIFICATES</p>
    <p class="center bold italic nomargin">INSURANCE</p>
    <p class="center bold italic nomargin">MAP</p>
    <br clear="all" style="page-break-before:always" ></br></div></div>
    `;

    // content += this.getSummary(row);

    // content += this.get8552Content(row, image1, image2, image3);

    let b1, b2, b3, b4;

    await this.getBase64('/assets/img/attachments/b1.jpg').then((data)=>{
      b1 = '<img width=750 height=850 src="' + data + '"/>';
    });

    await this.getBase64('/assets/img/attachments/b2.jpg').then((data)=>{
      b2 = '<img width=750 height=850 src="' + data + '"/>';
    });

    await this.getBase64('/assets/img/attachments/b3.jpg').then((data)=>{
      b3 = '<img width=750 height=850 src="' + data + '"/>';
    });

    await this.getBase64('/assets/img/attachments/b4.jpg').then((data)=>{
      b4 = '<img width=750 height=850 src="' + data + '"/>';
    });

    content += this.putImage(b1, "page10");
    content += this.putImage(b2, "page11");
    content += this.putImage(b3, "page12");
    content += this.putImage(b4, "page13");

    console.log('----state----', this.state);
    console.log('----row----', row);
    content = juice.inlineContent(content, this.css);
    this.setState({isPrintPreview: true});
    node = document.querySelector('#printElement');
    node.innerHTML = content;
    let heightArr = [];
    for(let i = 1; i < 14; i++){
      let page = document.querySelector(`#page${i}`);
      if(page) {
        let height = page.offsetHeight;
        heightArr.push(height);
      }
    }
    this.setState({heightArr, pdfTitle: "Limted LBP - Master"});
    // converted = htmlDocx.asBlob(content, {orientation: 'portrait', margins: {top: 400, left : 600, right : 400, bottom: 400}});
    // saveAs(converted, 'limited.docx' );
  }

}

exportToDocx() {
  // this.convertImagesToBase64();
  var contentDocument = document.querySelector('#printElement');
  var content = '<!doctype html><html lang="en"><head>';
  content += '<meta charset="utf-8"><meta http-equiv="X-UA-Compatible" content="IE=edge">';
  content += '<meta name="viewport" content="width=device-width,initial-scale=1,shrink-to-fit=no">';
  content += '<meta name="description" content="Barr and Clark Environmental">';
  content += '<meta name="author" content="Jeremy Nelson">';
  content += '<style>' + this.css + '</style></head><body>' + contentDocument.outerHTML + '</body></html>';
  content = juice.inlineContent(content, this.css);
  var  converted = htmlDocx.asBlob(content, {orientation: 'portrait', margins: {top: 400, left : 600, right : 400, bottom: 400}});
    saveAs(converted, `${this.state.pdfTitle}.docx` );

}

convertImagesToBase64 () {
  var contentDocument = document.querySelector('#printElement');
  var regularImages = contentDocument.querySelectorAll("img");
  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');
  [].forEach.call(regularImages, function (imgElement) {
    // preparing canvas for drawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = imgElement.width;
    canvas.height = imgElement.height;
    ctx.drawImage(imgElement, 0, 0);
    // by default toDataURL() produces png image, but you can also export to jpeg
    // checkout function's documentation for more details
    var dataURL = canvas.toDataURL();
    imgElement.setAttribute('src', dataURL);
  })
  canvas.remove();
}

print() {
  const filename = this.state.pdfTitle;
  var node = document.querySelector('#printElement');
  var heightArr = this.state.heightArr;
  domtoimage.toPng(node)
  .then(function (dataUrl) {
    const paperWidth = 612;
    const paperHeight = 792;
    let img = new Image();
    img.src = dataUrl;
    img.onload = () => {
      let imgWidth = img.width;
      let imgHeight = img.height;
      // let pdf = new jsPDF('p', 'pt', 'a4');
      let pdf = new jsPDF({orientation: 'portrait', unit: 'pt', format: [paperWidth, paperHeight]});
      var canvas = document.createElement("canvas");
      canvas.width = imgWidth;
      canvas.height = imgHeight;
      let ctx = canvas.getContext("2d");
      ctx.drawImage(img,0,0);
      var nPages = heightArr.length;
      var pageCanvas = document.createElement('canvas');
      var pageCtx = pageCanvas.getContext('2d');
      pageCanvas.width = canvas.width;
      pageCanvas.height = paperHeight / 0.75
      var headers = document.getElementsByClassName("header");
      var footers = document.getElementsByClassName("footer");
      var headerHeight = headers[1].offsetHeight;
      var footerHeight = footers[1].offsetHeight;
      var headerCanvas = document.createElement('canvas');
      var headerCtx = headerCanvas.getContext('2d');
      headerCanvas.width = canvas.width;
      headerCanvas.height = headerHeight;
      var footerCanvas = document.createElement('canvas');
      var footerCtx = footerCanvas.getContext('2d');
      footerCanvas.width = canvas.width;
      footerCanvas.height = footerHeight;
      var sHeight = 0;
      var sHeight1 = paperHeight / 0.75;
      for (var page=0; page<nPages; page++) {
        var w = pageCanvas.width;
        // Display the page.
        let nCount = Math.ceil(heightArr[page] / paperHeight * 0.75);
        if(page > 0){
          pageCanvas.height = paperHeight / 0.75 - headerHeight - footerHeight;
          headerCtx.fillStyle = 'white';
          headerCtx.fillRect(0, 0, canvas.width, headerHeight);
          headerCtx.drawImage(canvas, 0, sHeight1, w, headerHeight, 0, 0, w, headerHeight);
          footerCtx.fillStyle = 'white';
          footerCtx.fillRect(0, 0, canvas.width, footerHeight);
          footerCtx.drawImage(canvas, 0, sHeight1 + heightArr[page] - footerHeight, w, footerHeight, 0, 0, w, footerHeight);
          var headerData = headerCanvas.toDataURL('image/png', 0.95);
          var footerData = footerCanvas.toDataURL('image/png', 0.95);
          for(let j = 0; j < nCount; j++){
            let h = pageCanvas.height;
            if(nCount > 1 && j === nCount - 1){
              let lastH = heightArr[page] - pageCanvas.height * j - headerHeight - footerHeight;
              if(lastH < h){
                h = lastH
                pageCanvas.height = h;
              }
            }
            pageCtx.fillStyle = 'white';
            pageCtx.fillRect(0, 0, w, h);
            pageCtx.drawImage(canvas, 0, sHeight + headerHeight, w, h, 0, 0, w, h);
            sHeight += h;
            if(j === nCount - 1) {
              sHeight += headerHeight + footerHeight;
            }
            // Add the page to the PDF.
            if (page) pdf.addPage();
            let imgData = pageCanvas.toDataURL('image/png', 0.95);
            pdf.addImage(headerData, 'image/png', 0, 0, paperWidth, headerHeight* 0.75);
            pdf.addImage(imgData, 'image/png', 0, headerHeight * 0.75, paperWidth, h * 0.75);
            pdf.addImage(footerData, 'image/png', 0, paperHeight - footerHeight * 0.75, paperWidth, footerHeight* 0.75);
            if(nCount > 1 && j === nCount - 1){
              let lastH = heightArr[page] - pageCanvas.height * j - headerHeight - footerHeight;
              if(lastH > h){
                sHeight = sHeight - headerHeight - footerHeight;
                h = lastH - h;
                pageCanvas.height = h;
                pageCtx.fillStyle = 'white';
                pageCtx.fillRect(0, 0, w, h);
                pageCtx.drawImage(canvas, 0, sHeight + headerHeight, w, h, 0, 0, w, h);
                sHeight += h + headerHeight + footerHeight;
                // Add the page to the PDF.
                if (page) pdf.addPage();
                let imgData = pageCanvas.toDataURL('image/png', 0.95);
                pdf.addImage(headerData, 'image/png', 0, 0, paperWidth, headerHeight* 0.75);
                pdf.addImage(imgData, 'image/png', 0, headerHeight * 0.75, paperWidth, h * 0.75);
                pdf.addImage(footerData, 'image/png', 0, paperHeight - footerHeight * 0.75, paperWidth, footerHeight* 0.75);

              }
            }
          }
          sHeight1 += heightArr[page];
        }
        else{
          var h = pageCanvas.height;
          pageCtx.fillStyle = 'white';
          pageCtx.fillRect(0, 0, w, h);
          pageCtx.drawImage(canvas, 0, sHeight, w, h, 0, 0, w, h);
          sHeight += h;
          // Add the page to the PDF.
          if (page)  pdf.addPage();
          let imgData = pageCanvas.toDataURL('image/png', 0.95);
          pdf.addImage(imgData, 'image/png', 0, 0, paperWidth, h* 0.75);
        }
      }
      pdf.save(filename);
    }
  });
}

putImage(image, id) {
  return `<div id ="${id}" class = "pages"><div>${image}</div><br clear="all" style="page-break-before:always" ></br></div>`;
}

getFooter(marginHeight) {
  return `
  <div class="footer center" style="color:#003300;padding-top:${20}px;">
    <p class="nopadding nomargin center">16531 Bolsa Chica, Suite 205 • Huntington Beach, CA 92649 • 714.894.5700</p>
    <p class="nopadding nomargin center">www.barrandclark.com</p>
    <br clear="all" style="page-break-before:always" ></br>
  </div>
  `;
}

getHeader(row, bc3_small_image, pageNumber) {
  let title = row.type === 1 ? "Limited Lead Based Paint Inspection Report": "Lead-Based Paint Inspection/Risk Assessment Report";
  return `
  <div class="header">
      <table class="no-border">
      <tr>
        <td width="60%">
          <div class="left italic">
            <p class="nomargin nopadding">${title}</p>
            <p class="nomargin nopadding">${row.name}</p>
            <p class="nomargin nopadding">${row.address}</p>
            <p class="nomargin nopadding">Project Number: ${row.id}</p>
          </div>
        </td>
        <td style="text-align: right; filter: alpha(opacity=50);" width="30%">
          ${bc3_small_image}
          <p class="right italic" >Page ${pageNumber} </p>
        </td>

      </tr>
      </table>
    </div>
  `;
}

getSummary(jobInfo) {
  var content = `<div class = "pages"><div>`;
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

  var report = this.state.samples;

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
    content += this.positiveExterior(jobInfo, exteriorReport, page, datetime, 0);
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
    content += this.positiveCommon(jobInfo, commonReport, page, datetime, 0);
    page ++;
  }

  content += this.blankPageWithTitle("FIELD DATA");
  page =  1;


  // FIELD DATA REPORT
  var page_count = Math.floor( (report.length - 1) / portraitPageSize ) + 1 ;

  for ( var i = 0 ; i < page_count; i ++)
  {
    content += this.dataReport(jobInfo, report, page, datetime, i * portraitPageSize);
    page++;
  }

  content += "</div></div>"
  return content;
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

getLandscapeHeader(jobInfo, header) {
  return `
  <div class="heading">
    <h2>` + header + `</h2>
  </div>
  <div class="row" style="text-align:center;">
  <table class="no-border" style="width : 80%;">
    <tr style="width : 100%;">
      <td style="width : 50%;">
          <span class="bold">Project Name : </span>
          <span >` + (jobInfo? jobInfo.name : '') + `</span>
      </td>
      <td style="width : 50px; text-align:right">
          <span class="bold">Project Number : </span>
          <span >` + (jobInfo? jobInfo.id : '') + `</span>
      </td>
    </tr>
    <tr style="width : 100%;">
      <td style="width : 50%;">
          <span class="bold">Address : </span>
          <span >` + (jobInfo? jobInfo.street + " , " + jobInfo.city : '') + `</span>
      </td>
      <td style="width : 50px; text-align:right">
          <span class="bold">Protocol : </span>
          <span >` + 'LA County' + `</span>
      </td>
    </tr>
  </table>
  </div>
  `;
}

getLandscapeFooter(page, datetime) {

  return `
  <div class="left footer">
    <div> L.A. County DHS action level for lead paint is 0.7 mg/cm<sup>2</sup>.</div>
    <div> Positive is defined as XRF sampling with levels at or above 0.7 mg/cm<sup>2</sup>.</div>
    <hr>

    <div class="row" style="text-align:center;">
    <table class="no-border" style="width : 100%;">
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
  <br clear="all" style="page-break-before:always" ></div>`;
}

dataReport(jobInfo, report, page, datetime, startIndex) { // data, page_number, current datetime, start index in the array

  var charSet = ' ';
  var landscapeHeader = this.getLandscapeHeader(jobInfo, 'FIELD DATA REPORT');
  var landscapeFooter = this.getLandscapeFooter(page, datetime);

  var table = `<div class="table-responsive"> <table class="table">
    <thead>
    <tr>
      <th>Sample</th>
      <th>Unit ID/Location</th>
      <th>Room Equivalent</th>
      <th class="center">Side</th>
      <th>Component</th>
      <th>Substrate</th>
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
        if(i >= startIndex + portraitPageSize)
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

        let name = x.name;
        if( name.startsWith("Wall") )
          name = "Wall";
        table += `<tr style="background-color:` + color + `">
            <td>` + (i+1) + `</td>
            <td>` + (x.unit|| '') + `</td>
            <td>` + (location + ' ' + x.room) + `</td>
            <td class="center">` + (x.side|| '') + `</td>
            <td>` + (name) + `</td>
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

    if( startIndex + portraitPageSize > report.length) {
      for(var i = 0; i < startIndex + portraitPageSize - report.length; i ++)
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

positiveExterior(jobInfo, report, page, datetime, startIndex) { // data, page_number, current datetime, start index in the array

  var charSet = ' ';

  var landscapeHeader = this.getLandscapeHeader(jobInfo, 'Exterior Lead Containing Components List');
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
        if(i >= startIndex + portraitPageSize)
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

    if( startIndex + portraitPageSize > report.length) {
      for(var i = 0; i < startIndex + portraitPageSize - report.length; i ++)
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

positiveCommon(jobInfo, report, page, datetime, startIndex) { // data, page_number, current datetime, start index in the array

  var charSet = ' ';
  var landscapeHeader = this.getLandscapeHeader(jobInfo, 'Common Lead Containing Components List');
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
        if(i >= startIndex + portraitPageSize)
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

    if( startIndex + portraitPageSize > report.length) {
      for(var i = 0; i < startIndex + portraitPageSize - report.length; i ++)
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

get8552Content(jobInfo, image1, image2, image3) {
  let noneLead = true;
  this.state.samples.map( (x, i) => {
    if(x.result == "POSITIVE" && x.reading >= jobInfo.actionLevel)
    {
//        console.log(x);
      noneLead = false;
    }
  });
  console.log(noneLead);
  console.log(jobInfo);

  let content = `<div class = "pages"><div>`;
  content += `
  <div class="header" style="padding-bottom:0px;margin-bottom:0px;line-height:10px;">
    State of California-Health and Human Services Agency</br>
    California Department of Public Health
  </div>
  `;

  content += `<h4 class="center">LEAD HAZARD EVALUATION REPORT</h4>`;

  console.log('state', this.state);
  content += `


    <div class="underline left">
      <b>Section 1-Date of Lead Hazard Evaluation</b>
      <span>` + (jobInfo? jobInfo.inspectionDate : '') + `</span>
    </div>
    <div class="left">
      <b>Section 2-Type of Lead Hazard Evaluation </b>
      <span>(Check one box only)</span>
    </div>
    <div class="left">
      <input type="checkbox" name="lead_inspection" value="lead_inspection"/>
      <label style="font-size:10px">Lead inspection</label>
      <input type="checkbox" name="risk_assessment" value="risk_assessment" />
      <label>Risk Assessment</label>
      <input type="checkbox" name="clearance_inspection" value="clearance_inspection" />
      <label>Clearance inspection</label>
      <input type="checkbox" name="other" value="other" />
      <label>Other (Limited Inspection)</label>
    </div>

    <div class="left">
      <b>Section 3-Structure Where Lead Hazard Evaluation Was Conducted</b>
    </div>
    <table class="font-small">
      <tr class="side-border">
        <td colspan="2">
          <p class="nomargin nopadding">Address (number, street, apartment (if applicable)</p>
          <p class="nomargin nopadding">`
          + (jobInfo? jobInfo.address : '') +
        `</p></td>
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
          + (typeof this.state.details.year === 'undefined' ? 1 : this.state.details.year) +
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
          (this.state.details.dwelling == "Single Family Home" ? (
            `<input type="checkbox" name="family" value="family" checked/>
          <label>Single Family Dwelling</label>
          <input type="checkbox" name="other" value="other"/>
          <label>Other (specify)</label>`
          ) : (
            `<input type="checkbox" name="family" value="family"/>
          <label>Single Family Dwelling</label>
          <input type="checkbox" name="other" value="other" checked/>
          <label>Other ` + (this.state.details.dwelling) + `</label>`
          ))
           +
          `</div>
        </td>
        <td colspan="2">
          <div>Children Living in Structure?</div>
          <div>` +
          (this.state.details.children == "Yes" ? (
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

    <div class="left">
      <b>Section 4-Owner of Structure</b> (If business/agency, list contact person)
    </div>

    <table class="side-border font-small">
      <tr>
        <td colspan="3">
          <p class="nopadding nomargin">Name</p><p class="nopadding nomargin">` //(jobInfo? jobInfo.siteName : '')
          + (jobInfo? jobInfo.homeownerName : '') +
        `</p></td>
        <td colspan="2">
          <p class="nopadding nomargin">Telephone number<p><p class="nopadding nomargin">`
          + (jobInfo? jobInfo.siteNumber : '') +
        `</p></td>
      </tr>
      <tr>
        <td colspan="2">
          <p class="nopadding nomargin">
            Address [number, street, apartment (if applicable)]
          </p><p class="nopadding nomargin">`
          + (jobInfo? jobInfo.address : '') +
        `</p></td>
        <td>
          <p class="nopadding nomargin">City</p>
          <p class="nopadding nomargin">${jobInfo.city}</p>
        </td>
        <td>
          <p class="nopadding nomargin">State</p>
          <p class="nopadding nomargin">CA</p>
        </td>
        <td>
          <p class="nopadding nomargin">ZIP code</p>
          <p class="nopadding nomargin">${jobInfo.postal}</p>
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

    <div class="left">
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
          <p class="nopadding nomargin">` + (jobInfo? jobInfo.inspectionDate : '')  + `</p>
        </td>
      </tr>
      <tr>
        <td colspan="5">
          Name and CDPH certification number of any other individuals conducting sampling or testing (if applicable)
        </td>
      </tr>
    </table>

    <div class="left" >
      <b>Section 7-Attachments</b>
    </div>

    <div class="left" style="font-size: 11px;">
      <p class="nopadding nomargin"> A. A foundation diagram or sketch of the structure indicating the specific locations of each lead hazard or presence of lead-based paint; </p>
      <p class="nopadding nomargin">B.  Each testing method, device, and sampling procedure used;</p>
      <p class="nopadding nomargin">C. All data collected, including quality control data, laboratory results, including laboratory name, address, and phone number.</p>
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
    </div></div>
    `;
  return content;
}

 getBase64(url) {

  return new Promise((resolve, reject) => {

    let xhr = new XMLHttpRequest();
    xhr.onload = function() {
      let reader = new FileReader();
      reader.onloadend = function() {
        if(xhr.status === 200) resolve(reader.result);
        else resolve(400);
      }
      reader.readAsDataURL(xhr.response);
      reader.onerror = error => reject(xhr.status);
    };
    xhr.open('GET', url);
    xhr.responseType = 'blob';
    xhr.send();
  });
}

  backButton(cell, row){
    return (<div> <Button style={{padding:'3px'}} color="success" size="sm" onClick={() => this.sendBack(row.id)}>Send Back</Button>  <Button style={{padding:'3px'}}  size="sm" color="success" onClick={() => this.markDone(row.id)}>Complete</Button></div>)
  }
  doneButton(cell, row){
     return (<div><Button onClick={() => {this.getReport(row)}} color="danger">Report</Button></div>)
  }
  goButton(cell, row){
     return (<div><Button color="success" onClick={() =>  this.props.history.push('/jobs/'+row.id)}>Open</Button></div>)
  }

  address(cell,row){
       return (<div>{row.street +' '+ row.city}</div>)
  }

  siteNumber
  render() {
    return (
      <div className="animated">
        {!this.state.isPrintPreview && (
        <Card>
          <CardHeader>
            <i className="icon-menu"></i>{this.props.name}{' '}
          </CardHeader>
          <CardBody>
            <BootstrapTable  data={this.props.data || this.table} version="4" striped hover pagination search options={this.options}>
            <TableHeaderColumn dataFormat={this.goButton}></TableHeaderColumn>
            <TableHeaderColumn isKey dataField="id" dataSort>JobId</TableHeaderColumn>
            <TableHeaderColumn dataField="name">Job Name</TableHeaderColumn>
            <TableHeaderColumn dataFormat={this.address} dataSort>Address</TableHeaderColumn>
            <TableHeaderColumn dataField="siteNumber" dataSort>Phone</TableHeaderColumn>
            <TableHeaderColumn dataField="comments" dataSort>Comments</TableHeaderColumn>
            <TableHeaderColumn
              key={this.id}
             dataFormat={this.backButton}>
             </TableHeaderColumn>
            <TableHeaderColumn dataFormat={this.doneButton}></TableHeaderColumn>
            </BootstrapTable>
          </CardBody>
        </Card>
        )}
        {this.state.isPrintPreview && (
        <Card>
          <CardHeader>
            <div style = {{display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%"}}>
              <Button color="success" onClick={() =>  this.exportToDocx()}>Export</Button>
              <span style = {{fontWeight: "bold", fontSize: "20px"}}>Export Preview</span>
              <Button color="danger" onClick={() =>  this.setState({isPrintPreview: false})}>Close</Button>
            </div>
          </CardHeader>
          <CardBody>
            <div id = "printElement" style = {{padding: "0px 40px 40px 40px", width: "612pt", margin: "auto"}}></div>
          </CardBody>
        </Card>
        )}
      </div>
    );
  }
}

export default withRouter(DataTable);
