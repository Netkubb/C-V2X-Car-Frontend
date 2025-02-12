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
}) => (
	<div>
		<p className="font-istok text-black text-h2 border-b-2 border-gray-400 pb-2">
			Video Thumbnail View
		</p>
		<p className="font-istok text-black text-p1 border border-gray-300 rounded-md px-2 py-1 inline-block">
			Local Video
		</p>
		<video
			className="rounded-lg mt-2"
			muted
			ref={localThumbnailVideoRef}
			autoPlay
		/>
		<p className="font-istok text-black text-p1 border border-gray-300 rounded-md px-2 py-1 inline-block mt-4">
			Other Cars Video
		</p>
		<div className="flex flex-wrap gap-4 mt-2">
			{thumbnailUsers.map((user) => (
				<Video
					key={user.id}
					stream={user.stream}
					onVideoClick={onVideoClick}
					userId={user.id}
				/>
			))}
		</div>
	</div>
);

export const DedicatedVideoView: React.FC<DedicatedViewProps> = ({
	selectedUser,
	onBack,
}) => (
	<div>
		<p className="font-istok text-black text-h2">Dedicated View</p>
		<Video
			stream={selectedUser.stream}
			onVideoClick={onBack}
			userId={selectedUser.id}
		/>
	</div>
);
