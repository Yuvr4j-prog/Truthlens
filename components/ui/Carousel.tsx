"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CarouselProps {
  children: React.ReactNode[];
}

export default function Carousel({ children }: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev === children.length - 1 ? 0 : prev + 1));
  }, [children.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? children.length - 1 : prev - 1));
  }, [children.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in a textarea/input
      if (document.activeElement?.tagName === "TEXTAREA" || document.activeElement?.tagName === "INPUT") {
        return;
      }
      
      if (e.key === "ArrowRight") {
        nextSlide();
      } else if (e.key === "ArrowLeft") {
        prevSlide();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide]);

  if (!children || children.length === 0) return null;

  return (
    <div className="relative w-full mx-auto flex flex-col items-center">
      {/* Cards Container */}
      <div className="overflow-hidden w-full relative pb-4">
        <div 
          className="flex transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] w-full items-stretch"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {React.Children.map(children, (child, index) => (
            <div key={index} className="w-full flex-shrink-0 px-2 flex justify-center h-auto">
              {child}
            </div>
          ))}
        </div>
      </div>

      {/* Controls & Indicators */}
      {children.length > 1 && (
        <div className="flex items-center justify-between w-full max-w-2xl px-4 mt-6">
          <button 
            onClick={prevSlide}
            className="p-2.5 rounded-full bg-[#141414] border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-900 shadow-sm transition-all hover:-translate-y-0.5 focus:outline-none"
            aria-label="Previous slide"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="flex gap-2.5 overflow-x-auto px-4 max-w-[200px] no-scrollbar">
            {children.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`flex-shrink-0 rounded-full transition-all ${
                  currentIndex === idx ? "w-4 h-2 bg-white" : "w-2 h-2 bg-gray-700 hover:bg-gray-500"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          <button 
            onClick={nextSlide}
            className="p-2.5 rounded-full bg-[#141414] border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-900 shadow-sm transition-all hover:-translate-y-0.5 focus:outline-none"
            aria-label="Next slide"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
      
      {children.length > 1 && (
        <p className="text-[10px] uppercase tracking-widest font-bold text-gray-500 mt-6">
          Use <kbd className="px-1 py-0.5 bg-gray-900 border border-gray-800 rounded text-gray-400 font-sans">←</kbd> and <kbd className="px-1 py-0.5 bg-gray-900 border border-gray-800 rounded text-gray-400 font-sans">→</kbd> to navigate cards
        </p>
      )}
    </div>
  );
}
