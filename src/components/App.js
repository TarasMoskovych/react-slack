import React from 'react';
import { connect } from 'react-redux';
import './App.css';
import { Grid } from 'semantic-ui-react';

import ColorPanel from './ColorPanel/ColorPanel';
import SidePanel from './SidePanel/SidePanel';
import Messages from './Messages/Messages';
import MetaPanel from './MetaPanel/MetaPanel';

const App = ({ currentUser, currentChannel, isPrivateChannel, isStarredChannel, userPosts, colors }) => {
  return (
    <Grid columns="equal" className="app" style={{ background: colors.secondary, margin: 0 }}>
      <ColorPanel
        key={currentUser?.name}
        currentUser={currentUser}
      />
      <SidePanel
        colors={colors}
        key={currentUser?.uid}
        currentUser={currentUser}
        isPrivateChannel={isPrivateChannel}
        isStarredChannel={isStarredChannel}
      />
      <Grid.Column style={{ marginLeft: 320 }}>
        <Messages
          key={currentChannel?.id}
          currentChannel={currentChannel}
          currentUser={currentUser}
          isPrivateChannel={isPrivateChannel}
        />
      </Grid.Column>
      <Grid.Column width={4} style={{ paddingLeft: '0.5em' }}>
        <MetaPanel
          key={currentChannel?.name}
          isPrivateChannel={isPrivateChannel}
          currentChannel={currentChannel}
          userPosts={userPosts}
        />
      </Grid.Column>
    </Grid>
  );
};

const mapStateFromProps = ({ user, channel, colors }) => ({
  colors,
  currentUser: user.currentUser,
  currentChannel: channel.currentChannel,
  isPrivateChannel: channel.isPrivateChannel,
  isStarredChannel: channel.isStarredChannel,
  userPosts: channel.userPosts
});

export default connect(mapStateFromProps)(App);
