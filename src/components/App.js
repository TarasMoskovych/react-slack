import React from 'react';
import { connect } from 'react-redux';
import './App.css';
import { Grid } from 'semantic-ui-react';

import ColorPanel from './ColorPanel/ColorPanel';
import SidePanel from './SidePanel/SidePanel';
import Messages from './Messages/Messages';
import MetaPanel from './MetaPanel/MetaPanel';

const App = ({ currentUser, currentChannel, isPrivateChannel, isStarredChannel }) => {
  return (
    <Grid columns="equal" className="app" style={{ background: '#eee', margin: 0 }}>
      <ColorPanel/>
      <SidePanel
        key={currentUser && currentUser.id}
        currentUser={currentUser}
        isPrivateChannel={isPrivateChannel}
        isStarredChannel={isStarredChannel}
      />
      <Grid.Column style={{ marginLeft: 320 }}>
        <Messages
          key={currentChannel && currentChannel.id}
          currentChannel={currentChannel}
          currentUser={currentUser}
          isPrivateChannel={isPrivateChannel}
        />
      </Grid.Column>
      <Grid.Column width={4}>
        <MetaPanel/>
      </Grid.Column>
    </Grid>
  );
};

const mapStateFromProps = ({ user, channel }) => ({
  currentUser: user.currentUser,
  currentChannel: channel.currentChannel,
  isPrivateChannel: channel.isPrivateChannel,
  isStarredChannel: channel.isStarredChannel
});

export default connect(mapStateFromProps)(App);
