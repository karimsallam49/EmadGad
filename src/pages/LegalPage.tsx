import { Link } from 'react-router';
import { FileText } from 'lucide-react';
import { useLang } from '@/i18n';
import { POLICIES } from '@/content/policies';
import { useLegalPage } from '@/hooks/use-legal-page';
import type { LegalSlug } from '@/types/api';

const SLUG: Record<keyof typeof POLICIES, LegalSlug> = {
  return: 'return-policy',
  terms: 'terms',
  cancellation: 'cancellation-policy',
  privacy: 'privacy-policy',
};

type Block = { type: 'p' | 'ul'; lines: string[] };

/** Admin content is plain text / light markup — lines starting with - • – * become bullets,
 *  consecutive bullets group into one list, everything else is a paragraph */
function parseContent(text: string): Block[] {
  const blocks: Block[] = [];
  let bullets: string[] = [];
  const flush = () => {
    if (bullets.length) {
      blocks.push({ type: 'ul', lines: bullets });
      bullets = [];
    }
  };
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) {
      flush();
      continue;
    }
    const bullet = line.match(/^[-•–*]\s+(.+)/);
    if (bullet) {
      bullets.push(bullet[1]);
      continue;
    }
    flush();
    blocks.push({ type: 'p', lines: [line] });
  }
  flush();
  return blocks;
}

function ContentBlocks({ text }: { text: string }) {
  return (
    <div className="mt-8 space-y-4 rounded-2xl border-2 border-border bg-white p-6">
      {parseContent(text).map((b, i) =>
        b.type === 'ul' ? (
          <ul key={i} className="space-y-2">
            {b.lines.map((line) => (
              <li key={line} className="flex items-start gap-2.5 text-sm font-semibold text-ink leading-relaxed">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-dark" />
                {line}
              </li>
            ))}
          </ul>
        ) : (
          <p key={i} className="text-sm font-semibold text-ink leading-relaxed">
            {b.lines[0]}
          </p>
        ),
      )}
    </div>
  );
}

export default function LegalPage({ doc }: { doc: keyof typeof POLICIES }) {
  const { t, isAr } = useLang();
  const policy = POLICIES[doc];
  const { data: apiPage, isLoading } = useLegalPage(SLUG[doc]);

  const apiTitle = (isAr ? apiPage?.title_ar : apiPage?.title_en)?.trim();
  const apiContent = (isAr ? apiPage?.content_ar : apiPage?.content_en)?.trim();
  const title = apiTitle || (isAr ? policy.title.ar : policy.title.en);

  return (
    <div className="bg-paper">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 lg:py-14">
        <nav aria-label="breadcrumb" className="text-sm font-bold text-ink-mute">
          <Link to="/" className="hover:text-ink">{t('الرئيسية')}</Link>
          <span className="mx-2">/</span>
          <span className="text-ink">{title}</span>
        </nav>

        <div className="mt-6 flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand text-coal">
            <FileText className="h-6 w-6" />
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-ink">{title}</h1>
        </div>
        <p className="mt-4 text-lg font-semibold text-ink-mute leading-relaxed">
          {isAr ? policy.intro.ar : policy.intro.en}
        </p>

        {isLoading ? (
          <div className="mt-8 space-y-5" aria-hidden>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl border-2 border-border bg-white p-6">
                <div className="h-5 w-40 rounded bg-border" />
                <div className="mt-4 space-y-2.5">
                  <div className="h-3.5 w-full rounded bg-muted" />
                  <div className="h-3.5 w-11/12 rounded bg-muted" />
                  <div className="h-3.5 w-4/5 rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : apiContent ? (
          <ContentBlocks text={apiContent} />
        ) : (
          <div className="mt-8 space-y-5">
            {policy.sections.map((s) => (
              <section key={s.h.ar} className="rounded-2xl border-2 border-border bg-white p-6">
                <h2 className="text-xl font-black text-ink">{isAr ? s.h.ar : s.h.en}</h2>
                <ul className="mt-3 space-y-2">
                  {(isAr ? s.body.ar : s.body.en).map((line) => (
                    <li key={line} className="flex items-start gap-2.5 text-sm font-semibold text-ink leading-relaxed">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-dark" />
                      {line}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
