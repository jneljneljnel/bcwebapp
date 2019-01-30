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
var axios = require('axios')

class Create extends Component {
  constructor(props) {
    super(props);
    this.toggle = this.toggle.bind(this);
    this.toggleFade = this.toggleFade.bind(this);
    this.getClients = this.getClients.bind(this);
    this.post = this.post.bind(this);
    this.state = {
      collapse: true,
      fadeIn: true,
      timeout: 300,
      projectName: '',
      recievedDate: '',
      inspectionDate: '',
      actionLevel: '',
      cost: '',
      clientName: '',
      phone: '',
      address: '',
      comments: '',
      dbClients: []
    };
  }
  componentDidMount(){
    this.getClients()
  }

  toggle() {
    this.setState({ collapse: !this.state.collapse });
  }

  post(){
    axios.post('/api/jobs/new', {
      name: this.state.projectName,
      recievedDate: this.state.recievedDate,
      inspectionDate: this.state.inspectionDate,
      cost: this.state.cost,
      actionLevel: this.state.actionLevel,
      clientId: this.state.clientName,
      phone: this.state.phone,
      address: this.state.address,
      comments: this.state.comments,
    })
    .then(function (response) {
      console.log(response);
      alert('sucessfully added new Job!')
    })
    .catch(function (error) {
      console.log(error);
    });
  }

  getClients(){
    axios.get('/api/clients/all').then( res => {
      this.setState({dbClients:res.data})
    })
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
                <strong>Basic Form</strong> Elements
              </CardHeader>
              <CardBody>
                <Form action="" method="post" encType="multipart/form-data" className="form-horizontal">
                  <FormGroup row>
                    <Col md="3">
                      <Label htmlFor="text-input">Project Name</Label>
                    </Col>
                    <Col xs="12" md="9">
                      <Input type="text" id="text-input" name="text-input"  onChange={(e)=>this.setState({projectName:e.target.value})}/>
                    </Col>
                  </FormGroup>
                  <FormGroup row>
                    <Col md="3">
                      <Label htmlFor="date-input">Date Recieved</Label>
                    </Col>
                    <Col xs="12" md="9">
                      <Input type="date" id="date-input" name="date-input" placeholder="date" onChange={(e)=>this.setState({recievedDate:e.target.value})}/>
                    </Col>
                  </FormGroup>
                  <FormGroup row>
                    <Col md="3">
                      <Label htmlFor="date-input">Inspection Date</Label>
                    </Col>
                    <Col xs="12" md="9">
                      <Input type="date" id="date-input" name="date-input" placeholder="date" onChange={(e)=>this.setState({inspectionDate:e.target.value})}/>
                    </Col>
                  </FormGroup>

                  <FormGroup row>
                    <Col md="3">
                      <Label htmlFor="text-input">Lead Action Level</Label>
                    </Col>
                    <Col xs="12" md="9">
                      <Input type="text" id="text-input" name="text-input" onChange={(e)=>this.setState({actionLevel:e.target.value})}/>
                    </Col>
                  </FormGroup>

                  <FormGroup row>
                    <Col md="3">
                      <Label htmlFor="text-input">Cost</Label>
                    </Col>
                    <Col xs="12" md="9">
                      <Input type="number" id="text-input" name="text-input" onChange={(e)=>this.setState({cost:e.target.value})}/>
                    </Col>
                  </FormGroup>
                  <FormGroup row>
                    <Col md="3">
                      <Label htmlFor="select">Select</Label>
                    </Col>
                    <Col xs="12" md="9">
                      <Input type="select" name="select" id="select" onChange={(e)=>this.setState({clientName:e.target.value})}>
                        <option value='0'>Please select client</option>
                        {this.state.dbClients.map( c => {
                          return <option value={c.id}>{c.name}</option>
                        })}
                      </Input>
                    </Col>
                  </FormGroup>
                  <FormGroup row>
                    <Col md="3">
                      <Label htmlFor="text-input">Phone Number</Label>
                    </Col>
                    <Col xs="12" md="9">
                      <Input type="text" id="text-input" name="text-input" onChange={(e)=>this.setState({phone:e.target.value})} />
                    </Col>
                  </FormGroup>

                  <FormGroup row>
                    <Col md="3">
                      <Label htmlFor="text-input">Client Address</Label>
                    </Col>
                    <Col xs="12" md="9">
                      <Input type="text" id="text-input" name="text-input" onChange={(e)=>this.setState({address:e.target.value})} />
                    </Col>
                  </FormGroup>
                  <FormGroup row>
                    <Col md="3">
                      <Label htmlFor="textarea-input">Text Area</Label>
                    </Col>
                    <Col xs="12" md="9">
                      <Input type="textarea" name="textarea-input" id="textarea-input" rows="9"
                             placeholder="Content..." onChange={(e)=>this.setState({comments:e.target.value})}/>
                    </Col>
                  </FormGroup>
                  </Form>
              </CardBody>
              <CardFooter>
                <Button onClick={()=> this.post()}  type="submit" size="sm" color="primary"><i className="fa fa-dot-circle-o"></i> Submit</Button>
              </CardFooter>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }
}

export default Create;
