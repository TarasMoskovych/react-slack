import React, { Component, Fragment } from 'react';
import { Menu, Icon, Modal, Form, Input, Button, Label } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { setChannel } from './../../store/actions';
import { databases } from './../../firebase';

class Channels extends Component {
  state = {
    channel: null,
    channelDetails: '',
    channelName: '',
    channels: [],
    channelsRef: databases.channels(),
    firstLoad: true,
    messagesRef: databases.messages(),
    modal: false,
    notifications: [],
    typingRef: databases.typing(),
    user: this.props.currentUser
  }

  componentDidMount() {
    this.addListeners();
  }

  componentWillUnmount() {
    this.removeListeners();
  }

  // Effects
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
          id: user.uid,
          name: user.displayName,
          photoURL: user.photoURL
        }
      })
      .catch(e => console.error(e))
      .finally(() => this.closeModal());
  }

  addListeners() {
    this.state.channelsRef.on('child_added', snapshot => {
      this.setState({ channels: this.state.channels.concat(snapshot.val()) }, () => this.setFirstChannel());
      this.addNotificationListener(snapshot.key);
    });

    this.state.channelsRef.on('child_removed', snapshot => {
      this.setState({ channels: this.state.channels.filter(channel => channel.id !== snapshot.val()?.id) });
    });

    this.state.channelsRef.on('child_changed', snapshot => {
      const channels = this.state.channels;
      const idx = channels.findIndex(channel => channel.id === snapshot.key);

      if (idx > -1) {
        channels.splice(idx, 1, snapshot.val());
        this.setState({ channels });
      }
    });
  }

  addNotificationListener = id => {
    this.state.messagesRef.child(id).on('value', snapshot => {
      const { channel, notifications } = this.state;

      if (channel && !this.props.starredChannel) {
        this.handleNotifications(id, channel.id, notifications, snapshot);
      }
    });
  }

  removeListeners() {
    const { channelsRef, messagesRef, channels } = this.state;

    channelsRef.off();
    channels.forEach(channel => messagesRef.child(channel.id).off());
  }

  // Listeners
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

  // Helpers
  openModal = () => this.setState({ modal: true });

  closeModal = () => this.setState({ modal: false, channelName: '', channelDetails: '' });

  handleNotifications = (channelId, currentChannelId, notifications, snapshot) => {
    const numChildren = snapshot.numChildren();
    const idx = notifications.findIndex(notification => notification.id === channelId);
    let lastTotal = 0;

    if (idx !== -1) {
      if (channelId !== currentChannelId) {
        lastTotal = notifications[idx].total;

        if (numChildren - lastTotal > 0) {
          notifications[idx].count = numChildren - lastTotal;
        }
      }
      notifications[idx].lastKnownTotal = numChildren;
    } else {
      notifications.push({
        id: channelId,
        total: numChildren,
        lastKnownTotal: numChildren,
        count: 0
      });
    }

    this.setState({ notifications });
  }

  changeChannel = channel => {
    const { typingRef, user } = this.state;

    this.props.setChannel(channel);
    this.setState({ active: channel.id, channel });

    this.clearNotifications();

    typingRef
      .child(this.state.channel.id)
      .child(user.uid)
      .remove();
  }

  clearNotifications = () => {
    const { notifications, channel } = this.state;
    const idx = notifications.findIndex(notification => notification.id === channel.id);

    if (idx !== -1) {
      const updatedNotifications = [...notifications];

      updatedNotifications[idx].total = notifications[idx].lastKnownTotal;
      updatedNotifications[idx].count = 0;

      this.setState({ notifications: updatedNotifications });
    }
  }

  setFirstChannel() {
    const { firstLoad, channels } = this.state;
    this.setState({ firstLoad: false });

    if (firstLoad && channels.length > 0) {
      const firstChannel = channels[0];

      this.props.setChannel(firstChannel);
      this.setState({ active: firstChannel.id, channel: firstChannel });
    }
  }

  getNotificationCount = channel => {
    const { notifications, active } = this.state;
    let count = 0;

    notifications.forEach(notification => {
      if (notification.id === channel.id) {
        count = notification.count;
      }
    });

    return active === channel.id ? 0 : count;
  }

  render() {
    const { channels, modal } = this.state;
    const { currentChannel, privateChannel, starredChannel } = this.props;

    return (
      <Fragment>
        <Menu.Menu className="menu">
          <Menu.Item>
            <span>
              <Icon name="exchange"/>CHANNELS {" "}
              ({ channels.length })
            </span>
            <Icon name="add" link onClick={this.openModal}/>
          </Menu.Item>
          {channels.map(channel => (
            <Menu.Item
              active={channel.id === currentChannel?.id && !privateChannel && !starredChannel}
              key={channel.id}
              onClick={() => this.changeChannel(channel)}
              name={channel.name}
              style={{ opacity: 0.7, color: 'white' }}
            >
              {this.getNotificationCount(channel) > 0 && (
                <Label color="red">{this.getNotificationCount(channel)}</Label>
              )}
              # {channel.name}
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
