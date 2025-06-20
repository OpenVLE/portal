document.addEventListener('DOMContentLoaded', async function() {
    function showNotification(message, connectionSuccessful = true, latency = "N/A", duration = 3000) {
        const toast = document.getElementById('notificationToast');
        const msg = document.getElementById('notificationMessage');
        const latencyText = document.getElementById('notificationLatency');

        msg.textContent = message;
        latencyText.textContent = latency;
        toast.classList.remove('opacity-0');
        toast.classList.add('opacity-100');
        toast.style.bottom = '40px';

        setTimeout(() => {
          toast.classList.remove('opacity-100');
          toast.classList.add('opacity-0');
          toast.style.bottom = '-100px';
        }, duration);
    }

    const serviceInstalled = await new Promise((resolve) => {
        const start = performance.now();
        let responded = false;
        let animationID;

        const timeout = setTimeout(() => {
            window.removeEventListener("message", messageHandler);
            cancelAnimationFrame(animationID);
            resolve(false);
        }, 3000);

        const messageHandler = (event) => {
            if (event.data?.type === "heartbeat") {
                responded = true;
                const end = performance.now();
                const duration = Math.round(end - start);
                showNotification(`Connected to the OpenVLE Service!`, true, duration + "ms");
                console.log(`heartbeat received after ${duration}ms`);

                // --

                window.removeEventListener("message", messageHandler);
                cancelAnimationFrame(animationID);
                clearTimeout(timeout);
                resolve(true);
            }
        };

        const ping = () => {
            if (responded) return;
            window.postMessage({ type: "hello-world" }, "*");
            animationID = requestAnimationFrame(ping);
        };

        window.addEventListener("message", messageHandler);
        ping();
    });

    if (!serviceInstalled) return;

    window.addEventListener("message", function(event) {
        if (event.data && event.data.type === "apiResponse") {
            if (event.data.data.url === "https://bromcomvle.com/AccountSettings/GetPersonPhoto") {
                let base64 = event.data.data.body;

                try {
                    const byteCharacters = atob(base64);
                    const byteNumbers = new Array(byteCharacters.length);

                    for (let i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                    }

                    const byteArray = new Uint8Array(byteNumbers);
                    const blob = new Blob([byteArray]);
                    const imageURL = URL.createObjectURL(blob);

                    document.getElementById('openVLEAvatar').src = imageURL;
                } catch (error) {
                    console.error("Failed to set the epic user's pfp:", error);
                    console.log(base64)
                }
            } else if (event.data.data.url === "https://bromcomvle.com/AccountSettings/GetSchoolPhoto") {
                let base64 = event.data.data.body;

                try {
                    const byteCharacters = atob(base64);
                    const byteNumbers = new Array(byteCharacters.length);

                    for (let i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                    }

                    const byteArray = new Uint8Array(byteNumbers);
                    const blob = new Blob([byteArray]);
                    const imageURL = URL.createObjectURL(blob);

                    document.getElementById('schoolLogo').src = imageURL;
                } catch (error) {
                    console.error("Failed to set the epic user's pfp:", error);
                    console.log(base64)
                }
            } else if (event.data.data.url === "https://bromcomvle.com/Home/GetTimetableWidgetData") {
                try {
                    const byteCharacters = atob(event.data.data.body);
                    const byteNumbers = new Array(byteCharacters.length);

                    for (let i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                    }

                    const byteArray = new Uint8Array(byteNumbers);
                    const blob = new Blob([byteArray], { type: "application/json" });
                    const reader = new FileReader();

                    reader.onload = function(data) {
                        try {
                            const json = JSON.parse(data.target.result);
                            const timetableBody = document.getElementById('timetableBody');

                            if (timetableBody && Array.isArray(json)) {
                                timetableBody.innerHTML = "";

                                json.forEach(row => {
                                    const tr = document.createElement('tr');
                                    tr.className = "hover:bg-gray-100 dark:hover:bg-gray-700";

                                    tr.innerHTML = `
                                        <td class="py-1">${row.period || "N/A"}</td>
                                        <td>${row.subject || "N/A"}</td>
                                        <td>${row.teacher || "N/A"}</td>
                                        <td>${row.time || "N/A"}</td>
                                    `;

                                    timetableBody.appendChild(tr);
                                });
                            }
                        } catch (error) {
                            console.error("Failed to parse timetable widget data:", error);
                        }
                    };

                    reader.readAsText(blob);
                } catch (error) {
                    console.error("Failed to convert blob to JSON:", error);
                }
            } else if (event.data.data.url === "https://bromcomvle.com/Home/GetSubjectWidgetData") {
                try {
                    const byteCharacters = atob(event.data.data.body);
                    const byteNumbers = new Array(byteCharacters.length);

                    for (let i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                    }

                    const byteArray = new Uint8Array(byteNumbers);
                    const blob = new Blob([byteArray], { type: "application/json" });
                    const reader = new FileReader();

                    reader.onload = function(data) {
                        try {
                            const json = JSON.parse(data.target.result);
                            console.log(json);
                            const subjectsBody = document.getElementById('subjectsBody');

                            if (subjectsBody && Array.isArray(json)) {
                                subjectsBody.innerHTML = "";

                                json.forEach(row => {
                                    const tr = document.createElement('tr');
                                    tr.className = "hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer";

                                    tr.addEventListener('click', () => {
                                        window.location.href = `http://localhost:3000/subjects/${row.subjectId}`;
                                    });

                                    tr.innerHTML = `
                                        <td class="py-1">${row.subjectName || "N/A"}</td>
                                        <td>${row.className || "N/A"}</td>
                                        <td>${row.teacherName || "N/A"}</td>
                                    `;

                                    subjectsBody.appendChild(tr);
                                });
                            }
                        } catch (error) {
                            console.error("Failed to parse subject widget data:", error);
                        }
                    };

                    reader.readAsText(blob);
                } catch (error) {
                    console.error("Failed to convert blob to JSON:", error);
                }
            } else if (event.data.data.url === "https://bromcomvle.com/Home/GetAttendanceWidgetData") {
                try {
                    const byteCharacters = atob(event.data.data.body);
                    const byteNumbers = new Array(byteCharacters.length);

                    for (let i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                    }

                    const byteArray = new Uint8Array(byteNumbers);
                    const blob = new Blob([byteArray], { type: "application/json" });
                    const reader = new FileReader();

                    reader.onload = function(data) {
                        try {
                            const json = JSON.parse(data.target.result);
                            console.log(json);
                            const attendanceBody = document.getElementById('attendanceBody');
                            const attendanceAmount = document.getElementById('attendanceAmount');
                            let maxAttended = 0;
                            let attended = 0;

                            if (attendanceBody && Array.isArray(json.attendanceList)) {
                                attendanceBody.innerHTML = "";

                                json.attendanceList.forEach(row => {
                                    const tr = document.createElement('tr');
                                    tr.className = "hover:bg-gray-100 dark:hover:bg-gray-700";
                                    maxAttended++;

                                    const attendanceColor = (() => {
                                        switch (row.markDescription) {
                                            case json.presentAttendance:
                                                attended++;
                                                return json.presentAttendanceColor;
                                            case json.notTakenAttendance:
                                                return json.notTakenAttendanceColor;
                                            case json.unAuthorisedAbsentAttendance:
                                                return json.unAuthorisedAbsentAttendanceColor;
                                            case json.authorisedAbsentAttendance:
                                                return json.authorisedAbsentAttendanceColor;
                                            case json.lateAttendance:
                                                attended++;
                                                return json.lateAttendanceColor;
                                            default:
                                                return "#cccccc";
                                        }
                                    })();

                                    tr.innerHTML = `
                                        <td class="py-1">${row.periods || "N/A"}</td>
                                        <td>${row.classSubjects || "N/A"}</td>
                                        <td class="py-1">
                                            <span class="flex justify-center items-center h-full">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" class="w-7 h-7 mx-auto" fill="${attendanceColor}">
                                                    <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"/>
                                                </svg>
                                            </span>
                                        </td>
                                        <td>${row.startDate ? new Date(row.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "N/A"}</td>
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
                            }
                        } catch (error) {
                            console.error("Failed to parse subject widget data:", error);
                        }
                    };

                    reader.readAsText(blob);
                } catch (error) {
                    console.error("Failed to convert blob to JSON:", error);
                }
            }
        }
    });

    // all the boring net requests below..

    window.postMessage({
        type: "contactAPI",
        data: {
            url: "https://bromcomvle.com/AccountSettings/GetPersonPhoto",
            excludeDataHeaders: true,
            options: {
                headers: {
                    "accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
                    "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
                    "sec-ch-ua": "\"Chromium\";v=\"137\", \"Not/A)Brand\";v=\"24\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": "\"macOS\"",
                    "sec-fetch-dest": "image",
                    "sec-fetch-mode": "no-cors",
                    "sec-fetch-site": "same-origin"
                },
                referrer: "https://bromcomvle.com/Home/Dashboard",
                referrerPolicy: "strict-origin-when-cross-origin",
                method: "GET",
                mode: "cors",
                credentials: "include"
            }
        }
    }, "*");

    window.postMessage({
        type: "contactAPI",
        data: {
            url: "https://bromcomvle.com/AccountSettings/GetSchoolPhoto",
            excludeDataHeaders: true,
            options: {
                headers: {
                    "accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
                    "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
                    "sec-ch-ua": "\"Chromium\";v=\"137\", \"Not/A)Brand\";v=\"24\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": "\"macOS\"",
                    "sec-fetch-dest": "image",
                    "sec-fetch-mode": "no-cors",
                    "sec-fetch-site": "same-origin"
                },
                referrer: "https://bromcomvle.com/Home/Dashboard",
                referrerPolicy: "strict-origin-when-cross-origin",
                method: "GET",
                mode: "cors",
                credentials: "include"
            }
        }
    }, "*");

    window.postMessage({
        type: "contactAPI",
        data: {
            url: "https://bromcomvle.com/Home/GetTimetableWidgetData",
            excludeDataHeaders: true,
            options: {
                headers: {
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
                },
                referrer: "https://bromcomvle.com/Home/Dashboard",
                referrerPolicy: "strict-origin-when-cross-origin",
                method: "GET",
                mode: "cors",
                credentials: "include"
            }
        }
    }, "*");

    window.postMessage({
        type: "contactAPI",
        data: {
            url: "https://bromcomvle.com/Home/GetSubjectWidgetData",
            excludeDataHeaders: true,
            options: {
                headers: {
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
                },
                referrer: "https://bromcomvle.com/Home/Dashboard",
                referrerPolicy: "strict-origin-when-cross-origin",
                method: "GET",
                mode: "cors",
                credentials: "include"
            }
        }
    }, "*");

    window.postMessage({
        type: "contactAPI",
        data: {
            url: "https://bromcomvle.com/Home/GetAttendanceWidgetData",
            excludeDataHeaders: true,
            options: {
                headers: {
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
                },
                referrer: "https://bromcomvle.com/Home/Dashboard",
                referrerPolicy: "strict-origin-when-cross-origin",
                method: "GET",
                mode: "cors",
                credentials: "include"
            }
        }
    }, "*");
});