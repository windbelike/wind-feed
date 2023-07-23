import Image from "next/image"
import { VscAccount } from "react-icons/vsc"

type ProfileImgProps = {
  className?: string
  src: string | null
}

export default function ProfileImg({ src, className = "" }: ProfileImgProps) {
  return (
    <div className={`rounded-full h-12 w-12 overflow-hidden relative 
    ${className}`}>
      {src == null
        ? <VscAccount className="w-full h-full" />
        : <Image src={src} quality={100} alt="Profile Image" fill />}
    </div>
  )

}
