import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useRoomSocket } from '../../../../hooks/useRoomSocket';

const MOODS = ['😊', '😐', '😴', '😤', '🤔', '🎉', '😰', '💪'];

export default function EmojiMoodCheck({ onClose }) {
  const { code } = useParams();
  const socketRef = useRoomSocket(code);

  const [selectedMood, setSelectedMood] = useState(null);
  const [responses, setResponses] = useState([]);

  // Listen for mood submissions from other participants
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;
    const onMood = ({ emoji, name }) => {
      setResponses(prev => [...prev, { id: Date.now() + Math.random(), name, emoji }]);
    };
    socket.on('mood:new', onMood);
    return () => socket.off('mood:new', onMood);
  }, []);

  const handleMoodSelect = (emoji) => {
    setSelectedMood(emoji);
    // Broadcast this user's mood selection to the room
    socketRef.current?.emit('mood:submit', { roomCode: code, emoji, name: 'You' });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center"
    >
      <h3 className="font-syne font-bold text-xl mb-6">How are you feeling?</h3>

      {!selectedMood ? (
        <div className="grid grid-cols-4 gap-4">
          {MOODS.map((emoji) => (
            <motion.button
              key={emoji}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleMoodSelect(emoji)}
              className="text-5xl p-4 glass rounded-xl hover:bg-app-surface"
            >
              {emoji}
            </motion.button>
          ))}
        </div>
      ) : (
        <div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-8xl mb-6"
          >
            {selectedMood}
          </motion.div>

          <p className="text-gray-400 mb-6">Waiting for others...</p>

          <div className="grid grid-cols-4 gap-3">
            {responses.map((r) => (
              <motion.div
                key={r.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="glass-card p-3 rounded-xl text-center"
              >
                <div className="text-3xl mb-1">{r.emoji}</div>
                <div className="text-xs truncate">{r.name}</div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
