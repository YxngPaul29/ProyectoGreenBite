import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dsntqpupixcnsdontexe.supabase.co';
const supabaseKey = 'sb_publishable_rE0_bZvxx7HdI0jPhQSHXg_4SRtJ_nB';

export const supabase = createClient(supabaseUrl, supabaseKey);
