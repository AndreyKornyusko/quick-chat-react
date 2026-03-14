import "./Footer.css";

interface FooterProps {
  onTabChange: (tab: "home" | "chat" | "docs") => void;
}

export function Footer({ onTabChange }: FooterProps) {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <span className="footer__logo">Demo Startup</span>

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
          <button className="footer__link-btn" onClick={() => onTabChange("docs")}>Docs</button>
          <a href="#team">Team</a>
        </nav>

        <span className="footer__copy">© 2026 · MIT License · quick-chat-react</span>
      </div>
    </footer>
  );
}
