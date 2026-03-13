import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Search } from "lucide-react";
import { useContacts, useSearchUsers } from "@/hooks/useContacts";
import { useCreateGroupConversation } from "@/hooks/useConversations";
import { useToast } from "@/hooks/use-toast";

interface NewGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (conversationId: string) => void;
}

export const NewGroupDialog = ({ open, onOpenChange, onCreated }: NewGroupDialogProps) => {
  const [name, setName] = useState("");
  const [memberSearch, setMemberSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [selectedProfiles, setSelectedProfiles] = useState<Map<string, { display_name: string; avatar_url: string | null }>>(new Map());
  const { data: contacts } = useContacts();
  const { data: searchResults } = useSearchUsers(memberSearch);
  const createGroup = useCreateGroupConversation();
  const { toast } = useToast();

  const contactIds = new Set(contacts?.map((c) => c.contact_id));

  // Merge contacts and search results into a single deduplicated list
  const candidateMap = new Map<string, { id: string; display_name: string; avatar_url: string | null }>();
  contacts?.forEach((c) => candidateMap.set(c.contact_id, { id: c.contact_id, display_name: c.profile.display_name, avatar_url: c.profile.avatar_url }));
  if (memberSearch.length >= 2) {
    searchResults?.forEach((u) => {
      if (!candidateMap.has(u.id)) candidateMap.set(u.id, { id: u.id, display_name: u.display_name, avatar_url: u.avatar_url });
    });
  }

  const candidates = memberSearch
    ? Array.from(candidateMap.values()).filter((u) => u.display_name.toLowerCase().includes(memberSearch.toLowerCase()))
    : Array.from(candidateMap.values());

  const toggle = (id: string, profile: { display_name: string; avatar_url: string | null }) => {
    const next = new Set(selected);
    const nextProfiles = new Map(selectedProfiles);
    if (next.has(id)) {
      next.delete(id);
      nextProfiles.delete(id);
    } else {
      next.add(id);
      nextProfiles.set(id, profile);
    }
    setSelected(next);
    setSelectedProfiles(nextProfiles);
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      toast({ title: "Enter a group name", variant: "destructive" });
      return;
    }
    if (selected.size === 0) {
      toast({ title: "Select at least one member", variant: "destructive" });
      return;
    }
    const convId = await createGroup.mutateAsync({ name, memberIds: Array.from(selected) });
    onOpenChange(false);
    onCreated(convId);
    setName("");
    setMemberSearch("");
    setSelected(new Set());
    setSelectedProfiles(new Map());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">New Group</DialogTitle>
        </DialogHeader>
        <Input placeholder="Group name" value={name} onChange={(e) => setName(e.target.value)} className="mb-3" />

        <div className="relative mb-2">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search members..."
            value={memberSearch}
            onChange={(e) => setMemberSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <p className="text-sm text-muted-foreground mb-2">Select members:</p>
        <ScrollArea className="h-[260px]">
          {candidates.map((u) => (
            <label key={u.id} className="flex cursor-pointer items-center gap-3 px-2 py-2 hover:bg-accent rounded-lg">
              <Checkbox checked={selected.has(u.id)} onCheckedChange={() => toggle(u.id, { display_name: u.display_name, avatar_url: u.avatar_url })} />
              <Avatar className="h-8 w-8">
                <AvatarImage src={u.avatar_url ?? undefined} />
                <AvatarFallback>{u.display_name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="font-medium">{u.display_name}</span>
              {!contactIds.has(u.id) && (
                <span className="ml-auto text-xs text-muted-foreground">not a contact</span>
              )}
            </label>
          ))}
          {candidates.length === 0 && memberSearch.length >= 2 && (
            <p className="p-4 text-center text-muted-foreground">No users found</p>
          )}
          {candidates.length === 0 && memberSearch.length < 2 && (
            <p className="p-4 text-center text-muted-foreground">Search to find members</p>
          )}
        </ScrollArea>
        <Button onClick={handleCreate} disabled={createGroup.isPending} className="w-full mt-2">
          {createGroup.isPending ? "Creating..." : `Create group (${selected.size})`}
        </Button>
      </DialogContent>
    </Dialog>
  );
};
