// German example texts
const examples = {
    1: `Es tut mir leid, aber ich will kein Kaiser sein. Das ist nicht mein Geschäft. Ich will niemanden regieren oder erobern. Ich möchte allen helfen - wenn möglich - Juden, Heiden - Schwarzen - Weißen. Wir alle wollen einander helfen. So sind die Menschen. Wir wollen durch das Glück des anderen leben - nicht durch das Elend des anderen. Wir wollen uns nicht hassen und verachten. Auf dieser Welt ist Platz für jeden. Und die gute Erde ist reich und kann für jeden sorgen. Der Weg des Lebens kann frei und schön sein, aber wir haben den Weg verloren.

Die Gier hat die Seelen der Menschen vergiftet, hat die Welt mit Hass ummauert, hat uns in Elend und Blutvergießen hineinmarschiert. Wir haben Geschwindigkeit entwickelt, aber uns eingeschlossen. Maschinen, die Überfluss geben, haben uns in Not gelassen. Unser Wissen hat uns zynisch gemacht. Unsere Klugheit, hart und lieblos. Wir denken zu viel und fühlen zu wenig. Mehr als Maschinen brauchen wir Menschlichkeit. Mehr als Klugheit brauchen wir Freundlichkeit und Sanftmut. Ohne diese Eigenschaften wird das Leben gewalttätig sein und alles wird verloren gehen.`,

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
Das Einfachheit und Genuss perfekt verknüpft.`,

    3: `Der Erlkönig
von Johann Wolfgang von Goethe

Wer reitet so spät durch Nacht und Wind?
Es ist der Vater mit seinem Kind;
Er hat den Knaben wohl in dem Arm,
Er faßt ihn sicher, er hält ihn warm.

Mein Sohn, was birgst du so bang dein Gesicht? –
Siehst, Vater, du den Erlkönig nicht?
Den Erlenkönig mit Kron' und Schweif? –
Mein Sohn, es ist ein Nebelstreif.

„Du liebes Kind, komm, geh mit mir!
Gar schöne Spiele spiel' ich mit dir;
Manch' bunte Blumen sind an dem Strand,
Meine Mutter hat manch gülden Gewand."

Mein Vater, mein Vater, und hörest du nicht,
Was Erlenkönig mir leise verspricht? –
Sei ruhig, bleibe ruhig, mein Kind;
In dürren Blättern säuselt der Wind.`
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
    document.getElementById('outputText').textContent = 'Ihr verarbeiteter Text wird hier erscheinen...';
    document.getElementById('copyBtn').style.display = 'none';
}

// Copy output to clipboard
function copyOutput() {
    const outputText = document.getElementById('outputText').textContent;
    navigator.clipboard.writeText(outputText).then(() => {
        const copyBtn = document.getElementById('copyBtn');
        const originalText = copyBtn.textContent;
        copyBtn.textContent = '✅ Kopiert!';
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
        alert('Bitte geben Sie zuerst einen Text ein!');
        return;
    }

    if (inputText.length > 6000) {
        if (!confirm('Ihr Text ist sehr lang und wird auf 6000 Zeichen gekürzt. Fortfahren?')) {
            return;
        }
    }

    showLoading();

    try {
        const response = await fetch('/api/process-de', {
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
            throw new Error(`Server-Fehler: ${response.status}`);
        }

        const data = await response.json();
        
        // Format the output properly
        let formattedOutput = data.result;
        if (operation === 'metadata' || operation === 'poem') {
            formattedOutput = formattedOutput.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            formattedOutput = formattedOutput.replace(/\n/g, '<br>');
        }
        
        document.getElementById('outputText').innerHTML = formattedOutput;

        // Show source indicator
        if (data.source === 'Mistral AI') {
            console.log('✅ Antwort von Mistral AI generiert');
        } else {
            console.log('📝 Antwort im Demo-Modus generiert');
        }

    } catch (error) {
        console.error('Fehler beim Verarbeiten des Textes:', error);
        
        // Show user-friendly error message in German
        document.getElementById('outputText').innerHTML = `
            <div style="color: #e74c3c; padding: 20px; background: #ffeaa7; border-radius: 8px; border-left: 4px solid #e74c3c;">
                <strong>⚠️ Verarbeitungsfehler</strong><br>
                Ihre Anfrage konnte momentan nicht bearbeitet werden. Dies könnte folgende Ursachen haben:<br>
                • Hohe Serverlast<br>
                • Netzwerkverbindungsprobleme<br>
                • API-Ratenlimits<br><br>
                <em>Bitte versuchen Sie es in einigen Momenten erneut.</em>
            </div>
        `;
    }

    hideLoading();
}

// Auto-resize textarea
document.addEventListener('DOMContentLoaded', function() {
    const textarea = document.getElementById('inputText');
    textarea.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = this.scrollHeight + 'px';
    });
});
