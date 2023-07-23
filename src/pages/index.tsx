import InfiniteThreadList from "~/components/InfiniteThreadList";
import NewThreadForm from "~/components/NewThreadForm";
import { api } from "~/utils/api";

export default function Home() {
  return (
    <>
      <header className="z-10 bg-white sticky top-0 border-b pt-2">
        <h1 className="mb-2 px-4 font-bold text-lg ">
          Home
        </h1>
      </header>

      <NewThreadForm />
      <RecentThreads />
    </>
  )
}

function RecentThreads() {
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
