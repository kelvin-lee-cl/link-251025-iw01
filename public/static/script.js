showTeacherArea();

let currentImageIndex = 0;
const images = [
    'highlight/1.png',
    'highlight/2.png',
    'highlight/3.jpeg',
    'highlight/4.png',
    'highlight/5.png',
    'highlight/6.png',
    'highlight/7.png',
    'highlight/9.jpg',
    'highlight/10.jpg',
    'highlight/11.jpg',
    'highlight/12.jpg',
    'highlight/13.jpg',
    'highlight/14.jpg'
];

function setImage(index) {
    currentImageIndex = index;
    document.getElementById('modalImage').src = images[currentImageIndex];
}



function changeImage(direction) {
    currentImageIndex += direction;
    if (currentImageIndex < 0) {
        currentImageIndex = images.length - 1; // Loop to last image
    } else if (currentImageIndex >= images.length) {
        currentImageIndex = 0; // Loop to first image
    }
    document.getElementById('modalImage').src = images[currentImageIndex];
}

const rows = document.querySelectorAll('.row.fade-in');

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible'); // Fade in
        } else {
            entry.target.classList.remove('visible'); // Fade out
        }
    });
}, { threshold: 0.1 }); // Adjust threshold as needed

rows.forEach(row => {
    observer.observe(row);
});

// Add event listener for keydown events
document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
        changeImage(-1); // Trigger changeImage for left arrow
    } else if (event.key === 'ArrowRight') {
        changeImage(1); // Trigger changeImage for right arrow
    }
});

document.addEventListener('DOMContentLoaded', function () {
    // Slides inline viewer logic
    const totalSlides = 26;
    let currentSlide = 1;
    const slideImage = document.getElementById('slideImage');
    const slideCounter = document.getElementById('slideCounter');
    const slidePrevBtn = document.getElementById('slidePrevBtn');
    const slideNextBtn = document.getElementById('slideNextBtn');

    function updateSlide() {
        if (slideImage && slideCounter) {
            slideImage.src = `images/slides/${currentSlide}.png`;
            slideCounter.textContent = `${currentSlide} / ${totalSlides}`;
        }
    }

    if (slidePrevBtn && slideNextBtn) {
        slidePrevBtn.addEventListener('click', function () {
            currentSlide = currentSlide === 1 ? totalSlides : currentSlide - 1;
            updateSlide();
        });
        slideNextBtn.addEventListener('click', function () {
            currentSlide = currentSlide === totalSlides ? 1 : currentSlide + 1;
            updateSlide();
        });
    }

    // Keyboard navigation for inline slides viewer
    document.addEventListener('keydown', function (event) {
        if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;
        if (slideImage) {
            if (event.key === 'ArrowLeft') {
                currentSlide = currentSlide === 1 ? totalSlides : currentSlide - 1;
                updateSlide();
            } else if (event.key === 'ArrowRight') {
                currentSlide = currentSlide === totalSlides ? 1 : currentSlide + 1;
                updateSlide();
            }
        }
    });

    // Initialize first slide
    updateSlide();
});

// Reset to first slide when modal opens
const slidesModal = document.getElementById('slidesModal');
if (slidesModal) {
    slidesModal.addEventListener('show.bs.modal', function () {
        currentSlide = 1;
        updateSlide();
    });
}

// Reverse mapping: passcode to user ID (1-20 with passcodes 001-020)
const passcodeToUser = {
    '001': '1', '002': '2', '003': '3', '004': '4', '005': '5',
    '006': '6', '007': '7', '008': '8', '009': '9', '010': '10',
    '011': '11', '012': '12', '013': '13', '014': '14', '015': '15',
    '016': '16', '017': '17', '018': '18', '019': '19', '020': '20'
};

document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const passcode = document.getElementById('passcode').value.toUpperCase();
            const userId = passcodeToUser[passcode];

            if (userId) {
                // Store the user ID in localStorage
                localStorage.setItem('currentUserId', userId);

                // Hide the login button
                const loginBtn = document.querySelector('[data-bs-target="#loginModal"]');
                loginBtn.style.display = 'none';

                // Show logout button
                const logoutBtn = document.getElementById('logoutBtn');
                console.log('Current userId:', userId);
                if (logoutBtn && userId) {
                    logoutBtn.style.display = 'block';
                    console.log('Showing logout button');
                }

                // Add welcome message in place of the button
                const welcomeMsg = document.createElement('p');
                welcomeMsg.className = 'mt-5';
                welcomeMsg.innerHTML = `Welcome ID ${userId}`;
                loginBtn.parentNode.appendChild(welcomeMsg);

                // Show the class presentation link
                const classPptLink = document.getElementById('classPptLink');
                if (classPptLink) {
                    classPptLink.classList.remove('d-none');
                }
                const imgGenLink = document.getElementById('imgGenLink');
                if (imgGenLink) {
                    imgGenLink.classList.remove('d-none');
                }
                const aiArtStudio = document.getElementById('aiArtStudio');
                if (aiArtStudio) {
                    aiArtStudio.classList.remove('d-none');
                }

                // Show teacher area
                showTeacherArea();
            } else {
                alert('Wrong Password！');
            }
        });
    }
});

// Check login status when page loads
document.addEventListener('DOMContentLoaded', function () {
    const currentUserId = localStorage.getItem('currentUserId');
    console.log('Stored userId:', currentUserId);
    if (currentUserId) {
        // User is logged in, hide login button and show welcome message
        const loginBtn = document.querySelector('[data-bs-target="#loginModal"]');
        if (loginBtn) {
            loginBtn.style.display = 'none';

            const welcomeMsg = document.createElement('p');
            welcomeMsg.className = 'mt-5';
            welcomeMsg.innerHTML = `User ID ${currentUserId}`;
            loginBtn.parentNode.appendChild(welcomeMsg);
        }

        // Show logout button
        const logoutBtn = document.getElementById('logoutBtn');
        const userIdDisplay = document.getElementById('userIdDisplay');
        if (logoutBtn && userIdDisplay) {
            userIdDisplay.classList.remove('d-none');
            userIdDisplay.textContent = `User ID: ${currentUserId} ${getEmojiForUserId(currentUserId)}`;
            logoutBtn.style.display = 'block';
            console.log('Showing logout button on page load');
        }

        // Show the class presentation link
        const classPptLink = document.getElementById('classPptLink');
        if (classPptLink) {
            classPptLink.classList.remove('d-none');
        }

        // Show the AI Art Studio link
        const imgGenLink = document.getElementById('imgGenLink');
        if (imgGenLink) {
            imgGenLink.classList.remove('d-none');
        }

        // Show AI tools link
        const aiArtStudio = document.getElementById('aiArtStudio');
        if (aiArtStudio) {
            aiArtStudio.classList.remove('d-none');
        }
    }
});

// Optional: Add a logout function
function logout() {
    localStorage.removeItem('currentUserId');
    location.reload()
    window.location.href = '../static/index.html';

    // Refresh the page
}

// Check if currentUserId is already declared
if (!window.currentUserId) {
    window.currentUserId = localStorage.getItem('currentUserId');
}

// After successful login and user ID verification
function showTeacherArea() {
    const currentUserId = localStorage.getItem('currentUserId');
    console.log("it is working!");
    if (currentUserId) {
        const teacherArea = document.getElementById('teacherArea');
        teacherArea.classList.remove('d-none'); // Remove the 'd-none' class
    }
}

// Array of kid-friendly, positive emojis
const kidFriendlyEmojis = [
    '🌟', '🌈', '🦄', '🐱', '🐶', '🦁', '🐼', '🐨', '🦊', '🦋',
    '🌸', '🌺', '🌻', '🌞', '⭐', '🌙', '☀️', '🌤️', '🌺', '🌷',
    '🍀', '🌱', '🌳', '🌴', '🌵', '🌿', '🍄', '🌼', '🌻', '🌹',
    '🎨', '🎭', '🎪', '🎯', '🎲'
];

// Function to get emoji based on user ID
function getEmojiForUserId(userId) {
    // Subtract 1 from userId since we want to start from 0
    const index = (userId - 1) % kidFriendlyEmojis.length;
    return kidFriendlyEmojis[index];
}

