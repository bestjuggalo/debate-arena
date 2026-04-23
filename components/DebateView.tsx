"use client";

import React from "react";

function renderMarkdown(text: string) {
  // Split into lines, then group into blocks separated by blank lines
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let currentBlock: string[] = [];
  let key = 0;

  function flushBlock() {
    if (currentBlock.length === 0) return;
    const blockText = currentBlock.join("\n").trim();
    if (!blockText) { currentBlock = []; return; }

    // Check if the whole block is a standalone bold header: **Some Title**
    if (/^\*\*[^*]+\*\*$/.test(blockText)) {
      elements.push(
        React.createElement("h3", { key: key++, className: "text-lg font-bold mt-6 mb-3 first:mt-0" },
          blockText.slice(2, -2)
        )
      );
    } else {
      // Render as paragraph with inline formatting
      elements.push(
        React.createElement("p", { key: key++, className: "mb-4 leading-relaxed" },
          renderInline(blockText)
        )
      );
    }
    currentBlock = [];
  }

  for (const line of lines) {
    const trimmed = line.trim();

    // Blank line = flush current block
    if (trimmed === "") {
      flushBlock();
      continue;
    }

    // # H1 header
    if (/^# /.test(trimmed)) {
      flushBlock();
      elements.push(
        React.createElement("h2", { key: key++, className: "text-xl font-bold mt-6 mb-3 first:mt-0" },
          renderInline(trimmed.slice(2).trim())
        )
      );
      continue;
    }

    // ## H2 header
    if (/^## /.test(trimmed)) {
      flushBlock();
      elements.push(
        React.createElement("h3", { key: key++, className: "text-lg font-bold mt-6 mb-3 first:mt-0" },
          renderInline(trimmed.slice(3).trim())
        )
      );
      continue;
    }

    // ### H3 header
    if (/^### /.test(trimmed)) {
      flushBlock();
      elements.push(
        React.createElement("h4", { key: key++, className: "text-base font-bold mt-5 mb-2" },
          renderInline(trimmed.slice(4).trim())
        )
      );
      continue;
    }

    currentBlock.push(line);
  }

  flushBlock();
  return elements;
}

function renderInline(text: string): React.ReactNode[] {
  // Handle **bold** and *italic* inline
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, j) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return React.createElement("strong", { key: j, className: "font-semibold" }, part.slice(2, -2));
    }
    if (part.startsWith("*") && part.endsWith("*") && !part.startsWith("**")) {
      return React.createElement("em", { key: j }, part.slice(1, -1));
    }
    return part;
  });
}

export function DebateView({ forArgument, againstArgument }: { forArgument: string; againstArgument: string }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
      <div className="rounded-xl border-2 border-green-300 dark:border-green-800 overflow-hidden">
        <div className="bg-green-600 dark:bg-green-700 px-5 py-3">
          <h2 className="text-white font-bold text-lg tracking-wide">FOR</h2>
        </div>
        <div className="p-5 text-zinc-800 dark:text-zinc-200 text-[15px]">
          {renderMarkdown(forArgument)}
        </div>
      </div>
      <div className="rounded-xl border-2 border-red-300 dark:border-red-800 overflow-hidden">
        <div className="bg-red-600 dark:bg-red-700 px-5 py-3">
          <h2 className="text-white font-bold text-lg tracking-wide">AGAINST</h2>
        </div>
        <div className="p-5 text-zinc-800 dark:text-zinc-200 text-[15px]">
          {renderMarkdown(againstArgument)}
        </div>
      </div>
    </div>
  );
}
