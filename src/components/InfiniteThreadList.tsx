import Link from "next/link"
import InfiniteScroll from "react-infinite-scroll-component"
import { api } from "~/utils/api"
import ProfileImg from "./ProfileImg"
import { useSession } from "next-auth/react"
import { VscHeartFilled, VscHeart, VscComment, VscEllipsis } from "react-icons/vsc"
import IconHoverEffect from "./IconHoverEffect"
import LoadingSpinner from "./LoadingSpinner"
import { useRouter } from "next/router"
import ThreadMenu from "./ThreadMenu"
import { useState } from "react"
import { toast } from "react-hot-toast"

export type ThreadProps = {
  id: string
  content: string
  createdAt: Date
  likeCount: number
  replyCount: number
  likedByMe: boolean
  user: { id: string, image: string | null, name: string | null }
  parentThreadId?: string
  childThreadId?: string
  hasParent?: boolean
}

export type InfiniteThreadListProps = {
  isLoading: boolean
  isError: boolean
  hasMore: boolean
  fetchNewThreads: () => Promise<unknown>
  threads: ThreadProps[] | undefined
  parentThreadId?: string // for reply feed
  childThreadId?: string // for parent feed
}

export default function InfiniteThreadList({
  threads,
  isLoading,
  isError,
  hasMore,
  fetchNewThreads,
  parentThreadId,
  childThreadId
}: InfiniteThreadListProps) {
  if (isLoading) {
    return <LoadingSpinner />
  }
  if (isError) {
    return <div>Error...</div>
  }
  if (threads == null || threads.length == 0) {
    // return <div className="flex justify-center text-xl text-gray-300 mt-4">No Threads</div>
    return
  }

  if (childThreadId != null) {
    // inversed parent feed
    return <ul>
      <InfiniteScroll
        dataLength={threads.length}
        next={fetchNewThreads}
        hasMore={hasMore}
        loader={"loading..."}
        inverse={true}
        style={{ display: "flex", flexDirection: "column-reverse" }}
      >
        {threads.map(thread => {
          return <ThreadCard key={thread.id} {...thread} childThreadId={childThreadId} />;
        })}
      </InfiniteScroll>
    </ul>
  }

  // home feed or reply feed
  return <ul>
    <InfiniteScroll
      dataLength={threads.length}
      next={fetchNewThreads}
      hasMore={hasMore}
      loader={"loading..."}
    >
      {threads.map(thread => {
        return <ThreadCard key={thread.id} {...thread} parentThreadId={parentThreadId} />;
      })}
    </InfiniteScroll>
  </ul>
}

export const dateTimeFormatter = new Intl.DateTimeFormat(undefined, { dateStyle: "full" })
const formatter = new Intl.RelativeTimeFormat(undefined, {
  numeric: "auto",
})

const DIVISIONS = [
  { amount: 60, name: "seconds" },
  { amount: 60, name: "minutes" },
  { amount: 24, name: "hours" },
  { amount: 7, name: "days" },
  { amount: 4.34524, name: "weeks" },
  { amount: 12, name: "months" },
  { amount: Number.POSITIVE_INFINITY, name: "years" },
]

function formatTimeAgo(date: Date) {
  let duration = (date.getTime() - new Date().getTime()) / 1000

  for (let i = 0; i < DIVISIONS.length; i++) {
    const division = DIVISIONS[i]
    if (division == null) {
      continue
    }
    if (Math.abs(duration) < division.amount) {
      // @ts-ignore
      return formatter.format(Math.round(duration), division.name)
    }
    duration /= division.amount
  }
}

function ThreadCard({
  id,
  content,
  user,
  createdAt,
  likedByMe,
  likeCount,
  replyCount,
  parentThreadId,
  childThreadId
}
  : ThreadProps) {
  const [openMenu, setOpenMenu] = useState(false)
  const trpcUtils = api.useContext();
  const toggleLike = api.thread.toggleLike.useMutation({
    onSuccess: async (data) => {
      toast.success("Liked")
      // mutate the updated liked thread data in cache 
      const updateLikeFn: Parameters<
        typeof trpcUtils.thread.infiniteFeed.setInfiniteData
      >[1] = (oldData) => {
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
      trpcUtils.thread.infiniteFeed.setInfiniteData({}, updateLikeFn);
      // update home page following feed
      trpcUtils.thread.infiniteFeed.setInfiniteData(
        { onlyFollowing: true },
        updateLikeFn
      );
      // update profile feed
      trpcUtils.thread.infiniteProfileFeed.setInfiniteData(
        { userId: user.id },
        updateLikeFn
      );
      // update thread detail reply feed
      if (parentThreadId != null) {
        trpcUtils.thread.infiniteReplyFeed.setInfiniteData(
          { threadId: parentThreadId },
          updateLikeFn
        )
      }

      // update parent feed's like
      if (childThreadId != null) {
        trpcUtils.thread.infiniteParentFeed.setInfiniteData(
          { threadId: childThreadId },
          (oldData) => {
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
        )
      }
    }
  })
  function handleToggleLike() {
    toggleLike.mutate({ id })
  }

  const router = useRouter()
  function handleClickThread(e: any) {
    // console.log(e.target.id)
    if (e.target.id != "threadCardId") {
      return
    }
    router.push(`/thread/${id}`)
  }

  function onClickMenu(e: React.MouseEvent<HTMLElement>) {
    setOpenMenu(!openMenu)
  }

  // todo click the blank, jump to thread detail
  return (
    <li id="threadCardId" onClick={handleClickThread} className={`flex gap-4
    ${childThreadId == null ? 'border-b' : ''} px-4 pt-2 hover:bg-gray-100
        focus-visible:bg-gray-200 cursor-pointer
        duration-200`}>
      <div className="flex flex-col items-center">
        <Link href={`/profile/${user.id}`}>
          <ProfileImg src={user.image} />
        </Link>
        {childThreadId && <p className="text-2xl text-gray-400">|</p>}
      </div>
      <div className="flex-grow">
        <div className="flex flex-grow gap-2 ">
          <Link href={`/profile/${user.id}`} className="
            font-bold outline-none hover:underline focus-visible:underline
          ">{user.name}</Link>
          <span className="text-gray-500">-</span>
          <span className="text-gray-500">{formatTimeAgo(createdAt)}</span>
          <div onClick={onClickMenu} className="relative ml-auto select-none" >
            <IconHoverEffect>
              <VscEllipsis className="w-6 h-6" />
            </IconHoverEffect>
            {openMenu && <ThreadMenu id={id} user={user} />}
          </div>
        </div>
        <Link href={`/thread/${id}`}>
          <p className="whitespace-pre-wrap">
            {content}
          </p>
        </Link>
        <div className="flex justify-start gap-6">
          <HeartButton onClick={handleToggleLike}
            isLoading={toggleLike.isLoading} likedByMe={likedByMe} likeCount={likeCount} />
          <ReplyButton onClick={() => null} replyCount={replyCount} />
        </div>
      </div>
    </li>
  )
}

type HeartButtonProps = {
  isLoading: boolean
  onClick: () => void
  likedByMe: boolean
  likeCount: number
  className?: string
}

type ReplyButtonProps = {
  onClick: () => void
  replyCount: number
  className?: string
}

export function ReplyButton({ className, onClick, replyCount }:
  ReplyButtonProps) {
  const session = useSession()

  if (session.status != "authenticated") {
    return (
      <div className="my-1 flex items-center gap-3 self-start">
        <VscComment className={`${className}`} />
        <span>{replyCount}</span>
      </div>
    )
  }

  return (
    <>
      <button onClick={onClick} className={`text-gray-500 group -ml-2 flex gap-1 items-center self-start
      transition-colors duration-200 }
    `}>
        <IconHoverEffect>
          <VscComment className={`${className}`} />
        </IconHoverEffect>
        <span>{replyCount}</span>
      </button>
    </>
  )
}

export function HeartButton({ className, likedByMe, likeCount, onClick, isLoading }: HeartButtonProps) {
  const session = useSession()
  const HeartIcon = likedByMe ? VscHeartFilled : VscHeart

  if (session.status != "authenticated") {
    return (
      <div className="my-1 flex items-center gap-3 self-start">
        <HeartIcon className={`${className}`} />
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
          <HeartIcon className={`${className}`} />
        </IconHoverEffect>
        <span>{likeCount}</span>
      </button>
    </>
  )
}
