import type { GetStaticPaths, GetStaticPropsContext, InferGetServerSidePropsType } from "next";
import { useRouter } from "next/router";
import { ssgHelper } from "~/server/api/ssgHelper";
import { api } from "~/utils/api";
import ErrorPage from "next/error";
import Head from "next/head";
import IconHoverEffect from "~/components/IconHoverEffect";
import { VscArrowLeft } from "react-icons/vsc";
import Link from "next/link";
import ProfileImg from "~/components/ProfileImg";
import InfiniteThreadList from "~/components/InfiniteThreadList";
import { useSession } from "next-auth/react";
import { Button } from "~/components/Button";
import { router } from "@trpc/server";
import { toast } from "react-hot-toast";

export default function(props: InferGetServerSidePropsType<typeof getStaticProps>) {
  const { id } = props
  const router = useRouter()

  // todo invalidate ssg
  // use second param to not fetch again, use the ssg data only
  // const { data } = api.profile.getById.useQuery({ id }, { refetchOnMount: false, refetchOnWindowFocus: false });
  const { data } = api.profile.getById.useQuery({ id })
  const profileThreads = api.thread.infiniteProfileFeed.useInfiniteQuery({ userId: id }, {
    getNextPageParam: (lastPage) => lastPage.nextCursor
  })
  const trpcUtils = api.useContext()
  const toggleFollow = api.profile.toggleFollow.useMutation({
    onSuccess: ({ addedFollow }) => {
      toast.success(addedFollow ? "Followed" : "Unfollowed")
      trpcUtils.profile.getById.setData({ id }, (oldData) => {
        if (oldData == null) return;

        const countModifier = addedFollow ? 1 : -1;
        return {
          ...oldData,
          isFollowing: addedFollow,
          followersCount: oldData.followersCount + countModifier,
        };
      });
    },
  });

  if (data == null || data.name == null) {
    return <ErrorPage statusCode={404} />;
  }

  return (
    <>
      <Head>
        <title>{`Wind Thread - ${data.name}`}</title>
      </Head>
      <header className="sticky top-0 flex flex-col items-start border-b bg-white
      z-10 px-4 py-2 bg-white/50 backdrop-blur-lg">
        <div className="flex items-center w-full">
        <div onClick={() => router.back()} className="mr-2 hover:cursor-pointer">
            <IconHoverEffect>
              <VscArrowLeft className="w-6 h-6" />
            </IconHoverEffect>
          </div>
          <ProfileImg src={data.image} className="flex-shrink-0" />
          <div className="ml-2 ">
            <h1 className="font-bold text-lg">{data.name}</h1>
          </div>
          <div className="ml-auto ">
            <FollowButton
              userId={id}
              isFollowing={data.isFollowing}
              onClick={() => toggleFollow.mutate({ userId: id })}
              isLoading={toggleFollow.isLoading} />
          </div>
        </div>
        <div className="text-gray-500 text-sm flex gap-3 mt-5">
          <span className="hover:cursor-pointer hover:underline focus-visible:underline">
            <span className="font-bold text-black">{data.threadsCount} </span>
            Threads
          </span>
          <span className="hover:cursor-pointer hover:underline focus-visible:underline">
            <span className="font-bold text-black">{data.followsCount} </span>
            Following</span>
          <span className="hover:cursor-pointer hover:underline focus-visible:underline">
            <span className="font-bold text-black">{data.followersCount} </span>
            Follower
          </span>
        </div>
      </header>
      <main>
        <InfiniteThreadList
          threads={profileThreads.data?.pages.flatMap((page) => page.threads)}
          isError={profileThreads.isError}
          isLoading={profileThreads.isLoading}
          hasMore={profileThreads.hasNextPage || false}
          fetchNewThreads={profileThreads.fetchNextPage}
        />
      </main>
    </>
  )
}

function FollowButton({
  userId,
  isFollowing,
  isLoading,
  onClick,
}: {
  userId: string;
  isFollowing: boolean;
  isLoading: boolean;
  onClick: () => void;
}) {
  const session = useSession();

  if (session.status !== "authenticated" || session.data.user.id === userId) {
    return null;
  }

  return (
    <Button disabled={isLoading} onClick={onClick} small gray={isFollowing}>
      {isFollowing ? "Unfollow" : "Follow"}
    </Button>
  );
}

export async function getStaticProps(
  context: GetStaticPropsContext<{ id: string }>,
) {
  const id = context.params?.id;
  console.log("get static props:", id)

  if (id == null) {
    return {
      redirect: {
        destination: "/",
      },
    };
  }

  const ssg = ssgHelper();
  // cache the result for staticly generating
  await ssg.profile.getById.prefetch({ id });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      id,
    },
  };
}


export const getStaticPaths: GetStaticPaths = async () => {
  console.log("get static paths")
  return {
    paths: [], // defer all path generating to run time
    fallback: 'blocking', // new paths will wait for the HTML to be generated
  }
}
