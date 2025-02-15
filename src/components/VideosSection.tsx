import { useEffect, useState } from 'react';
import StreamVideo from './videoStreaming/videoStreaming';

const carID = process.env.NEXT_PUBLIC_CAR_ID?.toString() || '';
const camIDs = [process.env.NEXT_PUBLIC_CAM_FRONT?.toString() || ''];
const camSUUIDs = ['my_suuid'];

export default function VideosSection({
	isObjectDetectionOn,
}: {
	isObjectDetectionOn: boolean;
}) {
	const [selectedCam, setSelectedCam] = useState<string>(camIDs[0]);
	const [isInitDetection, setIsInitDetection] = useState(false);
	useEffect(() => {
		setTimeout(() => {
			setIsInitDetection(true);
		}, 10000);
	}, []);
	return (
		<div className="w-full h-full flex flex-col gap-12 items-center p-12 bg-white rounded-md">
			{camIDs.map((camID, i) => (
				<StreamVideo
					isInitDetection={isInitDetection}
					isShow={selectedCam == camID}
					camSUUID={camSUUIDs[i]}
					carID={carID}
					camNumber={camID}
					isShowObjectDetection={isObjectDetectionOn}
					isStream={true}
					key={'steam_' + i}
				/>
			))}
		</div>
	);
}
