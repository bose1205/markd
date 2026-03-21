"use client";

import MasonryGrid from "./MasonryGrid";

function SkeletonCard({ showThumbnail }: { showThumbnail: boolean }) {
  return (
    <div
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: 24,
        overflow: "hidden",
      }}
    >
      {showThumbnail && (
        <div className="shimmer" style={{ width: "100%", height: 160 }} />
      )}
      <div style={{ padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            className="shimmer"
            style={{
              width: 16,
              height: 16,
              borderRadius: 4,
              flexShrink: 0,
            }}
          />
          <div
            className="shimmer"
            style={{ height: 16, borderRadius: 8, flex: 1 }}
          />
        </div>
        <div
          className="shimmer"
          style={{
            height: 12,
            borderRadius: 8,
            marginTop: 12,
            width: "80%",
          }}
        />
        <div
          className="shimmer"
          style={{
            height: 12,
            borderRadius: 8,
            marginTop: 8,
            width: "60%",
          }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 12,
          }}
        >
          <div
            className="shimmer"
            style={{ height: 12, width: 80, borderRadius: 8 }}
          />
          <div
            className="shimmer"
            style={{ height: 16, width: 16, borderRadius: 4 }}
          />
        </div>
      </div>
    </div>
  );
}

export default function LoadingSkeleton() {
  return (
    <MasonryGrid>
      {[true, false, true, false, true, false].map((show, i) => (
        <SkeletonCard key={i} showThumbnail={show} />
      ))}
    </MasonryGrid>
  );
}
