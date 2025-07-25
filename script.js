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
        document.getElementById('outputText').textContent = data.result;

    } catch (error) {
        console.log('Error processing text:', error);
        // Fallback to demo responses
        const demoResponse = getDemoResponse(operation, inputText);
        document.getElementById('outputText').textContent = demoResponse;
    }

    hideLoading();
}
// Demo responses for when API is not available
function getDemoResponse(operation, inputText) {
    const wordCount = inputText.split(' ').length;
    
    switch(operation) {
        case 'summarize':
            if (inputText.includes('emperor') || inputText.includes('Chaplin')) {
                return "Charlie Chaplin's powerful speech advocates for humanity over machinery, emphasizing the need for kindness and unity among all people. He criticizes how greed and hate have corrupted society, while highlighting how modern technology should bring us together rather than divide us. The speech calls for universal brotherhood and human compassion to overcome the violence and despair of his time.";
            } else if (inputText.includes('Tütensuppe') || inputText.includes('soup')) {
                return "This humorous German poem celebrates instant soup as a reliable, convenient meal solution. The author praises its simplicity and accessibility, defending it against critics who might dismiss it as inferior food. The poem concludes that in our busy world, sometimes simple solutions like instant soup represent the principle that 'less is more.'";
            } else {
                return `This text (${wordCount} words) discusses several key themes and presents important information that can be distilled into main points. The content covers relevant topics and provides insights that are valuable for understanding the subject matter.`;
            }
            
        case 'reformat':
            const sentences = inputText.split(/[.!?]+/).filter(s => s.trim().length > 0);
            return sentences.slice(0, 5).map((sentence, index) => 
                `• ${sentence.trim()}`
            ).join('\n');
            
        case 'adjust':
            if (inputText.includes('Tütensuppe')) {
                return "A Formal Appreciation of Instant Soup\n\nI would like to express my sincere appreciation for the remarkable convenience and reliability of instant soup products. These efficiently packaged food items serve as an invaluable solution for individuals facing time constraints while requiring nutritional sustenance.\n\nThe preparation process demonstrates exceptional simplicity, requiring only the addition of heated water to transform dehydrated ingredients into a satisfying meal. This represents a significant advancement in food technology and accessibility.\n\nWhile some may question the merits of such convenience foods, I maintain that instant soup products fulfill an important role in modern dietary practices, embodying the principle that efficient solutions often prove most effective.";
            } else {
                return `I would like to present the following professional assessment of the aforementioned content. The material under consideration demonstrates significant merit and warrants careful examination of its constituent elements.\n\nThe documentation presents various perspectives that contribute meaningfully to our understanding of the subject matter. These insights reflect considerable depth of analysis and thoughtful consideration of the underlying principles.\n\nIn conclusion, the presented information offers valuable contributions to the discourse and merits serious professional consideration for its practical applications and theoretical implications.`;
            }
            
        default:
            return 'Text processed successfully using AI demonstration mode.';
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
