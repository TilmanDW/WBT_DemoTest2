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
        return res.status(405).json({ error: 'Methode nicht erlaubt' });
    }

    try {
        const { text, operation } = req.body;

        if (!text || !operation) {
            return res.status(400).json({ error: 'Text oder Operation fehlt' });
        }

        // Limit input length to prevent API issues
        const maxLength = 6000;
        const processText = text.length > maxLength ? text.substring(0, maxLength) + "..." : text;

        // Try Mistral API first with German prompts
        if (process.env.HUGGINGFACE_API_KEY) {
            try {
                const mistralResult = await callMistralAPIGerman(processText, operation);
                return res.status(200).json({ result: mistralResult, source: 'Mistral AI' });
            } catch (apiError) {
                console.log('Mistral API fehlgeschlagen:', apiError.message);
            }
        }

        // Fallback to German demo responses
        console.log('Verwende erweiterten Demo-Modus');
        let result = getDemoResponseGerman(operation, processText);
        res.status(200).json({ result: result + '\n\n<em>📝 Generiert im Demo-Modus</em>', source: 'Demo-Modus' });

    } catch (error) {
        console.error('Fehler:', error);
        res.status(500).json({ error: 'Interner Server-Fehler' });
    }
}

async function callMistralAPIGerman(text, operation) {
    const prompts = {
        summarize: `<s>[INST] Bitte fassen Sie den folgenden Text in genau 5 Zeilen oder weniger zusammen. Konzentrieren Sie sich auf die wichtigsten Botschaften und Schlüsselpunkte. Jede Zeile sollte einen vollständigen Gedanken enthalten. Antworten Sie auf Deutsch:

${text} [/INST]`,

        metadata: `<s>[INST] Analysieren Sie den folgenden Text und extrahieren Sie Metadaten. Geben Sie genau 5 Schlüsselwörter und 5 Schlüsselkonzepte an.

Formatieren Sie Ihre Antwort genau so:
**Schlüsselwörter:**
• [Schlüsselwort 1]
• [Schlüsselwort 2] 
• [Schlüsselwort 3]
• [Schlüsselwort 4]
• [Schlüsselwort 5]

**Konzepte:**
• [Konzept 1]
• [Konzept 2]
• [Konzept 3]
• [Konzept 4]
• [Konzept 5]

Zu analysierender Text:
${text} [/INST]`,

        poem: `<s>[INST] Schreiben Sie den folgenden Text als lustiges, einfaches Gedicht für Kinder im Alter von 6-9 Jahren um. Verwenden Sie:
- Einfache Wörter, die sie verstehen können
- Lustige Reime und Rhythmus
- Machen Sie es lehrreich und unterhaltsam
- Die Kernbotschaft beibehalten, aber kinderfreundlich gestalten
- Antworten Sie auf Deutsch

Umzuschreibender Text:
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
        throw new Error(`Mistral API Fehler: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    
    if (result && result[0] && result[0].generated_text) {
        let generatedText = result[0].generated_text.trim();
        
        // Clean up the response
        generatedText = generatedText.replace(/\[INST\].*?\[\/INST\]/g, '').trim();
        generatedText = generatedText.replace(/^<s>|<\/s>$/g, '').trim();
        
        return generatedText;
    } else if (result.error) {
        throw new Error(`Mistral API Fehler: ${result.error}`);
    } else {
        throw new Error('Ungültiges API-Antwortformat');
    }
}

function getDemoResponseGerman(operation, text) {
    switch(operation) {
        case 'summarize':
            return getSummaryGerman(text);
        case 'metadata':
            return getMetadataGerman(text);
        case 'poem':
            return getKidsPoemGerman(text);
        default:
            return 'Text erfolgreich im Demo-Modus verarbeitet.';
    }
}

function getSummaryGerman(text) {
    if (text.includes('Kaiser') || text.toLowerCase().includes('chaplin') || text.includes('regieren')) {
        return `Charlie Chaplins Rede lehnt Diktatur ab und plädiert dafür, allen Menschen unabhängig von Rasse oder Religion zu helfen.
Er argumentiert, dass Gier die Menschlichkeit vergiftet und zu Hass, Elend und Blutvergießen weltweit geführt hat.
Die Rede betont, dass wir mehr Menschlichkeit, Freundlichkeit und Sanftmut brauchen als nur Maschinen und Klugheit.
Moderne Erfindungen wie Flugzeuge und Radio sollten uns in universeller Brüderlichkeit vereinen, anstatt uns zu trennen.
Seine Botschaft erreicht Millionen leidender Menschen, die Opfer von Systemen sind, die Unschuldige foltern und einsperren.`;
    } else if (text.toLowerCase().includes('suppe') || text.toLowerCase().includes('tüten')) {
        return `Dieses deutsche Gedicht feiert Tütensuppe als wunderbare, praktische Nahrungslösung in bunter Verpackung.
Der Autor beschreibt, wie heißes Wasser trockene Flocken magisch in eine schmackhafte, nahrhafte Brühe verwandelt.
Tütensuppe wird als zuverlässiger Begleiter gepriesen, der zu jeder Tageszeit verfügbar ist, unabhängig von Jahreszeit oder Wetter.
Trotz möglicher Spötteleien anderer verteidigt der Dichter Tütensuppe als mehr als nur Nahrung - sie ist ein Konzept.
In unserer hektischen, stressigen Welt beweist Tütensuppe, dass Einfachheit und Genuss perfekt kombiniert werden können.`;
    } else if (text.toLowerCase().includes('erlkönig') || text.toLowerCase().includes('goethe')) {
        return `Goethes "Erlkönig" erzählt von einem Vater, der nachts mit seinem Kind durch den Wind reitet.
Das Kind sieht den mystischen Erlkönig, der es mit schönen Versprechen zu locken versucht.
Der Vater versucht sein Kind zu beruhigen und die Erscheinungen rational zu erklären.
Die Ballade steigert sich dramatisch, während der Erlkönig immer verlockender und bedrohlicher wird.
Am Ende stirbt das Kind in den Armen des Vaters, was die Macht des Übernatürlichen unterstreicht.`;
    } else {
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
        const keyPoints = sentences.slice(0, 5);
        return keyPoints.map(sentence => sentence.trim()).join('\n');
    }
}

function getMetadataGerman(text) {
    let keywords = [];
    let concepts = [];
    
    if (text.includes('Kaiser') || text.toLowerCase().includes('chaplin') || text.includes('regieren')) {
        keywords = ['Menschlichkeit', 'Brüderlichkeit', 'Freiheit', 'Freundlichkeit', 'Einheit'];
        concepts = ['Universelle Menschenrechte', 'Anti-Diktatur-Botschaft', 'Technologie für
