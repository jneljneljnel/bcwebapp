import React, { Component } from 'react';
import { HashRouter, Route, Redirect, Switch, Link } from 'react-router-dom';
import { Button, Card, CardBody, CardGroup, Col, Container, Form, Input, InputGroup, InputGroupAddon, InputGroupText, Row } from 'reactstrap';
// import { renderRoutes } from 'react-router-config';
import Loadable from 'react-loadable';
import './App.scss';

const loading = () => <div className="animated fadeIn pt-3 text-center"><div className="sk-spinner sk-spinner-pulse"></div></div>;

const fakeAuth = {
  isAuthenticated: false,
  authenticate(cb) {
    this.isAuthenticated = true
    setTimeout(cb, 100)
  },
  signout(cb) {
    this.isAuthenticated = false
    setTimeout(cb, 100)
  }
}
//
// class Auth2 extends React.Component {
//   state = {
//     redirectToReferrer: false
//   }
//   login = () => {
//     fakeAuth.authenticate(() => {
//       this.setState(() => ({
//         redirectToReferrer: true
//       }))
//     })
//   }
//   render() {
//     const { from } = this.props.location.state || { from: { pathname: '/' } }
//     const { redirectToReferrer } = this.state
//
//     if (redirectToReferrer === true) {
//       return <Redirect to={from} />
//     }
//
//     return (
//       <div>
//         <p>You must log in to view the page</p>
//         <button onClick={this.login}>Log in</button>
//       </div>
//     )
//   }
// }

class Auth extends Component {
  state = {
    redirectToReferrer: false,
    un:'',
    pw:'',
    fail:''
  }
  login = () => {
    if(this.state.un == process.env.REACT_APP_UN && this.state.pw == process.env.REACT_APP_PW){
      fakeAuth.authenticate(() => {
        this.setState(() => ({
          redirectToReferrer: true
        }))
      })
    }
    else{
      this.state.fail = true
    }
  }
  render() {
    return (
      <div className="app flex-row align-items-center">
        <Container>
          <Row className="justify-content-center">
            <Col md="8">
              <CardGroup>
                <Card className="p-4">
                  <CardBody>
                    <Form>
                      <h1>Login</h1>
                      <p className="text-muted">Sign In to your account</p>
                      {
                        this.state.fail ?
                        <p className="text-muted">Authentication failed</p>
                        :
                        ''
                      }
                      <InputGroup className="mb-3">
                        <InputGroupAddon addonType="prepend">
                          <InputGroupText>
                            <i className="icon-user"></i>
                          </InputGroupText>
                        </InputGroupAddon>
                        <Input type="text" value={this.state.un} onChange={(e)=>this.setState({un:e.target.value})} placeholder="Username" autoComplete="username" />
                      </InputGroup>
                      <InputGroup className="mb-4">
                        <InputGroupAddon addonType="prepend">
                          <InputGroupText>
                            <i className="icon-lock"></i>
                          </InputGroupText>
                        </InputGroupAddon>
                        <Input type="password"  value={this.state.pw} onChange={(e)=>this.setState({pw:e.target.value})} placeholder="Password" autoComplete="current-password" />
                      </InputGroup>
                      <Row>
                        <Col xs="6">
                        <Link to='/dashboard'>
                          <Button color="primary" onClick={this.login} className="px-4">Login</Button>
                        </Link>
                        </Col>
                        <Col xs="6" className="text-right">
                          <Button color="link" className="px-0">Forgot password?</Button>
                        </Col>
                      </Row>
                    </Form>
                  </CardBody>
                </Card>
              </CardGroup>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route {...rest} render={(props) => (
  fakeAuth.isAuthenticated === true
    ? <Component {...props} />
    : <Redirect to='/login' />
)} />
)

// Containers
const DefaultLayout = Loadable({
  loader: () => import('./containers/DefaultLayout'),
  loading
});

// Pages
const Login = Loadable({
  loader: () => import('./views/Pages/Login'),
  loading
});

const Register = Loadable({
  loader: () => import('./views/Pages/Register'),
  loading
});

const Page404 = Loadable({
  loader: () => import('./views/Pages/Page404'),
  loading
});

const Page500 = Loadable({
  loader: () => import('./views/Pages/Page500'),
  loading
});

class App extends Component {

  render() {
    return (
      <HashRouter>
        <Switch>
          <Route exact path="/login" name="Login Page" component={Auth} />
          <Route exact path="/register" name="Register Page" component={Register} />
          <Route exact path="/404" name="Page 404" component={Page404} />
          <Route exact path="/500" name="Page 500" component={Page500} />
          <PrivateRoute path="/" name="Home" component={DefaultLayout} />
        </Switch>
      </HashRouter>
    );
  }
}

export default App;
