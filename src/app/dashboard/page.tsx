'use client';

import Button from '@/components/Button';
import DateContextBox from '@/components/DateContextBox';
import {
	AuthContext,
	AuthData,
	CarContext,
	RSUContext,
} from '@/components/LayoutWrapper';
import Map from '@/components/Map';
import Modal from '@/components/Modal';
import TextContentBox from '@/components/TextContentBox';
import VideosSection from '@/components/VideosSection';
import { IconName } from '@/const/IconName';
import { useRouter } from 'next/navigation';
import { useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import LaneChanging from '@/components/LaneChanging';

export default function Home() {
	const router = useRouter();
	const [auth, setAuth] = useContext(AuthContext);
	const car = useContext(CarContext);
	const rsu = useContext(RSUContext);

	useEffect(() => {
		if (!auth.token || auth.token === '') router.push('/login');
	}, [auth, router]);

	const [isButtonVisible, setIsButtonVisible] = useState(true);
	const [isPopupVisible, setIsPopupVisible] = useState(false);
	const [notiMessage, setNotiMessage] = useState<string>('');
	const [isObjectDetectionOn, setIsObjectDetectionOn] = useState(false);
	const [remote, setRemote] = useState(false);

	const handleConfirmEmergency = () => {
		setIsButtonVisible(true);

		if (
			typeof car.latitude === 'undefined' ||
			typeof car.longitude === 'undefined'
		) {
			setNotiMessage(
				'Sent emergency failed: latitude or longitude is undefined!',
			);
		} else {
			const socket = io(`${process.env.NEXT_PUBLIC_OBU_SOCKET_HTTP_URL}`);
			socket.emit('emergency', {
				token: auth.token,
				car_id: auth.car_id,
				latitude: car.latitude,
				longitude: car.longitude,
			});
			setNotiMessage('An emergency has been sent!');
		}
		const audio = new Audio('/noti.mp3');
		audio.play();
		setIsPopupVisible(true);

		setTimeout(() => {
			setIsPopupVisible(false);
		}, 3000);
	};

	const handleLogout = () => {
		setAuth({} as AuthData);
		router.push('/login');
	};

	const handleOpenPreviewPage = () => {
		router.push('/preview');
	};

	useEffect(() => {
		const socket = io(`${process.env.NEXT_PUBLIC_OBU_SOCKET_HTTP_URL}`);
		socket.on('emergency_stop', (res) => {
			setNotiMessage('Emergency stop from control center!');
			setRemote(true);
			const audio = new Audio('/noti.mp3');
			audio.play();
			setIsPopupVisible(true);

			setTimeout(() => {
				setIsPopupVisible(false);
				setRemote(false);
			}, 5000);
		});
		return () => {
			socket.off('emergency_stop');
		};
	}, []);

	if (!auth.token || auth.token === '') return;

	return (
		<>
			<Modal
				isOpen={isPopupVisible}
				header="Notification"
				content={notiMessage}
				remote={remote}
			/>
			<div className="h-[100dvh] w-[100dvw] flex flex-row gap-12 p-8 bg-light_grey">
				<div className="h-full w-3/5 bg-white rounded-lg p-16 items-center justify-center">
					<Map />
				</div>
				<div className="h-full w-2/5 flex flex-col gap-12">
					<div className="h-[48%]">
						<VideosSection isObjectDetectionOn={isObjectDetectionOn} />
					</div>
					<div className="h-[12%]">
						<LaneChanging />
					</div>
					<div className="h-2/5 w-full flex flex-col gap-12">
						<div className="h-full w-full flex flex-row gap-12">
							<div className="w-2/5">
								<TextContentBox
									title="Current Speed"
									content={car.speed?.toFixed() ?? '-'}
									helperText={car.unit}
									warning={car.speed >= rsu.rec_speed}
								/>
							</div>
							<div className="w-3/5">
								<DateContextBox />
							</div>
						</div>
						<div className="h-full w-full flex flex-row gap-12">
							<div className="w-2/5">
								<TextContentBox
									title="Recommended Speed"
									content={rsu.rec_speed?.toFixed() ?? '-'}
									helperText={rsu.unit}
								/>
							</div>
							<div className="h-full w-3/5 flex flex-col gap-12">
								<div className="h-full w-full flex flex-row gap-12">
									{isButtonVisible ? (
										<Button
											iconName={IconName.Emer}
											onClick={() => setIsButtonVisible(false)}
										/>
									) : (
										<>
											<Button
												iconName={IconName.Bell}
												onClick={handleConfirmEmergency}
											/>
											<Button
												iconName={IconName.Cancel}
												onClick={() => setIsButtonVisible(true)}
											/>
										</>
									)}
								</div>
								<div className="h-full w-full flex flex-row gap-12">
									<Button
										iconName={IconName.Preview}
										onClick={handleOpenPreviewPage}
									/>
								</div>
								<div className="h-full w-full flex flex-row gap-12">
									<Button
										iconName={
											isObjectDetectionOn ? IconName.Obj : IconName.NoObj
										}
										onClick={() => setIsObjectDetectionOn(!isObjectDetectionOn)}
									/>
									<Button iconName={IconName.Logout} onClick={handleLogout} />
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
