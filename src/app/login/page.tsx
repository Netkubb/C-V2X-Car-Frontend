'use client';

import React, { useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';
import Button from '@/components/Button';
import { IconName } from '@/const/IconName';
import { AuthContext } from '@/components/LayoutWrapper';

export default function Home() {
	const router = useRouter();
	const [username, setUsername] = useState<string>('');
	const [password, setPassword] = useState<string>('');
	const [isError, setIsError] = useState<boolean>(false);
	const [_, setAuth] = useContext(AuthContext);

	const handleLogin = async () => {
		await axios
			.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
				username: username,
				password: password,
			})
			.then((res) => {
				setAuth({
					token: res.data.data.token,
					role: res.data.data.role,
					car_id: res.data.data.car_id,
				});
				router.push('/dashboard');
			})
			.catch(() => setIsError(true));
	};

	const handleDefaultLogin = async () => {
		await axios
			.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
				username: process.env.NEXT_PUBLIC_DRIVER_USERNAME,
				password: process.env.NEXT_PUBLIC_DRIVER_PASSWORD,
			})
			.then((res) => {
				setAuth({
					token: res.data.data.token,
					role: res.data.data.role,
					car_id: res.data.data.car_id,
				});
				router.push('/dashboard');
			})
			.catch(() => setIsError(true));
	};

	useEffect(() => {
		handleDefaultLogin()
	})
	
	return (
		<div className="flex w-[100dvw] h-[100dvh] items-center justify-center">
			<Image
				className="-z-10"
				src="/background.png"
				fill={true}
				alt={'Background Image'}
			/>
			<div className="w-[90dvw] h-[90dvh] flex flex-row items-center bg-white rounded-lg border-2 border-black">
				<div className="w-full flex flex-col items-center gap-16">
					<p className="font-istok text-black text-h2">Welcome to</p>
					<Image src="/logo.svg" alt="C-V2X logo" width={300} height={80} />
				</div>
				<div className="w-full flex flex-col items-center gap-64">
					<p className="font-istok text-black text-h2">Sign in</p>
					<div className="flex flex-col items-center w-full gap-32">
						{/* username */}
						<div className="flex flex-col w-3/5 gap-8">
							<p className="font-istok text-black text-p1">Username</p>
							<input
								className={`px-8 py-4 rounded-md border-2 ${
									isError ? 'border-red' : 'border-black'
								} focus:outline-blue font-istok text-black text-p3`}
								type="text"
								placeholder="Username"
								value={username}
								onChange={(e) => {
									setIsError(false);
									setUsername(e.target.value);
								}}
							/>
						</div>
						{/* password */}
						<div className="flex flex-col w-3/5 gap-8">
							<p className="font-istok text-black text-p1">Password</p>
							<input
								autoFocus
								className={`px-8 py-4 rounded-md border-2 ${
									isError ? 'border-red' : 'border-black'
								} focus:outline-blue font-istok text-black text-p3`}
								type="password"
								placeholder="Password"
								value={password}
								onChange={(e) => {
									setIsError(false);
									setPassword(e.target.value);
								}}
							/>
						</div>
						{/* helper text */}
						<p className="font-istok text-red text-p4 words-break">
							{isError &&
								'Login fail ! Please ensure the username and password are valid.'}
						</p>
					</div>
					{/* login button */}
					<div className="w-[40%]">
						<Button iconName={IconName.Login} onClick={handleLogin} />
					</div>
				</div>
			</div>
		</div>
	);
}
