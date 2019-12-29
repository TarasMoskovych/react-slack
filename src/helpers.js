import md5 from 'md5';

export const generateAvatar = id => `http://gravatar.com/avatar/${md5(id)}?d=identicon`;

export const Collections = {
  Users: 'users'
};
