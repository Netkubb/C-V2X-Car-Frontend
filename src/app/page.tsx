'use client';
// react
import { useEffect } from 'react';
// next
import { useRouter } from 'next/navigation';

export default function Home() {
	const router = useRouter();

	useEffect(() => {
		router.push('/login');
	}, [router]);

	return;
}
