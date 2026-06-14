"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabaseClient } from "@/lib/supabase";

export function AddCommunityForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmed = name.trim();
    if (!trimmed) return;

    setLoading(true);

    const { error } = await supabaseClient
      .from("communities")
      .insert({ name: trimmed, status: "active" });

    setLoading(false);

    if (error) {
      alert(`Failed to add community: ${error.message}`);
      return;
    }

    setName("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="inline-form">
      <input
        type="text"
        placeholder="Community name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? "Adding..." : "Add"}
      </button>
    </form>
  );
}
