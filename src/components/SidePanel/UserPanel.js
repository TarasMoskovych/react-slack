import React, { Component } from 'react';
import { Grid, Header, Icon, Dropdown, Image, Modal, Input, Button } from 'semantic-ui-react';
import AvatarEditor from 'react-avatar-editor';
import firebase, { databases } from './../../firebase';

class UserPanel extends Component {
  state = {
    modal: false,
    preview: '',
    user: this.props.currentUser,
    loading: false,
    cropped: '',
    blob: '',
    userRef: databases.user(),
    usersRef: databases.users(),
    storageRef: databases.storage(),
    uploaded: '',
  }

  // Effects
  handleSignOut = () => {
    firebase
      .auth()
      .signOut();
  };

  uploadImage = () => {
    const { storageRef, blob, user } = this.state;
    this.setState({ loading: true });

    storageRef
      .child(`avatars/user-${user.uid}/${Date.now()}`)
      .put(blob, { contentType: 'image/jpeg' })
      .then(snapshot => {
        snapshot.ref.getDownloadURL().then(downloadURL => {
          this.setState({ uploaded: downloadURL }, () => this.changeAvatar());
        });
      });
  }

  changeAvatar = () => {
    const { userRef, uploaded, user, usersRef } = this.state;

    userRef
      .updateProfile({ photoURL: uploaded })
      .catch(err => console.error(err))
      .finally(() => this.closeModal());

    usersRef
      .child(user.uid)
      .update({ photoURL: uploaded})
      .catch(err => console.error(err));
  }

  // Listeners
  openModal = () => this.setState({ modal: true });

  closeModal = () => this.setState({ modal: false, loading: false, blob: null, cropped: '', uploaded: '', preview: '' });

  handleChange = event => {
    const file = event.target.files[0];
    const reader = new FileReader();

    if (file) {
      reader.readAsDataURL(file);
      reader.addEventListener('load',
        () => {
          this.setState({ preview: reader.result });
        }, { once: true });
    }
  }

  handleCropImage = () => {
    if (this.avatarEditor) {
      this.avatarEditor.getImageScaledToCanvas().toBlob(blob => {
        const url = URL.createObjectURL(blob);
        this.setState({ cropped: url, blob });
      });
    }
  }

  // Helpers
  dropdownOptions = () => [
    {
      key: 'user',
      text: <span>Signed in as <strong>{this.state.user.displayName}</strong></span>,
      disabled: true
    },
    {
      key: 'avatar',
      text: <span onClick={this.openModal}>Change Avatar</span>,
    },
    {
      key: 'signout',
      text: <span onClick={this.handleSignOut}>Sign Out</span>,
    },
  ];

  render() {
    const { user, modal, preview, cropped, loading } = this.state;

    return (
      <Grid style={{ background: this.props.colors.primary }}>
        <Grid.Column>
          <Grid.Row style={{ padding: '1.2em', margin: 0 }}>
            <Header inverted floated="left" as="h2">
              <Icon name="code"/>
              <Header.Content>
                DevChat
              </Header.Content>
            </Header>
            <Header style={{ padding: '.25em' }} as="h4" inverted>
              <Dropdown
                trigger={
                  <span>
                    <Image src={user.photoURL} spaced="right" avatar/>
                    {user.displayName}
                  </span>
                }
                options={this.dropdownOptions()}
              />
            </Header>
          </Grid.Row>
          <Modal basic open={modal}>
            <Modal.Header>Change Avatar</Modal.Header>
            <Modal.Content>
              <Input
                onChange={this.handleChange}
                fluid
                type="file"
                label="New Avatar"
                name="previewImage"
              />
              <Grid centered stackable columns={2}>
                <Grid.Row centered>
                  <Grid.Column className="ui center aligned grid">
                    {preview && (
                      <AvatarEditor
                        ref={node => this.avatarEditor = node}
                        image={preview}
                        width={120}
                        height={120}
                        border={50}
                        scale={1.2}
                      />
                    )}
                  </Grid.Column>
                  <Grid.Column className="ui center aligned grid">
                    {cropped && (
                      <Image
                        src={cropped}
                        height={100}
                        style={{ margin: '3.5em auto' }}
                        width={100}
                      />
                    )}
                  </Grid.Column>
                </Grid.Row>
              </Grid>
            </Modal.Content>
            <Modal.Actions>
              {cropped && <Button loading={loading} color="green" inverted onClick={this.uploadImage}>
                <Icon name="save"/>Change Avatar
              </Button>}
              <Button color="green" inverted onClick={this.handleCropImage}>
                <Icon name="image"/>Preview
              </Button>
              <Button color="red" inverted onClick={this.closeModal}>
                <Icon name="remove"/>Cancel
              </Button>
            </Modal.Actions>
          </Modal>
        </Grid.Column>
      </Grid>
    );
  }
}

export default UserPanel;
