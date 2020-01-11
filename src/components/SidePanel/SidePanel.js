import React, { Component } from 'react';
import { Menu } from 'semantic-ui-react';
import Channels from './Channels';
import DirectMessages from './DirectMessages';
import UserPanel from './UserPanel';

class SidePanel extends Component {
  render() {
    const { currentUser, isPrivateChannel } = this.props;

    return (
      <Menu
        size="large"
        inverted
        fixed="left"
        vertical
        style={{ background: '#4c3c4c', fonsSize: '1.2rem' }}
      >
        <UserPanel currentUser={currentUser}/>
        <Channels currentUser={currentUser} privateChannel={isPrivateChannel}/>
        <DirectMessages currentUser={currentUser} privateChannel={isPrivateChannel}/>
      </Menu>
    );
  }
}

export default SidePanel;
