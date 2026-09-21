"use client";
import { useEffect, useRef, useState } from "react";
import {
  ICE_SERVERS, createCallDoc, updateCallDoc, listenToCall,
  addIceCandidate, listenToCandidates, endCall
} from "@/lib/realCall";
import Avatar from "./Avatar";

// role: "caller" | "callee"
// callId: unique id for this call attempt
// myUid / myName: the local user
// otherUser: { uid, name }
// type: "audio" | "video"
// existingOffer: (callee only) the SDP offer already stored on the call doc
export default function RealCallScreen({ role, callId, myUid, myName, otherUser, type = "video", existingOffer, onEnd }) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const unsubs = useRef([]);
  const ended = useRef(false);
  const [status, setStatus] = useState(role === "caller" ? "calling" : "connecting");
  const [muted, setMuted] = useState(false);
  const [camOff, setCamOff] = useState(type !== "video");

  useEffect(() => {
    let cancelled = false;

    const cleanup = () => {
      unsubs.current.forEach((u) => u && u());
      unsubs.current = [];
      pcRef.current?.getSenders().forEach((s) => s.track && s.track.stop());
      pcRef.current?.close();
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
    };

    const handleEnd = () => {
      if (ended.current) return;
      ended.current = true;
      cleanup();
      endCall(callId);
      onEnd();
    };

    const setup = async () => {
      const pc = new RTCPeerConnection(ICE_SERVERS);
      pcRef.current = pc;

      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: type === "video" });
      } catch {
        setStatus("error");
        return;
      }
      if (cancelled) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      const remoteStream = new MediaStream();
      const remoteEl = type === "video" ? remoteVideoRef.current : remoteAudioRef.current;
      if (remoteEl) remoteEl.srcObject = remoteStream;
      pc.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => remoteStream.addTrack(track));
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "connected") setStatus("connected");
        if (["failed", "closed"].includes(pc.connectionState)) handleEnd();
      };

      if (role === "caller") {
        pc.onicecandidate = (e) => { if (e.candidate) addIceCandidate(callId, "offerCandidates", e.candidate); };

        const offerDesc = await pc.createOffer();
        await pc.setLocalDescription(offerDesc);
        await createCallDoc(callId, {
          callerId: myUid,
          calleeId: otherUser.uid,
          callerName: myName,
          calleeName: otherUser.name,
          type,
          offer: { type: offerDesc.type, sdp: offerDesc.sdp }
        });

        unsubs.current.push(
          listenToCall(callId, async (call) => {
            if (!call) return;
            if (call.answer && !pc.currentRemoteDescription) {
              await pc.setRemoteDescription(new RTCSessionDescription(call.answer));
            }
            if (call.status === "declined" || call.status === "ended") handleEnd();
          })
        );
        unsubs.current.push(
          listenToCandidates(callId, "answerCandidates", (data) => {
            pc.addIceCandidate(new RTCIceCandidate(data)).catch(() => {});
          })
        );

        // Nobody picked up — stop ringing after 45s.
        const timeout = setTimeout(() => {
          if (pc.connectionState !== "connected") handleEnd();
        }, 45000);
        unsubs.current.push(() => clearTimeout(timeout));
      } else {
        pc.onicecandidate = (e) => { if (e.candidate) addIceCandidate(callId, "answerCandidates", e.candidate); };

        await pc.setRemoteDescription(new RTCSessionDescription(existingOffer));
        const answerDesc = await pc.createAnswer();
        await pc.setLocalDescription(answerDesc);
        await updateCallDoc(callId, { answer: { type: answerDesc.type, sdp: answerDesc.sdp }, status: "accepted" });

        unsubs.current.push(
          listenToCandidates(callId, "offerCandidates", (data) => {
            pc.addIceCandidate(new RTCIceCandidate(data)).catch(() => {});
          })
        );
        unsubs.current.push(
          listenToCall(callId, (call) => {
            if (call && call.status === "ended") handleEnd();
          })
        );
      }
    };

    setup();

    return () => {
      cancelled = true;
      if (!ended.current) cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleHangup = () => {
    if (ended.current) return;
    ended.current = true;
    unsubs.current.forEach((u) => u && u());
    pcRef.current?.getSenders().forEach((s) => s.track && s.track.stop());
    pcRef.current?.close();
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    endCall(callId);
    onEnd();
  };

  const toggleMute = () => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setMuted(!track.enabled);
    }
  };
  const toggleCam = () => {
    const track = localStreamRef.current?.getVideoTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setCamOff(!track.enabled);
    }
  };

  return (
    <div className="absolute inset-0 z-[600] bg-black flex flex-col">
      {type === "video" ? (
        <>
          <video ref={remoteVideoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover bg-black" />
          <video ref={localVideoRef} autoPlay playsInline muted className="absolute top-16 right-4 w-24 h-36 rounded-xl object-cover border-2 border-white/30 z-10" />
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <Avatar name={otherUser.name} size={120} />
          <audio ref={remoteAudioRef} autoPlay />
        </div>
      )}

      <div className="absolute top-0 left-0 right-0 pt-[max(1rem,env(safe-area-inset-top))] px-4 text-center text-white z-10">
        <div className="text-lg font-semibold drop-shadow">{otherUser.name}</div>
        <div className="text-sm text-white/70 drop-shadow">
          {status === "calling" && "Calling…"}
          {status === "connecting" && "Connecting…"}
          {status === "connected" && "Connected"}
          {status === "error" && "Camera/mic access denied"}
        </div>
      </div>

      <div className="mt-auto pb-[max(2rem,env(safe-area-inset-bottom))] flex items-center justify-center gap-5 z-10">
        <button onClick={toggleMute} className={`w-14 h-14 rounded-full flex items-center justify-center text-xl ${muted ? "bg-white text-black" : "bg-white/20 text-white"}`}>
          {muted ? "🔇" : "🎤"}
        </button>
        {type === "video" && (
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
