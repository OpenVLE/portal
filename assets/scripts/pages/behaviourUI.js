async function contactAPI(url, headers = {}, excludeDataHeaders = true) {
    return new Promise((resolve, reject) => {
        window.postMessage({
            type: "contactAPI",
            data: {
                url,
                excludeDataHeaders,
                options: {
                    headers,
                    referrer: "https://bromcomvle.com/Home/Dashboard",
                    referrerPolicy: "strict-origin-when-cross-origin",
                    method: "GET",
                    mode: "cors",
                    credentials: "include"
                }
            }
        }, "*");

        function messageHandler(event) {
            if (event.data && event.data?.type === "apiResponse" && event.data.data.url === url) {
                window.removeEventListener("message", messageHandler);

                if (event.data.data.error) {
                    reject(new Error(event.data.data.error));
                } else {
                    const base64 = event.data.data.body;
                    const byteCharacters = atob(base64);
                    const byteNumbers = new Array(byteCharacters.length);

                    for (let i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                    }

                    const byteArray = new Uint8Array(byteNumbers);
                    const type = event.data.data.contentType || undefined;
                    const blob = new Blob([byteArray], type ? { type } : undefined);
                    resolve(blob);
                }
            }
        }

        window.addEventListener("message", messageHandler);
    });
}

window.loadCompleted.then((userData) => {
    (async () => {
        if (!userData.loggedIn) return;

        await contactAPI("https://bromcomvle.com/Behaviour", dataHeaders)
        .then(async blob => {
            const decodedHTML = (await blob.text()).trim();
            const parser = new DOMParser();
            return parser.parseFromString(decodedHTML, "text/html");
        })
        .then(bromcomBehaviour => {
            const totalPositivePoints = Number(bromcomBehaviour.getElementById("TotalPositivePoints").textContent);
            const totalNegativePoints = Number(bromcomBehaviour.getElementById("TotalNegativePoints").textContent);
            const absPositive = Math.abs(totalPositivePoints);
            const absNegative = Math.abs(totalNegativePoints);
            const total = absPositive + absNegative;

            document.getElementById('positivePoints').textContent = totalPositivePoints;
            document.getElementById('negativePoints').textContent = absNegative;
            document.getElementById('totalPoints').textContent = total;
            document.getElementById('positivePercent').textContent = total === 0 ? '0%' : ((absPositive / total) * 100).toFixed(1) + '%';
            document.getElementById('negativePercent').textContent = total === 0 ? '0%' : ((absNegative / total) * 100).toFixed(1) + '%';

            const ctx = document.getElementById('behaviourPieChart').getContext('2d');
            new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: ['Positive', 'Negative'],
                    datasets: [{
                        data: [absPositive, absNegative],
                        backgroundColor: [
                            'rgb(34,197,94)',
                            'rgb(239,68,68)'
                        ],
                        borderWidth: 0
                    }]
                },
                options: {
                    plugins: {
                        legend: {
                            display: false
                        }
                    }
                }
            });

            const customLabels = document.getElementById('customPieLabels');

            customLabels.innerHTML = `
                <span class="flex items-center gap-1.5">
                    <span class="w-3 h-3 bg-green-500 rounded-sm inline-block"></span>
                    <span>Positive</span>
                </span>
                <span class="flex items-center gap-1.5">
                    <span class="w-3 h-3 bg-red-500 rounded-sm inline-block"></span>
                    <span>Negative</span>
                </span>
            `;
        })
        .catch(error => {
            console.error("Failed to fetch user data:", error);
            reject(error);
        });
    })();
});