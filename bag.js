const CONVENIENCE_FEES = 99;
let bagItems = JSON.parse(localStorage.getItem("vstock_bag")) || [];
let user = JSON.parse(localStorage.getItem("vstock_user_data"));
const container = document.querySelector(".bag-items-container");
const summary = document.querySelector(".bag-summary");

if (!user) {
  alert("Please login first!");
  window.location.href = "login.html";
}

onLoad();

function onLoad() {
  if (bagItems.length === 0) {
    container.innerHTML = "<p style='color:#aaa;font-size:18px;'>Your bag is empty 👜</p>";
    summary.innerHTML = "";
    return;
  }
  displayBagItems();
  displayBagSummary();
}

function displayBagItems() {
  container.innerHTML = bagItems.map((item, index) => `
    <div class="bag-item-container">
      <img src="${item.image}" class="bag-item-img" alt="${item.company}">
      <div class="company">${item.company}</div>
      <div class="item-name">${item.item_name}</div>
      <div class="price-container">
        <span class="current-price">₹${item.current_price}</span>
        <span class="original-price">₹${item.original_price}</span>
        <span class="discount-percentage">(${item.discount_percentage}% OFF)</span>
      </div>
      <button class="remove-btn" onclick="removeItem(${index})">Remove</button>
      <button class="buy-btn" onclick="buyItem(${index})">Buy Now</button>
    </div>
  `).join('');
}

function displayBagSummary() {
  let totalMRP = 0, totalDiscount = 0;
  bagItems.forEach(i => {
    totalMRP += i.original_price;
    totalDiscount += (i.original_price - i.current_price);
  });
  const finalAmount = totalMRP - totalDiscount + CONVENIENCE_FEES;
  summary.innerHTML = `
    <h2>Price Details (${bagItems.length} items)</h2>
    <p>Total Value: ₹${totalMRP.toFixed(2)}</p>
    <p>Discount: -₹${totalDiscount.toFixed(2)}</p>
    <p>Convenience Fee: ₹${CONVENIENCE_FEES}</p>
    <hr>
    <h3>Total: ₹${finalAmount.toFixed(2)}</h3>
    <button class="btn-place-order" onclick="buyAll(${finalAmount})">Buy All Stocks</button>
  `;
}

function removeItem(index) {
  if (confirm("Remove this stock from your bag?")) {
    bagItems.splice(index, 1);
    localStorage.setItem("vstock_bag", JSON.stringify(bagItems));
    onLoad();
  }
}

// ✅ Each user gets their own purchase key
function getPurchaseKey() {
  return `vstock_purchased_${user.email || user.name || user.id}`;
}

function buyItem(index) {
  const item = bagItems[index];
  if (user.balance < item.current_price) {
    alert("❌ Not enough balance!");
    return;
  }

  if (confirm(`Buy ${item.company} for ₹${item.current_price}?`)) {
    user.balance -= item.current_price;
    user.hasUnlockedScratch = true;
    localStorage.setItem("vstock_user_data", JSON.stringify(user));

    const key = getPurchaseKey();
    let purchased = JSON.parse(localStorage.getItem(key)) || [];
    purchased.push({
      ...item,
      price: item.current_price,
      date: new Date().toLocaleString()
    });
    localStorage.setItem(key, JSON.stringify(purchased));

    bagItems.splice(index, 1);
    localStorage.setItem("vstock_bag", JSON.stringify(bagItems));

    alert(`✅ Purchased ${item.company}! 🎁 You unlocked a Scratch Card!\n💰 Remaining balance: ₹${user.balance}`);
    window.location.href = "buy_success.html";
  }
}

function buyAll(finalAmount) {
  if (user.balance < finalAmount) {
    alert("❌ Insufficient balance for all stocks!");
    return;
  }

  if (confirm(`Confirm purchase of all stocks for ₹${finalAmount}?`)) {
    user.balance -= finalAmount;
    user.hasUnlockedScratch = true;
    localStorage.setItem("vstock_user_data", JSON.stringify(user));

    const key = getPurchaseKey();
    let purchased = JSON.parse(localStorage.getItem(key)) || [];
    bagItems.forEach(item => {
      purchased.push({
        ...item,
        price: item.current_price,
        date: new Date().toLocaleString()
      });
    });
    localStorage.setItem(key, JSON.stringify(purchased));

    localStorage.removeItem("vstock_bag");

    alert(`✅ All stocks purchased successfully! 🎉\n💰 Balance: ₹${user.balance}\n\n🎁 Scratch your reward now!`);
    window.location.href = "buy_success.html";
  }
}
