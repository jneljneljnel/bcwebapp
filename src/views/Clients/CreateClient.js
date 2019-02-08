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
import DataTable from '../Tables/DataTable/DataTable';
var axios = require('axios')

class Client extends Component {
  constructor(props) {
    super(props);
    this.toggle = this.toggle.bind(this);
    this.toggleFade = this.toggleFade.bind(this);
    this.post = this.post.bind(this);
    this.clearInputs = this.clearInputs.bind(this);
    this.state = {
      collapse: true,
      fadeIn: true,
      timeout: 300
    };
  }

  toggle() {
    this.setState({ collapse: !this.state.collapse });
  }

  clearInputs(){
    this.setState({
      clientName:'',
      companyName:'',
      phone1:'',
      phone2:'',
      email:'',
      street:'',
      city:'',
      postal:'',
      country:''
    })
    console.log(this.state.clientName)
  }

  post() {
    console.log('submit')
    if(this.state.clientName && this.state.email)
    {
      axios.post('/api/clients/new', {
        name: this.state.clientName,
        company: this.state.companyName,
        phone1: this.state.phone1,
        phone2: this.state.phone2,
        email: this.state.email,
        street: this.state.street,
        city: this.state.city,
        postal: this.state.postal,
        country: this.state.country,
      })
      .then(function (response) {
        console.log(response);
        alert('sucessfully added new client!')
      })
      .catch(function (error) {
        console.log(error);
      });
      this.clearInputs()
    }
  }

  toggleFade() {
    this.setState((prevState) => { return { fadeIn: !prevState }});
  }

  render() {

    return (
      <div className="animated fadeIn">
        <Row>
          <Col xs="12" md="12">
          <Card>
            <CardHeader>
              <strong>New Client</strong>
            </CardHeader>
            <CardBody>
              <FormGroup>
                <Label htmlFor="company">Client Name</Label>
                <Input type="text" id="company" placeholder="Enter your company name" value={this.state.clientName}  onChange={(e) => this.setState({clientName:e.target.value})}/>
              </FormGroup>
              <FormGroup>
                <Label htmlFor="company">Company Name</Label>
                <Input type="text" id="company" placeholder="Enter your company name"   onChange={(e)=>this.setState({companyName:e.target.value})}/>
              </FormGroup>

              <FormGroup>
                <Label htmlFor="company">Primary Phone</Label>
                <Input type="text" id="company" placeholder="Enter your company name"   onChange={(e)=>this.setState({phone1:e.target.value})}/>
              </FormGroup>
              <FormGroup>
                <Label htmlFor="company">Secondary Phone</Label>
                <Input type="text" id="company" placeholder="Enter your company name"   onChange={(e)=>this.setState({phone2:e.target.value})}/>
              </FormGroup>
              <FormGroup>
                <Label htmlFor="company">Email Name</Label>
                <Input type="text" id="company" placeholder="Enter your company name" value={this.state.email} onChange={(e)=>this.setState({email:e.target.value})}/>
              </FormGroup>

              <FormGroup>
                <Label htmlFor="street">Street</Label>
                <Input type="text" id="street" placeholder="Enter street name" onChange={(e)=>this.setState({street:e.target.value})}/>
              </FormGroup>
              <FormGroup row className="my-0">
                <Col xs="8">
                  <FormGroup>
                    <Label htmlFor="city">City</Label>
                    <Input type="text" id="city" placeholder="Enter your city" onChange={(e)=>this.setState({city:e.target.value})} />
                  </FormGroup>
                </Col>
                <Col xs="4">
                  <FormGroup>
                    <Label htmlFor="postal-code">Postal Code</Label>
                    <Input type="text" id="postal-code" placeholder="Postal Code" onChange={(e)=>this.setState({postal:e.target.value})} />
                  </FormGroup>
                </Col>
              </FormGroup>
              <FormGroup>
                <Label htmlFor="country">Country</Label>
                <Input type="text" id="country" placeholder="Country name" onChange={(e)=>this.setState({country:e.target.value})}/>
              </FormGroup>
            </CardBody>
            <CardFooter>
              <Button onClick={()=> this.post()} type="submit" size="sm" color="primary"><i className="fa fa-dot-circle-o"></i> Submit</Button>
            </CardFooter>
          </Card>
          </Col>
        </Row>
      </div>
    );
  }
}

export default Client;
