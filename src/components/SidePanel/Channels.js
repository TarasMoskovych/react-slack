import React, { Component, Fragment } from 'react';
import { Menu, Icon, Modal, Form, Input, Button } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { setChannel } from './../../store/actions';
import firebase from './../../firebase';
import { Collections } from './../../helpers';

class Channels extends Component {
  state = {
    user: this.props.currentUser,
    channels: [],
    channelName: '',
    channelDetails: '',
    modal: false,
    firstLoad: true,
    channelsRef: firebase.database().ref(Collections.Channels)
  }

  componentDidMount() {
    this.addListeners();
  }

  componentWillUnmount() {
    this.removeListeners();
  }

  openModal = () => {
    this.setState({ modal: true });
  }

  closeModal = () => {
    this.setState({ modal: false, channelName: '', channelDetails: '' });
  }

  handleSubmit = (event) => {
    event.persist();

    const { channelName, channelDetails } = this.state;

    if (channelName && channelDetails) {
      this.addChannel();
    }
  }

  handleChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  }

  changeChannel = channel => {
    this.props.setChannel(channel);
    this.setState({ active: channel.id });
  }

  addChannel() {
    const { channelsRef, channelName, channelDetails, user } = this.state;
    const key = channelsRef.push().key;

    channelsRef
      .child(key)
      .update({
        id: key,
        name: channelName,
        details: channelDetails,
        createdBy: {
          name: user.displayName,
          photoURL: user.photoURL
        }
      })
      .catch(e => console.error(e))
      .finally(() => this.closeModal());
  }

  setFirstChannel() {
    const { firstLoad, channels } = this.state;
    this.setState({ firstLoad: false });

    if (firstLoad && channels.length > 0) {
      this.props.setChannel(channels[0]);
      this.setState({ active: channels[0].id });
    }
  }

  addListeners() {
    const channels = [];

    this.state.channelsRef.on('child_added', snapshot => {
      channels.push(snapshot.val());

      this.setState({ channels }, () => this.setFirstChannel());
    });
  }

  removeListeners() {
    this.state.channelsRef.off();
  }

  render() {
    const { channels, modal, active } = this.state;

    return (
      <Fragment>
        <Menu.Menu style={{ paddingBottom: '2em' }}>
          <Menu.Item>
            <span>
              <Icon name="exchange"/>CHANNELS {" "}
              ({ channels.length })
            </span>
            <Icon name="add" link onClick={this.openModal}/>
          </Menu.Item>
          {channels.map(channel => (
            <Menu.Item
              active={channel.id === active}
              key={channel.id}
              onClick={() => this.changeChannel(channel)}
              name={channel.name}
              style={{ opacity: 0.7, color: 'white' }}
            ># {channel.name}
            </Menu.Item>
          ))}
        </Menu.Menu>
        <Modal basic open={modal}>
          <Modal.Header>Add a Channel</Modal.Header>
          <Modal.Content>
            <Form>
              <Form.Field>
                <Input
                  autoFocus
                  fluid
                  label="Name of Channel"
                  name="channelName"
                  onChange={this.handleChange}
                />
              </Form.Field>
              <Form.Field>
                <Input
                  fluid
                  label="About the Channel"
                  name="channelDetails"
                  onChange={this.handleChange}
                />
              </Form.Field>
            </Form>
          </Modal.Content>
          <Modal.Actions>
            <Button color="green" inverted onClick={this.handleSubmit}>
              <Icon name="checkmark"/>Add
            </Button>
            <Button color="red" inverted onClick={this.closeModal}>
              <Icon name="remove"/>Cancel
            </Button>
          </Modal.Actions>
        </Modal>
      </Fragment>
    );
  }
}

export default connect(null, { setChannel })(Channels);
