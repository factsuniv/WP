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
        const { pdfUrl, title, description } = await req.json();

        if (!pdfUrl) {
            throw new Error('PDF URL is required');
        }

        console.log('Processing AI summary for PDF:', pdfUrl);

        const geminiApiKey = Deno.env.get('GOOGLE_GEMINI_API_KEY');
        if (!geminiApiKey) {
            throw new Error('Google Gemini API key not configured');
        }

        // Download PDF content
        let pdfContent = '';
        try {
            const pdfResponse = await fetch(pdfUrl);
            if (!pdfResponse.ok) {
                throw new Error('Failed to download PDF');
            }
            
            // Get PDF as base64 for Gemini API
            const pdfBuffer = await pdfResponse.arrayBuffer();
            const pdfBase64 = btoa(String.fromCharCode(...new Uint8Array(pdfBuffer)));
            
            // Use Gemini to analyze the PDF
            const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `Please analyze this AI research white paper and provide: 1) A comprehensive summary (200-300 words) that covers the main research question, methodology, key findings, and implications. 2) A detailed section-by-section breakdown with explanations for each major section (Introduction, Methodology, Results, Conclusion, etc.). Format the response as JSON with 'summary' and 'sections' fields. The sections should be an array of objects with 'title' and 'content' properties.`
                        }, {
                            inline_data: {
                                mime_type: "application/pdf",
                                data: pdfBase64
                            }
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.3,
                        maxOutputTokens: 2048
                    }
                })
            });

            if (!geminiResponse.ok) {
                const errorText = await geminiResponse.text();
                console.error('Gemini API error:', errorText);
                throw new Error(`Gemini API failed: ${errorText}`);
            }

            const geminiData = await geminiResponse.json();
            console.log('Gemini response received');

            if (!geminiData.candidates || geminiData.candidates.length === 0) {
                throw new Error('No response from Gemini API');
            }

            const responseText = geminiData.candidates[0].content.parts[0].text;
            console.log('Gemini analysis:', responseText.substring(0, 200) + '...');

            // Try to parse JSON from response
            let aiSummary = '';
            let aiSections = [];
            
            try {
                const jsonMatch = responseText.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/s);
                if (jsonMatch) {
                    const parsedResponse = JSON.parse(jsonMatch[0]);
                    aiSummary = parsedResponse.summary || responseText;
                    aiSections = parsedResponse.sections || [];
                } else {
                    // Fallback: use the full response as summary
                    aiSummary = responseText;
                    aiSections = [{
                        title: 'AI Analysis',
                        content: responseText
                    }];
                }
            } catch (parseError) {
                console.error('Failed to parse JSON response, using raw text:', parseError);
                aiSummary = responseText;
                aiSections = [{
                    title: 'AI Analysis',
                    content: responseText
                }];
            }

            return new Response(JSON.stringify({
                data: {
                    summary: aiSummary,
                    sections: aiSections,
                    processed: true
                }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });

        } catch (error) {
            console.error('PDF processing error:', error);
            // Return a fallback response
            return new Response(JSON.stringify({
                data: {
                    summary: `AI-powered analysis for "${title || 'this paper'}" is currently being processed. ${description || 'This white paper contains important research findings in AI.'} Please check back later for the complete AI-generated summary and section explanations.`,
                    sections: [{
                        title: 'Overview',
                        content: description || 'This research paper contributes to the field of artificial intelligence with novel approaches and insights.'
                    }],
                    processed: false
                }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

    } catch (error) {
        console.error('AI processing error:', error);

        const errorResponse = {
            error: {
                code: 'AI_PROCESSING_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});