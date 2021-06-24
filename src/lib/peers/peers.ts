import LogLevel from "../logger/logLevel";
import Logger from "../logger/logger";
import { RoomInfoMessage } from "#/lib/data/messaging/signalingMessage";
import PeerEventManager from "#/lib/peers/peerEventManager/peerEventManager";
import PeerManager from "#/lib/peers/peerManager/peerManager";
import SignalingEventManger from "#/lib/signaling/signalingEventManager/signalingEventManager";
import SignalingManager from "#/lib/signaling/signalingManager/signalingManager";

export default class Peers {
  private peerManager: PeerManager;

  private peerEventManager: PeerEventManager;

  private signalingManager: SignalingManager;

  private signalingEventManager: SignalingEventManger;

  private roomId: string | null = null;

  public RoomJoined = () => this.roomId !== null;

  public MediaModels() {
    return this.peerManager.Peers().map((x) => x.MediaModel());
  }

  public LocalStream = () => this.peerManager.LocalStream();

  public setLogLevel = (level: LogLevel) => Logger.setup(level);

  constructor(userId: string, iceServers: RTCIceServer[] | undefined) {
    this.peerManager = new PeerManager(iceServers);
    this.signalingManager = new SignalingManager();
    this.peerEventManager = new PeerEventManager(
      userId,
      this.peerManager,
      this.signalingManager
    );
    this.signalingEventManager = new SignalingEventManger(
      userId,
      this.peerManager
    );
    this.peerManager.peerDelegate = this.peerEventManager;
    this.signalingManager.delegate = this.signalingEventManager;
  }

  public setupConnection(uri: string) {
    this.signalingManager.setupWebSocket(uri);
  }

  public destroy = () => {
    if (this.signalingManager.socket) {
      this.signalingManager.socket.disconnect();
    }
    this.signalingManager.socket = null;
    Logger.logger().info("peers", "peers destroyed");
  };

  public addLocalStream = (stream: MediaStream) => {
    this.peerManager.setupLocalStream(stream);
  };

  public joinRoom = (roomId: string, userId: string) => {
    const roomInfo: RoomInfoMessage = {
      data: {
        roomId,
        userId,
      },
    };
    this.signalingManager.socket?.emit(
      "joinRoom",
      roomInfo,
      (evt: RoomInfoMessage) => {
        if (evt) {
          this.roomId = evt.data.roomId;
          Logger.logger().info("peers", "room joined", [evt.data.roomId]);

          if (this.peerManager.LocalClient()) {
            this.signalingManager.emitLocalMediaStatus(
              this.peerManager.LocalClient()!.MediaModel()
            );
            this.signalingManager.callToOthers(this.roomId);
          }
        }
      }
    );
  };

  public toggleLocalAudioMute = () =>
    this.peerManager.LocalClient()?.toggleLocalAudioMute();

  public toggleLocalVideoMute = () =>
    this.peerManager.LocalClient()?.tollgleLocalVideoMute();

  public enableLocalAudio = () =>
    this.peerManager.LocalClient()?.enableLocalAudio();

  public disableLocalAudio = () =>
    this.peerManager.LocalClient()?.disableLocalAudio();

  public enableLocalVideo = () =>
    this.peerManager.LocalClient()?.enableLocalVideo();

  public disableLocalVideo = () =>
    this.peerManager.LocalClient()?.disableLocalVideo();
}
