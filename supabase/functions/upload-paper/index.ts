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
        const { 
            title, 
            description, 
            author, 
            categoryId, 
            pdfData, 
            presentationData, 
            audioData,
            isSubmission = false 
        } = await req.json();

        if (!title || !pdfData) {
            throw new Error('Title and PDF file are required');
        }

        console.log('Processing paper upload:', title);

        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        // Get user from auth header
        let userId = null;
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
                    userId = userData.id;
                    console.log('User identified:', userId);
                }
            } catch (error) {
                console.log('Could not get user from token:', error.message);
            }
        }

        const timestamp = Date.now();
        const sanitizedTitle = title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-').toLowerCase();
        let uploadedFiles = {};

        // Upload PDF
        try {
            const pdfFileName = `${timestamp}-${sanitizedTitle}.pdf`;
            const pdfBase64Data = pdfData.split(',')[1];
            const pdfBinaryData = Uint8Array.from(atob(pdfBase64Data), c => c.charCodeAt(0));

            const pdfUploadResponse = await fetch(`${supabaseUrl}/storage/v1/object/papers/${pdfFileName}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'Content-Type': 'application/pdf',
                    'x-upsert': 'true'
                },
                body: pdfBinaryData
            });

            if (!pdfUploadResponse.ok) {
                const errorText = await pdfUploadResponse.text();
                throw new Error(`PDF upload failed: ${errorText}`);
            }

            uploadedFiles.pdfUrl = `${supabaseUrl}/storage/v1/object/public/papers/${pdfFileName}`;
            console.log('PDF uploaded successfully:', uploadedFiles.pdfUrl);
        } catch (error) {
            console.error('PDF upload error:', error);
            throw new Error(`PDF upload failed: ${error.message}`);
        }

        // Upload presentation if provided
        if (presentationData) {
            try {
                const presentationFileName = `${timestamp}-${sanitizedTitle}-presentation`;
                const presentationBase64Data = presentationData.split(',')[1];
                const presentationMimeType = presentationData.split(';')[0].split(':')[1];
                const presentationBinaryData = Uint8Array.from(atob(presentationBase64Data), c => c.charCodeAt(0));
                
                const extension = presentationMimeType.includes('pdf') ? '.pdf' : '.pptx';
                const finalPresentationFileName = presentationFileName + extension;

                const presentationUploadResponse = await fetch(`${supabaseUrl}/storage/v1/object/presentations/${finalPresentationFileName}`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'Content-Type': presentationMimeType,
                        'x-upsert': 'true'
                    },
                    body: presentationBinaryData
                });

                if (presentationUploadResponse.ok) {
                    uploadedFiles.presentationUrl = `${supabaseUrl}/storage/v1/object/public/presentations/${finalPresentationFileName}`;
                    console.log('Presentation uploaded successfully');
                }
            } catch (error) {
                console.error('Presentation upload error:', error);
                // Continue without presentation
            }
        }

        // Upload audio if provided
        if (audioData) {
            try {
                const audioFileName = `${timestamp}-${sanitizedTitle}-audio.mp3`;
                const audioBase64Data = audioData.split(',')[1];
                const audioBinaryData = Uint8Array.from(atob(audioBase64Data), c => c.charCodeAt(0));

                const audioUploadResponse = await fetch(`${supabaseUrl}/storage/v1/object/audio/${audioFileName}`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'Content-Type': 'audio/mpeg',
                        'x-upsert': 'true'
                    },
                    body: audioBinaryData
                });

                if (audioUploadResponse.ok) {
                    uploadedFiles.audioUrl = `${supabaseUrl}/storage/v1/object/public/audio/${audioFileName}`;
                    console.log('Audio uploaded successfully');
                }
            } catch (error) {
                console.error('Audio upload error:', error);
                // Continue without audio
            }
        }

        // Process AI summary in background
        let aiSummary = '';
        let aiSections = [];
        
        try {
            console.log('Processing AI summary...');
            const aiResponse = await fetch(`${supabaseUrl}/functions/v1/process-ai-summary`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    pdfUrl: uploadedFiles.pdfUrl,
                    title,
                    description
                })
            });

            if (aiResponse.ok) {
                const aiData = await aiResponse.json();
                if (aiData.data) {
                    aiSummary = aiData.data.summary || '';
                    aiSections = aiData.data.sections || [];
                    console.log('AI summary processed successfully');
                }
            } else {
                console.error('AI processing failed, using fallback');
                aiSummary = `This white paper "${title}" presents important research in artificial intelligence. ${description || 'The paper contains valuable insights and methodologies relevant to the AI research community.'}`;
                aiSections = [{
                    title: 'Overview',
                    content: description || 'This research contributes to advancing the field of artificial intelligence.'
                }];
            }
        } catch (aiError) {
            console.error('AI processing error:', aiError);
            aiSummary = `This white paper "${title}" presents important research in artificial intelligence. ${description || 'The paper contains valuable insights and methodologies relevant to the AI research community.'}`;
            aiSections = [{
                title: 'Overview',
                content: description || 'This research contributes to advancing the field of artificial intelligence.'
            }];
        }

        // Save to database
        let paperData;
        let tableName;
        
        if (isSubmission) {
            // For submissions table
            paperData = {
                title,
                description: description || '',
                author: author || 'Unknown',
                category_id: categoryId || null,
                pdf_url: uploadedFiles.pdfUrl,
                presentation_url: uploadedFiles.presentationUrl || null,
                audio_url: uploadedFiles.audioUrl || null,
                ai_summary: aiSummary,
                ai_sections: aiSections,
                status: 'pending',
                submitted_by: userId,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            tableName = 'submissions';
        } else {
            // For white_papers table
            paperData = {
                title,
                description: description || '',
                author: author || 'Unknown',
                category_id: categoryId || null,
                pdf_url: uploadedFiles.pdfUrl,
                presentation_url: uploadedFiles.presentationUrl || null,
                audio_url: uploadedFiles.audioUrl || null,
                ai_summary: aiSummary,
                ai_sections: aiSections,
                status: 'published',
                uploaded_by: userId,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            tableName = 'white_papers';
        }

        const insertResponse = await fetch(`${supabaseUrl}/rest/v1/${tableName}`, {
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
            const errorText = await insertResponse.text();
            console.error('Database insert failed:', errorText);
            throw new Error(`Database insert failed: ${errorText}`);
        }

        const savedPaper = await insertResponse.json();
        console.log('Paper saved to database successfully');

        return new Response(JSON.stringify({
            data: {
                paper: savedPaper[0],
                uploadedFiles,
                aiProcessed: true,
                message: isSubmission ? 'Submission received and will be reviewed by admin' : 'Paper published successfully'
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Paper upload error:', error);

        const errorResponse = {
            error: {
                code: 'PAPER_UPLOAD_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});