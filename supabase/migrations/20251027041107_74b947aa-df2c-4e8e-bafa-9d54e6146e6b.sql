-- Add unique constraints for conflict handling
ALTER TABLE copywriter_techniques ADD CONSTRAINT copywriter_techniques_name_unique UNIQUE (copywriter_name);
ALTER TABLE copywriting_style_mappings ADD CONSTRAINT copywriting_style_mappings_industry_format_unique UNIQUE (industry_type, content_format);

-- Populate Copywriter Techniques
INSERT INTO copywriter_techniques (copywriter_name, copywriter_era, core_philosophy, signature_techniques, writing_style_traits, best_use_cases, example_headlines, example_body_copy, blending_notes) VALUES

('J. Peterman', '1980s-Present', 'Storytelling that transports the reader into a romantic, aspirational narrative', 
 '{"narrative_arc": "Begin with a vivid scene or moment in time", "sensory_immersion": "Layer multiple sensory details", "emotional_payoff": "End with the feeling the product delivers"}',
 ARRAY['First-person narrative voice', 'Specific place and time references', 'Luxurious descriptive language', 'Emotional transformation'],
 ARRAY['Luxury fragrance descriptions', 'Premium product storytelling', 'Catalog copy', 'Brand heritage'],
 ARRAY['The scent that followed her through the streets of Marrakech', 'What the silk merchants wore in their secret gardens'],
 'It was three in the afternoon in a villa outside Florence when I first caught the scent—amber and bergamot, drifting through shuttered windows. The kind of fragrance that makes you remember a place you''ve never been.',
 'Pairs beautifully with Ogilvy for balance—Peterman for romance, Ogilvy for credibility'),

('David Ogilvy', '1950s-1980s', 'Sell the benefit with research-backed credibility and elegant persuasion', 
 '{"benefit_first": "Lead with the transformation", "specificity": "Use precise, measurable claims", "credibility_markers": "Reference heritage, ingredients, process"}',
 ARRAY['Benefit-driven headlines', 'Third-party validation', 'Precise ingredient claims', 'Refined but accessible tone'],
 ARRAY['Product descriptions', 'Email marketing', 'Landing pages', 'Ad copy'],
 ARRAY['The fragrance worn by three generations of perfumers', 'Crafted with 127 rare botanical extracts'],
 'This eau de parfum contains the highest concentration of natural jasmine absolute available—18%, compared to the industry standard of 2-5%. The result? A scent that evolves over 8 hours, revealing base notes most fragrances never reach.',
 'Use Ogilvy when credibility matters most—ingredient transparency, craftsmanship claims'),

('Eugene Schwartz', '1960s-1980s', 'Tap into existing desire and amplify it through mass desire and stage-of-awareness', 
 '{"desire_amplification": "Mirror the reader''s existing longing", "market_sophistication": "Match the audience''s awareness level", "unique_mechanism": "Reveal the secret behind the transformation"}',
 ARRAY['Problem-agitation language', 'Desire amplification', 'Unique mechanism reveal', 'Stage-of-awareness matching'],
 ARRAY['Launch campaigns', 'Conversion-focused copy', 'Sales pages', 'Email sequences'],
 ARRAY['The one ingredient missing from every fragrance in your collection', 'Why natural attars last 3x longer than alcohol-based perfumes'],
 'You''ve tried French perfumes, niche fragrances, even custom blends. But they all fade by noon. Here''s why: alcohol evaporates, taking the scent with it. Attars use oil. No evaporation. No fading. Just pure scent that lasts.',
 'Best for competitive markets—use when you need to differentiate and convert'),

('Gary Halbert', '1970s-2000s', 'Conversational, direct persuasion that feels like a friend giving insider advice', 
 '{"conversational_hook": "Start with a casual, intriguing question", "insider_reveal": "Share a secret or behind-the-scenes truth", "direct_CTA": "Clear, urgent call-to-action"}',
 ARRAY['Casual, friendly tone', 'Insider secrets', 'Direct response structure', 'Urgency and scarcity'],
 ARRAY['Email marketing', 'Sales letters', 'Launch sequences', 'Direct response'],
 ARRAY['Want to know the real reason luxury perfumes cost $300?', 'I''m about to tell you something perfumers don''t want you to know'],
 'Here''s the truth nobody tells you: that $400 perfume? It costs about $8 to make. The rest is marketing. But here''s the thing—you can get the SAME rare ingredients, the same perfumer-grade oils, for a fraction of the price. If you know where to look.',
 'Use for direct response, launches, and building personal connection with audience')
ON CONFLICT (copywriter_name) DO NOTHING;

-- Populate Marketing Frameworks
INSERT INTO marketing_frameworks (framework_code, framework_name, framework_category, description, structure_template, when_to_use, strengths, weaknesses, examples) VALUES

('FAB', 'Features Advantages Benefits', 'Product-Focused', 'Translate product attributes into customer value',
 '{"features": "What it is (ingredients, specs)", "advantages": "Why it matters (unique properties)", "benefits": "What you get (emotional payoff)"}',
 'Ingredient-rich products, technical differentiation, education-focused copy',
 ARRAY['Builds credibility', 'Great for educated buyers', 'Highlights differentiation'],
 ARRAY['Can be dry without storytelling', 'Less emotional'],
 '{"feature": "Cold-pressed sandalwood oil", "advantage": "Retains volatile compounds lost in steam distillation", "benefit": "Deeper, longer-lasting scent that evolves on your skin"}'),

('PAS', 'Problem Agitate Solution', 'Pain-Point Driven', 'Amplify the problem before revealing the solution',
 '{"problem": "Name the frustration", "agitate": "Deepen the pain or urgency", "solution": "Present product as the answer"}',
 'Competitive markets, solving known frustrations, conversion-focused copy',
 ARRAY['High urgency', 'Conversion-focused', 'Emotionally engaging'],
 ARRAY['Can feel manipulative if overused', 'Not ideal for unaware audiences'],
 '{"problem": "Synthetic fragrances give you headaches", "agitate": "And they fade within an hour, leaving you reapplying all day", "solution": "Switch to natural attars—no chemicals, no fading"}'),

('PASTOR', 'Problem Amplify Story Transformation Offer Response', 'Story-Driven Sales', 'Full narrative arc with emotional transformation',
 '{"problem": "State the pain", "amplify": "Make it urgent", "story": "Share a relatable journey", "transformation": "Show the before/after", "offer": "Present the solution", "response": "Clear CTA"}',
 'Long-form sales pages, launch emails, storytelling brands',
 ARRAY['Deeply engaging', 'High emotional impact', 'Strong conversion'],
 ARRAY['Longer format', 'Requires strong storytelling'],
 '{"problem": "You can''t find a signature scent", "amplify": "Every perfume smells the same after an hour", "story": "I spent years searching until I discovered attars in Istanbul", "transformation": "Now I wear a scent that''s truly mine", "offer": "Discover your signature attar", "response": "Start your collection"}')
ON CONFLICT (framework_code) DO NOTHING;

-- Populate Style Mappings
INSERT INTO copywriting_style_mappings (industry_type, content_format, primary_copywriter, secondary_copywriter, persuasion_framework, voice_spectrum, urgency_level, key_hooks, example_snippet) VALUES

('fragrance', 'product_description', 'J. Peterman', 'David Ogilvy', 'FAB', 'Romantic + Refined', 'Low', 
 ARRAY['Sensory immersion', 'Origin story', 'Craftsmanship'], 
 'It was the scent of wild jasmine growing along the cliffs of Grasse, where perfumers have sourced their finest blooms for three centuries. This parfum contains 18% pure jasmine absolute—six times the industry standard.'),

('fragrance', 'email_campaign', 'Gary Halbert', 'Eugene Schwartz', 'PAS', 'Conversational + Insider', 'Medium',
 ARRAY['Insider secret', 'Problem amplification', 'Direct CTA'],
 'Want to know why your $300 perfume fades by lunch? Alcohol. It evaporates, taking your scent with it. Attar oils? They last all day. No fading. No reapplying. Just pure scent.'),

('fragrance', 'landing_page', 'Eugene Schwartz', 'David Ogilvy', 'PASTOR', 'Sophisticated + Urgent', 'High',
 ARRAY['Unique mechanism', 'Credibility markers', 'Transformation'],
 'Every fragrance you''ve tried fades. Here''s why: synthetic fixatives break down within 4 hours. Our attars use natural resins that bond to skin, lasting 12+ hours. The difference? Real perfumers know it. Now you do too.'),

('fragrance', 'social_media', 'J. Peterman', NULL, 'AIDA', 'Romantic + Concise', 'Low',
 ARRAY['Sensory hook', 'Emotional desire'],
 'The scent of sun-warmed amber and wild rose, captured in a single drop. Wear the memory of a place you''ve never been.'),

('skincare', 'product_description', 'David Ogilvy', 'J. Peterman', 'FAB', 'Credible + Elegant', 'Low',
 ARRAY['Ingredient transparency', 'Benefit proof', 'Sensory description'],
 'This serum contains 15% stabilized vitamin C—clinically proven to reduce hyperpigmentation by 40% in 8 weeks. The texture? Silk on skin, absorbing in seconds without residue.'),

('skincare', 'email_campaign', 'Eugene Schwartz', 'Gary Halbert', 'PAS', 'Conversational + Educational', 'Medium',
 ARRAY['Problem awareness', 'Unique mechanism', 'Urgency'],
 'Your retinol isn''t working. Here''s why: most formulas oxidize before they reach your skin. Ours is encapsulated in time-release microspheres. Result? 3x the effectiveness, zero irritation.'),

('home_fragrance', 'product_description', 'J. Peterman', 'David Ogilvy', 'FAB', 'Romantic + Refined', 'Low',
 ARRAY['Sensory immersion', 'Craftsmanship', 'Ambient transformation'],
 'Light this candle and the room shifts—notes of smoked cedar and wild honey, like a cabin deep in the Adirondacks. Hand-poured with a wooden wick that crackles as it burns. 60-hour burn time.'),

('home_fragrance', 'email_campaign', 'Gary Halbert', NULL, 'AIDA', 'Conversational + Warm', 'Medium',
 ARRAY['Relatable scenario', 'Emotional benefit', 'Direct CTA'],
 'You know that feeling when you walk into a friend''s house and it just smells… right? That''s what our reed diffusers do. No fake fragrance. Just natural oils that make your home feel like home.')
ON CONFLICT (industry_type, content_format) DO NOTHING;