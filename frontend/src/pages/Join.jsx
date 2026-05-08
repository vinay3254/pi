import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import AnimatedPage from '../components/layout/AnimatedPage';
import { staggerContainer, staggerChild } from '../utils/animationVariants';
import { useUI } from '../context/UIContext';
import { useUserContext } from '../context/UserContext';
import etherxLogo from '../assets/etherx_transparent.png';
import OnChainConfirmModal from '../components/web3/OnChainConfirmModal';
import { useWallet } from '../context/WalletContext';
import { useMeetingContract } from '../hooks/useMeetingContract';

const GOLD = '#D4B571';
const GOLD_BORDER = 'rgba(212,181,113,0.3)';

const inputStyle = {
  width: '100%', boxSizing: 'border-box',
  background: 'rgba(255,255,255,0.06)',
  border: `1px solid rgba(255,255,255,0.15)`,
  borderRadius: 10, padding: '11px 14px',
  fontSize: 14, color: '#fff',
  outline: 'none', fontFamily: 'DM Sans, sans-serif',
  transition: 'border-color 0.2s',
};

const labelStyle = {
  display: 'block', fontSize: 12,
  color: 'rgba(255,255,255,0.75)',
  marginBottom: 7, letterSpacing: '0.03em', fontWeight: 500,
};

export default function Join() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToast } = useUI();
  const { user, updateUser } = useUserContext();
  const { account } = useWallet();
  const {
    joinMeeting, createMeeting,
    isTxPending, txHash, error: contractError,
  } = useMeetingContract();

  const [meetingCode, setMeetingCode] = useState('');
  const [displayName, setDisplayName] = useState(user.name || '');
  const [codeError, setCodeError] = useState('');
  const [nameError, setNameError] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [showChainModal, setShowChainModal] = useState(false);
  const [pendingCode, setPendingCode] = useState('');
  const [pendingIsHost, setPendingIsHost] = useState(false);
  const [clock, setClock] = useState(() =>
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  );

  const isHostFromUrl = searchParams.get('host') === 'true';

  useEffect(() => {
    const codeParam = searchParams.get('code');
    if (codeParam) setMeetingCode(formatMeetingCode(codeParam));
  }, [searchParams]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setClock(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const formatMeetingCode = (code) => {
    const cleaned = code.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 7) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 10)}`;
  };

  const handleCodeChange = (e) => {
    setMeetingCode(formatMeetingCode(e.target.value));
    setCodeError('');
  };

  const handleNameChange = (e) => {
    setDisplayName(e.target.value);
    setNameError('');
  };

  const validateForm = () => {
    let isValid = true;
    if (!displayName.trim()) {
      setNameError('Name is required');
      isValid = false;
    } else if (displayName.trim().length < 2) {
      setNameError('Name must be at least 2 characters');
      isValid = false;
    }
    const codePattern = /^[A-Z0-9]{3}-[A-Z0-9]{4}-[A-Z0-9]{3}$/;
    if (!meetingCode.trim()) {
      setCodeError('Meeting code is required');
      isValid = false;
    } else if (!codePattern.test(meetingCode)) {
      setCodeError('Invalid format (use XXX-XXXX-XXX)');
      isValid = false;
    }
    return isValid;
  };

  const handleJoinMeeting = async () => {
    if (!validateForm()) return;
    setIsJoining(true);
    updateUser({ name: displayName.trim() });
    setTimeout(() => {
      const cleanCode = meetingCode.replace(/-/g, '').toLowerCase();
      if (isHostFromUrl) {
        sessionStorage.setItem('etherx_host_room', cleanCode);
        sessionStorage.setItem('etherx_meet_start', String(Date.now()));
      }
      if (account) {
        setPendingCode(cleanCode);
        setPendingIsHost(isHostFromUrl);
        setShowChainModal(true);
        setIsJoining(false);
      } else {
        navigate(`/room/${cleanCode}`);
      }
    }, 300);
  };

  const handleLogout = () => {
    localStorage.removeItem('nexmeet_token');
    localStorage.removeItem('nexmeet_user');
    navigate('/login');
  };

  const handleHelp = () => {
    addToast('Enter a valid meeting code in XXX-XXXX-XXX format.', 'info');
  };

  const userInitial = (displayName || user.name || 'U').trim().charAt(0).toUpperCase();

  return (
    <AnimatedPage>
      <div style={{ minHeight: '100vh', background: 'transparent', display: 'flex', flexDirection: 'column', fontFamily: 'DM Sans, sans-serif', color: '#C9B48A', position: 'relative' }}>
        {/* Nav */}
        <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 28px', height: '80px', background: 'transparent', position: 'relative', zIndex: 10 }}>
          <img src={etherxLogo} alt="EtherXMeet" style={{ height: '90px', width: 'auto', display: 'block' }} />
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(240,238,232,0.45)', letterSpacing: '0.02em' }}>{clock}</span>
            <button type="button" onClick={handleHelp} style={{ height: '34px', padding: '0 14px', borderRadius: '8px', border: '1px solid rgba(212,181,113,0.28)', background: 'transparent', color: '#D4B571', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: '13px', fontWeight: 500 }}>Help</button>
            <button type="button" onClick={handleLogout} style={{ height: '34px', padding: '0 14px', borderRadius: '8px', border: '1px solid rgba(212,181,113,0.28)', background: 'transparent', color: '#D4B571', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: '13px', fontWeight: 500 }}>Logout</button>
            <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg, #D4B571 0%, #6F5115 100%)', color: '#E8D5A3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '13px', boxShadow: '0 0 0 2px rgba(212,181,113,0.25)' }}>
              {userInitial}
            </div>
          </div>
        </nav>

        {/* Center card */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative', zIndex: 2 }}>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            style={{ width: '100%', maxWidth: '460px' }}
          >
            <div style={{ background: 'rgba(8,8,12,0.28)', border: '1px solid rgba(212,181,113,0.28)', borderRadius: '20px', padding: '40px 36px', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', boxShadow: '0 32px 80px rgba(0,0,0,0.45), 0 1px 0 rgba(212,181,113,0.12) inset', position: 'relative', overflow: 'hidden' }}>
              {/* top accent */}
              <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(212,181,113,0.6), transparent)' }} />

              <motion.p variants={staggerChild} style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#D4B571', margin: '0 0 12px', opacity: 0.8 }}>EtherXMeet</motion.p>
              <motion.h1 variants={staggerChild} style={{ fontFamily: 'Syne, sans-serif', fontSize: '28px', fontWeight: 700, letterSpacing: '-0.04em', color: '#E8D5A3', margin: '0 0 6px' }}>
                Join Meeting
              </motion.h1>
              <motion.p variants={staggerChild} style={{ fontSize: '14px', color: 'rgba(240,238,232,0.5)', margin: '0 0 32px', lineHeight: 1.5 }}>
                Enter your name and meeting code to jump in.
              </motion.p>

              <motion.div variants={staggerChild} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {/* Name */}
                <div>
                  <label style={labelStyle}>Your Name</label>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={displayName}
                    onChange={handleNameChange}
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = GOLD_BORDER}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
                  />
                  {nameError && <p style={{ marginTop: 5, fontSize: 12, color: '#f87171' }}>{nameError}</p>}
                </div>

                {/* Meeting Code */}
                <div>
                  <label style={labelStyle}>Meeting Code</label>
                  <input
                    type="text"
                    placeholder="XXX-XXXX-XXX"
                    value={meetingCode}
                    onChange={handleCodeChange}
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = GOLD_BORDER}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
                  />
                  {codeError
                    ? <p style={{ marginTop: 5, fontSize: 12, color: '#f87171' }}>{codeError}</p>
                    : <p style={{ marginTop: 5, fontSize: 11, color: 'rgba(212,181,113,0.45)' }}>Format: XXX-XXXX-XXX (e.g., ABC-1234-XYZ)</p>
                  }
                </div>

                {/* Join button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleJoinMeeting}
                  disabled={isJoining || !displayName.trim() || !meetingCode.trim()}
                  style={{
                    width: '100%', padding: '13px 0',
                    background: (isJoining || !displayName.trim() || !meetingCode.trim())
                      ? 'rgba(212,181,113,0.15)'
                      : 'linear-gradient(135deg, #D4B571 0%, #6F5115 100%)',
                    border: `1px solid ${GOLD_BORDER}`,
                    borderRadius: 12,
                    fontSize: 15, fontWeight: 700,
                    color: (isJoining || !displayName.trim() || !meetingCode.trim()) ? 'rgba(212,181,113,0.4)' : '#111',
                    cursor: (isJoining || !displayName.trim() || !meetingCode.trim()) ? 'not-allowed' : 'pointer',
                    fontFamily: 'DM Sans, sans-serif',
                    letterSpacing: '-0.01em',
                    transition: 'all 0.15s',
                    boxShadow: (isJoining || !displayName.trim() || !meetingCode.trim()) ? 'none' : '0 4px 24px rgba(212,181,113,0.25)',
                  }}
                >
                  {isJoining ? 'Joining…' : 'Join Meeting'}
                </motion.button>

                <p style={{ fontSize: '11px', textAlign: 'center', color: 'rgba(240,238,232,0.25)', lineHeight: 1.6 }}>
                  By joining, you agree to our Terms of Service
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      <OnChainConfirmModal
        isOpen={showChainModal}
        onClose={() => setShowChainModal(false)}
        onConfirmed={(_txHash) => {
          setShowChainModal(false);
          navigate(`/room/${pendingCode}`);
        }}
        meetingId={pendingCode}
        isHost={pendingIsHost}
        onSubmit={pendingIsHost ? createMeeting : joinMeeting}
        isTxPending={isTxPending}
        txHash={txHash}
        contractError={contractError}
      />
    </AnimatedPage>
  );
}
