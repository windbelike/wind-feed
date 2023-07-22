import { SessionProvider, useSession } from "next-auth/react";

export default function() {
  const session = useSession()

  return (
    <>
    user: {session.data != null && session.data.user.name}
    </>

  )
}
