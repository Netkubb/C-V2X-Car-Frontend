'use client';

import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';
import { useRouter } from 'next/navigation';
import { useContext, useState } from 'react';
import { io } from 'socket.io-client';

import Button from '@/components/Button';
import DateContextBox from '@/components/DateContextBox';
import {
	AuthContext,
	AuthData,
	CarContext,
	RSUContext,
} from '@/components/LayoutWrapper';
import TextContentBox from '@/components/TextContentBox';
import VideosSection from '@/components/VideosSection';
import { IconName } from '@/const/IconName';
import Modal from '@/components/Modal';

export default function Home() {
	const { isLoaded: isMapReady } = useLoadScript({
		googleMapsApiKey:
			process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '<GOOGLE-MAP-KEY>',
	});

	const [auth, setAuth] = useContext(AuthContext);
	const car = useContext(CarContext);
	const rsu = useContext(RSUContext);

	const [isButtonVisible, setIsButtonVisible] = useState(true);
	const [isPopupVisible, setIsPopupVisible] = useState(false);
	const [notiMessage, setNotiMessage] = useState<string>('');
	const [isObjectDetectionOn, setIsObjectDetectionOn] = useState(false);
	const router = useRouter();

	const location = {
		lat: car.latitude,
		lng: car.longitude,
	} as google.maps.LatLngLiteral;
	const rsuLocation = {
		lat: rsu.latitude,
		lng: rsu.longitude,
	} as google.maps.LatLngLiteral;

	const handleConfirmEmergency = () => {
		setIsButtonVisible(true);

		if (
			typeof car.latitude === 'undefined' ||
			typeof car.longitude === 'undefined'
		) {
			setNotiMessage(
				'Sent emergency failed: latitude or longitude is undefined!'
			);
		} else {
			const socket = io(`http://localhost:8002`);
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

	return (
		<>
			<Modal
				isOpen={isPopupVisible}
				header="Notification"
				content={notiMessage}
			/>
			<div className="h-[100dvh] w-[100dvw] flex flex-row gap-12 p-8 bg-light_grey">
				<div className="h-full w-3/5 bg-white rounded-lg p-16">
					{/* map */}
					{isMapReady && (
						<GoogleMap
							mapContainerClassName="z-0 h-full w-full rounded-md"
							zoom={14}
							center={location}
							options={{ disableDefaultUI: true }}
						>
							<Marker icon={{ url: '/car_pin.svg' }} position={location} />
							<Marker icon={{ url: '/rsu_pin.svg' }} position={rsuLocation} />
						</GoogleMap>
					)}
				</div>

				<div className="h-full w-2/5 flex flex-col gap-12">
					<VideosSection isObjectDetectionOn={isObjectDetectionOn} />
					<div className="h-full w-full flex flex-col gap-12">
						<div className="h-full w-full flex flex-row gap-12">
							<div className="w-2/5">
								<TextContentBox
									title="Current Speed"
									content={car.speed.toFixed(1)}
									helperText={car.unit}
								/>
							</div>
							<div className="w-3/5">
								<DateContextBox />
							</div>
						</div>
						<div className="h-full w-full flex flex-row gap-12">
							<div className="w-2/5">
								<TextContentBox
									title="Recommend Speed"
									content={rsu.rec_speed.toFixed(1)}
									helperText={car.unit}
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
