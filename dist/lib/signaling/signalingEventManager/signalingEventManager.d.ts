import PeerManager from "../../peers/peerManager/peerManager";
import SignalingDelegate from "../signalingManager/signalingDelegate";
import { SignalingMessage, CandidateMessage, MediaStatusMessage } from "#/lib/data/messaging/signalingMessage";
export default class SignalingEventManger implements SignalingDelegate {
    private peerManager;
    private userId;
    constructor(userId: string, peerManager: PeerManager);
    onConnected(id: string): void;
    onRemoteOffer(message: SignalingMessage): void;
    onRemoteAnswer(message: SignalingMessage): void;
    onRemoteCandidate(message: CandidateMessage): void;
    onRemoteDisconnected(id: string): void;
    onRemoteMediaStatusUpdated(message: MediaStatusMessage): void;
    onCall: (users: Array<{
        id: string;
        userId: string;
    }>) => void;
}
