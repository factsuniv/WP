Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'false'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const { email, password, fullName, action = 'signup' } = await req.json();

        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const anonKey = Deno.env.get('SUPABASE_ANON_KEY');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        console.log('Testing auth with:', { email, action });

        if (action === 'signup') {
            // Try to create user using service role key
            const signupData = {
                email,
                password,
                email_confirm: true,
                user_metadata: {
                    full_name: fullName || 'Test User'
                }
            };

            console.log('Attempting signup with service role...');
            const signupResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(signupData)
            });

            const signupResult = await signupResponse.json();
            console.log('Signup response:', signupResponse.status, signupResult);

            if (!signupResponse.ok) {
                throw new Error(`Signup failed: ${JSON.stringify(signupResult)}`);
            }

            // Create profile for the user
            if (signupResult.id) {
                const profileData = {
                    id: signupResult.id,
                    email: email,
                    full_name: fullName || 'Test User',
                    role: email.includes('admin') ? 'admin' : 'user'
                };

                const profileResponse = await fetch(`${supabaseUrl}/rest/v1/profiles`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify(profileData)
                });

                if (profileResponse.ok) {
                    console.log('Profile created successfully');
                } else {
                    const profileError = await profileResponse.text();
                    console.error('Profile creation failed:', profileError);
                }
            }

            return new Response(JSON.stringify({
                success: true,
                user: signupResult,
                message: 'User created successfully with admin privileges'
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        if (action === 'test_normal_signup') {
            // Test normal signup flow
            console.log('Testing normal signup flow...');
            const normalSignupResponse = await fetch(`${supabaseUrl}/auth/v1/signup`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${anonKey}`,
                    'apikey': anonKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    password
                })
            });

            const normalResult = await normalSignupResponse.json();
            console.log('Normal signup response:', normalSignupResponse.status, normalResult);

            return new Response(JSON.stringify({
                success: normalSignupResponse.ok,
                status: normalSignupResponse.status,
                result: normalResult,
                message: normalSignupResponse.ok ? 'Normal signup worked' : 'Normal signup failed'
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify({
            error: 'Invalid action specified'
        }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Test auth error:', error);

        return new Response(JSON.stringify({
            error: error.message,
            success: false
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});