"use client";

import { useEffect, useState, useCallback } from "react";
import {
  StreamVideo,
  StreamCall,
  StreamVideoClient,
  CallControls,
  SpeakerLayout,
  StreamTheme,
  useCallStateHooks,
  CallingState,
} from "@stream-io/video-react-sdk";
import { useRouter } from "next/navigation";

interface CallUIProps {
  meetingId: string;
  streamCallId: string;
}

function CallContent({ meetingId, onEnd }: { meetingId: string; onEnd: () => void }) {
  const { useCallCallingState, useParticipantCount } = useCallStateHooks();
  const callingState = useCallCallingState();
  const participantCount = useParticipantCount();

  useEffect(() => {
    if (callingState === CallingState.LEFT) {
      onEnd();
    }
  }, [callingState, onEnd]);

  return (
    <div className="call-container">
      <div className="call-header">
        <div className="call-status">
          <span className="status-live-dot" style={{ background: "#10b981", width: 8, height: 8, borderRadius: "50%", display: "inline-block", marginRight: 8 }} />
          <span style={{ color: "#10b981", fontSize: 13, fontWeight: 600 }}>Live</span>
          <span style={{ color: "var(--meetai-text-disabled)", fontSize: 13, marginLeft: 12 }}>
            {participantCount} participant{participantCount !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
      <div className="call-video-area">
        <SpeakerLayout />
      </div>
      <div className="call-controls-wrap">
        <CallControls />
      </div>
    </div>
  );
}

export function CallUI({ meetingId, streamCallId }: CallUIProps) {
  const router = useRouter();
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<ReturnType<StreamVideoClient["call"]> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let videoClient: StreamVideoClient;

    async function init() {
      try {
        const res = await fetch("/api/stream/token");
        if (!res.ok) throw new Error("Failed to get token");
        const { token, userId, userName, userImage } = await res.json() as {
          token: string;
          userId: string;
          userName: string;
          userImage: string | null;
        };

        videoClient = new StreamVideoClient({
          apiKey: process.env.NEXT_PUBLIC_STREAM_KEY!,
          user: { id: userId, name: userName, image: userImage ?? undefined },
          token,
        });

        const videoCall = videoClient.call("default", streamCallId);
        await videoCall.join({ create: true });

        setClient(videoClient);
        setCall(videoCall);
      } catch (e) {
        setError("Failed to join call. Please try again.");
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    init();

    return () => {
      videoClient?.disconnectUser();
    };
  }, [streamCallId]);

const handleEnd = useCallback(async () => {
  try {
    await call?.leave();
    await fetch(`/api/meetings/${meetingId}/end`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ durationSeconds: null }),
    });
  } catch (e) {
    console.error("Failed to end meeting:", e);
  }
  // Hard navigate so server refetches meeting status
  window.location.href = `/dashboard/meetings/${meetingId}`;
}, [meetingId, call]);

  if (loading) {
    return (
      <div className="call-loading">
        <div className="call-loading-spinner" />
        <p>Joining call…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="call-error">
        <p>{error}</p>
        <button className="btn-primary" onClick={() => router.push("/dashboard")}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!client || !call) return null;

  return (
    <StreamTheme>
      <StreamVideo client={client}>
        <StreamCall call={call}>
          <CallContent meetingId={meetingId} onEnd={handleEnd} />
        </StreamCall>
      </StreamVideo>
    </StreamTheme>
  );
}