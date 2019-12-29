import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import 'semantic-ui-css/semantic.min.css'

import { createStore } from 'redux';
import { Provider, connect } from 'react-redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import rootReducer from './store/reducers';
import { setUser } from './store/actions';

import App from './components/App';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Spinner from './shared/Spinner';

import firebase from './firebase';
import * as serviceWorker from './serviceWorker';

import { BrowserRouter as Router, Switch, Route, withRouter } from 'react-router-dom';

const store = createStore(rootReducer, composeWithDevTools());

class Root extends Component {

  componentDidMount() {
    firebase
      .auth()
      .onAuthStateChanged(userData => {
        if (userData) {
          this.props.setUser(userData);
          this.props.history.push('/');
        }
      });
  }

  render() {
    return this.props.isLoading ? <Spinner/> : (
      <Switch>
        <Route exact path="/" component={App}/>
        <Route path="/login" component={Login}/>
        <Route path="/register" component={Register}/>
      </Switch>
    );
  }
}

const mapStateFromProps = state => ({ isLoading: state.user.isLoading });
const RootWithAuth = withRouter(connect(mapStateFromProps, { setUser })(Root));

ReactDOM.render(
  <Provider store={store}>
    <Router>
      <RootWithAuth/>
    </Router>
  </Provider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
