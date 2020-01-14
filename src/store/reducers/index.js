import { combineReducers } from 'redux';
import * as actionTypes from './../actions/types';

const initialUserState = {
  currentUser: null,
  isLoading: true
};

const user_reducer = (state = initialUserState, action) => {
  switch (action.type) {
    case actionTypes.SET_USER:
      return {
        currentUser: action.payload.currentUser,
        isLoading: false
      };
    case actionTypes.CLEAR_USER:
      return {
        ...state,
        currentUser: null,
        isLoading: false
      };
    default:
      return state;
  }
};

const initialChannelState = {
  currentChannel: null,
  isPrivateChannel: false,
  isStarredChannel: false,
  isCurrentChannelStarred: false,
  userPosts: null
};

const channel_reducer = (state = initialChannelState, action) => {
  switch (action.type) {
    case actionTypes.SET_CHANNEL:
      return {
        ...state,
        currentChannel: action.payload.currentChannel,
        isStarredChannel: false,
        isPrivateChannel: false
      };
    case actionTypes.SET_PRIVATE_CHANNEL:
      return {
        ...state,
        isStarredChannel: false,
        isPrivateChannel: action.payload.isPrivateChannel
      };
    case actionTypes.SET_STARRED_CHANNEL:
      return {
        ...state,
        isPrivateChannel: false,
        isStarredChannel: action.payload.isStarredChannel
      };
    case actionTypes.SET_STARRED_CURRENT_CHANNEL:
      return {
        ...state,
        isPrivateChannel: false,
        isCurrentChannelStarred: action.payload.isCurrentChannelStarred
      };
    case actionTypes.SET_USER_POSTS:
      return {
        ...state,
        userPosts: action.payload.userPosts
      };
    default:
      return state;
  }
};

const initialColorsState = {
  id: 0,
  primary: '#4c3c4c',
  secondary: '#eee'
};

const colors_reducer = (state = initialColorsState, action) => {
  switch (action.type) {
    case actionTypes.SET_COLORS:
      return {
        id: action?.payload?.id || 0,
        primary: action?.payload?.primary || '#4c3c4c',
        secondary: action?.payload?.secondary || '#eee',
      };
    default:
      return state;
  }
};

export default combineReducers({
  user: user_reducer,
  channel: channel_reducer,
  colors: colors_reducer
});
