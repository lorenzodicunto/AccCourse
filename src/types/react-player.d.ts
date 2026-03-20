/* eslint-disable @typescript-eslint/no-explicit-any */
declare module "react-player" {
  import { Component } from "react";

  interface ReactPlayerProps {
    url?: string;
    playing?: boolean;
    loop?: boolean;
    controls?: boolean;
    light?: boolean;
    volume?: number;
    muted?: boolean;
    playbackRate?: number;
    width?: string | number;
    height?: string | number;
    progressInterval?: number;
    pip?: boolean;
    onReady?: (player: any) => void;
    onStart?: () => void;
    onPlay?: () => void;
    onPause?: () => void;
    onProgress?: (state: { played: number; playedSeconds: number; loaded: number; loadedSeconds: number }) => void;
    onDuration?: (duration: number) => void;
    onEnded?: () => void;
    onError?: (error: any) => void;
    [key: string]: any;
  }

  export default class ReactPlayer extends Component<ReactPlayerProps> {
    seekTo(amount: number, type?: "seconds" | "fraction"): void;
    getCurrentTime(): number;
    getDuration(): number;
  }
}
