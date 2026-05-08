// frontend/src/pages/Room.jsx
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import etherxLogo from '../assets/etherx_transparent.png';
import { fadeIn } from '../utils/animationVariants';
import ChainHUD from '../components/web3/ChainHUD';
import MeetingReceiptModal from '../components/web3/MeetingReceiptModal';
import { ROUTES } from '../utils/constants';
import { useMeetingContract } from '../hooks/useMeetingContract';
import { useMeetingNFT } from '../hooks/useMeetingNFT';
import { useWallet } from '../context/WalletContext';
import { useMeeting } from '../context/MeetingContext';
import { pinJSON } from '../utils/ipfs';
import '../styles/room.css';

export default function Room() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState(null);
  const [isEnding, setIsEnding] = useState(false);

  const { account } = useWallet();
  const { endMeeting, getMeeting, isTxPending, pollEvents } = useMeetingContract();
  const { mintReceipt } = useMeetingNFT();
  const { injectChatMessages, isRecording, startRecording, stopRecording, uploadingRec } = useMeeting();

  const isHost = sessionStorage.getItem('etherx_host_room') === code;

  // Poll on-chain MessageSent events and hydrate local chat state every 30 s.
  // `pollEvents` and `injectChatMessages` are stable useCallback refs — omitting
  // them from deps avoids redundant re-runs while still reacting to auth/room changes.
  useEffect(() => {
    if (!account || !code) return;

    const hydrate = async () => {
      const { messages } = await pollEvents(code, 0).catch(() => ({ messages: [] }));
      if (messages.length) {
        injectChatMessages(messages.map(m => ({
          id: m.cid,
          sender: `${m.sender.slice(0, 6)}…${m.sender.slice(-4)}`,
          text: m.text,
          timestamp: typeof m.timestamp === 'number' && m.timestamp > 1e9
            ? m.timestamp * 1000   // unix seconds → ms
            : Date.now(),
          isSelf: m.sender.toLowerCase() === account.toLowerCase(),
        })));
      }
    };

    hydrate();
    const interval = setInterval(hydrate, 30_000);
    return () => clearInterval(interval);
  }, [account, code]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    document.title = `Meeting · ${code}`;
  }, [code]);

  const handleEndMeeting = async () => {
    if (isRecording) stopRecording();
    setIsEnding(true);
    const meetStart = parseInt(
      sessionStorage.getItem('etherx_meet_start') || String(Date.now()),
      10,
    );
    const txReceipt = await endMeeting(code);
    if (txReceipt) {
      const durationMin = Math.max(1, Math.round((Date.now() - meetStart) / 60000));

      const [meetingData, ipfsCid] = await Promise.all([
        getMeeting(code).catch(() => null),
        pinJSON({
          meetingId: code,
          txHash: txReceipt.hash,
          blockNumber: txReceipt.blockNumber,
          durationMin,
          endedAt: Date.now(),
        }).catch(() => null),
      ]);

      let nftTokenId = null;
      if (ipfsCid) {
        const nft = await mintReceipt(code, ipfsCid).catch(() => null);
        nftTokenId = nft?.tokenId ?? null;
      }

      setReceipt({
        txHash: txReceipt.hash,
        blockNumber: txReceipt.blockNumber,
        durationMin,
        participantCount: meetingData?.participantCount ?? null,
        ipfsCid,
        nftTokenId,
      });
      sessionStorage.removeItem('etherx_host_room');
      sessionStorage.removeItem('etherx_meet_start');
    }
    setIsEnding(false);
  };

  return (
    <div className="etherx-room-wrap">
      {/* Logo overlay */}
      <motion.div
        className="etherx-room-logo"
        role="img"
        aria-label="EtherX Meet logo"
        variants={fadeIn}
        initial="hidden"
        animate="visible"
      >
        <img src={etherxLogo} alt="EtherX Meet" />
      </motion.div>

      {/* Chain status HUD */}
      <ChainHUD txPending={isTxPending} />

      {/* Host controls — bottom center */}
      {isHost && !receipt && (
        <div style={{
          position: 'absolute',
          bottom: 90,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 20,
          display: 'flex',
          gap: 10,
          alignItems: 'center',
        }}>
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={uploadingRec}
            style={{
              background: isRecording ? 'rgba(234,67,53,0.15)' : 'rgba(212,181,113,0.12)',
              border: isRecording ? '1px solid rgba(234,67,53,0.5)' : '1px solid rgba(212,181,113,0.35)',
              color: isRecording ? '#f87171' : '#D4B571',
              borderRadius: 10,
              padding: '10px 20px',
              fontSize: 13,
              fontWeight: 600,
              cursor: uploadingRec ? 'wait' : 'pointer',
              fontFamily: 'DM Sans, sans-serif',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              letterSpacing: '-0.01em',
              transition: 'all 0.15s',
              opacity: uploadingRec ? 0.6 : 1,
            }}
          >
            <span style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: isRecording ? '#f87171' : '#D4B571',
              animation: isRecording ? 'pulse 1.2s ease-in-out infinite' : 'none',
            }} />
            {uploadingRec ? 'Uploading…' : isRecording ? 'Stop Rec' : 'Record'}
          </button>

          <button
            onClick={handleEndMeeting}
            disabled={isEnding}
            style={{
              background: isEnding ? 'rgba(234,67,53,0.7)' : '#ea4335',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              padding: '10px 28px',
              fontSize: 14,
              fontWeight: 700,
              cursor: isEnding ? 'wait' : 'pointer',
              fontFamily: 'DM Sans, sans-serif',
              boxShadow: '0 4px 24px rgba(234,67,53,0.5)',
              letterSpacing: '-0.01em',
              transition: 'background 0.15s',
            }}
          >
            {isEnding ? 'Ending…' : 'End Meeting'}
          </button>
        </div>
      )}

      {/* Receipt modal */}
      <MeetingReceiptModal
        isOpen={!!receipt}
        onClose={() => setReceipt(null)}
        meetingId={code}
        txHash={receipt?.txHash}
        ipfsCid={receipt?.ipfsCid}
        blockNumber={receipt?.blockNumber}
        durationMin={receipt?.durationMin}
        participantCount={receipt?.participantCount}
        nftTokenId={receipt?.nftTokenId}
        onDashboard={() => navigate(ROUTES.DASHBOARD)}
      />

      {/* Jitsi meeting iframe */}
      <iframe
        src={`https://8x8.vc/vpaas-magic-cookie-a390c03ef55e457ebeb88a41bdb4af08/${code}`}
        style={{ width: '100vw', height: '100vh', border: 'none', display: 'block' }}
        allow="camera; microphone; fullscreen; display-capture; autoplay"
        allowFullScreen
      />

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
