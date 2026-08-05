import {
  getInitials,
  useSelectedConversation,
} from "../../hooks/useSelectedConversation";
import { useChatStore } from "../../store/useChatStore";
import { UserButton } from "@clerk/react";

import { APP_NAME, AppLogo } from "../AppLogo";
import { SearchField, Tabs } from "@heroui/react";

import { MessageSquareIcon, UsersIcon } from "lucide-react";
import { ConversationRow } from "./ConversationRow";

import { useEffect } from "react";

function mapConversation(conversation) {
  const peer = conversation.peer || conversation.other_user;

  if (!peer) {
    return null;
  }

  return {
    id: conversation.id || conversation.conversation_id,
    name: peer.full_name || peer.name,
    avatarUrl: peer.profile_pic || peer.avatarUrl,
    initials: getInitials(peer.full_name || peer.name),

    peer: {
      id: peer.id,
      name: peer.full_name || peer.name,
      avatarUrl: peer.profile_pic || peer.avatarUrl,
      initials: getInitials(peer.full_name || peer.name),
    },

    isTemporary: conversation.isTemporary,
  };
}

function mapUserForList(user) {
  return {
    id: user.id,
    name: user.full_name,
    avatarUrl: user.profile_pic,
    initials: getInitials(user.full_name),

    peer: {
      id: user.id,
      name: user.full_name,
      avatarUrl: user.profile_pic,
      initials: getInitials(user.full_name),
    },
  };
}

function ChatSidebar() {
  const conversations = useChatStore((state) => state.conversations);

  const users = useChatStore((state) => state.users);

  const searchUsers = useChatStore((state) => state.searchUsers);

  const createTemporaryConversation = useChatStore(
    (state) => state.createTemporaryConversation,
  );

  const searchQuery = useChatStore((state) => state.searchQuery);

  const setSearchQuery = useChatStore((state) => state.setSearchQuery);

  const sidebarTab = useChatStore((state) => state.sidebarTab);

  const setSidebarTab = useChatStore((state) => state.setSidebarTab);

  const setActiveConversationId = useChatStore(
    (state) => state.setActiveConversationId,
  );

  const { activeConversationId, isLargeScreen } = useSelectedConversation();

  const normalizedSearchQuery = searchQuery.trim().toLowerCase();

  const conversationList = conversations
    .map((conversation) => {
      console.log("Sidebar state:", conversation);
      return mapConversation(conversation);
    })
    .filter(Boolean);

  const userList = users.map(mapUserForList);

  const filteredConversations = normalizedSearchQuery
    ? conversationList.filter((conversation) =>
        conversation.name.toLowerCase().includes(normalizedSearchQuery),
      )
    : conversationList;

  const filteredUsers = normalizedSearchQuery
    ? userList.filter((user) =>
        user.name.toLowerCase().includes(normalizedSearchQuery),
      )
    : userList;

  useEffect(() => {
    if (sidebarTab !== "users") {
      return;
    }

    if (!searchQuery.trim()) {
      return;
    }

    searchUsers(searchQuery);
  }, [searchQuery, sidebarTab, searchUsers]);

  return (
    <aside
      className={`
        w-full
        shrink-0
        flex-col
        overflow-hidden
        border-r
        border-border
        lg:w-72

        ${!isLargeScreen && activeConversationId ? "hidden lg:flex" : "flex"}

      `}
    >
      <div
        className="
        shrink-0
        border-b
        border-border
        px-2
        pb-2
        pt-2.5
        sm:px-3
        sm:pt-3
        "
      >
        <div
          className="
          flex
          items-center
          gap-2
          px-0.5
          sm:gap-2.5
          sm:px-1
          "
        >
          <AppLogo
            size={32}
            className="
            size-8
            shrink-0
            rounded-[9px]
            sm:size-8.5
            "
            alt=""
          />

          <p
            className="
            flex-1
            truncate
            text-lg
            font-bold
            tracking-tight
            sm:text-[22px]
            "
          >
            {APP_NAME}
          </p>

          <UserButton
            appearance={{
              elements: {
                avatarBox: "size-8",
              },
            }}
          />
        </div>
      </div>

      <Tabs
        selectedKey={sidebarTab}
        onSelectionChange={(key) => setSidebarTab(String(key))}
        variant="secondary"
        className="
        flex
        flex-1
        flex-col
        overflow-y-auto
        "
      >
        <div
          className="
          shrink-0
          border-b
          border-border
          px-3
          pb-2
          pt-2
          "
        >
          <SearchField
            fullWidth
            variant="secondary"
            className="w-full"
            value={searchQuery}
            onChange={(value) => {
              setSearchQuery(value);
              searchUsers(value);
            }}
          >
            <SearchField.Group
              className="
              rounded-xl
              "
            >
              <SearchField.SearchIcon />

              <SearchField.Input placeholder="Search" />

              {searchQuery ? <SearchField.ClearButton /> : null}
            </SearchField.Group>
          </SearchField>
        </div>

        <Tabs.ListContainer
          className="
          shrink-0
          border-b
          border-border
          px-2
          pb-2
          pt-1
          "
        >
          <Tabs.List
            className="
            w-full
            gap-0.5
            "
          >
            <Tabs.Tab
              id="chats"
              className="
              flex-1
              justify-center
              gap-1.5
              "
            >
              <MessageSquareIcon
                className="
                size-3.5
                opacity-80
                "
              />
              Chats
            </Tabs.Tab>

            <Tabs.Tab
              id="users"
              className="
              flex-1
              justify-center
              gap-1.5
              "
            >
              <UsersIcon
                className="
                size-3.5
                opacity-80
                "
              />
              Users
            </Tabs.Tab>
          </Tabs.List>
        </Tabs.ListContainer>

        <Tabs.Panel
          id="chats"
          className="
          flex-1
          overflow-x-hidden
          overflow-y-auto
          outline-none
          "
        >
          {filteredConversations.length === 0 ? (
            <p
              className="
              px-4
              py-6
              text-center
              text-sm
              text-muted
              "
            >
              No conversations match your search.
            </p>
          ) : (
            filteredConversations.map((conversation) => (
              <ConversationRow
                key={conversation.id || conversation.peer.id}
                user={conversation}
                selected={conversation.id === activeConversationId}
                onSelect={() => {
                  setActiveConversationId(conversation.id);
                }}
              />
            ))
          )}
        </Tabs.Panel>

        <Tabs.Panel
          id="users"
          className="
          flex-1
          overflow-x-hidden
          overflow-y-auto
          outline-none
          "
        >
          {filteredUsers.length === 0 ? (
            <p
              className="
              px-4
              py-6
              text-center
              text-sm
              text-muted
              "
            >
              No people match your search.
            </p>
          ) : (
            filteredUsers.map((user) => (
              <ConversationRow
                key={user.id}
                user={user}
                selected={false}
                onSelect={() => {
                  createTemporaryConversation(user);
                }}
              />
            ))
          )}
        </Tabs.Panel>
      </Tabs>
    </aside>
  );
}

export default ChatSidebar;
