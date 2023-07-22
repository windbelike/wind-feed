import NewThreadForm from "~/components/NewThreadForm";
import RecentThreads from "~/components/RecentThreads";


export default function Home() {
  return (
    <>
      <header className="sticky top-0 border-b pt-2">
        <h1 className="mb-2 px-4 font-bold text-lg ">
          Home
        </h1>
      </header>

      <NewThreadForm />
      <RecentThreads />
    </>
  )
}
