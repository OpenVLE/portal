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

function bromcomVLESSO(provider, bromcom) {
    let ssoURL = "";

    if (provider === "google") {
        const googleElement = bromcom.getElementById("btnLinkGoogleAccount");
        ssoURL = googleElement ? googleElement.getAttribute("href") : "";
    } else if (provider === "microsoft") {
        const microsoftElement = bromcom.getElementById("btnLinkMicrosoftAccount");
        ssoURL = microsoftElement ? microsoftElement.getAttribute("href") : "";
    }

    window.addEventListener("message", function(event) {
        if (event.data && event.data.type === "setOAuthCallback") {
            location.href = ssoURL;
        }
    });

    window.postMessage({ type: "setOAuthRedirect" }, "*");
}

function animateModalContent(html, afterRender, modalContent = document.getElementById("modalContent")) {
    modalContent.classList.remove("opacity-100");
    modalContent.classList.add("opacity-0", "transition-opacity", "duration-500");

    setTimeout(() => {
        modalContent.innerHTML = html;
        if (typeof afterRender === "function") afterRender();

        setTimeout(() => {
            modalContent.classList.remove("opacity-0");
            modalContent.classList.add("opacity-100");
        }, 10);
    }, 250);
}

function fadeOutModal(modal = document.getElementById("loadingModal"), afterRender) {
    modal.classList.remove("opacity-100");
    modal.classList.add("opacity-0", "transition-opacity", "duration-500");

    setTimeout(() => {
        if (typeof afterRender === "function") afterRender();
    }, 1000);
}

function checkSidebarScrollbar() {
    const sideBar = document.getElementById("sideBar");
    const hasVerticalScrollbar = sideBar.scrollHeight > sideBar.clientHeight;

    if (hasVerticalScrollbar) {
        sideBar.classList.replace("w-20", "w-24");
    } else {
        sideBar.classList.replace("w-24", "w-20");
    }
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

    if (!serviceInstalled) {
        const installHTML = `
            <span class="w-16 h-16 rounded-full border-2 border-gray-300 dark:border-gray-600 shadow flex items-center justify-center bg-gray-200 dark:bg-gray-700 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" class="w-9 h-9 text-gray-400" fill="currentColor">
                    <path d="M144 480C64.5 480 0 415.5 0 336c0-62.8 40.2-116.2 96.2-135.9c-.1-2.7-.2-5.4-.2-8.1c0-88.4 71.6-160 160-160c59.3 0 111 32.2 138.7 80.2C409.9 102 428.3 96 448 96c53 0 96 43 96 96c0 12.2-2.3 23.8-6.4 34.6C596 238.4 640 290.1 640 352c0 70.7-57.3 128-128 128l-368 0zm79-167l80 80c9.4 9.4 24.6 9.4 33.9 0l80-80c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-39 39L344 184c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 134.1-39-39c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9z"/>
                </svg>
            </span>

            <h2 class="text-lg mb-2 font-semibold text-gray-900 dark:text-gray-100">Install OpenVLE Service</h2>
            <p class="text-sm mb-6 text-gray-500 dark:text-gray-400">To use OpenVLE, you are required to add the OpenVLE Service to your browser.</p>

            <a class="w-full max-w-xs h-16 object-contain rounded-xl" href="https://chromewebstore.google.com/detail/mdbgncibfiakpehpdoikemajhfopagjc/preview?hl=en-GB&authuser=0" target="_blank" rel="noopener noreferrer" class="flex items-center justify-center w-40 h-10 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-300">
                <img src="assets/images/webStoreDark.png" alt="OpenVLE Logo" class="w-full max-w-xs h-16 object-contain rounded-xl dark:hidden"/>
                <img src="assets/images/webStoreLight.png" alt="OpenVLE Logo" class="w-full max-w-xs h-16 object-contain rounded-xl hidden dark:block"/>
            </a>
        `;

        animateModalContent(installHTML);
        return;
    } else {
        const title = document.getElementById("modalTitle");
        title.textContent = "Loading...";

        const userData = await new Promise(async (resolve, reject) => {
            await contactAPI("https://bromcomvle.com/Home/Dashboard", dataHeaders)
            .then(async blob => {
                const decodedHTML = (await blob.text()).trim();
                const parser = new DOMParser();
                return parser.parseFromString(decodedHTML, "text/html");
            })
            .then(bromcomDashboard => {
                const loginModal = bromcomDashboard.getElementById('sign-wrapper');

                if (loginModal) {
                    resolve({
                        loggedIn: false,
                        bromcomDashboard: bromcomDashboard
                    });
                } else {
                    const userName = bromcomDashboard.getElementById('UsernameLabel').textContent;
                    const schoolName = bromcomDashboard.getElementById('SchoolNameLabel').textContent;

                    resolve({
                        loggedIn: true,
                        userName: userName,
                        schoolName: schoolName
                    });
                }
            })
            .catch(error => {
                console.error("Failed to fetch user data:", error);
                reject(error);
            });
        });

        if (!userData.loggedIn) {
            const bromcomDashboard = userData.bromcomDashboard;

            const vleHTML = `
                <span class="w-16 h-16 rounded-full border-2 border-gray-300 dark:border-gray-600 shadow flex items-center justify-center bg-gray-200 dark:bg-gray-700 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" class="w-7 h-7 text-gray-400" fill="currentColor">
                        <path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512l388.6 0c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304l-91.4 0z"/>
                    </svg>
                </span>

                <h2 class="text-lg mb-2 font-semibold text-gray-900 dark:text-gray-100">Login to OpenVLE</h2>
                <p class="text-sm mb-6 text-gray-500 dark:text-gray-400">Welcome to OpenVLE! To get started, select your current VLE provider.</p>

                <button id="bromcomVLELogin" class="flex items-center justify-center w-full max-w-xs h-12 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-200 mb-4">
                    <img src="https://bromcom.com/app/themes/bromcom/assets/images/logo_mobile.svg" alt="BromcomVLE" class="w-6 h-6 mr-3">
                    <span class="text-gray-700 dark:text-gray-200 font-medium">Login with Bromcom</span>
                </button>
            `;

            animateModalContent(vleHTML, () => {
                const bromcomVLELogin = document.getElementById("bromcomVLELogin");

                bromcomVLELogin.addEventListener("click", () => {
                    const ssoHTML = `
                        <span class="w-16 h-16 rounded-full border-2 border-gray-300 dark:border-gray-600 shadow flex items-center justify-center bg-gray-200 dark:bg-gray-700 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" class="w-7 h-7 text-gray-400" fill="currentColor">
                                <path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512l388.6 0c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304l-91.4 0z"/>
                            </svg>
                        </span>

                        <h2 class="text-lg mb-2 font-semibold text-gray-900 dark:text-gray-100">Login to OpenVLE</h2>
                        <p class="text-sm mb-6 text-gray-500 dark:text-gray-400">Welome to OpenVLE! Next, select your SSO (Single Sign-On) provider.</p>

                        <button id="googleSSOLogin" class="flex items-center justify-center w-full max-w-xs h-12 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-200 mb-4">
                            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" class="w-6 h-6 mr-3">
                            <span class="text-gray-700 dark:text-gray-200 font-medium">Sign in with Google</span>
                        </button>
                        
                        <button id="microsoftSSOLogin" class="flex items-center justify-center w-full max-w-xs h-12 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-200 mb-4">
                            <img src="https://learn.microsoft.com/en-us/entra/identity-platform/media/howto-add-branding-in-apps/ms-symbollockup_mssymbol_19.svg" alt="Microsoft" class="w-6 h-6 mr-3 bg-white rounded">
                            <span class="text-gray-700 dark:text-gray-200 font-medium">Sign in with Microsoft</span>
                        </button>
                    `;

                    animateModalContent(ssoHTML, () => {
                        const googleSSOLogin = document.getElementById("googleSSOLogin");
                        const microsoftSSOLogin = document.getElementById("microsoftSSOLogin");
                        
                        googleSSOLogin.addEventListener("click", () => {
                            const loadingButtonHTML = `
                                <div class="text-center">
                                    <div role="status">
                                        <svg aria-hidden="true" class="inline w-6 h-6 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                                            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                                        </svg>
                                    </div>
                                </div>
                            `;

                            animateModalContent(loadingButtonHTML, () => {
                                googleSSOLogin.disabled = true;
                                microsoftSSOLogin.disabled = true;
                                googleSSOLogin.classList.add("cursor-not-allowed");
                                microsoftSSOLogin.classList.add("cursor-not-allowed");
                                googleSSOLogin.classList.remove("hover:bg-gray-50", "dark:hover:bg-gray-700");

                                bromcomVLESSO("google", bromcomDashboard);
                            }, googleSSOLogin);
                        });

                        microsoftSSOLogin.addEventListener("click", () => {
                            const loadingButtonHTML = `
                                <div class="text-center">
                                    <div role="status">
                                        <svg aria-hidden="true" class="inline w-6 h-6 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                                            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                                        </svg>
                                    </div>
                                </div>
                            `;

                            animateModalContent(loadingButtonHTML, () => {
                                googleSSOLogin.disabled = true;
                                microsoftSSOLogin.disabled = true;
                                googleSSOLogin.classList.add("cursor-not-allowed");
                                microsoftSSOLogin.classList.add("cursor-not-allowed");
                                microsoftSSOLogin.classList.remove("hover:bg-gray-50", "dark:hover:bg-gray-700");

                                bromcomVLESSO("microsoft", bromcomDashboard);
                            }, microsoftSSOLogin);
                        });
                    });
                });
            });
        } else {
            const modal = document.getElementById("loadingModal");
            const userNameElement = document.getElementById("userName");
            const schoolNameElement = document.getElementById("schoolName");

            userNameElement.textContent = userData.userName;
            schoolNameElement.textContent = userData.schoolName;
            
            (async () => {
                function sleep(ms) {
                    return new Promise(resolve => setTimeout(resolve, ms));
                }

                if (window.Splitting) {
                    userNameElement.classList.remove("text-gray-500", "dark:text-gray-600");
                    userNameElement.setAttribute("data-splitting", "");
                    userNameElement.classList.add("text-rainbow");
                    Splitting();
                } else {
                    while (!window.Splitting) {
                        await sleep(50);
                    }

                    userNameElement.classList.remove("text-gray-500", "dark:text-gray-600");
                    userNameElement.setAttribute("data-splitting", "");
                    userNameElement.classList.add("text-rainbow");
                    Splitting();
                }
            })();

            fadeOutModal(modal, () => {
                modal.remove();
            });
        }

        (async () => {
            if (!userData.loggedIn) return;

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
            if (!userData.loggedIn) return;

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
                            <td class="text-center">${row.time ? new Date(row.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "N/A"}</td>
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
    }
});

document.addEventListener("DOMContentLoaded", function() {
    const sideBar = document.getElementById("sideBar");
    checkSidebarScrollbar();

    const observer = new MutationObserver(checkSidebarScrollbar);
    observer.observe(sideBar, { childList: true, subtree: true });
    window.addEventListener("resize", checkSidebarScrollbar);
});