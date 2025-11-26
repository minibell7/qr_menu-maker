import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load env vars manually
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = Object.fromEntries(
    envContent.split('\n').map(line => {
        const [key, value] = line.split('=');
        return [key, value?.replace(/"/g, '').trim()];
    })
);

const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = envVars['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAnon() {
    console.log("Attempting anonymous sign-in...");
    const { data: authData, error: authError } = await supabase.auth.signInAnonymously();

    if (authError) {
        console.error("Sign-in failed:", authError.message);
        return;
    }

    console.log("Sign-in successful! User ID:", authData.user?.id);

    const { data, error } = await supabase
        .from('restaurants')
        .insert([
            { name: 'Anon Test Restaurant', user_id: authData.user?.id }
        ])
        .select();

    if (error) {
        console.error('Insert failed:', error.message);
    } else {
        console.log('Insert successful:', data);

        // Cleanup
        await supabase.from('restaurants').delete().eq('id', data[0].id);
        console.log("Cleanup successful");
    }
}

testAnon();
