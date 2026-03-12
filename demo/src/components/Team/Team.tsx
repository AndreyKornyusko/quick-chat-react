import type { UserData } from "quick-chat-react";
import "./Team.css";

interface TeamProps {
  users: UserData[];
  currentUser: UserData | null;
  onLogin: (user: UserData) => void;
  onOpenChat: () => void;
}

export function Team({ users, currentUser, onLogin, onOpenChat }: TeamProps) {
  const handleSelectUser = (user: UserData) => {
    onLogin(user);
    onOpenChat();
  };

  return (
    <section className="team" id="team">
      <div className="container">
        <h2 className="section-title">Meet the Team</h2>
        <p className="section-sub">
          Click any team member to instantly log in as them and experience seamless chat — no
          separate login required.
        </p>

        <div className="team__grid">
          {users.map((user) => {
            const isActive = currentUser?.id === user.id;
            return (
              <div
                key={user.id}
                className={`team-card ${isActive ? "team-card--active" : ""}`}
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="team-card__avatar"
                />
                <h3 className="team-card__name">{user.name}</h3>
                <p className="team-card__role">{user.description}</p>
                <button
                  className="btn-primary team-card__cta"
                  onClick={() => handleSelectUser(user)}
                >
                  {isActive ? "✓ Chatting now" : `Chat as ${user.name.split(" ")[0]}`}
                </button>
              </div>
            );
          })}
        </div>

        <p className="team__hint">
          This demonstrates <strong>authMode="external"</strong> — your app provides the user, the
          chat just works.
        </p>
      </div>
    </section>
  );
}
