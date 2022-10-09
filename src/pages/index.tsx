import { signIn, signOut, useSession } from 'next-auth/react'
import { useState } from 'react'
import Messages from '../utils/components/Messages'
import { trpc } from '../utils/trpc'

const Home = () => {
  const { data: session, status } = useSession()
  const [message, setMessage] = useState('')
  const ctx = trpc.useContext()

  const postMessage = trpc.guestbook.postMessage.useMutation({
    onMutate: () => {
      ctx.guestbook.getAll.cancel()

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

  if (status === 'loading') {
    return <main className='flex flex-col items-center pt-4'>Loading...</main>
  }

  return (
    <main className='flex flex-col items-center'>
      <h1 className='pt-4 text-3xl'>Guestbook</h1>
      <p className='pt-4 text-3xl'>
        Tutorial for <code>create-t3-app</code>
      </p>

      <div className='pt-10'>
        {session ? (
          <div>
            <div>
              <form
                className='flex gap-2'
                onSubmit={(event) => {
                  event.preventDefault()

                  postMessage.mutate({
                    name: session.user?.name as string,
                    message: message,
                  })

                  setMessage('')
                }}
              >
                <input
                  type='text'
                  value={message}
                  placeholder='Your message...'
                  maxLength={100}
                  onChange={(event) => setMessage(event.target.value)}
                  className='rounded-md border-2 border-zinc-800 bg-neutral-900 px-4 py-2 focus:outline-none'
                />
                <button
                  type='submit'
                  className='rounded-md border-2 border-zinc-800 p-2 focus:outline-none'
                >
                  Submit
                </button>
              </form>
              <p className='p-2'>hi {session.user?.name}</p>

              <button
                onClick={() => signOut()}
                className='rounded-md border-2 border-zinc-800 bg-neutral-900 p-2 focus:outline-none'
              >
                Logout
              </button>
            </div>
            <div className='pt-10'>
              <Messages />
            </div>
          </div>
        ) : (
          <div>
            <button
              className='rounded-md border-2 border-zinc-800 bg-neutral-900 p-2 focus:outline-none'
              onClick={() => signIn('discord')}
            >
              Login with Discord
            </button>

            <div className='pt-10' />
            <Messages />
          </div>
        )}
      </div>
    </main>
  )
}

export default Home
