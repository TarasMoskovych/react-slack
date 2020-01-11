import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Menu, Icon } from 'semantic-ui-react';
import { setChannel, setPrivateChannel } from './../../store/actions';
import { databases } from './../../firebase';

class DirectMessages extends Component {
  state = {
    activeChannel: '',
    connectedRef: databases.connected(),
    presenceRef: databases.presence(),
    user: this.props.currentUser,
    users: [],
    usersRef: databases.users()
  }

  componentDidMount() {
    const { user } = this.state;

    if (user) {
      this.addListeners(user);
    }
  }

  addListeners({ uid }) {
    const { usersRef, connectedRef, presenceRef } = this.state;
    const users = [];

    usersRef.on('child_added', snapshot => {
      if (uid !== snapshot.key) {
        users.push(Object.assign(snapshot.val(), { uid: snapshot.key, status: 'offline' }));
        this.setState({ users });
      }
    });

    connectedRef.on('value', snapshot => {
      if (!snapshot.val()) { return; }

      const ref = presenceRef.child(uid);

      ref.set(true);
      ref.onDisconnect().remove(err => err && console.error(err));
    });

    presenceRef.on('child_added', snapshot => {
      if (uid !== snapshot.key) {
        this.updateUserStatus(snapshot.key);
      }
    });

    presenceRef.on('child_removed', snapshot => {
      if (uid !== snapshot.key) {
        this.updateUserStatus(snapshot.key, false);
      }
    });
  }

  updateUserStatus = (uid, connected = true) => {
    const users = this.state.users.reduce((acc, user) => {
      if (uid === user.uid) {
        user.status = `${connected ? 'online' : 'offline'}`;
      }
      return acc.concat(user);
    }, []);

    this.setState({ users });
  }

  changeChannel = user => {
    const channelId = this.getChannelId(user.uid);

    this.setState({ activeChannel: user.uid })
    this.props.setPrivateChannel(true);
    this.props.setChannel({
      id: channelId,
      name: user.displayName
    });
  }

  getChannelId = id => {
    const currentUserId = this.state.user.uid;
    return id < currentUserId ? `${id}/${currentUserId}` : `${currentUserId}/${id}`;
  }

  render() {
    const { users, activeChannel } = this.state;

    return (
      <Menu.Menu className="menu">
        <Menu.Item>
          <span>
            <Icon name="mail"/> DIRECT MESSAGES
          </span> {' '}
          ({ users.length })
        </Menu.Item>
        {users.map(user => (
          <Menu.Item
            active={activeChannel === user.uid && this.props.privateChannel}
            key={user.uid}
            onClick={() => this.changeChannel(user)}
            style={{ opacity: 0.7, fontStyle: 'italic' }}
          ><Icon name="circle" color={user.status === 'online' ? 'green' : 'red'}/>
            @ {user.displayName}
          </Menu.Item>
        ))}
      </Menu.Menu>
    );
  }
}

export default connect(null, { setChannel, setPrivateChannel })(DirectMessages);
