import React, { Component } from 'react';
import { createBrowserHistory } from 'history';
import { Route , withRouter} from 'react-router-dom';
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
const history = createBrowserHistory();

class Create extends Component {
  constructor(props) {
    super(props);
    this.toggle = this.toggle.bind(this);
    this.toggleFade = this.toggleFade.bind(this);
    this.getInspectors = this.getInspectors.bind(this);
    this.getClients = this.getClients.bind(this);
    this.getJobInfo = this.getJobInfo.bind(this)
    this.post = this.post.bind(this);
    this.state = {
      collapse: true,
      fadeIn: true,
      timeout: 300,
      projectName: '',
      recievedDate: '',
      scheduledDate:'',
      homeownerName: '',
      homeownerNumber: '',
      appointmetPerson: '',
      billingName: '',
      siteName:'',
      siteNumber:'',
      inspectionDate: '',
      actionLevel: '',
      cost: '',
      clientName: '',
      phone: '',
      address: '',
      comments: '',
      dbClients: [],
      inspectors:[]
    };
  }
  componentDidMount(){
    const { id } = this.props.match.params
    this.getClients()
    this.getInspectors()
    if(id){
        this.getJobInfo(id)
    }
  }

  toggle() {
    this.setState({ collapse: !this.state.collapse });
  }

  post(){
    const { id } = this.props.match.params
    if(id){
      console.log('CALLED UPDATE')
      axios.post('/api/jobs/update', {
        id:id,
        name: this.state.name,
        clientId: this.state.clientName,
        recievedDate: this.state.recievedDate,
        scheduledDate: this.state.scheduledDate,
        inspectionDate: this.state.inspectionDate,
        homeownerName: this.state.homeownerName,
        homeownerNumber: this.state.homeownerNumber,
        address: this.state.address,
        siteName:this.state.siteName,
        siteNumber:this.state.siteNumber,
        appointmetPerson: this.state.appointmetPerson,
        billingName: this.state.billingName,
        inspectorId: this.state.inspectorId,
        comments: this.state.comments,
        actionLevel: this.state.actionLevel,
        cost: this.state.cost
      })
      .then(function (response) {
        console.log(response);
        alert('sucessfully updated Job!')
        this.props.history.push('/dashboard')
      })
      .catch(function (error) {
        console.log(error);
      });
    }
    else{
      axios.post('/api/jobs/new', {
        name: this.state.name,
        clientId: this.state.clientName,
        recievedDate: this.state.recievedDate,
        scheduledDate: this.state.scheduledDate,
        inspectionDate: this.state.inspectionDate,
        homeownerName: this.state.homeownerName,
        homeownerNumber: this.state.homeownerNumber,
        address: this.state.address,
        siteName:this.state.siteName,
        siteNumber:this.state.siteNumber,
        appointmetPerson: this.state.appointmetPerson,
        billingName: this.state.billingName,
        inspectorId: this.state.inspectorId,
        comments: this.state.comments,
        actionLevel: this.state.actionLevel,
        cost: this.state.cost


      })
      .then(function (response) {
        console.log(response);
        alert('sucessfully added new Job!')
        this.props.history.push('/dashboard')
      })
      .catch(function (error) {
        console.log(error);
      });
    }
  }

  getClients(){
    axios.get('/api/clients/all').then( res => {
      this.setState({dbClients:res.data})
    })
  }

  getInspectors(){
    axios.get('/api/jobs/inspectors').then( res => {
      console.log('INS',res)
      this.setState({inspectors:res.data})
    })
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
          this.setState({name:res.data[0].name})
          this.setState({clientId:res.data[0].clientId})
          this.setState({recievedDate:res.data[0].recievedDate})
          this.setState({scheduledDate:res.data[0].scheduledDate})
          this.setState({inspectionDate:res.data[0].inspectionDate})
          this.setState({homeownerName:res.data[0].homeownerName})
          this.setState({homeownerNumber:res.data[0].homeownerNumber})
          this.setState({address:res.data[0].address})
          this.setState({siteName:res.data[0].siteName})
          this.setState({siteNumber:res.data[0].siteNumber})
          this.setState({appointmetPerson:res.data[0].appointmetPerson})
          this.setState({billingName:res.data[0].billingName})
          this.setState({inspectorId:res.data[0].inspector})
          this.setState({actionLevel:res.data[0].actionLevel})
          this.setState({comments:res.data[0].comments})
          this.setState({cost:res.data[0].cost})
            console.log('job', this.state.jobInfo)
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
                      <Label htmlFor="text-input">Job Name</Label>
                    </Col>
                    <Col xs="12" md="9">
                      <Input type="text" id="text-input" name="text-input" value={this.state.name} onChange={(e)=>this.setState({name:e.target.value})}/>
                    </Col>
                  </FormGroup>
                  <FormGroup row>
                    <Col md="3">
                      <Label htmlFor="select">Client</Label>
                    </Col>
                    <Col xs="12" md="9">
                      <Input type="select" name="select" id="select"  onChange={(e)=>this.setState({clientName:e.target.value})}>
                        <option value='0'>Please select client</option>
                        {this.state.dbClients.map( c => {
                          if(c.id == this.state.clientId){
                            return <option value={c.id} selected="selected">{c.name}</option>
                          }
                          else{
                            return <option value={c.id}>{c.name}</option>
                          }
                        })}
                      </Input>
                    </Col>
                  </FormGroup>
                  <FormGroup row>
                    <Col md="3">
                      <Label htmlFor="date-input">Date Recieved</Label>
                    </Col>
                    <Col xs="12" md="9">
                      <Input type="date" id="date-input" name="date-input"  value={this.state.recievedDate} placeholder="date" onChange={(e)=>this.setState({recievedDate:e.target.value})}/>
                    </Col>
                  </FormGroup>
                  <FormGroup row>
                    <Col md="3">
                      <Label htmlFor="date-input">Date Scheduled</Label>
                    </Col>
                    <Col xs="12" md="9">
                      <Input type="date" id="date-input" name="date-input"  value={this.state.scheduledDate} placeholder="date" onChange={(e)=>this.setState({scheduledDate:e.target.value})}/>
                    </Col>
                  </FormGroup>
                  <FormGroup row>
                    <Col md="3">
                      <Label htmlFor="date-input">Inspection Date</Label>
                    </Col>
                    <Col xs="12" md="9">
                      <Input type="date" id="date-input" name="date-input" placeholder="date" value={this.state.inspectionDate} onChange={(e)=>this.setState({inspectionDate:e.target.value})}/>
                    </Col>
                  </FormGroup>
                  <FormGroup row>
                    <Col md="3">
                      <Label htmlFor="text-input">Homeowner Name</Label>
                    </Col>
                    <Col xs="12" md="9">
                      <Input type="text" id="text-input" name="text-input" value={this.state.homeownerName} onChange={(e)=>this.setState({homeownerName:e.target.value})}/>
                    </Col>
                  </FormGroup>
                  <FormGroup row>
                    <Col md="3">
                      <Label htmlFor="text-input">Homeowner Number</Label>
                    </Col>
                    <Col xs="12" md="9">
                      <Input type="text" id="text-input" name="text-input" value={this.state.homeownerNumber} onChange={(e)=>this.setState({homeownerNumber:e.target.value})}/>
                    </Col>
                  </FormGroup>
                  <FormGroup row>
                    <Col md="3">
                      <Label htmlFor="text-input">Inspection Address</Label>
                    </Col>
                    <Col xs="12" md="9">
                      <Input type="text" id="text-input" name="text-input" value={this.state.address} onChange={(e)=>this.setState({address:e.target.value})} />
                    </Col>
                  </FormGroup>
                  <FormGroup row>
                    <Col md="3">
                      <Label htmlFor="text-input">Site Contact Name</Label>
                    </Col>
                    <Col xs="12" md="9">
                      <Input type="text" id="text-input" name="text-input" value={this.state.siteName} onChange={(e)=>this.setState({siteName:e.target.value})}/>
                    </Col>
                  </FormGroup>
                  <FormGroup row>
                    <Col md="3">
                      <Label htmlFor="text-input">Site Contact Number</Label>
                    </Col>
                    <Col xs="12" md="9">
                      <Input type="phone" id="text-input" name="text-input" value={this.state.siteNumber} onChange={(e)=>this.setState({siteNumber:e.target.value})}/>
                    </Col>
                  </FormGroup>
                  <FormGroup row>
                    <Col md="3">
                      <Label htmlFor="text-input">Name of Person who set Appointmet</Label>
                    </Col>
                    <Col xs="12" md="9">
                      <Input type="text" id="text-input" name="text-input" value={this.state.appointmetPerson} onChange={(e)=>this.setState({appointmetPerson:e.target.value})}/>
                    </Col>
                  </FormGroup>
                  <FormGroup row>
                    <Col md="3">
                      <Label htmlFor="text-input">Billing Name</Label>
                    </Col>
                    <Col xs="12" md="9">
                      <Input type="text" id="text-input" name="text-input" value={this.state.billingName} onChange={(e)=>this.setState({billingName:e.target.value})}/>
                    </Col>
                  </FormGroup>
                  <FormGroup row>
                    <Col md="3">
                      <Label htmlFor="select">Inspector</Label>
                    </Col>
                    <Col xs="12" md="9">
                      <Input type="select" name="select" id="select"  onChange={(e)=>this.setState({inspectorId:e.target.value})}>
                        <option value='0'>Please select an Inspector</option>
                        {this.state.inspectors.map( c => {
                          if(c.id == this.state.inspectorId){
                            return <option value={c.id} selected="selected">{c.name}</option>
                          }
                          else{
                            return <option value={c.id}>{c.name}</option>
                          }
                        })}
                      </Input>
                    </Col>
                  </FormGroup>
                  <FormGroup row>
                    <Col md="3">
                      <Label htmlFor="textarea-input">Comments/Notes</Label>
                    </Col>
                    <Col xs="12" md="9">
                      <Input type="textarea" name="textarea-input" id="textarea-input" rows="9"
                             placeholder="Content..." value={this.state.comments} onChange={(e)=>this.setState({comments:e.target.value})}/>
                    </Col>
                  </FormGroup>
                  <FormGroup row>
                    <Col md="3">
                      <Label htmlFor="text-input">Lead Action Level</Label>
                    </Col>
                    <Col xs="12" md="9">
                      <Input type="text" id="text-input" name="text-input" value={this.state.actionLevel} onChange={(e)=>this.setState({actionLevel:e.target.value})}/>
                    </Col>
                  </FormGroup>

                  <FormGroup row>
                    <Col md="3">
                      <Label htmlFor="text-input">Cost</Label>
                    </Col>
                    <Col xs="12" md="9">
                      <Input type="number" id="text-input" name="text-input" value={this.state.cost} onChange={(e)=>this.setState({cost:e.target.value})}/>
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

export default withRouter(Create);
