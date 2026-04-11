"use client";

import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertCircle,
  Loader2,
  Monitor,
  Square,
  Play,
  Pause,
} from "lucide-react";

interface ScreenRecorderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRecordingComplete: (blob: Blob, url: string) => void;
}

export function ScreenRecorder({
  open,
  onOpenChange,
  onRecordingComplete,
}: ScreenRecorderProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const previewRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const webcamStreamRef = useRef<MediaStream | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string>("");
  const [includeAudio, setIncludeAudio] = useState(true);
  const [includeWebcam, setIncludeWebcam] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Iniciar captura de tela
  const startScreenCapture = async () => {
    try {
      setError(null);
      setIsStarting(true);

      const displayMediaOptions: DisplayMediaStreamOptions = {
        video: {
          cursor: "always" as DesktopCaptureOptions["cursor"],
        },
        audio: includeAudio ? true : false,
      };

      const stream = await navigator.mediaDevices.getDisplayMedia(
        displayMediaOptions
      );
      setScreenStream(stream);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Se incluir webcam, adicionar overlay
      if (includeWebcam) {
        await addWebcamOverlay(stream);
      }

      // Monitorar se o usuário parou a captura via seletor do sistema
      stream.getVideoTracks()[0].onended = () => {
        stopScreenCapture();
      };
    } catch (err: any) {
      if (err.name === "NotAllowedError") {
        setError("Permissão de captura de tela negada.");
      } else {
        setError(`Erro ao capturar tela: ${err.message}`);
      }
    } finally {
      setIsStarting(false);
    }
  };

  // Adicionar webcam como overlay
  const addWebcamOverlay = async (screenStream: MediaStream) => {
    try {
      const webcamStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 320 }, height: { ideal: 240 } },
        audio: false,
      });

      webcamStreamRef.current = webcamStream;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Canvas com mesma resolução da tela
      canvas.width = 1920;
      canvas.height = 1080;

      const screenVideo = document.createElement("video");
      screenVideo.srcObject = screenStream;
      screenVideo.play();

      const webcamVideo = document.createElement("video");
      webcamVideo.srcObject = webcamStream;
      webcamVideo.play();

      // Função para desenhar frame
      const drawFrame = () => {
        ctx.drawImage(screenVideo, 0, 0);
        // Desenhar webcam no canto inferior direito
        ctx.drawImage(webcamVideo, canvas.width - 320, canvas.height - 240, 320, 240);
        animationFrameRef.current = requestAnimationFrame(drawFrame);
      };

      // Iniciar drawing
      drawFrame();
    } catch (err: any) {
      setError("Erro ao adicionar webcam ao overlay");
    }
  };

  // Parar captura de tela
  const stopScreenCapture = () => {
    if (screenStream) {
      screenStream.getTracks().forEach((track) => track.stop());
      setScreenStream(null);
    }
    if (webcamStreamRef.current) {
      webcamStreamRef.current.getTracks().forEach((track) => track.stop());
      webcamStreamRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  // Iniciar gravação
  const startRecording = () => {
    if (!screenStream) {
      setError("Captura de tela não inicializada");
      return;
    }

    try {
      chunksRef.current = [];

      let recordingStream = screenStream;

      // Se usar canvas para webcam overlay, usar canvas stream
      if (includeWebcam && canvasRef.current) {
        const canvasStream = canvasRef.current.captureStream(30);
        if (screenStream.getAudioTracks().length > 0) {
          const audioTrack = screenStream.getAudioTracks()[0];
          canvasStream.addTrack(audioTrack);
        }
        recordingStream = canvasStream;
      }

      const mediaRecorder = new MediaRecorder(recordingStream, {
        mimeType: "video/webm;codecs=vp9",
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        const url = URL.createObjectURL(blob);

        setRecordedBlob(blob);
        setRecordedUrl(url);

        if (previewRef.current) {
          previewRef.current.src = url;
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      setError(`Erro ao iniciar gravação: ${err.message}`);
    }
  };

  // Pausar gravação
  const pauseRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  // Retomar gravação
  const resumeRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }
  };

  // Parar gravação
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  // Cancelar
  const handleCancel = () => {
    stopScreenCapture();
    setRecordedBlob(null);
    setRecordedUrl("");
    setRecordingTime(0);
    setError(null);
    onOpenChange(false);
  };

  // Confirmar e fazer upload
  const handleConfirm = async () => {
    if (!recordedBlob) {
      setError("Nenhuma gravação disponível");
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", recordedBlob, "screen-recording.webm");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Erro ao fazer upload");
      }

      const data = await response.json();
      onRecordingComplete(recordedBlob, data.url);
      handleCancel();
    } catch (err: any) {
      setError(`Erro no upload: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Formatar tempo
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5 text-purple-600" />
            Gravador de Tela
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Opções */}
          {!recordedBlob && (
            <div className="space-y-3 bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="includeAudio"
                  checked={includeAudio}
                  onCheckedChange={(checked) =>
                    setIncludeAudio(checked as boolean)
                  }
                  disabled={isRecording}
                />
                <label
                  htmlFor="includeAudio"
                  className="text-sm font-medium cursor-pointer"
                >
                  Incluir áudio do sistema
                </label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="includeWebcam"
                  checked={includeWebcam}
                  onCheckedChange={(checked) =>
                    setIncludeWebcam(checked as boolean)
                  }
                  disabled={isRecording}
                />
                <label
                  htmlFor="includeWebcam"
                  className="text-sm font-medium cursor-pointer"
                >
                  Incluir webcam (picture-in-picture)
                </label>
              </div>
            </div>
          )}

          {/* Mensagens de erro */}
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 flex gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Canvas para overlay (oculto) */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Video preview */}
          {!recordedBlob ? (
            <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Timer */}
              {isRecording && (
                <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-2 rounded-lg font-mono text-sm flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  {formatTime(recordingTime)}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                <video
                  ref={previewRef}
                  controls
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-sm text-gray-600">
                Duração: {formatTime(recordingTime)}
              </p>
            </div>
          )}

          {/* Botões de controle */}
          <div className="flex gap-2 justify-center flex-wrap">
            {!isRecording && !recordedBlob && (
              <Button
                onClick={startScreenCapture}
                disabled={isStarting}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isStarting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Selecionar Tela
              </Button>
            )}

            {screenStream && !isRecording && !recordedBlob && (
              <Button
                onClick={startRecording}
                className="bg-red-600 hover:bg-red-700"
              >
                Iniciar Gravação
              </Button>
            )}

            {isRecording && (
              <>
                <Button
                  onClick={isPaused ? resumeRecording : pauseRecording}
                  variant="outline"
                >
                  {isPaused ? (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Retomar
                    </>
                  ) : (
                    <>
                      <Pause className="h-4 w-4 mr-2" />
                      Pausar
                    </>
                  )}
                </Button>

                <Button
                  onClick={stopRecording}
                  className="bg-gray-600 hover:bg-gray-700"
                >
                  <Square className="h-4 w-4 mr-2" />
                  Parar
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleCancel}>
            {recordedBlob ? "Cancelar" : "Fechar"}
          </Button>

          {recordedBlob && (
            <Button
              onClick={handleConfirm}
              disabled={isUploading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isUploading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isUploading ? "Enviando..." : "Confirmar e Enviar"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
