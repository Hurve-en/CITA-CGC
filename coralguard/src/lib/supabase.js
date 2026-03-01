import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const isPlaceholder = (value) =>
  !value || value.includes("your_project_url_here") || value.includes("your_anon_key_here");
const hasValidSupabaseConfig = !isPlaceholder(supabaseUrl) && !isPlaceholder(supabaseAnonKey);

if (!hasValidSupabaseConfig) {
  // Non-fatal: warn so developers know to set env vars.
  // Guarding prevents runtime exceptions when keys are missing.
  console.warn(
    "Supabase environment variables are not set. Supabase operations will be disabled or mocked.",
  );
}

let supabaseClient = null;
if (hasValidSupabaseConfig) {
  try {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.warn("Supabase client initialization failed. Falling back to mock mode.", error);
  }
}

export const supabase = supabaseClient;

// ── REEF REPORTS ──────────────────────────────────────────────────────────────

export async function submitReport(reportData, imageFile) {
  try {
    // 1. Upload image to Supabase Storage
    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
    let publicUrl = null;

    if (supabase) {
      const { error: uploadError } = await supabase.storage
        .from("reef-photos")
        .upload(fileName, imageFile);

      if (uploadError) throw uploadError;

      // getPublicUrl is synchronous in the client – return shape: { data: { publicUrl } }
      const { data: urlData } = supabase.storage.from("reef-photos").getPublicUrl(fileName) || {};
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
      return { success: true, data: data?.[0] || null };
    }

    // If env vars missing, mock the saved report (useful for local dev / hackathon demo)
    return {
      success: true,
      data: {
        id: Date.now(),
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
    };
  } catch (error) {
    console.error("Submit report error:", error);
    return { success: false, error };
  }
}

export async function getReports(limit = 20) {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("reef_reports")
    .select("*")
    .order("reported_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Get reports error:", error);
    return [];
  }
  return data;
}

export async function getReportsByLocation(location) {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("reef_reports")
    .select("*")
    .eq("location", location)
    .order("reported_at", { ascending: false });

  if (error) {
    console.error("Get reports by location error:", error);
    return [];
  }
  return data;
}
