// Example texts
const examples = {
    1: `I'm sorry, but I don't want to be an emperor. That's not my business. I don't want to rule or conquer anyone. I should like to help everyone - if possible - Jew, Gentile - black man - white. We all want to help one another. Human beings are like that. We want to live by each other's happiness - not by each other's misery. We don't want to hate and despise one another. In this world there is room for everyone. And the good earth is rich and can provide for everyone. The way of life can be free and beautiful, but we have lost the way.

Greed has poisoned men's souls, has barricaded the world with hate, has goose-stepped us into misery and bloodshed. We have developed speed, but we have shut ourselves in. Machinery that gives abundance has left us in want. Our knowledge has made us cynical. Our cleverness, hard and unkind. We think too much and feel too little. More than machinery we need humanity. More than cleverness we need kindness and gentleness. Without these qualities, life will be violent and all will be lost.

The aeroplane and the radio have brought us closer together. The very nature of these inventions cries out for the goodness in men - cries out for universal brotherhood - for the unity of us all. Even now my voice is reaching millions throughout the world - millions of despairing men, women, and little children - victims of a system that makes men torture and imprison innocent people.`,

    2: `Ode an die Tütensuppe

Oh Tütensuppe, du wunderbares Ding,
In bunter Verpackung, so leicht und so ring.
Wenn der Hunger mich plagt und die Zeit mir fehlt,
Bist du es, die mich stets aufs Neue beseelt.

Mit heißem Wasser nur kurz übergossen,
Verwandelst du dich, als wärst du erlöst.
Von trockenen Flöckchen zu würziger Brühe,
Ein Wunder der Technik, das ich täglich vollziehe.

Du kennst keine Saison, keine Zeit und kein Wetter,
Bist mein treuer Begleiter, mein Hunger-Erretter.
Ob Mittag, ob Abend, ob früh oder spät,
Du bist stets bereit, wenn mein Magen sich dreht.

Manch einer mag lächeln ob meiner Begeisterung,
Doch ich singe dein Lob ohne jede Verklärung.
Du bist mehr als nur Nahrung, du bist ein Konzept,
Das Einfachheit und Genuss perfekt verknüpft.

So erhebe ich meine Tasse zu dir,
Oh Tütensuppe, mein Dank gehört dir!
In einer Welt voller Hektik und Stress,
Bist du der Beweis: Weniger ist oft mehr, not less!`
};

// Load example text
function loadExample(exampleNum) {
    const inputText = document.getElementById('inputText');
    inputText.value = examples[exampleNum];
    inputText.style.height = 'auto';
    inputText.style.height = inputText.scrollHeight + 'px';
}

// Clear text
function clearText() {
    document.getElementById('inputText').value = '';
    document.getElementById('outputText').textContent = 'Your processed text will appear here...';
    document.getElementById('copyBtn').style.display = 'none';
}

// Copy output to clipboard
function copyOutput() {
    const outputText = document.getElementById('outputText').textContent;
    navigator.clipboard.writeText(outputText).then(() => {
        const copyBtn = document.getElementById('copyBtn');
        const originalText = copyBtn.textContent;
        copyBtn.textContent = '✅ Copied!';
        setTimeout(() => {
            copyBtn.textContent = originalText;
        }, 2000);
    });
}

// Show loading state
function showLoading() {
    document.getElementById('loadingSpinner').style.display = 'flex';
    document.getElementById('outputText').style.display = 'none';
    document.getElementById('copyBtn').style.display = 'none';
    
    // Disable all process buttons
    const buttons = document.querySelectorAll('.process-btn');
    buttons.forEach(btn => btn.disabled = true);
}

// Hide loading state
function hideLoading() {
    document.getElementById('loadingSpinner').style.display = 'none';
    document.getElementById('outputText').style.display = 'block';
    document.getElementById('copyBtn').style.display = 'block';
    
    // Re-enable all process buttons
    const buttons = document.querySelectorAll('.process-btn');
    buttons.forEach(btn => btn.disabled = false);
}

// Process text with different operations
async function processText(operation) {
    const inputText = document.getElementById('inputText').value.trim();
    
    if (!inputText) {
        alert('Please enter some text first!');
        return;
    }

    showLoading();

    try {
        const response = await fetch('/api/process', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: inputText,
                operation: operation
            })
        });

        if (!response.ok) {
            throw new Error('API request failed');
        }

        const data = await response.json();
        document.getElementById('outputText').innerHTML = data.result;

    } catch (error) {
        console.log('Error processing text:', error);
        // Fallback to demo responses
        const demoResponse = getDemoResponse(operation, inputText);
        document.getElementById('outputText').innerHTML = demoResponse;
    }

    hideLoading();
}

// Demo responses for when API is not available
function getDemoResponse(operation, inputText) {
    switch(operation) {
        case 'summarize':
            return getSummary(inputText);
        case 'metadata':
            return getMetadata(inputText);
        case 'poem':
            return getKidsPoem(inputText);
        default:
            return 'Text processed successfully using AI demonstration mode.';
    }
}

// Summarize text to maximum 5 lines
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

// Extract metadata (keywords and concepts)
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
        // Generic keyword extraction
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
    
    return `<strong>Keywords:</strong>
• ${keywords.join('\n• ')}

<strong>Concepts:</strong>
• ${concepts.join('\n• ')}`;
}

// Rewrite as kids poem (age 6-9)
function getKidsPoem(text) {
    if (text.includes('emperor') || text.toLowerCase().includes('chaplin')) {
        return `<strong>A Poem About Being Kind to Everyone</strong>

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
        return `<strong>The Magic Soup Song</strong>

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
        return `<strong>A Special Story Poem</strong>

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

// Auto-resize textarea
document.addEventListener('DOMContentLoaded', function() {
    const textarea = document.getElementById('inputText');
    textarea.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = this.scrollHeight + 'px';
    });
});
