import React, { Component, Fragment } from 'react';
import { Sidebar, Menu, Divider, Button, Modal, Icon, Label } from 'semantic-ui-react';
import { SketchPicker } from 'react-color';
import { connect } from 'react-redux';
import { setColors } from './../../store/actions';
import { databases } from './../../firebase';

class ColorPanel extends Component {
  state = {
    colors: [],
    modal: false,
    primary: '#40bf43',
    secondary: '#2d4d86',
    user: this.props.currentUser,
    usersRef: databases.users()
  }

  componentDidMount() {
    const { user } = this.state;

    if (user) {
      this.addListeners(user.uid);
    }
  }

  componentWillUnmount() {
    this.removeListeners();
  }

  // Effects
  addListeners = uid => {
    const { usersRef } = this.state;

    usersRef
      .child(`${uid}/colors`)
      .on('child_added', snapshot => this.setState({ colors: [].concat(snapshot.val()).concat(this.state.colors) }));

    usersRef
      .child(`${uid}/colors`)
      .on('child_removed', snapshot => this.setState({ colors: this.state.colors.filter(color => color.id !== snapshot.val()?.id) }));
  }

  removeListeners = () => {
    const { usersRef, user } = this.state;

    usersRef.child(`${user.uid}/colors`).off();
  }

  saveColors = () => {
    const { primary, secondary, usersRef, user } = this.state;
    const id = Date.now();

    usersRef
      .child(`${user.uid}/colors`)
      .child(id)
      .update({ id, primary, secondary })
      .catch(err => console.error(err))
      .finally(() => this.closeModal());
  }

  removeColor = color => {
    const { usersRef, user } = this.state;

    usersRef
    .child(`${user.uid}/colors`)
    .child(color.id)
    .remove()
    .then(() => this.props.setColors({}));
  }

  // Listeners
  handleSaveColors = () => this.saveColors();

  handleChangePrimary = ({ hex }) => this.setState({ primary: hex });

  handleChangeSecondary = ({ hex }) => this.setState({ secondary: hex });

  // Helpers
  openModal = () => this.setState({ modal: true });

  closeModal = () => this.setState({ modal: false });

  // Renders
  renderColors = colors => {
    return colors.length > 0 && colors.map((color, idx) => (
      <Fragment key={idx}>
        <Divider/>
        <div className="color">
          {color.id !== 0 && <div className="color__remove-icon" onClick={() => this.removeColor(color)}/>}
          <div
            className={`color__container ${this.props.colors.id === color.id ? 'color__container--selected ' : ''}`}
            onClick={() => this.props.setColors(color)}
          ><div className="color__square" style={{ background: color.primary }}>
              <div className="color__overlay" style={{ background: color.secondary }}/>
            </div>
          </div>
        </div>
      </Fragment>
    ));
  }

  render() {
    const { modal, primary, secondary, colors } = this.state;

    return (
      <Sidebar as={Menu} icon="labeled" inverted vertical visible width="very thin">
        <Divider/>
        <Button icon="add" size="small" color="blue" onClick={this.openModal}/>
        {/* Custom */}
        {this.renderColors(colors)}
        {/* Default */}
        {this.renderColors([{ id: 0, primary: '#4c3c4c', secondary: '#eee' }])}
        <Modal basic open={modal}>
          <Modal.Header style={{ textAlign: 'center' }}>Choose App Colors</Modal.Header>
          <Modal.Content>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{ marginRight: '10px' }}>
                <Label content="Primary Color" style={{ marginBottom: '1em' }}/>
                <SketchPicker
                  color={primary}
                  onChange={this.handleChangePrimary}
              />
              </div>
              <div style={{ marginLeft: '10px' }}>
                <Label content="Secondary Color" style={{ marginBottom: '1em' }}/>
                <SketchPicker
                  color={secondary}
                  onChange={this.handleChangeSecondary}
                />
              </div>
            </div>
          </Modal.Content>
          <Modal.Actions>
            <Button color="green" inverted onClick={this.handleSaveColors}>
              <Icon name="checkmark"/>Save Colors
            </Button>
            <Button color="red" inverted onClick={this.closeModal}>
              <Icon name="remove"/>Cancel
            </Button>
          </Modal.Actions>
        </Modal>
      </Sidebar>
    );
  }
}

export default connect(null, { setColors })(ColorPanel);
