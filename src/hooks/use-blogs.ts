import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { getEcomBlog, getEcomBlogs } from '@/lib/api';
import type { ApiError } from '@/lib/api';

const BUSINESS_ID = Number(import.meta.env.VITE_BUSINESS_ID ?? 1) || 1;

export const blogsKeys = {
  all: ['ecom-blogs'] as const,
  list: () => [...blogsKeys.all, 'list', BUSINESS_ID] as const,
  detail: (slug: string) => [...blogsKeys.all, 'detail', slug] as const,
};

/** Infinite paginated blog list — pages accumulate behind "Load more" */
export function useEcomBlogs(perPage = 12, enabled = true) {
  return useInfiniteQuery({
    queryKey: blogsKeys.list(),
    queryFn: ({ pageParam }) =>
      getEcomBlogs({ business_id: BUSINESS_ID, per_page: perPage, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.currentPage < last.lastPage ? last.currentPage + 1 : undefined),
    staleTime: 60_000,
    enabled,
  });
}

/** Single post by slug — 404s are not retried so the not-found view shows immediately */
export function useEcomBlog(slug: string | undefined, enabled = true) {
  return useQuery({
    queryKey: blogsKeys.detail(slug ?? ''),
    queryFn: () => getEcomBlog(slug!, BUSINESS_ID),
    enabled: enabled && !!slug,
    staleTime: 60_000,
    retry: (count, err) => (err as ApiError)?.status !== 404 && count < 2,
  });
}
