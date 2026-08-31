import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dnzsjeruminmwmpadsgl.supabase.co';
const supabaseKey = 'sb_publishable_hYVLpiydO-XdsvKJZWJuOQ_zUalCNaY';

export const supabase = createClient(supabaseUrl, supabaseKey);
