import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image, Upload, Droplet, Sparkles } from 'lucide-react';
import Button from '../../ui/Button';
import Tabs from '../../ui/Tabs';
import BlurSettings from './BlurSettings';
import BackgroundGallery from './BackgroundGallery';
import CustomUpload from './CustomUpload';
import ColorPicker from './ColorPicker';
import BackgroundPreview from './BackgroundPreview';

export default function VirtualBackgroundStudio({ isOpen, onClose, onApply }) {
  const [selectedBg, setSelectedBg] = useState(null);
  const [blurLevel, setBlurLevel] = useState(0);
  const [activeTab, setActiveTab] = useState('presets');

  // Camera stream handles
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // -----------------------------------------------------------------------
  // Acquire camera on mount, release on unmount
  // -----------------------------------------------------------------------
  useEffect(() => {
    let active = true; // prevent state updates after unmount

    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if (!active) {
          // Component unmounted before the promise resolved — stop immediately
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(() => {
        // Camera permission denied or unavailable — preview will stay blank
      });

    return () => {
      active = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, []);

  // When the videoRef is first attached to the DOM after the stream is already
  // ready (e.g. first render happens before getUserMedia resolves), wire it up.
  const setVideoRef = (el) => {
    videoRef.current = el;
    if (el && streamRef.current && !el.srcObject) {
      el.srcObject = streamRef.current;
    }
  };

  const handleApply = () => {
    onApply({ type: selectedBg?.type, value: selectedBg?.value, blur: blurLevel });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        className="glass-card rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-app-primary to-app-secondary flex items-center justify-center">
              <Sparkles className="text-white" size={24} />
            </div>
            <div>
              <h2 className="font-syne font-bold text-xl">Virtual Background Studio</h2>
              <p className="text-sm text-gray-400">Transform your video background</p>
            </div>
          </div>
          <Button variant="ghost" onClick={onClose}>✕</Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden grid grid-cols-2 gap-6 p-6">
          {/* Left: Preview */}
          <div className="space-y-4">
            <div className="glass-card rounded-xl aspect-video flex items-center justify-center bg-app-surface overflow-hidden relative">
              {/* Always render BackgroundPreview so the camera feed is visible
                  even before a background is chosen */}
              <BackgroundPreview
                background={selectedBg}
                blur={blurLevel}
                videoRef={setVideoRef}
              />
              {/* Placeholder shown when camera hasn't started yet and no bg */}
              {!selectedBg && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  {/* The camera feed will replace this once it loads */}
                </div>
              )}
            </div>

            {/* Blur Controls */}
            <BlurSettings value={blurLevel} onChange={setBlurLevel} />
          </div>

          {/* Right: Options */}
          <div className="flex flex-col">
            <Tabs
              tabs={[
                {
                  id: 'presets',
                  label: 'Presets',
                  content: <BackgroundGallery onSelect={setSelectedBg} selected={selectedBg} />,
                },
                {
                  id: 'colors',
                  label: 'Colors',
                  content: (
                    <ColorPicker
                      onSelect={(color) => setSelectedBg({ type: 'color', value: color })}
                    />
                  ),
                },
                {
                  id: 'upload',
                  label: 'Custom',
                  content: (
                    <CustomUpload
                      onUpload={(url) => setSelectedBg({ type: 'image', value: url })}
                    />
                  ),
                },
              ]}
              defaultTab={activeTab}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={() => {
              setSelectedBg(null);
              setBlurLevel(0);
            }}
          >
            Remove Background
          </Button>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleApply}
              disabled={!selectedBg && blurLevel === 0}
            >
              Apply Background
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
