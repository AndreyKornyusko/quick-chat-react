import "./Features.css";

const FEATURES = [
  {
    icon: "⚡",
    title: "Drop-In Ready",
    description:
      "One component, two required props. Works in any React 18+ project with zero backend configuration.",
  },
  {
    icon: "🔐",
    title: "Flexible Auth",
    description:
      'Use built-in Supabase auth or pass your own logged-in user via authMode="external" — no re-login needed.',
  },
  {
    icon: "💬",
    title: "Full-Featured Chat",
    description:
      "Voice messages, file & photo uploads, emoji reactions, group chats, read receipts, and message replies.",
  },
  {
    icon: "🎨",
    title: "Themeable",
    description:
      "Light, dark, and system themes out of the box. CSS variables make it easy to match your brand.",
  },
  {
    icon: "📡",
    title: "Real-Time",
    description:
      "Powered by Supabase Realtime. Messages, reactions, and online presence update instantly across all clients.",
  },
  {
    icon: "🚀",
    title: "Startup-Ready",
    description:
      "Built for fast-moving teams. Ship a professional chat experience in your MVP without writing a backend.",
  },
];

export function Features() {
  return (
    <section className="features" id="features">
      <div className="container">
        <h2 className="section-title">Everything You Need</h2>
        <p className="section-sub">No backend work. No auth headaches. Just drop it in and ship.</p>
        <div className="features__grid">
          {FEATURES.map((f) => (
            <div className="feature-card" key={f.title}>
              <div className="feature-card__icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
