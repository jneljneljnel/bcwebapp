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

const fetch64 = require('fetch-base64');
const axios = require('axios')
const history = createBrowserHistory();



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

  sendBack(id){
     axios.get(`/api/jobs/sendBack/${id}`).then( res => {
       console.log('send back')
       window.location.reload();
     })
  }

  markDone(id){
     axios.get(`/api/jobs/markDone/${id}`).then( res => {
       console.log('done')
       window.location.reload();
     })
  }

  getOpenJobs(){
    axios.get('/api/jobs/open').then( res => {
      this.setState({data:res.data})
    })
  }

  async getReport1(row){
    //console.log(row)
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
              this.setState({details: d})
            }
          })
        })

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
          console.log('item', d)
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
    this.setState({samples:rows})
    //console.log(rows)
    const doc = new Document({
      creator: "Clippy",
      title: "Sample Document",
      description: "A brief example of using docx",
    });

doc.Styles.createParagraphStyle("Heading1", "Heading 1")
    .basedOn("Normal")
    .next("Normal")
    .quickFormat()
    .size(38)
    .bold()
    .center()
    .italics()
    .spacing({ after: 120 });

doc.Styles.createParagraphStyle("MySpectacularStyle", "My Spectacular Style")
    .basedOn("Heading1")
    .next("Heading1")
    .color("990000")
    .italics();

doc.Styles.createParagraphStyle("Heading2", "Heading 2")
    .basedOn("Normal")
    .next("Normal")
    .quickFormat()
    .size(26)
    .bold()
    .underline("single")
    .spacing({ before: 240, after: 120 });

    doc.Styles.createParagraphStyle("Heading4", "Heading 4")
        .basedOn("Normal")
        .next("Normal")
        .quickFormat()
        .size(26)
        .bold()

doc.Styles.createParagraphStyle("Heading3", "Heading 3")
    .basedOn("Normal")
    .next("Normal")
    .quickFormat()
    .size(30)
    .bold()
    .spacing({ after: 120 });

doc.Styles.createParagraphStyle("Heading5", "Heading 5")
    .basedOn("Normal")
    .next("Normal")
    .quickFormat()
    .size(24)
    .bold()
    .spacing({ after: 120 });

doc.Styles.createParagraphStyle("Heading6", "Heading 6")
    .basedOn("Normal")
    .next("Normal")
    .quickFormat()
    .size(20)
    .center()
    .bold()
    .spacing({ after: 120 });


doc.Styles.createParagraphStyle("aside", "Aside")
    .basedOn("Normal")
    .next("Normal")
    .indent({ left: 200 })
    .spacing({ line: 276 });

doc.Styles.createParagraphStyle("wellSpaced", "Well Spaced")
    .basedOn("Normal")
    .spacing({ line: 276, before: 20 * 72 * 0.1, after: 20 * 72 * 0.05 });

doc.Styles.createParagraphStyle("listparagraph", "List Paragraph")
    .quickFormat()
    .basedOn("Normal")
    .size(24)
    .bold()
    .indent({ left: 200 })
    .spacing({ after: 120 });;

doc.Styles.createParagraphStyle("normalPara", "Normal Para")
  .basedOn("Normal")
  .next("Normal")
  .font("Calibri")
  .quickFormat()
  .leftTabStop(453.543307087)
  .maxRightTabStop()
  .size(22)
  .spacing({ line: 276, before: 20 * 72 * 0.1, after: 20 * 72 * 0.05 });

const numberedAbstract = doc.Numbering.createAbstractNumbering();
numberedAbstract.createLevel(0, "lowerLetter", "%1)", "left");

doc.createParagraph("LEAD-BASED PAINT INSPECTION/RISK ASSESSMENT REPORT").heading1();
doc.createParagraph("of");
doc.createParagraph().style("wellSpaced").center();;
doc.createParagraph(`${row.phone}`);
doc.createParagraph(`${row.name}`);
doc.createParagraph(`${row.address}`);
doc.createParagraph(`Job number: ${row.id}`);
var today = new Date().toISOString().slice(0, 10)
doc.createParagraph(`${today}`);
doc.createParagraph();
doc.createParagraph();
doc.createParagraph("Prepared for ").style("wellSpaced");
//doc.createParagraph(`${this.state.client.company}`);
doc.createParagraph(`${this.state.client.street}, ${this.state.client.city}`);
doc.createParagraph();
const image = Media.addImage(doc, [this.state.propimg]);
 doc.addImage(image);
doc.createParagraph();
const para = doc.createParagraph().left();
para.createTextRun("Inspected and Prepared By ").bold();
doc.createParagraph(`${this.state.inspector.name}`);
const image2 = Media.addImage(doc, [this.state.propimg]);
 doc.addImage(image2);
const para2 = doc.createParagraph().right();
para2.createTextRun("Reviewed by").bold()
doc.createParagraph(`${this.state.inspector.name}`);
const image3 = Media.addImage(doc, [this.state.propimg]);
doc.addImage(image3);
doc.createParagraph().pageBreak();;

///////page two
doc.createParagraph("TABLE OF CONTENTS").heading1();
doc.createParagraph()
doc.createParagraph('Description').heading2();
doc.createParagraph("1.0 Executive Summary").heading3();
doc.createParagraph("2.0 Identified Lead Hazards & Summary of Results")
doc.createParagraph("3.0 Identifying Information & Purpose of Inspection")
doc.createParagraph("4.0 Ongoing Monitoring")
doc.createParagraph("5.0 Disclosure Regulations and Title X Requirements")
doc.createParagraph("6.0 Future Remodeling Precautions")
doc.createParagraph("7.0 Conditions & Inspection Limitations")
doc.createParagraph("8.0 Site Information")
doc.createParagraph("9.0 Lead Hazard Control Options & Recommendations")
doc.createParagraph("10.0 Testing Protocol")
doc.createParagraph("11.0 Method of Testing")
doc.createParagraph()
doc.createParagraph('Appendices').heading2();
doc.createParagraph('Appendix A ').heading5();
doc.createParagraph('Summaries').style("aside");
doc.createParagraph('Lead Containing Component List').style("aside");
doc.createParagraph('XRF Field Data').style("aside");
doc.createParagraph('Appendix B ').heading5();
doc.createParagraph('FloorPlan/ Maps').style("aside");
doc.createParagraph('Resident Questionnaire').style("aside");
doc.createParagraph('Building Conditions Survey').style("aside");
doc.createParagraph('CDPH 8552').style("aside");
doc.createParagraph('Inspector Certificates').style("aside");
doc.createParagraph('Insurance Certificate').style("aside");
doc.createParagraph('Appendix C ').heading5();
doc.createParagraph('Performance Characteristics Sheet (PCS)').style("aside")
doc.createParagraph('Lead Speak - A Brief Glossary & Key Units of Measurement').style("aside")
doc.createParagraph('Additional Lead & Lead Safety Resource Data').style("aside")
doc.createParagraph('Appendix D ').heading5();
doc.createParagraph('Dust Wipe and Soil Sample Laboratory manifest and Results').style("aside")
doc.createParagraph('Performance Characteristics Sheet (PCS)').style("aside")
doc.createParagraph().pageBreak();

/////// page three
doc.createParagraph("LEAD-BASED PAINT INSPECTION/RISK ASSESSMENT REPORT").heading1();
doc.createParagraph("1.0 Executive Summary").heading6();
doc.createParagraph(`This report presents the results of Barr and Clark Lead-Based Paint (LBP) Inspection/Risk
 Assessment of the ${row.name} located at ${row.address}, California (Subject Property). This Document is Prepared for the Sole use of
 ${this.state.client.company} and any regulatory agencies that are directly involved in this project. No other party should rely on the information
 contained herein without prior consent of ${this.state.client.company}`).style("aside")
 doc.createParagraph()

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

soil.map(s => {
  //console.log('SOIL', s)
})

if (hot.length){
  doc.createParagraph(`As a result of the Lead Based Paint (LBP) Inspection/risk Assessment Conducted on ${row.inspectionDate}, lead-based paint/lead hazards were present at the subject property on the date of this assessment.The analyitical results from this assessment, the scope of services, inspection, methodology, and results are presented below. `).style("aside")
}
else{
  doc.createParagraph(`As a result of the Lead Based Paint (LBP) Inspection/risk Assessment Conducted on ${row.inspectionDate}, lead-based paint/lead hazards were not present at the subject property on the date of this assessment. The analyitical results from this assessment, the scope of services, inspection, methodology, and results are presented below`).style("aside")
}
doc.createParagraph();
doc.createParagraph("2.0 Identified Lead Hazards & Summary of Results").heading6();
if (hot.length){
  doc.createParagraph(`Paint Sampling: Throughout the subject property, several of the painted components indicated the presence of lead based paint (LBP) at or above the respective action level. The following summary lists the specific components that tested above the action level and their respective locations:`).style("aside")

  doc.createParagraph("Interior").heading2();
  hot.map( h => { if(h.loc == 'InsSheet')doc.createParagraph(`${h.room} - ${h.material} ${h.item} ${h.name}`).style("listparagraph")})

  if(hottile.length){
    const para = doc.createParagraph().style("aside");
    para.createTextRun("Some of the tiled surfaces in the ");
    hottile.map( h => para.createTextRun(`${h.room} `))
    para.createTextRun("also tested positive for lead. These surfaces were not painted and the lead is most likely in the glazing or the matrix of the tile itself");
  }

  doc.createParagraph("Exterior").heading2();
  hot.map( h => { if(h.loc == 'ExtSheet')doc.createParagraph(`${h.room} - ${h.material} ${h.item} ${h.name}`).style("listparagraph")})
  ///////page 4
  doc.createParagraph(`Sampling for this inspection/risk assessment was representative and any components that were not tested but similar to those components that tested positive for LBP should be considered and treated as lead laden.`).style("aside")
  doc.createParagraph();
  doc.createParagraph(`the field data and results for paint sampling may be found in appendix A `).style("aside")

}
else{

  //////page 4
  doc.createParagraph(`Paint Sampling: Throughout the subject property, none of the tested painted surfaces indicated the presence of lead based paint (LBP) at or above the respective action level.`).style("normalPara")

  if(hottile.length){
    const para = doc.createParagraph().style("normalPara");
    para.createTextRun("However, Some of the tiled surfaces in the ");
    hottile.map( h => para.createTextRun(`${h.room} `))
    para.createTextRun("tested positive for lead. These surfaces were not painted and the lead is most likely in the glazing or the matrix of the tile itself");
  }
  doc.createParagraph();
  doc.createParagraph(`Sampling for this inspection/risk assessment was representative. The field data and results for paint sampling may be found in appendix A `).style("normalPara")

}
/////TODO Soil and DUST SAMPLES
if(soil.length){
  const table = doc.createTable(soil.length+1, 4);
  table.getCell(0, 0).createParagraph("Sample #")
  table.getCell(0, 1).createParagraph("Type")
  table.getCell(0, 2).createParagraph("Location")
  table.getCell(0, 3).createParagraph("Test Result (ug/ft)")
  soil.map((s,i) => {
    table.getCell(i+1, 0).createParagraph(new Paragraph(s.title));
    if(s.title.startsWith("SS")){
      table.getCell(i+1, 1).createParagraph(new Paragraph('Soil (composite)'));
    }
    else{
      table.getCell(i+1, 1).createParagraph(new Paragraph('Dust Wipe'));
    }
    table.getCell(i+1, 2).createParagraph(new Paragraph(s.area));
  })

}
// doc.createParagraph("An aside, in light gray italics and indented").style("aside");
// doc.createParagraph("This is normal, but well-spaced text").style("wellSpaced");
// const para = doc.createParagraph();
// para.createTextRun("This is a bold run,").bold();
// para.createTextRun(" switching to normal ");
// para.createTextRun("and then underlined ").underline();
// para.createTextRun("and back to normal.");

//PAGE 5
doc.createParagraph().pageBreak();
doc.createParagraph('Laboratory Information:').heading6();
doc.createParagraph('5431 Industrial Drive, Huntington Beach, CA 92649').style("normalPara");
doc.createParagraph('Dust Wipe Analysis Protocol: EPA 3050B/7000A').style("normalPara");
doc.createParagraph('Dust Wipe Media: Lead-Wipes ASTM E1792').style("normalPara");
doc.createParagraph('Accreditation Program Number: DOSH ELAP No. 1406').style("normalPara");
doc.createParagraph()
doc.createParagraph()
doc.createParagraph('IDENTIFYING INFORMATION & PURPOSE OF INSPECTION/RISK ASSESSMENT').heading6();

doc.createParagraph('The purpose of this inspection/risk assessment is to identify and assess the presence of Lead Hazards and Lead-Based Paint (LBP) present at the subject property as well as to identify the presence of deteriorated LBP and LBP that may be disturbed during planned renovations.').style("normalPara");
doc.createParagraph(`On ${this.state.inspectionDate}, Barr And Clark paint inspection and risk assessment performed an inspection/risk assessment for lead-based paint at the subject property at ${row.address}. As part of the assessment, a visual survey of the property was conducted, dust wipe sampling was performed on a limited number of interior surfaces, and composite soil samples were collected. In addition, painted and varnished surfaces in every accessible “room equivalent” were sampled via x-ray fluorescence (XRF) for the presence of LBP. The intent was to ascertain the presence of lead-based paint above the federal action level. If LBP was found, the inspection would identify individual architectural components and their respective concentrations of lead in such a manner that this report would be used to characterize the presence of LBP at this property.`).style("normalPara");
doc.createParagraph('This inspection/risk assessment will help determine if the unit is eligible for U.S. Department of Housing and Urban Development (HUD)-funded renovation activities. The inspection/risk assessment is required for federally assisted renovation.').style("normalPara");
doc.createParagraph()
doc.createParagraph('of BARR AND CLARK performed the inspection/risk assessment at the site using an RMD LPA-1 XRF spectrum analyzer instrument. He has attended the radiation safety course for handling the instrument, and completed an EPA approved curriculum in Lead in Construction Inspector / Risk Assessor Training.').style("normalPara");
doc.createParagraph('At the time of this report, the California Department of Health Services, Childhood Lead Poisoning Branch, has implemented a State Certification Model Accreditation Plan adopted from the EPA. «INSPECTOR_1» has received certification. Personnel certificate(s) have been provided in Appendix B.').style("normalPara");
doc.createParagraph().pageBreak();

///PAGE 6

doc.createParagraph('ONGOING MONITORING').heading6();
doc.createParagraph(`Ongoing monitoring is necessary in all dwellings in which LBP is known or presumed to be present. At these dwellings, the very real potential exists for LBP hazards to develop. Hazards can develop by means such as, but not limited to: the failure of lead hazard control measures; previously intact LBP becoming deteriorated; dangerous levels of lead-in-dust (dust lead) re-accumulating through friction, impact, and deterioration of paint; or, through the introduction of contaminated exterior dust and soil into the interior of the structure. Ongoing monitoring typically includes two different activities: re-evaluation and annual visual assessments. A re-evaluation is a risk assessment that includes limited soil and dust sampling and a visual evaluation of paint films and any existing lead hazard controls. Re-evaluations are supplemented with visual assessments by the Client, which should be conducted at least once a year, when the Client or its management agent (if th housing is rented in the future) receives complaints from residents about deteriorated paint or other potential lead hazards, when the residence (or if, in the future, the house will have more than one dwelling unit, any unit that turns over or becomes vacant), or when significant damage occurs that could affect the integrity of hazard control treatments (e.g., flooding, vandalism, fire). The visual assessment should cover the dwelling unit (if, in the future, the housing will have more than one dwelling unit, each unit and each common area used by residents), exterior painted surfaces, and ground cover (if control of soil-lead hazards is required or recommended). Visual assessments should confirm that all Paint with known or suspected LBP is not deteriorating, that lead hazard control methods have not failed, and that structural problems do not threaten the integrity of any remaining known, presumed or suspected LBP.`).style("normalPara");
doc.createParagraph(`
The visual assessments do not replace the need for professional re-evaluations by a certified risk assessor. The re-evaluation should include:
A review of prior reports to determine where lead-based paint and lead-based paint hazards have been found, what controls were done, and when these findings and controls happened;
A visual assessment to identify deteriorated paint, failures of previous hazard controls, visible dust and debris, and bare soil;
Environmental testing for lead in dust, newly deteriorated paint, and newly bare soil; and
A report describing the findings of the reevaluation, including the location of any lead-based paint hazards, the location of any failures of previous hazard controls, and, as needed, acceptable options for the control of hazards, the repair of previous controls, and modification of monitoring and maintenance practices.
`).style("normalPara");
doc.createParagraph().pageBreak();

///PAGE 7
doc.createParagraph('DISCLOSURE REGULATIONS & TITLE X REQUIREMENTS').heading6();
if (hot.length){
  doc.createParagraph(`A copy of this complete report must be provided to new lessees (tenants) and purchasers of this property under Federal law (Section 1018 of Title X - 24 CFR part 35 and 40 CFR part 745) before they become obligated under a lease or sales contract. The complete report must also be provided to new purchasers and it must be made available to new tenants. Landlords (lessors) and sellers are also required to distribute an educational pamphlet approved by the U.S. Environmental Protection Agency entitled “Protect Your Family From Lead in Your Home” and include standard warning language in their leases or sales contracts to ensure that parents have the information they need to protect their children from lead-based paint hazards. This report should be maintained and updated as a permanent maintenance record for this property.`).style("normalPara");
}else{
  doc.createParagraph(`The results of this inspection/risk assessment indicate that no lead in amounts greater than or equal to 1.0 mg/cm² in paint was found on any building components, using the inspection protocol in Chapter 7 of the HUD Guidelines for the Evaluation and Control of Lead-Based Paint Hazards in Housing (2012 Revision). Therefore, this dwelling qualifies for the exemption in 24 CFR part 35 and 40 CFR part 745 for target housing being leased that is free of lead-based paint, as defined in the rule. However, some painted surfaces may contain levels of lead below 1.0 mg/cm², which could create lead dust or lead-contaminated soil hazards if the paint is turned into dust by abrasion, scraping, or sanding. This report should be maintained as a permanent maintenance record for this property.`).style("normalPara");
}
doc.createParagraph('FUTURE REMODELING PRECAUTIONS').heading6();
doc.createParagraph(`It should be noted that during this Assessment, a number of areas were tested for the presence of LBP. All LBP, dust, and soil hazards that were identified are addressed in this report. Additional dust and/or soil sample collection and analysis should follow any hazard control activity, repair, remodeling, or renovation effort, and any other work efforts that may in any way disturb LBP and/or any lead containing materials. These Assessment activities will help the Client and owner to ensure the health and safety of the occupants and the neighborhood. Details concerning lead-safe work techniques and approved hazard control methods can be found in the HUD publication entitled: “Guidelines for the Evaluation and Control of LBP Hazards in Housing” (www.hud.gov/offices/lead). Remodeling, repair, renovation and painting at the residence beyond the scale of minor repair and maintenance activities must be conducted in accordance with the EPA’s Lead Repair, Renovation, and Painting Rule (within 40 CFR part 745); see the EPA’s website on the RRP Rule at http://www.epa.gov/lead/pubs/renovation.htm for the scope and requirements of that Rule. Lead-based paint abatement or lead-based paint hazard abatement at the residence must be conducted in accordance with the EPA’s Lead Abatement Rule (also within 40 CFR 745); see the EPA’s website for Lead Abatement Professionals at http://www.epa.gov/lead/pubs/traincert.htm.`).style("normalPara")
doc.createParagraph().pageBreak();


///PAGE 8
doc.createParagraph('CONDITIONS & INSPECTION LIMITATIONS').heading6();
doc.createParagraph('This inspection/risk assessment was planned, developed, and implemented based on (OUR COMPANY NAME)’s previous experience in performing lead-based paint inspections/risk assessments. This inspection was patterned after Chapter 7 of the HUD Guidelines for the Evaluation and Control of Lead-Based Paint Hazards in Housing (2012 Revision). (OUR COMPANY NAME) utilized state-of-the-art-practices and techniques in accordance with regulatory standards while performing this inspection/risk assessment. (OUR COMPANY NAME)’s evaluation of the relative risk of exposure to lead identified during this inspection/risk assessment is based on conditions observed at the time of the inspection. (OUR COMPANY NAME) cannot be responsible for changing conditions that may alter the relative exposure risk or for future changes in accepted methodology.').style("normalPara");
doc.createParagraph()
doc.createParagraph(`(OUR COMPANY NAME) cannot guarantee and does not warrant that this inspection/risk assessment has identified all adverse environmental factors and/or conditions affecting the subject property on the date of the assessment. (OUR COMPANY NAME) cannot and will not warrant that the inspection/risk assessment that was requested by the client will satisfy the dictates of, or provide a legal defense in connection with, any environmental laws or regulations. It is the responsibility of the client to know and abide by all applicable laws, regulations, and standards, including EPA’s Renovation, Repair and Painting regulation.
`)
doc.createParagraph()
doc.createParagraph(`The results reported and conclusions reached by (OUR COMPANY NAME) are solely for the benefit of the client.
The results and opinions in this report, based solely upon the conditions found on the property as of the
date of the assessment, will be valid only as of the date of the assessment. (OUR COMPANY NAME) assumes no
obligation to advise the client of any changes in any real or potential lead hazards at this residence that may or may not be later brought to our attention.
`)

if(this.state.details){
let windows = []
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
const propdeets = doc.createParagraph()
propdeets.createTextRun(`The subject property is a ${this.state.details.dwelling} that was built circa  ${this.state.details.year}. It is a  ${this.state.details.stories}-story building that is constructed over a  ${this.state.details.builtover}. `)
propdeets.createTextRun(`The exterior walls are covered with ${this.state.details.brick? 'brick, ': ''}  ${this.state.details.stucco? 'stucco, ': ''}  ${this.state.details.transas? 'transite-asbestos, ': ''} ${this.state.details.other? 'other materials ': ''}`)
if (windows.length == 1){
  propdeets.createTextRun(`and all of the windows are ${windows[0].name} types.`)
}
else{
  propdeets.createTextRun(`the windows are a combination of `+windows.map(x => x.name+' ')+` types.`)
}
 propdeets.createTextRun(`The home consists of ${this.state.details.bednums} bedrooms, ${this.state.details.bathnums} bathrooms`)
 if(this.state.details.garage == 'Attached' || this.state.details.garage == 'Detached'){
  this.state.details.garage == 'Attached'?  propdeets.createTextRun(`and an attached garage`) : propdeets.createTextRun(`and a detached garage`)
 }
propdeets.createTextRun(`. At the time of this inspection/risk assessment, most of the painted surfaces were in ${this.state.details.paint} condition`)
}
doc.createParagraph().pageBreak();

///page 9
if (hot.length){
  doc.createParagraph(`Lead-safe work practices and worker/occupant protection practices complying with current EPA, HUD and OSHA standards will be necessary to safely complete all work involving the disturbance of LBP coated surfaces and components. In addition, any work considered lead hazard control will enlist the use of interim control (temporary) methods and/or abatement (permanent) methods. It should be noted that all lead hazard control activities have the potential of creating additional hazards or hazards that were not present before.`)
  doc.createParagraph()
  doc.createParagraph('Details for the listed lead hazard control options and issues surrounding occupant/worker protection practices can be found in the publication entitled: Guidelines for the Evaluation and Control of LBP Hazards in Housing published by HUD, the Environmental Protection Agency (EPA) lead-based paint regulations, and the Occupational Safety and Health Administration (OSHA) regulations found in its Lead in Construction Industry Standard.')
  doc.createParagraph()
  doc.createParagraph('Cost estimates should be obtained from a certified LBP abatement contractor or a contractor trained in lead-safe work practices. Properly trained and/or licensed persons, as well as properly licensed firms (as mandated) should accomplish all abatement/interim control activities conducted at this property.')
  doc.createParagraph()
  doc.createParagraph(`Interim controls, as defined by HUD, means a set of measures designed to temporarily reduce human
exposure to LBP hazards and/or lead containing materials. These activities include, but are not limited to:
component and/or substrate repairs; paint and varnish repairs; the removal of dust-lead hazards; maintenance; temporary containment; placement of seed, sod or other forms of vegetation over bare soil areas; the placement of at least 6 inches of an appropriate mulch material over an impervious material, laid on top of bare soil areas; the tilling of bare soil areas; extensive and specialized cleaning; and, ongoing LBP maintenance activities.
`)
doc.createParagraph()
doc.createParagraph(`Abatement, as defined by HUD, means any set of measures designed to permanently eliminate LBP and/
or LBP hazards. The product manufacturer and/or contractor must warrant abatement methods to last a
minimum of twenty (20) years, or these methods must have a design life of at least twenty (20) years. These activities include, but are not necessarily limited to: the removal of LBP from substrates and components; the replacement of components or fixtures with lead containing materials and/or lead containing paint; the permanent enclosure of LBP with construction materials; the encapsulation of LBP with approved products; the removal or permanent covering (concrete or asphalt) of soil-lead hazards; and, extensive and specialized cleaning activities. (EPA’s definition is substantively the same.)
`)
doc.createParagraph(`The greatest potential for lead exposure from lead painted architectural components occurs when:`)
doc.createParagraph(`the paint has become defective`).bullet()
doc.createParagraph(`when the paint is applied to a friction / impact component where the paint is continually disturbed;`).bullet()
doc.createParagraph(` or when the paint is disturbed through routine maintenance or renovation activities.`).bullet()
doc.createParagraph()
doc.createParagraph(`With this in mind, the following are our recommendations for this property:`)
doc.createParagraph(`The results from this inspection should be provided to any individuals that may disturb the painted surfaces. It is encouraged to utilize certified professionals that have experience working with LBP if the work is performed by someone other than the homeowner.`).bullet()
doc.createParagraph(`If renovation is scheduled in the near future (less than three months), all lead painted components that have been previously targeted for replacement should be replaced utilizing “lead safe” containment and work practices.`).bullet()
doc.createParagraph(`ALL components that have been identified with defective lead paint should have the paint repaired as soon as possible. Any paint repair should be done utilizing “lead safe” containment, work practices, and clean-up techniques.`).bullet()
doc.createParagraph(`All components with lead painted friction / impact surfaces should be treated to minimize the friction or impact as necessary.`).bullet()
doc.createParagraph(`Lead painted components that have not been targeted for replacement should either be considered for abatement (replacement, enclosure, encapsulation, etc.) or included in an Operations & Management (O & M) Plan that will help to minimize exposures to lead hazards.`).bullet()
doc.createParagraph(`All lead painted surfaces that are not expected to be impacted in the near future (less than three months) should also be included the O & M plan.`).bullet()
doc.createParagraph(`In addition, the tenants or occupants of the dwelling should be notified of the test results and instructed in actions that they may perform to keep the living areas “lead safe.”`).bullet()
doc.createParagraph()
  if(hottile.length){
    doc.createParagraph(`The tile surfaces are not a likely source of lead dust contamination as long as they remain intact. If future renovation or repair activities require that the tile be removed, or the surfaces disturbed, it should be done in a manner that does not break the tiles. If this is not feasible, this task should be assigned to a lead certified contractor. `)
  }
 ///TODO if soil sample
}
else{
  doc.createParagraph(`Since none of the tested painted surfaces indicated the presence of lead based paint (LBP) at or above the respective action level, no further testing is required at this time.`)
}
doc.createParagraph().pageBreak();

///PAGE 10
doc.createParagraph('TESTING PROTOCOL').heading6();
doc.createParagraph(`XRF Testing: Testing of the painted surfaces was patterned after the inspection protocol in Chapter 7 of the HUD Guidelines for the Evaluation and Control of Lead-Based Paint Hazards in Housing(2012 Revision). In every “room equivalent” within the tested property, one representative surface of each “testing combination” was tested. Multiple readings were collected to resolve inconsistencies in the test results.`).style("normalPara");
doc.createParagraph()
doc.createParagraph(`Agency               Ordinance #                       Action level (mg / cm2)        Action level(ppm)`)
doc.createParagraph()
if(row.actionLevel == '0.7'){
doc.createParagraph(`Los Angeles         Title 11, 11.28.010                     0.7 mg / cm2               600 ppm`)
doc.createParagraph(`HUD / EPA	         24 CFR 35.86 & 40 CFR 745.103        1.0 mg / cm2  	            5,000 ppm`)
doc.createParagraph(`OSHA / CAL OSHA     29 CFR 1926.62 & Title 8, 1532.1	    Not Specified	            600 ppm`)
}

doc.createParagraph('HUD / EPA have recently issued the following guidance regarding units of measurement for paint samples:').heading6();
doc.createParagraph()
doc.createParagraph(`“Report lead paint amounts in mg/cm² because this unit of measurement does not depend on the number of layers of non-lead-based paint and can usually be obtained without damaging the painted surface. All measurements of lead in paint should be in mg/cm², unless the surface area cannot be measured or if all paint cannot be removed from the measured surface area. In such cases, concentrations may be reported in weight percent (%) or parts per million by weight (ppm).”`).style("normalPara");
doc.createParagraph(`Furthermore, EPA has previously issued guidance on lead content classification as follows:
`)
doc.createParagraph()
doc.createParagraph(`2012 Revision`).bullet()
doc.createParagraph(`Parts per million`).bullet()
doc.createParagraph(`Applies to sale and application of LBP.`).bullet()
doc.createParagraph(`Applies to construction related activities`).bullet()
doc.createParagraph(`Chapter 7 of the HUD Guidelines for the Evaluation and Control of Lead-Based Paint Hazards in Housing (2012 Revision).`).bullet()
doc.createParagraph()
doc.createParagraph(`“… The rule, at 24 CFR 35.86 and 40 CFR 745.103 states that a lead-based paint free finding must demonstrate that the building is free of ‘paint or other surface coatings that contain lead in excess of 1.0 milligrams per square centimeter (1.0 mg / cm2) or 0.5 percent by weight (5000 ppm).’ The State standards are not applicable, whether more or less stringent, since a State cannot amend Federal requirements.”`).style("normalPara");
doc.createParagraph().pageBreak();

///PAGE 12
if(row.actionLevel == '0.5'){
  doc.createParagraph(`In recognition of the various action levels the testing results are classified as follows for this report:`).style("normalPara");
  doc.createParagraph()
  doc.createParagraph(`Painted surfaces with readings at or above 0.5 mg / cm2 are considered 	-	Positive`).bullet()
  doc.createParagraph(`Painted surfaces with readings at or below 0.4 mg / cm2 are considered	-	Negative`).bullet()
}

if(row.actionLevel == '0.7'){
  doc.createParagraph(`In recognition of the various action levels the testing results are classified as follows for this report:`).style("normalPara");
  doc.createParagraph()
  doc.createParagraph(`Painted surfaces with readings at or above 0.7 mg / cm2 are considered 	-	Positive`).bullet()
  doc.createParagraph(`Painted surfaces with readings at or below 0.6 mg / cm2 are considered	-	Negative`).bullet()
}

if(row.actionLevel == '1.0'){
  doc.createParagraph(`In recognition of the various action levels the testing results are classified as follows for this report:`).style("normalPara");
  doc.createParagraph()
  doc.createParagraph(`Painted surfaces with readings at or above 1.0 mg / cm2 are considered 	-	Positive`).bullet()
  doc.createParagraph(`Painted surfaces with readings at or below 0.9 mg / cm2 are considered	-	Negative`).bullet()
}

doc.createParagraph('The individual readings have been provided on all field data sheets. Any future change in action levels by one of the regulating agencies may affect the classification of results.').style("normalPara");
doc.createParagraph()
doc.createParagraph(`Dust Wipe Sampling: The California Department of Public Health/HUD action level for lead dust is 10 μg/ft2 for floors, 100 µg / ft2 for window sills, 100 µg / ft2 for window troughs/wells, and 40 µg / ft2 for exterior porches – see note*.`)
doc.createParagraph()
doc.createParagraph('Soil Sampling: The California Department of Public Health /HUD action level for lead in soil is 400 parts per million (ppm) for bare soil and 1000 ppm for soil covered with vegetation (ground cover, grass, etc.).')
doc.createParagraph()
doc.createParagraph(`*NOTE: Per the U.S. Department of Housing and Urban Development (HUD) Guidelines for the Evaluation and Control of Lead-Based Paint Hazards (Office of Healthy Homes and Lead Hazard`)
doc.createParagraph()
doc.createParagraph('Office of Pollution Prevention and Toxics, (August 20, 1996)').bullet()
doc.createParagraph().pageBreak();

///PAGE 13
doc.createParagraph(`Control Second Edition, July 2012), if Federal standards differ from State, Tribal or local standards, the most stringent (protective) standards must be applied.`).style("normalPara");
doc.createParagraph()
doc.createParagraph(`The U.S. Department of Housing and Urban Development (HUD) has revised the Dust-Lead Action Levels for Risk Assessment and Clearance; Clearance of Porch Floors (Policy Guidance Number: 2017-01 Date: January 31, 2017). Effective April 1, 2017, the following lead dust hazard and clearance action levels (or lower levels if required by their state regulations) should be followed: `)
doc.createParagraph()
doc.createParagraph(`New Lead Dust Hazard Action Levels: Floors: ≥10 μg/ft2 and Window Sills: ≥100 μg/ft2, `)
doc.createParagraph()
doc.createParagraph(`New Lead Clearance Action Levels: Interior Floors: <10 μg/ft2; Porch Floors: <40 μg/ft2, Window Sills: <100 μg/ft2, and Window Troughs: <100 μg/ft2`)
doc.createParagraph()
doc.createParagraph('METHOD OF TESTING').heading6();
doc.createParagraph()
doc.createParagraph(`Paint Testing:  The method employed was X-ray fluorescence (XRF) using a Radiation Monitoring Device Lead Paint Analyzer (RMD LPA-1). The instrument was operated in “Quick Mode,” where the duration for each test result is determined by a combination of: `).style("normalPara");
doc.createParagraph(`the actual reading relative to the designated action level`).bullet()
doc.createParagraph(`the age of the radioactive source; and`).bullet()
doc.createParagraph(`the substrate on which the test was taken.`).bullet()
doc.createParagraph()
doc.createParagraph(`The instrument’s calibration was verified according to the manufacturer's specifications in compliance with the Performance Characteristic Sheet (PCS) developed for this instrument. A copy of the PCS for this instrument may be found in Appendix C.`)
doc.createParagraph()
doc.createParagraph(`The readings from this instrument produce a 95% confidence level that the “lead” reading accurately reflects the actual level of lead in the tested surfaces, relative to the federal action level.`)
doc.createParagraph()
doc.createParagraph(`Laboratory Sample Analysis: Soil and dust samples were collected from this property and analyzed for lead content by an independent environmental laboratory which is accredited by the American Industrial Association (AIHA), the National Institute for Standards and Technology (NVLAP) and the California Department of Health Services (ELAP). The samples were analyzed as follows:`)
doc.createParagraph(`Dust Wipe Sampling - The method of analysis was Flame Atomic Absorption Spectroscopy (EPA 3050B/7000A, Flame AA) performed on samples collected from measured areas.`).bullet()
doc.createParagraph(`Soil Sampling - The method of analysis was Flame Atomic Absorption Spectroscopy (EPA 3050B/7000A, Flame AA) performed on samples collected from the top ½” of bare soil areas (drip line, etc.).`).bullet()
doc.createParagraph().pageBreak();

///PAGE 13
doc.createParagraph('APPENDIX A')
doc.createParagraph().pageBreak();


///PAGE 14
doc.createParagraph('Field Data')
doc.createParagraph().pageBreak();

//Page 15 FIELD DATA REPORT
doc.createParagraph('FIELD DATA REPORT').heading6();
doc.createParagraph(`Project Name: ${row.name}                ProjectNumber:${row.id}`).style("normalPara");
doc.createParagraph(`address: ${row.address}               Protocol:${row.actionLevel}`).style("normalPara");
doc.createParagraph()

const fdt = doc.createTable(this.state.samples.length+1, 10);
fdt.getCell(0, 0).createParagraph("Sample")
fdt.getCell(0, 1).createParagraph("UnitId/location")
fdt.getCell(0, 2).createParagraph("Room Equivalent")
fdt.getCell(0, 3).createParagraph("Side")
fdt.getCell(0, 4).createParagraph("Component")
fdt.getCell(0, 5).createParagraph("Substrate")
fdt.getCell(0, 6).createParagraph("Condition")
fdt.getCell(0, 7).createParagraph("Lead")
fdt.getCell(0, 8).createParagraph("Results")
fdt.getCell(0, 9).createParagraph("Comments")
this.state.samples.map((s,i) => {
  console.log('SAMPLE', s)
  if(s.reading){
    fdt.getCell(i+1, 0).createParagraph(i+1);
    if(s.loc == 'InsSheet'){
      fdt.getCell(i+1, 1).createParagraph(s.unit);
    }else{
      fdt.getCell(i+1, 1).createParagraph(s.room);
    }
    if(s.loc == 'InsSheet'){
      fdt.getCell(i+1, 2).createParagraph('Interior '+s.room);
    }else{
      fdt.getCell(i+1, 2).createParagraph('Exterior '+s.extdir );
    }
    fdt.getCell(i+1, 3).createParagraph(s.side);
    fdt.getCell(i+1, 4).createParagraph(s.name);
    fdt.getCell(i+1, 5).createParagraph(s.material);
    fdt.getCell(i+1, 6).createParagraph(s.condition);
    fdt.getCell(i+1, 7).createParagraph(s.reading);
    if(Math.round(s.reading * 100) >= Math.round(row.actionLevel * 100)){
      fdt.getCell(i+1, 8).createParagraph('POSITIVE');
    }
    else {
      fdt.getCell(i+1, 8).createParagraph('Negative');
    }
    fdt.getCell(i+1, 9).createParagraph(s.comments);
  }
})
doc.createParagraph().pageBreak();


///INTERIOR COMPONENT LIST
doc.createParagraph('Interior Lead Containing Components List').heading6();
doc.createParagraph(`Project Name: ${row.name}                ProjectNumber:${row.id}`).style("normalPara");
doc.createParagraph(`address: ${row.address}               Protocol:${row.actionLevel}`).style("normalPara");
doc.createParagraph()

let intSamps = []
this.state.samples.map((s,i) => {
  console.log('SAMPLE', s)
  if(s.loc == 'InsSheet' && s.reading && Math.round(s.reading * 100) >= Math.round(row.actionLevel * 100)){
    intSamps.push(s)
  }
})

const icl = doc.createTable(intSamps.length+1, 10);
icl.getCell(0, 0).createParagraph("Sample")
icl.getCell(0, 1).createParagraph("UnitId/location")
icl.getCell(0, 2).createParagraph("Room Equivalent")
icl.getCell(0, 3).createParagraph("Side")
icl.getCell(0, 4).createParagraph("Component")
icl.getCell(0, 5).createParagraph("Substrate")
icl.getCell(0, 6).createParagraph("Condition")
icl.getCell(0, 7).createParagraph("Lead")
icl.getCell(0, 8).createParagraph("Results")
icl.getCell(0, 9).createParagraph("Comments")

intSamps.map((s,i)=> {
  console.log(s,i)
  if(s.loc == 'InsSheet'&& s.reading && Math.round(s.reading * 100) >= Math.round(row.actionLevel * 100)){
    icl.getCell(i+1, 0).createParagraph(i);
    icl.getCell(i+1, 1).createParagraph(s.unit);
    icl.getCell(i+1, 2).createParagraph('Interior '+s.room);
    icl.getCell(i+1, 3).createParagraph(s.side);
    icl.getCell(i+1, 4).createParagraph(s.name);
    icl.getCell(i+1, 5).createParagraph(s.material);
    icl.getCell(i+1, 6).createParagraph(s.condition);
    icl.getCell(i+1, 7).createParagraph(s.reading);
    icl.getCell(i+1, 8).createParagraph('POSITIVE');
    icl.getCell(i+1, 9).createParagraph(s.comments);
  }
})
doc.createParagraph().pageBreak();


///Exterior
doc.createParagraph('Exterior Lead Containing Components List').heading6();
doc.createParagraph(`Project Name: ${row.name}                ProjectNumber:${row.id}`).style("normalPara");
doc.createParagraph(`address: ${row.address}               Protocol:${row.actionLevel}`).style("normalPara");
doc.createParagraph()

let extSamps = []
this.state.samples.map((s,i) => {
  console.log('SAMPLE', s)
  if(s.loc == 'ExtSheet' && s.reading && Math.round(s.reading * 100) >= Math.round(row.actionLevel * 100)){
    extSamps.push(s)
  }
})
const ecl = doc.createTable(extSamps.length+1, 10);
ecl.getCell(0, 0).createParagraph("Sample")
ecl.getCell(0, 1).createParagraph("UnitId/location")
ecl.getCell(0, 2).createParagraph("Room Equivalent")
ecl.getCell(0, 3).createParagraph("Side")
ecl.getCell(0, 4).createParagraph("Component")
ecl.getCell(0, 5).createParagraph("Substrate")
ecl.getCell(0, 6).createParagraph("Condition")
ecl.getCell(0, 7).createParagraph("Lead")
ecl.getCell(0, 8).createParagraph("Results")
ecl.getCell(0, 9).createParagraph("Comments")
extSamps.map((s,i)=> {
  console.log(s,i)
  if(s.loc == 'ExtSheet'&& s.reading && Math.round(s.reading * 100) >= Math.round(row.actionLevel * 100)){
    ecl.getCell(i, 0).createParagraph(i);
    ecl.getCell(i, 1).createParagraph(s.unit);
    ecl.getCell(i, 2).createParagraph('Exterior '+s.extdir);
    ecl.getCell(i, 3).createParagraph(s.side);
    ecl.getCell(i, 4).createParagraph(s.name);
    ecl.getCell(i, 5).createParagraph(s.material);
    ecl.getCell(i, 6).createParagraph(s.condition);
    ecl.getCell(i, 7).createParagraph(s.reading);
    ecl.getCell(i, 8).createParagraph('POSITIVE');
    ecl.getCell(i, 9).createParagraph(s.comments);
  }
})
doc.createParagraph().pageBreak();


const packer = new Packer();
 packer.toBlob(doc).then(blob => {
     saveAs(blob, row.name + "example.docx");
     console.log("created successfully!");
 });

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
            if(d.id == 1)
            {
              this.setState({property_detail: d});
            }
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
  //console.log(rows)
  console.log('doc create');

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
    await this.getBase64('/assets/img/property.jpg').then((data)=>{
      property_picture = '<img width=160 height=100 src="' + data + '"/>';
    });

    let bc3_image;
    await this.getBase64('/assets/img/BC3.png').then((data)=>{
      bc3_image = '<img width=100 height=100 src="' + data + '"/>';
    });

    let bc3_small_image;
    await this.getBase64('/assets/img/BC3.png').then((data)=>{
      bc3_small_image = '<img width=50 height=50 src="' + data + '"/>';
    });
//    content = this.get8552Content(row, image1, image2, image3);
    var today = new Date().toISOString().slice(0, 10);

    /***********************           page 1               ****************************/

    let page1 = `
    <div class="header" style="opacity: 0.5">
      <table class="no-border">
      <tr>
        <td style="text-align: right;" width="40%">
          ${bc3_image}
        </td>
        <td width="60%">
          <div class="left">
          <h1 style="color:#71b389;">BARR & CLARK</h1>
          <p class="nomargin nopadding">Independent Environmental Testing</p>
          <p class="nomargin nopadding">Asbestos * Lead * Mold * Phase I</p>
          </div>
        </td>
      </tr>
      </table>
    </div>

    <div class="center">
    <h1 style="font-style:italic;">LEAD-BASED PAINT INSPECTION/RISK ASSESSMENT REPORT</h1>
    <p>of</p>
    <p class="nomargin nopadding">${this.state.client.phone1}</p>
    <p class="nomargin nopadding">${row.name}</p>
    <p class="nomargin nopadding">${row.address}</p>
    <p class="nomargin nopadding">${this.state.client.city}, ${this.state.client.state}</p>

    <p>PROJECT NO. ${row.id}</p>
    <p>${today}</p> 
    </div>

    <div class="center">${property_picture}</div>
    <div class="pink">
    Prepared For
    <p class="nomargin nopadding">COMPANY</p>
    <p class="nomargin nopadding">COMPANYADDRESS</p>
    <p class="nomargin nopadding">COMPANYCITY, COMPANYSTATE COMPANYZIP</p>
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
        ${image1}
        ${image2}
      </td>
      <td>
      </td>
      <td>
        ${image3}
      </td>
    </tr>
    <tr>
      <td style="border-top: 1px solid black; max-width: 100px;">
        ${this.state.inspector.name}
        <p class="nopadding nomargin">State of California Certified</p>
        <p class="nopadding nomargin">Lead Inspector / Risk Assessor</p>
      </td>
      <td>
      </td>
      <td style="border-top: 1px solid black; max-width: 100px;">
        <p class="nopadding nomargin pink" >Matt Crochet</p>
        <p class="nopadding nomargin">State of California Certified</p>
        <p class="nopadding nomargin">Lead Inspector / Risk Assessor</p>
      </td>
    </tr>
    
    </table>
    ` + this.getFooter(150);



  /***********************           page 2               ****************************/


    let page2 = this.getHeader(row, bc3_small_image, 2) + `

    <div class="center">
    <h2>TABLE OF CONTENTS</h2>
    <table class="no-border">
      <tr style="margin-bottom:15px;">
        <td width="70%">
          <h3 style="text-decoration: underline;">Description</h3>
        </td>
        <td width="30%">
          <h3 style="text-decoration: underline;">PAGE NO</h3>
        </td>
      </tr>
      <tr>
        <td width="70%">
          <span class="big-font">1.0 Executive Summary</span>
        </td>
        <td width="30%"><span>1</span></td>
      </tr>
      <tr>
        <td width="70%">
          <span class="big-font">2.0 Identified Lead Hazards & Summary of Results</span>
        </td>
        <td width="30%"><span>5</span></td>
      </tr>
      <tr>
        <td width="70%">
          <span class="big-font">3.0 Identifying Information & Purpose of Inspection</span>
        </td>
        <td width="30%"><span>11</span></td>
      </tr>
      <tr>
        <td width="70%">
          <span class="big-font">4.0 Ongoing Monitoring</span>
        </td>
        <td width="30%"><span>14</span></td>
      </tr>
      <tr>
        <td width="70%">
          <span class="big-font">5.0 Disclosure Regulations and Title X Requirements</span>
        </td>
        <td width="30%"><span>16</span></td>
      </tr>
      <tr>
        <td width="70%">
          <span class="big-font">6.0 Future Remodeling Precautions</span>
        </td>
        <td width="30%"><span>18</span></td>
      </tr>
      <tr>
        <td width="70%">
          <span class="big-font">7.0 Conditions & Inspection Limitations</span>
        </td>
        <td width="30%"><span>20</span></td>
      </tr>
      <tr>
        <td width="70%">
          <span class="big-font">8.0 Site Information</span>
        </td>
        <td width="30%"><span>21</span></td>
      </tr>
      <tr>
        <td width="70%">
          <span class="big-font">9.0 Lead Hazard Control Options & Recommendations</span>
        </td>
        <td width="30%"><span>18</span></td>
      </tr>
      <tr>
        <td width="70%">
          <span class="big-font">10.0 Testing Protocol</span>
        </td>
        <td width="30%"><span>20</span></td>
      </tr>
      <tr>
        <td width="70%">
          <span class="big-font">11.0 Method of Testing</span>
        </td>
        <td width="30%"><span>21</span></td>
      </tr>
    </table>

    <table class="no-border" style="text-transform: uppercase;">
      <tr>
        <td width="30%">
          <h3 style="text-decoration: underline;">Appendicies</h3>
        </td>
        <td width="70%">
        </td>
      </tr>
      <tr>
        <td width="30% vertical-align: top;">
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
    </table>
    ` + this.getFooter(100);


    
/***********************           page 3              ****************************/


    let page3 = this.getHeader(row, bc3_small_image, 3) + `

    <div style="text-transform: uppercase;">
    <h1 class="center italic" >LEAD-BASED PAINT INSPECTION/RISK ASSESSMENT REPORT</h1>
    <h3 class="center"> 1.0 Executive Summary</h3>
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
      page3 += `<p class="left">As a result of the Lead Based Paint (LBP) Inspection/risk Assessment Conducted on ${row.inspectionDate}, 
      lead-based paint/lead hazards were present at the subject property on the date of this assessment. 
      The analyitical results from this assessment, the scope of services, inspection, methodology, and results are presented below. </p>`;
    }
    else{
      page3 += `<p class="left">As a result of the Lead Based Paint (LBP) Inspection/risk Assessment Conducted on ${row.inspectionDate}, 
      lead-based paint/lead hazards were not present at the subject property on the date of this assessment. 
      The analyitical results from this assessment, the scope of services, inspection, methodology, and results are presented below </p>`;
    }

    page3 += `<h3 class="center">2.0 Identified Lead Hazards & Summary of Results</h3>`;
    if (hot.length){
      page3 += `<p class="left"><font class="text-underline bold">Paint Sampling:</font> Throughout the subject property, several of the painted components 
        indicated the presence of lead based paint (LBP) at or above the respective action level. 
        The following summary lists the specific components that tested above the action level and their respective locations:</p>`;

      page3 += `<h3 class="text-underline italic bold">Interior</h3>`;

      hot.map( h => { 
        if(h.loc == 'InsSheet')
          page3 += `<li>${h.room} - ${h.material} ${h.item} ${h.name}</li>`;
      })
    
      if(hottile.length){
        
        page3 += `Some of the tiled surfaces in the `;

        hottile.map( h => page3 += `${h.room} `)

        page3 += `also tested positive for lead. These surfaces were not painted and the lead is most likely in the glazing or the matrix of the tile itself`;
      }
    
      page3 += `<h3 class="text-underline italic bold">Exterior</h3>`;

      
      hot.map( h => { 
        if(h.loc == 'ExtSheet')
          page3 += `<li>${h.room} - ${h.material} ${h.item} ${h.name}</li>`;
      })

      page3 += `<p class="left italic">Sampling for this inspection/risk assessment was representative and any components that were not tested but similar to those components
       that tested positive for LBP should be considered and treated as lead laden.</p>`;

      page3 += `<p>The field data and results for paint sampling may be found in Appendix A</p>`;

    }
    else {
      page3 += `<p class="left"><font class="text-underline bold">Paint Sampling:</font> Throughout the subject property, none of the tested painted surfaces indicated the presence of lead based paint (LBP) at or above the respective action level.</p>`;

      
      if(hottile.length){
        page3 += `<p class="left">However, Some of the tiled surfaces in the `;
        hottile.map( h => page3 += `${h.room} `)
        page3 += `tested positive for lead. These surfaces were not painted and the lead is most likely in the glazing or the matrix of the tile itself</p>`;
      }
      
      page3 += `<p class="left"><font class="italic bold">Sampling for this inspection/risk assessment was representative.</font> The field data and results for paint sampling may be found in <span class="italic bold">Appendix D.</span></p>`;
      
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

    page3 +=  this.getFooter(100);



/***********************           page 4               ****************************/

    let page5 = this.getHeader(row, bc3_small_image, 5) + `
    <p class="left text-underline italic bold">Laboratory Information:</p>
    <p class="left nopadding nomargin">5431 Industrial Drive, Huntington Beach, CA 92649</p>
    <p class="left nopadding nomargin">Dust Wipe Analysis Protocol: EPA 3050B/7000A</p>
    <p class="left nopadding nomargin">Dust Wipe Media: Lead-Wipes ASTM E1792</p>
    <p class="left nopadding nomargin">Accreditation Program Number: DOSH ELAP No. 1406</p>

    <h3 class="center">3.0 IDENTIFYING INFORMATION & PURPOSE OF INSPECTION/RISK ASSESSMENT</h3>

    <p class="left">
    The purpose of this inspection/risk assessment is to identify and assess the presence of Lead Hazards and Lead-Based Paint (LBP) 
      present at the subject property as well as to identify the presence of deteriorated LBP and LBP that may be disturbed during planned renovations.
    </p>

    <p class="left">
    On ${this.state.inspectionDate}, Barr And Clark paint inspection and risk assessment performed an inspection/risk assessment 
    for lead-based paint at the subject property at ${row.address}. 
    As part of the assessment, a visual survey of the property was conducted, dust wipe sampling was performed on a limited number of interior surfaces, 
    and composite soil samples were collected. In addition, painted and varnished surfaces in every accessible “room equivalent” were sampled via x-ray fluorescence (XRF) 
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
    </p>
    `;


    page5 +=  this.getFooter(100);



/***********************           page 6              ****************************/



    let page6 = this.getHeader(row, bc3_small_image, 6) + `

    <h3 class="center">4.0 ONGOING MONITORING</h3>

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

    
    `;


    page6 +=  this.getFooter(100);



/***********************           page 7              ****************************/



    let page7 = this.getHeader(row, bc3_small_image, 7) + `

    <h3 class="center">5.0 DISCLOSURE REGULATIONS & TITLE X REQUIREMENTS</h3>`;

    if (hot.length){
      page7 += `<p class="left">A copy of this complete report must be provided to new lessees (tenants) and purchasers of this property under Federal law 
      (Section 1018 of Title X - 24 CFR part 35 and 40 CFR part 745) before they become obligated under a lease or sales contract. 
      The complete report must also be provided to new purchasers and it must be made available to new tenants. 
      Landlords (lessors) and sellers are also required to distribute an educational pamphlet approved by the U.S. 
      Environmental Protection Agency entitled <font class="italic bold">Protect Your Family From Lead in Your Home"</font> and include standard warning language in their leases
       or sales contracts to ensure that parents have the information they need to protect their children from lead-based paint hazards. 
       This report should be maintained and updated as a permanent maintenance record for this property.</p>`;
    }else{
      page7 += `<p class="left">The results of this inspection/risk assessment indicate that no lead in amounts greater than or equal to 1.0 mg/cm<sup>2</sup> 
      in paint was found on any building components, using the inspection protocol in Chapter 7 of the <font class="italic">HUD Guidelines for the Evaluation and Control of Lead-Based Paint Hazards 
      in Housing (2012 Revision)</font>. <font class="bold">Therefore, this dwelling qualifies for the exemption in 24 CFR part 35 and 40 CFR part 745 for target housing being leased that is 
      free of lead-based paint, as defined in the rule.</font> <font class="italic">However, some painted surfaces may contain levels of lead below 1.0 mg/cm<sup>2</sup> , 
      which could create lead dust or lead-contaminated soil hazards if the paint is turned into dust by abrasion, scraping, or sanding.</font>
       This report should be maintained as a permanent maintenance record for this property.</p>`
    }

    page7 += `<h3 class="center">6.0 FUTURE REMODELING PRECAUTIONS</h3>`;

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

    `;

    page7 +=  this.getFooter(100);


/***********************           page 8              ****************************/



    let page8 = this.getHeader(row, bc3_small_image, 8) + `

    <h3 class="center">7.0 CONDITIONS & INSPECTION LIMITATIONS</h3>`;

    
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

    page8 += `<h3 class="center">8.0 SITE INFORMATION</h3>`;

    page8 += `<p class="left">
    The subject property is a single family residence that was built circa 19??. 
    It is a one-story building that is constructed over a raised foundation. 
    The exterior walls are covered with stucco and all of the windows are aluminum-framed types.
     -OR- the windows are a combination of double-hung sash, casement, fixed and aluminum-framed types. 
     The home consists of three bedrooms, two bathrooms and an attached OR a detached garage. At the time of this inspection/risk assessment, 
     most of the painted surfaces were in good condition.
    </p>
    `;

    page8 +=  this.getFooter(100);



    content += page1 + page2 + page3 + page5 + page6 + page7 + page8;
    console.log('----state----', this.state);
    content = juice.inlineContent(content, css);
    converted = htmlDocx.asBlob(content, {orientation: 'portrait', margins: {top: 400, left : 400, right : 400, bottom: 400}});
    saveAs(converted, 'full.docx' );

}

getFooter(marginHeight) {
  return `
  <div class="footer center" style="color:#71b389;margin-top:${marginHeight}px;">
    <p class="nopadding nomargin">16531 Bolsa Chica, Suite 205 * Huntington Beach, CA 92649 * 714.894.5700</p>
    <p class="nopadding nomargin">www.barrandclark.com</p>
  </div> 
  <br clear="all" style="page-break-before:always" ></br>
  `;
}

getHeader(row, bc3_small_image, pageNumber) {
  return `
  <div class="header" style="opacity: 0.5">
      <table class="no-border">
      <tr>
        <td width="60%">
          <div class="left italic">
          <p class="nomargin nopadding">Lead-Based Paint Inspection/Risk Assessment Report</p>
          <p class="nomargin nopadding">${row.name}</p>
          <p class="nomargin nopadding">${row.address}</p>
          <p class="nomargin nopadding">Project Number: ${row.id}</p>
          </div>
        </td>
        <td style="text-align: right;" width="30%">
          ${bc3_small_image}
          <p>Page ${pageNumber} </p>
        </td>
        
      </tr>
      </table>
    </div>
  `;
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
      <span>` + (jobInfo? jobInfo.inspectionDate : '') + `</span>
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
          <div>
            Address (number, street, apartment (if applicable)
          </div>`
          + (jobInfo? jobInfo.address : '') +
        `</td>
        <td style="width:20%;">
          City
        </td>
        <td style="width:20%;">
          County
        </td>
        <td style="width:20%;">
         ZIP code
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
          <div>Name</div>` //(jobInfo? jobInfo.siteName : '')
          + (jobInfo? jobInfo.homeownerName : '') + 
        `</td>
        <td colspan="2">
          <div>Telephone number<div>`
          + (jobInfo? jobInfo.siteNumber : '') + 
        `</td>
      </tr>
      <tr>
        <td colspan="2">
          <div>
            Address [number, street, apartment (if applicable)]
          </div>` 
          + (jobInfo? jobInfo.address : '') +
        `</td>
        <td>
          <div>
            City
          </div>
          <div>
          "PROJECT_INFOCITY"
          </div>
        </td>
        <td>
          <div>
            State
          </div>
          <div>
            CA
          </div>
        </td>
        
        <td>
          <div>
          ZIP code
          </div>
          <div>
          "PROJECT_ZIP"
          </div>
        
        </td>
      </tr>
    </table>
    

    <div>
      <b>Section 5-Results of Lead Hazard Evaluation</b> (Check all that apply)
    </div>


    <div class="select-box" style="font-size:12px;">
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
          <div>Name</div>
          <div>Matthew Crochet, Jeremy Nguyen, Keith Piner</div>
        </td>
        <td colspan="2">
          <div>Telephone number</div>
          <div>714-894-5700</div>
        </td>
      </tr>
      <tr>
        <td colspan="2">
          <div>Address (number, street, apartment (if applicable)</div>
          <div>16531 Bolsa Chica, Suite 205</div>
        </td>
        <td>
          <div>City</div>
          <div>Huntington Beach</div>
        </td>
        <td>
          <div>State</div>
          <div>CA</div>
        </td>
        <td>
          <div>ZIP code</div>
          <div>92649</div>
        </td>
      </tr>
      <tr>
        <td >
          <div>CDPH certification number</div>
          <div>12   14441      25548</div>
        </td>
        <td><div>Signature</div>`
        + image1 + 
        `</td>
        <td>`
        + image2 + 
        `</td>
        <td>`
        + image3 + 
        `</td>
        <td>
          <div>Date</div>
          <div>` + (jobInfo? jobInfo.inspectionDate : '')  + `</div>
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
      <div> A. A foundation diagram or sketch of the structure indicating the specific locations of each lead hazard or presence of lead-based paint; </div>
      <div>B.  Each testing method, device, and sampling procedure used;</div>
      <div>C. All data collected, including quality control data, laboratory results, including laboratory name, address, and phone number.</div>
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
      </div>
    );
  }
}

export default withRouter(DataTable);
