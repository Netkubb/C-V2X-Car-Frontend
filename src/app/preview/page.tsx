'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useRouter } from 'next/navigation';
import { ThumbnailVideoView, DedicatedVideoView } from '../../components/View';
import { WebRTCUser } from '../../utils/webRTCUser';
import Button from '@/components/Button';
import { IconName } from '@/const/IconName';
import useVideoStream from '@/components/videoStreaming/hooks/useVideoStream';

const pc_config = {
	iceServers: [
		{
			urls: 'stun:stun.l.google.com:19302',
		},
	],
};

const camSUUIDs = 'my_suuid'; // TODO: change to dynamic env.

const SOCKET_THUMBNAIL_SERVER_URL =
	process.env.NEXT_PUBLIC_THUMBNAIL_SERVER_URL ?? 'http://localhost:8080';
const SOCKET_DEDICATED_SERVER_URL =
	process.env.NEXT_PUBLIC_DEDICATED_SERVER_URL ?? 'http://localhost:8081';
const VIDEO_STREAM_SERVER_URL =
	process.env.NEXT_PUBLIC_VIDEO_STREAM_SERVER_URL ?? 'http://localhost:8083';

export default function Home() {
	const router = useRouter();
	const localThumbnailSocketRef = useRef<Socket | null>(null);
	const localDedicatedSocketRef = useRef<Socket | null>(null);
	const localThumbnailStreamRef = useRef<MediaStream | null>(null);
	const localDedicatedStreamRef = useRef<MediaStream | null>(null);
	const thumbnailSendPCRef = useRef<RTCPeerConnection | null>(null);
	const thumbnailReceivePCsRef = useRef<{
		[socketId: string]: RTCPeerConnection;
	}>({});

	const dedicatedSendPCRef = useRef<RTCPeerConnection | null>(null);
	const dedicatedReceivePCRef = useRef<RTCPeerConnection | null>(null);
	const [thumbnailUsers, setThumbnailUsers] = useState<Array<WebRTCUser>>([]);
	const [trackCount, setTrackCount] = useState<Number>(0);
	const [selectedDedicatedUser, setSelectedDedicatedUser] =
		useState<WebRTCUser | null>(null);

	const localThumbnailVideoRef = useRef<HTMLVideoElement>(null);
	const localDedicatedVideoRef = useRef<HTMLVideoElement>(null);

	const { stream, connection, isOnline } = useVideoStream({
		streamServerUrl: VIDEO_STREAM_SERVER_URL,
		suuid: camSUUIDs,
		isStreamServerInSameNetwork: false,
	});

	const createStreamWithConstraints = async (
		originalStream: MediaStream,
		constraints: MediaTrackConstraints,
	): Promise<MediaStream> => {
		if (!originalStream || originalStream.getVideoTracks().length === 0) {
			throw new Error(
				'The provided stream is undefined, or there is no video tracks',
			);
		}

		const videoTracks = originalStream.getVideoTracks();
		const adjustedTrack = videoTracks[0].clone();

		try {
			await adjustedTrack.applyConstraints(constraints);
		} catch (error) {
			console.error('Failed to apply constraints:', error);
			throw error;
		}

		return new MediaStream([adjustedTrack]);
	};

	const handleBackFromDedicatedView = useCallback(() => {
		setSelectedDedicatedUser(null);
		if (dedicatedReceivePCRef.current) dedicatedReceivePCRef.current.close();
	}, []);

	const createDedicatedReceiverPeerConnection = useCallback(
		(socketID: string) => {
			try {
				const pc = new RTCPeerConnection(pc_config);

				// add pc to peerConnections object
				dedicatedReceivePCRef.current = pc;

				pc.onicecandidate = (e) => {
					if (!(e.candidate && localDedicatedSocketRef.current)) return;
					console.log('dedicated receiver PC onicecandidate');
					localDedicatedSocketRef.current.emit('receiverCandidate', {
						candidate: e.candidate,
						receiverSocketID: localDedicatedSocketRef.current.id,
						senderSocketID: socketID,
					});
				};

				pc.oniceconnectionstatechange = (e) => {
					console.log(e);
				};

				pc.ondatachannel = (event) => {
					const dataChannel = event.channel;
					console.log(dataChannel);

					dataChannel.onmessage = (event) => {
						console.log('received');
						const sentTime = parseInt(event.data, 10);
						const receivedTime = Date.now();
						const oneWayLatency = receivedTime - sentTime;
						console.log('One-Way Latency:', oneWayLatency, 'ms');
					};
				};

				pc.ontrack = (e) => {
					console.log('dedicated ontrack success');
					setSelectedDedicatedUser({ id: socketID, stream: e.streams[0] });
				};
				const testDC = pc.createDataChannel('testChannel');
				console.log('created dc');
				testDC.onopen = () => console.log('data channel opened');

				return pc;
			} catch (e) {
				console.error(e);
				return undefined;
			}
		},
		[],
	);

	const createDedicatedReceiverOffer = useCallback(
		async (pc: RTCPeerConnection, senderSocketID: string) => {
			try {
				const sdp = await pc.createOffer({
					offerToReceiveAudio: true,
					offerToReceiveVideo: true,
				});
				console.log('create dedicated receiver offer success');
				await pc.setLocalDescription(new RTCSessionDescription(sdp));

				if (!localDedicatedSocketRef.current) return;
				localDedicatedSocketRef.current.emit('receiverOffer', {
					sdp,
					receiverSocketID: localDedicatedSocketRef.current.id,
					senderSocketID,
					roomID: '1234',
				});
			} catch (error) {
				console.log(error);
			}
		},
		[],
	);

	const createDedicatedReceivePC = useCallback(
		(id: string) => {
			try {
				console.log(`socketID(${id}) is selected`);
				const pc = createDedicatedReceiverPeerConnection(id);
				if (!(localDedicatedSocketRef.current && pc)) return;
				createDedicatedReceiverOffer(pc, id);
			} catch (error) {
				console.log(error);
			}
		},
		[createDedicatedReceiverOffer, createDedicatedReceiverPeerConnection],
	);

	const closeReceivePC = useCallback((id: string) => {
		if (!thumbnailReceivePCsRef.current[id]) return;
		thumbnailReceivePCsRef.current[id].close();
		delete thumbnailReceivePCsRef.current[id];
	}, []);

	const createReceiverOffer = useCallback(
		async (pc: RTCPeerConnection, senderSocketID: string) => {
			try {
				const sdp = await pc.createOffer({
					offerToReceiveAudio: true,
					offerToReceiveVideo: true,
				});
				console.log('create receiver offer success');
				await pc.setLocalDescription(new RTCSessionDescription(sdp));

				if (!localThumbnailSocketRef.current) return;
				localThumbnailSocketRef.current.emit('receiverOffer', {
					sdp,
					receiverSocketID: localThumbnailSocketRef.current.id,
					senderSocketID,
					roomID: '1234',
				});
			} catch (error) {
				console.log(error);
			}
		},
		[],
	);

	const createReceiverPeerConnection = useCallback((socketID: string) => {
		try {
			const pc = new RTCPeerConnection(pc_config);

			// add pc to peerConnections object
			thumbnailReceivePCsRef.current = {
				...thumbnailReceivePCsRef.current,
				[socketID]: pc,
			};

			pc.onicecandidate = (e) => {
				if (!(e.candidate && localThumbnailSocketRef.current)) return;
				console.log('receiver PC onicecandidate');
				localThumbnailSocketRef.current.emit('receiverCandidate', {
					candidate: e.candidate,
					receiverSocketID: localThumbnailSocketRef.current.id,
					senderSocketID: socketID,
				});
			};

			pc.oniceconnectionstatechange = (e) => {
				console.log(e);
			};

			pc.ontrack = (e) => {
				console.log('ontrack success');
				setThumbnailUsers((oldUsers) =>
					oldUsers
						.filter((user) => user.id !== socketID)
						.concat({
							id: socketID,
							stream: e.streams[0],
						}),
				);
			};

			return pc;
		} catch (e) {
			console.error(e);
			return undefined;
		}
	}, []);

	const createReceivePC = useCallback(
		(id: string) => {
			try {
				console.log(`socketID(${id}) user entered`);
				const pc = createReceiverPeerConnection(id);
				if (!(localThumbnailSocketRef.current && pc)) return;
				createReceiverOffer(pc, id);
			} catch (error) {
				console.log(error);
			}
		},
		[createReceiverOffer, createReceiverPeerConnection],
	);

	const createSenderOffer = useCallback(async () => {
		console.log('Create sender offer run');
		try {
			if (!thumbnailSendPCRef.current || !dedicatedSendPCRef.current) return;
			const thumbnailSdp = await thumbnailSendPCRef.current.createOffer({
				offerToReceiveAudio: false,
				offerToReceiveVideo: false,
			});
			const dedicatedSdp = await dedicatedSendPCRef.current.createOffer({
				offerToReceiveAudio: false,
				offerToReceiveVideo: false,
			});

			console.log('create sender offer success');

			await thumbnailSendPCRef.current.setLocalDescription(
				new RTCSessionDescription(thumbnailSdp),
			);
			await dedicatedSendPCRef.current.setLocalDescription(
				new RTCSessionDescription(dedicatedSdp),
			);

			if (!localThumbnailSocketRef.current) return;
			console.log(`Socket ID => ${localThumbnailSocketRef.current.id}`);
			localThumbnailSocketRef.current.emit('senderOffer', {
				sdp: thumbnailSdp,
				senderSocketID: localThumbnailSocketRef.current.id,
				roomID: '1234',
			});

			if (!localDedicatedSocketRef.current) return;
			localDedicatedSocketRef.current.emit('senderOffer', {
				sdp: dedicatedSdp,
				senderSocketID: localDedicatedSocketRef.current.id,
				thumbnailSocketID: localThumbnailSocketRef.current.id,
				roomID: '1234',
			});
		} catch (error) {
			console.log(error);
		}
	}, []);

	const createSenderPeerConnection = useCallback(() => {
		const thumbnailPc = new RTCPeerConnection(pc_config);
		const dedicatedPc = new RTCPeerConnection(pc_config);

		thumbnailPc.onicecandidate = (e) => {
			if (!(e.candidate && localThumbnailSocketRef.current)) return;
			console.log('sender thumbnail PC onicecandidate');
			localThumbnailSocketRef.current.emit('senderCandidate', {
				candidate: e.candidate,
				senderSocketID: localThumbnailSocketRef.current.id,
			});
		};
		dedicatedPc.onicecandidate = (e) => {
			if (!(e.candidate && localDedicatedSocketRef.current)) return;
			console.log('sender dedicated PC onicecandidate');
			localDedicatedSocketRef.current.emit('senderCandidate', {
				candidate: e.candidate,
				senderSocketID: localDedicatedSocketRef.current.id,
			});
		};

		thumbnailPc.oniceconnectionstatechange = (e) => {
			console.log(e);
		};
		dedicatedPc.oniceconnectionstatechange = (e) => {
			console.log(e);
		};

		if (localThumbnailStreamRef.current && localDedicatedStreamRef.current) {
			console.log('adding local stream');
			localThumbnailStreamRef.current.getTracks().forEach((track) => {
				if (!localThumbnailStreamRef.current) return;
				thumbnailPc.addTrack(track, localThumbnailStreamRef.current);
			});
			localDedicatedStreamRef.current.getTracks().forEach((track) => {
				if (!localDedicatedStreamRef.current) return;
				dedicatedPc.addTrack(track, localDedicatedStreamRef.current);
			});
		} else {
			console.log('no local stream found');
		}

		const latencyDataChannel = dedicatedPc.createDataChannel('latencyTest');
		setInterval(() => {
			const timestamp = Date.now();
			console.log(`Timestamp: ${timestamp}`);
			console.log(`State: ${latencyDataChannel.readyState}`);
			latencyDataChannel.send(timestamp.toString());
		}, 1000);

		thumbnailSendPCRef.current = thumbnailPc;
		dedicatedSendPCRef.current = dedicatedPc;
	}, [localThumbnailStreamRef, localDedicatedStreamRef]);

	const injectLocalStream = useCallback(async () => {
		console.log('injectLocalStream is called');

		try {
			if (stream && isOnline) {
				while (stream.getTracks().length == 0) {
					await new Promise((resolve) => setTimeout(resolve, 100)); // 100ms delay
				}
				// const thumbnailStream = await createStreamWithConstraints(stream, {
				// width: 240,
				// height: { min: 240 },
				// frameRate: { max: 50 },
				// });

				// const highQualityStream = await createStreamWithConstraints(stream, {
				// width: 1000,
				// height: 1000,
				// });

				localThumbnailStreamRef.current = stream;
				if (localThumbnailVideoRef.current) {
					console.log('local thumbnail video ref found');
					localThumbnailVideoRef.current.srcObject = stream;
				}

				localDedicatedStreamRef.current = stream;
				if (localDedicatedVideoRef.current) {
					localDedicatedVideoRef.current.srcObject = stream;
				}
			}
		} catch (e) {
			console.error(`injectLocalStream error: ${e}`);
		}
	}, [stream, isOnline]);

	const getLocalStream = useCallback(async () => {
		try {
			await injectLocalStream();

			while (
				!localThumbnailSocketRef.current ||
				!localDedicatedSocketRef.current ||
				localThumbnailSocketRef.current.id === undefined ||
				localDedicatedSocketRef.current.id === undefined
			) {
				await new Promise((resolve) => setTimeout(resolve, 100)); // 100ms delay
			}
			console.log('before create sender peer');
			console.log(`Thumbnail Socket => ${localThumbnailSocketRef.current.id}`);
			console.log(`Dedicated Socket => ${localDedicatedSocketRef.current.id}`);

			createSenderPeerConnection();
			await createSenderOffer();

			localThumbnailSocketRef.current.emit('joinRoom', {
				id: localThumbnailSocketRef.current.id,
				roomID: '1234',
			});
		} catch (e) {
			console.log(`getLocalStream error: ${e}`);
		}
	}, [createSenderOffer, createSenderPeerConnection, injectLocalStream]);

	useEffect(() => {
		if (!stream || !isOnline) return;
		console.log('Main useEffect run');
		localThumbnailSocketRef.current = io(SOCKET_THUMBNAIL_SERVER_URL);
		localDedicatedSocketRef.current = io(SOCKET_DEDICATED_SERVER_URL);
		getLocalStream();

		while (
			!localThumbnailSocketRef.current ||
			!localDedicatedSocketRef.current
		) {
			console.log('Not Ready');
		}

		localThumbnailSocketRef.current.on('userEnter', (data: { id: string }) => {
			console.log('New user entered');
			createReceivePC(data.id);
		});

		localThumbnailSocketRef.current.on(
			'allUsers',
			(data: { users: Array<{ id: string }> }) => {
				data.users.forEach((user) => createReceivePC(user.id));
			},
		);

		localThumbnailSocketRef.current.on('userExit', (data: { id: string }) => {
			closeReceivePC(data.id);
			setThumbnailUsers((users) => users.filter((user) => user.id !== data.id));
		});

		localThumbnailSocketRef.current.on(
			'getSenderAnswer',
			async (data: { sdp: RTCSessionDescription }) => {
				try {
					if (!thumbnailSendPCRef.current) return;
					console.log('get sender answer');
					console.log(data.sdp);
					await thumbnailSendPCRef.current.setRemoteDescription(
						new RTCSessionDescription(data.sdp),
					);
				} catch (error) {
					console.log(error);
				}
			},
		);

		localDedicatedSocketRef.current.on(
			'getSenderAnswer',
			async (data: { sdp: RTCSessionDescription }) => {
				try {
					if (!dedicatedSendPCRef.current) return;
					console.log('get dedicated sender answer');
					console.log(data.sdp);
					await dedicatedSendPCRef.current.setRemoteDescription(
						new RTCSessionDescription(data.sdp),
					);
				} catch (error) {
					console.log(error);
				}
			},
		);

		localThumbnailSocketRef.current.on(
			'getSenderCandidate',
			async (data: { candidate: RTCIceCandidateInit }) => {
				try {
					if (!(data.candidate && thumbnailSendPCRef.current)) return;
					console.log('get sender candidate');
					await thumbnailSendPCRef.current.addIceCandidate(
						new RTCIceCandidate(data.candidate),
					);
					console.log('candidate add success');
				} catch (error) {
					console.log(error);
				}
			},
		);

		localDedicatedSocketRef.current.on(
			'getSenderCandidate',
			async (data: { candidate: RTCIceCandidateInit }) => {
				try {
					console.log(`Sender candidate data: ${data}`);
					if (!(data.candidate && dedicatedSendPCRef.current)) return;
					console.log('get dedicated sender candidate');
					await dedicatedSendPCRef.current.addIceCandidate(
						new RTCIceCandidate(data.candidate),
					);
					console.log('dedicated candidate add success');
				} catch (error) {
					console.log(error);
				}
			},
		);

		localThumbnailSocketRef.current.on(
			'getReceiverAnswer',
			async (data: { id: string; sdp: RTCSessionDescription }) => {
				try {
					console.log(`get socketID(${data.id})'s answer`);
					const pc: RTCPeerConnection = thumbnailReceivePCsRef.current[data.id];
					if (!pc) return;
					await pc.setRemoteDescription(data.sdp);
					console.log(`socketID(${data.id})'s set remote sdp success`);
				} catch (error) {
					console.log(error);
				}
			},
		);

		localDedicatedSocketRef.current.on(
			'getReceiverAnswer',
			async (data: { id: string; sdp: RTCSessionDescription }) => {
				try {
					console.log(`get dedicated socketID(${data.id})'s answer`);
					const pc = dedicatedReceivePCRef.current;
					if (!pc) return;
					await pc.setRemoteDescription(data.sdp);
					console.log(
						`dedicated socketID(${data.id})'s set remote sdp success`,
					);
				} catch (error) {
					console.log(error);
				}
			},
		);

		localThumbnailSocketRef.current.on(
			'getReceiverCandidate',
			async (data: { id: string; candidate: RTCIceCandidateInit }) => {
				try {
					console.log(data);
					console.log(`get socketID(${data.id})'s candidate`);
					const pc: RTCPeerConnection = thumbnailReceivePCsRef.current[data.id];
					if (!(pc && data.candidate)) return;
					await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
					console.log(`socketID(${data.id})'s candidate add success`);
				} catch (error) {
					console.log(error);
				}
			},
		);

		localDedicatedSocketRef.current.on(
			'getReceiverCandidate',
			async (data: { id: string; candidate: RTCIceCandidateInit }) => {
				try {
					console.log(data);
					console.log(`get dedicated socketID(${data.id})'s candidate`);
					const pc = dedicatedReceivePCRef.current;
					if (!pc) console.log('here');
					if (!(pc && data.candidate)) {
						return;
					}
					await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
					console.log(`socketID(${data.id})'s candidate add success`);
				} catch (error) {
					console.log(error);
				}
			},
		);

		return () => {
			// Cleanup connections
			if (localThumbnailSocketRef.current) {
				localThumbnailSocketRef.current.disconnect();
			}
			if (thumbnailSendPCRef.current) {
				thumbnailSendPCRef.current.close();
			}

			if (localDedicatedSocketRef.current) {
				localDedicatedSocketRef.current.disconnect();
			}
			if (dedicatedSendPCRef.current) {
				dedicatedSendPCRef.current.close();
			}

			thumbnailUsers.forEach((user) => closeReceivePC(user.id));
			if (dedicatedReceivePCRef.current) {
				dedicatedReceivePCRef.current.close();
			}
		};
		// eslint-disable-next-line
	}, [
		closeReceivePC,
		createReceivePC,
		getLocalStream,
		createSenderOffer,
		createSenderPeerConnection,
		isOnline,
		stream,
	]);

	useEffect(() => {
		console.log('Effect for injectLocalStream');
		injectLocalStream();
	}, [injectLocalStream, selectedDedicatedUser]);

	useEffect(() => {
		if (!stream) return;

		const updateTracks = () => {
			setTrackCount(stream.getVideoTracks().length);
			console.log('Setting new track count');
		};

		const interval = setInterval(updateTracks, 500); // Poll every 500ms

		return () => clearInterval(interval);
	}, [stream]);

	return (
		<div className="bg-light_grey">
			{selectedDedicatedUser === null ? (
				<div>
					<ThumbnailVideoView
						thumbnailUsers={thumbnailUsers}
						localThumbnailVideoRef={localThumbnailVideoRef}
						onVideoClick={createDedicatedReceivePC}
					/>
					<div className="px-4 py-2  rounded-lg hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-300">
						<Button
							iconName={IconName.Back}
							onClick={() => router.push('/dashboard')}
						/>
					</div>
				</div>
			) : (
				<div>
					<DedicatedVideoView
						selectedUser={selectedDedicatedUser}
						onBack={handleBackFromDedicatedView}
					/>
					<div className="px-4 py-2  rounded-lg hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-300">
						<Button
							iconName={IconName.Back}
							onClick={handleBackFromDedicatedView}
						/>
					</div>
				</div>
			)}
		</div>
	);
}
