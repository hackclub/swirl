const IMAGE_HOST = 'https://hackclub.com';
const FALLBACK_IMAGES = [
    //ADD FALLBACK IMAGES HERE!
    'https://hc-cdn.hel1.your-objectstorage.com/s/v3/b62df713cb00bdfe9d2d3910319da7babce118af_waffle.png',
    'https://hc-cdn.hel1.your-objectstorage.com/s/v3/a4cdda8aaa878c3d4f4cfce1e641843a93a7b940_img_0769.png',
    'https://hc-cdn.hel1.your-objectstorage.com/s/v3/0f50a9029a506bb376d6cefaff3549a441cd9a4b_chatgpt-swirl.png',
    'https://hc-cdn.hel1.your-objectstorage.com/s/v3/43698bb57a93bd8a977fd85b92f00f33ec4ac611_scrapyard-proj-logo.png',
    'https://hc-cdn.hel1.your-objectstorage.com/s/v3/27cee257bd6155fd84b14cb2feb003cb570d3fc1_lubabaxn-swirl-1.png',
    'https://hc-cdn.hel1.your-objectstorage.com/s/v3/fb5257c83deeaaf1d5fce9c6c75a297c7f2241b2_lubabaxn-swirl-2.png',
    'https://hc-cdn.hel1.your-objectstorage.com/s/v3/e81025c39885d2f1fc1334e16d928d515c8031df_lubabaxn-swirl-3.png',
    'https://hc-cdn.hel1.your-objectstorage.com/s/v3/3e0f17e9a7e8083ffe562c146ce6ffb8c0f2150e_swirl-sticker-submission.png',
    'https://hc-cdn.hel1.your-objectstorage.com/s/v3/c34a3834cf6e419da4cfc2147b2bf370e86c3e95_alb-swirl.png',
];

fetch('/data.yaml')
    .then((response) => response.text())
    .then((yamlText) => {
        const data = jsyaml.load(yamlText);
        const gallery = document.getElementById('gallery');
        gallery.innerHTML = '';

        data.records.forEach((record, idx) => {
            const fields = record.fields;
            const ghUser = fields['GitHub Username'] || 'Untitled Project';
            const demoUrl = fields['Playable URL'] || '#';
            const sourceUrl = fields['Code URL'] || '#';

            let screenshot =
                IMAGE_HOST + '/images/assets/png/sprinkles_goof.png';
            if (fields['Screenshot']) {
                if (Array.isArray(fields['Screenshot'])) {
                    if (fields['Screenshot'][0]) {
                        screenshot =
                            fields['Screenshot'][0].url ||
                            fields['Screenshot'][0];
                    }
                } else if (
                    typeof fields['Screenshot'] === 'object' &&
                    fields['Screenshot'].url
                ) {
                    screenshot = fields['Screenshot'].url;
                } else if (typeof fields['Screenshot'] === 'string') {
                    screenshot = fields['Screenshot'];
                }
            }

            // Prepend IMAGE_HOST if not absolute
            if (screenshot && !/^https?:\/\//.test(screenshot)) {
                screenshot =
                    IMAGE_HOST +
                    (screenshot.startsWith('/') ? '' : '/') +
                    screenshot;
            }

            // Falback img randomizer
            const randomFallback =
                FALLBACK_IMAGES[
                    Math.floor(Math.random() * FALLBACK_IMAGES.length)
                ];

            const imgId = `gallery-img-${idx}`;
            const item = document.createElement('div');
            item.className = 'gallery-item';
            item.innerHTML = `
                <h2 style="font-size: 100%">${ghUser}</h2>
                <img id="${imgId}" src="${screenshot}" alt="Screenshot"
                    style="width: 10rem; height: 10rem; border-radius: 20%; margin-top: 1rem; margin-bottom: 1rem;">
                <br>
                <a href="${demoUrl}" target="_blank"><button style="padding: 1rem;">Demo</button></a>
                <a href="${sourceUrl}" target="_blank"><button style="padding: 1rem;">Source</button></a>
            `;
            gallery.appendChild(item);

            // custom onerror handler attachment to randomize fallback imgs
            const img = document.getElementById(imgId);
            img.onerror = function () {
                this.onerror = null;
                this.src = randomFallback;
            };
        });
    })
    .catch((err) => {
        document.getElementById('gallery').innerHTML =
            '<p>Failed to load gallery.</p>';
        console.error(err);
    });
