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
  Pagination,
  PaginationItem,
  PaginationLink,
  Table
} from 'reactstrap';

import DataTable from '../Tables/DataTable/DataTable';
const axios = require('axios')

const Insrow = (props) => {
  return(<tr>
      <td>{props.sampleId|| "0"}</td>
      <td>{props.side|| "n/a"}</td>
      <td>{props.material+ ' ' + props.item}</td>
      <td>{props.room}</td>
      <td>{props.reading || '0'}</td>
      <td>{props.result || 'n/a'}</td>
      <td>{props.condition || 'n/a'}</td>
      <td>{props.commetns || 'n/a'}</td>
    </tr>)
}


class Job extends Component {
  constructor(props) {
    super(props);
    this.toggle = this.toggle.bind(this);
    this.toggleFade = this.toggleFade.bind(this);
    this.getInspections = this.getInspections.bind(this);
    this.getJobInfo= this.getJobInfo.bind(this);
    this.state = {
      data:false,
      collapse: true,
      fadeIn: true,
      timeout: 300,
      actionlevel: 0.7
    };
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
        this.setState({actionLevel:res.data[0].actionLevel})
          console.log('job', this.state.jobInfo)
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
      states.map(x => {
        //console.log(x)
        let sample = {};
        x.insSheets.map(s => {
          let room = s.name
          s.data.map(d => {
            let side = d.side
            Object.keys(d).map( obj => {
              if (obj != 'id' && obj != 'side' &&  obj != 'type' && obj != 'expanded' && obj != 'done' && obj != 'title' && obj != 'leadsTo' && obj != 'windowType'){
                let item = obj
                console.log(d[obj])
                let material = d[obj].M
                let condition = d[obj].I? 'Intact':'Deteriorated'
                let reading = d[obj].R
                //console.log(item, material, condition, reading, side, room)
                rows.push({item, material, condition, reading, side, room})
              }
            })
          })
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

  componentDidMount(){
    this.getInspections()
    this.getJobInfo()
  }

  render() {
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
              <dd className="col-sm-3">Phone</dd>
              <dt className="col-sm-9">{this.state.jobInfo? this.state.jobInfo.phone : ''}</dt>
              <dd className="col-sm-3">Action Level</dd>
              <dt className="col-sm-9">{this.state.jobInfo? this.state.jobInfo.actionLevel : ''}</dt>
              <dd className="col-sm-3">Recieved date</dd>
              <dt className="col-sm-9">{this.state.jobInfo? this.state.jobInfo.recievedDate : ''}</dt>
              <dd className="col-sm-3">Intake notes</dd>
              <dt className="col-sm-9">{this.state.jobInfo? this.state.jobInfo.comments : ''}</dt>
            </dl>
          </div>
        </div>
      </div>

        <Row>
            <Col xs="12" lg="12">
              <Card>
                <CardHeader>
                  <i className="fa fa-align-justify"></i> Inspection Samples
                </CardHeader>
                <CardBody>
                  <Table responsive>
                    <thead>
                    <tr>
                      <th>Sample</th>
                      <th>Side</th>
                      <th>Testing Combination</th>
                      <th>Room Equivalent</th>
                      <th>Lead</th>
                      <th>Results</th>
                      <th>Condition</th>
                      <th>Comments</th>
                    </tr>
                    </thead>
                    <tbody>
                    {this.state.rows ? this.state.rows.map( (x, i) => {
                      let result = x.reading > this.state.actionLevel ? 'Positive': 'Negative'
                      return <Insrow key={i} sampleId={i} side={x.side} item={x.item} material={x.material} room={x.room} reading={x.reading} result={result} condition={x.condition} Comments={'none'}   />
                    }): <tr><td>"No Inspection Data"</td></tr>}
                    </tbody>
                  </Table>
                </CardBody>
              </Card>
            </Col>

        </Row>
      </div>
    );
  }
}

export default Job;
