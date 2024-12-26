'use client';

import React, { useContext } from 'react';
import carImg from '../../public/car.png';
import roadImg from '../../public/road.png';
import Image from 'next/image';
import { RSUContext } from './LayoutWrapper';

export default function LaneChanging() {
	const rsu = useContext(RSUContext);
	return (
		<div className="flex flex-row gap-8 h-full w-full">
			{[1, 2, 3, 4].map((i) => (
				<button
					className="h-full w-full"
					key={i}
					// onClick={() => setSelectedCam(camID)}
				>
					<div
						className={`${
							rsu.lane_changing == i
								? 'bg-black text-white'
								: 'bg-white text-black'
						}`}
					>
						Lane {i}
					</div>
					<div className="flex justify-center">
						{rsu.lane_changing == i ? (
							<Image src={carImg.src} alt="Car" width={100} height={100} />
						) : (
							<Image src={roadImg.src} alt="Road" width={100} height={100} />
						)}
					</div>
				</button>
			))}
		</div>
	);
}
