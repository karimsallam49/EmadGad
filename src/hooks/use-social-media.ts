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

/** WhatsApp link from the API socials, falling back to the static URL */
export function useWhatsappUrl() {
  const { data } = useSocialMedia();
  const wa = data?.find(
    (s) => /whats/i.test(s.name) || /wa\.me|whatsapp/i.test(s.link)
  );
  return wa?.link ?? WHATSAPP_URL;
}
