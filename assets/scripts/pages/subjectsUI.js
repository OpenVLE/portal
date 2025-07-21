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
        
        await contactAPI("https://bromcomvle.com/Subjects", dataHeaders)
        .then(async blob => {
            const decodedHTML = (await blob.text()).trim();
            const parser = new DOMParser();
            return parser.parseFromString(decodedHTML, "text/html");
        })
        .then(bromcomSubjects => {
            const subjectBody = bromcomSubjects.getElementById("Subjects").querySelector("tbody");
            const eventBody = document.getElementById('studentBehaviourEventBody');
            const subjects = subjectBody.querySelectorAll("tr");

            eventBody.innerHTML = ``;

            subjects.forEach(subject => {
                const subjectObject = Array.from(subject.children).find(td => !td.id && !td.className);
                const subjectName = subjectObject ? subjectObject.textContent : "";
                const className = subject.querySelector("#sp-table-contents-classname").textContent;
                const teacher = subject.querySelector("#sp-table-contents-teachername").textContent;
                const attendance = subject.querySelector("#sp-table-contents-attendence").textContent;

                const row = document.createElement('tr');

                row.innerHTML = `
                    <td class="text-center py-2 px-3">${subjectName}</td>
                    <td class="text-center py-2 px-3">${className}</td>
                    <td class="text-center py-2 px-3">${teacher}</td>
                    <td class="text-center py-2 px-3">${attendance}</td>
                `;

                // ill put the function here later

                eventBody.appendChild(row);
            });


        })
        .catch(error => {
            console.error("Error fetching Bromcom subjects data:", error);
        });
    })();
});