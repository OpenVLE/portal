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

const dataHeaders = {
    "accept": "*/*",
    "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
    "cache-control": "no-cache",
    "pragma": "no-cache",
    "sec-ch-ua": "\"Chromium\";v=\"137\", \"Not/A)Brand\";v=\"24\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"macOS\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "no-cors",
    "sec-fetch-site": "same-origin"
};

window.loadCompleted.then((userData) => {
    (async () => {
        if (!userData.loggedIn) return;

        await contactAPI("https://bromcomvle.com/Home/GetTimetableWidgetData", dataHeaders)
        .then(blob => blobsInTheBig25IsCrazy(blob))
        .then(json => {
            const timetableBody = document.getElementById('timetableBody');

            if (timetableBody && Array.isArray(json) && json.length > 0) {
                timetableBody.innerHTML = "";
                json.forEach(row => {
                    const tr = document.createElement('tr');
                    tr.className = "hover:bg-gray-100 dark:hover:bg-gray-700";

                    tr.innerHTML = `
                        <td class="text-center py-1">Period ${row.period || "N/A"}</td>
                        <td class="text-center">${row.subject || "N/A"}</td>
                        <td class="text-center">${row.teacher || "N/A"}</td>
                        <td class="text-center">${row.time || "N/A"}</td>
                    `;

                    timetableBody.appendChild(tr);
                });
            } else if (json.length === 0) {
                timetableBody.innerHTML = `
                    <tr>
                        <td colspan='4' class='text-center py-4 text-gray-500 dark:text-gray-400'>
                            No timetable data available!
                            <div class="flex justify-center mt-4">
                                <img src="assets/images/memery/ionknow.png" class="w-full max-w-xs h-auto object-contain rounded-lg" alt="heres a meme">
                            </div>
                        </td>
                    </tr>
                `;
            }
        }).catch(error => {
            console.error("Failed to parse timetable widget data:", error);
        });
    })();

    (async () => {
        if (!userData.loggedIn) return;

        await contactAPI("https://bromcomvle.com/Home/GetSubjectWidgetData", dataHeaders)
        .then(blob => blobsInTheBig25IsCrazy(blob))
        .then(json => {
            const subjectsBody = document.getElementById('subjectsBody');

            if (subjectsBody && Array.isArray(json) && json.length > 0) {
                subjectsBody.innerHTML = "";
                json.forEach(row => {
                    const tr = document.createElement('tr');
                    tr.className = "hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer";

                    tr.addEventListener('click', () => {
                        window.location.href = `/subjects/${row.subjectId}`;
                    });

                    tr.innerHTML = `
                        <td class="text-center py-1">${row.subjectName || "N/A"}</td>
                        <td class="text-center">${row.className || "N/A"}</td>
                        <td class="text-center">${row.teacherName || "N/A"}</td>
                    `;

                    subjectsBody.appendChild(tr);
                });
            } else if (json.length === 0) {
                subjectsBody.innerHTML = `
                    <tr>
                        <td colspan='4' class='text-center py-4 text-gray-500 dark:text-gray-400'>
                            No subject data available!
                            <br>
                            (FREEDOM FROM SCHOOL ENTIRELY?????)
                            <div class="flex justify-center mt-4">
                                <img src="assets/images/memery/ionknow.png" class="w-full max-w-xs h-auto object-contain rounded-lg" alt="heres a meme">
                            </div>
                        </td>
                    </tr>
                `;
            }
        }).catch(error => {
            console.error("Failed to parse subject widget data:", error);
        });
    })();

    (async () => {
        if (!userData.loggedIn) return;

        await contactAPI("https://bromcomvle.com/Home/GetAttendanceWidgetData", dataHeaders)
        .then(blob => blobsInTheBig25IsCrazy(blob))
        .then(json => {
            const attendanceBody = document.getElementById('attendanceBody');
            const attendanceAmount = document.getElementById('attendanceAmount');
            let maxAttended = 0;
            let attended = 0;

            if (attendanceBody && Array.isArray(json.attendanceList) && json.attendanceList.length > 0) {
                attendanceBody.innerHTML = "";

                console.log(json)

                json.attendanceList.forEach(row => {
                    const tr = document.createElement('tr');
                    tr.className = "hover:bg-gray-100 dark:hover:bg-gray-700";
                    maxAttended++;

                    const attendanceData = (() => {
                        switch (row.markDescription) {
                            case json.presentAttendance:
                                return {
                                    viewBox: "0 0 576 512",
                                    path: "M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z",
                                    color: "text-green-500 dark:text-green-500",
                                    id: "circle-check"
                                }
                            case json.notTakenAttendance:
                                return {
                                    viewBox: "0 0 512 512",
                                    path: "M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM169.8 165.3c7.9-22.3 29.1-37.3 52.8-37.3l58.3 0c34.9 0 63.1 28.3 63.1 63.1c0 22.6-12.1 43.5-31.7 54.8L280 264.4c-.2 13-10.9 23.6-24 23.6c-13.3 0-24-10.7-24-24l0-13.5c0-8.6 4.6-16.5 12.1-20.8l44.3-25.4c4.7-2.7 7.6-7.7 7.6-13.1c0-8.4-6.8-15.1-15.1-15.1l-58.3 0c-3.4 0-6.4 2.1-7.5 5.3l-.4 1.2c-4.4 12.5-18.2 19-30.6 14.6s-19-18.2-14.6-30.6l.4-1.2zM224 352a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z",
                                    color: "text-gray-500 dark:text-gray-500",
                                    id: "circle-question"
                                }
                            case json.unAuthorisedAbsentAttendance:
                                return {
                                    viewBox: "0 0 512 512",
                                    path: "M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z",
                                    color: "text-red-500 dark:text-red-500",
                                    id: "circle-xmark"
                                }
                            case json.authorisedAbsentAttendance:
                                return {
                                    viewBox: "0 0 512 512",
                                    path: "M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM184 232l144 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-144 0c-13.3 0-24-10.7-24-24s10.7-24 24-24z",
                                    color: "text-purple-500 dark:text-purple-400",
                                    id: "circle-minus"
                                }
                            case json.lateAttendance:
                                return {
                                    viewBox: "0 0 512 512",
                                    path: "M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm0-384c13.3 0 24 10.7 24 24l0 112c0 13.3-10.7 24-24 24s-24-10.7-24-24l0-112c0-13.3 10.7-24 24-24zM224 352a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z",
                                    color: "text-yellow-500 dark:text-yellow-500",
                                    id: "circle-exclamation"
                                }
                            default: // do what bromcom does and just return authorisedAbsent
                                return {
                                    viewBox: "0 0 512 512",
                                    path: "M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM184 232l144 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-144 0c-13.3 0-24-10.7-24-24s10.7-24 24-24z",
                                    color: "text-purple-500 dark:text-purple-400",
                                    id: "circle-minus"
                                }
                        }
                    })();

                    tr.innerHTML = `
                        <td class="text-center py-1">${row.periods || "N/A"}</td>
                        <td class="text-center">${row.classSubjects || "N/A"}</td>
                        <td class="text-center py-1">
                            <span class="${attendanceData.color}">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="${attendanceData.viewBox}" class="w-7 h-7 mx-auto" fill="currentColor">
                                    <path d="${attendanceData.path}"/>
                                </svg>
                            </span>
                        </td>
                        <td class="text-center">${row.startDate ? new Date(row.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "N/A"}</td>
                    `;

                    attendanceBody.appendChild(tr);
                });

                attendanceAmount.textContent = `${attended}/${maxAttended}`;

                if (attended === maxAttended) {
                    attendanceAmount.classList.add('text-green-500');
                } else if (attended === 0) {
                    attendanceAmount.classList.add('text-red-500');
                } else {
                    attendanceAmount.classList.add('text-yellow-500');
                }
            } else if (json.attendanceList.length === 0) {
                attendanceBody.innerHTML = `
                    <tr>
                        <td colspan='4' class='text-center py-4 text-gray-500 dark:text-gray-400'>
                            No attendance data available!
                            <div class="flex justify-center mt-4">
                                <img src="assets/images/memery/ionknow.png" class="w-full max-w-xs h-auto object-contain rounded-lg" alt="heres a meme">
                            </div>
                        </td>
                    </tr>
                `;

                attendanceAmount.textContent = "0/0";
                attendanceAmount.classList.add('text-gray-500');
                attendanceAmount.classList.add('dark:text-gray-400');
            }
        }).catch(error => {
            console.error("Failed to parse attendance widget data:", error);
        });
    })();

    (async () => {
        if (!userData.loggedIn) return;

        await contactAPI("https://bromcomvle.com/Home/GetCalendarEventsWidgetData", dataHeaders)
        .then(blob => blobsInTheBig25IsCrazy(blob))
        .then(json => {
            const behaviourBody = document.getElementById('behaviourBody');

            if (behaviourBody && Array.isArray(json) && json.length > 0) {
                behaviourBody.innerHTML = "";
                json.forEach(row => {
                    const tr = document.createElement('tr');
                    tr.className = "hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer";

                    tr.addEventListener('click', () => {
                        window.location.href = `http://localhost:3000/behaviour/${row.id}`;
                    });

                    tr.innerHTML = `
                        <td class="text-center py-1">${row.type || "N/A"}</td>
                        <td class="text-center">${row.description || "N/A"}</td>
                        <td class="text-center">${row.date ? new Date(row.date).toLocaleDateString() : "N/A"}</td>
                    `;

                    behaviourBody.appendChild(tr);
                });
            } else if (json.length === 0) {
                behaviourBody.innerHTML = `
                    <tr>
                        <td colspan='3' class='text-center py-4 text-gray-500 dark:text-gray-400'>
                            No behaviour data available!
                            <div class="flex justify-center mt-4">
                                <img src="assets/images/memery/ionknow.png" class="w-full max-w-xs h-auto object-contain rounded-lg" alt="heres a meme">
                            </div>
                        </td>
                    </tr>
                `;
            }
        }).catch(error => {
            console.error("Failed to parse behaviour widget data:", error);
        });
    })();
});