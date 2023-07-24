import { useRouter } from "next/router"
import { api } from "~/utils/api"

export default function() {
  const router = useRouter()
  let threadId = router.query.id
  if (threadId == null) {
    return <div className="flex justify-center font-bold text-2xl">
    No such thread</div>
  }
  if (typeof threadId != "string"){
    return
  }

  const {data, isLoading, isError} = api.thread.threadDetail.useQuery({ threadId })
  console.log("thread detail:", JSON.stringify(data))

  return (
    <>
      thread detail:{router.query.id}
      - {JSON.stringify(data)}
    </>
  )
}
