import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Grid, Segment, Button, Header, Message, Icon, Divider } from 'semantic-ui-react';
import { Form, Input } from 'semantic-ui-react-form-validator'
import firebase, { databases } from './../../firebase';
import { focusFirstInvalidField }from './../../helpers';

class Login extends Component {
  state = {
    email: '',
    password: '',
    errors: [],
    loading: false,
    googleLoading: false,
    usersRef: databases.users()
  };

  // Listeners
  handleChange = event => {
    if (this.state.errors) { this.setState({ errors: [] }); }

    this.setState({ [event.target.name]: event.target.value });
  };

  handleGoogleSignIn = () => {
    const { usersRef } = this.state;
    const { auth } = firebase;

    this.setState({ googleLoading: true });

    auth()
      .signInWithPopup(new auth.GoogleAuthProvider())
      .then(({ user }) => {
        const { displayName, email, photoURL, uid } = user;

        usersRef
          .child(uid)
          .set({ displayName, email, photoURL });
      })
      .catch(() => this.setState({ googleLoading: false }));
  }

  handleSubmit = event => {
    event.persist();

    const { email, password } = this.state;

    this.setState({ loading: true, errors: [] });

    firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then(userData => {
        if (!userData.user.emailVerified) {
          this.setState({ errors: this.state.errors.concat({ message: 'Your account is inactive. Please, confirm Your email.' }) });
        }
      })
      .catch(err => this.setState({ errors: this.state.errors.concat(err) }))
      .finally(() => this.setState({ loading: false }));
  };

  handleError = data => focusFirstInvalidField(`[name="${data[0].props.name}"]`);

  // Renders
  displayErrors = errors => errors.map((error, idx) => <p key={idx}>{error.message}</p>);

  handleServerErrors = (errors, inputName) => {
    return errors.some(error => error.message.toLowerCase().includes(inputName)) ? 'server-error' : '';
  };

  render() {
    const { email, password, loading, googleLoading, errors } = this.state;

    return (
      <Grid textAlign="center" verticalAlign="middle" className="app">
        <Grid.Column style={{ maxWidth: 450 }}>
          <Header as="h1" icon color="violet" textAlign="center">
            <Icon name="code branch" color="violet"/>
            Login to DevChat
          </Header>
          <Form size="large" onSubmit={this.handleSubmit} noValidate debounceTime={500} onError={this.handleError}>
            <Segment stacked>
              <Input
                fluid
                type="email"
                name="email"
                icon="mail"
                iconPosition="left"
                placeholder="Email"
                onChange={this.handleChange}
                value={email}
                validators={['required', 'isEmail']}
                errorMessages={['Please enter Email.', 'Please enter valid Email.']}
                width={16}
                className={this.handleServerErrors(errors, 'email')}
              />
              <Input
                fluid
                type="password"
                name="password"
                icon="lock"
                iconPosition="left"
                placeholder="Password"
                onChange={this.handleChange}
                value={password}
                validators={['required', 'minStringLength:6']}
                errorMessages={['Please enter Password.', 'Password should be greater 5 symbols.']}
                width={16}
                className={this.handleServerErrors(errors, 'password')}
              />
              <Button
                className={loading ? 'loading' : ''}
                disabled={loading}
                color="violet"
                fluid
                size="large"
              >Login</Button>
              <Divider/>
              <Button
                onClick={this.handleGoogleSignIn}
                disabled={googleLoading}
                type="button"
                fluid
                size="large"
              >Login with&nbsp;<Icon name="google" color="violet" style={{ margin: 0 }}/>oogle</Button>
            </Segment>
          </Form>
          {errors.length > 0 && (
            <Message error>
              {this.displayErrors(errors)}
            </Message>
          )}
          <Message>Don't have an account? <Link to="/register">Create an account</Link></Message>
        </Grid.Column>
      </Grid>
    );
  }
}

export default Login;
