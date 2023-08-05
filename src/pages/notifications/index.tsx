import { api } from "~/utils/api"

export default function Notifications() {
  const { data } = api.notification.getNotifications.useQuery()
  console.log(JSON.stringify(data))
  return (
    <>
      <header className="z-10 bg-white sticky top-0 border-b pt-2">
        <h1 className="mb-2 px-4 font-bold text-lg ">
          Notifications
        </h1>
      </header>
      <main>
        {data && data.map(d => {
          return <div className="p-6 text-xl border-b-gray-200 border-b">{d.body}</div>
        })}
      </main>
    </>
  )
}
