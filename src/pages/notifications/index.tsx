import { api } from "~/utils/api"

export default function Notifications() {
  const {data} = api.notification.getNotifications.useQuery()
  console.log(JSON.stringify(data))
  return (
    <div>Notificatinos landing page</div>
  )
}
