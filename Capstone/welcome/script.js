document.getElementById("button").onclick = function () {
    window.location.href = "../../Capstone/signOrLog";
};

document.addEventListener('DOMContentLoaded', () => {
    const images = [
        '../fundraising-calendar.jpg',
        '../images.jpg',
        '../Calendar_Image.jpg'
    ];

    let currentImageIndex = 0;

    function swapBackgroundImage() {
        currentImageIndex = (currentImageIndex + 1) % images.length;
        document.body.style.backgroundImage = `url('${images[currentImageIndex]}')`;
    }

    setInterval(swapBackgroundImage, 5000);
});