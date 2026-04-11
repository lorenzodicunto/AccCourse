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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, Loader2, Video, Mic, Square, Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";

interface WebcamRecorderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRecordingComplete: (blob: Blob, url: string) => void;
}

interface MediaDevice {
  deviceId: string;
  label: string;
  kind: "videoinput" | "audioinput";
}

export function WebcamRecorder({
  open,
  onOpenChange,
  onRecordingComplete,
}: WebcamRecorderProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const previewRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameras, setCameras] = useState<MediaDevice[]>([]);
  const [microphones, setMicrophones] = useState<MediaDevice[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>("");
  const [selectedMicrophone, setSelectedMicrophone] = useState<string>("");
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string>("");
  const [isLoadingDevices, setIsLoadingDevices] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Listar dispositivos disponíveis
  useEffect(() => {
    const listDevices = async () => {
      try {
        setIsLoadingDevices(true);
        const devices = await navigator.mediaDevices.enumerateDevices();

        const videoDevices = devices.filter((d) => d.kind === "videoinput") as MediaDeviceInfo[];
        const audioDevices = devices.filter((d) => d.kind === "audioinput") as MediaDeviceInfo[];

        setCameras(videoDevices as unknown as MediaDevice[]);
        setMicrophones(audioDevices as unknown as MediaDevice[]);

        if (videoDevices.length > 0) {
          setSelectedCamera(videoDevices[0].deviceId);
        }
        if (audioDevices.length > 0) {
          setSelectedMicrophone(audioDevices[0].deviceId);
        }
      } catch (err) {
        setError("Erro ao listar dispositivos");
      } finally {
        setIsLoadingDevices(false);
      }
    };

    if (open) {
      listDevices();
    }
  }, [open]);

  // Iniciar stream da webcam
  const startWebcam = async () => {
    try {
      setError(null);

      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: selectedCamera ? { exact: selectedCamera } : undefined,
        },
        audio: {
          deviceId: selectedMicrophone ? { exact: selectedMicrophone } : undefined,
        },
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      if (err.name === "NotAllowedError") {
        setError("Permissão de câmera negada. Verifique as configurações de privacidade.");
      } else if (err.name === "NotFoundError") {
        setError("Câmera ou microfone não encontrados.");
      } else {
        setError(`Erro ao acessar câmera: ${err.message}`);
      }
    }
  };

  // Parar stream
  const stopWebcam = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  // Iniciar gravação
  const startRecording = () => {
    if (!stream) {
      setError("Webcam não inicializada");
      return;
    }

    try {
      chunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);

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
    stopWebcam();
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
      formData.append("file", recordedBlob, "webcam-recording.webm");

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
            <Video className="h-5 w-5 text-purple-600" />
            Gravador de Webcam
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Seleção de dispositivos */}
          {!recordedBlob && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Câmera</label>
                  <Select
                    value={selectedCamera}
                    onValueChange={setSelectedCamera}
                    disabled={isRecording || isLoadingDevices}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {cameras.map((cam) => (
                        <SelectItem key={cam.deviceId} value={cam.deviceId}>
                          {cam.label || `Câmera ${cam.deviceId.slice(0, 5)}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Microfone</label>
                  <Select
                    value={selectedMicrophone}
                    onValueChange={setSelectedMicrophone}
                    disabled={isRecording || isLoadingDevices}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {microphones.map((mic) => (
                        <SelectItem key={mic.deviceId} value={mic.deviceId}>
                          {mic.label || `Microfone ${mic.deviceId.slice(0, 5)}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
                onClick={startWebcam}
                variant="outline"
                disabled={isLoadingDevices}
              >
                Inicializar Webcam
              </Button>
            )}

            {stream && !isRecording && !recordedBlob && (
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
