import React, { Component } from 'react';
import { Menu } from 'semantic-ui-react';
import Channels from './Channels';
import Starred from './Starred';
import DirectMessages from './DirectMessages';
import UserPanel from './UserPanel';

class SidePanel extends Component {
  render() {
    const { currentUser, isPrivateChannel, isStarredChannel, colors } = this.props;

    return (
      <Menu
        size="large"
        inverted
        fixed="left"
        vertical
        style={{ background: colors.primary, fonsSize: '1.2rem' }}
      >
        <UserPanel currentUser={currentUser} colors={colors}/>
        <Starred
          currentUser={currentUser}
          isStarredChannel={isStarredChannel}
        />
        <Channels
          currentUser={currentUser}
          starredChannel={isStarredChannel}
          privateChannel={isPrivateChannel}
        />
        <DirectMessages
          currentUser={currentUser}
          privateChannel={isPrivateChannel}
        />
      </Menu>
    );
  }
}

export default SidePanel;
