const IMAGE_HOST = 'https://yourdomain.com';
const FALLBACK_IMAGE = IMAGE_HOST + '/images/assets/png/sprinkles_goof.png';

fetch('data.yaml')
    .then(response => response.text())
    .then(yamlText => {
        const data = jsyaml.load(yamlText);
        const gallery = document.getElementById('gallery');
        gallery.innerHTML = '';

        data.records.forEach(record => {
            const fields = record.fields;
            const ghUser = fields['GitHub Username'] || 'Untitled Project';
            const demoUrl = fields['Playable URL'] || '#';
            const sourceUrl = fields['Code URL'] || '#';

            let screenshot = FALLBACK_IMAGE;
            if (fields['Screenshot']) {
                if (Array.isArray(fields['Screenshot'])) {
                    if (fields['Screenshot'][0]) {
                        screenshot = fields['Screenshot'][0].url || fields['Screenshot'][0];
                    }
                } else if (typeof fields['Screenshot'] === 'object' && fields['Screenshot'].url) {
                    screenshot = fields['Screenshot'].url;
                } else if (typeof fields['Screenshot'] === 'string') {
                    screenshot = fields['Screenshot'];
                }
            }
            // Prepend IMAGE_HOST if not absolute
            if (
                screenshot &&
                !/^https?:\/\//.test(screenshot)
            ) {
                screenshot = IMAGE_HOST + (screenshot.startsWith('/') ? '' : '/') + screenshot;
            }

            const item = document.createElement('div');
            item.className = 'gallery-item';
            item.innerHTML = `
                <h2 style="font-size: 100%">${ghUser}</h2>
                <img src="${screenshot}" alt="Screenshot" style="width: 10rem; height: 10rem; border-radius: 20%; margin-top: 1rem; margin-bottom: 1rem;">
                <br>
                <a href="${demoUrl}" target="_blank"><button style="padding: 1rem;">Demo</button></a>
                <a href="${sourceUrl}" target="_blank"><button style="padding: 1rem;">Source</button></a>
            `;
            gallery.appendChild(item);
        });
    })
    .catch(err => {
        document.getElementById('gallery').innerHTML = '<p>Failed to load gallery.</p>';
        console.error(err);
    });