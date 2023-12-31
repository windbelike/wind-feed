import { useSession } from "next-auth/react";
import { useState } from "react";
import InfiniteThreadList from "~/components/InfiniteThreadList";
import NewThreadForm from "~/components/NewThreadForm";
import { api } from "~/utils/api";

const tabList = ['Recent', 'Following']

export default function Home() {
  const [currTab, setCurrTab] = useState('Recent')
  const session = useSession()

  return (
    <>
      <header className="z-10 bg-white/50 backdrop-blur-lg sticky
    top-0 border-b">
        <h1 className="p-4 font-bold text-lg ">
          Home
        </h1>
        {session.status == "authenticated" &&
          <div className="flex ">
            {tabList.map(t => {
              return <button onClick={() => setCurrTab(t)} key={t}
                className={`flex-grow p-2
            hover:bg-gray-200 focus-visible:bg-gray-200
            ${currTab == t
                    ? 'border-b-4 border-blue-500 font-bold'
                    : ''
                  } 
            `}>{t}</button>
            })}
          </div>
        }
      </header>
      <main>
        <NewThreadForm />
        {currTab == "Recent" ? <RecentThreads /> : <FollowingThreads />}
      </main>
    </>
  )
}

function FollowingThreads() {
  const threads = api.thread.infiniteFeed.useInfiniteQuery(
    { onlyFollowing: true },
    { getNextPageParam: (lastPage) => lastPage.nextCursor }
  )

  return <InfiniteThreadList
    threads={threads.data?.pages.flatMap(page => page.threads)}
    isError={threads.isError}
    isLoading={threads.isLoading}
    hasMore={threads.hasNextPage || false}
    fetchNewThreads={threads.fetchNextPage}
  />
}

function RecentThreads() {
  const threads = api.thread.infiniteFeed.useInfiniteQuery(
    {},
    { getNextPageParam: (lastPage) => lastPage.nextCursor }
  )

  return <InfiniteThreadList
    threads={threads.data?.pages.flatMap(page => page.threads)}
    isError={threads.isError}
    isLoading={threads.isLoading}
    hasMore={threads.hasNextPage || false}
    fetchNewThreads={threads.fetchNextPage}
  />
}
