import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { Headset, ImageIcon, Loader2, Lock, MessageCircle, Send, X } from 'lucide-react';
import { toast } from 'sonner';
import { useLang } from '@/i18n';
import { useAuth } from '@/auth';
import { useChatMessages, useSendChatMessage, useMarkChatRead } from '@/hooks/use-chat';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';

function msgTime(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso.replace(' ', 'T'));
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function ChatWidget() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Chat with us"
        className="fixed bottom-20 lg:bottom-6 end-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-coal text-brand shadow-[0_6px_20px_rgba(0,0,0,0.35)] hover:scale-105 transition-transform will-change-transform"
      >
        <Headset className="h-7 w-7" />
      </button>
      <ChatSheet open={open} onOpenChange={setOpen} isAuthed={!!user} />
    </>
  );
}

function ChatSheet({ open, onOpenChange, isAuthed }: { open: boolean; onOpenChange: (o: boolean) => void; isAuthed: boolean }) {
  const { t, isAr } = useLang();
  const messages = useChatMessages(open);
  const send = useSendChatMessage();
  const markRead = useMarkChatRead();

  const [text, setText] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const items = messages.data ?? [];

  // mark admin messages as read when the chat opens / new ones arrive
  useEffect(() => {
    if (open && isAuthed && items.some((m) => m.sender_type !== 'customer')) {
      markRead.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isAuthed, items.length]);

  // scroll to bottom on new messages
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [open, items.length]);

  const pickImage = (f: File | null) => {
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      toast.error(t('الصورة أكبر من 5 ميجا'));
      return;
    }
    setImage(f);
    setImagePreview(URL.createObjectURL(f));
  };

  const clearImage = () => {
    setImage(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const doSend = () => {
    const msg = text.trim();
    if ((!msg && !image) || send.isPending) return;
    send.mutate(
      { message: msg || undefined, image: image ?? undefined },
      {
        onSuccess: () => {
          setText('');
          clearImage();
        },
        onError: () => toast.error(t('مش قادر أبعت الرسالة دلوقتي')),
      },
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[92vw] max-w-md p-0 flex flex-col">
        <SheetHeader className="p-5 pb-3 border-b-2 border-border">
          <SheetTitle className="text-xl font-black text-ink flex items-center gap-2">
            <Headset className="h-5 w-5" /> {t('تواصل معنا')}
          </SheetTitle>
          <SheetDescription className="sr-only">{t('محادثة مع فريق الدعم')}</SheetDescription>
        </SheetHeader>

        {!isAuthed ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <Lock className="h-12 w-12 text-muted-foreground/40 mb-3" />
            <p className="text-ink font-extrabold">{t('سجّل دخولك عشان تكلمنا')}</p>
            <Link
              to="/login"
              onClick={() => onOpenChange(false)}
              className="mt-4 rounded-xl bg-coal text-brand px-6 py-3 font-black hover:bg-coal-soft"
            >
              {t('تسجيل الدخول')}
            </Link>
          </div>
        ) : (
          <>
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.isLoading && (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              )}

              {!messages.isLoading && items.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center py-10">
                  <MessageCircle className="h-12 w-12 text-muted-foreground/40 mb-3" />
                  <p className="text-ink font-bold">{t('ابدأ المحادثة')}</p>
                  <p className="text-muted-foreground text-sm mt-1">{t('اسألنا عن أي حاجة — منتجات، أوردرات، حجوزات')}</p>
                </div>
              )}

              {items.map((m) => {
                const mine = m.sender_type === 'customer';
                return (
                  <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-black ${
                        mine
                          ? 'bg-brand rounded-br-sm'
                          : 'bg-muted rounded-bl-sm'
                      }`}
                    >
                      {m.image_url && (
                        <a href={m.image_url} target="_blank" rel="noreferrer">
                          <img src={m.image_url} alt="" className="rounded-lg max-h-40 w-auto mb-1.5" loading="lazy" />
                        </a>
                      )}
                      {m.message && <p className="text-sm font-medium whitespace-pre-wrap">{m.message}</p>}
                      <p className={`text-[10px] mt-1 ${mine ? 'text-gray-600' : 'text-gray-500'}`}>
                        {msgTime(m.created_at)} {!mine && '· ' + t('الدعم')}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {imagePreview && (
              <div className="px-4 pb-2">
                <div className="relative inline-block">
                  <img src={imagePreview} alt="" className="h-20 w-20 rounded-xl object-cover border-2 border-border" />
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute -top-2 -end-2 h-6 w-6 rounded-full bg-ink text-white flex items-center justify-center"
                    aria-label="Remove image"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}

            <div className="p-4 border-t-2 border-border flex items-center gap-2">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => pickImage(e.target.files?.[0] ?? null)}
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="h-11 w-11 shrink-0 rounded-xl border-2 border-border flex items-center justify-center text-ink hover:bg-muted"
                aria-label="Attach image"
              >
                <ImageIcon className="h-5 w-5" />
              </button>
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); doSend(); } }}
                placeholder={t('اكتب رسالتك...')}
                dir={isAr ? 'rtl' : 'ltr'}
                className="flex-1 h-11 rounded-xl border-2 border-border px-4 font-medium text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand"
              />
              <button
                type="button"
                onClick={doSend}
                disabled={send.isPending || (!text.trim() && !image)}
                className="h-11 w-11 shrink-0 rounded-xl bg-coal text-brand flex items-center justify-center hover:bg-coal-soft disabled:opacity-40"
                aria-label="Send"
              >
                {send.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className={`h-5 w-5 ${isAr ? '-scale-x-100' : ''}`} />}
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
