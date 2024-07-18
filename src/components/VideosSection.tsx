import { useEffect, useState } from 'react';
import StreamVideo from './videoStreaming/videoStreaming';

const carID = process.env.NEXT_PUBLIC_CAR_ID?.toString() || "";
const camIDs = [
	process.env.NEXT_PUBLIC_CAM_FRONT?.toString() || "",
	process.env.NEXT_PUBLIC_CAM_BACK?.toString() || "",
	process.env.NEXT_PUBLIC_CAM_LEFT?.toString() || "",
	process.env.NEXT_PUBLIC_CAM_RIGHT?.toString() || "",
];

const camDeviceStartWith = Number(process.env.NEXT_PUBLIC_CAM_START_WITH) || 0

export default function VideosSection({
	isObjectDetectionOn,
}: {
	isObjectDetectionOn: boolean;
}) {
	const [selectedCam, setSelectedCam] = useState<string>(camIDs[0]);
	const [isInitDetection, setIsInitDetection] = useState(false)
	useEffect(() => {
		setTimeout(() => {
			setIsInitDetection(true)
		}, 10000)
	}, [])
	return (
		<div className="w-full h-full flex flex-col gap-12 items-center p-12 bg-white rounded-md">
			<div className="h-4/5 w-full">
				{camIDs.map((camID, i) => (
					<StreamVideo
						isInitDetection={isInitDetection}
						isShow={(selectedCam == camID)}
						carID={carID}
						key={"steam_" + camID}
						camNumber={camID}
						sourceNumber={i + camDeviceStartWith}
						isShowObjectDetection={isObjectDetectionOn}
						isStream={true}
					/>)
				)}
			</div>
			<div className="flex flex-row gap-8 h-1/5 w-full">
				{camIDs.map((camID, i) => (
					<button
						className="h-full w-full"
						key={camID}
						onClick={() => setSelectedCam(camID)}
					>
						<StreamVideo
							isInitDetection={true}
							isShow={true}
							carID={carID}
							key={"steam_"+camID}
							camNumber={camID}
							sourceNumber={i + camDeviceStartWith}
							isShowObjectDetection={isObjectDetectionOn}
							isStream={false}
						/>
					</button>
				))}
			</div>
		</div>
	);
}
