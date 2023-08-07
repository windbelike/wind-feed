import { VscSparkle } from "react-icons/vsc";
import { api } from "~/utils/api"

export default function Notifications() {
  const { data } = api.notification.getNotifications.useQuery()
  const trpcUtils = api.useContext();
  if (data) {
    trpcUtils.notification.hasNotification.invalidate()
  }

  return (
    <>
      <header className="z-10 bg-white sticky top-0 border-b pt-2">
        <h1 className="mb-2 px-4 font-bold text-lg ">
          Notifications
        </h1>
      </header>
      <main>
        {data && data.map(d => {
          return <NoteCard key={d.id} className="" body={d.body} />
        })}
      </main>
    </>
  )
}

type NoteCardProps = {
  body: string
  className?: string
} & React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

function NoteCard({ body = "", className = "", ...props }: NoteCardProps) {
  const baseClass = "p-6 text-xl border-b-gray-200 border-b"
  return (
    <div className={`${baseClass} ${className}`} {...props}>
      <VscSparkle className="w-4 h-4"/>
      <span>{body}</span>
    </div>
  )
}
