import React, { Component } from 'react';
import { Segment, Comment, Loader } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { setUserPosts } from './../../store/actions';
import _ from 'lodash';

import MessagesHeader from './MessagesHeader';
import MessageForm from './MessageForm';
import Message from './Message';
import Typing from './Typing';
import { databases } from './../../firebase';

class Messages extends Component {
  ref = null;

  state = {
    connectedRef: databases.connected(),
    messagesRef: databases.messages(),
    channel: this.props.currentChannel,
    isChannelStarred: false,
    messages: [],
    listeners: [],
    loading: true,
    privateChannel: this.props.isPrivateChannel,
    privateMessagesRef: databases.privateMessages(),
    searchTerm: '',
    searchLoading: false,
    searchResults: [],
    typingUsers: [],
    typingRef: databases.typing(),
    user: this.props.currentUser,
    users: 0,
    usersRef: databases.users()
  }

  componentDidUpdate() {
    this.scrollToLastMessage();
  }

  componentDidMount() {
    const { channel, user, listeners } = this.state;

    if (channel && user) {
      this.removeListeners(listeners);
      this.addListeners(channel.id);
      this.addUserStarsListener(channel.id, user);
    }
  }

  componentWillUnmount() {
    const { listeners, connectedRef } = this.state;

    this.removeListeners(listeners);
    connectedRef.off();
  }

  // Effects
  addListeners(id) {
    this.addMessageListener(id);
    this.addTypingListeners(id);
  }

  removeListeners(listeners) {
    listeners.forEach(listener => {
      const { ref, id, event } = listener;
      ref.child(id).off(event);
    });
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
    const cb = _.debounce(posts => this.props.setUserPosts(posts), 500);

    ref
      .child(id)
      .once('value', snapshot => {
        if (snapshot.numChildren() === 0) {
          this.setState({ loading: false });
        }
      });

    ref
      .child(id)
      .limitToLast(20)
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

        this.countUserPosts(messages, cb);
        this.addToListener(id, ref, 'child_added');
      });
  }

  addTypingListeners(id) {
    const { connectedRef, typingRef, user } = this.state;
    let typingUsers = [];

    typingRef
      .child(id)
      .on('child_added', snapshot => {
        if (snapshot.key !== user.uid) {
          typingUsers = typingUsers.concat({
            id: snapshot.key,
            name: snapshot.val()
          });

          this.setState({ typingUsers });
        }

        this.addToListener(id, typingRef, 'child_added');
      });

    typingRef
      .child(id)
      .on('child_removed', snapshot => {
        const idx = typingUsers.findIndex(user => user.id === snapshot.key);

        if (idx !== -1) {
          typingUsers = typingUsers.filter(user => user.id !== snapshot.key);
          this.setState({ typingUsers });
        }

        this.addToListener(id, typingRef, 'child_removed');
      });

    connectedRef.on('value', snapshot => {
      if (snapshot.val()) {
        typingRef
          .child(id)
          .child(user.uid)
          .onDisconnect()
          .remove(err => err && console.error(err));
      }
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
  addToListener = (id, ref, event) => {
    const idx = this.state.listeners.findIndex(listener => listener.id === id && listener.ref === ref && listener.event === event);

    if (idx === -1) {
      this.setState({ listeners: this.state.listeners.concat({ id, ref, event })});
    }
  }

  getMessagesRef = () => {
    const { messagesRef, privateMessagesRef, privateChannel } = this.state;
    return privateChannel ? privateMessagesRef : messagesRef;
  }

  scrollToLastMessage = () => this.ref?.scrollIntoView({ behavior: 'smooth' });

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
        return message.content?.match(regex) || message.user.name.match(regex);
      }),
    });

    setTimeout(() => this.setState({ searchLoading: false }), 1000);
  }

  countUserPosts = (messages, cb) => {
    const userPosts = messages.reduce((acc, message) => {
      if (message.user.name in acc) {
        acc[message.user.name].count += 1;
      } else {
        acc[message.user.name] = {
          photoURL: message.user.photoURL,
          count: 1
        }
      }
      return acc;
    }, {});

    cb(userPosts);
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

  renderTypingUsers = users => {
    return (
      users.length > 0 && users.map(user => (
        <span key={user.id} className="user__typing">{user.name}
          <Typing/>
        </span>
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
      searchLoading,
      typingUsers
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
          {!channel && <div className="messages__no-channel">Please, select a channel to start messaging</div>}
          <Loader active={loading && !!channel} size="big"/>
          <Comment.Group style={{ margin: 0, maxWidth: '100%', maxHeight: 'calc(100vh - 280px)', overflow: 'auto' }}>
            {this.renderMessages(searchTerm ? searchResults : messages)}
            <div ref={this.getRef}/>
          </Comment.Group>
          <div className="user__typing-wrapper">
            {this.renderTypingUsers(typingUsers)}
          </div>
        </Segment>
        <MessageForm
          messagesRef={messagesRef}
          currentChannel={channel}
          currentUser={user}
          privateChannel={privateChannel}
          getMessagesRef={this.getMessagesRef}
        />
      </div>
    );
  }
}

export default connect(null, { setUserPosts })(Messages);
