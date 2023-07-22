import { useSession } from "next-auth/react"
import Image from 'next/image'
import { ButtonHTMLAttributes, DetailedHTMLProps, FormEvent, useEffect, useRef, useState } from "react"
import { api } from "~/utils/api"

export default function NewThread() {

  const session = useSession()
  const [threadInput, setThreadInput] = useState("")
  const textAreaRef = useRef<HTMLTextAreaElement>(null)

  // update input textaread height
  useEffect(() => {
    if (textAreaRef.current != null) {
      console.log("scrollHeight:", textAreaRef.current.scrollHeight)
      textAreaRef.current.style.height = textAreaRef.current.scrollHeight + "px"
    }

  }, [threadInput])


  const createThread = api.thread.create.useMutation({
    onSuccess: newThread => {
      console.log(JSON.stringify(newThread))
      console.log("set input to empty")
      textAreaRef.current!.value = ""
    }
  })

  if (session.status != "authenticated") {
    return
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    createThread.mutate({ content: threadInput })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col px-4 py-2 border-b">
      <div className="flex gap-4">
        <ProfileImg src={session.data.user.image!} />
        <textarea ref={textAreaRef} onChange={(e) => setThreadInput(e.target.value)}
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

type ButtonProps = {
  gray?: boolean
  small?: boolean
  className?: string
} & DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>

function Button({ gray = false, small = false, className = "", ...props }
  : ButtonProps) {
  const sizeClasses = small ? 'px-2 py-1' : 'px-4 py-2 font-bold'
  const corlorClasses = gray
    ? 'bg-gray-400 hover:bg-gray-300'
    : 'bg-blue-500 hover:bg-blue-400'

  return <button className={`rounded-full text-white transition-colors
  duration-200 disabled:cursor-not-allowed disabled:opacity-50
  ${sizeClasses} ${corlorClasses} ${className}`} {...props}></button>
}
