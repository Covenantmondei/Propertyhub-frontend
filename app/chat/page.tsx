'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import AppNav from '@/components/AppNav';
import AppFooter from '@/components/AppFooter';
import { apiCall } from '@/lib/api';

interface Conversation {
  id: number;
  other_user: { id: number; username: string };
  property: { id: number; title: string };
  last_message?: string;
  unread_count?: number;
}

interface Message {
  id: number;
  content: string;
  sender_id: number;
  created_at: string;
}

function ChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isMobileView, setIsMobileView] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!localStorage.getItem('authToken')) {
      router.replace('/login');
      return;
    }
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        setCurrentUserId(u.user_id || u.id);
      } catch { }
    }
    loadConversations();
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function loadConversations() {
    setLoadingConvs(true);
    try {
      const data = await apiCall('/chat/conversations');
      let list: Conversation[] = [];
      if (Array.isArray(data)) {
        list = data;
      } else if (data?.data && Array.isArray(data.data)) {
        list = data.data;
      } else if (data?.conversations && Array.isArray(data.conversations)) {
        list = data.conversations;
      }
      setConversations(list);

      // Handle query params like ?property_id=8 or ?agent=123
      const propId = searchParams.get('property_id') ? Number(searchParams.get('property_id')) : null;
      const agentId = (searchParams.get('agent') || searchParams.get('agent_id')) ? Number(searchParams.get('agent') || searchParams.get('agent_id')) : null;

      if (propId || agentId) {
        const existing = list.find((c: any) => 
          (propId && (c?.property?.id === propId || c?.property_id === propId)) ||
          (agentId && (c?.other_user?.id === agentId || c?.agent_id === agentId || c?.recipient_id === agentId))
        );

        if (existing) {
          openConversation(existing);
        } else {
          // Create conversation if it does not exist yet
          try {
            const payload: any = {};
            if (propId) payload.property_id = propId;
            if (agentId) payload.recipient_id = agentId;
            const newConv = await apiCall('/chat/conversations', {
              method: 'POST',
              body: JSON.stringify(payload),
            });
            if (newConv && (newConv.id || typeof newConv === 'object')) {
              const created = newConv.id ? newConv : (newConv.data || newConv);
              setConversations((prev) => [created, ...prev.filter((c) => c.id !== created.id)]);
              openConversation(created);
            }
          } catch (createErr) {
            console.error('Failed to create new conversation:', createErr);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
      setConversations([]);
    } finally {
      setLoadingConvs(false);
    }
  }

  async function fetchMessagesForConv(convId: number): Promise<Message[]> {
    try {
      const data = await apiCall(`/chat/conversations/${convId}`);
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.messages)) return data.messages;
      if (Array.isArray(data?.data?.messages)) return data.data.messages;
      if (Array.isArray(data?.data)) return data.data;

      // Fallback try /chat/conversations/{convId}/messages
      const dataFallback = await apiCall(`/chat/conversations/${convId}/messages`);
      if (Array.isArray(dataFallback)) return dataFallback;
      if (Array.isArray(dataFallback?.messages)) return dataFallback.messages;
      if (Array.isArray(dataFallback?.data)) return dataFallback.data;
      return [];
    } catch (err) {
      // If first call threw, try fallback
      try {
        const dataFallback = await apiCall(`/chat/conversations/${convId}/messages`);
        if (Array.isArray(dataFallback)) return dataFallback;
        if (Array.isArray(dataFallback?.messages)) return dataFallback.messages;
        if (Array.isArray(dataFallback?.data)) return dataFallback.data;
      } catch { }
      return [];
    }
  }

  async function openConversation(conv: Conversation) {
    setActiveConv(conv);
    setLoadingMsgs(true);
    try {
      const list = await fetchMessagesForConv(conv.id);
      setMessages(list);
    } catch {
      setMessages([]);
    } finally {
      setLoadingMsgs(false);
    }

    // Poll for new messages
    if (pollingRef.current) clearInterval(pollingRef.current);
    pollingRef.current = setInterval(async () => {
      try {
        const list = await fetchMessagesForConv(conv.id);
        setMessages(list);
      } catch { }
    }, 5000);
  }

  async function sendMessage() {
    if (!newMessage.trim() || !activeConv) return;
    const content = newMessage;
    setNewMessage('');
    try {
      await apiCall(`/chat/conversations/${activeConv.id}/messages`, {
        method: 'POST',
        body: JSON.stringify({ content, message: content }),
      });
      const list = await fetchMessagesForConv(activeConv.id);
      setMessages(list);
      loadConversations();
    } catch (err: any) {
      setNewMessage(content);
    }
  }

  const safeConvs = Array.isArray(conversations) ? conversations : [];
  const filteredConvs = safeConvs.filter((c) => {
    const username = c?.other_user?.username || '';
    const title = c?.property?.title || '';
    const term = searchTerm.toLowerCase();
    return username.toLowerCase().includes(term) || title.toLowerCase().includes(term);
  });

  return (
    <main style={{ paddingTop: '5.5rem', paddingBottom: '3rem', minHeight: 'calc(100vh - 120px)' }}>
      <div className="container" style={{ maxWidth: '1100px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: activeConv && isMobileView ? '1fr' : '340px 1fr',
            background: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '20px',
            overflow: 'hidden',
            minHeight: '620px',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.06)',
          }}
        >
          {/* Sidebar */}
          <aside
            style={{
              borderRight: '1px solid hsl(var(--border))',
              display: activeConv && isMobileView ? 'none' : 'flex',
              flexDirection: 'column',
              background: 'hsl(var(--card))',
            }}
          >
            <div style={{ padding: '1.25rem 1.25rem 0.75rem 1.25rem' }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', fontWeight: 400, margin: '0 0 1rem 0' }}>
                Messages
              </h2>
              {/* Search Bar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.55rem 0.85rem',
                  borderRadius: '10px',
                  background: 'hsl(var(--muted))',
                  border: '1px solid hsl(var(--border))',
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    width: '100%',
                    fontSize: '0.875rem',
                    color: 'hsl(var(--foreground))',
                  }}
                />
              </div>
            </div>

            {/* Conversations List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
              {loadingConvs ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'hsl(var(--muted-foreground))' }}>
                  <div className="spinner-large" style={{ margin: '0 auto 1rem auto' }}></div>
                  <p style={{ fontSize: '0.875rem' }}>Loading messages...</p>
                </div>
              ) : filteredConvs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'hsl(var(--muted-foreground))' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>💬</div>
                  <h4 style={{ margin: '0 0 0.35rem 0', color: 'hsl(var(--foreground))', fontSize: '1rem' }}>No conversations</h4>
                  <p style={{ fontSize: '0.8125rem', marginBottom: '1.25rem' }}>Start chatting by inquiring about any property</p>
                  <Link
                    href="/properties"
                    className="btn-primary"
                    style={{ borderRadius: '9999px', padding: '0.45rem 1.25rem', fontSize: '0.8125rem', textDecoration: 'none', display: 'inline-block' }}
                  >
                    Browse Properties
                  </Link>
                </div>
              ) : (
                filteredConvs.map((conv) => {
                  const isSelected = activeConv?.id === conv.id;
                  const username = conv.other_user?.username || 'User';
                  const propTitle = conv.property?.title || 'Property Inquiry';

                  return (
                    <div
                      key={conv.id}
                      onClick={() => {
                        openConversation(conv);
                        setIsMobileView(true);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.85rem',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        marginBottom: '0.25rem',
                        background: isSelected ? 'hsl(var(--muted))' : 'transparent',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.background = 'hsla(var(--muted), 0.5)';
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      {/* Avatar */}
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: 'hsl(var(--primary))',
                          color: 'hsl(var(--primary-foreground))',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          flexShrink: 0,
                          textTransform: 'uppercase',
                        }}
                      >
                        {username.charAt(0)}
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.15rem' }}>
                          <h4 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600, color: 'hsl(var(--foreground))', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {username}
                          </h4>
                          {conv.unread_count ? (
                            <span style={{ fontSize: '0.65rem', background: '#ef4444', color: 'white', padding: '1px 6px', borderRadius: '10px', fontWeight: 600 }}>
                              {conv.unread_count}
                            </span>
                          ) : null}
                        </div>
                        <p style={{ margin: '0 0 0.15rem 0', fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          🏠 {propTitle}
                        </p>
                        {conv.last_message && (
                          <p style={{ margin: 0, fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', opacity: 0.8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {conv.last_message}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </aside>

          {/* Chat Area */}
          <section style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'hsl(var(--background))' }}>
            {!activeConv ? (
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  padding: '3rem 2rem',
                  textAlign: 'center',
                  color: 'hsl(var(--muted-foreground))',
                }}
              >
                <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>✉️</div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'hsl(var(--foreground))', margin: '0 0 0.5rem 0' }}>
                  Select a Conversation
                </h3>
                <p style={{ fontSize: '0.9375rem', maxWidth: '380px' }}>
                  Choose a chat from the left sidebar to view messages or inquire about properties to start a conversation.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                {/* Chat Header */}
                <div
                  style={{
                    padding: '1rem 1.5rem',
                    borderBottom: '1px solid hsl(var(--border))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'hsl(var(--card))',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <button
                      onClick={() => {
                        setActiveConv(null);
                        setIsMobileView(false);
                        if (pollingRef.current) clearInterval(pollingRef.current);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '1.25rem',
                        cursor: 'pointer',
                        color: 'hsl(var(--muted-foreground))',
                        padding: '0.25rem 0.5rem',
                      }}
                    >
                      ←
                    </button>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        background: 'hsl(var(--primary))',
                        color: 'hsl(var(--primary-foreground))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        textTransform: 'uppercase',
                      }}
                    >
                      {activeConv.other_user?.username ? activeConv.other_user.username.charAt(0) : 'U'}
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 0.15rem 0', fontSize: '1rem', fontWeight: 600 }}>
                        {activeConv.other_user?.username || 'User'}
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>
                        {activeConv.property?.title}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {activeConv.property?.id && (
                      <Link
                        href={`/property?id=${activeConv.property.id}`}
                        className="btn-secondary"
                        style={{
                          borderRadius: '9999px',
                          padding: '0.35rem 0.85rem',
                          fontSize: '0.75rem',
                          textDecoration: 'none',
                          color: 'inherit',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                        }}
                      >
                        View Property ↗
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        setActiveConv(null);
                        if (pollingRef.current) clearInterval(pollingRef.current);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'hsl(var(--muted-foreground))',
                        cursor: 'pointer',
                        padding: '0.35rem',
                        fontSize: '1rem',
                      }}
                      title="Close Chat"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Messages Container */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {loadingMsgs ? (
                    <div style={{ textAlign: 'center', padding: '2rem 0', color: 'hsl(var(--muted-foreground))' }}>
                      <p style={{ fontSize: '0.875rem' }}>Loading messages...</p>
                    </div>
                  ) : !Array.isArray(messages) || messages.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem 0', color: 'hsl(var(--muted-foreground))' }}>
                      <p style={{ fontSize: '0.875rem' }}>No messages in this conversation yet. Say hello!</p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.sender_id === currentUserId;
                      return (
                        <div
                          key={msg.id}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: isMe ? 'flex-end' : 'flex-start',
                            maxWidth: '75%',
                            alignSelf: isMe ? 'flex-end' : 'flex-start',
                          }}
                        >
                          <div
                            style={{
                              padding: '0.75rem 1rem',
                              borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                              background: isMe ? 'hsl(var(--primary))' : 'hsl(var(--card))',
                              color: isMe ? 'hsl(var(--primary-foreground))' : 'hsl(var(--foreground))',
                              border: isMe ? 'none' : '1px solid hsl(var(--border))',
                              fontSize: '0.875rem',
                              lineHeight: 1.5,
                              wordBreak: 'break-word',
                              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
                            }}
                          >
                            {msg.content}
                          </div>
                          <span style={{ fontSize: '0.6875rem', color: 'hsl(var(--muted-foreground))', marginTop: '0.25rem', padding: '0 0.25rem' }}>
                            {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input Box */}
                <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      background: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '9999px',
                      padding: '0.35rem 0.5rem 0.35rem 1.25rem',
                    }}
                  >
                    <input
                      type="text"
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      style={{
                        flex: 1,
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        fontSize: '0.875rem',
                        color: 'hsl(var(--foreground))',
                      }}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="btn-primary"
                      style={{
                        borderRadius: '9999px',
                        padding: '0.5rem 1rem',
                        fontSize: '0.8125rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        cursor: newMessage.trim() ? 'pointer' : 'default',
                        opacity: newMessage.trim() ? 1 : 0.6,
                      }}
                    >
                      <span>Send</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

export default function ChatPage() {
  return (
    <>
      <AppNav activePage="chat" />
      <div className="page-wrapper landing-body" style={{ minHeight: '100vh', overflow: 'hidden' }}>
        <div className="vertical-line left"></div>
        <div className="vertical-line right"></div>
        <Suspense fallback={<div style={{ textAlign: 'center', padding: '6rem 0' }}>Loading...</div>}>
          <ChatContent />
        </Suspense>
        <AppFooter />
      </div>
    </>
  );
}
