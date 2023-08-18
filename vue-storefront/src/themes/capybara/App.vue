<template>
  <div id="app">
    <div class="donmo-header">
      <a href="https://donmo.org" target="_blank">Donmo Vue Storefront Demo</a>
    </div>

    <component :is="layout">
      <router-view />
    </component>
  </div>
</template>

<script>
import get from "lodash-es/get";
import DefaultLayout from "./layouts/Default";
import MinimalLayout from "./layouts/Minimal";

export default {
  components: {
    DefaultLayout,
    MinimalLayout
  },
  computed: {
    layout() {
      return `${get(this.$route, "meta.layout", "default")}-layout`;
    }
  },

  async mounted() {
    const shippinDetails = {
      firstName: "Vanessa",
      lastName: "Puccini",
      emailAddress: "vanessapuccini@donmo.org",
      zipCode: 12345678,
      country: "US",
      phoneNumber: 12345678,
      state: "CA",
      streetAddress: "123 Kettner Boulevard",
      city: "San Diego",
      apartmentNumber: 2
    };
    const product = await this.$store.dispatch("product/single", {
      options: { sku: "24-MB01" }
    });
    console.log("product is", product);
    this.$store.dispatch("cart/addItem", { productToAdd: product });

    this.$store.dispatch("checkout/savePersonalDetails", {
      firstName: "Vanessa",
      lastName: "Puccini",
      emailAddress: "vanessapuccini@donmo.org"
    });

    this.$store.dispatch("checkout/saveShippingDetails", shippinDetails);
    this.$store.dispatch("checkout/savePaymentDetails", {
      ...shippinDetails,
      paymentMethod: "checkmo"
    });
  }
};
</script>

<style lang="scss" src="theme/css/main.scss"></style>
<style lang="scss">
@import "~@storefront-ui/shared/styles/helpers/breakpoints";

.donmo-header {
  background-color: #f6c728;
  padding: 5px;
}
.donmo-header a {
  color: #005cb3;
  font-weight: bold;
}

body {
  --overlay-z-index: 1;
  --sidebar-aside-z-index: 2;
  --sidebar-z-index: 2;
  --bottom-navigation-height: 3.75rem;
  --bar-height: 3.125rem;
  --notification-font-size: var(--font-sm);
  font-family: var(--font-family-secondary);
  margin: 0;
  padding: 0;
  a {
    text-decoration: none;
    color: var(--c-link);
    cursor: pointer;
    &:hover {
      color: var(--c-link-hover);
    }
  }
}

#viewport {
  position: relative;
}

@include for-desktop {
  .sidebar {
    &__microcart {
      --sidebar-aside-width: 700px;
    }
  }
}
</style>
