// --- Data Structures (Arrays & Objects) ---
let wishlist = [];

// --- Initialization on Page Load ---
document.addEventListener("DOMContentLoaded", () => {
    loadWishlistFromStorage();
    setupEventListeners();
    prefillFormFromStorage();
    initWishlistAutoFill();
});

// --- Event Listeners Setup ---
function setupEventListeners() {
    // Interactive feature: Favorite buttons
    const favoriteButtons = document.querySelectorAll(".favorite-btn");
    favoriteButtons.forEach(button => {
        button.addEventListener("click", handleFavoriteClick);
    });

    // Form submission validation
    const orderForm = document.getElementById('order-form');
    if (orderForm) {
        orderForm.addEventListener('submit', handleFormSubmit);
    }

    // Live storage input saving as user types
    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    if (nameInput) nameInput.addEventListener("input", saveDraftInput);
    if (emailInput) emailInput.addEventListener("input", saveDraftInput);
}

// --- Interactive Feature Logic: Wishlist Management ---
function handleFavoriteClick(event) {
    const card = event.target.closest(".product-card");
    if (!card) return;
    
    const productId = card.getAttribute("data-id");
    const productName = card.getAttribute("data-name");

    const itemIndex = wishlist.findIndex(item => item.id === productId);

    if (itemIndex > -1) {
        wishlist.splice(itemIndex, 1);
        event.target.classList.remove("favorited");
        event.target.textContent = "Add to Wishlist";
    } else {
        wishlist.push({ id: productId, name: productName });
        event.target.classList.add("favorited");
        event.target.textContent = "Saved in Wishlist ✓";
    }

    saveWishlistToStorage();
    renderWishlist();
}

function renderWishlist() {
    const wishlistContainer = document.getElementById("wishlist-items");
    const wishlistCount = document.getElementById("wishlist-count");
    
    if (!wishlistContainer || !wishlistCount) return;

    wishlistContainer.innerHTML = "";
    wishlistCount.textContent = wishlist.length;

    if (wishlist.length === 0) {
        wishlistContainer.innerHTML = "<li>No favorites saved yet.</li>";
        return;
    }

    wishlist.forEach(item => {
        const li = document.createElement("li");
        li.textContent = item.name;
        wishlistContainer.appendChild(li);
    });
}

// --- Browser Storage Functions (`localStorage`) ---
function saveWishlistToStorage() {
    localStorage.setItem("bakeryWishlist", JSON.stringify(wishlist));
}

function loadWishlistFromStorage() {
    const storedWishlist = localStorage.getItem("bakeryWishlist");
    if (storedWishlist) {
        wishlist = JSON.parse(storedWishlist);
        
        wishlist.forEach(item => {
            const card = document.querySelector(`.product-card[data-id="${item.id}"]`);
            if (card) {
                const btn = card.querySelector(".favorite-btn");
                if (btn) {
                    btn.classList.add("favorited");
                    btn.textContent = "Saved in Wishlist ✓";
                }
            }
        });
        renderWishlist();
    }
}

function saveDraftInput(event) {
    const fieldId = event.target.id;
    localStorage.setItem(`draft_${fieldId}`, event.target.value);
}

function prefillFormFromStorage() {
    const savedName = localStorage.getItem("draft_name");
    const savedEmail = localStorage.getItem("draft_email");

    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");

    if (savedName && nameInput) nameInput.value = savedName;
    if (savedEmail && emailInput) emailInput.value = savedEmail;
}

// --- Form Validation Logic ---
function handleFormSubmit(event) {
    event.preventDefault(); // Prevents page reload and stops 405 error!

    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    
    let isValid = true;

    if (nameInput) {
        if (nameInput.value.trim() === "") {
            showError("name-error", "Name is required.", nameInput);
            isValid = false;
        } else {
            clearError("name-error", nameInput);
        }
    }

    if (emailInput) {
        const emailValue = emailInput.value.trim();
        if (emailValue === "") {
            showError("email-error", "Email address is required.", emailInput);
            isValid = false;
        } else if (!emailValue.includes("@") || !emailValue.includes(".")) {
            showError("email-error", "Please enter a valid email address.", emailInput);
            isValid = false;
        } else {
            clearError("email-error", emailInput);
        }
    }

    const successMsg = document.getElementById("form-success");
    if (isValid && successMsg) {
        successMsg.textContent = "Thank you! Your custom order inquiry has been validated successfully.";
        localStorage.removeItem("draft_name");
        localStorage.removeItem("draft_email");
    } else if (successMsg) {
        successMsg.textContent = "";
    }
}

function showError(errorElementId, message, inputElement) {
    const errorEl = document.getElementById(errorElementId);
    if (errorEl) errorEl.textContent = message;
    if (inputElement) inputElement.classList.add("error");
}

function clearError(errorElementId, inputElement) {
    const errorEl = document.getElementById(errorElementId);
    if (errorEl) errorEl.textContent = "";
    if (inputElement) inputElement.classList.remove("error");
}

// Automatically fill item-details on contact.html if items are in the wishlist
function initWishlistAutoFill() {
    const itemDetailsTextarea = document.getElementById('item-details');
    if (itemDetailsTextarea) {
        const savedWishlist = JSON.parse(localStorage.getItem('bakeryWishlist')) || [];
        if (savedWishlist.length > 0 && !itemDetailsTextarea.value) {
            const itemNames = savedWishlist.map(item => item.name).join(', ');
            itemDetailsTextarea.value = `Pre-order items from my wishlist: ${itemNames}`;
        }
    }
}