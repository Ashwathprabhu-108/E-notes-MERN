import { useEffect } from 'react';
import "./AdSidebar.css";

const AdSidebar = () => {
  useEffect(() => {
    try {
      // Push desktop vertical ad
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      // Push mobile horizontal ad
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      // AdSense not loaded yet (dev mode or pending approval)
    }
  }, []);

  return (
    <div className="ad-sidebar">
      {/* ── Desktop: vertical ad ── */}
      <div className="ad-slot-wrapper ad-desktop">
        <ins
          className="adsbygoogle ad-slot"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-2060905526049482"
          data-ad-slot="auto"
          data-ad-format="vertical"
          data-full-width-responsive="true"
        />
      </div>

      {/* ── Mobile: horizontal banner ── */}
      <div className="ad-slot-wrapper ad-mobile">
        <ins
          className="adsbygoogle ad-slot"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-2060905526049482"
          data-ad-slot="auto"
          data-ad-format="horizontal"
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
};

export default AdSidebar;