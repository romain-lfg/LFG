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
type UserProfileFormat = {
    user_auth_id: string | null;  // uuid maps to string, nullable
    created_at: string;  // timestamp with time zone maps to string (or Date)
    bounties_accepted_date: string[] | null;  // ARRAY type, nullable
    bounties_accepted_id: string[] | null;  // ARRAY type, nullable
    bounties_rewards_received: number[] | null;  // ARRAY type, nullable
    bounties_created_date: string[] | null;  // ARRAY type, nullable
    bounties_created_id: string[] | null;  // ARRAY type, nullable
    bounties_rewards_paid: number[] | null;  // ARRAY type, nullable
    living_document: string[] | null;  // ARRAY type, nullable
    telegram_id: number | null;  // ARRAY type, nullable
}

async function createUpdateUserProfile(userAuthId: string, userData: Partial<UserProfileFormat>) {
    // First check if user profile exists
    const { data: existingProfile } = await supabase
        .from('User_Profiles')
        .select('*')
        .eq('user_auth_id', userAuthId)
        .single()

    // Only include created_at if this is a new profile
    console.log("existingProfile:", existingProfile);
    const dataToUpsert = {
        user_auth_id: userAuthId,
        ...userData,
    }
    if (existingProfile) {
        dataToUpsert.created_at = existingProfile.created_at;
    } else {
        dataToUpsert.created_at = new Date().toISOString();
    }


    const { data, error } = await supabase
        .from('User_Profiles')
        .upsert(dataToUpsert, {
            onConflict: 'user_auth_id',  // specify the unique constraint
            ignoreDuplicates: false      // update if exists
        })
        .select()

    if (error) {
        throw new Error(`Error updating user profile: ${error.message}`)
    }

    return data
}

async function main() {

    //await testCreateUpdateUserProfile();
    //const data = await getSingleUserData("123e4567-e89b-12d3-a456-426614174000");//await queryTable('User_Profiles')
    const data = await getUserData();
    console.log('Data:', data)
}

async function testCreateUpdateUserProfile() {
    // Use a proper UUID format
    const userId = "123e4567-e89b-12d3-a456-426614174000" // Example UUID
    const userData: Partial<UserProfileFormat> = {
        created_at: "2025-02-28T01:49:39.021+00:00",
        bounties_accepted_date: ["2024-03-20T00:00:00Z"],  // Full ISO timestamp
        bounties_accepted_id: ["123e4567-e89b-12d3-a456-426614174001"], // Example UUID
        bounties_rewards_received: [0.2],  // Regular number
        bounties_created_date: ["2024-03-15T00:00:00Z"],  // Full ISO timestamp
        bounties_created_id: ["123e4567-e89b-12d3-a456-426614174002"], // Example UUID
        bounties_rewards_paid: [0.3],
        living_document: ["User knows typescript", "User knows python", "User knows solidity"],  // Regular number
        telegram_id: 1234567890,
    }

    try {
        const result = await createUpdateUserProfile(userId, userData)
        console.log('User profile updated successfully:', result)
    } catch (error) {
        console.error('Failed to update user profile:', error)
    }
}

async function getUserData() {
    const { data, error } = await supabase
        .from("User_Profiles")
        .select('*')

    if (error) {
        throw new Error(`Error querying table ${"User_Profiles"}: ${error.message}`)
    }

    return data
}

async function getSingleUserData(userId: string) {
    const { data, error } = await supabase
        .from('User_Profiles')
        .select('*')
        .eq('user_auth_id', userId)
        .single()

    if (error) {
        throw new Error(`Error querying user ${userId}: ${error.message}`)
    }

    return data
}

export { createUpdateUserProfile, getUserData, getSingleUserData }
//main();