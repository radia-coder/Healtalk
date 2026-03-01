"use client";

import { useEffect, useState, Suspense } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { MessageCircle, Loader2, Search } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { MessageThread } from "@/components/messages/MessageThread";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface Conversation {
  id: string;
  appointmentId: string;
  name: string;
  image: string | null;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
}

type ConversationApiItem = Omit<Conversation, "lastMessageTime"> & {
  lastMessageTime: string;
};

function MessagesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const appointmentId = searchParams?.get("appointmentId") || searchParams?.get("chatId") || "";

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchConversations() {
      try {
        const res = await fetch("/api/messages/conversations");
        if (!res.ok) {
          // Handle unauthorized or other errors gracefully
          if (res.status === 401) {
            console.log("User not authenticated");
          } else {
            console.error(`Failed to fetch conversations: ${res.status}`);
          }
          setConversations([]);
          return;
        }
        const data = await res.json();
        // Handle if data is an array
        if (Array.isArray(data)) {
          const conversations = data as ConversationApiItem[];
          setConversations(conversations.map((conversation) => ({
            ...conversation,
            lastMessageTime: new Date(conversation.lastMessageTime),
          })));
        } else {
          setConversations([]);
        }
      } catch (err) {
        console.error("Error fetching conversations:", err);
        setConversations([]);
      } finally {
        setLoading(false);
      }
    }
    fetchConversations();
  }, []);

  const filteredConversations = conversations.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    } else if (days === 1) {
      return "Yesterday";
    } else if (days < 7) {
      return date.toLocaleDateString("en-US", { weekday: "short" });
    } else {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Messages</h1>
          <p className="text-gray-500">Secure conversations with your patients</p>
        </div>

        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-250px)]">
          {/* Conversations List */}
          <div className="col-span-12 lg:col-span-4 bg-white border border-[#E6EAF2] rounded-[24px] overflow-hidden flex flex-col">
            {/* Search */}
            <div className="p-4 border-b border-[#E6EAF2]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 rounded-full"
                />
              </div>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="animate-spin text-primary" size={24} />
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                  <MessageCircle className="text-gray-300 mb-3" size={48} />
                  <p className="text-gray-500 text-sm">
                    {searchQuery ? "No conversations found" : "No conversations yet"}
                  </p>
                </div>
              ) : (
                filteredConversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => router.push(`/psychologist/dashboard/messages?appointmentId=${conversation.appointmentId}`)}
                    className={cn(
                      "w-full p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors text-left flex items-start gap-3",
                      appointmentId === conversation.appointmentId && "bg-blue-50 hover:bg-blue-50"
                    )}
                  >
                    <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                      {conversation.image ? (
                        <Image
                          src={conversation.image}
                          alt={conversation.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <MessageCircle className="text-gray-400" size={20} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">{conversation.name}</h3>
                        <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                          {formatTime(conversation.lastMessageTime)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 truncate">{conversation.lastMessage}</p>
                    </div>
                    {conversation.unreadCount > 0 && (
                      <div className="w-5 h-5 rounded-full bg-[#5B6CFF] text-white text-xs flex items-center justify-center flex-shrink-0">
                        {conversation.unreadCount}
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Message Thread */}
          <div className="col-span-12 lg:col-span-8">
            {appointmentId ? (
              <MessageThread appointmentId={appointmentId} />
            ) : (
              <div className="bg-white border border-dashed border-gray-200 rounded-[24px] p-12 text-center h-full flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="text-gray-300" size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No conversation selected</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Select a conversation from the list to start messaging.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function PsychologistMessagesPage() {
  return (
    <Suspense
      fallback={
        <DashboardLayout>
          <div className="flex items-center justify-center h-full">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        </DashboardLayout>
      }
    >
      <MessagesContent />
    </Suspense>
  );
}
