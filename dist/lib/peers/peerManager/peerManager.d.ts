import { SignalingMessage, CandidateMessage, MediaStatusMessage } from "#/lib/data/messaging/signalingMessage";
import Peer from "#/lib/peers/peer/peer";
import PeerDelegate from "#/lib/peers/peer/peerDelegate";
export default class PeerManager {
    private peers;
    private iceServers;
    constructor(iceServers: RTCIceServer[] | undefined);
    Peers(): Peer[];
    LocalClient: () => Peer | undefined;
    private localStream;
    LocalStream: () => MediaStream | null;
    setupLocalStream: (stream: MediaStream) => void;
    peerDelegate?: PeerDelegate;
    createLocalClient: (id: string, userId: string) => void;
    handleCall: (ids: string[], userId: string) => Promise<void>;
    handleRemoteOffer: (message: SignalingMessage) => void;
    handleRemoteAnswer: (message: SignalingMessage) => void;
    handleRemoteCandidate: (message: CandidateMessage) => void;
    handleRemoteDisconnected: (id: string) => void;
    handleRemoteMediaUpdated: (message: MediaStatusMessage) => void;
}
