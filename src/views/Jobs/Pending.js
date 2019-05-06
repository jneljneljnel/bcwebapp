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
import PendingJobs from '../Tables/Pending/DataTable';
const axios = require('axios')

class Pending extends Component {
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.toggleFade = this.toggleFade.bind(this);
    this.state = {
      data: [],
      collapse: true,
      fadeIn: true,
      timeout: 300
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
    console.log('get pending')
    axios.get('/api/jobs/pending').then( res => {
      console.log(res.data)
      this.setState({data:res.data})
    })
  }

  render() {
    return (
      <div className="animated fadeIn">
        <Row>
          <Col xs="12" md="12">
            <PendingJobs name='Pending Jobs' data={this.state.data}/>
          </Col>
        </Row>
      </div>
    );
  }
}

export default Pending;
