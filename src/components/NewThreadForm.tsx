import { useSession } from "next-auth/react"
import { FormEvent, useEffect, useRef, useState } from "react"
import { api } from "~/utils/api"
import ProfileImg from "./ProfileImg"
import { Button } from "./Button"

export default function NewThread() {

  const session = useSession()
  const [threadInput, setThreadInput] = useState("")
  const textAreaRef = useRef<HTMLTextAreaElement>(null)

  // update input textaread height
  useEffect(() => {
    if (textAreaRef.current != null) {
      const textArea = textAreaRef.current
      // set the minimun scrollHeight
      textArea.style.height = "10rem";
      textArea.style.height = textArea.scrollHeight + "px"
    }

  }, [threadInput])


  const trpcUtils = api.useContext()
  const createThread = api.thread.create.useMutation({
    onSuccess: newThread => {
      setThreadInput("")

      if (session.data == null) {
        return
      }

      // insert the thread just sent at the very first begining of all threads in cache
      trpcUtils.thread.infiniteFeed.setInfiniteData({}, oldData => {
        if (oldData == null || oldData.pages[0] == null) { return }

        const thread2Insert = {
          ...newThread,
          likeCount: 0,
          likedByMe: false,
          user: {
            id: session.data.user.id,
            name: session.data.user.name || null,
            image: session.data.user.image || null,
          }
        }
        console.log("thread2Insert:", JSON.stringify(thread2Insert))
        console.log("page0[0]", JSON.stringify(oldData.pages[0].threads[0]))

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

  if (session.status != "authenticated") {
    return
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (threadInput == "") {
      return
    }
    createThread.mutate({ content: threadInput })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col px-4 py-2 border-b">
      <div className="flex gap-4">
        <ProfileImg src={session.data.user.image!} />
        <textarea value={threadInput} ref={textAreaRef} onChange={(e) => setThreadInput(e.target.value)}
          className="flex-grow bg-gray-50 outline-none resize-none
          rounded-lg h-40
          max-h-96 overflow-y-auto
      overflow-hidden text-lg p-4
      " placeholder="What's happening?" />
      </div>
      <Button className="self-end my-2">New Thread</Button>
    </form>
  )
}
