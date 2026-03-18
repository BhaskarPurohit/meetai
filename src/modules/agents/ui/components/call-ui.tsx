"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import {
  StreamVideo,
  StreamCall,
  StreamTheme,
  SpeakerLayout,
  CallControls,
  useCallStateHooks,
  StreamVideoClient,
  Call,
} from "@stream-io/video-react-sdk";

interface CallUIProps {
  meetingId: string;
  streamCallId: string;
}

function CallInner({ meetingId }: { meetingId: string }) {
  const { useCallEndedAt, useParticipantCount } = useCallStateHooks();
  const callEndedAt = useCallEndedAt();
  const participantCount = useParticipantCount();
  const intentionalLeaveRef = useRef(false);
  const transcriptRef = useRef<string[]>([]);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const callStartRef = useRef<number>(Date.now());

  // Start speech recognition as soon as the call is live
  useEffect(() => {
    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SR) return;

    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          transcriptRef.current.push(event.results[i][0].transcript.trim());
        }
      }
    };

    // Auto-restart if it stops (browser kills it after ~60s of silence)
    recognition.onend = () => {
      if (!intentionalLeaveRef.current) recognition.start();
    };

    recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
      if (e.error !== "no-speech" && e.error !== "aborted") {
        console.warn("SpeechRecognition error:", e.error);
      }
    };

    recognition.start();
    recognitionRef.current = recognition;

    return () => {
      intentionalLeaveRef.current = true;
      recognition.stop();
    };
  }, []);

  const endMeeting = useCallback(
    async (transcript: string | null) => {
      const durationSeconds = Math.round((Date.now() - callStartRef.current) / 1000);
      await fetch(`/api/meetings/${meetingId}/end`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ durationSeconds, transcript }),
      });
    },
    [meetingId]
  );

  const handleEnd = useCallback(async () => {
    intentionalLeaveRef.current = true;
    recognitionRef.current?.stop();
    const transcript = transcriptRef.current.join(" ") || null;
    try {
      await endMeeting(transcript);
    } catch (e) {
      console.error("Failed to end meeting:", e);
    }
    window.location.href = `/dashboard/meetings/${meetingId}`;
  }, [meetingId, endMeeting]);

  useEffect(() => {
    if (callEndedAt && !intentionalLeaveRef.current) {
      intentionalLeaveRef.current = true;
      recognitionRef.current?.stop();
      const transcript = transcriptRef.current.join(" ") || null;
      endMeeting(transcript).finally(() => {
        window.location.href = `/dashboard/meetings/${meetingId}`;
      });
    }
  }, [callEndedAt, meetingId, endMeeting]);

  return (
    <div className="call-container">
      <div className="call-header">
        <div className="call-live-badge">
          <span className="call-live-dot" />
          Live
        </div>
        <span className="call-participant-count">
          {participantCount} participant{participantCount !== 1 ? "s" : ""}
        </span>
      </div>
      <StreamTheme>
        <div className="call-video-area">
          <SpeakerLayout />
        </div>
        <div className="call-controls-bar">
          <CallControls onLeave={handleEnd} />
        </div>
      </StreamTheme>
    </div>
  );
}

export function CallUI({ meetingId, streamCallId }: CallUIProps) {
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<Call | null>(null);
  const [error, setError] = useState("");
  const [joined, setJoined] = useState(false);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    async function init() {
      try {
        const tokenRes = await fetch("/api/stream/token");
        if (!tokenRes.ok) throw new Error("Failed to fetch Stream token");
        const { token, userId, userName, userImage } = await tokenRes.json();

        const videoClient = new StreamVideoClient({
          apiKey: process.env.NEXT_PUBLIC_STREAM_KEY!,
          user: { id: userId, name: userName, image: userImage ?? undefined },
          token,
        });

        const videoCall = videoClient.call("default", streamCallId);
        await videoCall.join({ create: false });

        setClient(videoClient);
        setCall(videoCall);
        setJoined(true);
      } catch (e) {
        console.error("Failed to join call:", e);
        setError("Failed to join the call. Please refresh and try again.");
      }
    }

    init();
  }, [streamCallId]);

  if (error) {
    return (
      <div className="call-error">
        <p>{error}</p>
        <button className="btn-secondary" onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  if (!joined || !client || !call) {
    return (
      <div className="call-loading">
        <div className="call-loading-spinner" />
        <p>Joining call...</p>
      </div>
    );
  }

  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        <CallInner meetingId={meetingId} />
      </StreamCall>
    </StreamVideo>
  );
}
