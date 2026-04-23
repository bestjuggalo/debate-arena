"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SubmitForm() {
  const [topic, setTopic] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const charCount = topic.trim().length;
  const isValid = charCount >= 10 && charCount <= 500;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || submitting) return;
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/debates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim() }),
      });
      const data = await res.json();
      if (res.status === 422) {
        setError(data.reason ?? "Topic was rejected by moderation.");
        setSubmitting(false);
        return;
      }
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        setSubmitting(false);
        return;
      }
      router.push("/debates/" + data.id);
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="relative">
        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder='Enter a debate topic, e.g. "Cities should ban single-family zoning"'
          rows={3}
          maxLength={500}
          className="w-full px-4 py-3 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 resize-none text-lg transition-colors"
        />
        <div className="flex justify-between items-center mt-2 px-1">
          <span className={`text-sm ${charCount > 0 && charCount < 10 ? "text-red-500" : "text-zinc-400"}`}>
            {charCount}/500 characters {charCount > 0 && charCount < 10 ? "(min 10)" : ""}
          </span>
          <button
            type="submit"
            disabled={!isValid || submitting}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-400 dark:disabled:bg-zinc-600 text-white font-semibold rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            {submitting ? "Submitting..." : "Start Debate"}
          </button>
        </div>
      </div>
      {error && (
        <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}
    </form>
  );
}
