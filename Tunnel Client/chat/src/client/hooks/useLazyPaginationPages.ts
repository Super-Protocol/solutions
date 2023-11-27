import {
  useMemo,
} from 'react';
import { useInfiniteQuery } from 'react-query';

export type UseLazyPaginationResult<TNode> = {
  data: TNode[];
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  total: number;
}

export interface ConnectorResult<TNode> {
  list: TNode[];
  hasNextPage: boolean;
  pageNum: number;
  total: number;
}

interface UseLazyPaginationProps<TNode> {
  connector: (pageNum: number) => Promise<ConnectorResult<TNode>>;
  key: string;
}

function useLazyPagination<TNode>({
  connector,
  key,
}: UseLazyPaginationProps<TNode>): UseLazyPaginationResult<TNode> {
  const {
    data: responseData,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery(
    [key],
    ({ pageParam = 1 }) => connector(pageParam),
    {
      refetchOnWindowFocus: false,
      getNextPageParam: (lastPage) => (lastPage.hasNextPage ? lastPage.pageNum + 1 : undefined),
    },
  );

  const { pages } = responseData || {};

  const list = useMemo(() => (pages || []).reduce((acc, { list }) => [...acc, ...(list || [])], [] as TNode[]), [pages]);

  return {
    isFetchingNextPage,
    data: list,
    total: pages?.length ? pages[pages.length - 1].total : 0,
    fetchNextPage,
    hasNextPage: hasNextPage || false,
  };
}

export default useLazyPagination;
