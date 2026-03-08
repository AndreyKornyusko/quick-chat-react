import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QuickChatProvider } from "@/lib/QuickChatProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/Index";
import Demo from "./pages/Demo";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? "";
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "";

const defaultConfig = {
  showGroups: true,
  allowVoiceMessages: true,
  allowFileUpload: true,
  allowReactions: true,
  showOnlineStatus: true,
  showReadReceipts: true,
};

const App = () => (
  <QuickChatProvider supabaseUrl={SUPABASE_URL} supabaseAnonKey={SUPABASE_KEY} config={defaultConfig}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/demo" element={<Demo />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QuickChatProvider>
);

export default App;
