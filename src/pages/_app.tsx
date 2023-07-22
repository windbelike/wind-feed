import { type Session } from "next-auth";
import { SessionProvider, signIn, signOut, useSession } from "next-auth/react";
import { type AppType } from "next/app";
import { api } from "~/utils/api";
import "~/styles/globals.css";
import Head from "next/head";
import Link from "next/link";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <Head>
        <title>
          Wind Thread
        </title>
      </Head>
      <div className="container flex">
        <SideBar />
        <div className="min-h-screen border-x flex-grow ">
          <Component {...pageProps} />
        </div>
      </div>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);

function SideBar() {
  const session = useSession()
  const user = session.data?.user

  return (
    <nav className="px-3 py-6">
      <ul className="flex flex-col gap-2">
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
