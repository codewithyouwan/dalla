export default function Split(content){
        // Try to parse the new structured format with explicit markers
        const forms = [];
        
        // Extract content between markers
        const form1Match = content.match(/===FORM1-START===\s*([\s\S]*?)\s*===FORM1-END===/);
        const form2Match = content.match(/===FORM2-START===\s*([\s\S]*?)\s*===FORM2-END===/);
        const form3Match = content.match(/===FORM3-START===\s*([\s\S]*?)\s*===FORM3-END===/);
        
        if (form1Match) forms.push(form1Match[1].trim());
        if (form2Match) forms.push(form2Match[1].trim());
        if (form3Match) forms.push(form3Match[1].trim());
        
        // Fallback to previous parsing methods if marker-based parsing fails
        if (forms.length === 0) {
        // Try "### Form 1", "### Form 2", etc. (Markdown heading style)
        if (content.includes('### Form')) {
            const markdownForms = content.split(/### Form \d+.*?\n/).filter(form => form.trim().length > 0);
            forms.push(...markdownForms);
        }
        // Try "#form1", "#form2", etc.
        else if (content.includes('#form')) {
            const hashtagForms = content.split(/#form\d+/).filter(form => form.trim().length > 0);
            forms.push(...hashtagForms);
        }
        // Try "Form 1:", "Form 2:", etc.
        else if (content.includes('Form') || content.includes('Set')) {
            const colonForms = content.split(/Form \d+:|Set \d+:/).filter(form => form.trim().length > 0);
            forms.push(...colonForms);
        }
        // Try numbered sections "1.", "2.", etc. if other patterns don't work
        else {
            // Just split by double newlines as a fallback
            const paragraphForms = content.split(/\n\n+/).filter(form => form.trim().length > 0);
            // If we get more than 3 forms, try to group them into 3 sections
            if (paragraphForms.length > 3) {
            const grouped = [];
            const groupSize = Math.ceil(paragraphForms.length / 3);
            
            for (let i = 0; i < paragraphForms.length; i += groupSize) {
                grouped.push(paragraphForms.slice(i, i + groupSize).join('\n\n'));
            }
            
            if (grouped.length > 0) {
                forms.push(...grouped.slice(0, 3)); // Ensure we only get up to 3 forms
            }
            } else {
                forms.push(...paragraphForms);
            }
        }
    }
    return forms;
}