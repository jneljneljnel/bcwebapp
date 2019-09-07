import React, { Component } from 'react';
import Autocomplete from 'react-autocomplete'
import { createBrowserHistory } from 'history';
import { Route , withRouter} from 'react-router-dom';
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
    this.sortStates = this.sortStates.bind(this)
    this.matchStateToTerm = this.matchStateToTerm.bind(this)
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
      street:'',
      city:'',
      state:'',
      county:'',
      postal:'',
      comments: '',
      sqft: '',
      numbeds: '',
      numbaths: '',
      early: 0,
      dogs: 0,
      goodogs: '',
      dbClients: [],
      inspectors:[],
      value:'',
      type: 0,
      gates:0,
      cod:0,
      numdust:'',
      numsoil:'',
      numacm:'',
      parking:'',
      cname:'',
      cphone:'',
      contact:'',
      spec:0,
      jobtype:'',
      inspectionTime:'',
      inspectionTimeEnd:''
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

  matchStateToTerm(state, value) {
    if(state && value){
      return (
        state.name.toLowerCase().indexOf(value.toLowerCase()) !== -1 || state.company.toLowerCase().indexOf(value.toLowerCase()) !== -1
      )
    }
  }

  sortStates(a, b, value) {
    const aLower = a.name.toLowerCase()
    const bLower = b.name.toLowerCase()
    const valueLower = value.toLowerCase()
    const queryPosA = aLower.indexOf(valueLower)
    const queryPosB = bLower.indexOf(valueLower)
    if (queryPosA !== queryPosB) {
      return queryPosA - queryPosB
    }
    return aLower < bLower ? -1 : 1
  }

  toggle() {
    this.setState({ collapse: !this.state.collapse });
  }

  post(){
    const { id } = this.props.match.params
    const clientId = this.state.clientId
    const actionLevel = this.state.actionLevel
    if(!clientId){
      alert('no client ID selected')
      return
    }
    if(!actionLevel){
      alert('no Action Level entered')
      return
    }
    if(id){
      console.log('CALLED UPDATE')
      axios.post('/api/jobs/update', {
        id:id,
        name: this.state.name,
        clientId: this.state.clientId,
        recievedDate: this.state.recievedDate,
        scheduledDate: this.state.scheduledDate,
        inspectionDate: this.state.inspectionDate,
        homeownerName: this.state.homeownerName,
        homeownerNumber: this.state.homeownerNumber,
        address: this.state.address,
        street:this.state.street,
        city:this.state.city,
        state:this.state.state,
        county:this.state.county,
        postal:this.state.postal,
        siteName:this.state.siteName,
        siteNumber:this.state.siteNumber,
        appointmetPerson: this.state.appointmetPerson,
        billingName: this.state.billingName,
        inspectorId: this.state.inspectorId,
        comments: this.state.comments,
        actionLevel: this.state.actionLevel,
        type: this.state.type,
        cost: this.state.cost,
        numbeds: this.state.numbeds,
        numbaths: this.state.numbaths,
        sqft: this.state.sqft,
        early: this.state.early,
        dogs: this.state.dogs,
        gooddogs: this.state.gooddogs,
        gates:this.state.gates,
        cod:this.state.cod,
        numdust:this.state.numdust,
        numsoil:this.state.numsoil,
        numacm:this.state.numacm,
        parking:this.state.parking,
        cname:this.state.cname,
        cphone:this.state.cphone,
        contact:this.state.contact,
        spec:this.state.spec,
        jobtype:this.state.jobtype,
        inspectionTime:this.state.inspectionTime,
        inspectionTimeEnd:this.state.inspectionTimeEnd
      })
      .then(function (response) {
        console.log(response);
        alert('sucessfully updated Job!')
      })
      .catch(function (error) {
        console.log(error);
      });
      this.props.history.push('/jobs/'+id)
    }
    else{
      axios.post('/api/jobs/new', {
        name: this.state.name,
        clientId: this.state.clientId,
        recievedDate: this.state.recievedDate,
        scheduledDate: this.state.scheduledDate,
        inspectionDate: this.state.inspectionDate,
        homeownerName: this.state.homeownerName,
        homeownerNumber: this.state.homeownerNumber,
        address: this.state.address,
        street:this.state.street,
        city:this.state.city,
        state:this.state.state,
        county:this.state.county,
        postal:this.state.postal,
        siteName:this.state.siteName,
        siteNumber:this.state.siteNumber,
        appointmetPerson: this.state.appointmetPerson,
        billingName: this.state.billingName,
        inspectorId: this.state.inspectorId,
        comments: this.state.comments,
        actionLevel: this.state.actionLevel,
        type: this.state.type,
        cost: this.state.cost,
        numbeds: this.state.numbeds,
        numbaths: this.state.numbaths,
        sqft: this.state.sqft,
        early: this.state.early,
        dogs: this.state.dogs,
        gooddogs: this.state.gooddogs,
        gates:this.state.gates,
        cod:this.state.cod,
        numdust:this.state.numdust,
        numsoil:this.state.numsoil,
        numacm:this.state.numacm,
        parking:this.state.parking,
        cname:this.state.cname,
        cphone:this.state.cphone,
        contact:this.state.contact,
        spec:this.state.spec,
        jobtype:this.state.jobtype,
        inspectionTime:this.state.inspectionTime,
        inspectionTimeEnd:this.state.inspectionTimeEnd
      })
      .then(function (response) {
        console.log(response);
        alert('sucessfully added new Job!')

      })
      .catch(function (error) {
        console.log(error);
      });
        this.props.history.push('/dashboard')
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
          this.setState({street:res.data[0].street})
          this.setState({city:res.data[0].city})
          this.setState({state:res.data[0].state})
          this.setState({county:res.data[0].county})
          this.setState({postal:res.data[0].postal})
          this.setState({siteName:res.data[0].siteName})
          this.setState({siteNumber:res.data[0].siteNumber})
          this.setState({appointmetPerson:res.data[0].appointmetPerson})
          this.setState({billingName:res.data[0].billingName})
          this.setState({inspectorId:res.data[0].inspector})
          this.setState({actionLevel:res.data[0].actionLevel})
          this.setState({type:res.data[0].type})
          this.setState({comments:res.data[0].comments})
          this.setState({cost:res.data[0].cost})
          this.setState({numbaths:res.data[0].numbaths})
          this.setState({numbeds:res.data[0].numbeds})
          this.setState({sqft:res.data[0].sqft})
          this.setState({early:res.data[0].early})
          this.setState({dogs:res.data[0].dogs})
          this.setState({gooddogs:res.data[0].gooddogs})
          this.setState({gates:res.data[0].gates})
          this.setState({cod:res.data[0].cod})
          this.setState({numdust:res.data[0].numdust})
          this.setState({numsoil:res.data[0].numsoil})
          this.setState({numacm:res.data[0].numacm})
          this.setState({parking:res.data[0].parking})
          this.setState({cname:res.data[0].cname})
          this.setState({cphone:res.data[0].cphone})
          this.setState({contact:res.data[0].contact})
          this.setState({spec:res.data[0].spec})
          this.setState({jobtype:res.data[0].jobtype})
          this.setState({inspectionTime:res.data[0].inspectionTime})
          this.setState({inspectionTimeEnd:res.data[0].inspectionTimeEnd})
            console.log('res', res.data[0])
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

                  <FormGroup row style={{"zIndex":"100"}}>
                    <Col md="3">
                      <Label htmlFor="select">Client</Label>
                    </Col>
                    <Col xs="12" md="9">
                    <Autocomplete

                    getItemValue={(item) => item.name}
                    items={this.state.dbClients}
                    shouldItemRender={this.matchStateToTerm}
                    sortItems={this.sortStates}
                    renderItem={(item, isHighlighted) =>
                    <div style={{ background: isHighlighted ? 'lightgray' : 'white' }}>
                    {item.name}
                    </div>
                    }
                    value={this.state.clientName}
                    onChange={(e, value) => {
                      this.setState({clientName:value})
                    }}
                    onSelect={(value, item) =>  {
                      this.setState({clientName:value, clientId:item.id})}
                    }
                    />
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
                      <Label htmlFor="date-input">Arrival window start</Label>
                    </Col>
                    <Col xs="12" md="9">
                      <Input type="time" name="time-input" placeholder="time" value={this.state.inspectionTime} onChange={(e)=>this.setState({inspectionTime:e.target.value})}/>
                    </Col>
                  </FormGroup>
                  <FormGroup row>
                    <Col md="3">
                      <Label htmlFor="date-input">Arrival window end</Label>
                    </Col>
                    <Col xs="12" md="9">
                      <Input type="time" name="time-input" placeholder="time" value={this.state.inspectionTimeEnd} onChange={(e)=>this.setState({inspectionTimeEnd:e.target.value})}/>
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
                                    <Label>Homeowner Number</Label>
                                  </Col>
                                  <Col xs="12" md="9">
                                  <InputGroup>
                                    <InputGroupAddon addonType="prepend">
                                      <InputGroupText ><i className="fa fa-phone"></i></InputGroupText>
                                    </InputGroupAddon>
                                    <TextMask
                                      value={this.state.homeownerNumber}
                                      onChange={(e)=>this.setState({homeownerNumber:e.target.value})}
                                      mask={['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]}
                                      Component={InputAdapter}
                                      className="form-control"
                                    />
                                  </InputGroup>
                                  </Col>
                                </FormGroup>
                                <FormGroup>
                                  <Label htmlFor="street">Street</Label>
                                  <Input type="text" id="street"  value={this.state.street} onChange={(e)=>this.setState({street:e.target.value})}/>
                                </FormGroup>
                                <FormGroup row className="my-0">
                                  <Col xs="3">
                                    <FormGroup>
                                      <Label htmlFor="city">City</Label>
                                      <Input type="text" id="city"  value={this.state.city} onChange={(e)=>this.setState({city:e.target.value})} />
                                    </FormGroup>
                                  </Col>
                                  <Col xs="3">
                                    <FormGroup>
                                      <Label htmlFor="state">State</Label>
                                      <Input type="text" id="state" value={this.state.state}  onChange={(e)=>this.setState({state:e.target.value})} />
                                    </FormGroup>
                                  </Col>
                                  <Col xs="3">
                                    <FormGroup>
                                      <Label htmlFor="state">County</Label>
                                      <Input type="text" id="state" value={this.state.county}  onChange={(e)=>this.setState({county:e.target.value})} />
                                    </FormGroup>
                                  </Col>
                                  <Col xs="3">
                                    <FormGroup>
                                      <Label htmlFor="postal-code">Postal Code</Label>
                                      <Input type="text" id="postal-code" value={this.state.postal} onChange={(e)=>this.setState({postal:e.target.value})} />
                                    </FormGroup>
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
                                  <Label>Site Contact Number</Label>
                                  </Col>
                                  <Col xs="12" md="9">
                                  <InputGroup>
                                    <InputGroupAddon addonType="prepend">
                                      <InputGroupText ><i className="fa fa-phone"></i></InputGroupText>
                                    </InputGroupAddon>
                                    <TextMask
                                      value={this.state.siteNumber}
                                      onChange={(e)=>this.setState({siteNumber:e.target.value})}
                                      mask={['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]}
                                      Component={InputAdapter}
                                      className="form-control"
                                    />
                                  </InputGroup>
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
                      <Label htmlFor="select">Type of Lead Inspection</Label>
                    </Col>
                    <Col xs="12" md="9">
                      <Input id="type" value={this.state.type} onChange={(e)=> {this.setState({type:e.target.value})}} type="select" name="type">
                        <option value="0">Please select</option>
                        <option value="1">Limited</option>
                        <option value="2">Comprehensive</option>
                        <option value="3">Windows and Doors</option>
                      </Input>
                    </Col>
                  </FormGroup>
                  <FormGroup row>
                    <Col md="3">
                      <Label htmlFor="text-input">Type of Job</Label>
                    </Col>
                    <Col xs="12" md="9">
                      <Input type="text" id="text-input" name="text-input" value={this.state.jobtype} onChange={(e)=>this.setState({jobtype:e.target.value})}/>
                    </Col>
                  </FormGroup>
                  <FormGroup row>
                    <Col md="3">
                      <Label htmlFor="text-input">Number of Beds</Label>
                    </Col>
                    <Col xs="12" md="9">
                      <Input type="text" id="text-input" name="text-input" value={this.state.numbeds} onChange={(e)=>this.setState({numbeds:e.target.value})}/>
                    </Col>
                  </FormGroup>
                  <FormGroup row>
                    <Col md="3">
                      <Label htmlFor="text-input">Number of Baths</Label>
                    </Col>
                    <Col xs="12" md="9">
                      <Input type="text" id="text-input" name="text-input" value={this.state.numbaths} onChange={(e)=>this.setState({numbaths:e.target.value})}/>
                    </Col>
                  </FormGroup>
                  <FormGroup row>
                    <Col md="3">
                      <Label htmlFor="text-input">Square Footage </Label>
                    </Col>
                    <Col xs="12" md="9">
                      <Input type="text" id="text-input" name="text-input" value={this.state.sqft} onChange={(e)=>this.setState({sqft:e.target.value})}/>
                    </Col>
                  </FormGroup>
                  <FormGroup row>
                    <Col md="3">
                      <Label htmlFor="text-input">Arrive early?</Label>
                    </Col>
                    <Col xs="12" md="9">
                      <Input type="checkbox" id="text-input" name="text-input" checked={this.state.early} onChange={(e)=>this.setState({early:e.target.checked? 1: 0})}/>
                    </Col>
                  </FormGroup>
                  <FormGroup row>
                    <Col md="3">
                      <Label htmlFor="text-input">If we arrive early, are gates unlocked?</Label>
                    </Col>
                    <Col xs="12" md="9">
                      <Input type="checkbox" id="text-input" name="text-input" checked={this.state.gates} onChange={(e)=>this.setState({gates:e.target.checked? 1: 0})}/>
                    </Col>
                  </FormGroup>
                  <FormGroup row>
                    <Col md="3">
                      <Label htmlFor="text-input">Are dogs present?</Label>
                    </Col>
                    <Col xs="12" md="9">
                      <Input type="checkbox" id="text-input" name="text-input" checked={this.state.dogs} onChange={(e)=>this.setState({dogs:e.target.checked? 1: 0 })}/>
                    </Col>
                  </FormGroup>
                  <FormGroup row>
                    <Col md="3">
                      <Label htmlFor="text-input">If yes, are they friendly?</Label>
                    </Col>
                    <Col xs="12" md="9">
                      <Input type="text" id="text-input" name="text-input" value={this.state.gooddogs} onChange={(e)=>this.setState({gooddogs:e.target.value})}/>
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
                  <FormGroup row>
                    <Col md="3">
                      <Label htmlFor="text-input">COD</Label>
                    </Col>
                    <Col xs="12" md="9">
                      <Input type="checkbox" id="text-input" name="text-input" checked={this.state.cod} onChange={(e)=>this.setState({cod:e.target.checked? 1: 0})}/>
                    </Col>
                  </FormGroup>
                  <FormGroup row>
                    <Col md="3">
                      <Label htmlFor="text-input">Number of Dust Samples</Label>
                    </Col>
                    <Col xs="12" md="9">
                      <Input type="number" id="text-input" name="text-input" value={this.state.numdust} onChange={(e)=>this.setState({numdust:e.target.value})}/>
                    </Col>
                  </FormGroup>
                  <FormGroup row>
                    <Col md="3">
                      <Label htmlFor="text-input">Number of Soil Samples</Label>
                    </Col>
                    <Col xs="12" md="9">
                      <Input type="number" id="text-input" name="text-input" value={this.state.numsoil} onChange={(e)=>this.setState({numsoil:e.target.value})}/>
                    </Col>
                  </FormGroup>
                  <FormGroup row>
                    <Col md="3">
                      <Label htmlFor="text-input">Number of ACM</Label>
                    </Col>
                    <Col xs="12" md="9">
                      <Input type="number" id="text-input" name="text-input" value={this.state.numacm} onChange={(e)=>this.setState({numacm:e.target.value})}/>
                    </Col>
                  </FormGroup>
                  <FormGroup row>
                    <Col md="3">
                      <Label htmlFor="text-input">Any Special parking Requirements? </Label>
                    </Col>
                    <Col xs="12" md="9">
                      <Input type="text" id="text-input" name="text-input" value={this.state.parking} onChange={(e)=>this.setState({parking:e.target.value})}/>
                    </Col>
                  </FormGroup>
                  <FormGroup row>
                    <Col md="3">
                      <Label htmlFor="text-input">Abatement Contractor Name</Label>
                    </Col>
                    <Col xs="12" md="9">
                      <Input type="text" id="text-input" name="text-input" value={this.state.cname} onChange={(e)=>this.setState({cname:e.target.value})}/>
                    </Col>
                  </FormGroup>
                  <FormGroup row>
                    <Col md="3">
                    <Label>Abatement Contractor Phone</Label>
                    </Col>
                    <Col xs="12" md="9">
                    <InputGroup>
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText ><i className="fa fa-phone"></i></InputGroupText>
                      </InputGroupAddon>
                      <TextMask
                        value={this.state.cphone}
                        onChange={(e)=>this.setState({cphone:e.target.value})}
                        mask={['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]}
                        Component={InputAdapter}
                        className="form-control"
                      />
                    </InputGroup>
                    </Col>
                  </FormGroup>
                  <FormGroup row>
                    <Col md="3">
                      <Label htmlFor="text-input">Contact Person </Label>
                    </Col>
                    <Col xs="12" md="9">
                      <Input type="text" id="text-input" name="text-input" value={this.state.contact} onChange={(e)=>this.setState({contact:e.target.value})}/>
                    </Col>
                  </FormGroup>
                  <FormGroup row>
                    <Col md="3">
                      <Label htmlFor="text-input">Abatement Spec or SOW Provided?</Label>
                    </Col>
                    <Col xs="12" md="9">
                      <Input type="checkbox" id="text-input" name="text-input" checked={this.state.spec} onChange={(e)=>this.setState({spec:e.target.checked? 1: 0})}/>
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
