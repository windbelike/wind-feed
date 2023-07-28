import Link from "next/link"
import { useRouter } from "next/router"
import { useEffect, useRef } from "react"
import { VscArrowLeft } from "react-icons/vsc"
import IconHoverEffect from "~/components/IconHoverEffect"
import InfiniteThreadList, { HeartButton, ReplyButton, ThreadProps, dateTimeFormatter } from "~/components/InfiniteThreadList"
import LoadingSpinner from "~/components/LoadingSpinner"
import NewThreadForm from "~/components/NewThreadForm"
import ProfileImg from "~/components/ProfileImg"
import { api } from "~/utils/api"

export default function() {
  const router = useRouter()
  let threadId = router.query.id as string
  let ready = router.isReady
  const mainThreadRef = useRef<HTMLDivElement>(null)
  let makeScrollBarCalssName = ''


  const { data, isLoading, isError } = api.thread.threadDetail.useQuery(
    { threadId }, { enabled: ready }
  )

  const infiniteReplyThreads = api.thread.infiniteReplyFeed.useInfiniteQuery(
    { threadId: threadId },
    { getNextPageParam: (lastPage) => lastPage.nextCursor, enabled: ready },
  )

  const infiniteParentFeed = api.thread.infiniteParentFeed.useInfiniteQuery(
    { threadId: threadId },
    { getNextPageParam: (lastPage) => lastPage.nextCursor, enabled: ready },
  )

  useEffect(() => {
    // todo fix this
    // if (infiniteParentFeed.data != null && infiniteParentFeed.data.pages[0]?.threads.length != 0) {
    //   if (mainThreadRef.current != null) {
    //     console.log("scroll to ", mainThreadRef.current?.scrollHeight)
    //     scrollTo(0, mainThreadRef.current.scrollHeight)
    //   }
    // }
  }, [mainThreadRef.current, infiniteParentFeed.data])

  if (threadId == null) {
    return <div className="flex justify-center font-bold text-2xl">
      No such thread</div>
  }

  if (isError) {
    return <div>Error...</div>
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (infiniteParentFeed.data != null && infiniteParentFeed.data.pages[0]?.threads.length != 0) {
    makeScrollBarCalssName = "h-screen"
  }

  return (
    <>
      <header className="sticky top-0 flex items-center border-b bg-white z-10
      px-4 py-2">
        <div onClick={() => router.back()} className="mr-2">
          <IconHoverEffect>
            <VscArrowLeft className="w-6 h-6" />
          </IconHoverEffect>
        </div>
        <h1 className="px-2 font-bold text-lg ">
          Thread
        </h1>
      </header>
      <main >
        <InfiniteThreadList
          threads={infiniteParentFeed.data?.pages.flatMap(page => page.threads)}
          isError={infiniteParentFeed.isError}
          isLoading={infiniteParentFeed.isLoading}
          hasMore={infiniteParentFeed.hasNextPage || false}
          fetchNewThreads={infiniteParentFeed.fetchNextPage}
          childThreadId={threadId}
        />
        <div ref={mainThreadRef} className={makeScrollBarCalssName}>
          <div >
            {data && <ThreadDetailCard {...data.thread} />}
            <NewThreadForm replyThreadId={threadId} isReply={true} />
          </div>
          <InfiniteThreadList
            threads={infiniteReplyThreads.data?.pages.flatMap(page => page.threads)}
            isError={infiniteReplyThreads.isError}
            isLoading={infiniteReplyThreads.isLoading}
            hasMore={infiniteReplyThreads.hasNextPage || false}
            fetchNewThreads={infiniteReplyThreads.fetchNextPage}
            parentThreadId={threadId}
          />
        </div>
      </main>
    </>
  )
}


function ThreadDetailCard({
  id,
  content,
  user,
  createdAt,
  likedByMe,
  likeCount,
  replyCount
}: ThreadProps) {
  const dateTimeFormatter = new Intl.DateTimeFormat(undefined, { dateStyle: "full" })
  const trpcUtils = api.useContext();
  const toggleLike = api.thread.toggleLike.useMutation({
    onSuccess: async data => {
      trpcUtils.thread.threadDetail.invalidate()
    }
  })

  function handleToggleLike() {
    toggleLike.mutate({ id })
  }

  const buttonSizeClasses = 'w-6 h-6'

  return (
    <li className="flex gap-4 px-4 py-2 hover:bg-gray-100
        focus-visible:bg-gray-200 cursor-pointer
        duration-200
        ">
      <Link href={`/profile/${user.id}`}>
        <ProfileImg src={user.image} />
      </Link>
      <div className="flex-grow">
        <div className="flex flex-grow gap-2 ">
          <Link href={`/profile/${user.id}`} className="
            font-bold outline-none hover:underline focus-visible:underline
          ">{user.name}</Link>
        </div>
        <p className="whitespace-pre-wrap">
          {content}
        </p>
        <div className="hover:underline mt-8 text-gray-500">{dateTimeFormatter.format(createdAt)}</div>
        <div className="flex justify-start items-center gap-9 border-b mt-4 border-gray-200 m-2 flex-grow">
          <HeartButton className={buttonSizeClasses} onClick={handleToggleLike}
            isLoading={toggleLike.isLoading}
            likedByMe={likedByMe} likeCount={likeCount} />
          <ReplyButton className={buttonSizeClasses} onClick={() => null} replyCount={replyCount} />
        </div>
      </div>
    </li>
  )
}
