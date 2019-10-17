import React, { Component } from 'react';
import { Button, Col, Container, Input, InputGroup, InputGroupAddon, InputGroupText, Row } from 'reactstrap';
const axios = require('axios')


class Page500 extends Component {

  componentDidMount(){
      axios.get('/mailmerge').then( res => {
          console.log('done')
      })
  }

  render() {
    return (
      <div className="app flex-row align-items-center">
        <Container>
          <Row className="justify-content-center">
            <Col md="6">
              <span className="clearfix">
                <h1 className="float-left display-3 mr-4"></h1>
                <h4 className="pt-3">Updating Mail Merge</h4>
                <p className="text-muted float-left">Please wait a moment and Mail Merge will be updated</p>
              </span>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default Page500;
