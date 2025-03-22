type StreamConfigType = {
	sfuServerUrl: string;
	converterServerUrl: string;
	pcConfig: RTCConfiguration;
	camSUUIDs: string[];
};

export const StreamConfig: StreamConfigType = {
	sfuServerUrl: 'http://localhost:8080',
	converterServerUrl: 'http://localhost:8083',
	camSUUIDs: ['my_suuid'],
	pcConfig: {
		iceServers: [
			{
				urls: 'stun:stun.l.google.com:19302',
			},
		],
	},
};
