import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CodeBlock } from "./CodeBlock";
import { MessageCircle, Users, Mic, Paperclip, Smile, Eye, CheckCheck } from "lucide-react";

export const DemoPlayground = () => {
  const [theme, setTheme] = useState<string>("system");
  const [authMode, setAuthMode] = useState<string>("built-in");
  const [showGroups, setShowGroups] = useState(true);
  const [allowVoiceMessages, setAllowVoiceMessages] = useState(true);
  const [allowFileUpload, setAllowFileUpload] = useState(true);
  const [allowReactions, setAllowReactions] = useState(true);
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);
  const [showReadReceipts, setShowReadReceipts] = useState(true);

  const generateCode = () => {
    const props: string[] = [
      `  supabaseUrl={process.env.VITE_SUPABASE_URL!}`,
      `  supabaseAnonKey={process.env.VITE_SUPABASE_PUBLISHABLE_KEY!}`,
    ];
    if (authMode === "external") {
      props.push(`  authMode="external"`);
      props.push(`  userData={{ id: "user-1", name: "John Doe", avatar: "https://..." }}`);
    }
    if (theme !== "system") props.push(`  theme="${theme}"`);
    if (!showGroups) props.push(`  showGroups={false}`);
    if (!allowVoiceMessages) props.push(`  allowVoiceMessages={false}`);
    if (!allowFileUpload) props.push(`  allowFileUpload={false}`);
    if (!allowReactions) props.push(`  allowReactions={false}`);
    if (!showOnlineStatus) props.push(`  showOnlineStatus={false}`);
    if (!showReadReceipts) props.push(`  showReadReceipts={false}`);

    return `<QuickChat\n${props.join("\n")}\n/>`;
  };

  const features = [
    { key: "showGroups", label: "Group Chats", icon: Users, value: showGroups, set: setShowGroups },
    { key: "allowVoiceMessages", label: "Voice Messages", icon: Mic, value: allowVoiceMessages, set: setAllowVoiceMessages },
    { key: "allowFileUpload", label: "File Upload", icon: Paperclip, value: allowFileUpload, set: setAllowFileUpload },
    { key: "allowReactions", label: "Reactions", icon: Smile, value: allowReactions, set: setAllowReactions },
    { key: "showOnlineStatus", label: "Online Status", icon: Eye, value: showOnlineStatus, set: setShowOnlineStatus },
    { key: "showReadReceipts", label: "Read Receipts", icon: CheckCheck, value: showReadReceipts, set: setShowReadReceipts },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Controls */}
      <div className="space-y-6 rounded-lg border border-border p-6 bg-card">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          Configure Props
        </h3>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Theme</Label>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Auth Mode</Label>
            <Select value={authMode} onValueChange={setAuthMode}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="built-in">Built-in (Supabase Auth UI)</SelectItem>
                <SelectItem value="external">External (Your own auth)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border-t border-border pt-4 space-y-3">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Feature Toggles</Label>
            {features.map((f) => (
              <div key={f.key} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <f.icon className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-sm cursor-pointer">{f.label}</Label>
                </div>
                <Switch checked={f.value} onCheckedChange={f.set} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Code Preview */}
      <div className="space-y-4">
        <CodeBlock code={generateCode()} language="tsx" title="Generated Code" />

        {/* Mock Chat Preview */}
        <div
          className="rounded-lg border border-border overflow-hidden"
          style={{ height: 360 }}
        >
          <div className="flex h-full">
            {/* Sidebar mock */}
            <div className="w-1/3 border-r border-border bg-muted/20 flex flex-col">
              <div className="p-3 border-b border-border">
                <div className="h-5 w-24 rounded bg-muted animate-pulse" />
              </div>
              {[1, 2, 3].map((i) => (
                <div key={i} className={`flex items-center gap-2 p-3 ${i === 1 ? "bg-primary/10" : ""}`}>
                  <div className="h-8 w-8 rounded-full bg-muted animate-pulse shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-20 rounded bg-muted animate-pulse" />
                    <div className="h-2 w-28 rounded bg-muted/60 animate-pulse" />
                  </div>
                  {showOnlineStatus && i === 1 && (
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                  )}
                </div>
              ))}
              {showGroups && (
                <div className="flex items-center gap-2 p-3">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-16 rounded bg-muted animate-pulse" />
                    <div className="h-2 w-24 rounded bg-muted/60 animate-pulse" />
                  </div>
                </div>
              )}
            </div>

            {/* Chat area mock */}
            <div className="flex-1 flex flex-col bg-background">
              <div className="p-3 border-b border-border flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-muted animate-pulse" />
                <div className="h-3 w-20 rounded bg-muted animate-pulse" />
              </div>
              <div className="flex-1 p-3 space-y-2">
                <div className="flex justify-start">
                  <div className="rounded-lg bg-muted p-2 max-w-[70%]">
                    <div className="h-2.5 w-32 rounded bg-muted-foreground/20" />
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="rounded-lg bg-primary/20 p-2 max-w-[70%]">
                    <div className="h-2.5 w-24 rounded bg-primary/30" />
                    {showReadReceipts && (
                      <div className="flex justify-end mt-1">
                        <CheckCheck className="h-3 w-3 text-primary" />
                      </div>
                    )}
                  </div>
                </div>
                {allowReactions && (
                  <div className="flex justify-start">
                    <div className="rounded-lg bg-muted p-2 max-w-[70%] space-y-1">
                      <div className="h-2.5 w-28 rounded bg-muted-foreground/20" />
                      <div className="flex gap-1">
                        <span className="text-[10px] bg-muted rounded px-1">👍 2</span>
                        <span className="text-[10px] bg-muted rounded px-1">❤️ 1</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-2 border-t border-border flex items-center gap-2">
                {allowFileUpload && <Paperclip className="h-4 w-4 text-muted-foreground" />}
                <div className="flex-1 h-7 rounded-full bg-muted/50 border border-border" />
                {allowVoiceMessages && <Mic className="h-4 w-4 text-muted-foreground" />}
              </div>
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground text-center">Interactive mock preview — toggle props to see changes</p>
      </div>
    </div>
  );
};
