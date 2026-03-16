import "./Hero.css";

interface HeroProps {
  onOpenChat: () => void;
  isLoggedIn: boolean;
}

export function Hero({ onOpenChat, isLoggedIn }: HeroProps) {
  return (
    <section className="hero" id="hero">
      <div className="container">
        <div className="hero__badge">Open Source · MIT License</div>

        <h1 className="hero__headline">
          Add Real-Time Chat to Your App<br />
          <span>in Minutes</span>
        </h1>

        <p className="hero__sub">
          Drop in one component, pass your Supabase credentials, and ship a
          full-featured chat experience — voice messages, file uploads, emoji
          reactions, and more.
        </p>

        <div className="hero__cta">
          <button className="btn-primary" onClick={onOpenChat}>
            🚀 Try Live Demo
          </button>
          <a
            className="btn-outline"
            href="https://github.com/AndreyKornyusko/quick-chat-react"
            target="_blank"
            rel="noopener noreferrer"
          >
            ⭐ View on GitHub
          </a>
          <a
            className="btn-outline"
            href="https://quick-chat-react-nextjs-demo.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
          >
            ▲ Next.js Demo
          </a>
          <a
            className="btn-outline"
            href="https://github.com/AndreyKornyusko/quick-chat-react/tree/main/nextjs-demo"
            target="_blank"
            rel="noopener noreferrer"
          >
            Next.js Source
          </a>
        </div>

        {!isLoggedIn && (
          <p className="hero__auth-hint">
            Tip: pick a team member below to log in and experience{" "}
            <strong>instant chat</strong> without any login screen.
          </p>
        )}

        <div className="hero__code-card">
          <p className="hero__code-label">Usage — it's this simple</p>
          <pre>
            <code>
              <span className="hero__code-keyword">import</span>
              {" { QuickChat, ChatButton, UserAvatar } "}
              <span className="hero__code-keyword">from</span>
              {' "quick-chat-react";\n\n'}
              <span className="hero__code-comment">{"// User already logged in? Pass their data directly.\n"}</span>
              {"<"}
              <span className="hero__code-component">QuickChat</span>
              {"\n  "}
              <span className="hero__code-prop">supabaseUrl</span>
              {"={"}
              <span className="hero__code-string">url</span>
              {"}\n  "}
              <span className="hero__code-prop">supabaseAnonKey</span>
              {"={"}
              <span className="hero__code-string">key</span>
              {"}\n  "}
              <span className="hero__code-prop">authMode</span>
              {'="'}
              <span className="hero__code-string">external</span>
              {'"\n  '}
              <span className="hero__code-prop">userData</span>
              {"={"}
              <span className="hero__code-string">currentUser</span>
              {"}\n/>\n\n"}
              <span className="hero__code-comment">{"// Optional: floating button with unread badge.\n"}</span>
              {"<"}
              <span className="hero__code-component">ChatButton</span>
              {"\n  "}
              <span className="hero__code-prop">supabaseUrl</span>
              {"={"}
              <span className="hero__code-string">url</span>
              {"}\n  "}
              <span className="hero__code-prop">supabaseAnonKey</span>
              {"={"}
              <span className="hero__code-string">key</span>
              {"}\n  "}
              <span className="hero__code-prop">userData</span>
              {"={"}
              <span className="hero__code-string">currentUser</span>
              {"}\n  "}
              <span className="hero__code-prop">onClick</span>
              {"={"}
              <span className="hero__code-comment">{"() => setOpen(true)"}</span>
              {"}\n/>\n\n"}
              <span className="hero__code-comment">{"// Navbar avatar — profile dropdown, theme switcher & sign out.\n"}</span>
              {"<"}
              <span className="hero__code-component">UserAvatar</span>
              {"\n  "}
              <span className="hero__code-prop">supabaseUrl</span>
              {"={"}
              <span className="hero__code-string">url</span>
              {"}\n  "}
              <span className="hero__code-prop">supabaseAnonKey</span>
              {"={"}
              <span className="hero__code-string">key</span>
              {"}\n  "}
              <span className="hero__code-prop">authMode</span>
              {'="'}
              <span className="hero__code-string">built-in</span>
              {'"\n  '}
              <span className="hero__code-prop">showName</span>
              {"\n/>"}
            </code>
          </pre>
        </div>
      </div>
    </section>
  );
}
