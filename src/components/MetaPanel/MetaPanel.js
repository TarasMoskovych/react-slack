import React, { Component, Fragment } from 'react';
import { Segment, Accordion, Header, Icon, Image, List, Input, Divider, Button } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { setChannel, setStarredCurrentChannel } from './../../store/actions';
import { databases } from './../../firebase';

class MetaPanel extends Component {
  state = {
    activeIdx: 0,
    channel: this.props.currentChannel,
    loading: false,
    newChannel: this.props.currentChannel,
    channelsRef: databases.channels(),
    user: this.props.currentUser,
    usersRef: databases.users()
  }

  // Effects
  editChannel = () => {
    const { channel, channelsRef, newChannel, user, usersRef} = this.state;
    const { isCurrentChannelStarred } = this.props;

    if (channel?.id && user?.uid) {
      channelsRef
        .child(channel.id)
        .set(newChannel)
        .then(() => this.props.setChannel(newChannel));

      isCurrentChannelStarred && usersRef
        .child(`${user.uid}/starred`)
        .child(channel.id)
        .set(newChannel);
    }
  }

  removeChannel = () => {
    const { channel, channelsRef, user, usersRef } = this.state;
    const { isCurrentChannelStarred } = this.props;

    if (channel?.id && user?.uid) {
      channelsRef
        .child(channel.id)
        .remove()
        .then(() => {
          this.props.setChannel();
          this.props.setStarredCurrentChannel(false);
        });

      isCurrentChannelStarred && usersRef
        .child(`${user.uid}/starred`)
        .child(channel.id)
        .remove(err => err && console.log(err));
    }
  }

  // Listeners
  handleChange = event => {
    this.setState({ newChannel: {...this.state.newChannel, [event.target.name]: event.target.value }});
  }

  setActiveIdx = (event, titleProps) => {
    const { index } = titleProps;
    const { activeIdx } = this.state;
    const newIdx = activeIdx === index ? -1 : index;

    this.setState({ activeIdx: newIdx });
  }

  // Renders
  renderTopPosters(posts) {
    return posts && Object
      .entries(posts)
      .sort((a, b) => b[1] - a[1])
      .map(([key, val], idx) => (
        <List.Item key={idx}>
          <Image avatar src={val.photoURL}/>
          <List.Content>
            <List.Header as="a">{key}</List.Header>
              <List.Description>{val.count} {val.count === 1 ? 'post' : 'posts'}</List.Description>
          </List.Content>
        </List.Item>
      )).slice(0, 5);
  }

  render() {
    const { activeIdx, channel, user, newChannel, loading } = this.state;
    const { userPosts } = this.props;

    return (
      <Segment loading={!channel}>
        <Header as="h3" attached="top">
          About # {channel?.name}
        </Header>
        <Accordion styled attached="true">
          <Accordion.Title active={activeIdx === 0} index={0} onClick={this.setActiveIdx}>
            <Icon name="dropdown"/>
            <Icon name="info"/>
            Channel Details
          </Accordion.Title>
          <Accordion.Content active={activeIdx === 0} index={0}>
            {channel?.details}
          </Accordion.Content>
          <Accordion.Title active={activeIdx === 1} index={1} onClick={this.setActiveIdx}>
            <Icon name="dropdown"/>
            <Icon name="user circle"/>
            Top Posters
          </Accordion.Title>
          <Accordion.Content active={activeIdx === 1} index={1}>
            <List>
              {this.renderTopPosters?.(userPosts)}
            </List>
          </Accordion.Content>
          <Accordion.Title active={activeIdx === 2} index={2} onClick={this.setActiveIdx}>
            <Icon name="dropdown"/>
            <Icon name="user"/>
            Created By
          </Accordion.Title>
          <Accordion.Content active={activeIdx === 2} index={2}>
            <Header as="h4">
              <Image circular src={channel?.createdBy?.photoURL}/>
              {channel?.createdBy?.name}
            </Header>
          </Accordion.Content>
          {channel?.createdBy?.id === user?.uid && (
            <Fragment>
              <Accordion.Title active={activeIdx === 3} index={3} onClick={this.setActiveIdx}>
                <Icon name="dropdown"/>
                <Icon name="options"/>
                Actions
              </Accordion.Title>
              <Accordion.Content active={activeIdx === 3} index={3} style={{ textAlign: 'center' }}>
                <Input
                  name="name"
                  value={newChannel?.name}
                  fluid
                  type="text"
                  placeholder="Name"
                  onChange={this.handleChange}
                  style={{ marginBottom: '10px' }}
                />
                <Input
                  name="details"
                  value={newChannel?.details}
                  fluid
                  type="text"
                  placeholder="Details"
                  onChange={this.handleChange}
                />
                <Divider/>
                <Button.Group widths="2">
                  <Button
                    color="orange"
                    content="Edit"
                    labelPosition="left"
                    icon="edit"
                    onClick={this.editChannel}
                    disabled={!newChannel?.name || !newChannel?.details || loading}
                  />
                  <Button
                    color="red"
                    content="Remove"
                    labelPosition="right"
                    icon="remove"
                    onClick={this.removeChannel}
                  />
                </Button.Group>
              </Accordion.Content>
            </Fragment>
          )}
        </Accordion>
      </Segment>
    );
  }
}

export default connect(null, { setChannel, setStarredCurrentChannel })(MetaPanel);
