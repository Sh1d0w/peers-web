export default class RtcMediaModel {
  isLocal: boolean;

  stream?: MediaStream;

  id: string;

  isAudioMuted: boolean;

  isVideoMuted: boolean;

  userId: string | null;

  constructor(
    id: string,
    isLocal: boolean,
    isAudioMuted: boolean,
    isVideoMuted: boolean,
    userId: string | null
  ) {
    this.id = id;
    this.isLocal = isLocal;
    this.isAudioMuted = isAudioMuted;
    this.isVideoMuted = isVideoMuted;
    this.userId = userId;
  }
}
