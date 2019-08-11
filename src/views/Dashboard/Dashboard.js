import React, { Component, lazy, Suspense } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Badge,
  Button,
  ButtonDropdown,
  ButtonGroup,
  ButtonToolbar,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardTitle,
  Col,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Progress,
  Row,
  Table,
  Input,
  Label,
  FormGroup
} from 'reactstrap';
import { Link } from 'react-router-dom';
import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
import { getStyle, hexToRgba } from '@coreui/coreui-pro/dist/js/coreui-utilities'
import Calendar from '../Plugins/Calendar/Calendar';
import InspectionsToday from '../Tables/InspectionsToday/DataTable';

const Widget03 = lazy(() => import('../../views/Widgets/Widget03'));

const brandPrimary = getStyle('--primary')
const brandSuccess = getStyle('--success')
const brandInfo = getStyle('--info')
const brandWarning = getStyle('--warning')
const brandDanger = getStyle('--danger')
const axios = require('axios')
var moment = require('moment');


// Main Chart

//Random Numbers
function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

var elements = 27;
var data1 = [];
var data2 = [];
var data3 = [];

for (var i = 0; i <= elements; i++) {
  data1.push(random(50, 200));
  data2.push(random(80, 100));
  data3.push(65);
}

const mainChart = {
  labels: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
  datasets: [
    {
      label: 'My First dataset',
      backgroundColor: hexToRgba(brandInfo, 10),
      borderColor: brandInfo,
      pointHoverBackgroundColor: '#fff',
      borderWidth: 2,
      data: data1,
    },
    {
      label: 'My Second dataset',
      backgroundColor: 'transparent',
      borderColor: brandSuccess,
      pointHoverBackgroundColor: '#fff',
      borderWidth: 2,
      data: data2,
    },
    {
      label: 'My Third dataset',
      backgroundColor: 'transparent',
      borderColor: brandDanger,
      pointHoverBackgroundColor: '#fff',
      borderWidth: 1,
      borderDash: [8, 5],
      data: data3,
    },
  ],
};

const mainChartOpts = {
  tooltips: {
    enabled: false,
    custom: CustomTooltips,
    intersect: true,
    mode: 'index',
    position: 'nearest',
    callbacks: {
      labelColor: function(tooltipItem, chart) {
        return { backgroundColor: chart.data.datasets[tooltipItem.datasetIndex].borderColor }
      }
    }
  },
  maintainAspectRatio: false,
  legend: {
    display: false,
  },
  scales: {
    xAxes: [
      {
        gridLines: {
          drawOnChartArea: false,
        },
      }],
    yAxes: [
      {
        ticks: {
          beginAtZero: true,
          maxTicksLimit: 5,
          stepSize: Math.ceil(250 / 5),
          max: 250,
        },
      }],
  },
  elements: {
    point: {
      radius: 0,
      hitRadius: 10,
      hoverRadius: 4,
      hoverBorderWidth: 3,
    },
  },
};

class Dashboard extends Component {
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.onRadioBtnClick = this.onRadioBtnClick.bind(this);
    this.getJobs = this.getJobs.bind(this);
    this.formatEvents = this.formatEvents.bind(this);
    this.getInspectionsToday = this.getInspectionsToday.bind(this)
    this.filterEvents = this.filterEvents.bind(this)

    this.state = {
      dropdownOpen: false,
      radioSelected: 2,
      calRawData:[]
    };
  }

  componentDidMount(){
    this.getJobs()
    this.getInspectionsToday()
  }

  toggle() {
    this.setState({
      dropdownOpen: !this.state.dropdownOpen,
    });
  }
  getInspectionsToday(){
    axios.get('/api/jobs/today').then( res => {
        this.setState({data:res.data})
    })
  }

  formatEvents(d){
    let events = d.map( data => {
      let color = '#f8cb00';
      if(data.inspector == 1){
        color = '#4dbd74'
      }
      if(data.inspector == 2){
        color = '#f86c6b'
      }
      if(data.inspector == 3){
        color = '#20a8d8'
      }
      console.log('test',data.inspectionDate);
      console.log('DATE', moment(data.inspectionDate).format())
      let instime1 = moment(data.inspectionDate).format()
      let instime2 = moment(data.inspectionDate).add(1, 'hours').format()
      if (data.inspectionTime && data.inspectionTimeEnd){
          console.log('DATETIME', moment(data.inspectionDate+' '+data.inspectionTime).format())
          console.log('DATETIME2', moment(data.inspectionDate+' '+data.inspectionTimeEnd).format())
          instime1 =  moment(data.inspectionDate+' '+data.inspectionTime).format()
          instime2 =  moment(data.inspectionDate+' '+data.inspectionTimeEnd).format()
      }
      return {
        title: data.name || 'inspection',
        jobId: data.id,
        color:color,
        allDay: false,
        start: new Date(instime1),
        end: new Date(instime2),
        inspector: data.inspector || 0
      }
    })
    this.setState({calData:events})
    console.log(events)
  }

  getJobs() {
    axios.get('/api/jobs/all').then( res => {
      this.setState({calRawData:res.data})
      this.formatEvents(res.data)
    })
  }

  onRadioBtnClick(radioSelected) {
    this.setState({
      radioSelected: radioSelected,
    });
  }

  filterEvents(e){
    if( e.target.value == 4){
      console.log("default")
      let newCalData = this.formatEvents(this.state.calRawData)
    }
    else{
      let filteredData = this.state.calRawData.filter( d => d.inspector == e.target.value )
      let newCalData = this.formatEvents(filteredData)
    }
  }

  loading = () => <div className="animated fadeIn pt-1 text-center">Loading...</div>

  render() {
    return (
      <div className="animated fadeIn">

        <Row>
         <Col xs="12" sm="12" lg="2">
           <Card>
             <CardHeader>
               <strong>Filter by Inspector</strong>
             </CardHeader>
               <CardBody>
                 <FormGroup row>
                   <Col lg="6">
                     <FormGroup check inline>
                       <Input className="form-check-input" type="radio" id="inline-radio1" name="inline-radios" value="1" onChange={this.filterEvents}/>
                       <Label className="form-check-label" check htmlFor="inline-radio1">Matt</Label>
                     </FormGroup>
                     <FormGroup check inline>
                       <Input className="form-check-input" type="radio" id="inline-radio2" name="inline-radios" value="2" onChange={this.filterEvents}/>
                       <Label className="form-check-label" check htmlFor="inline-radio2">Jeremy</Label>
                     </FormGroup>
                     <FormGroup check inline>
                       <Input className="form-check-input" type="radio" id="inline-radio3" name="inline-radios" value="3" onChange={this.filterEvents}/>
                       <Label className="form-check-label" check htmlFor="inline-radio3">Keith</Label>
                     </FormGroup>
                     <FormGroup check inline>
                       <Input className="form-check-input" type="radio" id="inline-radio4" name="inline-radios" value="4" onChange={this.filterEvents}/>
                       <Label className="form-check-label" check htmlFor="inline-radio4">All</Label>
                     </FormGroup>
                   </Col>
                 </FormGroup>
               </CardBody>
            </Card>
         </Col>
          <Col xs="12" sm="12" lg="10">
            <Card>
              <Calendar events={this.state.calData}/>
            </Card>
          </Col>
        </Row>


        <Row>
          <Col>
          <InspectionsToday name='Inspections Today' data={this.state.data}/>
          </Col>
        </Row>
      </div>
    );
  }
}

export default Dashboard;
