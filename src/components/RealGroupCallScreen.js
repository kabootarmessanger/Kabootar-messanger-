"use client";
import { useEffect, useRef, useState } from "react";
import {
  ICE_SERVERS, createGroupCallDoc, listenToCall, markJoined, markLeft,
  listenToJoined, pairKey, listenToPair, setPairOffer, setPairAnswer,
  addPairCandidate, listenToPairCandidates
} from "@/lib/realCall";
import Avatar from "./Avatar";

// isStarter + starterInfo ({ participants, participantInfo, type, name }):
// only needed by whoever taps the call button first — they create the call
// doc. Everyone else (joining from the incoming-call banner) just needs
// callId; the call doc itself carries participants/type/name for them.
//
// Note: this is a mesh call (every participant connects directly to every
// other), which keeps things backend-free but doesn't scale — fine for a
// small group (≈4 people), but bandwidth/CPU cost grows fast beyond that.
export default function RealGroupCallScreen({ callId, myUid, myName, isStarter, starterInfo, onEnd }) {
  const [call, setCall] = useState(null);
  const [peerUids, setPeerUids] = useState([]);
  const [status, setStatus] = useState("connecting");
  const [muted, setMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);
  const localVideoRef = useRef(null);
  const remoteVideoRefs = useRef({});
  const localStreamRef = useRef(null);
  const pcsRef = useRef({});
  const remoteStreams = useRef({});
  const connectedPeers = useRef(new Set());
  const unsubs = useRef([]);
  const ended = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const cleanup = () => {
      unsubs.current.forEach((u) => u && u());
      unsubs.current = [];
      Object.values(pcsRef.current).forEach((pc) => pc.close());
      pcsRef.current = {};
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
    };

    const leave = async () => {
      if (ended.current) return;
      ended.current = true;
      cleanup();
      await markLeft(callId, myUid);
      onEnd();
    };

    const connectToPeer = (peerUid) => {
      if (peerUid === myUid || connectedPeers.current.has(peerUid)) return;
      connectedPeers.current.add(peerUid);
      setPeerUids((p) => [...p, peerUid]);

      const pc = new RTCPeerConnection(ICE_SERVERS);
      pcsRef.current[peerUid] = pc;
      localStreamRef.current.getTracks().forEach((track) => pc.addTrack(track, localStreamRef.current));

      const remoteStream = new MediaStream();
      remoteStreams.current[peerUid] = remoteStream;
      pc.ontrack = (e) => {
        e.streams[0].getTracks().forEach((t) => remoteStream.addTrack(t));
        const el = remoteVideoRefs.current[peerUid];
        if (el) el.srcObject = remoteStream;
      };
      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "connected") setStatus("connected");
      };

      const pid = pairKey(myUid, peerUid);
      const amOfferer = myUid < peerUid;

      if (amOfferer) {
        pc.onicecandidate = (e) => { if (e.candidate) addPairCandidate(callId, pid, "offerCandidates", e.candidate); };
        pc.createOffer()
          .then((offerDesc) => pc.setLocalDescription(offerDesc).then(() => offerDesc))
          .then((offerDesc) => setPairOffer(callId, pid, { type: offerDesc.type, sdp: offerDesc.sdp }));
        unsubs.current.push(
          listenToPair(callId, pid, async (data) => {
            if (data?.answer && !pc.currentRemoteDescription) {
              await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
            }
          })
        );
        unsubs.current.push(
          listenToPairCandidates(callId, pid, "answerCandidates", (c) => pc.addIceCandidate(new RTCIceCandidate(c)).catch(() => {}))
        );
      } else {
        pc.onicecandidate = (e) => { if (e.candidate) addPairCandidate(callId, pid, "answerCandidates", e.candidate); };
        unsubs.current.push(
          listenToPair(callId, pid, async (data) => {
            if (data?.offer && !pc.currentRemoteDescription) {
              await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
              const answerDesc = await pc.createAnswer();
              await pc.setLocalDescription(answerDesc);
              await setPairAnswer(callId, pid, { type: answerDesc.type, sdp: answerDesc.sdp });
            }
          })
        );
        unsubs.current.push(
          listenToPairCandidates(callId, pid, "offerCandidates", (c) => pc.addIceCandidate(new RTCIceCandidate(c)).catch(() => {}))
        );
      }
    };

    const disconnectPeer = (peerUid) => {
      pcsRef.current[peerUid]?.close();
      delete pcsRef.current[peerUid];
      delete remoteStreams.current[peerUid];
      connectedPeers.current.delete(peerUid);
      setPeerUids((p) => p.filter((u) => u !== peerUid));
    };

    const setup = async () => {
      if (isStarter) {
        await createGroupCallDoc(callId, {
          starterId: myUid,
          participants: starterInfo.participants,
          participantInfo: starterInfo.participantInfo,
          type: starterInfo.type,
          name: starterInfo.name
        });
      }

      let resolveCall;
      const callPromise = new Promise((res) => { resolveCall = res; });
      let resolved = false;
      unsubs.current.push(
        listenToCall(callId, (c) => {
          if (cancelled) return;
          setCall(c);
          if (!resolved && c) { resolved = true; resolveCall(c); }
          if (c?.status === "ended") leave();
        })
      );

      const callData = await callPromise;
      if (cancelled) return;

      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: callData.type !== "audio" });
      } catch {
        setStatus("error");
        return;
      }
      if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      await markJoined(callId, myUid, myName);
      unsubs.current.push(listenToJoined(callId, connectToPeer, disconnectPeer));
    };

    setup();

    return () => {
      cancelled = true;
      if (!ended.current) {
        markLeft(callId, myUid);
        cleanup();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleHangup = () => {
    if (ended.current) return;
    ended.current = true;
    unsubs.current.forEach((u) => u && u());
    Object.values(pcsRef.current).forEach((pc) => pc.close());
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    markLeft(callId, myUid);
    onEnd();
  };

  const toggleMute = () => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (track) { track.enabled = !track.enabled; setMuted(!track.enabled); }
  };
  const toggleCam = () => {
    const track = localStreamRef.current?.getVideoTracks()[0];
    if (track) { track.enabled = !track.enabled; setCamOff(!track.enabled); }
  };

  const isVideo = call?.type !== "audio";
  const peerName = (uid) => call?.participantInfo?.[uid]?.name || "…";

  return (
    <div className="absolute inset-0 z-[600] bg-black flex flex-col">
      <div className="pt-[max(1rem,env(safe-area-inset-top))] px-4 text-center text-white z-10">
        <div className="text-lg font-semibold">{call?.name || "Group Call"}</div>
        <div className="text-sm text-white/70">
          {status === "connecting" && "Connecting…"}
          {status === "connected" && `${peerUids.length + 1} in call`}
          {status === "error" && "Camera/mic access denied"}
        </div>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-1.5 p-2 content-start overflow-y-auto">
        <div className="relative bg-[#1a2a35] rounded-xl min-h-[130px] flex items-center justify-center overflow-hidden">
          {isVideo ? (
            <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          ) : (
            <Avatar name={myName} size={56} />
          )}
          <div className="absolute bottom-1.5 left-1.5 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full">You</div>
        </div>
        {peerUids.map((uid) => (
          <div key={uid} className="relative bg-[#1a2a35] rounded-xl min-h-[130px] flex items-center justify-center overflow-hidden">
            {isVideo ? (
              <video ref={(el) => { if (el) { remoteVideoRefs.current[uid] = el; if (remoteStreams.current[uid]) el.srcObject = remoteStreams.current[uid]; } }} autoPlay playsInline className="w-full h-full object-cover" />
            ) : (
              <Avatar name={peerName(uid)} size={56} />
            )}
            <div className="absolute bottom-1.5 left-1.5 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full">{peerName(uid)}</div>
          </div>
        ))}
      </div>

      <div className="pb-[max(2rem,env(safe-area-inset-bottom))] flex items-center justify-center gap-5 z-10 pt-3">
        <button onClick={toggleMute} className={`w-14 h-14 rounded-full flex items-center justify-center text-xl ${muted ? "bg-white text-black" : "bg-white/20 text-white"}`}>
          {muted ? "🔇" : "🎤"}
        </button>
        {isVideo && (
          <button onClick={toggleCam} className={`w-14 h-14 rounded-full flex items-center justify-center text-xl ${camOff ? "bg-white text-black" : "bg-white/20 text-white"}`}>
            {camOff ? "📵" : "📹"}
          </button>
        )}
        <button onClick={handleHangup} className="w-16 h-16 rounded-full bg-red-500 text-white flex items-center justify-center text-2xl">
          ☎
        </button>
      </div>
    </div>
  );
}
