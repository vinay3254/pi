import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, SkipForward, MessageCircle, Star, Clock, Users } from 'lucide-react';
import Button from '../../../ui/Button';
import { useMeeting } from '../../../../context/MeetingContext';

const ICEBREAKER_QUESTIONS = [
  "What's your favorite thing about your job?",
  "What's a skill you'd love to learn?",
  "What's your go-to productivity hack?",
  "What's the best advice you've received?",
  "What project are you most proud of?",
];

const SESSION_DURATION = 120; // 2 minutes in seconds

export default function SpeedNetworking({ onClose, onScore }) {
  const { participants } = useMeeting();

  // Slice off the current user at index 0; the rest are networking partners
  const networkingParticipants = participants.slice(1);

  const [phase, setPhase] = useState('lobby'); // lobby, matching, session, break, complete
  const [currentPartner, setCurrentPartner] = useState(null);
  const [timeLeft, setTimeLeft] = useState(SESSION_DURATION);
  const [isPaused, setIsPaused] = useState(false);
  const [sessionIndex, setSessionIndex] = useState(0);
  const [ratings, setRatings] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [connections, setConnections] = useState([]);

  const startNetworking = () => {
    setPhase('matching');
    setTimeout(() => {
      setCurrentPartner(networkingParticipants[0]);
      setCurrentQuestion(ICEBREAKER_QUESTIONS[Math.floor(Math.random() * ICEBREAKER_QUESTIONS.length)]);
      setPhase('session');
    }, 2000);
  };

  // Timer logic
  useEffect(() => {
    if (phase !== 'session' || isPaused) return;

    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          handleSessionEnd();
          return SESSION_DURATION;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, isPaused]);

  const handleSessionEnd = useCallback(() => {
    setPhase('break');
  }, []);

  const rateConnection = (rating) => {
    if (currentPartner) {
      setRatings(prev => ({ ...prev, [currentPartner.id]: rating }));
      if (rating >= 4) {
        setConnections(prev => [...prev, currentPartner]);
        onScore?.('user-1', 50);
      }
    }
    nextSession();
  };

  const nextSession = () => {
    const nextIndex = sessionIndex + 1;
    if (nextIndex >= networkingParticipants.length) {
      setPhase('complete');
    } else {
      setSessionIndex(nextIndex);
      setPhase('matching');
      setTimeout(() => {
        setCurrentPartner(networkingParticipants[nextIndex]);
        setCurrentQuestion(ICEBREAKER_QUESTIONS[Math.floor(Math.random() * ICEBREAKER_QUESTIONS.length)]);
        setTimeLeft(SESSION_DURATION);
        setPhase('session');
      }, 1500);
    }
  };

  const skipSession = () => {
    setPhase('break');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-syne font-bold text-lg">Speed Networking</h3>
        <Button variant="ghost" onClick={onClose} icon={<X />} />
      </div>

      <AnimatePresence mode="wait">
        {/* Lobby Phase */}
        {phase === 'lobby' && (
          <motion.div
            key="lobby"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center space-y-6"
          >
            <div className="text-6xl">🤝</div>
            <div>
              <h4 className="font-syne font-bold text-xl mb-2">Ready to Network?</h4>
              <p className="text-gray-400 text-sm">
                You'll have 2-minute 1-on-1 sessions with other participants.
              </p>
            </div>

            <div className="glass-card p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <Users size={16} className="text-app-secondary" />
                <span className="text-sm font-semibold">{networkingParticipants.length} participants waiting</span>
              </div>
              <div className="flex -space-x-2">
                {networkingParticipants.map((p) => (
                  <div
                    key={p.id}
                    className="w-10 h-10 rounded-full bg-app-surface flex items-center justify-center text-sm font-bold border-2 border-app-dark"
                    title={p.name}
                  >
                    {p.avatar}
                  </div>
                ))}
              </div>
            </div>

            <Button variant="primary" fullWidth onClick={startNetworking} icon={<Play />}>
              Start Networking
            </Button>
          </motion.div>
        )}

        {/* Matching Phase */}
        {phase === 'matching' && (
          <motion.div
            key="matching"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-12"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="text-6xl mb-4"
            >
              🔄
            </motion.div>
            <p className="text-gray-400">Finding your next connection...</p>
          </motion.div>
        )}

        {/* Session Phase */}
        {phase === 'session' && currentPartner && (
          <motion.div
            key="session"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Timer */}
            <div className="glass-card p-3 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Clock size={16} className={timeLeft <= 30 ? 'text-app-danger' : 'text-app-secondary'} />
                  <span className={`text-2xl font-mono font-bold ${
                    timeLeft <= 30 ? 'text-app-danger' : ''
                  }`}>
                    {formatTime(timeLeft)}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => setIsPaused(!isPaused)}
                    icon={isPaused ? <Play size={16} /> : <Pause size={16} />}
                  />
                  <Button
                    variant="ghost"
                    onClick={skipSession}
                    icon={<SkipForward size={16} />}
                  />
                </div>
              </div>
              <div className="h-2 bg-app-surface rounded-full overflow-hidden">
                <motion.div
                  animate={{ width: `${(timeLeft / SESSION_DURATION) * 100}%` }}
                  className={`h-full ${timeLeft <= 30 ? 'bg-app-danger' : 'bg-app-secondary'}`}
                />
              </div>
            </div>

            {/* Partner Info */}
            <div className="glass-card p-6 rounded-xl text-center">
              {/* Render initials avatar instead of emoji */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex justify-center mb-3"
              >
                <div className="w-16 h-16 rounded-full bg-app-surface flex items-center justify-center text-xl font-bold">
                  {currentPartner.avatar}
                </div>
              </motion.div>
              <h4 className="font-syne font-bold text-xl">{currentPartner.name}</h4>
              <p className="text-app-secondary">{currentPartner.role}</p>
              {/* Show engagement score instead of interests */}
              <p className="text-sm text-gray-400 mt-3">
                Engagement: {currentPartner.engagement}%
              </p>
            </div>

            {/* Icebreaker Question */}
            <div className="glass-card p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <MessageCircle size={16} className="text-app-primary" />
                <span className="text-sm font-semibold text-app-primary">Icebreaker</span>
              </div>
              <p className="text-sm">{currentQuestion}</p>
            </div>

            {/* Session Counter */}
            <p className="text-center text-sm text-gray-500">
              Session {sessionIndex + 1} of {networkingParticipants.length}
            </p>
          </motion.div>
        )}

        {/* Break Phase - Rate Connection */}
        {phase === 'break' && currentPartner && (
          <motion.div
            key="break"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center space-y-4"
          >
            {/* Render initials avatar */}
            <div className="flex justify-center">
              <div className="w-10 h-10 rounded-full bg-app-surface flex items-center justify-center font-bold">
                {currentPartner.avatar}
              </div>
            </div>
            <h4 className="font-semibold">How was your chat with {currentPartner.name}?</h4>

            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <motion.button
                  key={rating}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => rateConnection(rating)}
                  className="p-2"
                >
                  <Star
                    size={32}
                    className={`transition-colors ${
                      rating <= (ratings[currentPartner.id] || 0)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-600'
                    }`}
                  />
                </motion.button>
              ))}
            </div>

            <p className="text-xs text-gray-500">
              Rate 4+ to save as a connection
            </p>

            <Button variant="ghost" onClick={nextSession}>
              Skip Rating
            </Button>
          </motion.div>
        )}

        {/* Complete Phase */}
        {phase === 'complete' && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-6 space-y-4"
          >
            <div className="text-6xl">🎉</div>
            <h3 className="font-syne font-bold text-2xl">Networking Complete!</h3>

            {connections.length > 0 ? (
              <div className="glass-card p-4 rounded-xl">
                <p className="text-sm text-gray-400 mb-3">
                  You made {connections.length} connection{connections.length > 1 ? 's' : ''}!
                </p>
                <div className="flex justify-center -space-x-2">
                  {connections.map((c) => (
                    <div
                      key={c.id}
                      className="w-12 h-12 rounded-full bg-app-surface flex items-center justify-center font-bold border-2 border-app-primary"
                      title={c.name}
                    >
                      {c.avatar}
                    </div>
                  ))}
                </div>
                <div className="mt-3 space-y-1">
                  {connections.map((c) => (
                    <p key={c.id} className="text-sm">
                      <span className="font-semibold">{c.name}</span>
                      <span className="text-gray-400"> - {c.role}</span>
                    </p>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-gray-400">
                No connections saved this round. Try rating 4+ next time!
              </p>
            )}

            <div className="pt-4">
              <Button variant="primary" onClick={onClose}>
                Finish
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
