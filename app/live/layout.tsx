import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Live TV — RedaStream+',
    description: 'Watch free live TV channels from around the world — News, Sports, Entertainment, Science and more.',
}

export default function LiveLayout({ children }: { children: React.ReactNode }) {
    return children
}
