import { Metadata } from 'next'
import App from './app'

const appUrl = process.env.NEXT_PUBLIC_URL

const frame = {
	version: 'next',
	imageUrl: `${appUrl}/opengraph-image`,
	button: {
		title: 'Launch Frame',
		action: {
			type: 'launch_frame',
			name: 'Farcaster Apps',
			url: appUrl,
			splashImageUrl: `${appUrl}/splash.png`,
			splashBackgroundColor: '#f7f7f7',
		},
	},
}

export const revalidate = 300

export async function generateMetadata(): Promise<Metadata> {
	return {
		title: 'Farcaster Apps',
		openGraph: {
			title: 'Farcaster Apps',
			description: 'Collection of useful Farcaster tools and analytics.',
		},
		other: {
			'fc:frame': JSON.stringify(frame),
		},
	}
}

export default function Home() {
	return <App />
}
