import PeerDelegate from "./peerDelegate";
import RtcMediaModel from "#/lib/data/mediaModel/rtcMeidaModel";
import { MediaStatusMessage } from "#/lib/data/messaging/signalingMessage";
import Logger from "#/lib/logger/logger";

export default class Peer {
  public Id = () => this.mediaModel.id;

  public MediaModel() {
    return this.mediaModel;
  }

  private peerConnection?: RTCPeerConnection;

  private delegate: PeerDelegate;

  private mediaModel: RtcMediaModel;

  private rtpSender: RTCRtpSender[] = [];

  private localStream: MediaStream | null = null;

  private iceServers: RTCIceServer[] | undefined;

  constructor(
    id: string,
    isLocal: boolean,
    userId: string,
    iceServers: RTCIceServer[] | undefined,
    delegate: PeerDelegate
  ) {
    this.delegate = delegate;
    this.iceServers = iceServers;
    this.mediaModel = new RtcMediaModel(id, isLocal, false, false, userId);
    this.peerConnection = this.settupPeerConntection();
  }

  private settupPeerConntection = () => {
    const pcConfig: RTCConfiguration = {
      iceServers: this.iceServers,
    };

    const pc = new RTCPeerConnection(pcConfig);
    pc.ontrack = (evt) => {
      const stream = evt.streams[0];
      const model = new RtcMediaModel(
        this.mediaModel.id,
        this.mediaModel.isLocal,
        this.mediaModel.isAudioMuted,
        this.mediaModel.isVideoMuted,
        this.mediaModel.userId
      );
      model.stream = stream;
      this.mediaModel = model;
      this.delegate.OnAddTrack(this.Id(), evt);
    };
    pc.onicecandidate = (evt) => {
      if (evt.candidate != null) {
        this.delegate.OnCandidateCreated(this.Id(), evt.candidate);
      }
    };
    pc.oniceconnectionstatechange = () => {
      switch (pc.iceConnectionState) {
        case "failed":
        case "closed":
        case "disconnected":
          if (this.peerConnection) {
            pc.close();
            this.peerConnection = undefined;
            this.delegate.OnDisconnected(this.Id());
          }
          break;
        default:
          break;
      }
    };
    return pc;
  };

  public addLocalStream = (stream: MediaStream) => {
    this.localStream = stream;
    if (this.mediaModel.isLocal) {
      this.mediaModel.stream = stream;
    }
    stream
      .getTracks()
      .forEach((track) =>
        this.rtpSender.push(this.peerConnection!.addTrack(track, stream))
      );
  };

  public createOfferAsync = async () => {
    if (this.peerConnection === undefined) {
      return;
    }
    try {
      const sdp = await this.peerConnection!.createOffer();
      this.peerConnection!.setLocalDescription(sdp);
      this.delegate.OnSdpCreated(this.Id(), sdp);
    } catch (err) {
      Logger.logger().error("peer", "error to create offer", err);
    }
  };

  public createAnswerAsync = async () => {
    if (this.peerConnection === undefined) {
      return;
    }
    try {
      const sdp = await this.peerConnection!.createAnswer();
      this.peerConnection.setLocalDescription(sdp);
      this.delegate.OnSdpCreated(this.Id(), sdp);
    } catch (err) {
      Logger.logger().error("peer", "error to create answer", err);
    }
  };

  public setRemoteSdpAsync = async (remoteSdp: RTCSessionDescriptionInit) => {
    Logger.logger().info("peer", "set remote sdp");
    if (this.peerConnection === undefined) {
      return;
    }
    try {
      await this.peerConnection!.setRemoteDescription(remoteSdp);
      if (remoteSdp.type === "offer") {
        await this.createAnswerAsync();
      }
    } catch (err) {
      Logger.logger().error("peer", "set remote sdp error", err);
    }
  };

  public setRemoteCandidate = async (candidate: RTCIceCandidate) => {
    if (this.peerConnection === undefined) {
      return;
    }
    try {
      await this.peerConnection!.addIceCandidate(candidate);
    } catch (err) {
      Logger.logger().error("peer", "set remote candidate", err);
    }
  };

  public onRemoteVideoMuted() {
    this.mediaModel.isVideoMuted = true;
  }

  public onRemoteVideoUnmuted() {
    this.mediaModel.isVideoMuted = false;
  }

  public onRemoteAudioMuted() {
    this.mediaModel.isAudioMuted = true;
  }

  public onRemtoeAudioUnmuted() {
    this.mediaModel.isAudioMuted = false;
  }

  public onRemoteMediaStatusUpdated = (message: MediaStatusMessage) => {
    this.mediaModel.isAudioMuted = message.data.isAudioMute;
    this.mediaModel.isVideoMuted = message.data.isVideoMute;
  };

  public toggleLocalAudioMute = () => {
    this.mediaModel.isAudioMuted = !this.mediaModel.isAudioMuted;
    this.mediaModel.stream!.getAudioTracks()[0].enabled = !this.mediaModel
      .isAudioMuted;
    this.delegate.OnMediaStatusUpdated(this.Id(), this.mediaModel);
  };

  public enableLocalAudio = () => {
    this.mediaModel.isAudioMuted = false;
    this.mediaModel.stream!.getAudioTracks()[0].enabled = true;
    this.delegate.OnMediaStatusUpdated(this.Id(), this.mediaModel);
  };

  public disableLocalAudio = () => {
    this.mediaModel.isAudioMuted = true;
    this.mediaModel.stream!.getAudioTracks()[0].enabled = false;
    this.delegate.OnMediaStatusUpdated(this.Id(), this.mediaModel);
  };

  public tollgleLocalVideoMute = () => {
    this.mediaModel.isVideoMuted = !this.mediaModel.isVideoMuted;
    this.mediaModel.stream!.getVideoTracks()[0].enabled = !this.mediaModel
      .isVideoMuted;
    this.delegate.OnMediaStatusUpdated(this.Id(), this.mediaModel);
  };

  public enableLocalVideo = () => {
    this.mediaModel.isVideoMuted = false;
    this.mediaModel.stream!.getVideoTracks()[0].enabled = true;
    this.delegate.OnMediaStatusUpdated(this.Id(), this.mediaModel);
  };

  public disableLocalVideo = () => {
    this.mediaModel.isVideoMuted = true;
    this.mediaModel.stream!.getVideoTracks()[0].enabled = false;
    this.delegate.OnMediaStatusUpdated(this.Id(), this.mediaModel);
  };
}
