import { read } from "fs"
import Link from "next/link"
import { useRouter } from "next/router"
import { VscArrowLeft } from "react-icons/vsc"
import IconHoverEffect from "~/components/IconHoverEffect"
import InfiniteThreadList, { HeartButton, ThreadProps, dateTimeFormatter } from "~/components/InfiniteThreadList"
import LoadingSpinner from "~/components/LoadingSpinner"
import NewThreadForm from "~/components/NewThreadForm"
import ProfileImg from "~/components/ProfileImg"
import { api } from "~/utils/api"

export default function() {
  const router = useRouter()
  let threadId = router.query.id as string
  let ready = router.isReady
  const { data, isLoading, isError } = api.thread.threadDetail.useQuery(
    { threadId }, { enabled: ready }
  )

  const infiniteReplyThreads = api.thread.infiniteReplyFeed.useInfiniteQuery(
    { threadId: threadId },
    { getNextPageParam: (lastPage) => lastPage.nextCursor, enabled: ready },
  )

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

  // console.log("thread detail:", JSON.stringify(data))

  return (
    <>
      <header className="sticky top-0 flex items-center border-b bg-white z-10
      px-4 py-2">
        <Link href=".." className="mr-2">
          <IconHoverEffect>
            <VscArrowLeft className="w-6 h-6" />
          </IconHoverEffect>
        </Link>
        <h1 className="px-2 font-bold text-lg ">
          Thread
        </h1>
      </header>
      <main>
        {data && <SingleThreadCard {...data.thread} />}
        <NewThreadForm replyThreadId={threadId} isReply={true} />
        <InfiniteThreadList
          threads={infiniteReplyThreads.data?.pages.flatMap(page => page.threads)}
          isError={infiniteReplyThreads.isError}
          isLoading={infiniteReplyThreads.isLoading}
          hasMore={infiniteReplyThreads.hasNextPage || false}
          fetchNewThreads={infiniteReplyThreads.fetchNextPage}
          parentThreadId={threadId}
        />
      </main>
    </>
  )
}

function SingleThreadCard({
  id,
  content,
  user,
  createdAt,
  likedByMe,
  likeCount
}: ThreadProps) {


  const trpcUtils = api.useContext();
  const toggleLike = api.thread.toggleLike.useMutation({
    onSuccess: async data => {
      trpcUtils.thread.threadDetail.invalidate()
    }
  })

  function handleToggleLike() {
    toggleLike.mutate({ id })
  }

  return <li className="flex gap-4 border-b px-4 py-2 hover:bg-gray-100
        focus-visible:bg-gray-200 cursor-pointer
        duration-200
        ">
    <Link href={`/profile/${user.id}`}>
      <ProfileImg src={user.image} />
    </Link>
    <div>
      <div className="flex flex-grow gap-2 ">
        <Link href={`/profile/${user.id}`} className="
            font-bold outline-none hover:underline focus-visible:underline
          ">{user.name}</Link>
        <span className="text-gray-500">-</span>
        <span className="text-gray-500">{dateTimeFormatter.format(createdAt)}</span>
      </div>
      <Link href={`/thread/${id}`}>
        <p className="whitespace-pre-wrap">
          {content}
        </p>
      </Link>
      <HeartButton onClick={handleToggleLike} isLoading={toggleLike.isLoading} likedByMe={likedByMe} likeCount={likeCount} />
    </div>
  </li>
}
