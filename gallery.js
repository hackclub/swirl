const FALLBACK_IMAGES = [
    // Add more fallback screenshots here if needed
    'https://cdn.hackclub.com/rescue?url=https://hc-cdn.hel1.your-objectstorage.com/s/v3/b62df713cb00bdfe9d2d3910319da7babce118af_waffle.png',
    'https://cdn.hackclub.com/rescue?url=https://hc-cdn.hel1.your-objectstorage.com/s/v3/a4cdda8aaa878c3d4f4cfce1e641843a93a7b940_img_0769.png',
    'https://cdn.hackclub.com/rescue?url=https://hc-cdn.hel1.your-objectstorage.com/s/v3/0f50a9029a506bb376d6cefaff3549a441cd9a4b_chatgpt-swirl.png',
    'https://cdn.hackclub.com/rescue?url=https://hc-cdn.hel1.your-objectstorage.com/s/v3/43698bb57a93bd8a977fd85b92f00f33ec4ac611_scrapyard-proj-logo.png',
    'https://cdn.hackclub.com/rescue?url=https://hc-cdn.hel1.your-objectstorage.com/s/v3/27cee257bd6155fd84b14cb2feb003cb570d3fc1_lubabaxn-swirl-1.png',
    'https://cdn.hackclub.com/rescue?url=https://hc-cdn.hel1.your-objectstorage.com/s/v3/fb5257c83deeaaf1d5fce9c6c75a297c7f2241b2_lubabaxn-swirl-2.png',
    'https://cdn.hackclub.com/rescue?url=https://hc-cdn.hel1.your-objectstorage.com/s/v3/e81025c39885d2f1fc1334e16d928d515c8031df_lubabaxn-swirl-3.png',
    'https://cdn.hackclub.com/rescue?url=https://hc-cdn.hel1.your-objectstorage.com/s/v3/3e0f17e9a7e8083ffe562c146ce6ffb8c0f2150e_swirl-sticker-submission.png',
    'https://cdn.hackclub.com/rescue?url=https://hc-cdn.hel1.your-objectstorage.com/s/v3/c34a3834cf6e419da4cfc2147b2bf370e86c3e95_alb-swirl.png',
];

/** Resolves a screenshot field value (string, array, or object) to an absolute URL. */
function resolveScreenshotUrl(screenshotField) {
    if (!screenshotField) return null;

    if (Array.isArray(screenshotField)) {
        const first = screenshotField[0];
        return first?.url ?? first ?? null;
    }

    if (typeof screenshotField === 'object') {
        return screenshotField.url ?? null;
    }

    return screenshotField; // already a string URL
}

/** Returns a random image URL from FALLBACK_IMAGES. */
function randomFallbackImage() {
    return FALLBACK_IMAGES[Math.floor(Math.random() * FALLBACK_IMAGES.length)];
}

/** Creates and returns a gallery card element for a single submission record. */
function createGalleryItem(fields) {
    const username = fields['github_username'] || 'Untitled Project';
    const demoUrl = fields['playable_url'] || '#';
    const sourceUrl = fields['code_url'] || '#';
    const screenshotUrl = resolveScreenshotUrl(fields['screenshot_url']);
    const scoopCount = fields['scoops_count'] || 'N/A';
    const fallback = randomFallbackImage();

    const item = document.createElement('div');
    item.className = 'gallery-item';

    const title = document.createElement('h2');
    title.className = 'gallery-item__title';
    title.textContent = username;

    const img = document.createElement('img');
    img.className = 'gallery-item__img';
    img.src = screenshotUrl ?? fallback;
    img.alt = `Screenshot of ${username}'s project`;
    img.onerror = function () {
        this.onerror = null;
        this.src = fallback;
    };

    const scoopsCountContainer = document.createElement('div');
    if (scoopCount !== undefined) {
        scoopsCountContainer.style.display = 'flex';
        scoopsCountContainer.style.alignItems = 'center';
        scoopsCountContainer.style.justifyContent = 'center';
        scoopsCountContainer.style.marginBottom = '8px';
        scoopsCountContainer.style.flexDirection = 'row';
        scoopsCountContainer.style.width = '100%';

        const scoopsCount = document.createElement('span');
        scoopsCount.textContent = scoopCount;
        scoopsCount.style.fontSize = '20px';
        scoopsCount.style.color = '#555';
        scoopsCount.style.marginLeft = '4px';

        const scoopsImage = document.createElement('img');
        scoopsImage.className = 'gallery-item__scoops_img';
        scoopsImage.src =
            'https://emoji.slack-edge.com/T09V59WQY1E/swirl/c5e54c041443a5ed.png';
        scoopsImage.alt = 'Scoops';
        scoopsImage.style.width = '28px';

        scoopsCountContainer.appendChild(scoopsImage);
        scoopsCountContainer.appendChild(scoopsCount);
    } else {
        scoopsCountContainer.style.height = '32px'; // reserve space for missing scoop count
    }

    const actions = document.createElement('div');
    actions.className = 'gallery-item__actions';

    const demoLink = document.createElement('a');
    demoLink.href = demoUrl;
    demoLink.target = '_blank';
    const demoBtn = document.createElement('button');
    demoBtn.textContent = 'Demo';
    demoLink.appendChild(demoBtn);

    const sourceLink = document.createElement('a');
    sourceLink.href = sourceUrl;
    sourceLink.target = '_blank';
    const sourceBtn = document.createElement('button');
    sourceBtn.textContent = 'Source';
    sourceLink.appendChild(sourceBtn);

    actions.appendChild(demoLink);
    actions.appendChild(sourceLink);

    item.appendChild(title);
    item.appendChild(img);
    item.appendChild(scoopsCountContainer);
    item.appendChild(actions);

    return item;
}

fetch('/data.json')
    .then((response) => response.json())
    .then((data) => {
        const gallery = document.getElementById('gallery');
        gallery.innerHTML = '';
        document.getElementById('swirl-ships').textContent =
            Object.keys(data).length;
        Object.keys(data).forEach((key) => {
            const record = data[key];
            gallery.appendChild(createGalleryItem(record));
        });
    })
    .catch((err) => {
        document.getElementById('gallery').innerHTML =
            '<p>Failed to load gallery.</p>';
        console.error(err);
    });
