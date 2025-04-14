import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Test endpoint that uses the Supabase service role to upload a file
 * This helps determine if the issue is related to permissions
 */
export async function GET(request: NextRequest) {
  const logs: string[] = [];
  let success = false;
  let audioUrl = null;
  
  // Get the required configuration
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  logs.push(`Supabase URL available: ${!!supabaseUrl}`);
  logs.push(`Service Role Key available: ${!!serviceRoleKey}`);
  
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({
      success: false,
      error: 'Missing Supabase configuration',
      logs,
    });
  }
  
  try {
    // Create a Supabase client with service role permissions
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    logs.push('Created Supabase client with service role key');
    
    // Test listing buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      logs.push(`Error listing buckets: ${bucketsError.message}`);
      return NextResponse.json({
        success: false,
        error: 'Cannot list buckets with service role',
        logs,
      });
    }
    
    logs.push(`Found ${buckets.length} buckets`);
    buckets.forEach(b => logs.push(`- ${b.name}`));
    
    // Check for audio-content bucket
    const audioBucket = buckets.find(b => b.name === 'audio-content');
    
    if (!audioBucket) {
      logs.push('audio-content bucket not found!');
      return NextResponse.json({
        success: false,
        error: 'audio-content bucket not found',
        logs,
      });
    }
    
    logs.push('audio-content bucket found, attempting upload...');
    
    // Create a test file
    const testContent = 'This is a test file for audio permissions';
    const testBlob = new Blob([testContent], { type: 'text/plain' });
    const fileName = `test-service-role-${Date.now()}.txt`;
    
    // Upload test file
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('audio-content')
      .upload(fileName, testBlob, {
        contentType: 'text/plain',
        upsert: true,
      });
    
    if (uploadError) {
      logs.push(`Upload error: ${uploadError.message}`);
      return NextResponse.json({
        success: false,
        error: `Upload failed: ${uploadError.message}`,
        logs,
      });
    }
    
    logs.push(`✅ Successfully uploaded file: ${uploadData.path}`);
    
    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('audio-content')
      .getPublicUrl(fileName);
    
    audioUrl = urlData.publicUrl;
    logs.push(`✅ Public URL: ${audioUrl}`);
    
    // Test if URL is accessible
    try {
      const urlTest = await fetch(audioUrl, { method: 'HEAD' });
      logs.push(`URL test status: ${urlTest.status}`);
      logs.push(`URL is accessible: ${urlTest.ok}`);
    } catch (e) {
      logs.push(`Error testing URL: ${e instanceof Error ? e.message : String(e)}`);
    }
    
    success = true;
    
    return NextResponse.json({
      success,
      audioUrl,
      logs,
    });
    
  } catch (error) {
    logs.push(`Error: ${error instanceof Error ? error.message : String(error)}`);
    
    return NextResponse.json({
      success: false,
      error: 'Error during service role test',
      logs,
    });
  }
} 