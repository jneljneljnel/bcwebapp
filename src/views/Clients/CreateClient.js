import React, { Component } from 'react';
import { TextMask, InputAdapter } from 'react-text-mask-hoc';

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
import { createBrowserHistory } from 'history';
import { Route , withRouter} from 'react-router-dom';
const axios = require('axios')
const history = createBrowserHistory();

class Client extends Component {
  constructor(props) {
    super(props);
    this.toggle = this.toggle.bind(this);
    this.toggleFade = this.toggleFade.bind(this);
    this.post = this.post.bind(this);
    this.getClientInfo = this.getClientInfo.bind(this);
    this.clearInputs = this.clearInputs.bind(this);
    this.state = {
      collapse: true,
      fadeIn: true,
      timeout: 300
    };
  }
  componentDidMount(){
    if(this.props.match.params.id){
      this.getClientInfo()
    }
  }

  getClientInfo(){
    axios(
      {
        url: '/api/clients/get',
        method: 'post',
        data: {
         id: this.props.match.params.id
        }
      })
      .then( res => {
        let client = res.data[0]
        console.log(client)
        this.setState({
          name:client.name,
          companyName:client.company,
          phone1:client.phone1,
          phone2:client.phone2,
          email:client.email,
          street:client.street,
          city:client.city,
          state:client.state,
          postal:client.postal,
          bname:client.bname,
          bnumber:client.bnumber,
          bemail:client.bemail,
          cname:client.cname,
          cnumber:client.cnumber,
          cemail:client.cemail
        })
      })
  }

  toggle() {
    this.setState({ collapse: !this.state.collapse });
  }

  clearInputs(){
    this.setState({
      name:'',
      companyName:'',
      phone1:'',
      phone2:'',
      email:'',
      street:'',
      city:'',
      state:'',
      postal:'',
      bname:'',
      bnumber:'',
      bemail:'',
      cname:'',
      cnumber:'',
      cemail:''
    })
    console.log(this.state.clientName)
  }

  post() {
    console.log('submit', this.props)
    console.log(this.state.name, this.state.email, this.state.phone1, this.state.street, this.state.city)
    if(this.props.match.params.id){
     axios.post('/api/clients/update', {
       id:this.props.match.params.id,
       name: this.state.name,
       company: this.state.companyName,
       phone1: this.state.phone1,
       phone2: this.state.phone2,
       email: this.state.email,
       street: this.state.street,
       city: this.state.city,
       postal: this.state.postal,
       state: this.state.state,
       bname: this.state.bname,
       bnumber: this.state.bnumber,
       bemail: this.state.bemail,
       cname: this.state.cname,
       cnumber: this.state.cnumber,
       cemail: this.state.cemail
     }).then(function (response) {
         alert('sucessfully updated!')
       })
       .catch(function (error) {
         console.log(error);
       });
       this.props.history.push('/clients')
    }
    else if(this.state.name && this.state.email && this.state.phone1 && this.state.street && this.state.city)
    {
      console.log('new')
      axios.post('/api/clients/new', {
        name: this.state.name,
        company: this.state.companyName,
        phone1: this.state.phone1,
        phone2: this.state.phone2,
        email: this.state.email,
        street: this.state.street,
        city: this.state.city,
        postal: this.state.postal,
        state: this.state.state,
        bname: this.state.bname,
        bnumber: this.state.bnumber,
        bemail: this.state.bemail,
        cname: this.state.cname,
        cnumber: this.state.cnumber,
        cemail: this.state.cemail
      })
      .then(function (response) {
        console.log(response);
        //alert('sucessfully added new client!')
        this.props.history.push('/dashboard')
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
                <Label htmlFor="name">Client Name</Label>
                <Input type="text" id="name"  value={this.state.name}  onChange={(e) => this.setState({name:e.target.value})}/>
              </FormGroup>
              <FormGroup>
                <Label htmlFor="company">Company Name</Label>
                <Input type="text" id="company"  value={this.state.companyName} onChange={(e)=>this.setState({companyName:e.target.value})}/>
              </FormGroup>

              <FormGroup>
                <Label>Primary Phone</Label>
                <InputGroup>
                  <InputGroupAddon addonType="prepend">
                    <InputGroupText><i className="fa fa-phone"></i></InputGroupText>
                  </InputGroupAddon>
                <TextMask
                    value={this.state.phone1}
                    onChange={(e)=>this.setState({phone1:e.target.value})}
                    mask={['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]}
                    Component={InputAdapter}
                    className="form-control"
                  />
                </InputGroup>
              </FormGroup>


              <FormGroup>
                <Label>Secondary Phone</Label>
                <InputGroup>
                  <InputGroupAddon addonType="prepend">
                    <InputGroupText ><i className="fa fa-phone"></i></InputGroupText>
                  </InputGroupAddon>
                  <TextMask
                    value={this.state.phone2}
                    onChange={(e)=>this.setState({phone2:e.target.value})}
                    mask={['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]}
                    Component={InputAdapter}
                    className="form-control"
                  />
                </InputGroup>
              </FormGroup>

              <FormGroup>
                <Label htmlFor="email">Email</Label>
                <Input type="text" id="email"  value={this.state.email} onChange={(e)=>this.setState({email:e.target.value})}/>
              </FormGroup>

              <FormGroup>
                <Label htmlFor="street">Street</Label>
                <Input type="text" id="street" placeholder="Enter street name" value={this.state.street} onChange={(e)=>this.setState({street:e.target.value})}/>
              </FormGroup>
              <FormGroup row className="my-0">
                <Col xs="4">
                  <FormGroup>
                    <Label htmlFor="city">City</Label>
                    <Input type="text" id="city" placeholder="Enter your city" value={this.state.city} onChange={(e)=>this.setState({city:e.target.value})} />
                  </FormGroup>
                </Col>
                <Col xs="3">
                  <FormGroup>
                    <Label htmlFor="state">State</Label>
                    <Input type="text" id="state" placeholder="Enter state" value={this.state.state}  onChange={(e)=>this.setState({state:e.target.value})} />
                  </FormGroup>
                </Col>
                <Col xs="3">
                  <FormGroup>
                    <Label htmlFor="postal-code">Postal Code</Label>
                    <Input type="text" id="postal-code" placeholder="Postal Code" value={this.state.postal} onChange={(e)=>this.setState({postal:e.target.value})} />
                  </FormGroup>
                </Col>
              </FormGroup>
              <FormGroup>
                <Label htmlFor="company">Billing Name</Label>
                <Input type="text" id="company"  value={this.state.bname} onChange={(e)=>this.setState({bname:e.target.value})}/>
              </FormGroup>

              <FormGroup>
                <Label>Billing Phone</Label>
                <InputGroup>
                  <InputGroupAddon addonType="prepend">
                    <InputGroupText><i className="fa fa-phone"></i></InputGroupText>
                  </InputGroupAddon>
                <TextMask
                    value={this.state.bnumber}
                    onChange={(e)=>this.setState({bnumber:e.target.value})}
                    mask={['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]}
                    Component={InputAdapter}
                    className="form-control"
                  />
                </InputGroup>
              </FormGroup>
              <FormGroup>
                <Label htmlFor="email">Billing Email</Label>
                <Input type="text" id="email"  value={this.state.bemail} onChange={(e)=>this.setState({bemail:e.target.value})}/>
              </FormGroup>

              <FormGroup>
                <Label htmlFor="company">Contact Name</Label>
                <Input type="text" id="company"  value={this.state.cname} onChange={(e)=>this.setState({cname:e.target.value})}/>
              </FormGroup>

              <FormGroup>
                <Label>Contact Phone</Label>
                <InputGroup>
                  <InputGroupAddon addonType="prepend">
                    <InputGroupText><i className="fa fa-phone"></i></InputGroupText>
                  </InputGroupAddon>
                <TextMask
                    value={this.state.cnumber}
                    onChange={(e)=>this.setState({cnumber:e.target.value})}
                    mask={['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]}
                    Component={InputAdapter}
                    className="form-control"
                  />
                </InputGroup>
              </FormGroup>
              <FormGroup>
                <Label htmlFor="email">Contact Email</Label>
                <Input type="text" id="email"  value={this.state.cemail} onChange={(e)=>this.setState({cemail:e.target.value})}/>
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

export default withRouter(Client);
