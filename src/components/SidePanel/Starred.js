import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Menu, Icon } from 'semantic-ui-react';
import { setChannel, setStarredChannel } from './../../store/actions';
import { databases } from './../../firebase';

class Starred extends Component {
  state = {
    active: '',
    user: this.props.currentUser,
    usersRef: databases.users(),
    starredChannels: [],
  }

  componentDidMount() {
    if (this.state.user) {
      this.addListeners();
    }
  }

  componentWillUnmount() {
    this.removeListeners();
  }

  // Effects
  addListeners() {
    const { usersRef, user } = this.state;

    usersRef
      .child(user.uid)
      .child('starred')
      .on('child_added', snaphot => {
        const starredChannel = { id: snaphot.key, ...snaphot.val() };

        this.setState({ starredChannels: [...this.state.starredChannels, starredChannel] });
      });

    usersRef
      .child(user.uid)
      .child('starred')
      .on('child_removed', snaphot => {
        const channelToRemove = { id: snaphot.key, ...snaphot.val() };
        const filteredChannels = this.state.starredChannels.filter(channel => channel.id !== channelToRemove.id);

        this.setState({ starredChannels: filteredChannels });
      });
  }

  removeListeners() {
    const { usersRef, user } = this.state;

    usersRef.child(`${user.uid}/starred`).off();
  }

  // Helpers
  changeChannel = channel => {
    this.props.setChannel(channel);
    this.props.setStarredChannel(true);
    this.setState({ active: channel.id, channel });
  }

  render() {
    const { active, starredChannels } = this.state;

    return (
      <Menu.Menu className="menu">
      <Menu.Item>
        <span>
          <Icon name="star"/>STARRED {" "}
          ({ starredChannels.length })
        </span>
      </Menu.Item>
      {starredChannels.map(channel => (
        <Menu.Item
          active={channel.id === active && this.props.isStarredChannel}
          key={channel.id}
          onClick={() => this.changeChannel(channel)}
          name={channel.name}
          style={{ opacity: 0.7, color: 'white' }}
        >
          # {channel.name}
        </Menu.Item>
      ))}
    </Menu.Menu>
    );
  }
}

export default connect(null, { setChannel, setStarredChannel })(Starred);
