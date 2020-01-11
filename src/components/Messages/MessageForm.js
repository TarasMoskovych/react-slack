import React, { Component } from 'react';
import { Segment, Button, Input } from 'semantic-ui-react';
import uuidv4 from 'uuid/v4';
import firebase from './../../firebase';
import { Collections } from './../../helpers';
import FileModal from './FileModal';
import ProgressBar from './ProgressBar';

class MessageForm extends Component {
  state = {
    channel: this.props.currentChannel,
    errors: [],
    loading: false,
    message: '',
    modal: false,
    percentUploaded: 0,
    storageRef: firebase.storage().ref(),
    task: null,
    upload: '',
    user: this.props.currentUser
  }

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value, errors: [] });
  }

  handleKeyPress = event => {
    if (event.key === 'Enter') {
      this.sendMessage();
    }
  }

  sendMessage = () => {
    const { message, channel, errors } = this.state;
    const { messagesRef } = this.props;

    if (message.trim()) {
      this.setState({ loading: true });

      messagesRef
        .child(channel.id)
        .push()
        .set(this.createMessage())
        .then(() => {
          this.setState({ errors: [] });
          this.props.scrollToLastMessage();
        })
        .catch((e) => this.setState({ loading: false, errors: errors.concat(e) }))
        .finally(() => this.setState({ loading: false, message: '' }));
    } else {
      this.setState({ errors: errors.concat({ message: 'Add a message' }) });
    }
  }

  sendFileMessage = (downloadURL, ref, pathToUpload) => {
    const { errors } = this.state;

    ref
      .child(pathToUpload)
      .push()
      .set(this.createMessage(downloadURL))
      .then(() => {
        this.setState({ upload: 'done' })
        this.props.scrollToLastMessage();
      })
      .catch(err => {
        console.log(err);
        this.setState({ errors: errors.concat(err) });
      });
  }

  createMessage = (fileUrl = null) => {
    const { user, message } = this.state;

    const data = {
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      user: {
        id: user.uid,
        name: user.displayName,
        avatar: user.photoURL
      }
    };

    if (fileUrl) {
      data.image = fileUrl;
    } else {
      data.content = message;
    }

    return data;
  }

  openModal = () => this.setState({ modal: true });

  closeModal = () => this.setState({ modal: false });

  uploadFile = (file, metadata) => {
    const { channel, storageRef, errors } = this.state;

    this.setState({ upload: 'uploading', task: storageRef
      .child(`${Collections.resources}${uuidv4()}.jpg`)
      .put(file, metadata) },
        () => {
          this.state.task.on('state_changed', snapshot => {
            this.setState({ percentUploaded: Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100) });
          },
          err => {
            console.error(err);
            this.setState({ errors: errors.concat(err), upload: 'error', task: null });
          },
          () => {
            this.state.task.snapshot.ref.getDownloadURL().then(downloadURL => {
              this.sendFileMessage(downloadURL, this.props.messagesRef, channel.id);
            })
            .catch(err => {
              console.error(err);
              this.setState({ errors: errors.concat(err), upload: 'error', task: null });
            });
          });
        });
  }

  render() {
    const { errors, message, loading, modal, upload, percentUploaded } = this.state;

    return (
      <Segment className="message__form">
        <Input
          fluid
          name="message"
          style={{ marginBottom: '.7em' }}
          label={<Button icon="add"/>}
          labelPosition="left"
          placeholder="Type a message"
          onChange={this.handleChange}
          onKeyPress={this.handleKeyPress}
          value={message}
          className={
            errors.some(error => error.message.includes('message')) ? 'error' : ''
          }
        />
        <Button.Group icon widths="2">
          <Button
            color="orange"
            content="Add Repply"
            labelPosition="left"
            icon="edit"
            onClick={this.sendMessage}
            disabled={loading}
          />
          <Button
            color="teal"
            content="Upload Media"
            labelPosition="right"
            icon="cloud upload"
            disabled={upload === 'uploading'}
            onClick={this.openModal}
          />
        </Button.Group>
        <FileModal
          modal={modal}
          closeModal={this.closeModal}
          uploadFile={this.uploadFile}
        />
        <ProgressBar upload={upload} percentUploaded={percentUploaded}/>
      </Segment>
    );
  }
}

export default MessageForm;