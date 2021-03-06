import * as actionTypes from './types';

export const setUser = user => {
  return {
    type: actionTypes.SET_USER,
    payload: {
      currentUser: user
    }
  };
};

export const clearUser = () => {
  return {
    type: actionTypes.CLEAR_USER
  };
};

export const setChannel = channel => {
  return {
    type: actionTypes.SET_CHANNEL,
    payload: {
      currentChannel: channel
    }
  };
};

export const setPrivateChannel = isPrivateChannel => {
  return {
    type: actionTypes.SET_PRIVATE_CHANNEL,
    payload: {
      isPrivateChannel
    }
  };
};

export const setStarredChannel = isStarredChannel => {
  return {
    type: actionTypes.SET_STARRED_CHANNEL,
    payload: {
      isStarredChannel
    }
  };
};

export const setStarredCurrentChannel = isCurrentChannelStarred => {
  return {
    type: actionTypes.SET_STARRED_CURRENT_CHANNEL,
    payload: {
      isCurrentChannelStarred
    }
  };
};

export const setUserPosts = userPosts => {
  return {
    type: actionTypes.SET_USER_POSTS,
    payload: {
      userPosts
    }
  };
};

export const setColors = ({ id, primary, secondary }) => {
  return {
    type: actionTypes.SET_COLORS,
    payload: {
      id,
      primary,
      secondary
    }
  };
};
