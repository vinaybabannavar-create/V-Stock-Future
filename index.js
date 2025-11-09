let bagItems = [];

onLoad();

function onLoad() {
  const bagItemsStr = localStorage.getItem("vstock_bag");
  bagItems = bagItemsStr ? JSON.parse(bagItemsStr) : [];
  displayItemsOnHomePage();
  displayBagIcon();
  updateBalance();
}

function addToBag(itemId) {
  const user = JSON.parse(localStorage.getItem("vstock_user_data"));
  if (!user) {
    alert("Please login first!");
    window.location.href = "login.html";
    return;
  }

  const item = items.find(i => i.id === itemId);
  if (!item) return;

  // Check if item already exists
  const alreadyInBag = bagItems.some(i => i.id === itemId);
  if (alreadyInBag) {
    showToast("⚠️ Already in Bag!");
    return;
  }

  // Check if enough points
  if (user.balance < item.current_price) {
    showToast("❌ Not enough points!");
    return;
  }

  // Deduct balance
  user.balance -= item.current_price;
  localStorage.setItem("vstock_user_data", JSON.stringify(user));

  // Add to bag
  bagItems.push(item);
  localStorage.setItem("vstock_bag", JSON.stringify(bagItems));

  updateBalance();
  displayBagIcon();
  showToast(`✅ Bought ${item.company} for ₹${item.current_price}`);
}

function displayItemsOnHomePage() {
  const container = document.querySelector(".items-container");
  if (!container) return;

  container.innerHTML = items.map(item => `
    <div class="item-container">
      <img class="item-image" src="${item.image}" alt="${item.company}" />
      <div class="rating">${item.rating.stars} ⭐ | ${item.rating.count}</div>
      <div class="company-name">${item.company}</div>
      <div class="item-name">${item.item_name}</div>
      <div class="price">
        <span class="current-price">₹${item.current_price}</span>
        <span class="original-price">₹${item.original_price}</span>
        <span class="discount">(${item.discount_percentage}% OFF)</span>
      </div>
      <button class="btn-add-bag" onclick="addToBag(${item.id})">Buy Now</button>
    </div>
  `).join('');
}

function displayBagIcon() {
  const bagItemCountElement = document.querySelector("#bagCount");
  if (!bagItemCountElement) return;
  bagItemCountElement.textContent = bagItems.length;
  bagItemCountElement.style.visibility = bagItems.length > 0 ? "visible" : "hidden";
}

function updateBalance() {
  const user = JSON.parse(localStorage.getItem("vstock_user_data"));
  if (!user) return;
  const balanceEl = document.getElementById("balance");
  if (balanceEl) balanceEl.textContent = user.balance;
}

function showToast(message) {
  const toast = document.createElement("div");
  toast.textContent = message;
  toast.style.position = "fixed";
  toast.style.bottom = "20px";
  toast.style.right = "20px";
  toast.style.background = "#1db954";
  toast.style.color = "#fff";
  toast.style.padding = "10px 20px";
  toast.style.borderRadius = "8px";
  toast.style.fontWeight = "600";
  toast.style.boxShadow = "0 0 10px rgba(29,185,84,0.3)";
  toast.style.zIndex = "1000";
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2000);
}
