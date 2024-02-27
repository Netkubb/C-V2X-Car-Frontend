import { useState } from 'react';
import StreamVideo from './videoStreaming/videoStreaming';

const carID = '65ac9720191a85b6842de0ec';
const camNumbers = [
	'65940703ce9bc3c043a77615',
	'65b6ff827c8483c5c4a474a5',
	'65b6ff927c8483c5c4a474ab',
	'65b6ff9c7c8483c5c4a474b1',
];

export default function VideosSection({
	isObjectDetectionOn,
}: {
	isObjectDetectionOn: boolean;
}) {
	const [camNumber, setCamNumber] = useState<string>(camNumbers[0]);
	return (
		<div className="w-full h-full flex flex-col gap-12 items-center p-12 bg-white rounded-md">
			<div className="h-4/5 w-full">
				<StreamVideo
					carID={carID}
					camNumber={camNumber}
					sourceNumber={0}
					isShowObjectDetection={isObjectDetectionOn}
					isStream={true}
				/>
			</div>
			<div className="flex flex-row gap-8 h-1/5 w-full">
				{camNumbers.map((number) => (
					<button
						className="h-full w-full"
						key={number}
						onClick={() => setCamNumber(number)}
					>
						<StreamVideo
							carID={carID}
							camNumber={number}
							sourceNumber={0}
							isShowObjectDetection={isObjectDetectionOn}
							isStream={true}
						/>
					</button>
				))}
			</div>
		</div>
	);
}
