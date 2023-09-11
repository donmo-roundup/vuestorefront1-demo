<template>
  <div :id="elementId"></div>
</template>

<script>
import { mapGetters } from "vuex";
import config from "config";
import { processLocalizedURLAddress } from "@vue-storefront/core/helpers";
import getApiEndpointUrl from "@vue-storefront/core/helpers/getApiEndpointUrl";
import { TaskQueue } from "@vue-storefront/core/lib/sync";
import { currentStoreView } from "@vue-storefront/core/lib/multistore";

export default {
  name: "DonmoRoundup",
  props: {
    publicKey: {
      type: String,
      required: true
    },
    integrationTitle: {
      type: String
    },
    roundupMessage: {
      type: String
    },
    thankMessage: {
      type: String
    },
    errorMessage: {
      type: String
    },
    language: {
      type: String
    },
    isBackendBased: {
      type: Boolean,
      default: true
    }
  },

  data() {
    return {
      donmo: null,
      elementId: `donmo-roundup-${Math.floor(Math.random() * 1000)}`
    };
  },
  computed: {
    ...mapGetters({
      totals: "cart/getTotals",
      cartId: "cart/getCartToken"
    }),
    prices() {
      return this.totals.reduce((result, price) => {
        result[price.code] = price.value;
        return result;
      }, {});
    }
  },

  watch: {
    totals() {
      if (this.donmo) {
        this.donmo.refresh();
      }
    }
  },

  mounted() {
    let donmoScript = document.createElement("script");
    document.head.appendChild(donmoScript);
    const addDonationAction = ({ donationAmount }) => {
      const url = processLocalizedURLAddress(
        getApiEndpointUrl(config.donmo, "add_donation_endpoint")
      );

      TaskQueue.execute({
        url,
        payload: {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          mode: "cors",
          body: JSON.stringify({ donationAmount })
        },
        silent: true
      }).then(() => {
        this.$store.dispatch("cart/syncTotals", { forceServerSync: true });
      });
    };

    const removeDonationAction = () => {
      const url = processLocalizedURLAddress(
        getApiEndpointUrl(config.donmo, "remove_donation_endpoint")
      );

      TaskQueue.execute({
        url,
        payload: {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          mode: "cors"
        },
        silent: true
      }).then(() => {
        this.$store.dispatch("cart/syncTotals", { forceServerSync: true });
      });
    };

    donmoScript.onload = () => {
      this.donmo = DonmoRoundup({
        publicKey: this.publicKey,
        elementId: this.elementId,
        currency: currentStoreView().i18n.currencyCode,
        language: currentStoreView().i18n.defaultLanguage.toLocaleLowerCase(),
        isBackendBased: false,
        orderId: this.$store.state.cart.cartServerToken,
        getExistingDonation: () => this.prices.donmodonation,
        addDonationAction,
        removeDonationAction,
        getGrandTotal: () => this.prices.grand_total
      });
      this.donmo.build();
    };

    donmoScript.setAttribute("src", "https://static.donmo.org/integration.js");
  }
};
</script>
