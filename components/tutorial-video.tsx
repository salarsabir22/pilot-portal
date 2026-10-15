"use client";

import { useRef, useState } from "react";
import { Maximize, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";

function clock(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60);
  return `${minutes}:${rest.toString().padStart(2, "0")}`;
}

export function TutorialVideo() {
  const box = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);

  function toggle() {
    const player = video.current;
    if (!player) return;
    if (player.paused) void player.play();
    else player.pause();
  }

  return (
    <div ref={box} className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <video
        ref={video}
        className="aspect-video w-full bg-black"
        playsInline
        preload="metadata"
        src="/tutorial.mp4"
        onClick={toggle}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onTimeUpdate={() => setTime(video.current?.currentTime ?? 0)}
        onLoadedMetadata={() => setDuration(video.current?.duration ?? 0)}
      />
      <div className="flex items-center gap-2 border-t border-border px-3 py-2 sm:gap-3 sm:px-4">
        <Button type="button" variant="ghost" size="sm" className="h-9 w-9 px-0" aria-label={playing ? "Pause" : "Play"} onClick={toggle}>
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <span className="w-10 text-xs tabular-nums text-muted-foreground">{clock(time)}</span>
        <input
          className="h-1.5 min-w-0 flex-1 cursor-pointer accent-primary"
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={Math.min(time, duration || 0)}
          aria-label="Seek"
          aria-valuemin={0}
          aria-valuemax={Math.round(duration || 0)}
          aria-valuenow={Math.round(time)}
          onChange={(event) => {
            const next = Number(event.target.value);
            if (video.current) video.current.currentTime = next;
            setTime(next);
          }}
        />
        <span className="w-10 text-xs tabular-nums text-muted-foreground">{clock(duration)}</span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-9 w-9 px-0"
          aria-label={muted ? "Unmute" : "Mute"}
          aria-pressed={muted}
          onClick={() => {
            const player = video.current;
            if (!player) return;
            player.muted = !player.muted;
            setMuted(player.muted);
          }}
        >
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-9 w-9 px-0"
          aria-label="Full screen"
          onClick={() => {
            const shell = box.current;
            if (!shell) return;
            if (document.fullscreenElement) void document.exitFullscreen();
            else void shell.requestFullscreen();
          }}
        >
          <Maximize className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
