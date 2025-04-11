import React, { RefObject } from 'react';
import Video from './Video';
import { WebRTCUser } from '../utils/webRTCUser';

interface ThumbnailViewProps {
	thumbnailUsers: WebRTCUser[];
	localThumbnailVideoRef: RefObject<HTMLVideoElement>;
	onVideoClick: (userId: string) => void;
}

interface DedicatedViewProps {
	selectedUser: WebRTCUser;
	onBack: () => void;
}

export const ThumbnailVideoView: React.FC<ThumbnailViewProps> = ({
	thumbnailUsers,
	localThumbnailVideoRef,
	onVideoClick,
}) => {
	const videoCount = thumbnailUsers.length;
	console.log(videoCount);
	return (
		<div className="w-full flex flex-col items-center">
			<p className="mt-32 font-istok text-black text-h2 border-b-2 border-gray-400 pb-2">
				Video Thumbnail View
			</p>
			<p className="font-istok text-black text-p1 rounded-md px-2 py-1 mt-12 inline-block">
				Local Video
			</p>
			<video
				className="mt-2 mb-16 w-[80%] object-contain rounded-lg"
				muted
				ref={localThumbnailVideoRef}
				autoPlay
			/>
			{videoCount != 0 && (
				<p className="font-istok text-black text-p1 rounded-md px-2 py-1 inline-block mt-4">
					Other Cars Video
				</p>
			)}
			{videoCount != 0 && (
				<div
					className={`grid gap-6 mt-2 mb-32 w-[80%] grid-cols-2`}
					style={{
						gridTemplateColumns: `repeat(${Math.min(
							videoCount,
							3
						)}, minmax(0, 1fr))`,
					}}
				>
					{thumbnailUsers.map((user) => (
						<Video
							key={user.id}
							stream={user.stream}
							onVideoClick={onVideoClick}
							userId={user.id}
						/>
					))}
				</div>
			)}
		</div>
	);
};

export const DedicatedVideoView: React.FC<DedicatedViewProps> = ({
	selectedUser,
	onBack,
}) => (
	<div className="w-full flex flex-col items-center">
		<p className="mt-32 font-istok text-black text-h2 border-b-2 border-gray-400 pb-2">
			Dedicated View
		</p>
		<div className="w-[80%] mb-32">
			<Video
				stream={selectedUser.stream}
				onVideoClick={onBack}
				userId={selectedUser.id}
			/>
		</div>
	</div>
);
