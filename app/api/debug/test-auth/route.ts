import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { createClient } from '@supabase/supabase-js';

/**
 * Debugging API to test auth status and permissions in detail
 */
export async function GET(request: NextRequest) {
  const logs: string[] = [];
  const results: Record<string, any> = {};
  
  // 1. Check Supabase configuration
  logs.push('--- Supabase Configuration ---');
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  logs.push(`Supabase URL: ${supabaseUrl?.substring(0, 15)}...`);
  logs.push(`Anon Key available: ${!!supabaseAnonKey}`);
  logs.push(`Service Role Key available: ${!!supabaseServiceRoleKey}`);
  
  try {
    // 2. Check current auth state using anon key
    logs.push('--- Auth Status (Anon Client) ---');
    const { data: user } = await supabase.auth.getUser();
    logs.push(`Auth state: ${user?.user ? 'Authenticated' : 'Anonymous'}`);
    if (user?.user) {
      logs.push(`User ID: ${user.user.id}`);
      logs.push(`User email: ${user.user.email}`);
    }
    
    // Get current role
    const { data: roleData } = await supabase.rpc('get_my_role');
    logs.push(`Current role: ${roleData || 'unknown/not available'}`);
    results.anonRole = roleData;
    
    // 3. Try permissions with anon key
    logs.push('--- Storage Operations (Anon Client) ---');
    
    // List buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    if (bucketsError) {
      logs.push(`❌ List buckets error: ${bucketsError.message}`);
    } else {
      logs.push(`✅ Successfully listed buckets: ${buckets.length} found`);
      buckets.forEach(b => logs.push(`- ${b.name}`));
    }
    results.anonBuckets = buckets || [];
    
    // List audio-content bucket
    const { data: files, error: listError } = await supabase.storage
      .from('audio-content')
      .list();
    
    if (listError) {
      logs.push(`❌ List files error: ${listError.message}`);
    } else {
      logs.push(`✅ Successfully listed files: ${files.length} found`);
    }
    results.anonCanListFiles = !listError;
    
    // Try upload with anon key
    logs.push('Trying upload with anon key...');
    const testBlob = new Blob(['test-anon'], { type: 'text/plain' });
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('audio-content')
      .upload(`test-anon-${Date.now()}.txt`, testBlob, {
        contentType: 'text/plain',
      });
    
    if (uploadError) {
      logs.push(`❌ Upload error: ${uploadError.message}`);
    } else {
      logs.push(`✅ Upload succeeded: ${uploadData.path}`);
      // Try to clean up
      await supabase.storage.from('audio-content').remove([uploadData.path]);
    }
    results.anonCanUpload = !uploadError;
    
    // 4. Try with service role key if available
    if (supabaseServiceRoleKey) {
      logs.push('--- Storage Operations (Service Role Client) ---');
      
      const serviceClient = createClient(
        supabaseUrl || '',
        supabaseServiceRoleKey
      );
      
      // Check role
      const { data: serviceRoleData } = await serviceClient.rpc('get_my_role');
      logs.push(`Service role: ${serviceRoleData || 'unknown/not available'}`);
      results.serviceRole = serviceRoleData;
      
      // List buckets with service role
      const { data: serviceBuckets, error: serviceBucketsError } = 
        await serviceClient.storage.listBuckets();
      
      if (serviceBucketsError) {
        logs.push(`❌ Service role list buckets error: ${serviceBucketsError.message}`);
      } else {
        logs.push(`✅ Service role successfully listed buckets: ${serviceBuckets.length} found`);
        serviceBuckets.forEach(b => logs.push(`- ${b.name}`));
      }
      results.serviceRoleBuckets = serviceBuckets || [];
      
      // Try upload with service role
      logs.push('Trying upload with service role...');
      const serviceTestBlob = new Blob(['test-service-role'], { type: 'text/plain' });
      const { data: serviceUploadData, error: serviceUploadError } = 
        await serviceClient.storage
          .from('audio-content')
          .upload(`test-service-${Date.now()}.txt`, serviceTestBlob, {
            contentType: 'text/plain',
          });
      
      if (serviceUploadError) {
        logs.push(`❌ Service role upload error: ${serviceUploadError.message}`);
      } else {
        logs.push(`✅ Service role upload succeeded: ${serviceUploadData.path}`);
        // Try to clean up
        await serviceClient.storage.from('audio-content').remove([serviceUploadData.path]);
      }
      results.serviceRoleCanUpload = !serviceUploadError;
    } else {
      logs.push('⚠️ No service role key available to test with');
    }
    
    // 5. Check storage bucket settings
    logs.push('--- Bucket Configuration Check ---');
    
    try {
      // Try direct SQL query to check bucket settings if service role is available
      if (supabaseServiceRoleKey) {
        const serviceClient = createClient(
          supabaseUrl || '',
          supabaseServiceRoleKey
        );
        
        const { data: bucketInfo, error: bucketInfoError } = await serviceClient
          .from('buckets')
          .select('*')
          .eq('name', 'audio-content')
          .single();
        
        if (bucketInfoError) {
          logs.push(`❌ Could not retrieve bucket info: ${bucketInfoError.message}`);
        } else if (bucketInfo) {
          logs.push(`Bucket ID: ${bucketInfo.id}`);
          logs.push(`Bucket Owner: ${bucketInfo.owner}`);
          logs.push(`Public: ${bucketInfo.public ? 'Yes' : 'No'}`);
          results.bucketInfo = bucketInfo;
        }
        
        // Get policies
        const { data: policies, error: policiesError } = await serviceClient
          .from('policies')
          .select('*')
          .eq('table', 'objects')
          .eq('schema', 'storage');
        
        if (policiesError) {
          logs.push(`❌ Could not retrieve policies: ${policiesError.message}`);
        } else {
          logs.push(`Found ${policies.length} storage policies`);
          const audioBucketPolicies = policies.filter(p => 
            p.definition && p.definition.includes('audio-content')
          );
          logs.push(`Policies for audio-content bucket: ${audioBucketPolicies.length}`);
          
          audioBucketPolicies.forEach(p => {
            logs.push(`- ${p.name} (${p.action}, roles: ${p.roles.join(', ')})`);
          });
          
          results.audioBucketPolicies = audioBucketPolicies;
        }
      } else {
        logs.push('⚠️ Cannot check bucket settings without service role key');
      }
    } catch (e) {
      logs.push(`❌ Error checking bucket settings: ${e instanceof Error ? e.message : String(e)}`);
    }

    return NextResponse.json({
      success: true,
      logs,
      results
    });
    
  } catch (error) {
    logs.push(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    
    return NextResponse.json({
      success: false,
      error: 'Error during debugging',
      logs,
    });
  }
} 