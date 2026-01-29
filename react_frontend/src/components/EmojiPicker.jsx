import React from 'react';
import { Twemoji } from './Twemoji';

const EmojiPicker = ({ onSelect }) => {
  const emojis = [
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣',
    '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰',
    '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜',
    '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏',
    '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
    '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠',
    '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙',
    '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💪',
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍',
    '💯', '💫', '⭐', '🌟', '✨', '⚡', '🔥', '💥'
  ];

  return (
    <div className="p-4 bg-white border border-gray-200 shadow-lg rounded-2xl w-80">
      <div className="grid grid-cols-8 gap-2 overflow-y-auto max-h-48">
        {emojis.map((emoji, index) => (
          <button
            key={index}
            onClick={() => onSelect(emoji)}
            className="p-2 text-lg transition-colors duration-200 rounded-lg hover:bg-gray-100"
          >
            <Twemoji>{emoji}</Twemoji>
          </button>
        ))}
      </div>
    </div>
  );
};

export default EmojiPicker;