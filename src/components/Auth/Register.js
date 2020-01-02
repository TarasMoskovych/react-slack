import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Grid, Segment, Button, Header, Message, Icon } from 'semantic-ui-react';
import { Form, Input } from 'semantic-ui-react-form-validator'
import firebase from './../../firebase';
import { Collections, generateAvatar } from './../../helpers';

class Register extends Component {
  state = {
    username: '',
    email: '',
    password: '',
    passwordConfirmation: '',
    errors: [],
    loading: false,
    usersRef: firebase.database().ref(Collections.Users)
  };

  handleChange = event => {
    if (this.state.errors) { this.setState({ errors: [] }); }

    this.setState({ [event.target.name]: event.target.value });
  };

  handleSubmit = event => {
    event.persist();

    const { username, email, password } = this.state;

    this.setState({ loading: true, errors: [] });

    firebase
      .auth()
      .createUserWithEmailAndPassword(email, password)
      .then(userData => {
        userData.user.sendEmailVerification();
        userData.user.updateProfile({
          displayName: username,
          photoURL: generateAvatar(userData.user.uid)
        })
        .then(() => {
          this.saveUser(userData);
        });
      })
      .catch(err => this.setState({ errors: this.state.errors.concat(err) }))
      .finally(() => this.setState({ loading: false }));
  };

  saveUser = ({ user }) => {
    const { displayName, email, photoURL } = user;

    return this.state.usersRef
      .child(user.uid)
      .set({ displayName, email, photoURL });
  };

  displayErrors = errors => errors.map((error, idx) => <p key={idx}>{error.message}</p>);

  handleServerErrors = (errors, inputName) => {
    return errors.some(error => error.message.toLowerCase().includes(inputName)) ? 'server-error' : '';
  };

  componentDidMount() {
    Form.addValidationRule('confirmPassword', value => value.length ? value === this.state.password : true);
  }

  render() {
    const { username, email, password, passwordConfirmation, loading, errors } = this.state;

    return (
      <Grid textAlign="center" verticalAlign="middle" className="app">
        <Grid.Column style={{ maxWidth: 450 }}>
          <Header as="h1" icon color="orange" textAlign="center">
            <Icon name="puzzle piece" color="orange"/>
            Register for DevChat
          </Header>
          <Form size="large" onSubmit={this.handleSubmit} noValidate>
            <Segment stacked>
              <Input
                fluid
                type="text"
                name="username"
                icon="user"
                iconPosition="left"
                placeholder="Username"
                onChange={this.handleChange}
                value={username}
                validators={['required']}
                errorMessages={['Please enter Username.']}
                width={16}
              />
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
              <Input
                fluid
                type="password"
                name="passwordConfirmation"
                icon="repeat"
                iconPosition="left"
                placeholder="Confirm Password"
                onChange={this.handleChange}
                value={passwordConfirmation}
                validators={['required', 'confirmPassword']}
                errorMessages={['Please enter Password.', 'Confirm password is not matched Password.']}
                width={16}
              />
              <Button
                className={loading ? 'loading' : ''}
                disabled={loading}
                color="orange"
                fluid
                size="large"
              >Register</Button>
            </Segment>
          </Form>
          {errors.length > 0 && (
            <Message error>
              {this.displayErrors(errors)}
            </Message>
          )}
          <Message>Already a user? <Link to="/login">Login</Link></Message>
        </Grid.Column>
      </Grid>
    );
  }
}

export default Register;
