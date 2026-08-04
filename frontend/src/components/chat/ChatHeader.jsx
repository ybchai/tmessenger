import { Avatar, Button } from "@heroui/react";

import { ChevronLeftIcon, XIcon } from "lucide-react";

import { AppLogo } from "../AppLogo";

import { AvatarWithOnlineIndicator } from "./AvatarWithOnlineIndicator";

import { ThemePresetPicker } from "../ThemePresetPicker";

import { ThemeToggle } from "../ThemeToggle";

import { WallpaperPicker } from "../WallpaperPicker";

import { useChatStore } from "../../store/useChatStore";

import { useSelectedConversation } from "../../hooks/useSelectedConversation";

import { languages } from "../../data/languages";

import { useAuthStore } from "../../store/useAuthStore";

export function ChatHeader() {
  const { activeConversation, isLargeScreen } = useSelectedConversation();

  const setActiveConversationId = useChatStore(
    (state) => state.setActiveConversationId,
  );

  const authUser = useAuthStore((state) => state.authUser);

  const updatePreferredLanguage = useChatStore(
    (state) => state.updatePreferredLanguage,
  );

  return (
    <header
      className="
sticky
top-0
z-10
flex
items-center
gap-2
border-b
border-border
px-2
py-2
"
    >
      {activeConversation && !isLargeScreen && (
        <Button
          variant="ghost"
          isIconOnly
          onPress={() => setActiveConversationId(null)}
        >
          <ChevronLeftIcon />
        </Button>
      )}

      {activeConversation ? (
        <>
          <AvatarWithOnlineIndicator isOnline>
            <Avatar>
              <Avatar.Image src={activeConversation.peer.avatarUrl} />

              <Avatar.Fallback>
                {activeConversation.peer.initials}
              </Avatar.Fallback>
            </Avatar>
          </AvatarWithOnlineIndicator>

          <div className="flex-1">
            <p>{activeConversation.peer.name}</p>

            <p className="text-xs text-muted">Online</p>
          </div>
        </>
      ) : (
        <div className="flex-1">Select conversation</div>
      )}

      <select
        value={selectedLanguage}
        onChange={(e) => updatePreferredLanguage(e.target.value)}
        className="
rounded-lg
border
px-2
py-1
text-sm
"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>

      <WallpaperPicker />

      <ThemePresetPicker />

      <ThemeToggle />

      {activeConversation && (
        <Button
          variant="ghost"
          isIconOnly
          onPress={() => setActiveConversationId(null)}
        >
          <XIcon />
        </Button>
      )}
    </header>
  );
}
