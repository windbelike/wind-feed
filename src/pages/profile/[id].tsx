import type { GetStaticPaths, GetStaticPropsContext, InferGetServerSidePropsType } from "next";
import { useRouter } from "next/router";
import { ssgHelper } from "~/server/api/ssgHelper";
import { api } from "~/utils/api";
import ErrorPage from "next/error";
import Head from "next/head";

export default function(props: InferGetServerSidePropsType<typeof getStaticProps>) {
  const { id } = props
  // const router = useRouter()

  const { data } = api.profile.getById.useQuery({ id });

  if (data == null || data.name == null) {
    return <ErrorPage statusCode={404} />;
  }

  return (
    <>
      <Head>
        <title>{`Wind Thread - ${data.name}`}</title>
      </Head>
      name {data.name}
    </>
  )
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
