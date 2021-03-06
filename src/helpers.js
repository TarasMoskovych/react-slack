import ReactDOM from 'react-dom';
import md5 from 'md5';

export const generateAvatar = id => `http://gravatar.com/avatar/${md5(id)}?d=identicon`;
export const resources = (isPrivate, id) => isPrivate ? `private/${id}` : 'public/'
export const focusFirstInvalidField = container => {
  ReactDOM
    .findDOMNode(container)
    .querySelector(`[name="${container.props.name}"]`)
    .focus();
};
