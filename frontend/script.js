const apiUrl = "http://127.0.0.1:5000";

// Detect which page we’re on
const isAdminPage = document.getElementById("adminProductList") !== null;

// Fetch products
async function fetchProducts() {
  try {
    const res = await fetch(`${apiUrl}/products`);
    const products = await res.json();

    if (isAdminPage) {
      renderAdminProducts(products);
    } else {
      renderUserProducts(products);
    }
  } catch (err) {
    console.error("Error fetching products:", err);
  }
}

// Render for buyers
function renderUserProducts(products) {
  const productList = document.getElementById("productList");
  productList.innerHTML = "";

  products.forEach(product => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${product.name}</td>
      <td>$${product.price}</td>
      <td>${product.quantity}</td>
      <td>
        <input type="number" min="1" max="${product.quantity}" id="buy-${product.id}" class="form-control form-control-sm" placeholder="Qty">
        <button class="btn btn-warning btn-sm mt-1" onclick="buyProduct(${product.id})">Buy</button>
      </td>
    `;
    productList.appendChild(row);
  });
}

// Render for admin
function renderAdminProducts(products) {
  const adminList = document.getElementById("adminProductList");
  adminList.innerHTML = "";

  products.forEach(product => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><input type="text" class="form-control" id="name-${product.id}" value="${product.name}"></td>
      <td><input type="number" class="form-control" id="price-${product.id}" value="${product.price}"></td>
      <td><input type="number" class="form-control" id="quantity-${product.id}" value="${product.quantity}"></td>
      <td><button class="btn btn-success btn-sm" onclick="updateProduct(${product.id})">Update</button></td>
      <td><button class="btn btn-danger btn-sm" onclick="deleteProduct(${product.id})">Delete</button></td>
    `;
    adminList.appendChild(row);
  });
}

// Add product (Admin only)
const addProductForm = document.getElementById("addProductForm");
if (addProductForm) {
  addProductForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value;
    const price = parseFloat(document.getElementById("price").value);
    const quantity = parseInt(document.getElementById("quantity").value);

    await fetch(`${apiUrl}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, price, quantity })
    });

    addProductForm.reset();
    fetchProducts();
  });
}

// Update product
async function updateProduct(id) {
  const name = document.getElementById(`name-${id}`).value;
  const price = parseFloat(document.getElementById(`price-${id}`).value);
  const quantity = parseInt(document.getElementById(`quantity-${id}`).value);

  await fetch(`${apiUrl}/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, price, quantity })
  });

  fetchProducts();
}

// Delete product
async function deleteProduct(id) {
  await fetch(`${apiUrl}/products/${id}`, { method: "DELETE" });
  fetchProducts();
}

// Buy product
async function buyProduct(id) {
  const qtyInput = document.getElementById(`buy-${id}`);
  const quantity = parseInt(qtyInput.value);

  if (!quantity || quantity <= 0) return alert("Enter a valid quantity.");

  await fetch(`${apiUrl}/sales`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ product_id: id, quantity_sold: quantity })
  });

  fetchProducts();
}

// Load products on page load
fetchProducts();
