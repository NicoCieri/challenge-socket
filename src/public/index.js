(async () => {
  const socket = io();

  const form = document.querySelector("form");
  const productList = document.querySelector("#productList");
  const errorMessage = document.querySelector("#errorMessage");

  const resetForm = (form) => {
    form.title.value = "";
    form.description.value = "";
    form.thumbnail.value = "";
    form.price.value = "";
    form.stock.value = "";
    form.category.value = "";
    form.code.value = "";
    errorMessage.innerHTML = "";
  };

  form.onsubmit = async (e) => {
    e.preventDefault();

    errorMessage.innerHTML = "";

    const formData = new FormData();
    formData.append("title", e.target.title.value);
    formData.append("description", e.target.description.value);
    formData.append("thumbnail", e.target.thumbnail.files[0]);
    formData.append("price", Number(e.target.price.value));
    formData.append("stock", Number(e.target.stock.value));
    formData.append("category", e.target.category.value);
    formData.append("code", e.target.code.value);

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        body: formData,
      });
      const { error } = await response.json();

      if (error) throw new Error(error);
      else resetForm(e.target);
    } catch (error) {
      errorMessage.innerHTML = error;
    }
  };

  const productItem = (product) => `
    <li class="productCard">
      <img src="images/${product.thumbnails?.[0]}" alt="${product.title}">
      <div>
        <h3>${product.title}</h3>
        <p>${product.description}</p>
        <p class="price">$${product.price}</p>
      </div>
    </li>
  `;

  socket.on("product:added", ({ products, product }) => {
    productList.innerHTML = products.map(productItem).join("");

    Toastify({
      text: `🟢 New product added! ${product.title}`,
      duration: 3000,
      gravity: "top",
      position: "right",
      stopOnFocus: true,
      style: {
        background: "linear-gradient(to right, #00b09b, #96c93d)",
      },
    }).showToast();
  });

  socket.on("product:removed", ({ products, product }) => {
    productList.innerHTML = products.map(productItem).join("");

    Toastify({
      text: `🔴 Product ${product.title} removed`,
      duration: 3000,
      gravity: "top",
      position: "right",
      stopOnFocus: true,
      style: {
        color: "#fff",
        background: "linear-gradient(to right, #c9a73d, #b00000)",
      },
    }).showToast();
  });
})();
