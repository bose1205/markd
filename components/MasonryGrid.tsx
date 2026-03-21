"use client";

import React from "react";

interface MasonryGridProps {
  children: React.ReactNode[];
}

export default function MasonryGrid({ children }: MasonryGridProps) {
  return (
    <div
      style={{
        columnCount: 3,
        columnGap: 16,
      }}
      className="masonry-grid"
    >
      <style jsx>{`
        @media (max-width: 768px) {
          .masonry-grid {
            column-count: 2 !important;
          }
        }
        @media (max-width: 640px) {
          .masonry-grid {
            column-count: 1 !important;
          }
        }
      `}</style>
      {children.map((child, i) => (
        <div
          key={i}
          style={{
            breakInside: "avoid",
            marginBottom: 16,
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
