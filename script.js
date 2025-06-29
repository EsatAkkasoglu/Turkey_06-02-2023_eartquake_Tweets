const datasets = {
    'depremGun1en_V2.csv': 'February 6',
    'depremGun2en_V2.csv': 'February 7',
    'depremGun3en_V2.csv': 'February 8',
    'depremGun4en_V2.csv': 'February 9',
    'depremGun5en_V2.csv': 'February 10'
};

const select = document.getElementById('dataset-select');
for (const file in datasets) {
    const option = document.createElement('option');
    option.value = file;
    option.textContent = datasets[file];
    select.appendChild(option);
}

select.addEventListener('change', () => loadData(select.value));

// Load first dataset by default
loadData(select.value);

async function loadData(file) {
    const rows = await d3.csv(file, d => ({
        date: new Date(d.Date),
        hashtags: parseHashtags(d.hashtag)
    }));

    const byHour = d3.rollups(rows, v => v.length, d => d3.timeHour(d.date));
    byHour.sort((a, b) => a[0] - b[0]);
    const volumeLabels = byHour.map(d => d3.timeFormat('%Y-%m-%d %H:%M')(d[0]));
    const volumeCounts = byHour.map(d => d[1]);
    updateLineChart(volumeLabels, volumeCounts);

    const hashtagCounts = {};
    rows.forEach(r => {
        r.hashtags.forEach(tag => {
            hashtagCounts[tag] = (hashtagCounts[tag] || 0) + 1;
        });
    });
    const topTags = Object.entries(hashtagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
    const tagLabels = topTags.map(d => d[0]);
    const tagValues = topTags.map(d => d[1]);
    updateBarChart(tagLabels, tagValues);
}

function parseHashtags(str) {
    if (!str || str.toLowerCase() === 'none') return [];
    try {
        return JSON.parse(str.replace(/'/g, '"'));
    } catch (e) {
        return [];
    }
}

let volumeChart;
let tagChart;

function updateLineChart(labels, data) {
    if (volumeChart) volumeChart.destroy();
    const ctx = document.getElementById('tweetVolumeChart').getContext('2d');
    volumeChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Tweet Volume',
                data,
                borderColor: '#007bff',
                fill: false
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: { display: true },
                y: { display: true }
            }
        }
    });
}

function updateBarChart(labels, data) {
    if (tagChart) tagChart.destroy();
    const ctx = document.getElementById('topHashtagsChart').getContext('2d');
    tagChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Top Hashtags',
                data,
                backgroundColor: '#28a745'
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: { display: true },
                y: { display: true }
            }
        }
    });
}
