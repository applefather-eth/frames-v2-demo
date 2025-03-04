'use client'

import { useState, useEffect } from 'react'
import sdk, { type Context } from '@farcaster/frame-sdk'

interface User {
	object: string
	fid: number
	username: string
	display_name: string
	pfp_url: string
	custody_address: string
	profile: {
		bio: {
			text: string
		}
	}
	follower_count: number
	following_count: number
	verifications: string[]
	verified_addresses: {
		eth_addresses: string[]
		sol_addresses: string[]
	}
	verified_accounts: string[]
	power_badge: boolean
	viewer_context: {
		following: boolean
		followed_by: boolean
		blocking: boolean
		blocked_by: boolean
	}
}

interface FollowObject {
	object: string
	user: User
}

interface ApiResponse {
	users: FollowObject[]
	next: {
		cursor?: string
	}
}

interface NewPageProps {
	title?: string
	fid?: string
}

export default function NewPage({ fid: paramFid }: NewPageProps) {
	const [totalFollowersCount, setTotalFollowersCount] = useState<number>(0)
	const [averageFollowersCount, setAverageFollowersCount] = useState<number>(0)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [progress, setProgress] = useState<string>('0')
	const [totalProcessed, setTotalProcessed] = useState<number>(0)
	const [context, setContext] = useState<Context.FrameContext>()
	const [isSDKLoaded, setIsSDKLoaded] = useState(false)

	// Load SDK context
	useEffect(() => {
		const load = async () => {
			console.log('NewPage.tsx - Loading SDK context')
			const context = await sdk.context
			console.log('NewPage.tsx - SDK Context:', context)
			setContext(context)
			setIsSDKLoaded(true)
			sdk.actions.ready({})
		}

		if (sdk && !isSDKLoaded) {
			console.log('NewPage.tsx - Initializing SDK')
			load()
			return () => {
				sdk.removeAllListeners()
			}
		}
	}, [])

	useEffect(() => {
		// Only proceed if SDK is loaded (even for paramFid we need SDK to be initialized)
		if (!isSDKLoaded) return

		// Check for paramFid first, then fall back to context fid
		const activeFid = paramFid || context?.user?.fid
		console.log('NewPage.tsx - Active FID:', activeFid)
		console.log('NewPage.tsx - Param FID:', paramFid)
		console.log('NewPage.tsx - Context FID:', context?.user?.fid)

		// Only start fetching when we have either paramFid or context fid
		if (!activeFid) {
			console.log('NewPage.tsx - No active FID available')
			return
		}

		// Reset states when fetching for a new FID
		setLoading(true)
		setError(null)
		setProgress('0')
		setTotalProcessed(0)

		const fetchAllFollowers = async () => {
			try {
				let cursor: string | undefined = undefined
				let allUsers: User[] = []
				let pageCount = 0

				do {
					console.log(
						`Fetching page ${pageCount + 1}${
							cursor ? ' with cursor: ' + cursor : ''
						}`
					)
					const response = await fetch(
						`https://api.neynar.com/v2/farcaster/followers?fid=${activeFid}&viewer_fid=${activeFid}&limit=100${
							cursor ? `&cursor=${cursor}` : ''
						}`,
						{
							headers: {
								accept: 'application/json',
								'x-api-key': process.env.NEXT_PUBLIC_NEYNAR_API_KEY || '',
								'x-neynar-experimental': 'false',
							},
						}
					)

					if (!response.ok) {
						const errorData = await response.json()
						throw new Error(
							`Failed to fetch followers: ${
								errorData.message || 'Unknown error'
							}`
						)
					}

					const data: ApiResponse = await response.json()
					const users = data.users.map((follow) => follow.user)
					allUsers = [...allUsers, ...users]
					pageCount++

					// Update progress and total processed
					setProgress(`${allUsers.length}`)
					setTotalProcessed(allUsers.length)

					// Get cursor for next page
					cursor = data.next?.cursor

					// Add a small delay to avoid rate limiting
					await new Promise((resolve) => setTimeout(resolve, 500))
				} while (cursor)

				// Calculate final statistics
				const total = allUsers.reduce(
					(sum: number, user: User) => sum + user.follower_count,
					0
				)
				const average =
					allUsers.length > 0 ? Math.round(total / allUsers.length) : 0

				setTotalFollowersCount(total)
				setAverageFollowersCount(average)
				setTotalProcessed(allUsers.length) // Final count
				setLoading(false)
			} catch (err) {
				console.error('Error fetching followers:', err)
				setError(err instanceof Error ? err.message : 'An error occurred')
				setLoading(false)
			}
		}

		fetchAllFollowers()
	}, [context, paramFid, isSDKLoaded])

	if (!isSDKLoaded || (!paramFid && !context?.user?.fid)) {
		return (
			<div className="min-h-screen bg-black text-white p-8 font-mono">
				<div className="max-w-4xl mx-auto">
					<div className="bg-black/50 backdrop-blur-sm rounded-xl p-6 border border-gray-900">
						<div className="flex flex-col items-center justify-center space-y-4">
							<div
								className="animate-spin rounded-full h-8 w-8 border-b-2"
								style={{ borderColor: '#FF4F00' }}
							></div>
							<p className="text-lg font-medium">
								{!isSDKLoaded ? 'Initializing SDK...' : 'Loading user data...'}
							</p>
							<p className="text-sm text-gray-400">
								{paramFid ? `FID: ${paramFid}` : 'No FID provided'}
							</p>
							<p className="text-xs text-gray-500">
								SDK Status: {isSDKLoaded ? 'Loaded' : 'Loading'}
							</p>
						</div>
					</div>
				</div>
			</div>
		)
	}

	return (
		<main className="h-[100vh] bg-black text-white p-8 font-mono flex flex-col justify-between">
			<div className="max-w-4xl mx-auto w-full">
				<div className="flex items-center gap-4 mb-8">
					{context?.user?.pfpUrl && (
						<img
							src={context.user.pfpUrl}
							alt="Profile"
							className="w-12 h-12 rounded-full border border-gray-900"
						/>
					)}
					<div>
						<h2 className="text-lg text-white">
							{paramFid
								? `FID: ${paramFid}`
								: context?.user?.username
								? `@${context.user.username}`
								: `fid: ${context?.user?.fid}`}
						</h2>
					</div>
				</div>

				<div className="space-y-6">
					{loading && (
						<div className="bg-black/50 backdrop-blur-sm p-6 border border-gray-900">
							<div className="flex flex-col items-center justify-center space-y-4">
								<div
									className="animate-spin h-8 w-8"
									style={{
										borderBottom: '2px solid #FF4F00',
										borderRight: '2px solid transparent',
										borderTop: '2px solid transparent',
										borderLeft: '2px solid transparent',
									}}
								></div>
								<p className="text-lg font-medium">Calculating...</p>
								<p className="text-sm text-gray-400">
									Processed {progress} accounts so far
								</p>
							</div>
						</div>
					)}

					{error && (
						<div className="bg-red-900/20 backdrop-blur-sm rounded-xl p-6 border border-red-800">
							<p className="text-red-400">Error: {error}</p>
						</div>
					)}

					{!loading && !error && (
						<div className="grid gap-6">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div className="p-6 bg-black/20 backdrop-blur-sm border border-gray-900">
									<p className="text-sm text-gray-400 mb-2">
										Total Followers of Your Network
									</p>
									<div className="space-y-1">
										<p
											className="text-3xl font-bold"
											style={{ color: '#FF4F00' }}
										>
											{totalFollowersCount.toLocaleString()}
										</p>
										<p className="text-xs text-gray-500">
											(from {totalProcessed.toLocaleString()} followers)
										</p>
									</div>
								</div>

								<div className="p-6 bg-black/20 backdrop-blur-sm border border-gray-900">
									<p className="text-sm text-gray-400 mb-2">
										Average Followers per Follower
									</p>
									<p
										className="text-3xl font-bold"
										style={{ color: '#FF4F00' }}
									>
										{averageFollowersCount.toLocaleString()}
									</p>
								</div>
							</div>
						</div>
					)}
				</div>
				<div className="fixed bottom-8 left-0 right-0 flex items-center justify-center gap-2">
					<span className="text-gray-500 text-sm">frame by</span>
					<img src="/logo.png" alt="Goatcast" className="h-5" />
				</div>
			</div>
		</main>
	)
}
