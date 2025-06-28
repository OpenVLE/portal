function blobsInTheBig25IsCrazy(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = function(data) {
            try {
                const object = data.target.result;

                if (object.includes("<!DOCTYPE html>") || object.includes("<html>")) {
                    location.href = "/login";
                    return;
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

const imageHeaders = {
    "accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
    "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
    "sec-ch-ua": "\"Chromium\";v=\"137\", \"Not/A)Brand\";v=\"24\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"macOS\"",
    "sec-fetch-dest": "image",
    "sec-fetch-mode": "no-cors",
    "sec-fetch-site": "same-origin"
};

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

document.addEventListener('DOMContentLoaded', async function() {
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

    if (!serviceInstalled) return console.error("Service is not installed or not responding.");

    (async () => {
        await contactAPI("https://bromcomvle.com/AccountSettings/GetPersonPhoto", imageHeaders)
        .then(blob => {
            const placeholderAvatar = document.getElementById('placeholderAvatar');
            const avatarContainer = document.getElementById('avatarContainer');
            const imageURL = URL.createObjectURL(blob);

            if (placeholderAvatar) {
                const userAvatar = document.createElement('img');
                userAvatar.classList.add('w-12', 'h-12', 'rounded-full', 'border-2', 'border-gray-300', 'dark:border-gray-600', 'shadow');
                userAvatar.id = 'openVLEAvatar';
                userAvatar.src = imageURL;

                avatarContainer.appendChild(userAvatar);
                placeholderAvatar.remove();
            }
        }).catch(error => {
            console.error("Failed to apply user's pfp:", error);
        });
    })();

    (async () => {
        await contactAPI("https://bromcomvle.com/AccountSettings/GetSchoolPhoto", imageHeaders)
        .then(blob => {
            const placeholderLogo = document.getElementById('placeholderSchoolLogo');
            const schoolLogoContainer = document.getElementById('schoolLogoContainer');
            const imageURL = URL.createObjectURL(blob);

            if (placeholderLogo) {
                const schoolLogo = document.createElement('img');
                schoolLogo.classList.add('w-12', 'h-12', 'rounded-full', 'border-2', 'border-gray-300', 'dark:border-gray-600', 'shadow', 'flex', 'items-center', 'justify-center');
                schoolLogo.id = 'schoolLogo';
                schoolLogo.src = imageURL;

                schoolLogoContainer.prepend(schoolLogo);
                placeholderLogo.remove();
            }
        }).catch(error => {
            console.error("Failed to apply school logo:", error);
        });
    })();

    (async () => {
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
                        <td class="text-center">${row.time ? new Date(row.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "N/A"}</td>
                    `;
                    timetableBody.appendChild(tr);
                });
            } else if (json.length === 0) {
                timetableBody.innerHTML = `
                    <tr>
                        <td colspan='4' class='text-center py-2 text-gray-500 dark:text-gray-400'>
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
                        window.location.href = `http://localhost:3000/subjects/${row.subjectId}`;
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
                        <td colspan='4' class='text-center py-2 text-gray-500 dark:text-gray-400'>
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
        await contactAPI("https://bromcomvle.com/Home/GetAttendanceWidgetData", dataHeaders)
        .then(blob => blobsInTheBig25IsCrazy(blob))
        .then(json => {
            function setAttendance(percent) {
                const circle = document.getElementById('attendanceCircle');
                const radius = 24;
                const circumference = 2 * Math.PI * radius;
                const offset = circumference * (1 - percent / 100);
                circle.style.strokeDasharray = circumference;
                circle.style.strokeDashoffset = offset;
            }

            const attendanceBody = document.getElementById('attendanceBody');
            const attendanceAmount = document.getElementById('attendanceAmount');
            let maxAttended = 0;
            let attended = 0;

            if (attendanceBody && Array.isArray(json.attendanceList) && json.attendanceList.length > 0) {
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
                        <td class="text-center py-1">${row.periods || "N/A"}</td>
                        <td class="text-center">${row.classSubjects || "N/A"}</td>
                        <td class="text-center py-1">
                            <span>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" class="w-7 h-7 mx-auto" fill="${attendanceColor}">
                                    <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"/>
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
                        <td colspan='4' class='text-center py-2 text-gray-500 dark:text-gray-400'>
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

            setAttendance(Math.round((attended / maxAttended) * 100));
        }).catch(error => {
            console.error("Failed to parse attendance widget data:", error);
        });
    })();
});