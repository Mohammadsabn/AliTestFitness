// Data Array: Yahan aap apne products ki details daalenge
let products = [
    { id: 101, name: "Treadmill Running Belt", price: 4500, img: 'image/PRODUCT_IMAGE/sample_treadmill.jfif', hasDims: true, dimLabel: 'L x W (mm)' },
    { id: 102, name: "Motor Controller PCB (5HP)", price: 7800, img: 'image/PRODUCT_IMAGE/motor.jfif', hasDims: false, dimLabel: '' },
    { id: 103, name: "Incline Motor Actuator", price: 3200, img: 'image/PRODUCT_IMAGE/sample_treadmill.jfif', hasDims: false, dimLabel: '' },
    { id: 103, name: "Incline Motor Actuator", price: 3200, img: 'image/PRODUCT_IMAGE/sample_treadmill.jfif', hasDims: false, dimLabel: '' },

    // 🛑 Yahan aur products add karein 🛑
];

let cart = [];
const phoneNumber = "8897931335"; // 🛑 Apna WhatsApp/Call number set karein 🛑

// DOM Element References (All IDs are prefixed with 'product-')
const elements = {
    grid: document.getElementById('product-grid'),
    modal: document.getElementById('product-cart-modal'),
    cartList: document.getElementById('product-cart-items-list'),
    totalPriceSpan: document.getElementById('product-total-price'),
    totalItemsSpan: document.getElementById('product-total-items'),
    cartCountSpan: document.getElementById('product-cart-count'),
    openCartBtn: document.getElementById('product-open-cart'),
    closeCartBtn: document.getElementById('product-close-cart'),
    placeOrderBtn: document.getElementById('product-place-order-btn'),
    catalogSearchInput: document.getElementById('product-catalog-search')
};


// 1. Initial Product Rendering
function renderProducts(filteredProducts = products) {
    if (filteredProducts.length === 0) {
        elements.grid.innerHTML = '<p class="no-results">No products found matching your search.</p>';
        return;
    }

    elements.grid.innerHTML = filteredProducts.map(p => `
        <div class="product-card" data-id="${p.id}">
            <img src="${p.img}" alt="${p.name}" class="product-image">
            <h4 class="product-name">${p.name}</h4>
            <p class="product-price">Price: ₹ ${p.price.toFixed(2)}</p>
            ${p.hasDims ? `<p class="product-dim-note">Dimensions: ${p.dimLabel} required</p>` : ''}
            <button class="product-add-to-cart-btn" onclick="addToCart(${p.id})">Add to Quote</button>
        </div>
    `).join('');
}


// 2. Add to Cart Logic
window.addToCart = (productId) => {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ 
            ...product, 
            quantity: 1, 
            // Default dimensions for custom parts (L, W, H, Weight)
            dimensions: product.hasDims ? { L: 0, W: 0, H: 0, Weight: 0 } : null 
        });
    }
    updateCartDisplay();
    elements.modal.classList.add('product-modal-show');
};

// 3. Update Quantity and Dims (Global functions)
window.updateItemQuantity = (id, newQuantity) => {
    const item = cart.find(i => i.id === id);
    const qty = parseInt(newQuantity) || 1;
    if (item && qty > 0) {
        item.quantity = qty;
        updateCartDisplay();
    }
};

window.updateItemDims = (id, dimKey, value) => {
    const item = cart.find(i => i.id === id);
    if (item && item.dimensions) {
        item.dimensions[dimKey] = parseFloat(value) || 0;
        updateCartDisplay();
    }
};

window.removeItem = (id) => {
    cart = cart.filter(item => item.id !== id);
    updateCartDisplay();
};


// 4. Update Cart Display and Total Price
function updateCartDisplay() {
    let totalPrice = 0;
    let totalItems = 0;

    if (cart.length === 0) {
        elements.cartList.innerHTML = '<p style="text-align:center;">Your cart is empty. Please add spares.</p>';
    } else {
        elements.cartList.innerHTML = cart.map(item => {
            const itemTotal = item.quantity * item.price;
            totalPrice += itemTotal;
            totalItems += item.quantity;
            
            // Render Dimension Inputs
            let dimInputs = '';
            if (item.dimensions) {
                dimInputs = `
                    <div class="product-dim-inputs">
                        <label>L:</label><input type="number" value="${item.dimensions.L}" oninput="updateItemDims(${item.id}, 'L', this.value)">
                        <label>W:</label><input type="number" value="${item.dimensions.W}" oninput="updateItemDims(${item.id}, 'W', this.value)">
                        <label>Wt(kg):</label><input type="number" value="${item.dimensions.Weight}" oninput="updateItemDims(${item.id}, 'Weight', this.value)">
                    </div>
                `;
            }

            return `
                <div class="product-cart-item">
                    <div class="product-item-details">
                        <p><strong>${item.name}</strong> (₹ ${item.price.toFixed(2)})</p>
                        ${dimInputs}
                        <p class="product-item-price-total">Item Total: ₹ ${itemTotal.toFixed(2)}</p>
                    </div>
                    <div class="product-item-controls">
                        <input type="number" min="1" value="${item.quantity}" oninput="updateItemQuantity(${item.id}, this.value)">
                        <button onclick="removeItem(${item.id})" title="Remove Item">&times;</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    elements.totalPriceSpan.textContent = `₹ ${totalPrice.toFixed(2)}`;
    elements.totalItemsSpan.textContent = totalItems;
    elements.cartCountSpan.textContent = totalItems;
}


// 5. WhatsApp / Call Order Logic
function placeOrder() {
    if (cart.length === 0) {
        alert("Your cart is empty. Add products first.");
        return;
    }

    const action = prompt("How would you like to proceed?\n\n1. Send via WhatsApp (Recommended)\n2. Call directly");

    if (action === '1') {
        sendOrderViaWhatsApp();
    } else if (action === '2') {
        window.location.href = `tel:${phoneNumber}`; 
    } else {
        alert("Action cancelled.");
    }
}

function sendOrderViaWhatsApp() {
    let message = `Hello Ali Fitness Services,\n\n*I need a quote for the following spare parts:*\n\n`;
    let finalPrice = 0;
    
    cart.forEach((item, index) => {
        const itemTotal = item.quantity * item.price;
        finalPrice += itemTotal;
        
        let dimText = '';
        if (item.dimensions) {
            const dims = item.dimensions;
            const dimArray = [];
            if (dims.L > 0) dimArray.push(`L: ${dims.L}`);
            if (dims.W > 0) dimArray.push(`W: ${dims.W}`);
            if (dims.Weight > 0) dimArray.push(`Wt: ${dims.Weight}kg`);

            if (dimArray.length > 0) {
                 dimText = ` [${dimArray.join(', ')}]`;
            }
        }

        message += `${index + 1}. *${item.name}*\n   - Qty: ${item.quantity}${dimText}\n   - Est. Total: ₹ ${itemTotal.toFixed(2)}\n\n`;
    });

    message += `--- Total Est. Price: ₹ ${finalPrice.toFixed(2)} ---\n\n*Please confirm stock and final price.* Thank you!`;

    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}


// 6. Search Functionality
elements.catalogSearchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const filtered = products.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.id.toString().includes(query)
    );
    renderProducts(filtered);
});


// 7. Initialisation and Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    updateCartDisplay();

    // Modal Events
    elements.openCartBtn.onclick = () => elements.modal.classList.add('product-modal-show');
    elements.closeCartBtn.onclick = () => elements.modal.classList.remove('product-modal-show');
    elements.placeOrderBtn.onclick = placeOrder;
    
    // Close modal on outside click
    window.onclick = (event) => {
        if (event.target === elements.modal) {
            elements.modal.classList.remove('product-modal-show');
        }
    };
});