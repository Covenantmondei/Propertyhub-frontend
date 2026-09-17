'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import AppNav from '@/components/AppNav';
import AppFooter from '@/components/AppFooter';
import { apiCall, API_BASE_URL } from '@/lib/api';

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
    if (!localStorage.getItem('authToken')) { router.replace('/login'); return; }
    const userStr = localStorage.getItem('user');
    if (userStr) { try { setCurrentUserId(JSON.parse(userStr).user_id); } catch {} }
    loadConversations();
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function loadConversations() {
    setLoadingConvs(true);
    try {
      const data = await apiCall('/messages/conversations');
      setConversations(data);
    } catch {} finally { setLoadingConvs(false); }
  }

  async function openConversation(conv: Conversation) {
    setActiveConv(conv);
    setLoadingMsgs(true);
    try {
      const data = await apiCall(`/messages/conversations/${conv.id}/messages`);
      setMessages(data);
    } catch {} finally { setLoadingMsgs(false); }

    // Poll for new messages
    if (pollingRef.current) clearInterval(pollingRef.current);
    pollingRef.current = setInterval(async () => {
      try {
        const data = await apiCall(`/messages/conversations/${conv.id}/messages`);
        setMessages(data);
      } catch {}
    }, 5000);
  }

  async function sendMessage() {
    if (!newMessage.trim() || !activeConv) return;
    const content = newMessage;
    setNewMessage('');
    try {
      await apiCall(`/messages/conversations/${activeConv.id}/messages`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      });
      const data = await apiCall(`/messages/conversations/${activeConv.id}/messages`);
      setMessages(data);
    } catch (err: any) { setNewMessage(content); }
  }

  const filteredConvs = conversations.filter(c =>
    c.other_user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.property.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="chat-main">
      <div className="chat-container">
        {/* Sidebar */}
        <aside className={`conversations-sidebar${activeConv && isMobileView ? ' hidden' : ''}`}>
          <div className="sidebar-header"><h2>Messages</h2></div>
          <div className="search-bar">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input type="text" id="conversation-search" placeholder="Search conversations..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <div className="conversations-list" id="conversations-list">
            {loadingConvs ? (
              <div className="conversations-loading" id="conversations-loading"><p>Loading conversations...</p></div>
            ) : filteredConvs.length === 0 ? (
              <div className="conversations-empty" id="conversations-empty">
                <h3>No conversations yet</h3>
                <p>Start chatting by inquiring about a property</p>
                <a href="/properties" className="btn btn-primary">Browse Properties</a>
              </div>
            ) : filteredConvs.map(conv => (
              <div key={conv.id} className={`conversation-item${activeConv?.id === conv.id ? ' active' : ''}`} onClick={() => { openConversation(conv); setIsMobileView(true); }}>
                <div className="conv-avatar">{conv.other_user.username.charAt(0).toUpperCase()}</div>
                <div className="conv-info">
                  <h4>{conv.other_user.username}</h4>
                  <p>{conv.property.title}</p>
                  {conv.last_message && <p className="conv-last-msg">{conv.last_message}</p>}
                </div>
                {conv.unread_count ? <span className="unread-badge">{conv.unread_count}</span> : null}
              </div>
            ))}
          </div>
        </aside>

        {/* Chat Area */}
        <section className="chat-area">
          {!activeConv ? (
            <div className="chat-welcome" id="chat-welcome">
              <div className="welcome-content">
                <h2>Welcome to Messages</h2>
                <p>Select a conversation from the sidebar to start chatting</p>
              </div>
            </div>
          ) : (
            <div className="active-chat" id="active-chat">
              <div className="chat-header">
                <div className="chat-header-info">
                  <button className="btn-icon mobile-back-btn" id="mobile-back-btn" onClick={() => { setActiveConv(null); setIsMobileView(false); if (pollingRef.current) clearInterval(pollingRef.current); }}>←</button>
                  <div className="user-avatar" id="chat-user-avatar">{activeConv.other_user.username.charAt(0).toUpperCase()}</div>
                  <div className="user-details">
                    <h3 id="chat-user-name" onClick={() => router.push(`/agent-profile?id=${activeConv.other_user.id}`)} style={{ cursor: 'pointer' }}>{activeConv.other_user.username} ↗</h3>
                    <p id="chat-property-info">{activeConv.property.title}</p>
                  </div>
                </div>
                <div className="chat-header-actions">
                  <button className="btn-icon" id="view-property-btn" onClick={() => router.push(`/property?id=${activeConv.property.id}`)} title="View Property">↗</button>
                  <button className="btn-icon desktop-close-btn" id="close-chat-btn" onClick={() => { setActiveConv(null); if (pollingRef.current) clearInterval(pollingRef.current); }} title="Close Chat">✕</button>
                </div>
              </div>

              <div className="messages-container" id="messages-container">
                {loadingMsgs ? (
                  <div className="messages-loading" id="messages-loading"><p>Loading messages...</p></div>
                ) : messages.map(msg => (
                  <div key={msg.id} className={`message ${msg.sender_id === currentUserId ? 'sent' : 'received'}`}>
                    <div className="message-bubble">{msg.content}</div>
                    <span className="message-time">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="message-input-container">
                <div className="message-input-wrapper">
                  <textarea
                    id="message-input"
                    placeholder="Type your message..."
                    rows={1}
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  />
                  <button className="btn-send" id="send-message-btn" disabled={!newMessage.trim()} onClick={sendMessage}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 20, height: 20 }}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default function ChatPage() {
  return (
    <>
      <AppNav />
      <Suspense fallback={<div className="loading-state"><p>Loading...</p></div>}>
        <ChatContent />
      </Suspense>
      <AppFooter />
    </>
  );
}
