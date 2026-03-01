"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import FilterBar, { FilterState } from "@/components/psychologists/FilterBar";
import TherapistListCard from "@/components/psychologists/TherapistListCard";
import { Button } from "@/components/ui/button";
import { ChevronDown, Loader2 } from "lucide-react";

interface PsychologistFromAPI {
  id: string;
  userId: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
  credentials: string;
  experience: number;
  bio: string;
  specializations: string[];
  price60: number;
  price90: number;
  rating: number;
  reviewCount: number;
  user: {
    name: string;
    image: string | null;
  };
  hospital: {
    name: string;
    location: string;
  } | null;
}

interface TherapistHighlight {
  icon: string;
  label: string;
  color: string;
}

interface TherapistCardData {
  id: string;
  name: string;
  title: string;
  image: string;
  verified: boolean;
  rating: number;
  reviewCount: number;
  location: string;
  priceRange: string;
  languages: string[];
  conditions: string[];
  about: string;
  experience: number;
  sessionDuration: string;
  nextAvailable: string;
  highlights: TherapistHighlight[];
  insurances?: string[];
}

interface PsychologistsApiResponse {
  psychologists?: PsychologistFromAPI[];
  showingPendingFallback?: boolean;
  pagination?: {
    totalPages?: number;
  };
  error?: string;
}

interface CachedPsychologistsPayload {
  psychologists: TherapistCardData[];
  totalPages: number;
  savedAt: number;
}

type SearchParamsReader = {
  get: (name: string) => string | null;
};

const DEFAULT_PAGE = 1;
const DEFAULT_TOTAL_PAGES = 1;
const PSYCHOLOGISTS_PAGE_SIZE = 20;
const PSYCHOLOGISTS_FETCH_TIMEOUT_MS = 12_000;
const PSYCHOLOGISTS_CACHE_MAX_AGE_MS = 5 * 60 * 1000;
const PSYCHOLOGISTS_CACHE_KEY = "find-psychologists:first-page:v1";
const PRICE_UNIT_DIVISOR = 100;
const PRICE_FILTER_LOW_MAX = 50;
const PRICE_FILTER_MID_MAX = 60;
const DEFAULT_FETCH_ERROR_MESSAGE = "Unable to load psychologists right now.";
const FETCH_TIMEOUT_ERROR_MESSAGE =
  "Loading therapists is taking longer than expected. Please try again.";
const BOOKING_SUCCESS_MESSAGE = "Your appointment was booked successfully.";
const DEFAULT_THERAPIST_NAME = "Therapist";
const DEFAULT_THERAPIST_LOCATION = "Remote";
const DEFAULT_THERAPIST_IMAGE =
  "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300&h=300";
const DEFAULT_THERAPIST_LANGUAGE = "English";
const DEFAULT_SESSION_DURATION = "50 min";
const DEFAULT_NEXT_AVAILABLE = "Tomorrow";
const ONLINE_HIGHLIGHT_LABEL = "Available Online";
const ONLINE_HIGHLIGHT_ICON = "Video";
const ONLINE_HIGHLIGHT_COLOR = "bg-green-100 text-green-800";

const createEmptyFilters = (): FilterState => ({
  location: [],
  insurance: [],
  language: [],
  conditions: [],
  priceRange: [],
  ethnicity: [],
});

const hasActiveFilters = (filters: FilterState) =>
  filters.location.length > 0 ||
  filters.insurance.length > 0 ||
  filters.language.length > 0 ||
  filters.conditions.length > 0 ||
  filters.priceRange.length > 0 ||
  filters.ethnicity.length > 0;

const isDefaultBrowseState = (filters: FilterState, page: number) =>
  page === DEFAULT_PAGE && !hasActiveFilters(filters);

const readCachedPsychologists = (): CachedPsychologistsPayload | null => {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(PSYCHOLOGISTS_CACHE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<CachedPsychologistsPayload>;
    if (!Array.isArray(parsed.psychologists)) return null;

    const savedAt = typeof parsed.savedAt === "number" ? parsed.savedAt : 0;
    if (Date.now() - savedAt > PSYCHOLOGISTS_CACHE_MAX_AGE_MS) return null;

    const totalPages =
      typeof parsed.totalPages === "number" && parsed.totalPages > 0
        ? parsed.totalPages
        : DEFAULT_TOTAL_PAGES;

    return {
      psychologists: parsed.psychologists,
      totalPages,
      savedAt,
    };
  } catch {
    return null;
  }
};

const writeCachedPsychologists = (
  psychologists: TherapistCardData[],
  totalPages: number
) => {
  if (typeof window === "undefined") return;

  try {
    const payload: CachedPsychologistsPayload = {
      psychologists,
      totalPages: totalPages > 0 ? totalPages : DEFAULT_TOTAL_PAGES,
      savedAt: Date.now(),
    };
    window.sessionStorage.setItem(
      PSYCHOLOGISTS_CACHE_KEY,
      JSON.stringify(payload)
    );
  } catch {
    // Ignore storage failures (private mode, quota, etc).
  }
};

const getBookingNotice = (searchParams: SearchParamsReader | null): string | null => {
  if (!searchParams || searchParams.get("booked") !== "1") {
    return null;
  }

  const bookedDate = searchParams.get("bookedDate");
  const bookedTime = searchParams.get("bookedTime");
  if (bookedDate && bookedTime) {
    return `You booked appointment on ${bookedDate} at ${bookedTime}.`;
  }

  return BOOKING_SUCCESS_MESSAGE;
};

const buildPsychologistsQueryParams = (filters: FilterState, page: number) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: PSYCHOLOGISTS_PAGE_SIZE.toString(),
  });

  if (filters.conditions.length > 0) {
    params.append("specialization", filters.conditions[0]);
  }

  return params;
};

const formatPriceRange = (price60: number, price90: number) =>
  `$${(price60 / PRICE_UNIT_DIVISOR).toFixed(0)} - $${(price90 / PRICE_UNIT_DIVISOR).toFixed(0)}`;

const mapPsychologistToCard = (psychologist: PsychologistFromAPI): TherapistCardData => ({
  id: psychologist.id,
  name: psychologist.user?.name || DEFAULT_THERAPIST_NAME,
  title: psychologist.credentials,
  image: psychologist.user?.image || DEFAULT_THERAPIST_IMAGE,
  verified: psychologist.status === "APPROVED",
  rating: psychologist.rating,
  reviewCount: psychologist.reviewCount,
  location: psychologist.hospital?.location || DEFAULT_THERAPIST_LOCATION,
  priceRange: formatPriceRange(psychologist.price60, psychologist.price90),
  languages: [DEFAULT_THERAPIST_LANGUAGE],
  conditions: psychologist.specializations,
  about: psychologist.bio,
  experience: psychologist.experience,
  sessionDuration: DEFAULT_SESSION_DURATION,
  nextAvailable: DEFAULT_NEXT_AVAILABLE,
  highlights: [
    {
      icon: ONLINE_HIGHLIGHT_ICON,
      label: ONLINE_HIGHLIGHT_LABEL,
      color: ONLINE_HIGHLIGHT_COLOR,
    },
  ],
});

const getFetchErrorMessage = (payload: PsychologistsApiResponse) =>
  typeof payload.error === "string" ? payload.error : DEFAULT_FETCH_ERROR_MESSAGE;

const parseMinPriceFromRange = (priceRange: string) => {
  const match = priceRange.match(/\$(\d+)/);
  return match ? Number.parseInt(match[1], 10) : null;
};

const matchesLocationFilter = (therapist: TherapistCardData, filters: FilterState) => {
  if (filters.location.length === 0) return true;

  const isOnlineSelected = filters.location.some((location) =>
    location.includes("Online")
  );
  const hasOnlineHighlight = therapist.highlights?.some(
    (highlight) => highlight.label === ONLINE_HIGHLIGHT_LABEL
  );
  const isOnlineLocation = therapist.location.toLowerCase().includes("online");
  const isOnline = hasOnlineHighlight || isOnlineLocation;
  const hasMatchingLocation = filters.location.some((location) =>
    therapist.location.includes(location)
  );

  return (isOnlineSelected && isOnline) || hasMatchingLocation;
};

const matchesLanguageFilter = (therapist: TherapistCardData, filters: FilterState) => {
  if (filters.language.length === 0) return true;
  return filters.language.some((language) => therapist.languages.includes(language));
};

const matchesInsuranceFilter = (therapist: TherapistCardData, filters: FilterState) => {
  if (filters.insurance.length === 0) return true;
  if (!therapist.insurances) return false;
  return filters.insurance.some((insurance) => therapist.insurances?.includes(insurance));
};

const matchesPriceFilter = (therapist: TherapistCardData, filters: FilterState) => {
  if (filters.priceRange.length === 0) return true;

  const minPrice = parseMinPriceFromRange(therapist.priceRange);
  if (minPrice === null) return true;

  const matchesLow =
    filters.priceRange.includes("low") && minPrice < PRICE_FILTER_LOW_MAX;
  const matchesMid =
    filters.priceRange.includes("mid") &&
    minPrice >= PRICE_FILTER_LOW_MAX &&
    minPrice <= PRICE_FILTER_MID_MAX;
  const matchesHigh =
    filters.priceRange.includes("high") && minPrice > PRICE_FILTER_MID_MAX;

  return matchesLow || matchesMid || matchesHigh;
};

const matchesClientFilters = (therapist: TherapistCardData, filters: FilterState) =>
  matchesLocationFilter(therapist, filters) &&
  matchesLanguageFilter(therapist, filters) &&
  matchesInsuranceFilter(therapist, filters) &&
  matchesPriceFilter(therapist, filters);

function FindPsychologistsPageContent() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<FilterState>(createEmptyFilters());
  const [psychologists, setPsychologists] = useState<TherapistCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [devPendingNotice, setDevPendingNotice] = useState(false);
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [totalPages, setTotalPages] = useState(DEFAULT_TOTAL_PAGES);
  const hasHydratedCacheRef = useRef(false);

  const bookingNotice = useMemo(() => getBookingNotice(searchParams), [searchParams]);

  useEffect(() => {
    const cached = readCachedPsychologists();
    if (!cached) return;

    setPsychologists(cached.psychologists);
    setTotalPages(cached.totalPages);
    setLoading(false);
    hasHydratedCacheRef.current = true;
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const resetPsychologists = () => {
      setPsychologists([]);
      setTotalPages(DEFAULT_TOTAL_PAGES);
    };

    const fetchPsychologists = async () => {
      const shouldShowBlockingLoader =
        page === DEFAULT_PAGE && !hasHydratedCacheRef.current;
      setLoading(shouldShowBlockingLoader);
      setFetchError(null);
      setDevPendingNotice(false);

      const controller = new AbortController();
      const timeoutId = window.setTimeout(
        () => controller.abort(),
        PSYCHOLOGISTS_FETCH_TIMEOUT_MS
      );

      try {
        const params = buildPsychologistsQueryParams(filters, page);
        const response = await fetch(`/api/psychologists?${params}`, {
          signal: controller.signal,
        });
        const payload = (await response.json().catch(() => ({}))) as PsychologistsApiResponse;

        if (isCancelled) return;

        if (!response.ok) {
          setFetchError(getFetchErrorMessage(payload));
          if (page === DEFAULT_PAGE) {
            resetPsychologists();
          }
          return;
        }

        const apiPsychologists = Array.isArray(payload.psychologists)
          ? payload.psychologists
          : [];
        const mappedPsychologists = apiPsychologists.map(mapPsychologistToCard);
        const nextTotalPages =
          Number(payload.pagination?.totalPages) || DEFAULT_TOTAL_PAGES;

        setDevPendingNotice(Boolean(payload.showingPendingFallback));
        setPsychologists((previous) =>
          page === DEFAULT_PAGE
            ? mappedPsychologists
            : [...previous, ...mappedPsychologists]
        );
        setTotalPages(nextTotalPages);

        if (isDefaultBrowseState(filters, page)) {
          writeCachedPsychologists(mappedPsychologists, nextTotalPages);
          hasHydratedCacheRef.current = true;
        }
      } catch (error) {
        if (isCancelled) return;

        const message =
          error instanceof DOMException && error.name === "AbortError"
            ? FETCH_TIMEOUT_ERROR_MESSAGE
            : error instanceof Error
            ? error.message
            : DEFAULT_FETCH_ERROR_MESSAGE;
        setFetchError(message);
        if (page === DEFAULT_PAGE && !hasHydratedCacheRef.current) {
          resetPsychologists();
        }
      } finally {
        window.clearTimeout(timeoutId);
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchPsychologists();

    return () => {
      isCancelled = true;
    };
  }, [filters, page]);

  const handleApplyFilters = (newFilters: FilterState) => {
    setFilters(newFilters);
    setPage(DEFAULT_PAGE);
  };

  const handleClearFilters = () => {
    setFilters(createEmptyFilters());
    setPage(DEFAULT_PAGE);
  };

  const filteredPsychologists = useMemo(
    () =>
      psychologists.filter((therapist) => matchesClientFilters(therapist, filters)),
    [psychologists, filters]
  );

  return (
    <div className="min-h-screen bg-[#F6F2EA]">
      {/* Optional: Top Gradient Wash */}
      <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-[#EBEBFF]/50 via-orange-50/30 to-transparent pointer-events-none" />

      <div className="relative max-w-[1400px] mx-auto px-4 md:px-8 py-12 pt-32">
        
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#121E0D] mb-2 font-display">
            Therapists {filters.location.length > 0 
              ? `in ${filters.location.length === 1 ? filters.location[0] : 'Multiple Locations'}`
              : 'Online & Worldwide'}
          </h1>
          <p className="text-[#425234] text-sm flex items-center gap-1">
            {filteredPsychologists.length} results {filters.location.length > 0 && (
                <>in <span className="font-semibold text-[#121E0D] flex items-center cursor-pointer hover:underline mx-1">
                    {filters.location.length === 1 ? filters.location[0] : `${filters.location.length} locations`} 
                    <ChevronDown size={14} className="ml-0.5" />
                </span></>
            )}
          </p>
        </div>

        {/* Filter Bar */}
        {bookingNotice && (
          <div className="mb-4 text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
            {bookingNotice}
          </div>
        )}
        <FilterBar activeFilters={filters} onApplyFilters={handleApplyFilters} />

        {/* Results List */}
        <div className="space-y-4">
           {devPendingNotice && (
              <div className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                Showing pending doctors in development mode because no approved doctors were found yet.
              </div>
           )}
           {loading ? (
              <div className="text-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-4" />
                  <p className="text-slate-500">Loading psychologists...</p>
              </div>
           ) : filteredPsychologists.length > 0 ? (
              filteredPsychologists.map((psych) => (
                <TherapistListCard key={psych.id} therapist={psych} />
              ))
           ) : (
               <div className="text-center py-20 text-slate-500 bg-slate-50 rounded-xl border border-slate-100 mt-4">
                   <p className="text-lg font-medium text-slate-700">
                     {fetchError ? "We could not load psychologists right now." : "No psychologists match your current filters."}
                   </p>
                   <p className="text-slate-400 text-sm mt-1">
                     {fetchError ? fetchError : "Try adjusting your filters or search criteria."}
                   </p>
                   <Button variant="link" onClick={handleClearFilters} className="text-primary mt-4">Clear all filters</Button>
               </div>
           )}
        </div>

        {/* Pagination / Load More */}
        {!loading && filteredPsychologists.length > 0 && page < totalPages && (
            <div className="mt-12 text-center pb-12">
                 <Button
                    variant="outline"
                    size="lg"
                    className="min-w-[200px] border-slate-200 text-slate-600 hover:bg-slate-50"
                    onClick={() => setPage(page + 1)}
                 >
                    Load More Results
                 </Button>
            </div>
        )}

      </div>
    </div>
  );
}

function FindPsychologistsPageFallback() {
  return (
    <div className="min-h-screen bg-[#F6F2EA]">
      <div className="relative max-w-[1400px] mx-auto px-4 md:px-8 py-12 pt-32">
        <div className="text-center py-20">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-4" />
          <p className="text-slate-500">Loading psychologists...</p>
        </div>
      </div>
    </div>
  );
}

export default function FindPsychologistsPage() {
  return (
    <Suspense fallback={<FindPsychologistsPageFallback />}>
      <FindPsychologistsPageContent />
    </Suspense>
  );
}
