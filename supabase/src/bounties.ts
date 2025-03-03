import { config } from 'dotenv'
import { join } from 'path'
import { createClient } from '@supabase/supabase-js'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure dotenv to look in parent directory
config({ path: join(__dirname, '../../.env') })

// Add verification for environment variables
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing required environment variables SUPABASE_URL or SUPABASE_KEY')
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Add this type definition at the top level of your file
type BountyFormat = {
    user_auth_id: string;  // uuid, NOT NULL
    created_at: string;    // timestamp with time zone, NOT NULL
    title: string | null;  // text, nullable
    description: string | null;  // text, nullable
    required_skills: any[] | null;  // ARRAY, nullable
    owner_address: string | null;  // text, nullable
    date_due: string | null;  // timestamp with time zone, nullable
    estimated_time: number | null;  // real, nullable
    id: number | null;  // bigint, nullable
    reward_amount: number | null;  // double precision, nullable
    state: string | null;  // text, nullable
}

const testBounty: BountyFormat = {
    user_auth_id: "123e4567-e89b-12d3-a456-426614174000", // Example UUID
    created_at: new Date().toISOString(),
    title: "Build a Smart Contract Testing Framework",
    description: "Create an automated testing framework for Solidity smart contracts with comprehensive coverage reporting",
    required_skills: ["Solidity", "TypeScript", "Smart Contracts", "Testing"],
    owner_address: "0x1234567890123456789012345678901234567890",
    date_due: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    estimated_time: 40.5, // hours
    id: 1,
    reward_amount: 0.5, // ETH
    state: "OPEN"
}

async function main() {
    await updateCreateBounty(testBounty.id!, testBounty)
    const bounties = await getBounties()
    console.log("bounties:", bounties)
}
async function getBounties() {
    const { data, error } = await supabase
        .from('Bounties')
        .select('*')

    if (error) {
        throw new Error(`Error fetching bounties: ${error.message}`)
    }

    return data
}

async function updateCreateBounty(bountyId: number, bountyData: Partial<BountyFormat>) {
    // First check if bounty exists
    console.log("checking for bounty with id:", bountyId);
    const { data: existingBounty } = await supabase
        .from('Bounties')
        .select('*')
        .eq('id', bountyId)
        .single()

    // Only include created_at if this is a new bounty
    console.log("existingBounty:", existingBounty);
    const dataToUpsert = {
        id: bountyId,
        ...bountyData,
    }
    if (existingBounty) {
        dataToUpsert.created_at = existingBounty.created_at;
    } else {
        dataToUpsert.created_at = new Date().toISOString();
    }

    const { data, error } = await supabase
        .from('Bounties')
        .upsert(dataToUpsert, {
            onConflict: 'id',  // specify the unique constraint
            ignoreDuplicates: false      // update if exists
        })
        .select()

    if (error) {
        throw new Error(`Error updating bounty: ${error.message}`)
    }

    return data
}

async function testFn() {
    console.log("testFn")
}

//main();

export { getBounties, updateCreateBounty, testFn }