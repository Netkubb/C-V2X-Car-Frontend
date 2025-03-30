export enum SOCKET_EMIT_ENUM {
	JOIN_ROOM = 'join-room',
	SENDER_OFFER = 'sender-offer',
	SENDER_CANDIDATE = 'sender-candidate',
	RECEIVER_OFFER = 'receiver-offer',
	RECEIVER_CANDIDATE = 'receiver-candidate',
	CONNECTION = 'connection',
	DISCONNECT = 'disconnect',
}

export enum SOCKET_ON_ENUM {
	GET_SENDER_CANDIDATE = 'get-sender-candidate',
	GET_SENDER_ANSWER = 'get-sender-answer',
	USER_ENTER = 'user-enter',
	USER_EXIT = 'user-exit',
	GET_RECEIVER_CANDIDATE = 'get-receiver-candidate',
	GET_RECEIVER_ANSWER = 'get-receiver-answer',
	ALL_USERS = 'all-users',
	ERROR = 'error',
}
