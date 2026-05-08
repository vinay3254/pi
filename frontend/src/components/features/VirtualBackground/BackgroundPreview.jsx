/**
 * BackgroundPreview
 *
 * Renders a live camera feed from `videoRef` overlaid on the selected
 * background.  The background is shown as a <div> behind the video:
 *   - "color" type  → solid CSS background-color
 *   - "image" type  → CSS background-image URL or emoji fallback
 *
 * Real person/background segmentation (e.g. MediaPipe) is not wired here;
 * the background div gives the user a clear sense of what they have chosen
 * while the video shows their true camera feed.
 *
 * Props:
 *   background  – { type: 'color'|'image', value: string } | null
 *   blur        – number  0-20  (controls CSS blur applied to the video)
 *   videoRef    – ref callback or RefObject passed from the parent so the
 *                 parent can attach the MediaStream to the element
 */
export default function BackgroundPreview({ background, blur, videoRef }) {
  // -----------------------------------------------------------------------
  // Derive background-layer style
  // -----------------------------------------------------------------------
  const getBackgroundStyle = () => {
    if (!background) return {};
    if (background.type === 'color') {
      return { backgroundColor: background.value };
    }
    if (background.type === 'image' && background.value?.startsWith('http')) {
      return {
        backgroundImage: `url(${background.value})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    }
    // Emoji / plain-string fallback (kept for gallery presets that use emojis)
    return {};
  };

  // CSS blur applied to the video element when blurLevel > 0.
  // Scale: 0-20 slider → 0-2.4 px CSS blur (subtle but visible).
  const videoFilter = blur > 0 ? `blur(${blur * 0.12}px)` : undefined;

  return (
    <div className="w-full h-full relative overflow-hidden">
      {/* Background layer — sits beneath the video */}
      <div
        className="absolute inset-0"
        style={getBackgroundStyle()}
      >
        {/* Emoji / non-URL image fallback */}
        {background?.type === 'image' && !background.value?.startsWith('http') && (
          <div className="w-full h-full flex items-center justify-center text-8xl">
            {background.value}
          </div>
        )}
      </div>

      {/* Live camera feed */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={videoFilter ? { filter: videoFilter } : undefined}
      />
    </div>
  );
}
