import { useQuery } from '@tanstack/react-query';
import { getSocialMedia } from '@/lib/api';
import { WHATSAPP_URL } from '@/data';

export const socialMediaKeys = {
  all: ['social-media'] as const,
};

/** Public API — active social-media links for the business */
export function useSocialMedia() {
  return useQuery({
    queryKey: socialMediaKeys.all,
    queryFn: () => getSocialMedia(1),
    staleTime: 5 * 60_000,
  });
}

/** Append a prefilled message to a WhatsApp link.
 *  wa.me/qr short links don't support ?text — use the direct number instead. */
export function waTextLink(base: string, text?: string | null) {
  if (!text) return base;
  const target = /\/qr\//i.test(base) ? WHATSAPP_URL : base;
  return `${target}${target.includes('?') ? '&' : '?'}text=${encodeURIComponent(text)}`;
}

/** WhatsApp link from the API socials, falling back to the static URL.
 *  Pass `text` to prefill the chat message. */
export function useWhatsappUrl(text?: string) {
  const { data } = useSocialMedia();
  const wa = data?.find(
    (s) => /whats/i.test(s.name) || /wa\.me|whatsapp/i.test(s.link)
  );
  return waTextLink(wa?.link ?? WHATSAPP_URL, text);
}
