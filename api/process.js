export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { text, operation } = req.body;

        if (!text || !operation) {
            return res.status(400).json({ error: 'Missing text or operation' });
        }

        // Limit input length to prevent API issues
        const maxLength = 6000;
        const processText = text.length > maxLength ? text.substring(0, maxLength) + "..." : text;

        // Try Mistral API first
        if (process.env.HUGGINGFACE_API_KEY) {
            try {
                const mistralResult = await callMistralAPI(processText, operation);
                return res.status(200).json({ result: mistralResult, source: 'Mistral AI' });
            } catch (apiError) {
                console.log('Mistral API failed:', apiError.message);
            }
        }

        // Fallback to enhanced demo responses
        console.log('Using enhanced demo mode');
        let result = getDemoResponse(operation, processText);
        res.status(200).json({ result: result + '\n\n<em>📝 Generated using demo mode</em>', source: 'Demo Mode' });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function callMistralAPI(text, operation) {
    const prompts = {
        summarize: `<s>[INST] Please summarize the following text in exactly 5 lines or less. Focus on the most important messages and key points. Make each line a complete thought:

${text} [/INST]`,

        metadata: `<s>[INST] Analyze the following text and extract metadata. Provide exactly 5 keywords and 5 key concepts.

Format your response exactly like this:
**Keywords:**
• [keyword 1]
• [keyword 2] 
• [keyword 3]
• [keyword 4]
• [keyword 5]

**Concepts:**
• [concept 1]
• [concept 2]
• [concept 3]
• [concept 4]
• [concept 5]

Text to analyze:
${text} [/INST]`,

        poem: `<s>[INST] Rewrite the following text as a fun, simple poem suitable for children aged 6-9 years old. Use:
- Simple vocabulary they can understand
- Fun rhymes and rhythm
- Make it educational and entertaining
- Keep the core message but make it child-friendly

Text to rewrite:
${text} [/INST]`
    };

    const response = await fetch('https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            inputs: prompts[operation],
            parameters: {
                max_new_tokens: operation === 'poem' ? 600 : 400,
                temperature: operation === 'poem' ? 0.8 : 0.7,
                top_p: 0.9,
                repetition_penalty: 1.1,
                return_full_text: false
            },
            options: {
                wait_for_model: true,
                use_cache: false
            }
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Mistral API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    
    if (result && result[0] && result[0].generated_text) {
        let generatedText = result[0].generated_text.trim();
        
        // Clean up the response
        generatedText = generatedText.replace(/\[INST\].*?\[\/INST\]/g, '').trim();
        generatedText = generatedText.replace(/^<s>|<\/s>$/g, '').trim();
        
        return generatedText;
    } else if (result.error) {
        throw new Error(`Mistral API error: ${result.error}`);
    } else {
        throw new Error('Invalid API response format');
    }
}

function getDemoResponse(operation, text) {
    switch(operation) {
        case 'summarize':
            return getSummary(text);
        case 'metadata':
            return getMetadata(text);
        case 'poem':
            return getKidsPoem(text);
        default:
            return 'Text processed successfully using demo mode.';
    }
}

function getSummary(text) {
    if (text.includes('emperor') || text.toLowerCase().includes('chaplin')) {
        return `Charlie Chaplin's speech rejects dictatorship and advocates for helping all people regardless of race or religion.
He argues that greed has poisoned humanity and led to hatred, misery, and bloodshed worldwide.
The speech emphasizes that we need more humanity, kindness, and gentleness rather than just machinery and cleverness.
Modern inventions like airplanes and radio should unite us in universal brotherhood instead of dividing us.
His message reaches millions of suffering people who are victims of systems that torture and imprison the innocent.`;
    } else if (text.toLowerCase().includes('suppe') || text.toLowerCase().includes('tüten')) {
        return `This German poem celebrates instant soup as a wonderful, convenient food solution in colorful packaging.
The author describes how adding hot water magically transforms dry flakes into a flavorful, nourishing broth.
Instant soup is praised as a reliable companion available any time of day, regardless of season or weather.
Despite others potentially mocking this enthusiasm, the poet defends instant soup as more than just food - it's a concept.
In our hectic, stressful world, instant soup proves that simplicity and enjoyment can be perfectly combined.`;
    } else {
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
        const keyPoints = sentences.slice(0, 5);
        return keyPoints.map(sentence => sentence.trim()).join('\n');
    }
}

function getMetadata(text) {
    let keywords = [];
    let concepts = [];
    
    if (text.includes('emperor') || text.toLowerCase().includes('chaplin')) {
        keywords = ['humanity', 'brotherhood', 'freedom', 'kindness', 'unity'];
        concepts = ['Universal human rights', 'Anti-dictatorship message', 'Technology for good', 'Compassion over greed', 'Global communication'];
    } else if (text.toLowerCase().includes('suppe') || text.toLowerCase().includes('tüten')) {
        keywords = ['convenience', 'simplicity', 'instant food', 'efficiency', 'comfort'];
        concepts = ['Modern lifestyle solutions', 'Food technology appreciation', 'Time-saving cooking', 'Simple pleasures', 'Practical minimalism'];
    } else {
        const words = text.toLowerCase().split(/\W+/);
        const wordFreq = {};
        
        words.forEach(word => {
            if (word.length > 4) {
                wordFreq[word] = (wordFreq[word] || 0) + 1;
            }
        });
        
        keywords = Object.entries(wordFreq)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(entry => entry[0]);
            
        concepts = [
            'Primary theme analysis',
            'Content structure patterns', 
            'Contextual relationships',
            'Information hierarchy',
            'Message delivery method'
        ];
    }
    
    return `**Keywords:**
• ${keywords.join('\n• ')}

**Concepts:**
• ${concepts.join('\n• ')}`;
}

function getKidsPoem(text) {
    if (text.includes('emperor') || text.toLowerCase().includes('chaplin')) {
        return `**A Poem About Being Kind to Everyone**

I don't want to be a king or queen,
I just want to help and be nice, you see!
All people are special, both you and me,
We should share our toys and play happily.

Sometimes grown-ups get very mad,
And that makes everyone feel quite sad.
But we can choose to be kind each day,
To laugh and sing and dance and play.

Our phones and computers help us talk,
To friends who live far down the block.
Let's use them to spread joy around,
And make sure love is what we've found!

Remember kids, be sweet and true,
Help others just like they help you.
The world needs kindness, that's the key,
To make everyone happy as can be!`;
    } else if (text.toLowerCase().includes('suppe') || text.toLowerCase().includes('tüten')) {
        return `**The Magic Soup Song**

There's a packet in the kitchen,
With some magic soup inside!
Add some water, hot and steamy,
Watch the magic come alive!

Tiny pieces start to wiggle,
As they grow into a meal,
It's like watching little fairies,
Make something warm and real!

When I'm hungry and I'm tired,
And I need a quick surprise,
Magic soup is always ready,
Right before my very eyes!

Some might say it's just a packet,
But I know that they are wrong,
'Cause the best things come in simple ways,
That's why I sing this song!

Magic soup, oh magic soup,
You make my tummy smile,
Thanks for being there to help me,
You make eating fun worthwhile!`;
    } else {
        return `**A Special Story Poem**

Once upon a time so bright,
There was a story full of light!
With words that danced and words that played,
A magical tale that someone made.

The story talks of many things,
Like butterflies with pretty wings,
It teaches us what's good to know,
And helps our little minds to grow.

Every word is like a friend,
That stays with us until the end,
They whisper secrets, sing us songs,
And help us learn what's right and wrong.

So when you read this story dear,
Remember that the words are here,
To make you smile and make you think,
Like colorful drops of magic ink!

Stories are treasures, shiny and new,
They're gifts from writers, just for you!`;
    }
}
