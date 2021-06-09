import PeerManager from "../../peers/peerManager/peerManager";
import SignalingDelegate from "../signalingManager/signalingDelegate";
import {
  SignalingMessage,
  CandidateMessage,
  MediaStatusMessage,
} from "#/lib/data/messaging/signalingMessage";

export default class SignalingEventManger implements SignalingDelegate {
  private peerManager: PeerManager;

  private userId: string;

  constructor(userId: string, peerManager: PeerManager) {
    this.peerManager = peerManager;
    this.userId = userId;
  }

  onConnected(id: string): void {
    this.peerManager.createLocalClient(id, this.userId);
  }

  onRemoteOffer(message: SignalingMessage): void {
    this.peerManager.handleRemoteOffer(message);
  }

  onRemoteAnswer(message: SignalingMessage): void {
    this.peerManager.handleRemoteAnswer(message);
  }

  onRemoteCandidate(message: CandidateMessage): void {
    this.peerManager.handleRemoteCandidate(message);
  }

  onRemoteDisconnected(id: string): void {
    this.peerManager.handleRemoteDisconnected(id);
  }

  onRemoteMediaStatusUpdated(message: MediaStatusMessage): void {
    this.peerManager.handleRemoteMediaUpdated(message);
  }

  onCall = (ids: string[]) => {
    this.peerManager.handleCall(ids, this.userId);
  };
}
