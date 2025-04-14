import { NextRequest, NextResponse } from 'next/server';
import { generateAudio, freeVoiceId } from '@/lib/content/elevenlabs';
import { supabase } from '@/lib/supabase/client';

/**
 * Debugging API to comprehensively test audio generation in isolation,
 * logging every step of the process
 */
export async function POST(request: NextRequest) {
  const logs: string[] = [];
  
  // 1. Check environment variables
  const apiKey = process.env.ELEVENLABS_API_KEY;
  logs.push(`API Key present: ${!!apiKey}`);
  if (!apiKey) {
    return NextResponse.json({
      success: false,
      error: 'Missing ElevenLabs API Key',
      logs,
    });
  }
  
  // 2. Verify Supabase configuration
  logs.push('--- Supabase Configuration ---');
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  logs.push(`Supabase URL configured: ${!!supabaseUrl}`);
  logs.push(`Supabase URL: ${supabaseUrl?.substring(0, 15)}...`); // Show part of URL for verification
  logs.push(`Supabase Anon Key configured: ${!!supabaseAnonKey}`);
  logs.push(`Supabase Anon Key: ${supabaseAnonKey?.substring(0, 15)}...`); // Show part of key for verification
  
  // 3. Test Supabase connectivity and detailed bucket info
  try {
    logs.push('--- Supabase Connectivity Test ---');
    logs.push('Attempting to connect to Supabase...');
    
    // First test basic connectivity
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      logs.push(`❌ Supabase connection error: ${bucketsError.message}`);
      // Use any to access potential properties that might exist but aren't in the type definition
      const anyError = bucketsError as any;
      if (anyError.code) {
        logs.push(`Error code: ${anyError.code}`);
      }
      if (anyError.details) {
        logs.push(`Error details: ${anyError.details}`);
      }
      return NextResponse.json({
        success: false, 
        error: `Supabase connection failed: ${bucketsError.message}`,
        logs,
      });
    }
    
    logs.push(`✅ Supabase connected successfully`);
    logs.push(`Found ${buckets?.length || 0} buckets total`);
    
    if (buckets?.length) {
      logs.push('--- Bucket Names ---');
      buckets.forEach(bucket => {
        logs.push(`- ${bucket.name} (${bucket.public ? 'public' : 'private'})`);
      });
    }
    
    // Specifically check for audio-content bucket
    const audioBucket = buckets?.find(b => b.name === 'audio-content');
    logs.push(`Audio bucket found: ${!!audioBucket}`);
    
    if (!audioBucket) {
      logs.push('❌ audio-content bucket not found in list!');
      
      // Direct attempt to access the bucket
      logs.push('Attempting direct bucket access...');
      const { data: directCheck, error: directError } = await supabase.storage
        .from('audio-content')
        .list();
      
      if (directError) {
        logs.push(`❌ Direct bucket access failed: ${directError.message}`);
        const anyError = directError as any;
        if (anyError.code) logs.push(`Error code: ${anyError.code}`);
      } else {
        logs.push(`✅ Direct bucket access succeeded! Found ${directCheck?.length || 0} files`);
      }
      
      // Test upload permission with a tiny test file
      logs.push('Testing upload permission...');
      const testBlob = new Blob(['test'], { type: 'text/plain' });
      const { data: uploadTest, error: uploadError } = await supabase.storage
        .from('audio-content')
        .upload(`test-${Date.now()}.txt`, testBlob, {
          contentType: 'text/plain',
          upsert: true,
        });
      
      if (uploadError) {
        logs.push(`❌ Upload test failed: ${uploadError.message}`);
        const anyError = uploadError as any;
        if (anyError.code) logs.push(`Error code: ${anyError.code}`);
      } else {
        logs.push(`✅ Upload test succeeded! Path: ${uploadTest?.path}`);
        // Clean up the test file
        const { error: deleteError } = await supabase.storage
          .from('audio-content')
          .remove([uploadTest?.path || '']);
        
        if (deleteError) {
          logs.push(`Warning: Couldn't clean up test file: ${deleteError.message}`);
        } else {
          logs.push(`✅ Test file cleanup succeeded`);
        }
      }
      
      return NextResponse.json({
        success: false,
        error: 'audio-content bucket exists but cannot be accessed properly',
        logs,
      });
    }
    
    // Check bucket policies
    logs.push('--- Detailed Bucket Info ---');
    logs.push(`Bucket is ${audioBucket.public ? 'public' : 'private'}`);
    
    // Test listing files in the bucket
    logs.push('Testing bucket list access...');
    const { data: files, error: listError } = await supabase.storage
      .from('audio-content')
      .list();
    
    if (listError) {
      logs.push(`❌ Bucket list error: ${listError.message}`);
    } else {
      logs.push(`✅ Successfully listed bucket contents`);
      logs.push(`Found ${files?.length || 0} files in the bucket`);
    }
    
    // Test upload permission
    logs.push('Testing upload permission...');
    const testBlob = new Blob(['test'], { type: 'text/plain' });
    const { data: uploadTest, error: uploadError } = await supabase.storage
      .from('audio-content')
      .upload(`test-${Date.now()}.txt`, testBlob, {
        contentType: 'text/plain',
        upsert: true,
      });
    
    if (uploadError) {
      logs.push(`❌ Upload test failed: ${uploadError.message}`);
      logs.push(`This may indicate insufficient permissions for audio file uploads`);
    } else {
      logs.push(`✅ Upload test succeeded!`);
      // Clean up the test file
      const { error: deleteError } = await supabase.storage
        .from('audio-content')
        .remove([uploadTest?.path || '']);
      
      if (deleteError) {
        logs.push(`Warning: Couldn't clean up test file: ${deleteError.message}`);
      }
    }
    
  } catch (e) {
    logs.push(`❌ Unexpected Supabase error: ${e instanceof Error ? e.message : String(e)}`);
    logs.push(`Stack trace: ${e instanceof Error ? e.stack : 'No stack trace available'}`);
    return NextResponse.json({
      success: false,
      error: 'Supabase connection error',
      logs,
    });
  }
  
  // 4. Test audio generation
  try {
    logs.push('--- Audio Generation Test ---');
    logs.push('Attempting to generate test audio...');
    logs.push(`Using voice ID: ${freeVoiceId}`);
    
    const testText = 'Este é um teste de geração de áudio para o aplicativo Palavra Viva.';
    logs.push(`Sample text length: ${testText.length} characters`);
    
    // Intercept console logs to collect detailed debug info
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    
    console.log = (...args: any[]) => {
      logs.push(`LOG: ${args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ')}`);
      originalConsoleLog(...args);
    };
    
    console.error = (...args: any[]) => {
      logs.push(`ERROR: ${args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ')}`);
      originalConsoleError(...args);
    };
    
    // Attempt to generate audio
    const startTime = Date.now();
    const audioUrl = await generateAudio(testText, freeVoiceId);
    const endTime = Date.now();
    
    // Restore console functions
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    
    logs.push(`Generation time: ${endTime - startTime}ms`);
    
    if (!audioUrl) {
      logs.push('❌ Audio generation returned null');
      return NextResponse.json({
        success: false,
        error: 'Audio generation failed with null result',
        logs,
      });
    }
    
    logs.push(`✅ Successfully generated audio URL: ${audioUrl}`);
    
    // Test if the generated URL is accessible
    logs.push('Testing if the audio URL is accessible...');
    try {
      const urlTest = await fetch(audioUrl, { method: 'HEAD' });
      logs.push(`URL test status: ${urlTest.status}`);
      logs.push(`URL content type: ${urlTest.headers.get('content-type')}`);
      
      if (!urlTest.ok) {
        logs.push(`❌ Audio URL returned status ${urlTest.status}`);
      } else {
        logs.push('✅ Audio URL accessible');
      }
    } catch (urlError) {
      logs.push(`❌ Error testing audio URL: ${urlError instanceof Error ? urlError.message : String(urlError)}`);
    }
    
    return NextResponse.json({
      success: true,
      audioUrl,
      logs,
    });
    
  } catch (error) {
    logs.push(`❌ Unexpected error during audio generation: ${error instanceof Error ? error.message : String(error)}`);
    logs.push(`Stack trace: ${error instanceof Error ? error.stack : 'No stack trace available'}`);
    
    return NextResponse.json({
      success: false,
      error: 'Error during audio generation process',
      logs,
    });
  }
} 