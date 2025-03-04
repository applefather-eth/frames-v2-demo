'use client'

import { useSearchParams } from 'next/navigation'
import NewPage from '~/components/NewPage'

export default function YourNetworkCapPage() {
	const searchParams = useSearchParams()
	const fid = searchParams.get('fid')

	if (!fid) {
		return (
			<div className="min-h-screen bg-black text-white p-8 font-mono">
				<div className="max-w-4xl mx-auto">
					<div className="p-6 bg-black/20 backdrop-blur-sm border border-gray-900">
						<h1 className="text-xl mb-4">Network Cap Analytics</h1>
						<p className="text-gray-400 mb-4">
							Please provide an FID to analyze the network.
						</p>
						<p className="text-sm text-gray-500">
							Example:{' '}
							<code className="text-orange-500">/yourNetworkCap?fid=20066</code>
						</p>
					</div>
				</div>
			</div>
		)
	}

	return <NewPage fid={fid} />
}
