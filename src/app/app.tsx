'use client'

import dynamic from 'next/dynamic'
import { useSearchParams, usePathname } from 'next/navigation'

const NewPage = dynamic(() => import('~/components/NewPage'), {
	ssr: false,
})

// Add more components here as needed
// const OtherFeature = dynamic(() => import('~/components/OtherFeature'), {
// 	ssr: false,
// })

export default function App(
	{ title }: { title?: string } = { title: 'Farcaster Apps' }
) {
	const searchParams = useSearchParams()
	const pathname = usePathname()
	const fid = searchParams.get('fid')

	// Route-based component rendering
	switch (pathname) {
		case '/yourNetworkCap':
			return <NewPage title="Network Cap Analytics" fid={fid || undefined} />
		// Add more routes here as needed
		// case '/otherFeature':
		//   return <OtherFeature />
		default:
			return (
				<div className="min-h-screen bg-black text-white p-8 font-mono">
					<div className="max-w-4xl mx-auto">
						<h1 className="text-2xl mb-8">Available Apps</h1>
						<div className="grid gap-6">
							<a
								href="/yourNetworkCap"
								className="p-6 bg-black/20 backdrop-blur-sm border border-gray-900 hover:bg-black/30 transition-colors"
							>
								<h2 className="text-lg mb-2">Network Cap Analytics</h2>
								<p className="text-sm text-gray-400">
									Analyze your Farcaster network and follower statistics
								</p>
							</a>
							{/* Add more app links here as you develop them */}
						</div>
					</div>
				</div>
			)
	}
}
