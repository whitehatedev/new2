import React, { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { usePlatform } from '../context/PlatformContext';
import { CmsPageRecord } from '../types/platform';

export const CustomCmsPage: React.FC<{ slug: string }> = ({ slug }) => {
  const { apiFetch, navigate } = usePlatform();
  const [page, setPage] = useState<CmsPageRecord | null>(null);
  const [content, setContent] = useState<CmsPageRecord['draftContent'] | null>(null);
  const [isPreview, setIsPreview] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const preview = new URLSearchParams(window.location.search).get('preview') === 'true';
        const res = await apiFetch<{
          page: CmsPageRecord;
          content: CmsPageRecord['draftContent'];
          isPreview: boolean;
        }>(`/api/pages/${encodeURIComponent(slug)}${preview ? '?preview=true' : ''}`);
        if (active) {
          setPage(res.page);
          setContent(res.content);
          setIsPreview(res.isPreview);
        }
      } catch {
        if (active) {
          setPage(null);
          setContent(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [slug, apiFetch]);

  useEffect(() => {
    if (page) {
      document.title = page.seoTitle || page.title;
    }
  }, [page]);

  if (loading) {
    return <div className="max-w-5xl mx-auto px-4 py-20 text-sm text-slate-500">Loading page...</div>;
  }

  if (!page || !content) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="font-display text-3xl font-bold text-slate-950">Page Not Found</h1>
        <p className="text-sm text-slate-600">This custom landing page does not exist or has not been published yet.</p>
        <button
          onClick={() => navigate('/')}
          className="px-5 py-2.5 bg-[#15803D] hover:bg-[#166534] text-white text-sm font-semibold rounded-lg"
        >
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-16">
      {isPreview && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center text-xs font-semibold text-amber-900">
          Draft Preview Mode — Changes shown here are not live until published in Website Editor.
        </div>
      )}

      <section className="bg-[#111417] text-white border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className={content.heroImageUrl || content.heroVideoUrl ? 'lg:col-span-7 space-y-5' : 'lg:col-span-12 space-y-5'}>
            <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-balance">
              {content.heroHeadline || page.title}
            </h1>
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
              {content.heroSubheadline}
            </p>
            {content.ctaLabel && (
              <button
                onClick={() => navigate(content.ctaLink || '/contact')}
                className="px-5 py-2.5 bg-[#15803D] hover:bg-[#166534] text-white text-sm font-semibold rounded-lg inline-flex items-center gap-2 whitespace-nowrap"
              >
                {content.ctaLabel} <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
          {(content.heroVideoUrl || content.heroImageUrl) && (
            <div className="lg:col-span-5 rounded-xl overflow-hidden border border-white/15 bg-black aspect-[16/10]">
              {content.heroVideoUrl ? (
                <video
                  src={content.heroVideoUrl}
                  controls
                  playsInline
                  preload="metadata"
                  poster={content.heroImageUrl || undefined}
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={content.heroImageUrl}
                  alt={content.heroHeadline || page.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          )}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8 pb-10">
        {(content.blocks || []).map((block) => (
          <div key={block.id} className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 space-y-4">
            {block.videoUrl ? (
              <div className="aspect-[16/9] rounded-lg overflow-hidden bg-black">
                <video
                  src={block.videoUrl}
                  controls
                  playsInline
                  preload="metadata"
                  poster={block.imageUrl || undefined}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : block.imageUrl ? (
              <div className="aspect-[16/9] rounded-lg overflow-hidden bg-slate-100">
                <img src={block.imageUrl} alt={block.heading} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              </div>
            ) : null}
            <h2 className="font-display text-2xl font-bold text-slate-950">{block.heading}</h2>
            <div className="text-sm sm:text-base text-slate-600 leading-relaxed whitespace-pre-line">{block.body}</div>
          </div>
        ))}
      </section>
    </div>
  );
};
