import "./Footer.css";

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <span className="footer__logo">💬 My Amazing Startup</span>

        <nav className="footer__links">
          <a
            href="https://github.com/andreikornusko/quick-chat-react"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          <a
            href="https://www.npmjs.com/package/quick-chat-react"
            target="_blank"
            rel="noopener noreferrer"
          >
            npm
          </a>
          <a href="#features">Docs</a>
          <a href="#team">Team</a>
        </nav>

        <span className="footer__copy">© 2026 · MIT License · quick-chat-react</span>
      </div>
    </footer>
  );
}
