/**
 * Product Catalog Logic: Handles Cart operations (Add, Quantity, Delete),
 * Search, and the final order placement via WhatsApp/Call.
 */

// --- CONFIGURATION ---
// IMPORTANT: WhatsApp requires the number in international format (e.g., 91xxxxxxxxxx) without '+' or leading zeros.
// Call dialing typically uses the '+' prefix.
const CONTACT_NUMBER = "918879731335"; // Your WhatsApp/Call number updated with country code 91

// Data Array: Using your provided data structure
let productsData = [
    { id: 101, name: "Treadmill Running Belt", price: 4500, img: 'image/PRODUCT_IMAGE/sample_treadmill.jfif', hasDims: true, dimLabel: 'L x W (mm)' },
    { id: 102, name: "Motor Controller PCB (5HP)", price: 7800, img: 'image/PRODUCT_IMAGE/motor.jfif', hasDims: false, dimLabel: '' },
    { id: 103, name: "Incline Motor Actuator", price: 3200, img: 'image/PRODUCT_IMAGE/sample_treadmill.jfif', hasDims: false, dimLabel: '' },
    { id: 104, name: "Hydraulic Tension Spring", price: 1500, img: 'image/PRODUCT_IMAGE/sample_spring.jfif', hasDims: true, dimLabel: 'Length (mm)' }, 
];

let cartItems = [];

// DOM Element References (All IDs are prefixed with 'product-')
const elements = {
    grid: null,
    modal: null,
    cartList: null,
    totalPriceSpan: null,
    totalItemsSpan: null,
    cartCountSpan: null,
    openCartBtn: null,
    closeCartBtn: null,
    whatsappBtn: null,
    callBtn: null,
    catalogSearchInput: null
};

// --- UTILITY FUNCTIONS ---

/**
 * Price ko Indian Rupee format mein change karta hai.
 * @param {number} amount
 * @returns {string} Formatted price string.
 */
function formatPrice(amount) {
    if (amount === null || typeof amount === 'undefined') {
        return '₹ 0.00';
    }
    // Price ko fixed 2 decimal places tak rakhte hain
    return `₹ ${amount.toFixed(2)}`;
}

// --- CORE CART LOGIC ---

/**
 * Item ko Cart mein add karta hai.
 * @param {number} productId
 */
function addToCart(productId) {
    const product = productsData.find(p => p.id === productId);

    if (!product) return;

    const existingItem = cartItems.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cartItems.push({ 
            ...product, 
            quantity: 1,
            // Default dimensions for custom parts (L, W, Weight)
            dimensions: product.hasDims ? { L: 0, W: 0, Weight: 0 } : null 
        });
    }

    updateCartDisplay();
}

/**
 * Item ki Quantity ko update karta hai.
 * @param {number} productId
 * @param {number} change (+1 or -1)
 */
function updateQuantity(productId, change) {
    const item = cartItems.find(item => item.id === productId);
    if (!item) return;

    item.quantity += change;

    if (item.quantity <= 0) {
        // Agar quantity 0 ya usse kam ho gayi, toh item ko delete kar do
        removeItem(productId);
    } else {
        renderCart();
        updateCartDisplay();
    }
}

/**
 * Item ko Cart se delete karta hai.
 * @param {number} productId
 */
function removeItem(productId) {
    const initialLength = cartItems.length;
    cartItems = cartItems.filter(item => item.id !== productId);

    if (cartItems.length < initialLength) {
        renderCart();
        updateCartDisplay();
    }
}

/**
 * Cart ke items ko calculate karta hai aur total price nikalta hai.
 */
function calculateCartSummary() {
    let totalItems = 0;
    let totalPrice = 0;

    cartItems.forEach(item => {
        totalItems += item.quantity;
        // Estimate price calculation
        totalPrice += item.price * item.quantity; 
    });

    return { totalItems, totalPrice };
}

// --- RENDERING AND UI UPDATES ---

/**
 * Cart modal ke andar ki list ko render karta hai.
 */
function renderCart() {
    const summary = calculateCartSummary();

    // Agar cart khali hai
    if (cartItems.length === 0) {
        elements.cartList.innerHTML = '<p style="text-align: center; color: #aaa; margin-top: 30px;">Aapki Quotation Cart Khali Hai. Kuch Parts Add Karein!</p>';
        if (elements.whatsappBtn) elements.whatsappBtn.disabled = true;
        if (elements.callBtn) elements.callBtn.disabled = true;
    } else {
        elements.cartList.innerHTML = cartItems.map(item => {
            const itemTotal = item.quantity * item.price;
            
            // Render Dimension Inputs only if hasDims is true
            let dimInputs = '';
            if (item.dimensions) {
                const dims = item.dimensions;
                dimInputs = `
                    <div class="product-dim-inputs">
                        <label>L:</label><input type="number" min="0" value="${dims.L}" data-dim-key="L" data-id="${item.id}" class="dim-input">
                        <label>W:</label><input type="number" min="0" value="${dims.W}" data-dim-key="W" data-id="${item.id}" class="dim-input">
                        <label>Wt(kg):</label><input type="number" min="0" value="${dims.Weight}" data-dim-key="Weight" data-id="${item.id}" class="dim-input">
                    </div>
                `;
            }

            return `
                <div class="product-cart-item" data-id="${item.id}">
                    <div class="product-item-details">
                        <span class="product-item-title">${item.name} (ID: ${item.id})</span>
                        <span class="product-item-dimensions">${item.dimLabel || 'No specific dimension needed'}</span>
                        ${dimInputs}
                    </div>
                    
                    <div class="product-item-quantity">
                        <button class="quantity-minus" data-id="${item.id}">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-plus" data-id="${item.id}">+</button>
                    </div>
                    
                    <!-- Total price for the specific item -->
                    <div class="product-item-price">${formatPrice(itemTotal)}</div>

                    <!-- Remove button -->
                    <button class="product-item-remove" data-id="${item.id}"><i class="fas fa-trash-alt"></i></button>
                </div>
            `;
        }).join('');
        
        if (elements.whatsappBtn) elements.whatsappBtn.disabled = false;
        if (elements.callBtn) elements.callBtn.disabled = false;
    }

    // Summary update
    elements.totalItemsSpan.textContent = summary.totalItems;
    elements.totalPriceSpan.textContent = formatPrice(summary.totalPrice);
}

/**
 * Floating cart count ko update karta hai.
 */
function updateCartDisplay() {
    const summary = calculateCartSummary();
    elements.cartCountSpan.textContent = summary.totalItems;
    
    // Total price bhi update ho jayega jab cart open ho
    if (elements.totalPriceSpan) {
        elements.totalPriceSpan.textContent = formatPrice(summary.totalPrice);
    }
}

/**
 * Product grid ko render karta hai.
 * @param {Array<Object>} products List of products to display.
 */
function renderProductGrid(products) {
    if (products.length === 0) {
        elements.grid.innerHTML = '<p class="no-results">No products found matching your search.</p>';
        return;
    }
    
    elements.grid.innerHTML = products.map(product => `
        <div class="product-card">
            <img src="${product.img}" alt="${product.name}" class="product-image" onerror="this.onerror=null;this.src='https://placehold.co/400x300/e5e7eb/333?text=Image+Not+Found'">
            <h2 class="product-title">${product.name}</h2>
            <p class="product-id">Part ID: ${product.id}</p>
            <p class="product-dimensions">${product.dimLabel ? `Requires: ${product.dimLabel}` : 'Standard part'}</p>
            <p class="product-price">${formatPrice(product.price)}</p>
            <!-- Use class 'add-to-cart-btn' for event delegation -->
            <button class="add-to-cart-btn" data-id="${product.id}">Add to Quote</button>
        </div>
    `).join('');
}


// --- ORDER ACTION HANDLERS (Direct Call/WhatsApp) ---

/**
 * WhatsApp order message generate karta hai aur link par redirect karta hai.
 */
function placeOrderWhatsApp() {
    if (cartItems.length === 0) {
        return; 
    }
    
    let message = `Hello Ali Fitness Services,\n\n*I need a quote for the following spare parts:*\n\n`;
    let finalPrice = 0;
    
    cartItems.forEach((item, index) => {
        const itemTotal = item.quantity * item.price;
        finalPrice += itemTotal;
        
        let dimText = '';
        if (item.dimensions) {
            const dims = item.dimensions;
            const dimArray = [];
            // Only include dimensions if they are greater than 0
            if (dims.L > 0) dimArray.push(`L: ${dims.L}`);
            if (dims.W > 0) dimArray.push(`W: ${dims.W}`);
            if (dims.Weight > 0) dimArray.push(`Wt: ${dims.Weight}kg`);

            if (dimArray.length > 0) {
                dimText = ` [Dims: ${dimArray.join(', ')}]`;
            }
        }

        message += `${index + 1}. *${item.name}* (ID: ${item.id})\n  - Qty: ${item.quantity}${dimText}\n  - Est. Total: ${formatPrice(itemTotal)}\n\n`;
    });

    message += `--- Total Estimated Price: ${formatPrice(finalPrice)} ---\n\n*Please confirm stock and final price.* Thank you!`;

    // WhatsApp URL uses the international formatted CONTACT_NUMBER (e.g., 91xxxxxxxxxx)
    const whatsappUrl = `https://wa.me/${CONTACT_NUMBER}?text=${encodeURIComponent(message)}`;
    window.location.href = whatsappUrl;
}

/**
 * Direct Call shuru karta hai.
 */
function placeOrderCall() {
    // Call link should use the '+' prefix for universal mobile dialing (e.g., tel:+918897931335)
    window.location.href = `tel:+${CONTACT_NUMBER}`; 
}


// --- GLOBAL EVENT LISTENERS & INITIALIZATION ---

function setupGlobalListeners() {
    // 1. Add to Cart Button Logic (Using Delegation)
    elements.grid.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart-btn')) {
            const id = parseInt(e.target.dataset.id);
            addToCart(id);
        }
    });

    // 2. Cart Modal Controls (Quantity, Remove, Dimensions)
    elements.cartList.addEventListener('click', (e) => {
        const id = parseInt(e.target.dataset.id);

        // Quantity Plus/Minus
        if (e.target.classList.contains('quantity-plus')) {
            updateQuantity(id, 1);
        } else if (e.target.classList.contains('quantity-minus')) {
            updateQuantity(id, -1);
        } 
        
        // Remove Item
        else if (e.target.closest('.product-item-remove')) {
            const removeBtn = e.target.closest('.product-item-remove');
            removeItem(parseInt(removeBtn.dataset.id));
        }
    });
    
    // Dimension Input Handling (Using Delegation)
    elements.cartList.addEventListener('input', (e) => {
        if (e.target.classList.contains('dim-input')) {
            const id = parseInt(e.target.dataset.id);
            const dimKey = e.target.dataset.dimKey;
            // Value ko float mein parse karte hain, agar invalid ho toh 0
            const value = parseFloat(e.target.value) || 0; 
            
            const item = cartItems.find(i => i.id === id);
            if (item && item.dimensions) {
                // Dimension ko data model (cartItems) mein update karte hain
                item.dimensions[dimKey] = value;
                
                // SIRF Summary update karte hain, poora cart re-render NAHI karte
                updateCartDisplay(); 
            }
        }
    });
    
    // 3. Open/Close Modal Logic
    elements.openCartBtn.addEventListener('click', () => {
        renderCart(); 
        elements.modal.style.display = 'block'; // Inline style for simple show/hide
    });
    
    elements.closeCartBtn.addEventListener('click', () => {
        elements.modal.style.display = 'none';
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === elements.modal) {
            elements.modal.style.display = 'none';
        }
    });

    // 4. Order Buttons Logic
    elements.whatsappBtn.addEventListener('click', placeOrderWhatsApp);
    elements.callBtn.addEventListener('click', placeOrderCall);
    
    // 5. Search Logic
    elements.catalogSearchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filteredProducts = productsData.filter(p => 
            p.name.toLowerCase().includes(query) || 
            p.id.toString().includes(query)
        );
        renderProductGrid(filteredProducts);
    });
}

function initializeElements() {
    elements.grid = document.getElementById('product-grid');
    elements.modal = document.getElementById('product-cart-modal');
    elements.cartList = document.getElementById('product-cart-items-list');
    elements.totalPriceSpan = document.getElementById('product-total-price');
    elements.totalItemsSpan = document.getElementById('product-total-items');
    elements.cartCountSpan = document.getElementById('product-cart-count');
    elements.openCartBtn = document.getElementById('product-open-cart');
    elements.closeCartBtn = document.getElementById('product-close-cart');
    
    // References to the new buttons
    elements.whatsappBtn = document.getElementById('product-place-whatsapp-btn');
    elements.callBtn = document.getElementById('product-place-call-btn');
    
    elements.catalogSearchInput = document.getElementById('product-catalog-search');
}

window.onload = function() {
    initializeElements();
    renderProductGrid(productsData);
    setupGlobalListeners();
    updateCartDisplay();
};
