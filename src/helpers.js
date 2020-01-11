import md5 from 'md5';

export const generateAvatar = id => `http://gravatar.com/avatar/${md5(id)}?d=identicon`;

export const Collections = {
  ConnectedRef: '.info/connected',
  Channels: 'channels',
  Messages: 'messages',
  Presence: 'presence',
  PrivateMessages: 'privateMessages',
  Users: 'users',
  resources: (isPrivate, id) => isPrivate ? `private/${id}` : 'public/'
};
