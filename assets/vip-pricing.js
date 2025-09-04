// assets/vip-pricing.js
(function () {
  if (!window.currentProductVipData) return;
  var data = window.currentProductVipData;

  // If customer is not VIP, we don't alter behavior
  if (!data.isCustomerVIP) {
    // Optionally you can show a message on the product page suggesting login to see VIP prices.
    return;
  }

  // Utility: get the product form (Dawn uses a product form; we try several selectors)
  function getProductForm() {
    return document.querySelector('form[action^="/cart/add"]') ||
           document.querySelector('form[data-product-form]') ||
           document.querySelector('form#product_form');
  }

  // Utility: read the currently selected variant id on the form (hidden input named "id")
  function getSelectedVariantId(form) {
    if (!form) return null;
    var idInput = form.querySelector('input[name="id"]');
    if (!idInput) return null;
    return idInput.value;
  }

  // Update price on the page to show the VIP formatted price (if available)
  function updateDisplayedPriceForVariant(variantId) {
    try {
      var mapping = data.variantMapping && data.variantMapping[variantId];
      if (!mapping || !mapping.vip_price_formatted) return;

      // target a few frequent selectors (Dawn uses .price / .product__price etc.)
      var selectors = [
        '[data-product-price]', // some themes
        '.price',               // fallback
        '.product__price',
        '.price-item--regular',
        '.product__price .price'
      ];

      selectors.forEach(function (sel) {
        document.querySelectorAll(sel).forEach(function (el) {
          // If this element contains a currency string we replace it.
          // Replace only if the element seems to show the product price (heuristic).
          el.innerHTML = mapping.vip_price_formatted;
        });
      });
    } catch (e) {
      // fail silently
      console.error('VIP price update error', e);
    }
  }

  // On form submit: swap the variant id to VIP variant id (if mapping exists)
  function attachFormSubmitSwap() {
    var form = getProductForm();
    if (!form) return;

    form.addEventListener('submit', function (evt) {
      var idInput = form.querySelector('input[name="id"]');
      if (!idInput) return;
      var currentId = idInput.value;
      var mapping = data.variantMapping && data.variantMapping[currentId];
      if (mapping && mapping.vip_variant_id) {
        // Replace the id value with the VIP variant id
        idInput.value = mapping.vip_variant_id;
      }
      // allow submit to continue (Dawn will do an AJAX add)
    }, true);
  }

  // Observe variant selection changes and update displayed price
  function attachVariantChangeHandlers() {
    var form = getProductForm();
    if (!form) return;

    // Common variant controls: radio/inputs/select. Use delegated change listener.
    form.addEventListener('change', function (e) {
      setTimeout(function () {
        var variantId = getSelectedVariantId(form);
        if (variantId) updateDisplayedPriceForVariant(variantId);
      }, 30);
    }, true);

    // Also run initially
    var initialVariant = getSelectedVariantId(form);
    if (initialVariant) updateDisplayedPriceForVariant(initialVariant);
  }

  // Initialize
  document.addEventListener('DOMContentLoaded', function () {
    attachFormSubmitSwap();
    attachVariantChangeHandlers();
  });
})();
