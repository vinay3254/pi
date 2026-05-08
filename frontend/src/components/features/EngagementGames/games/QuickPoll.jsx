import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Send, X } from 'lucide-react';
import { useParams } from 'react-router-dom';
import Button from '../../../ui/Button';
import Input from '../../../ui/Input';
import { useRoomSocket } from '../../../../hooks/useRoomSocket';

export default function QuickPoll({ onClose }) {
  const { code } = useParams();
  const socketRef = useRoomSocket(code);
  // Stable poll ID for the lifetime of this component instance
  const [pollId] = useState(() => `poll-${Date.now()}`);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [isLive, setIsLive] = useState(false);
  const [votes, setVotes] = useState({});

  const addOption = () => setOptions([...options, '']);

  const updateOption = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const launchPoll = () => {
    const poll = { id: pollId, question, options: options.filter((o) => o), votes: {} };
    setIsLive(true);
    // Broadcast the new poll to everyone in the room
    socketRef.current?.emit('poll:create', { roomCode: code, poll });
  };

  // Cast a vote and broadcast it to all room participants
  const handleVote = (optionIdx) => {
    socketRef.current?.emit('poll:vote', { roomCode: code, pollId, optionIdx });
  };

  // Listen for incoming votes from any participant (including self, since server uses io.to)
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;
    const onVote = ({ pollId: pid, optionIdx }) => {
      if (pid !== pollId) return;
      setVotes((prev) => ({ ...prev, [optionIdx]: (prev[optionIdx] || 0) + 1 }));
    };
    socket.on('poll:vote', onVote);
    return () => socket.off('poll:vote', onVote);
  }, [pollId]);

  const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-syne font-bold text-lg">Quick Poll</h3>
        <Button variant="ghost" onClick={onClose} icon={<X />} />
      </div>

      {!isLive ? (
        <div className="space-y-4">
          <Input
            label="Question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="What should we discuss next?"
          />

          <div className="space-y-2">
            <label className="text-sm text-gray-400">Options</label>
            {options.map((opt, i) => (
              <Input
                key={i}
                value={opt}
                onChange={(e) => updateOption(i, e.target.value)}
                placeholder={`Option ${i + 1}`}
              />
            ))}

            <Button variant="ghost" onClick={addOption} icon={<Plus />} fullWidth>
              Add Option
            </Button>
          </div>

          <Button
            variant="primary"
            fullWidth
            onClick={launchPoll}
            disabled={!question || options.filter((o) => o).length < 2}
            icon={<Send />}
          >
            Launch Poll
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <h4 className="font-semibold">{question}</h4>
          <p className="text-sm text-gray-400">{totalVotes} votes</p>

          {options.filter((o) => o).map((opt, i) => {
            const voteCount = votes[i] || 0;
            const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;

            return (
              <div key={i} className="glass-card p-3 rounded-xl">
                <div className="flex justify-between mb-2">
                  <span>{opt}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{Math.round(percentage)}%</span>
                    {/* Vote button lets the local user cast their vote */}
                    <button
                      onClick={() => handleVote(i)}
                      className="rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-xs text-white/80 hover:bg-white/20"
                    >
                      Vote
                    </button>
                  </div>
                </div>
                <div className="h-2 bg-app-surface rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    className="h-full bg-gradient-to-r from-app-primary to-app-secondary"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
