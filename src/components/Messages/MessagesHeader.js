import React from 'react';
import { Header, Segment, Icon, Input } from 'semantic-ui-react';

const MessagesHeader = ({ channel, handleSearchChange, users, searchLoading, privateChannel, handleStar, isChannelStarred }) => {
  return (
    <Segment style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Header fluid="true" as="h2" style={{ marginBottom: 0 }}>
        <span>
          {channel ? `${privateChannel ? '@' : '#'}${channel?.name}` : ''}
          {!privateChannel && channel && (
            <Icon
              onClick={handleStar}
              link
              name={isChannelStarred ? 'star' : 'star outline'}
              color={isChannelStarred ? 'yellow' : 'black'}
            />
          )}
        </span>
        {!privateChannel && (
          <Header.Subheader>
            {users === 1 ? `1 User` : `${users} Users`}
          </Header.Subheader>
        )}
      </Header>
      <Header style={{ margin: 0 }}>
        <Input
          disabled={!channel}
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
