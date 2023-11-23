import {
  useMemo,
} from 'react';
import { useInfiniteQuery } from 'react-query';

export type UseLazyPaginationResult<TNode> = {
  data: TNode[];
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  total: number;
  hasNextPage: boolean;
}

export interface ConnectorResult<TNode> {
  list: TNode[];
  total: number;
  hasNextPage: boolean;
  timestamp: number | null;
}

export interface ConnectorProps {
  timestamp: number;
}

interface UseLazyPaginationProps<TNode> {
  connector: (props: ConnectorProps) => Promise<ConnectorResult<TNode>>;
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
    ({ pageParam }) => connector(pageParam),
    {
      refetchOnWindowFocus: false,
      getNextPageParam: (lastPage) => (lastPage.hasNextPage ? { timestamp: lastPage.timestamp } : undefined),
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
