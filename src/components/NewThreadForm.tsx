import { useSession } from "next-auth/react"
import { FormEvent, useEffect, useRef, useState } from "react"
import { api } from "~/utils/api"
import ProfileImg from "./ProfileImg"
import { Button } from "./Button"
import { toast } from "react-hot-toast"

export type NewThreadFormProps = {
  isReply?: boolean
  replyThreadId?: string
}

export default function NewThreadForm({ isReply = false, replyThreadId }: NewThreadFormProps) {

  const session = useSession()
  const [threadInput, setThreadInput] = useState("")
  const textAreaRef = useRef<HTMLTextAreaElement>(null)

  // update input textaread height
  useEffect(() => {
    if (textAreaRef.current != null) {
      const textArea = textAreaRef.current
      // set the minimun scrollHeight
      textArea.style.height = "6rem";
      textArea.style.height = textArea.scrollHeight + "px"
    }
  }, [threadInput])

  // reply thread
  const replyThread = api.thread.replyThread.useMutation({
    onSuccess: newReply => {
      toast.success("Reply Created")
      setThreadInput("")

      if (session.data == null) {
        return
      }

      if (newReply == null) {
        return
      }

      trpcUtils.thread.infiniteReplyFeed.setInfiniteData({ threadId: replyThreadId! }, (oldData) => {
        if (oldData == null || oldData.pages[0] == null) {
          return
        }
        const thread2Insert = {
          ...newReply,
          likeCount: 0,
          likedByMe: false,
          replyCount: 0,
          user: {
            id: session.data.user.id,
            name: session.data.user.name || null,
            image: session.data.user.image || null,
          }
        }
        // console.log("thread2Insert:", JSON.stringify(thread2Insert))
        // console.log("page0[0]", JSON.stringify(oldData.pages[0].threads[0]))

        return {
          ...oldData,
          pages: [
            {
              ...oldData.pages[0],
              threads: [thread2Insert, ...oldData.pages[0]!.threads],
            },
            ...oldData.pages.slice(1)
          ]
        }
      })
    }
  })

  // new thread
  const trpcUtils = api.useContext()
  const createThread = api.thread.create.useMutation({
    onSuccess: newThread => {
      toast.success("Thread Created")
      setThreadInput("")

      if (session.data == null) {
        return
      }

      const updateDataFn: Parameters<
        typeof trpcUtils.thread.infiniteFeed.setInfiniteData
      >[1] = (oldData) => {
        if (oldData == null || oldData.pages[0] == null) {
          return
        }
        const thread2Insert = {
          ...newThread,
          likeCount: 0,
          replyCount: 0,
          likedByMe: false,
          user: {
            id: session.data.user.id,
            name: session.data.user.name || null,
            image: session.data.user.image || null,
          }
        }
        // console.log("thread2Insert:", JSON.stringify(thread2Insert))
        // console.log("page0[0]", JSON.stringify(oldData.pages[0].threads[0]))

        return {
          ...oldData,
          pages: [
            {
              ...oldData.pages[0],
              threads: [thread2Insert, ...oldData.pages[0]!.threads],
            },
            ...oldData.pages.slice(1)
          ]
        }

      }

      // insert the thread just sent at the very first begining of all threads in cache
      // update home feed
      trpcUtils.thread.infiniteFeed.setInfiniteData({}, updateDataFn)
    }
  })

  if (session.status != "authenticated") {
    return
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (threadInput == null || threadInput.trim() == "") {
      return
    }
    if (isReply) {
      replyThread.mutate({ content: threadInput, threadId: replyThreadId! })
    } else {
      createThread.mutate({ content: threadInput })
    }
  }

  const placeholderTxt = isReply ? "Send your reply ~" : "What's happening?"
  const maxContentLen = 180
  const currentContentLen = threadInput.length
  const contentLenValid = currentContentLen <= maxContentLen
  const contentLenColor = contentLenValid ? "text-gray-700" : "text-red-500"
  const buttonDisabled = replyThread.isLoading
    || createThread.isLoading
    || !contentLenValid

  return (
    <form onSubmit={handleSubmit} className="flex flex-col px-4 py-2 border-b">
      <div className="flex gap-4">
        <ProfileImg src={session.data.user.image!} />
        <textarea value={threadInput} ref={textAreaRef} onChange={(e) => setThreadInput(e.target.value)}
          className="flex-grow bg-gray-50 outline-none resize-none
          rounded-lg h-24
          max-h-96 overflow-y-auto
       text-lg p-4
      " placeholder={placeholderTxt} />
      </div>
      <div className="self-end my-2">
        <span className={`mx-4 ${contentLenColor} select-none`}>{currentContentLen} / {maxContentLen}</span>
        <Button disabled={buttonDisabled} className="">{isReply ? "Reply" : "Send"}</Button>
      </div>
    </form>
  )
}
