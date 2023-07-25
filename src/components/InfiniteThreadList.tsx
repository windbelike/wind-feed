import Link from "next/link"
import InfiniteScroll from "react-infinite-scroll-component"
import { api } from "~/utils/api"
import ProfileImg from "./ProfileImg"
import { useSession } from "next-auth/react"
import { VscHeartFilled, VscHeart } from "react-icons/vsc"
import IconHoverEffect from "./IconHoverEffect"
import LoadingSpinner from "./LoadingSpinner"

export type ThreadProps = {
  id: string
  content: string
  createdAt: Date
  likeCount: number
  likedByMe: boolean
  user: { id: string, image: string | null, name: string | null }
  parentThreadId?: string
}

export type InfiniteThreadListProps = {
  isLoading: boolean
  isError: boolean
  hasMore: boolean
  fetchNewThreads: () => Promise<unknown>
  threads: ThreadProps[] | undefined
  parentThreadId?: string
}

export default function InfiniteThreadList({
  threads,
  isLoading,
  isError,
  hasMore,
  fetchNewThreads,
  parentThreadId
}: InfiniteThreadListProps) {
  if (isLoading) {
    return <LoadingSpinner />
  }
  if (isError) {
    return <div>Error...</div>
  }
  if (threads == null || threads.length == 0) {
    return <div className="flex justify-center text-xl text-gray-300 mt-4">No Threads</div>
  }

  return <ul>
    <InfiniteScroll
      dataLength={threads.length}
      next={fetchNewThreads}
      hasMore={hasMore}
      loader={"loading..."}
    >
      {threads.map(thread => {
        return <ThreadCard key={thread.id} {...thread} />;
      })}
    </InfiniteScroll>
  </ul>
}

export const dateTimeFormatter = new Intl.DateTimeFormat(undefined, { dateStyle: "short" })

function ThreadCard({
  id,
  content,
  user,
  createdAt,
  likedByMe,
  likeCount,
  parentThreadId
}
  : ThreadProps) {
  const trpcUtils = api.useContext();
  const toggleLike = api.thread.toggleLike.useMutation({
    onSuccess: async (data) => {
      // mutate the updated liked thread data in cache 
      const updateDataFn: Parameters<
        typeof trpcUtils.thread.infiniteFeed.setInfiniteData
      >[1] = (oldData) => {
        console.log("oldData:", oldData)
        if (oldData == null) {
          return
        }
        const countModifier = data.addedLike ? 1 : -1;

        return {
          ...oldData,
          pages: oldData.pages.map(page => {
            return {
              ...page,
              threads:
                page.threads.map(thread => {
                  if (thread.id == id) {
                    return {
                      ...thread,
                      likeCount: thread.likeCount + countModifier,
                      likedByMe: data.addedLike
                    }
                  }

                  return thread
                })
            }
          })
        }
      }

      // update home page recent feed
      trpcUtils.thread.infiniteFeed.setInfiniteData({}, updateDataFn);
      // update home page following feed
      trpcUtils.thread.infiniteFeed.setInfiniteData(
        { onlyFollowing: true },
        updateDataFn
      );
      // update profile feed
      trpcUtils.thread.infiniteProfileFeed.setInfiniteData(
        { userId: user.id },
        updateDataFn
      );
      // console.log("update reply feed")
      // update thread detail reply feed
      if (parentThreadId == null) {
        return
      }
      trpcUtils.thread.infiniteReplyFeed.setInfiniteData(
        { threadId: parentThreadId },
        updateDataFn
      )
    }
  })
  function handleToggleLike() {
    toggleLike.mutate({ id })
  }

  // todo click the blank, jump to thread detail
  return (
    <li className="flex gap-4 border-b px-4 py-2 hover:bg-gray-100
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
  )
}

type HeartButtonProps = {
  isLoading: boolean
  onClick: () => void
  likedByMe: boolean
  likeCount: number
}

export function HeartButton({ likedByMe, likeCount, onClick, isLoading }: HeartButtonProps) {
  const session = useSession()
  const HeartIcon = likedByMe ? VscHeartFilled : VscHeart

  if (session.status != "authenticated") {
    return (
      <div className="my-1 flex items-center gap-3 self-start">
        <HeartIcon />
        <span>{likeCount}</span>
      </div>
    )
  }

  return (
    <>
      <button onClick={onClick} disabled={isLoading} className={`group -ml-2 flex gap-1 items-center self-start
      transition-colors duration-200 ${likedByMe
          ? 'text-red-500'
          : 'text-gray-500 hover:text-red-500 focus-visible:text-red-500'
        }
    `}>
        <IconHoverEffect red>
          <HeartIcon className="" />
        </IconHoverEffect>
        <span>{likeCount}</span>
      </button>
    </>
  )
}
