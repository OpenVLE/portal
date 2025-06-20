document.addEventListener('DOMContentLoaded', async function() {
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    console.log("hi")

    if (window.Splitting) {
        Splitting();
    } else {
        while (!window.Splitting) {
            await sleep(50);
            console.log("sad")
        }

        Splitting();
    }
});