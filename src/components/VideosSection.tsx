import { useEffect, useState } from 'react';
import StreamVideo from './videoStreaming/videoStreaming';

const carID = '65ac9720191a85b6842de0ec';
const camIDs = [
	'65940703ce9bc3c043a77615',
	'65b6ff827c8483c5c4a474a5',
	'65b6ff927c8483c5c4a474ab',
	'65b6ff9c7c8483c5c4a474b1',
];

const camDeviceStartWith = 2

export default function VideosSection({
	isObjectDetectionOn,
}: {
	isObjectDetectionOn: boolean;
}) {
	const [selectedCam, setSelectedCam] = useState<string>(camIDs[0]);
	const [isInitDetection,setIsInitDetection] = useState(false)
	useEffect(()=>{
		setTimeout(()=>{
			setIsInitDetection(true)
		},3000)
	},[])
	return (
		<div className="w-full h-full flex flex-col gap-12 items-center p-12 bg-white rounded-md">
			<div className="h-4/5 w-full">
				{camIDs.map((camID, i) => (
					<StreamVideo
						isInitDetection={isInitDetection}
						isShow={(selectedCam == camID)}
						carID={carID}
						camNumber={camID}
						sourceNumber={i+camDeviceStartWith}
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
							camNumber={camID}
							sourceNumber={i+camDeviceStartWith}
							isShowObjectDetection={isObjectDetectionOn}
							isStream={false}
						/>
					</button>
				))}
			</div>
		</div>
	);
}
