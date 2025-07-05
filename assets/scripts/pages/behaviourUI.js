function blobsInTheBig25IsCrazy(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = function(data) {
            try {
                const object = data.target.result;

                if (object.includes("<!DOCTYPE html>") || object.includes("<html>")) {
                    return console.error("..we've broken the fourth wall");
                } else {
                    resolve(JSON.parse(data.target.result));
                }
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = reject;
        reader.readAsText(blob);
    });
}

async function contactAPI(url, headers = {}, excludeDataHeaders = true, method = "GET") {
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
                    method,
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

    (async () => {
        await contactAPI("https://bromcomvle.com/Behaviour/StudentBehaviour", dataHeaders, undefined, "POST")
        .then(blob => blobsInTheBig25IsCrazy(blob))
        .then(json => {
            const studentEvents = json?.studentEvents || [];
            const eventBody = document.getElementById('studentBehaviourEventBody');
            const hideSystemEventsCheckbox = document.getElementById('hideSystemEvents');
            const shownEventCount = document.getElementById('shownEventCount');
            const totalEventCount = document.getElementById('totalEventCount');

            async function calculateEvents(studentEvents) {
                eventBody.innerHTML = '';
                const eventAmount = studentEvents.length;
                let eventsProcessed = 0;

                studentEvents.forEach(event => {
                    if (eventsProcessed >= 15) return;
                    if (hideSystemEventsCheckbox.checked && event.teacher === "System") return;
                    const row = document.createElement('tr');

                    if (event.adjustment !== '') {
                        const adjustmentValue = Number(event.adjustment);
                        const isPositive = adjustmentValue > 0;
                        const isNegative = adjustmentValue < 0;
                        event.adjustmentColour = isPositive ? 'text-green-500' : isNegative ? 'text-red-600 dark:text-red-400' : 'text-green-500';
                        event.adjustment = isPositive ? `+${adjustmentValue}` : adjustmentValue.toString();
                    }

                    if (event.date === '' || event.date === 'N/A') {
                        event.date = 'No date provided.';
                        event.dateColour = 'text-gray-500 dark:text-gray-400';
                    }

                    if (event.class === '' || event.class === 'N/A') {
                        event.class = 'No class assigned.';
                        event.classColour = 'text-gray-500 dark:text-gray-400';
                    }

                    if (event.subject === '' || event.subject === 'N/A') {
                        event.subject = 'No subject assigned.';
                        event.subjectColour = 'text-gray-500 dark:text-gray-400';
                    }

                    if (event.teacher === '' || event.teacher === 'N/A') {
                        event.teacher = 'No teacher assigned.';
                        event.teacherColour = 'text-gray-500 dark:text-gray-400';
                    }

                    if (event.comment === '' || event.comment === 'N/A') {
                        event.comment = 'No comment provided.';
                        event.commentColour = 'text-gray-500 dark:text-gray-400';
                    }

                    if (event.event === '' || event.event === 'N/A') {
                        event.event = 'No event provided.';
                        event.eventColour = 'text-gray-500 dark:text-gray-400';
                    }

                    if (event.outcome === '' || event.outcome === 'N/A') {
                        event.outcome = 'No outcome provided.';
                        event.outcomeColour = 'text-gray-500 dark:text-gray-400';
                    }

                    row.innerHTML = `
                        <td class="text-center py-2 px-3 ${event.dateColour}">${event.date}</td>
                        <td class="text-center py-2 px-3 ${event.classColour}">${event.class}</td>
                        <td class="text-center py-2 px-3 ${event.subjectColour}">${event.subject}</td>
                        <td class="text-center py-2 px-3 ${event.teacherColour}">${event.teacher}</td>
                        <td class="text-center py-2 px-3 ${event.commentColour}">${event.comment}</td>
                        <td class="text-center py-2 px-3 ${event.eventColour}">${event.event}</td>
                        <td class="text-center py-2 px-3 ${event.outcomeColour}">${event.outcome}</td>
                        <td class="text-center py-2 px-3 ${event.adjustmentColour}">${event.adjustment}</td>
                    `;
                    
                    eventBody.appendChild(row);
                    eventsProcessed++;
                });

                shownEventCount.textContent = eventsProcessed;
                totalEventCount.textContent = eventAmount;
            }

            calculateEvents(studentEvents);
            hideSystemEventsCheckbox.addEventListener('change', calculateEvents.bind(null, studentEvents));
        })
        .catch(error => {
            console.error("Failed to fetch student behaviour data:", error);
        });
    })();
});