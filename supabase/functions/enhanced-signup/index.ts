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
        const { email, password, fullName } = await req.json();

        if (!email || !password || !fullName) {
            throw new Error('Email, password, and full name are required');
        }

        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const anonKey = Deno.env.get('SUPABASE_ANON_KEY');

        if (!serviceRoleKey || !supabaseUrl || !anonKey) {
            throw new Error('Supabase configuration missing');
        }

        console.log('Starting enhanced signup for:', email);

        // First, try normal signup
        try {
            console.log('Attempting normal signup...');
            const normalSignupResponse = await fetch(`${supabaseUrl}/auth/v1/signup`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${anonKey}`,
                    'apikey': anonKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName
                        }
                    }
                })
            });

            if (normalSignupResponse.ok) {
                const normalResult = await normalSignupResponse.json();
                console.log('Normal signup successful');
                
                // Create profile if user was created
                if (normalResult.user?.id) {
                    await createUserProfile(normalResult.user.id, email, fullName, supabaseUrl, serviceRoleKey);
                }
                
                return new Response(JSON.stringify({
                    success: true,
                    data: normalResult,
                    method: 'normal_signup',
                    message: 'Account created successfully! Please check your email to verify your account.'
                }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }

            const normalError = await normalSignupResponse.json();
            console.log('Normal signup failed:', normalError);
            
            // If it's an email validation error, try admin signup
            if (normalError.error_code === 'email_address_invalid' || normalError.msg?.includes('invalid')) {
                console.log('Email validation failed, trying admin signup...');
            } else {
                throw new Error(normalError.msg || 'Signup failed');
            }
        } catch (normalError) {
            console.log('Normal signup error, trying admin fallback:', normalError.message);
        }

        // Fallback: Use admin signup
        console.log('Using admin signup fallback...');
        const adminSignupData = {
            email,
            password,
            email_confirm: true,
            user_metadata: {
                full_name: fullName,
                signup_method: 'admin_fallback'
            }
        };

        const adminSignupResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(adminSignupData)
        });

        if (!adminSignupResponse.ok) {
            const adminError = await adminSignupResponse.json();
            throw new Error(`Signup failed: ${adminError.message || 'Unknown error'}`);
        }

        const adminResult = await adminSignupResponse.json();
        console.log('Admin signup successful for:', email);

        // Create profile
        if (adminResult.id) {
            await createUserProfile(adminResult.id, email, fullName, supabaseUrl, serviceRoleKey);
        }

        return new Response(JSON.stringify({
            success: true,
            data: { user: adminResult },
            method: 'admin_fallback',
            message: 'Account created successfully! You can now sign in.'
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Enhanced signup error:', error);

        return new Response(JSON.stringify({
            success: false,
            error: error.message
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

// Helper function to create user profile
async function createUserProfile(userId, email, fullName, supabaseUrl, serviceRoleKey) {
    try {
        const profileData = {
            id: userId,
            email: email,
            full_name: fullName,
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
            console.log('Profile created successfully for:', email);
        } else {
            const profileError = await profileResponse.text();
            console.error('Profile creation failed:', profileError);
        }
    } catch (error) {
        console.error('Error creating profile:', error);
    }
}