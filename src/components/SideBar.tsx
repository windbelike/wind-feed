import { signIn, signOut, useSession } from "next-auth/react"
import Link from "next/link"

export default function SideBar() {
  const session = useSession()
  const user = session.data?.user

  return (
    <nav className="px-3 py-6">
    
      <ul className="sticky top-0 flex flex-col gap-2">
        <li>
          <Link href="/">
            Home
          </Link>
        </li>
        {user != null &&
          <li>
            <Link href={`/profile/${user.id}`}>
              Profile
            </Link>
          </li>
        }

        {user == null ?
          <li>
            <button onClick={() => { void signIn() }}>Sign In</button>
          </li>
          :
          <li>
            <button onClick={() => { void signOut() }}>Sign Out</button>
          </li>
        }
      </ul>
    </nav>
  )
}
