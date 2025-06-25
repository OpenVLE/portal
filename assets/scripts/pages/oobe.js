function animateModalContent(html, afterRender) {
    const modalContent = document.getElementById("modalContent");
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
        const loginHTML = `
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

        animateModalContent(loginHTML, () => {
            const bromcomVLELogin = document.getElementById("bromcomVLELogin");
            bromcomVLELogin.addEventListener("click", () => {
                window.location.href = "https://vle.bromcom.com";
            });
        });
    }
});