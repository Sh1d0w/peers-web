export default class RtcMediaModel {
    isLocal: boolean;
    stream?: MediaStream;
    id: string;
    isAudioMuted: boolean;
    isVideoMuted: boolean;
    userId: string | null;
    constructor(id: string, isLocal: boolean, isAudioMuted: boolean, isVideoMuted: boolean, userId: string | null);
}
