import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Users, Clock } from 'lucide-react';
import { useMeetingContext } from '../../../context/MeetingContext';
import { useAudioAnalyser } from '../../../hooks/useAudioAnalyser';
import Button from '../../ui/Button';
import SpeakingTimeChart from './SpeakingTimeChart';
import EngagementScores from './EngagementScores';
import MeetingPace from './MeetingPace';
import ParticipantInsights from './ParticipantInsights';

export default function AnalyticsOverlay({ isOpen, onClose }) {
  const { participants, startTime } = useMeetingContext();
  const [analyticsData, setAnalyticsData] = useState({});
  const { start, stop, volume, isSpeaking } = useAudioAnalyser();

  // Seed stable baseline values for remote participants so the first render
  // shows something reasonable before the slow interval fires.
  const remoteBaselineRef = useRef(null);
  if (!remoteBaselineRef.current && participants.length > 1) {
    remoteBaselineRef.current = participants.slice(1).map(() => ({
      time: 40 + Math.random() * 30,
      percentage: 15 + Math.floor(Math.random() * 20),
      score: 65 + Math.floor(Math.random() * 25),
      reactions: Math.floor(Math.random() * 6),
      messages: Math.floor(Math.random() * 8),
      interruptions: Math.floor(Math.random() * 3),
    }));
  }

  // -----------------------------------------------------------------------
  // Start / stop real mic when the panel opens or closes
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (isOpen) {
      start();
    } else {
      stop();
    }
    // Ensure mic is released on unmount even if isOpen is still true
    return () => stop();
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // -----------------------------------------------------------------------
  // Build analytics data: local participant uses live mic data; remote
  // participants use a slow-updating simulation (±5 drift every 8 s).
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (!participants.length) return;

    // Helper: clamp a value to [min, max]
    const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

    // Initial state from baselines (or defaults)
    const getInitialRemote = (i) => {
      const b = remoteBaselineRef.current?.[i];
      return b ?? { time: 40, percentage: 20, score: 70, reactions: 3, messages: 5, interruptions: 1 };
    };

    // Seed state on first call so we have something to render immediately
    setAnalyticsData((prev) => {
      // If already populated, keep existing values; otherwise build from baseline
      if (prev.speakingTime?.length) return prev;
      const remoteParticipants = participants.slice(1);
      return {
        speakingTime: [
          { name: participants[0]?.name ?? 'You', time: volume, percentage: Math.round(volume) },
          ...remoteParticipants.map((p, i) => {
            const b = getInitialRemote(i);
            return { name: p.name, time: b.time, percentage: b.percentage };
          }),
        ],
        engagement: [
          { name: participants[0]?.name ?? 'You', score: isSpeaking ? 90 : 70, reactions: 0, messages: 0 },
          ...remoteParticipants.map((p, i) => {
            const b = getInitialRemote(i);
            return { name: p.name, score: b.score, reactions: b.reactions, messages: b.messages };
          }),
        ],
        interruptions: [
          { name: participants[0]?.name ?? 'You', count: 0 },
          ...remoteParticipants.map((p, i) => {
            const b = getInitialRemote(i);
            return { name: p.name, count: b.interruptions };
          }),
        ],
        pace: 'on-track',
      };
    });

    // ---- Slow simulation for remote participants (every 8 s) ---------------
    const interval = setInterval(() => {
      setAnalyticsData((prev) => {
        const remoteParticipants = participants.slice(1);
        const drift = () => (Math.random() * 10 - 5); // ±5

        return {
          ...prev,
          speakingTime: [
            // Local user: real volume data injected in the rAF effect below
            prev.speakingTime?.[0] ?? { name: participants[0]?.name ?? 'You', time: 0, percentage: 0 },
            ...remoteParticipants.map((p, i) => {
              const cur = prev.speakingTime?.[i + 1] ?? getInitialRemote(i);
              return {
                name: p.name,
                time: clamp((cur.time ?? 40) + drift(), 5, 100),
                percentage: clamp(Math.round((cur.percentage ?? 20) + drift()), 5, 40),
              };
            }),
          ],
          engagement: [
            prev.engagement?.[0] ?? { name: participants[0]?.name ?? 'You', score: 70, reactions: 0, messages: 0 },
            ...remoteParticipants.map((p, i) => {
              const cur = prev.engagement?.[i + 1] ?? getInitialRemote(i);
              return {
                name: p.name,
                score: clamp(Math.round((cur.score ?? 70) + drift()), 50, 100),
                reactions: Math.max(0, Math.round((cur.reactions ?? 3) + (Math.random() > 0.7 ? 1 : 0))),
                messages: Math.max(0, Math.round((cur.messages ?? 5) + (Math.random() > 0.6 ? 1 : 0))),
              };
            }),
          ],
          interruptions: [
            prev.interruptions?.[0] ?? { name: participants[0]?.name ?? 'You', count: 0 },
            ...remoteParticipants.map((p, i) => {
              const cur = prev.interruptions?.[i + 1] ?? getInitialRemote(i);
              return {
                name: p.name,
                count: Math.max(0, Math.round((cur.count ?? 1) + (Math.random() > 0.8 ? 1 : 0))),
              };
            }),
          ],
          // Pace stays stable — random flipping every 8 s is distracting
          pace: prev.pace ?? 'on-track',
        };
      });
    }, 8000);

    return () => clearInterval(interval);
  }, [participants]); // eslint-disable-line react-hooks/exhaustive-deps

  // -----------------------------------------------------------------------
  // Keep the LOCAL participant row updated on every mic sample (via volume
  // state change) without touching the slow-interval remote data.
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (!participants.length) return;
    setAnalyticsData((prev) => {
      if (!prev.speakingTime) return prev;
      const updatedSpeaking = [...(prev.speakingTime ?? [])];
      updatedSpeaking[0] = {
        name: participants[0]?.name ?? 'You',
        time: volume,
        percentage: Math.round(volume),
      };
      const updatedEngagement = [...(prev.engagement ?? [])];
      updatedEngagement[0] = {
        ...updatedEngagement[0],
        name: participants[0]?.name ?? 'You',
        score: isSpeaking ? 90 : 70,
      };
      return { ...prev, speakingTime: updatedSpeaking, engagement: updatedEngagement };
    });
  }, [volume, isSpeaking, participants]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      className="fixed right-0 top-0 h-screen w-96 glass-card border-l border-white/10 flex flex-col z-40 overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="text-app-secondary" size={24} />
          <div>
            <h2 className="font-syne font-bold">Live Insights</h2>
            <p className="text-xs text-gray-400">Real-time analytics</p>
          </div>
        </div>

        {/* Live mic status indicator */}
        <div className="flex items-center gap-1.5 text-xs mr-2 select-none">
          <span
            className={`w-2 h-2 rounded-full flex-shrink-0 transition-colors duration-300 ${
              isSpeaking ? 'bg-green-400 shadow-[0_0_6px_#4ade80]' : 'bg-gray-500'
            }`}
          />
          <span className={isSpeaking ? 'text-green-400' : 'text-gray-400'}>
            {isSpeaking ? 'Local mic live' : 'Mic monitoring'}
          </span>
        </div>

        <Button variant="ghost" onClick={onClose}>✕</Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Meeting Pace */}
        <MeetingPace pace={analyticsData.pace} />

        {/* Speaking Time Chart */}
        <div className="glass-card rounded-xl p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Clock size={18} className="text-app-primary" />
            Speaking Time Distribution
          </h3>
          <SpeakingTimeChart data={analyticsData.speakingTime || []} />
        </div>

        {/* Engagement Scores */}
        <div className="glass-card rounded-xl p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <TrendingUp size={18} className="text-app-ai" />
            Engagement Scores
          </h3>
          <EngagementScores data={analyticsData.engagement || []} />
        </div>

        {/* Participant Insights */}
        <div className="glass-card rounded-xl p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Users size={18} className="text-app-secondary" />
            Participant Activity
          </h3>
          <ParticipantInsights
            interruptions={analyticsData.interruptions || []}
            participants={participants}
          />
        </div>
      </div>
    </motion.div>
  );
}
