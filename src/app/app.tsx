'use client'

import dynamic from 'next/dynamic'
import { useSearchParams } from 'next/navigation'

// const Demo = dynamic(() => import('~/components/Demo'), {
// 	ssr: false,
// })

const NewPage = dynamic(() => import('~/components/NewPage'), {
	ssr: false,
})

export default function App(
	{ title }: { title?: string } = { title: 'Frames v2 Demo' }
) {
	const searchParams = useSearchParams()
	const fid = searchParams.get('fid')

	console.log('App.tsx - FID from URL:', fid)

	return <NewPage title={title} fid={fid || undefined} />
}
