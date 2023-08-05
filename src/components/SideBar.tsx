import { signIn, signOut, useSession } from "next-auth/react"
import Link from "next/link"
import IconHoverEffect from "./IconHoverEffect"
import { VscAccount, VscBell, VscBellDot, VscHome, VscSignIn, VscSignOut } from "react-icons/vsc"
import { api } from "~/utils/api"

export default function SideBar() {
  const session = useSession()
  const user = session.data?.user
  const { data } = api.notification.hasNotification.useQuery()
  const NotifyIcon = data?.hasNotification ? VscBellDot : VscBell

  return (
    <nav className="px-1 py-6">
      <ul className="sticky top-0 flex flex-col gap-2">
        <li>
          <Link href="/">
            <IconHoverEffect>
              <div className="flex items-center gap-3">
                <VscHome className="h-8 w-8" />
                <span className="hidden text-lg md:inline">Home</span>
              </div>
            </IconHoverEffect>
          </Link>
        </li>
        {user != null &&
          <li>
            <Link href={`/profile/${user.id}`}>
              <IconHoverEffect>
                <div className="flex items-center gap-3">
                  <VscAccount className="h-8 w-8" />
                  <span className="hidden text-lg md:inline">Profile</span>
                </div>
              </IconHoverEffect>
            </Link>
          </li>
        }

        {user != null &&
          <li>
            <Link href={`/notifications`}>
              <IconHoverEffect>
                <div className="flex items-center gap-3">
                  <NotifyIcon className="h-8 w-8" />
                  <span className="hidden text-lg md:inline">Notifications</span>
                </div>
              </IconHoverEffect>
            </Link>
          </li>
        }

        {user == null ?
          <li>
            <button onClick={() => { void signIn() }}>
              <IconHoverEffect>
                <div className="flex items-center gap-3">
                  <VscSignIn className="h-8 w-8 text-green-700" />
                  <span className="hidden text-lg md:inline">Sign In</span>
                </div>
              </IconHoverEffect>
            </button>
          </li>
          :
          <li>
            <button onClick={() => { void signOut() }}>
              <IconHoverEffect>
                <div className="flex items-center gap-3">
                  <VscSignOut className="h-8 w-8 text-red-700" />
                  <span className="hidden text-lg md:inline">Sign Out</span>
                </div>
              </IconHoverEffect>
            </button>
          </li>
        }
      </ul>
    </nav>
  )
}
