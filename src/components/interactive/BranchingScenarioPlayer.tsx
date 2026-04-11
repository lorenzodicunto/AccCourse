"use client";

import { useState } from "react";
import { ChevronRight, RotateCcw } from "lucide-react";

export interface Choice {
  text: string;
  targetSlideId?: string;
  feedback?: string;
  consequence?: string;
}

interface BranchingScenarioPlayerProps {
  scenario: string;
  choices: Choice[];
  backgroundImage?: string;
  characterImage?: string;
  isPreview?: boolean;
}

export function BranchingScenarioPlayer({
  scenario,
  choices,
  backgroundImage,
  characterImage,
  isPreview = false,
}: BranchingScenarioPlayerProps) {
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showConsequence, setShowConsequence] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);

  // Handle choice selection
  const handleChoiceSelect = (index: number) => {
    setSelectedChoice(index);
    setShowFeedback(true);
    setHasAnswered(true);
  };

  // Show consequence
  const handleShowConsequence = () => {
    setShowConsequence(true);
  };

  // Reset scenario
  const handleReset = () => {
    setSelectedChoice(null);
    setShowFeedback(false);
    setShowConsequence(false);
    setHasAnswered(false);
  };

  const currentChoice = selectedChoice !== null ? choices[selectedChoice] : null;

  return (
    <div className="relative w-full h-full flex flex-col bg-gray-900 text-white overflow-hidden rounded-lg">
      {/* Background */}
      {backgroundImage && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
      )}

      {/* Content overlay */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-8">
        {/* Character image */}
        {characterImage && !showFeedback && (
          <div className="mb-8 animate-fadeIn">
            <img
              src={characterImage}
              alt="Personagem"
              className="h-48 w-auto object-contain rounded-lg shadow-2xl"
            />
          </div>
        )}

        {/* Main content container */}
        <div className="max-w-2xl w-full">
          {/* Scenario text */}
          {!showFeedback && !showConsequence && (
            <div className="animate-slideUp">
              <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-purple-300 to-purple-100 bg-clip-text text-transparent">
                Cenário
              </h2>
              <div className="bg-purple-900/50 backdrop-blur border border-purple-500/30 rounded-lg p-6 mb-8">
                <p className="text-lg leading-relaxed text-gray-100">
                  {scenario}
                </p>
              </div>

              {/* Choices */}
              <div className="space-y-4">
                <p className="text-sm font-semibold text-purple-300 text-center mb-4">
                  O que você faria?
                </p>
                {choices.map((choice, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleChoiceSelect(idx)}
                    className="w-full group relative bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 overflow-hidden"
                  >
                    {/* Animated background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity" />

                    {/* Content */}
                    <div className="relative flex items-center justify-between">
                      <span>{choice.text}</span>
                      <ChevronRight
                        size={20}
                        className="group-hover:translate-x-1 transition-transform"
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Feedback message */}
          {showFeedback && currentChoice?.feedback && !showConsequence && (
            <div className="animate-slideUp">
              <div className="bg-blue-900/50 backdrop-blur border border-blue-500/30 rounded-lg p-6 mb-6">
                <h3 className="text-xl font-bold text-blue-300 mb-3">
                  Análise da sua escolha
                </h3>
                <p className="text-blue-100 leading-relaxed">
                  {currentChoice.feedback}
                </p>
              </div>

              {/* Continue button */}
              <button
                onClick={handleShowConsequence}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                Ver consequências →
              </button>
            </div>
          )}

          {/* Consequence message */}
          {showConsequence && currentChoice?.consequence && (
            <div className="animate-slideUp">
              <div className="bg-purple-900/50 backdrop-blur border border-purple-500/30 rounded-lg p-6 mb-6">
                <h3 className="text-xl font-bold text-purple-300 mb-3">
                  Resultado
                </h3>
                <p className="text-purple-100 leading-relaxed">
                  {currentChoice.consequence}
                </p>
              </div>

              {/* Navigation buttons */}
              <div className="grid grid-cols-2 gap-4">
                {currentChoice.targetSlideId && (
                  <button className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105">
                    Próxima →
                  </button>
                )}

                <button
                  onClick={handleReset}
                  className={`group relative bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 ${
                    !currentChoice.targetSlideId ? "col-span-2" : ""
                  }`}
                >
                  <RotateCcw size={18} />
                  Recomeçar
                </button>
              </div>
            </div>
          )}

          {/* Alternative path message */}
          {showFeedback && !currentChoice?.feedback && !showConsequence && (
            <div className="animate-slideUp">
              <div className="bg-orange-900/50 backdrop-blur border border-orange-500/30 rounded-lg p-6 mb-6">
                <p className="text-orange-100 leading-relaxed text-center">
                  Essa é uma escolha interessante! Explore outras opções ou veja as consequências dessa decisão.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handleShowConsequence}
                  className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                  Ver resultado →
                </button>

                <button
                  onClick={handleReset}
                  className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                  Voltar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Styles for animations */}
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-slideUp {
          animation: slideUp 0.5s ease-out;
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
