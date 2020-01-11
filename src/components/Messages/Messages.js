import React, { Component } from 'react';
import { Segment, Comment } from 'semantic-ui-react';

import MessagesHeader from './MessagesHeader';
import MessageForm from './MessageForm';
import Message from './Message';
import firebase from './../../firebase';
import { Collections } from './../../helpers';

class Messages extends Component {
  state = {
    messagesRef: firebase.database().ref(Collections.Messages),
    channel: this.props.currentChannel,
    messages: [],
    loading: true,
    user: this.props.currentUser
  }

  componentDidMount() {
    const { channel, user } = this.state;

    if (channel && user) {
      this.addListeners(channel.id);
    }

  }

  addListeners(id) {
    this.addMessageListener(id);
  }

  addMessageListener(id) {
    const messages = [];

    this.state.messagesRef
      .child(id)
      .on('child_added', snapshot => {
        messages.push(snapshot.val());
        this.setState({ messages, loading: false });
        this.scrollToLastMessage();
      });
  }

  scrollToLastMessage = () => {
    const elements = document.querySelectorAll('.comment');

    if (elements && elements.length) {
      elements[elements.length - 1].scrollIntoView({ behavior: 'smooth' });
    }
  }

  render() {
    const { messagesRef, channel, user, messages, loading } = this.state;

    return (
      <div className="messages">
        <MessagesHeader/>
        <Segment className="messages__area" style={{ margin: 0 }}>
          <Comment.Group style={{ maxWidth: '100%', maxHeight: 'calc(100vh - 320px)', overflow: 'auto' }}>
            {messages.length > 0 && messages.map(message => (
              <Message
                key={message.timestamp}
                message={message}
                user={user}
              />
            ))}
          </Comment.Group>
        </Segment>
        <MessageForm
          messagesRef={messagesRef}
          currentChannel={channel}
          currentUser={user}
          scrollToLastMessage={this.scrollToLastMessage}
        />
      </div>
    );
  }
}

export default Messages;
