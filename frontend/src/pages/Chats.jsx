import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCheck, Clock3, MessageCircle, Send, ShieldCheck, UserPlus } from 'lucide-react';
import { chatService } from '../services';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';
import ItemImage from '../components/ItemImage';
import StatusBadge from '../components/StatusBadge';
import { useToast } from '../context/ToastContext';
import { formatDate } from '../utils/helpers';
import Modal from '../components/Modal';

function relativeTime(value) {
  if (!value) return 'No messages yet';
  const date = new Date(value);
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hr ago`;
  return formatDate(value.slice(0, 10));
}

function LoginRequired() {
  return (
    <div className="container-x py-16 sm:py-24">
      <EmptyState
        icon={MessageCircle}
        title="Login required to access your chats."
        description="Sign in to talk safely about FINDIT lost-and-found items."
        action={<div className="flex flex-wrap justify-center gap-3"><Link to="/login"><Button>Login</Button></Link><Link to="/register"><Button variant="secondary">Create Account</Button></Link></div>}
      />
    </div>
  );
}

export default function Chats() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div className="container-x py-20 text-center text-sm text-ink-soft">Checking your session…</div>;
  return isAuthenticated ? <ChatList /> : <LoginRequired />;
}

function ChatList() {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState('');
  const [starting, setStarting] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const load = useCallback(() => chatService.list().then(setChats).catch((err) => setError(err.message)).finally(() => setLoading(false)), []);
  useEffect(() => {
    load();
    const timer = window.setInterval(load, 10000);
    return () => window.clearInterval(timer);
  }, [load]);

  const openNewChat = async () => {
    setNewChatOpen(true);
    if (contacts.length === 0) {
      try { setContacts(await chatService.contacts()); } catch (err) { toast(err.message || 'Unable to load users.', 'error'); }
    }
  };

  const startChat = async () => {
    if (!selectedContact) return;
    setStarting(true);
    try {
      const chat = await chatService.start(selectedContact);
      navigate(`/chats/${chat.id}`);
    } catch (err) { toast(err.message || 'Unable to start chat.', 'error'); }
    finally { setStarting(false); }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-lavender-50">
      <div className="border-b border-lavender-200 bg-white"><div className="container-x py-10 sm:py-14"><span className="badge bg-primary-soft text-primary-dark"><MessageCircle size={13} /> Chats</span><h1 className="mt-4 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">Your Chats</h1><p className="mt-2 text-base text-ink-soft">Conversations about lost and found items.</p></div></div>
      <div className="container-x py-8 sm:py-12">
        <div className="mx-auto max-w-4xl">
          <div className="mb-5 flex items-center justify-between gap-3"><p className="text-sm text-ink-soft">Private conversations with FINDIT members.</p><Button size="sm" onClick={openNewChat}><UserPlus size={15} /> New Chat</Button></div>
          {loading ? <div className="space-y-3">{[1, 2, 3].map((key) => <div key={key} className="card h-24 animate-pulse" />)}</div> : error ? <EmptyState icon={MessageCircle} title="Unable to load chats" description={error} action={<Button onClick={() => { setLoading(true); setError(''); load(); }}>Try again</Button>} /> : chats.length === 0 ? <EmptyState icon={MessageCircle} title="No conversations yet" description="Start a private conversation with another FINDIT member." action={<Button onClick={openNewChat}><UserPlus size={15} /> Start a Chat</Button>} /> : <div className="space-y-3">{chats.map((chat) => <button key={chat.id} type="button" onClick={() => navigate(`/chats/${chat.id}`)} className="card flex w-full items-center gap-4 p-4 text-left transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lift sm:p-5"><ItemImage src={chat.item?.image} alt={chat.item?.title || 'Chat'} className="h-16 w-20 shrink-0 rounded-xl" /><span className="min-w-0 flex-1"><span className="flex flex-wrap items-center gap-2"><span className="truncate font-bold text-ink">{chat.item?.title || 'Direct conversation'}</span>{chat.item?.status && <StatusBadge status={chat.item.status} />}</span><span className="mt-1 block text-sm text-ink-soft">{chat.participant?.name || 'FINDIT user'} · {chat.lastMessage || 'Conversation started'}</span><span className="mt-1 flex items-center gap-1 text-xs text-ink-soft"><Clock3 size={12} /> {relativeTime(chat.lastMessageAt)}</span></span>{chat.unreadCount > 0 && <span className="grid h-7 min-w-7 place-items-center rounded-full bg-primary text-xs font-bold text-white" aria-label={`${chat.unreadCount} unread messages`}>{chat.unreadCount}</span>}</button>)}</div>}
        </div>
      </div>
      <Modal open={newChatOpen} onClose={() => setNewChatOpen(false)} title="Start a new chat" description="Choose a FINDIT member to start a private conversation." confirmLabel="Open Chat" loading={starting} onConfirm={startChat}>
        <label htmlFor="chat-contact" className="input-label">FINDIT member</label>
        <select id="chat-contact" value={selectedContact} onChange={(event) => setSelectedContact(event.target.value)} className="input appearance-none">
          <option value="">Select a person</option>{contacts.map((contact) => <option key={contact.id} value={contact.id}>{contact.name} · {contact.email}</option>)}
        </select>
      </Modal>
    </div>
  );
}

export function ChatConversation() {
  const { chatId } = useParams();
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const endRef = useRef(null);

  const loadMessages = useCallback(async () => {
    const [chatData, messageData] = await Promise.all([chatService.get(chatId), chatService.messages(chatId)]);
    setChat({ ...chatData, participant: { ...chatData.participant, currentUserId: user.id } });
    setMessages(messageData);
    await chatService.markRead(chatId);
  }, [chatId, user.id]);

  useEffect(() => {
    if (!isAuthenticated) return undefined;
    let active = true;
    loadMessages().catch((err) => active && setError(err.message)).finally(() => active && setLoading(false));
    const timer = window.setInterval(() => loadMessages().catch(() => {}), 5000);
    return () => { active = false; window.clearInterval(timer); };
  }, [isAuthenticated, loadMessages]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages.length]);

  if (isLoading) return <div className="container-x py-20 text-center text-sm text-ink-soft">Checking your session…</div>;
  if (!isAuthenticated) return <LoginRequired />;
  if (loading) return <div className="container-x py-20 text-center text-sm text-ink-soft">Loading conversation…</div>;
  if (error || !chat) return <div className="container-x py-20"><EmptyState icon={MessageCircle} title="Chat not found" description={error || 'You may not have access to this conversation.'} action={<Button onClick={() => navigate('/chats')}>Back to Chats</Button>} /></div>;

  const send = async (event) => {
    event?.preventDefault();
    const message = text.trim();
    if (!message || sending) return;
    setSending(true);
    try {
      const created = await chatService.send(chatId, message);
      setMessages((list) => [...list, created]);
      setChat((current) => ({ ...current, lastMessage: created.message, lastMessageAt: created.createdAt }));
      setText('');
    } catch (err) {
      toast(err.message || 'Failed to send message.', 'error', 'Message not sent');
    } finally { setSending(false); }
  };

  return (
    <div className="bg-lavender-50"><div className="container-x py-6 sm:py-10"><div className="mx-auto flex min-h-[calc(100vh-13rem)] max-w-3xl flex-col overflow-hidden rounded-3xl border border-lavender-200 bg-white shadow-card"><div className="flex items-center gap-3 border-b border-lavender-200 p-4 sm:p-5"><button type="button" onClick={() => navigate('/chats')} className="rounded-full p-2 text-ink-soft hover:bg-lavender-50" aria-label="Back to Chats"><ArrowLeft size={19} /></button><ItemImage src={chat.item?.image} alt={chat.item?.title || 'Item'} className="h-12 w-14 rounded-xl" /><div className="min-w-0"><h1 className="truncate font-bold text-ink">{chat.item?.title || 'FINDIT item'}</h1><p className="truncate text-xs text-ink-soft">{chat.item?.type === 'found' ? 'Found' : 'Lost'} · {chat.item?.location || 'Campus'} · Chatting with {chat.participant?.name || 'FINDIT user'}</p></div></div><div className="flex flex-1 flex-col overflow-y-auto bg-lavender-50/50 p-4 sm:p-6"><div className="mb-5 flex items-center justify-center gap-2 text-center text-xs text-ink-soft"><ShieldCheck size={14} className="text-primary" /> Keep personal information private until ownership is verified.</div>{messages.length === 0 ? <div className="m-auto text-center text-sm text-ink-soft"><MessageCircle className="mx-auto mb-3 text-primary" size={28} /><p>No messages yet.</p><p className="mt-1">Start by asking about the item details.</p></div> : messages.map((message) => <MessageBubble key={message.id} message={message} mine={message.senderId === chat.participant?.currentUserId} />)}<div ref={endRef} /></div><form onSubmit={send} className="flex items-end gap-3 border-t border-lavender-200 bg-white p-3 sm:p-4"><textarea value={text} onChange={(event) => setText(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); send(event); } }} rows={1} maxLength={2000} placeholder="Type a message…" className="input max-h-28 min-h-[44px] flex-1 resize-none !py-3" aria-label="Chat message" /><Button type="submit" loading={sending} disabled={!text.trim()} aria-label="Send message"><Send size={16} /> <span className="hidden sm:inline">Send</span></Button></form></div></div></div>
  );
}

function MessageBubble({ message, mine }) {
  return <div className={`mb-3 flex ${mine ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-soft ${mine ? 'rounded-br-md bg-primary text-white' : 'rounded-bl-md border border-lavender-200 bg-white text-ink'}`}><p className="whitespace-pre-wrap break-words">{message.message}</p><p className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${mine ? 'text-white/70' : 'text-ink-soft'}`}>{message.senderName} · {relativeTime(message.createdAt)} {mine && <CheckCheck size={12} />}</p></div></div>;
}
