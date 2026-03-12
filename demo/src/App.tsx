import "quick-chat-react/style.css";
import { useState } from "react";
import { useDemoAuth } from "./hooks/useDemoAuth";
import { MOCK_USERS } from "./data/mockUsers";
import { Header } from "./components/Header/Header";
import { Hero } from "./components/Hero/Hero";
import { Features } from "./components/Features/Features";
import { Team } from "./components/Team/Team";
import { Footer } from "./components/Footer/Footer";
import { ChatModal } from "./components/ChatModal/ChatModal";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export default function App() {
  const { currentUser, login, logout } = useDemoAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      <Header
        supabaseUrl={SUPABASE_URL}
        supabaseAnonKey={SUPABASE_ANON_KEY}
        currentUser={currentUser}
        onOpenChat={() => setIsChatOpen(true)}
        onLogin={login}
        onLogout={logout}
        users={MOCK_USERS}
      />

      <main>
        <Hero onOpenChat={() => setIsChatOpen(true)} isLoggedIn={currentUser !== null} />
        <Features />
        <Team
          users={MOCK_USERS}
          currentUser={currentUser}
          onLogin={login}
          onOpenChat={() => setIsChatOpen(true)}
        />
        <Footer />
      </main>

      {isChatOpen && (
        <ChatModal
          supabaseUrl={SUPABASE_URL}
          supabaseAnonKey={SUPABASE_ANON_KEY}
          currentUser={currentUser}
          onClose={() => setIsChatOpen(false)}
        />
      )}
    </>
  );
}
