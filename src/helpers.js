import md5 from 'md5';
import { emojiIndex } from 'emoji-mart';

export const generateAvatar = id => `http://gravatar.com/avatar/${md5(id)}?d=identicon`;
export const resources = (isPrivate, id) => isPrivate ? `private/${id}` : 'public/'
export const colonToInicode = message => {
  return message.replace(/:[A-Za-z0-9_=-]+:/g, x => {
    x = x.replace(/:/g, '');

    let emoji = emojiIndex.emojis[x];
    if (typeof emoji !== 'undefined') {
      let unicode = emoji.native;

      if (typeof unicode !== 'undefined') {
        return unicode;
      }
    }

    x = ':' + x + ':';
    return x;
  });
};
