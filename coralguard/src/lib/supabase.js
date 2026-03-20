// Supabase client setup with local fallbacks for storing and retrieving reef reports.
import { createClient } from "@supabase/supabase-js";

const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const LOCAL_REPORTS_KEY = "coralguard_local_reports";

function normalizeSupabaseUrl(url) {
  if (!url) return "";
  const trimmed = String(url).trim();

  // Accept raw project ref and transform to API host.
  if (/^[a-z0-9]{20}$/i.test(trimmed)) {
    return `https://${trimmed}.supabase.co`;
  }

  // If user pasted Supabase dashboard URL, extract project ref.
  const dashboardMatch = trimmed.match(/\/project\/([a-z0-9]{20})\b/i);
  if (dashboardMatch?.[1]) {
    return `https://${dashboardMatch[1]}.supabase.co`;
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

const supabaseUrl = normalizeSupabaseUrl(rawSupabaseUrl);
const isPlaceholder = (value) =>
  !value ||
  value.includes("your_project_url_here") ||
  value.includes("your_anon_key_here");
const looksLikeSupabaseUrl = (value) =>
  /^https?:\/\/[a-z0-9-]+\.supabase\.co$/i.test(value);
const hasValidSupabaseConfig =
  !isPlaceholder(supabaseUrl) &&
  !isPlaceholder(supabaseAnonKey) &&
  looksLikeSupabaseUrl(supabaseUrl);

if (!hasValidSupabaseConfig) {
  // Non-fatal: warn so developers know to set env vars.
  // Guarding prevents runtime exceptions when keys are missing.
  console.warn(
    "Supabase environment variables are invalid/missing. Falling back to local report storage.",
  );
}

let supabaseClient = null;
if (hasValidSupabaseConfig) {
  try {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.warn(
      "Supabase client initialization failed. Falling back to mock mode.",
      error,
    );
  }
}

export const supabase = supabaseClient;
export const isSupabaseConfigured = !!supabaseClient;

function getLocalReports() {
  try {
    const raw = localStorage.getItem(LOCAL_REPORTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("Failed to read local reports:", error);
    return [];
  }
}

function setLocalReports(reports) {
  try {
    localStorage.setItem(LOCAL_REPORTS_KEY, JSON.stringify(reports));
  } catch (error) {
    console.warn("Failed to write local reports:", error);
  }
}

// ── REEF REPORTS ──────────────────────────────────────────────────────────────

export async function submitReport(reportData, imageFile) {
  try {
    // 1. Upload image to Supabase Storage
    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
    let publicUrl = null;

    const localRecord = {
      id: Date.now(),
      location: reportData.location || "Other / Unknown",
      health_score: reportData.healthScore,
      status: reportData.status,
      bleaching_percent: reportData.bleachingPercent,
      coral_coverage: reportData.coralCoverage,
      water_clarity: reportData.waterClarity,
      main_threat: reportData.mainThreat,
      species: reportData.species,
      recommendation: reportData.recommendation,
      urgency: reportData.urgency,
      image_url: publicUrl,
      reported_at: new Date().toISOString(),
      source: "local",
    };

    if (supabase) {
      const { error: uploadError } = await supabase.storage
        .from("reef-photos")
        .upload(fileName, imageFile);

      if (uploadError) throw uploadError;

      // getPublicUrl is synchronous in the client – return shape: { data: { publicUrl } }
      const { data: urlData } =
        supabase.storage.from("reef-photos").getPublicUrl(fileName) || {};
      publicUrl = urlData?.publicUrl || null;

      // 3. Save report to database
      const { data, error } = await supabase
        .from("reef_reports")
        .insert([
          {
            location: reportData.location,
            health_score: reportData.healthScore,
            status: reportData.status,
            bleaching_percent: reportData.bleachingPercent,
            coral_coverage: reportData.coralCoverage,
            water_clarity: reportData.waterClarity,
            main_threat: reportData.mainThreat,
            species: reportData.species,
            recommendation: reportData.recommendation,
            urgency: reportData.urgency,
            image_url: publicUrl,
            reported_at: new Date().toISOString(),
          },
        ])
        .select();

      if (error) throw error;
      return { success: true, data: data?.[0] || null, source: "supabase" };
    }

    // If Supabase is not configured, persist locally so reports still appear in UI
    const existingLocal = getLocalReports();
    setLocalReports([localRecord, ...existingLocal].slice(0, 100));
    return { success: true, data: localRecord, source: "local" };
  } catch (error) {
    console.error("Submit report error:", error);
    // Final fallback: keep user data in local storage even on upload/insert failure.
    const localRecord = {
      id: Date.now(),
      location: reportData.location || "Other / Unknown",
      health_score: reportData.healthScore,
      status: reportData.status,
      bleaching_percent: reportData.bleachingPercent,
      coral_coverage: reportData.coralCoverage,
      water_clarity: reportData.waterClarity,
      main_threat: reportData.mainThreat,
      species: reportData.species,
      recommendation: reportData.recommendation,
      urgency: reportData.urgency,
      image_url: null,
      reported_at: new Date().toISOString(),
      source: "local-fallback",
    };
    const existingLocal = getLocalReports();
    setLocalReports([localRecord, ...existingLocal].slice(0, 100));
    return {
      success: true,
      data: localRecord,
      warning: error?.message,
      source: "local-fallback",
    };
  }
}

export async function getReports(limit = 20) {
  const localReports = getLocalReports();
  if (!supabase) return localReports.slice(0, limit);

  const { data, error } = await supabase
    .from("reef_reports")
    .select("*")
    .order("reported_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Get reports error:", error);
    return localReports.slice(0, limit);
  }
  return (data || []).slice(0, limit);
}

export async function getReportsByLocation(location) {
  const localReports = getLocalReports();
  if (!supabase) {
    return localReports.filter((r) => r.location === location);
  }

  const { data, error } = await supabase
    .from("reef_reports")
    .select("*")
    .eq("location", location)
    .order("reported_at", { ascending: false });

  if (error) {
    console.error("Get reports by location error:", error);
    return localReports.filter((r) => r.location === location);
  }
  return data;
}

export async function deleteReport(reportOrId) {
  const report =
    typeof reportOrId === "object" && reportOrId !== null
      ? reportOrId
      : { id: reportOrId };
  const id = report?.id;
  const source = report?.source || "";

  try {
    // Always remove from local cache first
    const localReports = getLocalReports();
    const nextLocal = localReports.filter((r) => String(r.id) !== String(id));
    setLocalReports(nextLocal);

    if (!supabase || source.startsWith("local")) {
      return { success: true };
    }

    const { error } = await supabase.from("reef_reports").delete().eq("id", id);
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Delete report error:", error);
    return { success: false, error };
  }
}

export async function clearReports() {
  try {
    setLocalReports([]);
    if (!supabase) return { success: true };

    const { data: existing, error: fetchError } = await supabase
      .from("reef_reports")
      .select("id");
    if (fetchError) throw fetchError;

    const ids = (existing || []).map((r) => r.id).filter((id) => id != null);
    if (ids.length === 0) return { success: true };

    const { error: deleteError } = await supabase
      .from("reef_reports")
      .delete()
      .in("id", ids);
    if (deleteError) throw deleteError;

    return { success: true };
  } catch (error) {
    console.error("Clear reports error:", error);
    return { success: false, error };
  }
}
