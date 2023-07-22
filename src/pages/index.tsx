import { useSession } from "next-auth/react"
import Image from 'next/image'

export default function Home() {
  return (
    <>
      <header className="sticky top-0 border-b pt-2">
        <h1 className="mb-2 px-4 font-bold text-lg ">
          Home
        </h1>
      </header>

      <NewThread />

    </>
  )
}

function NewThread() {

  const session = useSession()

  if (session.status != "authenticated") {
    return
  }

  return (
    <div className="flex flex-col px-4 py-2 border-b">
      <div className="flex gap-4 h-40">
        <ProfileImg src={session.data.user.image!}/>
        <textarea className="flex-grow bg-gray-50 outline-none resize-none
      overflow-hidden text-lg p-4
      " placeholder="What's happening?" />
      </div>
      <Button className="self-end my-2">New Thread</Button>
    </div>
  )
}

type ProfileImgProps = {
  className?: string
  src?: string
}

function ProfileImg({ src, className = "" }: ProfileImgProps) {
  console.log("img:", src)

  return (
    <div className="rounded-full h-12 w-12 overflow-hidden relative">
      {src != null && <Image src={src} quality={100} alt="Profile Image" fill />}
    </div>
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
