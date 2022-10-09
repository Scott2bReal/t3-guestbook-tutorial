import { trpc } from '../trpc'

const Messages = () => {
  const { data: messages, isLoading } = trpc.guestbook.getAll.useQuery()
  const ctx = trpc.useContext()

  const deleteMessage = trpc.guestbook.deleteMessage.useMutation({
    onMutate: async () => {
      await ctx.guestbook.getAll.cancel()

      const optimisticUpdate = ctx.guestbook.getAll.getData()

      if (optimisticUpdate) {
        ctx.guestbook.getAll.setData(optimisticUpdate)
      }

      return { optimisticUpdate }
    },
    onSettled: () => {
      ctx.guestbook.getAll.invalidate()
    },
  })

  // const editMessage = trpc.guestbook.editMessage.useMutation({
  //   onMutate: async () => {
  //     await ctx.guestbook.getAll.cancel()
  //
  //     const optimisticUpdate = ctx.guestbook.getAll.getData()
  //
  //     if (optimisticUpdate) {
  //       ctx.guestbook.getAll.setData(optimisticUpdate)
  //     }
  //
  //     return { optimisticUpdate }
  //   },
  //   onSettled: () => {
  //     ctx.guestbook.getAll.invalidate()
  //   },
  // })

  if (isLoading) return <div>Fetching messages...</div>

  return (
    <div className='flex flex-col gap-4'>
      {messages?.map((msg, index) => {
        return (
          <div key={index}>
            <p>{msg.message}</p>
            <span>- {msg.name}</span>
            <form
              onSubmit={(event) => {
                event.preventDefault()

                deleteMessage.mutate({
                  id: msg.id,
                  name: msg.name,
                })
              }}
            >
              <button className='rounded-md border-2 border-zinc-800 p-2 focus:outline-none'>
                Delete this post
              </button>
            </form>
          </div>
        )
      })}
    </div>
  )
}

export default Messages
