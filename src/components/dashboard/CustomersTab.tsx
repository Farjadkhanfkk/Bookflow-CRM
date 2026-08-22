"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Search,
  UserPlus,
  ShieldAlert,
  RefreshCw,
  ChevronRight,
  Users,
  ArrowUpDown,
  X,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Sparkles,
} from "lucide-react";
import { CustomerDirectoryEntry } from "@/types";
import { fetchCustomersWithHistory, createCustomer } from "@/lib/customer-data";
import { CustomerDetailModal } from "./CustomerDetailModal";

interface CustomersTabProps {
  onSelectPatient?: (customer: CustomerDirectoryEntry) => void;
  onNewBookingForPatient?: (customer: CustomerDirectoryEntry) => void;
}

function getInitials(name: string): string {
  return (
    name
      .split(" ")
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() ||
    "-"
  );
}

function getTierBadge(tier: string) {
  switch (tier) {
    case "Founder Circle":
      return "bg-[#1A1C1A] text-white border border-[#3D403D]";
    case "Privilege VIP":
      return "bg-[#F5F7F4] text-[#8B9D83] font-semibold border border-[#8B9D83]/30";
    case "Standard":
    default:
      return "bg-stone-50 text-stone-700 border border-stone-200";
  }
}


export const CustomersTab: React.FC<CustomersTabProps> = ({
  onSelectPatient,
  onNewBookingForPatient,
}) => {
  const [customers, setCustomers] = useState<CustomerDirectoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState("all");
  const [sortBy, setSortBy] = useState<string>("recent");
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerDirectoryEntry | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchCustomersWithHistory();
      if (result.error) setError(result.error);
      setCustomers(result.customers);
    } catch {
      setError("Something went wrong while loading customer records.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const getLoyaltyTag = (customer: CustomerDirectoryEntry): string => {
    if (customer.totalSpend > 500) return "VIP Client";
    if (customer.visitsCount > 2) return "Regular";
    return "New Client";
  };

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);
    if (!newName.trim()) {
      setAddError("Full name is required.");
      return;
    }
    setAdding(true);
    try {
      await createCustomer({
        full_name: newName.trim(),
        email: newEmail.trim() || undefined,
        phone: newPhone.trim() || undefined,
      });
      setNewName("");
      setNewEmail("");
      setNewPhone("");
      setIsAddModalOpen(false);
      await loadCustomers();
    } catch (err: any) {
      console.error('Add customer error:', {
        message: err?.message,
        details: err?.details,
        hint: err?.hint,
        code: err?.code,
        raw: err,
      });
      setAddError(err?.message || "Failed to add customer. Please try again.");
    } finally {
      setAdding(false);
    }
  };

  const tiers = useMemo(
    () => Array.from(new Set(customers.map((c) => c.membershipTier))).sort(),
    [customers]
  );

  const filteredCustomers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let result = customers.filter((c) => {
      if (tierFilter !== "all" && c.membershipTier !== tierFilter) return false;
      if (q) {
        return (
          c.name.toLowerCase().includes(q) ||
          (c.email || "").toLowerCase().includes(q) ||
          (c.phone || "").toLowerCase().includes(q) ||
          c.membershipTier.toLowerCase().includes(q)
        );
      }
      return true;
    });

    result = [...result];
    switch (sortBy) {
      case "highest_spend":
        result.sort((a, b) => (b.totalSpend || 0) - (a.totalSpend || 0));
        break;
      case "most_visits":
        result.sort((a, b) => (b.visitsCount || 0) - (a.visitsCount || 0));
        break;
      case "recently_added":
        result.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
        break;
      case "recent":
      default:
        result.sort((a, b) => (b.lastVisit || "").localeCompare(a.lastVisit || ""));
        break;
    }
    return result;
  }, [customers, searchQuery, tierFilter, sortBy]);

  const handleCardClick = (customer: CustomerDirectoryEntry) => {
    setSelectedCustomer(customer);
    if (onSelectPatient) onSelectPatient(customer);
  };

          const handleCloseModal = () => setSelectedCustomer(null);

  return (
    <div className="space-y-6">
      {/* Error banner */}
      {error && (
        <div className="flex items-center justify-between gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-4">
          <div className="flex items-center gap-2.5 text-sm text-red-700">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={loadCustomers}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 text-[11px] font-semibold transition-colors shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
                  )}

      {/* Search & filter header */}
      {!loading && !error && (
        <div className="bg-white rounded-2xl p-4 border border-[#F0EDE8] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B8D8B]" />
            <input
              type="text"
              placeholder="Search customers by name, email, phone, tier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-[#F0EDE8] bg-[#FDFCFB] text-[#1A1C1A] placeholder:text-[#8B8D8B] focus:outline-none focus:ring-2 focus:ring-[#8B9D83]/40 focus:border-[#8B9D83] transition-shadow"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="text-xs rounded-xl border border-[#F0EDE8] bg-[#FDFCFB] text-[#1A1C1A] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8B9D83]/40 focus:border-[#8B9D83]"
            >
              <option value="all">All Membership Tiers</option>
              {tiers.map((tier) => (
                <option key={tier} value={tier}>
                  {tier}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs rounded-xl border border-[#F0EDE8] bg-[#FDFCFB] text-[#1A1C1A] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8B9D83]/40 focus:border-[#8B9D83]"
            >
              <option value="recent">Last Visit</option>
              <option value="highest_spend">Highest Spend</option>
              <option value="most_visits">Most Visits</option>
              <option value="recently_added">Recently Added</option>
            </select>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#8B9D83] text-white text-xs font-medium hover:bg-[#7A8C72] transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Customer</span>
            </button>
          </div>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-5 border border-[#F0EDE8] shadow-xs animate-pulse space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#F0EDE8]"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-3/4 rounded bg-[#F0EDE8]"></div>
                  <div className="h-2.5 w-1/2 rounded bg-[#F5F7F4]"></div>
                </div>
              </div>
              <div className="pt-3 border-t border-[#F5F7F4] grid grid-cols-2 gap-2">
                <div className="h-14 rounded-xl bg-[#F5F7F4]"></div>
                <div className="h-14 rounded-xl bg-[#F5F7F4]"></div>
              </div>
                        </div>
          ))}
        </div>
      )}{/* close loading skeleton

      Directory grid */}
      {!loading && !error && filteredCustomers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map((customer) => (
            <div
              key={customer.id}
              onClick={() => handleCardClick(customer)}
              className="bg-white rounded-2xl p-5 border border-[#F0EDE8] shadow-xs hover:border-[#8B9D83] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-[#F5F7F4] border border-[#F0EDE8] group-hover:border-[#8B9D83] flex items-center justify-center text-sm font-bold text-[#8B9D83] transition-colors shrink-0">
                      {getInitials(customer.name)}
                    </div>
                     <div className="min-w-0">
                       <h3 className="text-sm font-semibold text-[#1A1C1A] group-hover:text-[#8B9D83] transition-colors truncate">
                         {customer.name}
                       </h3>
                       <p className="text-xs text-[#6B6E6B] truncate">
                         {customer.phone || "No phone"}
                       </p>
                       <p className="text-[11px] text-[#8B8D8B] truncate">
                         {customer.email || "No email"}
                       </p>
                     </div>
                   </div>

                   <div className="flex flex-col items-end gap-1.5">
                     <span
                       className={`inline-block text-[10px] font-mono px-2 py-0.5 rounded-full uppercase shrink-0 ${getTierBadge(
                         customer.membershipTier
                       )}`}
                     >
                       {customer.membershipTier}
                     </span>
                     <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#F5F7F4] text-[#8B9D83] border border-[#F0EDE8]">
                       {getLoyaltyTag(customer)}
                     </span>
                   </div>
                </div>

                <div className="pt-3 border-t border-[#F0EDE8] space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="p-2 rounded-xl bg-[#FDFCFB] border border-[#F0EDE8]">
                      <span className="text-[10px] text-[#8B8D8B] block">
                        Lifetime Value
                      </span>
                       <span className="font-mono font-bold text-[#1A1C1A]">
                         ${(customer.totalSpend || 0).toLocaleString()}
                       </span>
                     </div>
                     <div className="p-2 rounded-xl bg-[#FDFCFB] border border-[#F0EDE8]">
                       <span className="text-[10px] text-[#8B8D8B] block">
                         Total Visits
                       </span>
                       <span className="font-mono font-bold text-[#1A1C1A]">
                         {customer.visitsCount || 0}
                       </span>
                     </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#8B9D83] pt-1">
                    <span className="cursor-pointer text-[11px] font-medium hover:underline">
                      View Full Medical History
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          ))}
                </div>
      )}{/* close directory grid

      Empty state */}
      {!loading && !error && filteredCustomers.length === 0 && (
        <div className="text-center py-16">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#F5F7F4] border border-[#F0EDE8] flex items-center justify-center">
            <Users className="w-5 h-5 text-[#8B9D83]" />
          </div>
          <p className="mt-4 text-sm text-[#8B8D8B]">
            {customers.length === 0
              ? "No customer records found on the database yet."
              : "No customers match your current search and filter criteria."}
          </p>
        </div>
      )}{/* close empty state */}

      {/* Add Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-start sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-[#F0EDE8] shadow-2xl my-4">
            <div className="p-6 border-b border-[#F0EDE8] flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-[#1A1C1A]">Add New Customer</h3>
                <p className="text-[11px] text-[#6B6E6B]">Create a new client record in the CRM</p>
              </div>
              <button
                onClick={() => { setIsAddModalOpen(false); setAddError(null); }}
                className="w-8 h-8 rounded-full bg-[#F5F7F4] hover:bg-[#E5E2DD] text-[#6B6E6B] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCustomer} className="p-6 space-y-4">
              {addError && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 text-red-700 text-xs">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{addError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#1A1C1A] mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E5E2DD] text-xs text-[#1A1C1A] bg-white focus:outline-hidden focus:border-[#8B9D83]"
                  placeholder="Jane Doe"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1A1C1A] mb-1">Email</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E5E2DD] text-xs text-[#1A1C1A] bg-white focus:outline-hidden focus:border-[#8B9D83]"
                    placeholder="jane@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1A1C1A] mb-1">Phone</label>
                  <input
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E5E2DD] text-xs text-[#1A1C1A] bg-white focus:outline-hidden focus:border-[#8B9D83]"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#F0EDE8] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => { setIsAddModalOpen(false); setAddError(null); }}
                  disabled={adding}
                  className="px-4 py-2 rounded-full border border-[#F0EDE8] text-xs font-semibold text-[#6B6E6B] hover:bg-[#F5F7F4]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adding}
                  className="px-6 py-2 rounded-full bg-[#8B9D83] text-white text-xs font-semibold hover:bg-[#7A8C72] shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {adding && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer detail modal */}
      {selectedCustomer && (
        <CustomerDetailModal
          customer={selectedCustomer}
          onClose={handleCloseModal}
          onNewBooking={onNewBookingForPatient}
        />
      )}
    </div>
  );
};

