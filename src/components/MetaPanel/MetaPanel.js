import React, { Component } from 'react';
import { Segment, Accordion, Header, Icon, Image, List } from 'semantic-ui-react';

class MetaPanel extends Component {
  state = {
    activeIdx: 0,
    channel: this.props.currentChannel
  }

  setActiveIdx = (event, titleProps) => {
    const { index } = titleProps;
    const { activeIdx } = this.state;
    const newIdx = activeIdx === index ? -1 : index;

    this.setState({ activeIdx: newIdx });
  }

  // Renders
  renderTopPosters(posts) {
    return posts && Object
      .entries(posts)
      .sort((a, b) => b[1] - a[1])
      .map(([key, val], idx) => (
        <List.Item key={idx}>
          <Image avatar src={val.photoURL}/>
          <List.Content>
            <List.Header as="a">{key}</List.Header>
              <List.Description>{val.count} {val.count === 1 ? 'post' : 'posts'}</List.Description>
          </List.Content>
        </List.Item>
      )).slice(0, 5);
  }

  render() {
    const { activeIdx, channel } = this.state;
    const { userPosts } = this.props;

    return (
      <Segment loading={!channel}>
        <Header as="h3" attached="top">
          About # {channel?.name}
        </Header>
        <Accordion styled attached="true">
          <Accordion.Title active={activeIdx === 0} index={0} onClick={this.setActiveIdx}>
            <Icon name="dropdown"/>
            <Icon name="info"/>
            Channel Details
          </Accordion.Title>
          <Accordion.Content active={activeIdx === 0} index={0}>
            {channel?.details}
          </Accordion.Content>
          <Accordion.Title active={activeIdx === 1} index={1} onClick={this.setActiveIdx}>
            <Icon name="dropdown"/>
            <Icon name="user circle"/>
            Top Posters
          </Accordion.Title>
          <Accordion.Content active={activeIdx === 1} index={1}>
            <List>
              {this.renderTopPosters?.(userPosts)}
            </List>
          </Accordion.Content>
          <Accordion.Title active={activeIdx === 2} index={2} onClick={this.setActiveIdx}>
            <Icon name="dropdown"/>
            <Icon name="pencil alternate"/>
            Created By
          </Accordion.Title>
          <Accordion.Content active={activeIdx === 2} index={2}>
            <Header as="h4">
              <Image circular src={channel?.createdBy.photoURL}/>
              {channel?.createdBy.name}
            </Header>
          </Accordion.Content>
        </Accordion>
      </Segment>
    );
  }
}

export default MetaPanel;
