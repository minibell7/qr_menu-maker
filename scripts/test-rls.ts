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

console.log('Available keys:', Object.keys(envVars));

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
    const randomId = crypto.randomUUID();
    const { data, error } = await supabase
        .from('restaurants')
        .insert([
            { name: 'Test Restaurant', user_id: randomId }
        ])
        .select();

    if (error) {
        console.error('Insert failed:', error.message);
    } else {
        console.log('Insert successful:', data);
    }
}

testInsert();
