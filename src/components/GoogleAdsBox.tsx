export default function GoogleAdsBox() {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
      <h3 className="text-lg font-semibold text-[#0f766e] mb-4" style={{ fontFamily: '"Playfair Display", serif' }}>
        Advertisement
      </h3>

      {/* Google AdSense placeholder - replace with actual AdSense code */}
      <div className="bg-slate-100 rounded-lg p-8 text-center border-2 border-dashed border-slate-300">
        <div className="text-slate-500 text-sm mb-2">Google AdSense</div>
        <div className="text-slate-400 text-xs">
          {/* Placeholder for ad content */}
          <div className="bg-slate-200 h-20 rounded mb-2 flex items-center justify-center">
            <span className="text-slate-500">Ad Space</span>
          </div>
          <div className="text-xs text-slate-400">
            Sponsored Content
          </div>
        </div>
      </div>

      {/* Note: Replace the placeholder above with actual Google AdSense code when ready */}
    </div>
  );
}
