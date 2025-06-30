tailwind.config = {
    darkMode: 'class'
}

document.documentElement.classList.toggle('dark');

document.addEventListener('DOMContentLoaded', async function() {
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    if (window.Splitting) {
        Splitting();
    } else {
        while (!window.Splitting) {
            await sleep(50);
        }

        Splitting();
    }
});