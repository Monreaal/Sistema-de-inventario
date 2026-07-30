const SUPABASE_URL = "https://smzcftfzjztfqktdeiek.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_xdOEW8sVCEVjUM8JK_uQ-A_OSDpc106";

const { createClient } = supabase;
export const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);