import Link from "next/link"
import InfiniteScroll from "react-infinite-scroll-component"
import { api } from "~/utils/api"
import ProfileImg from "./ProfileImg"

export default function RecentThreads() {
  const threads = api.thread.infiniteThread.useInfiniteQuery(
    {},
    { getNextPageParam: (lastPage) => lastPage.nextCursor }
  )
  // console.log("Recent threads:", JSON.stringify(threads))
  let hasMore: boolean = false
  if (threads.hasNextPage) {
    hasMore = true
  }

  return <InfiniteThreadList
    threads={threads.data?.pages.flatMap(page => page.threads)}
    isError={threads.isError}
    isLoading={threads.isLoading}
    hasMore={hasMore}
    fetchNewThreads={threads.fetchNextPage}
  />
}

type Thread = {
  id: string
  content: string
  createdAt: Date
  likeCount: number
  likedByMe: boolean
  user: { id: string, image: string | null, name: string | null }
}

type InfiniteThreadListProps = {
  isLoading: boolean
  isError: boolean
  hasMore: boolean
  fetchNewThreads: () => Promise<unknown>
  threads: Thread[] | undefined
}

function InfiniteThreadList({
  threads,
  isLoading,
  isError,
  hasMore,
  fetchNewThreads,
}: InfiniteThreadListProps) {
  if (isLoading) {
    return <div>Loading...</div>
  }
  if (isError) {
    return <div>Error...</div>
  }
  if (threads == null || threads.length == 0) {
    return <div>No threads</div>
  }

  return <ul>
    <InfiniteScroll
      dataLength={threads.length}
      next={fetchNewThreads}
      hasMore={hasMore}
      loader={"loading..."}
    >
      {threads.map(thread => {
        return <ThreadCard key={thread.id} {...thread}/>;
      })}
    </InfiniteScroll>
  </ul>
}

function ThreadCard({
  id,
  content,
  user,
  createdAt,
  likedByMe }
  : Thread) {
  return (
    <li className="flex gap-4 border-b px-4 py-4">
    <Link href="/">
    <ProfileImg src={user.image}/>
    </Link>
      <div>
        {content}
      </div>
    </li>
  )
}
