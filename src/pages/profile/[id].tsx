import { useRouter } from "next/router";

export default function() {
  const router = useRouter()

  return (
    <div>
      Profile of uid: {router.query.id}
    </div>
  )
}
