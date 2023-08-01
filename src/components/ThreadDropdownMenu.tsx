import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import IconHoverEffect from './IconHoverEffect';
import { VscEllipsis, VscSync, VscTrash } from 'react-icons/vsc';
import { api } from '~/utils/api';
import toast from 'react-hot-toast';
import { useSession } from 'next-auth/react';

type ThreadDropdownMenuProps = {
  id: string
  user: { id: string, image: string | null, name: string | null }
}

export default function ThreadDropdownMenu({ id, user }: ThreadDropdownMenuProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger >
        <IconHoverEffect>
          <VscEllipsis className="w-6 h-6" />
        </IconHoverEffect>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content>
          <ThreadMenu id={id} user={user} />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

function ThreadMenu({ id, user }: ThreadDropdownMenuProps) {
  const trpcUtils = api.useContext();
  const deleteMutation = api.thread.delete.useMutation({
    onSuccess: async (data) => {
      console.log("thread deleted")
      toast.success("Thread Deleted")
      trpcUtils.thread.infiniteFeed.invalidate()
      trpcUtils.thread.threadDetail.invalidate()
    }
  })
  const me = useSession()
  const showDeleteButton = user != null && me.data?.user.id == user.id

  function onClickDelete() {
    if (id != null) {
      deleteMutation.mutate({ threadId: id })
    }
  }
  return (
    <div className="shadow-2xl bg-white absolute z-50 rounded-2xl
    translate-x-[-75%]">
      {showDeleteButton && <button onClick={onClickDelete}
        className="py-2 px-4 flex-grow flex gap-3 text-red-500 font-bold
      hover:bg-gray-200 rounded-2xl">
        <VscTrash className="w-6 h-6" />
        Delete
      </button>
      }
      <button className="py-2 px-4 flex-grow flex gap-3 font-bold
      hover:bg-gray-200 rounded-2xl">
        <VscSync className="w-6 h-6"/> tbd
      </button>
    </div>
  )
}
