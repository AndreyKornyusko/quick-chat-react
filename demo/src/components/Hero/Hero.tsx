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

        <div className="hero__demo-links">
          <a
            href="https://quick-chat-react-nextjs-demo.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="hero__demo-link"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/><path d="M12 2L2 19.5h20L12 2z" fill="none"/><path d="M11.5 2.3L2 20h20L11.5 2.3z"/></svg>
            Next.js Demo
          </a>
          <span className="hero__demo-divider">·</span>
          <a
            href="https://github.com/AndreyKornyusko/quick-chat-react/tree/main/nextjs-demo"
            target="_blank"
            rel="noopener noreferrer"
            className="hero__demo-link"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/></svg>
            Next.js Demo Source
          </a>
        </div>

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
