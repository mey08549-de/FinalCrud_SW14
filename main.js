document.addEventListener("DOMContentLoaded", () => {

    // ===================================
    // 1. NAVBAR SCROLL EFFECT (throttled)
    // ===================================
    const nav = document.querySelector(".navigation-wrap");
    let scrollTimeout;
    const applyScrollClass = () => {
        if (!nav) return;
        if (window.scrollY > 20) nav.classList.add("scroll-on");
        else nav.classList.remove("scroll-on");
    };
    window.addEventListener("scroll", () => {
        if (!scrollTimeout) {
            scrollTimeout = setTimeout(() => {
                applyScrollClass();
                scrollTimeout = null;
            }, 50); // throttle to 50ms
        }
    });
    applyScrollClass();

    // ===================================
    // 2. COUNTER FUNCTIONALITY (smooth)
    // ===================================
    function counter(elementId, end, duration) {
        const el = document.getElementById(elementId);
        if (!el) return;
        let start = 0;
        const stepTime = Math.max(duration / end, 1);
        const step = () => {
            start++;
            el.textContent = start;
            if (start < end) requestAnimationFrame(() => setTimeout(step, stepTime));
        };
        step();
    }

    const counterSection = document.getElementById("counter");
    let counterStarted = false;

    function isInViewport(el) {
        if (!el) return false;
        const rect = el.getBoundingClientRect();
        return rect.top < window.innerHeight && rect.bottom >= 0;
    }

    const startCounters = () => {
        if (!counterStarted && isInViewport(counterSection)) {
            counterStarted = true;
            counter("count1", 300, 2000);
            counter("count2", 1287, 2000);
            counter("count3", 1000, 2000);
            counter("count4", 1500, 2000);
            window.removeEventListener("scroll", startCounters);
        }
    };
    window.addEventListener("scroll", startCounters);
    startCounters();

    // ===================================
    // 3. PHONE COUNTRY CODE POPULATION
    // (Assuming countryCodes is defined elsewhere or removed if not needed for index.html)
    // ===================================

    const countryCodeSelect = document.getElementById('countryCode');
    if (countryCodeSelect) {
        // Since countryCodes array is not provided, this block remains for structure
        // If you define countryCodes array, the logic below will run.
        /*
        countryCodes.forEach(country => {
            const option = document.createElement('option');
            option.value = country.code;
            option.textContent = `${country.flag} ${country.name} (${country.code})`;
            countryCodeSelect.appendChild(option);
        });
        */

        const newsletterForm = document.getElementById('newsletterForm');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', function (e) {
                e.preventDefault();
                const name = this.querySelector('input[type="text"]').value;
                const email = this.querySelector('input[type="email"]').value;
                const code = countryCodeSelect ? countryCodeSelect.value : '+1'; // Default if select not found
                const number = this.querySelector('input[type="tel"]').value;
                alert(`Thank you ${name}! You've successfully subscribed with phone number: ${code} ${number}`);
                this.reset();
            });
        }
    }

    // ===================================
    // 4. MODAL / USER / CART / HISTORY (UPDATED)
    // ===================================
    const registerModal = document.getElementById("registerModal");
    const cartModal = document.getElementById("cartModal");
    const orderHistoryModal = document.getElementById("orderHistoryModal");
    const whiteBtn = document.querySelector(".white-btn");

    // Must update this ID in your HTML navbar to match the new HISTORY link:
    // <a class="nav-link" href="#" id="viewHistoryLink"><i class="fas fa-history me-1"></i> HISTORY</a>
    const viewHistoryLink = document.getElementById("viewHistoryLink");

    if (registerModal && cartModal && orderHistoryModal) {
        let currentUser = sessionStorage.getItem("currentUser") || null;
        let cart = JSON.parse(sessionStorage.getItem("cart")) || [];

        // Order history is now stored as an object where the key is the username
        // and the value is an array of Order Objects.
        let orderHistory = JSON.parse(localStorage.getItem("orderHistory")) || {};
        
        // Simple sequential counter for professional Order ID (e.g., ORD-1001)
        let orderIdCounter = parseInt(localStorage.getItem("orderIdCounter")) || 1000;


        // --- REGISTRATION MODAL ---
        if (whiteBtn) whiteBtn.onclick = () => registerModal.style.display = "block";
        document.getElementById("closeRegister").onclick = () => registerModal.style.display = "none";

        document.getElementById("registerBtn").onclick = () => {
            const username = document.getElementById("username").value.trim();
            if (username) {
                currentUser = username;
                sessionStorage.setItem("currentUser", currentUser);
                // Initialize history array for new user if it doesn't exist
                if (!orderHistory[currentUser]) {
                    orderHistory[currentUser] = [];
                    localStorage.setItem("orderHistory", JSON.stringify(orderHistory));
                }
                alert(`Welcome ${currentUser}! You can now add items to cart.`);
                registerModal.style.display = "none";
            } else alert("Please enter your name.");
        };

        // --- CART LOGIC ---
        function updateCartDisplay() {
            const cartItemsDiv = document.getElementById("cartItems");
            if (!cartItemsDiv) return;
            cartItemsDiv.innerHTML = "";
            let total = 0;

            if (cart.length === 0) {
                 cartItemsDiv.innerHTML = "<p class='text-center text-muted'>Your cart is empty.</p>";
            }
            
            cart.forEach((item, index) => {
                const subtotal = item.price * item.quantity;
                total += subtotal;
                const div = document.createElement("div");
                div.classList.add('cart-item-row'); // Add class for styling if needed
                div.innerHTML = `
                    <p>${item.name} - $${item.price.toFixed(2)} x 
                    <input type="number" min="1" value="${item.quantity}" data-index="${index}" class="qtyInput" style="width: 50px;">
                    = <strong>$${subtotal.toFixed(2)}</strong>
                    <button class="white-btn removeBtn btn-sm btn-danger ms-2" data-index="${index}"><i class="fas fa-trash"></i></button></p>`;
                cartItemsDiv.appendChild(div);
            });
            const discount = total * 0.1;

            document.getElementById("cartTotal").innerText = (total - discount).toFixed(2);
            document.getElementById("discountTotal").innerText = discount.toFixed(2);

            document.querySelectorAll(".qtyInput").forEach(input => {
                input.onchange = e => {
                    const idx = e.target.dataset.index;
                    let newQty = parseInt(e.target.value);
                    if (newQty < 1 || isNaN(newQty)) newQty = 1;
                    cart[idx].quantity = newQty;
                    sessionStorage.setItem("cart", JSON.stringify(cart));
                    updateCartDisplay();
                };
            });

            document.querySelectorAll(".removeBtn").forEach(btn => {
                btn.onclick = e => {
                    const idx = e.target.dataset.index;
                    cart.splice(idx, 1);
                    sessionStorage.setItem("cart", JSON.stringify(cart));
                    updateCartDisplay();
                };
            });
        }

        // Add to cart buttons
        document.querySelectorAll(".add-btn").forEach(btn => {
            btn.onclick = () => {
                if (!currentUser) {
                    alert("Please register first!");
                    registerModal.style.display = "block";
                    return;
                }
                const card = btn.closest(".food-card");
                const name = card.querySelector(".food-title").innerText;
                const priceText = card.querySelector(".price-tag p").innerText;
                const priceMatch = priceText.match(/(\d+(\.\d+)?)/);
                const price = priceMatch ? parseFloat(priceMatch[0]) : 0;
                const existing = cart.find(item => item.name === name);
                if (existing) existing.quantity += 1;
                else cart.push({ name, price, quantity: 1 });
                sessionStorage.setItem("cart", JSON.stringify(cart));
                cartModal.style.display = "block";
                updateCartDisplay();
            };
        });

        document.getElementById("closeCart").onclick = () => cartModal.style.display = "none";
        
        // --- UPDATED SUBMIT CART LOGIC ---
        document.getElementById("submitCart").onclick = () => {
            if (cart.length === 0) { alert("Cart is empty!"); return; }
            
            // 1. Calculate final total
            let totalPreDiscount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const discountAmount = totalPreDiscount * 0.1;
            const finalTotal = totalPreDiscount - discountAmount;

            // 2. Create the Order Object
            orderIdCounter++;
            const newOrderId = `ORD-${orderIdCounter}`;
            
            const newOrder = {
                id: newOrderId,
                timestamp: new Date().toLocaleString(),
                total: finalTotal,
                status: 'Pending', // Initial status
                items: [...cart] // Deep copy of the current cart items
            };

            // 3. Save the new order to the user's history
            if (!orderHistory[currentUser]) orderHistory[currentUser] = [];
            orderHistory[currentUser].unshift(newOrder); // Add to the start (most recent first)
            
            localStorage.setItem("orderHistory", JSON.stringify(orderHistory));
            localStorage.setItem("orderIdCounter", orderIdCounter); // Save the counter

            // 4. Clear the cart and update display
            cart = [];
            sessionStorage.setItem("cart", JSON.stringify(cart));
            updateCartDisplay();
            cartModal.style.display = "none";
            alert(`Order ${newOrderId} submitted successfully! Total: $${finalTotal.toFixed(2)}`);
        };

       // --- ORDER HISTORY FUNCTIONS ---
        
        /** Renders the formal order history cards in the modal. */
        function renderOrderHistory() {
            const historyDiv = document.getElementById("historyItems");
            historyDiv.innerHTML = "";
            const userOrders = orderHistory[currentUser] || [];

            if (userOrders.length === 0) {
                historyDiv.innerHTML = "<p class='text-center text-muted mt-3'>You have no past orders.</p>";
                return;
            }

            userOrders.forEach(order => {
                const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
                const itemSummary = order.items.map(item => `${item.quantity}x ${item.name}`).join(', ');

                const orderCard = document.createElement('div');
                orderCard.classList.add('order-card', 'mb-3', 'p-3'); 

                // Styling logic based on status
                const statusClass = order.status.toLowerCase().includes('pending') ? 'pending' 
                                  : order.status.toLowerCase().includes('cancelled') ? 'cancelled'
                                  : 'delivered';

                orderCard.innerHTML = `
                    <div class="order-header d-flex justify-content-between align-items-center">
                        <span class="order-id">#${order.id}</span>
                        <span class="order-status ${statusClass} badge bg-secondary">${order.status}</span>
                    </div>
                    <div class="order-date text-muted mb-2">Placed On: ${order.timestamp}</div>
                    <div class="order-items-summary">
                        <p class="mb-1"><strong>Items:</strong> ${itemSummary.substring(0, 100)}...</p>
                        <p class="mb-1"><strong>Total Items:</strong> ${totalQuantity}</p>
                        <h5 class="mb-2"><strong>Total Paid:</strong> <span class="text-danger">$${order.total.toFixed(2)}</span></h5>
                    </div>
                    <div class="order-actions mt-2">
                        <button class="main-btn btn-sm" onclick="viewOrderDetails('${order.id}')">
                            <i class="fas fa-eye"></i> View Details
                        </button>
                        
                        <button class="white-btn btn-sm btn-outline-danger" onclick="deleteOrder('${order.id}')">
                            <i class="fas fa-trash-alt"></i> Delete Record
                        </button>
                    </div>
                    <hr>`;
                historyDiv.appendChild(orderCard);
            });
        }
        
        /** Shows detailed order information. */
        window.viewOrderDetails = (orderId) => {
            const userOrders = orderHistory[currentUser] || [];
            const order = userOrders.find(o => o.id === orderId);
            if (!order) return alert("Order not found!");

            let details = `Order ID: ${order.id}\nStatus: ${order.status}\nDate: ${order.timestamp}\n\nITEMS:\n`;
            order.items.forEach(item => {
                details += `- ${item.name} (${item.quantity}x) - $${(item.price * item.quantity).toFixed(2)}\n`;
            });
            details += `\nFINAL TOTAL: $${order.total.toFixed(2)}`;
            alert(details); 
        };

        /** * Logic to COMPLETELY DELETE an order from history.
         * This removes the data from the array and updates LocalStorage.
         */
        window.deleteOrder = (orderId) => {
            const userOrders = orderHistory[currentUser] || [];
            const orderIndex = userOrders.findIndex(o => o.id === orderId);

            if (orderIndex > -1) {
                // Confirm with the user before deleting
                if (confirm(`Are you sure you want to delete the record for Order ${orderId}? This cannot be undone.`)) {
                    
                    // .splice removes the item from the array completely
                    userOrders.splice(orderIndex, 1); 
                    
                    // Update the main storage object
                    orderHistory[currentUser] = userOrders;
                    localStorage.setItem("orderHistory", JSON.stringify(orderHistory));
                    
                    alert(`Order ${orderId} has been deleted from your history.`);
                    
                    // Re-render the list immediately to show it's gone
                    renderOrderHistory(); 
                }
            } else {
                alert("Order not found.");
            }
        };


        // --- ORDER HISTORY MODAL HANDLERS ---
        if (viewHistoryLink) {
            viewHistoryLink.onclick = (e) => {
                e.preventDefault();
                if (!currentUser) {
                    alert("Please register first to view your history!");
                    registerModal.style.display = "block";
                    return;
                }
                renderOrderHistory();
                orderHistoryModal.style.display = "block";
            };
        }
        document.getElementById("closeHistory").onclick = () => orderHistoryModal.style.display = "none";

        window.onclick = event => {
            if (event.target.classList.contains("modal")) event.target.style.display = "none";
        };
    }

    // ===================================
    // 5. REGISTER.HTML LOGIC
    // ===================================
    // const registrationForm = document.getElementById('registrationForm');
    // if (registrationForm) {
    //     registrationForm.addEventListener('submit', e => {
    //         e.preventDefault();
    //         const password = document.getElementById('password').value;
    //         const confirmPassword = document.getElementById('confirmPassword').value;
    //         if (password !== confirmPassword) return alert('Passwords do not match!');
    //         alert("Registration Successful! Form will now reset.");
    //         registrationForm.reset();
    //         if (document.getElementById('countryCode')) document.getElementById('countryCode').value = '';
    //     });
    // }

    // const backBtn = document.getElementById('backButton');
    // if (backBtn) backBtn.addEventListener('click', () => {
    //     if (window.history.length > 1) window.history.back();
    //     else window.location.href = 'index.html';
    // });

});



document.addEventListener("DOMContentLoaded", () => {
    
    // 1. Select the Search elements
    // We select the input field based on its type="search" inside the navbar
    const searchInput = document.querySelector('header input[type="search"]');
    const searchForm = document.querySelector('header form.d-flex');
    
    // 2. Select the Container where all food items live
    const foodContainer = document.getElementById('food-container');
    
    // 3. The Filter Function
  const searchFood = () => {
        const searchValue = searchInput.value.toLowerCase();
        const foodItems = foodContainer.children;
        const noMenuMessage = document.getElementById('no-menu-message'); // Select the message div
        
        let foundAny = false; // 1. Start by assuming we haven't found anything

        for (let i = 0; i < foodItems.length; i++) {
            let item = foodItems[i];
            let titleElement = item.querySelector('.food-title');
            
            if (titleElement) {
                let titleText = titleElement.textContent.toLowerCase();

                if (titleText.includes(searchValue)) {
                    item.style.display = ""; 
                    foundAny = true; // 2. We found a match! flip the switch to true
                } else {
                    item.style.display = "none"; 
                    // Do NOT print the error message here, wait until the loop finishes
                }
            }
        }

        // 3. The loop is done. Did we find anything?
        if (foundAny === false) {
            noMenuMessage.style.display = "block"; // Show the error message
        } else {
            noMenuMessage.style.display = "none"; // Hide the error message
        }
    };
    // 4. Event: Trigger search whenever the user types
    searchInput.addEventListener('keyup', searchFood);
    
    // 5. Event: Prevent the "Search" button from refreshing the page
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Stop page reload
        searchFood(); // Run search one last time just in case
    });

});