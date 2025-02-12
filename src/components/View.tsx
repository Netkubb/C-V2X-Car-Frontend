import React, { RefObject } from 'react';
import Video from './Video';
import styles from './Video.module.css';
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
		<p className="font-istok text-black text-p1">Local Video</p>
		<video
			className={styles.video}
			muted
			ref={localThumbnailVideoRef}
			autoPlay
		/>
		{thumbnailUsers.map((user) => (
			<Video
				key={user.id}
				stream={user.stream}
				onVideoClick={onVideoClick}
				userId={user.id}
			/>
		))}
	</div>
);

export const DedicatedVideoView: React.FC<DedicatedViewProps> = ({
	selectedUser,
	onBack,
}) => (
	<div>
		<Video
			stream={selectedUser.stream}
			onVideoClick={onBack}
			userId={selectedUser.id}
		/>
	</div>
);
