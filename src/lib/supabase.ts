import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://aysbkajngsevyxqzepmh.supabase.co';
const supabaseKey = 'sb_publishable_p5dhExtf5TC94l4KMEBDBA_-mqdpFAn';

export const supabase = createClient(supabaseUrl, supabaseKey);
