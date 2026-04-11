"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { ChevronDown, ChevronUp, Bookmark, BookmarkOff, Volume2, VolumeX, Play, Pause, RotateCcw } from "lucide-react";

const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });

export interface Chapter {
  time: number;
  title: string;
}

export interface QuizPoint {
  time: number;
  question: string;
  options: string[];
  correctIndex: number;
}

export interface Bookmark {
  time: number;
  label: string;
}

interface InteractiveVideoPlayerProps {
  url: string;
  chapters?: Chapter[];
  quizPoints?: QuizPoint[];
  bookmarks?: Bookmark[];
  isPreview?: boolean;
}

export function InteractiveVideoPlayer({
  url,
  chapters = [],
  quizPoints = [],
  bookmarks: initialBookmarks = [],
  isPreview = false,
}: InteractiveVideoPlayerProps) {
  const playerRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [played, setPlayed] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [showChapters, setShowChapters] = useState(true);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks);
  const [currentQuizPoint, setCurrentQuizPoint] = useState<QuizPoint | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [answeredQuizzes, setAnsweredQuizzes] = useState<Set<number>>(new Set());

  const currentTime = duration * played;
  const progressPercent = (played * 100).toFixed(1);

  // Format time to MM:SS
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  // Check for quiz points at current time
  const checkQuizPoint = useCallback(() => {
    if (quizPoints.length === 0) return;

    const activeQuiz = quizPoints.find(
      (q) => Math.abs(currentTime - q.time) < 0.5 && !answeredQuizzes.has(quizPoints.indexOf(q))
    );

    if (activeQuiz) {
      setIsPlaying(false);
      setCurrentQuizPoint(activeQuiz);
      setSelectedAnswer(null);
      setShowFeedback(false);
    }
  }, [quizPoints, currentTime, answeredQuizzes]);

  // Handle play progress
  const handleProgress = (state: any) => {
    setPlayed(state.played);
    checkQuizPoint();
  };

  // Handle quiz answer
  const handleAnswerSelect = (index: number) => {
    setSelectedAnswer(index);
    setShowFeedback(true);

    if (index === currentQuizPoint?.correctIndex) {
      setScore((prev) => prev + 1);
    }

    const quizIndex = quizPoints.indexOf(currentQuizPoint!);
    setAnsweredQuizzes((prev) => new Set(prev).add(quizIndex));
  };

  // Resume video after quiz
  const handleResume = () => {
    setCurrentQuizPoint(null);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setIsPlaying(true);
  };

  // Add bookmark at current time
  const handleAddBookmark = () => {
    const newBookmark: Bookmark = {
      time: currentTime,
      label: `Marcador em ${formatTime(currentTime)}`,
    };
    setBookmarks((prev) => [...prev, newBookmark]);
  };

  // Remove bookmark
  const handleRemoveBookmark = (time: number) => {
    setBookmarks((prev) => prev.filter((b) => b.time !== time));
  };

  // Seek to time
  const handleSeekChapter = (time: number) => {
    setPlayed(time / duration);
    setIsPlaying(true);
  };

  // Seek to bookmark
  const handleSeekBookmark = (time: number) => {
    setPlayed(time / duration);
  };

  // Create progress bar markers
  const markers = useMemo(() => {
    const allMarkers: { time: number; type: "chapter" | "quiz" | "bookmark"; label: string }[] = [];

    chapters.forEach((ch) => allMarkers.push({ time: ch.time, type: "chapter", label: ch.title }));
    quizPoints.forEach((qp) => allMarkers.push({ time: qp.time, type: "quiz", label: "Pergunta" }));
    bookmarks.forEach((b) => allMarkers.push({ time: b.time, type: "bookmark", label: b.label }));

    return allMarkers.sort((a, b) => a.time - b.time);
  }, [chapters, quizPoints, bookmarks]);

  // Get marker color based on type
  const getMarkerColor = (type: string) => {
    switch (type) {
      case "chapter":
        return "bg-purple-500";
      case "quiz":
        return "bg-orange-500";
      case "bookmark":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-black rounded-lg overflow-hidden">
      {/* Video Player */}
      <div className="relative w-full flex-1 bg-black">
        <div className="w-full h-full">
          <ReactPlayer
            ref={playerRef}
            url={url}
            playing={isPlaying && !currentQuizPoint}
            volume={isMuted ? 0 : volume}
            duration={duration}
            onProgress={handleProgress}
            onDuration={setDuration}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            width="100%"
            height="100%"
            controls={false}
            progressInterval={100}
          />
        </div>

        {/* Quiz Overlay */}
        {currentQuizPoint && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {currentQuizPoint.question}
              </h3>

              <div className="space-y-3 mb-6">
                {currentQuizPoint.options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => !showFeedback && handleAnswerSelect(idx)}
                    disabled={showFeedback}
                    className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                      selectedAnswer === idx
                        ? idx === currentQuizPoint.correctIndex
                          ? "border-green-500 bg-green-50"
                          : "border-red-500 bg-red-50"
                        : "border-gray-300 hover:border-purple-500"
                    } ${showFeedback ? "cursor-default" : "cursor-pointer"}`}
                  >
                    <span className="font-medium text-gray-900">{option}</span>
                  </button>
                ))}
              </div>

              {showFeedback && (
                <div className="mb-6">
                  {selectedAnswer === currentQuizPoint.correctIndex ? (
                    <div className="p-4 bg-green-100 border border-green-500 rounded-lg">
                      <p className="text-green-800 font-medium">Correto! Parabéns!</p>
                    </div>
                  ) : (
                    <div className="p-4 bg-red-100 border border-red-500 rounded-lg">
                      <p className="text-red-800 font-medium">
                        Incorreto. A resposta correta é: {currentQuizPoint.options[currentQuizPoint.correctIndex]}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {showFeedback && (
                <button
                  onClick={handleResume}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 rounded-lg transition-colors"
                >
                  Continuar
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Controls and Progress */}
      <div className="bg-gray-900 p-4 space-y-3">
        {/* Progress Bar with Markers */}
        <div className="space-y-1">
          <div className="relative h-8 bg-gray-800 rounded group cursor-pointer" onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            setPlayed(Math.max(0, Math.min(1, percent)));
          }}>
            {/* Background progress */}
            <div
              className="absolute left-0 top-0 h-full bg-purple-600 rounded transition-all"
              style={{ width: `${progressPercent}%` }}
            />

            {/* Markers */}
            {markers.map((marker, idx) => {
              const percent = (marker.time / duration) * 100;
              return (
                <div
                  key={idx}
                  className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full transform -translate-x-1/2 ${getMarkerColor(marker.type)}`}
                  style={{ left: `${percent}%` }}
                  title={`${marker.label} - ${formatTime(marker.time)}`}
                />
              );
            })}
          </div>

          {/* Time display */}
          <div className="flex justify-between text-xs text-gray-400">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Control buttons */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {/* Play/Pause */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white transition-colors"
              title={isPlaying ? "Pausar" : "Reproduzir"}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>

            {/* Reset */}
            <button
              onClick={() => setPlayed(0)}
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white transition-colors"
              title="Reiniciar"
            >
              <RotateCcw size={18} />
            </button>

            {/* Volume */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white transition-colors"
                title={isMuted ? "Ativar som" : "Mutar som"}
              >
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-20 h-1 bg-gray-700 rounded cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 text-white text-sm">
            {/* Score display */}
            {quizPoints.length > 0 && (
              <span className="text-purple-400 font-medium">
                Pontuação: {score}/{quizPoints.length}
              </span>
            )}

            {/* Bookmark button */}
            <button
              onClick={handleAddBookmark}
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
              title="Adicionar marcador"
            >
              <Bookmark size={18} />
            </button>

            {/* Toggle chapters */}
            <button
              onClick={() => setShowChapters(!showChapters)}
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
              title={showChapters ? "Ocultar capítulos" : "Mostrar capítulos"}
            >
              {showChapters ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Chapters and Bookmarks Sidebar */}
      {showChapters && (
        <div className="bg-gray-800 border-t border-gray-700 max-h-48 overflow-y-auto">
          {chapters.length > 0 && (
            <div className="p-4 border-b border-gray-700">
              <h4 className="text-white text-sm font-bold mb-2">Capítulos</h4>
              <div className="space-y-1">
                {chapters.map((chapter, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSeekChapter(chapter.time)}
                    className="w-full text-left px-2 py-1 rounded text-xs text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                  >
                    <span className="text-purple-400 font-medium">{formatTime(chapter.time)}</span>
                    {" - "}
                    <span>{chapter.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {bookmarks.length > 0 && (
            <div className="p-4">
              <h4 className="text-white text-sm font-bold mb-2">Marcadores</h4>
              <div className="space-y-1">
                {bookmarks.map((bookmark, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <button
                      onClick={() => handleSeekBookmark(bookmark.time)}
                      className="flex-1 text-left px-2 py-1 rounded text-xs text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                    >
                      <span className="text-blue-400 font-medium">{formatTime(bookmark.time)}</span>
                      {" - "}
                      <span>{bookmark.label}</span>
                    </button>
                    <button
                      onClick={() => handleRemoveBookmark(bookmark.time)}
                      className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-red-400 transition-colors"
                      title="Remover marcador"
                    >
                      <BookmarkOff size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
