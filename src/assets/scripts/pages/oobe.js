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

function bromcomVLESSO(provider) {
    window.addEventListener("message", function(event) {
        if (event.data && event.data.type === "obtainSSOLinkCallback") {
            const ssoURL = event.data.data;
            this.location.href = ssoURL;
        }
    });

    window.postMessage({
        type: "obtainSSOURL",
        data: { provider: provider }
    }, "*");
}

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
                <img src="../assets/images/webStoreDark.png" alt="OpenVLE Logo" class="w-full max-w-xs h-16 object-contain rounded-xl dark:hidden"/>
                <img src="../assets/images/webStoreLight.png" alt="OpenVLE Logo" class="w-full max-w-xs h-16 object-contain rounded-xl hidden dark:block"/>
            </a>
        `;

        animateModalContent(installHTML);
        return;
    } else {
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

                            bromcomVLESSO("google");
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

                            bromcomVLESSO("microsoft");
                        }, microsoftSSOLogin);
                    });
                });
            });
        });
    }
});