import React, { Component } from 'react';
import { Segment, Comment, Loader } from 'semantic-ui-react';

import MessagesHeader from './MessagesHeader';
import MessageForm from './MessageForm';
import Message from './Message';
import { databases } from './../../firebase';

class Messages extends Component {
  ref = null;

  state = {
    messagesRef: databases.messages(),
    channel: this.props.currentChannel,
    isChannelStarred: false,
    messages: [],
    loading: true,
    privateChannel: this.props.isPrivateChannel,
    privateMessagesRef: databases.privateMessages(),
    searchTerm: '',
    searchLoading: false,
    searchResults: [],
    user: this.props.currentUser,
    users: 0,
    usersRef: databases.users()
  }

  componentDidMount() {
    const { channel, user } = this.state;

    if (channel && user) {
      this.addListeners(channel.id);
      this.addUserStarsListener(channel.id, user);
    }
  }

  // Effects
  addListeners(id) {
    this.addMessageListener(id);
  }

  addUserStarsListener(id, user) {
    const { usersRef } = this.state;

    usersRef
      .child(user.uid)
      .child('starred')
      .once('value')
      .then(data => {
        if (data && data.val()) {
          const ids = Object.keys(data.val());
          this.setState({ isChannelStarred: ids.includes(id) })
        }
      });
  }

  addMessageListener(id) {
    const ref = this.getMessagesRef();
    const messages = [];

    ref
      .child(id)
      .once('value', snapshot => {
        if (snapshot.numChildren() === 0) {
          this.setState({ loading: false });
        }
      });

    ref
      .child(id)
      .on('child_added', snapshot => {
        messages.push(snapshot.val());

        this.setState({
          messages,
          loading: false,
          users: messages.reduce((acc, message) => {
            if (!acc.includes(message.user.id)) {
              acc.push(message.user.id);
            }

            return acc;
          }, []).length
        });

        this.scrollToLastMessage();
      });
  }

  starChannel = () => {
    const { isChannelStarred, usersRef, user, channel } = this.state;

    if (isChannelStarred) {
      usersRef
        .child(`${user.uid}/starred`)
        .update({
          [channel.id]: {
            name: channel.name,
            details: channel.details,
            createdBy: {
              name: channel.createdBy.name,
              photoURL: channel.createdBy.photoURL
            }
          }
        });
    } else {
      usersRef
        .child(`${user.uid}/starred`)
        .child(channel.id)
        .remove(err => err && console.log(err));
    }
  }

  // Helpers
  getMessagesRef = () => {
    const { messagesRef, privateMessagesRef, privateChannel } = this.state;
    return privateChannel ? privateMessagesRef : messagesRef;
  }

  scrollToLastMessage = () => this.ref && this.ref.scrollIntoView({ behavior: 'smooth' });

  getRef = node => this.ref = node;

  handleSearchChange = event => {
    this.setState({ searchTerm: event.target.value, searchLoading: true }, () => this.searchMessages());
  }

  handleStar = () => this.setState({ isChannelStarred: !this.state.isChannelStarred }, () => this.starChannel());

  searchMessages = () => {
    const regex = new RegExp(this.state.searchTerm, 'gi');

    this.setState({
      searchResults: [...this.state.messages].filter(message => {
        // eslint-disable-next-line
        return message.content && message.content.match(regex) || message.user.name.match(regex);
      }),
    });

    setTimeout(() => this.setState({ searchLoading: false }), 1000);
  }

  // Renders
  renderChannelName = channel => channel ? `${this.state.privateChannel ? '@' : '#'}${channel.name}` : '';

  renderMessages(messages) {
    return (
      messages.length > 0 && messages.map(message => (
        <Message
          key={message.timestamp}
          message={message}
          user={this.state.user}
        />
      ))
    );
  }

  render() {
    const {
      messagesRef,
      channel,
      user,
      messages,
      loading,
      isChannelStarred,
      privateChannel,
      users,
      searchTerm,
      searchResults,
      searchLoading
    } = this.state;

    return (
      <div className="messages">
        <MessagesHeader
          channelName={this.renderChannelName(channel)}
          users={users}
          handleSearchChange={this.handleSearchChange}
          searchLoading={searchLoading}
          privateChannel={privateChannel}
          isChannelStarred={isChannelStarred}
          handleStar={this.handleStar}
        />
        <Segment className="messages__area" style={{ margin: 0 }}>
          <Loader active={loading} size="big"/>
          <Comment.Group style={{ maxWidth: '100%', maxHeight: 'calc(100vh - 320px)', overflow: 'auto' }}>
            {this.renderMessages(searchTerm ? searchResults : messages)}
            <div ref={this.getRef}/>
          </Comment.Group>
        </Segment>
        <MessageForm
          messagesRef={messagesRef}
          currentChannel={channel}
          currentUser={user}
          scrollToLastMessage={this.scrollToLastMessage}
          privateChannel={privateChannel}
          getMessagesRef={this.getMessagesRef}
        />
      </div>
    );
  }
}

export default Messages;
