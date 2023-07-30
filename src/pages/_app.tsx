import { type Session } from "next-auth";
import { SessionProvider  } from "next-auth/react";
import { type AppType } from "next/app";
import { api } from "~/utils/api";
import "~/styles/globals.css";
import Head from "next/head";
import SideBar from "~/components/SideBar";
import { Toaster } from "react-hot-toast";

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
      <div className="container flex justify-center">
        <SideBar />
        <div className="max-w-2xl min-h-screen border-x flex-grow ">
          <Component {...pageProps} />
          <Toaster />
        </div>
      </div>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
