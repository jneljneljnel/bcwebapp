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
} from 'reactstrap';
import DataTable from '../Tables/OpenJobs/DataTable';
import { createBrowserHistory } from 'history';
import { Route , withRouter} from 'react-router-dom';
const history = createBrowserHistory();
const axios = require('axios')

class Inspected extends Component {
  constructor(props) {
    super(props);
    this.toggle = this.toggle.bind(this);
    this.toggleFade = this.toggleFade.bind(this);
    this.getInspectedJobs = this.getInspectedJobs.bind(this);
    this.state = {
      collapse: true,
      fadeIn: true,
      timeout: 300
    };
  }
  componentDidMount(){
    this.getInspectedJobs()
  }

  getInspectedJobs(){
    axios.get('/api/jobs/inspected').then( res => {
      console.log('open', res.data)
      this.setState({data:res.data})
      console.log(this.state.data)
    })
  }
  toggle() {
    this.setState({ collapse: !this.state.collapse });
  }

  toggleFade() {
    this.setState((prevState) => { return { fadeIn: !prevState }});
  }

  render() {
    return (
      <div className="animated fadeIn">
        <Row>
          <Col xs="12" md="12">
            <DataTable name='Inspected Jobs' data={this.state.data}/>
          </Col>
        </Row>
      </div>
    );
  }
}

export default Inspected;
