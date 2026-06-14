"use client";

import { useRouter } from "next/navigation";

export function UserFilters({ currentTier }: { currentTier: string }) {
  const router = useRouter();

  function handleTierChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const tier = e.target.value;
    const params = new URLSearchParams();
    if (tier !== "all") {
      params.set("tier", tier);
    }
    router.push(`/users?${params.toString()}`);
  }

  return (
    <div className="filter-bar">
      <label htmlFor="tier-filter">Filter by tier:</label>
      <select
        id="tier-filter"
        value={currentTier}
        onChange={handleTierChange}
      >
        <option value="all">All</option>
        <option value="phone_only">Phone Only</option>
        <option value="vouched">Vouched</option>
        <option value="id_verified">ID Verified</option>
      </select>
    </div>
  );
}
