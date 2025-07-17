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
        const { action, data } = await req.json();

        if (!action) {
            throw new Error('Action is required');
        }

        console.log('Admin action requested:', action);

        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        // Verify admin user
        let isAdmin = false;
        const authHeader = req.headers.get('authorization');
        if (authHeader) {
            try {
                const token = authHeader.replace('Bearer ', '');
                const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'apikey': serviceRoleKey
                    }
                });

                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    console.log('User ID:', userData.id);
                    
                    // Check if user is admin
                    const profileResponse = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userData.id}`, {
                        headers: {
                            'Authorization': `Bearer ${serviceRoleKey}`,
                            'apikey': serviceRoleKey
                        }
                    });

                    if (profileResponse.ok) {
                        const profiles = await profileResponse.json();
                        isAdmin = profiles.length > 0 && profiles[0].role === 'admin';
                        console.log('Is admin:', isAdmin);
                    }
                }
            } catch (error) {
                console.log('Auth check error:', error.message);
            }
        }

        if (!isAdmin) {
            return new Response(JSON.stringify({
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Admin access required'
                }
            }), {
                status: 403,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        let result = {};

        switch (action) {
            case 'approve_submission':
                if (!data.submissionId) {
                    throw new Error('Submission ID is required');
                }
                
                // Get submission data
                const submissionResponse = await fetch(`${supabaseUrl}/rest/v1/submissions?id=eq.${data.submissionId}`, {
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey
                    }
                });
                
                if (!submissionResponse.ok) {
                    throw new Error('Failed to fetch submission');
                }
                
                const submissions = await submissionResponse.json();
                if (submissions.length === 0) {
                    throw new Error('Submission not found');
                }
                
                const submission = submissions[0];
                
                // Move to white_papers table
                const paperData = {
                    title: submission.title,
                    description: submission.description,
                    author: submission.author,
                    category_id: submission.category_id,
                    pdf_url: submission.pdf_url,
                    presentation_url: submission.presentation_url,
                    audio_url: submission.audio_url,
                    ai_summary: '',
                    ai_sections: [],
                    status: 'published',
                    uploaded_by: submission.submitted_by,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                };
                
                const insertResponse = await fetch(`${supabaseUrl}/rest/v1/white_papers`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify(paperData)
                });
                
                if (!insertResponse.ok) {
                    throw new Error('Failed to approve submission');
                }
                
                // Delete from submissions
                await fetch(`${supabaseUrl}/rest/v1/submissions?id=eq.${data.submissionId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey
                    }
                });
                
                result = { message: 'Submission approved and published' };
                break;

            case 'reject_submission':
                if (!data.submissionId) {
                    throw new Error('Submission ID is required');
                }
                
                const deleteResponse = await fetch(`${supabaseUrl}/rest/v1/submissions?id=eq.${data.submissionId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey
                    }
                });
                
                if (!deleteResponse.ok) {
                    throw new Error('Failed to reject submission');
                }
                
                result = { message: 'Submission rejected and removed' };
                break;

            case 'delete_paper':
                if (!data.paperId) {
                    throw new Error('Paper ID is required');
                }
                
                const deletePaperResponse = await fetch(`${supabaseUrl}/rest/v1/white_papers?id=eq.${data.paperId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey
                    }
                });
                
                if (!deletePaperResponse.ok) {
                    throw new Error('Failed to delete paper');
                }
                
                result = { message: 'Paper deleted successfully' };
                break;

            case 'update_paper':
                if (!data.paperId || !data.updates) {
                    throw new Error('Paper ID and updates are required');
                }
                
                const updateResponse = await fetch(`${supabaseUrl}/rest/v1/white_papers?id=eq.${data.paperId}`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify({
                        ...data.updates,
                        updated_at: new Date().toISOString()
                    })
                });
                
                if (!updateResponse.ok) {
                    throw new Error('Failed to update paper');
                }
                
                const updatedPaper = await updateResponse.json();
                result = { paper: updatedPaper[0], message: 'Paper updated successfully' };
                break;

            case 'get_stats':
                // Get platform statistics
                const [papersResponse, submissionsResponse, usersResponse] = await Promise.all([
                    fetch(`${supabaseUrl}/rest/v1/white_papers?select=count`, {
                        headers: {
                            'Authorization': `Bearer ${serviceRoleKey}`,
                            'apikey': serviceRoleKey,
                            'Prefer': 'count=exact'
                        }
                    }),
                    fetch(`${supabaseUrl}/rest/v1/submissions?select=count`, {
                        headers: {
                            'Authorization': `Bearer ${serviceRoleKey}`,
                            'apikey': serviceRoleKey,
                            'Prefer': 'count=exact'
                        }
                    }),
                    fetch(`${supabaseUrl}/rest/v1/profiles?select=count`, {
                        headers: {
                            'Authorization': `Bearer ${serviceRoleKey}`,
                            'apikey': serviceRoleKey,
                            'Prefer': 'count=exact'
                        }
                    })
                ]);
                
                const papersCount = papersResponse.headers.get('content-range')?.split('/')[1] || '0';
                const submissionsCount = submissionsResponse.headers.get('content-range')?.split('/')[1] || '0';
                const usersCount = usersResponse.headers.get('content-range')?.split('/')[1] || '0';
                
                result = {
                    totalPapers: parseInt(papersCount),
                    pendingSubmissions: parseInt(submissionsCount),
                    totalUsers: parseInt(usersCount)
                };
                break;

            default:
                throw new Error(`Unknown action: ${action}`);
        }

        return new Response(JSON.stringify({ data: result }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Admin action error:', error);

        const errorResponse = {
            error: {
                code: 'ADMIN_ACTION_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});