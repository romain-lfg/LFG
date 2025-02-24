import { config } from 'dotenv'
import { join } from 'path'
import { createClient } from '@supabase/supabase-js'

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
type UserProfile = {
    user_auth_id: string | null;  // uuid maps to string, nullable
    created_at: string;  // timestamp with time zone maps to string (or Date)
    bounties_accepted_date: string[] | null;  // ARRAY type, nullable
    bounties_accepted_id: string[] | null;  // ARRAY type, nullable
    bounties_rewards_received: number[] | null;  // ARRAY type, nullable
    bounties_created_date: string[] | null;  // ARRAY type, nullable
    bounties_created_id: string[] | null;  // ARRAY type, nullable
    bounties_rewards_paid: number[] | null;  // ARRAY type, nullable
}

async function updateUserProfile(userAuthId: string, userData: Partial<UserProfile>) {
    // Ensure we have a user_auth_id and created_at for new entries
    const dataToUpsert = {
        user_auth_id: userAuthId,
        created_at: new Date().toISOString(),
        ...userData
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

    //await testCreateUpdateBounty();
    const data = await queryUser("123e4567-e89b-12d3-a456-426614174000");//await queryTable('User_Profiles')
    console.log('Data:', data)
}

async function testCreateUpdateBounty() {
    // Use a proper UUID format
    const userId = "123e4567-e89b-12d3-a456-426614174000" // Example UUID
    const userData: Partial<UserProfile> = {
        bounties_accepted_date: ["2024-03-20T00:00:00Z"],  // Full ISO timestamp
        bounties_accepted_id: ["123e4567-e89b-12d3-a456-426614174001"], // Example UUID
        bounties_rewards_received: [100],  // Regular number
        bounties_created_date: ["2024-03-15T00:00:00Z"],  // Full ISO timestamp
        bounties_created_id: ["123e4567-e89b-12d3-a456-426614174002"], // Example UUID
        bounties_rewards_paid: [51]  // Regular number
    }

    try {
        const result = await updateUserProfile(userId, userData)
        console.log('User profile updated successfully:', result)
    } catch (error) {
        console.error('Failed to update user profile:', error)
    }
}

async function queryTable(tableName: string) {
    const { data, error } = await supabase
        .from(tableName)
        .select('*')

    if (error) {
        throw new Error(`Error querying table ${tableName}: ${error.message}`)
    }

    return data
}

async function queryUser(userId: string) {
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


main().catch(console.error)