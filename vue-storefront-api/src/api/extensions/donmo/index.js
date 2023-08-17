import { Router } from "express";
import { apiStatus, getToken } from "../../../lib/util";
import { Router } from "express";

const Magento2Client = require("magento2-rest-client").Magento2Client;
function isNumeric(val) {
  return !isNaN(Number(val));
}
module.exports = ({ config, db }) => {
  let mcApi = Router();
  mcApi.post("/add_donation", (req, res) => {
    const client = Magento2Client(config.magento2.api);

    client.addMethods("donmo", (restClient) => {
      var module = {};

      module.addDonation = function (customerToken, cartId, donationAmount) {
        if (isNaN(donationAmount) || donationAmount < 0) {
          return new Promise((resolve, reject) => {
            resolve("Invalid donation");
          });
        }

        if (customerToken && isNumeric(cartId)) {
          return restClient.post(
            "/carts/mine/add_donmo_donation",
            {
              donationAmount: donationAmount,
            },
            customerToken
          );
        } else {
          return restClient.post(
            "/guest-carts/" + cartId + "/add_donmo_donation",
            {
              donationAmount,
            }
          );
        }
      };
      return module;
    });
    console.log("token is", getToken(req));
    console.log("cart id is", req.query.cartId);
    console.log("donation is", req.body.donationAmount);
    client.donmo
      .addDonation(getToken(req), req.query.cartId, req.body.donationAmount)
      .then((result) => {
        apiStatus(res, result, 200);
      })
      .catch((err) => {
        apiStatus(res, err, 500);
      });
  });

  mcApi.delete("/remove_donation", (req, res) => {
    const client = Magento2Client(config.magento2.api);
    client.addMethods("donmo", (restClient) => {
      var module = {};

      module.removeDonation = function (customerToken, cartId) {
        console.log("remove cartId is", cartId);
        if (customerToken && isNumeric(cartId)) {
          return restClient.delete(
            "/carts/mine/remove_donmo_donation",
            customerToken
          );
        } else {
          return restClient.delete(
            "/guest-carts/" + cartId + "/remove_donmo_donation"
          );
        }
      };
      return module;
    });
    client.donmo
      .removeDonation(getToken(req), req.query.cartId)
      .then((result) => {
        apiStatus(res, result, 200);
      })
      .catch((err) => {
        apiStatus(res, err, 500);
      });
  });

  return mcApi;
};
