import React from 'react';
import { Header, Segment, Icon, Input } from 'semantic-ui-react';

const MessagesHeader = ({ channelName, handleSearchChange, users, searchLoading, privateChannel }) => {
  return (
    <Segment clearing>
      <Header fluid="true" as="h2" floated="left" style={{ marginBottom: 0 }}>
        <span>
          {channelName}
          {!privateChannel && <Icon name="star outline" color="black"/>}
        </span>
        <Header.Subheader>
          {users && users === 1 ? `1 User` : `${users} Users`}
        </Header.Subheader>
      </Header>
      <Header floated="right">
        <Input
          loading={searchLoading}
          onChange={handleSearchChange}
          size="mini"
          icon="search"
          name="searchTerm"
          placeholder="Search Messages"
        />
      </Header>
    </Segment>
  );
}

export default MessagesHeader;
