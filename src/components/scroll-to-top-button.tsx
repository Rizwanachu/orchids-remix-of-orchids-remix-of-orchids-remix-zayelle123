"use client";

import { useEffect, useState } from "react";

export default function ScrollToTopButton() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? scrollTop / docHeight : 0;
      setProgress(pct);
      setVisible(scrollTop > 300);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const size = 44;
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = circumference - progress * circumference;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll to top"
      className="fixed bottom-[68px] right-4 md:bottom-[82px] md:right-6 z-[60] transition-all duration-300"
      style={{
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        transform: visible ? "translateY(0)" : "translateY(12px)",
      }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="white"
          stroke="#E8E4DE"
          strokeWidth="2"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#5C4B3D"
          strokeWidth="2.5"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDash}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 0.1s linear" }}
        />
        <path
          d="M16 25l6-6 6 6"
          fill="none"
          stroke="#5C4B3D"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <line
          x1="22"
          y1="19"
          x2="22"
          y2="28"
          stroke="#5C4B3D"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}
