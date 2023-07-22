import Image from "next/image"

type ProfileImgProps = {
  className?: string
  src: string | null
}

export default function ProfileImg({ src, className = "" }: ProfileImgProps) {
  return (
    <div className="rounded-full h-12 w-12 overflow-hidden relative">
      {src != null && <Image src={src} quality={100} alt="Profile Image" fill />}
    </div>
  )

}
