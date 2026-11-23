/* Temporary helpers until Member 1 adds the real ones */
if (typeof getProducts !== "function") {
  var getProducts = function () {
    return JSON.parse(localStorage.getItem("products")) || PRODUCTS;
  };
}
if (typeof getShops !== "function") {
  var getShops = function () {
    return JSON.parse(localStorage.getItem("shops")) || SHOPS;
  };
}
if (typeof getCart !== "function") {
  var getCart = function () {
    return JSON.parse(localStorage.getItem("cart")) || [];
  };
}
if (typeof saveCart !== "function") {
  var saveCart = function (cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  };
}