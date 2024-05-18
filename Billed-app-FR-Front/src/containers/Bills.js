import { ROUTES_PATH } from "../constants/routes.js";
import { formatDate, formatStatus } from "../app/format.js";
import Logout from "./Logout.js";

export default class {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document;
    this.onNavigate = onNavigate;
    this.store = store;
    const buttonNewBill = document.querySelector(
      `button[data-testid="btn-new-bill"]`
    );
    if (buttonNewBill)
      buttonNewBill.addEventListener("click", this.handleClickNewBill);
    const iconEye = document.querySelectorAll(`div[data-testid="icon-eye"]`);
    if (iconEye)
      iconEye.forEach((icon) => {
        icon.addEventListener("click", () => this.handleClickIconEye(icon));
      });
    new Logout({ document, localStorage, onNavigate });
  }

  handleClickNewBill = () => {
    this.onNavigate(ROUTES_PATH["NewBill"]);
  };

  handleClickIconEye = (icon) => {
    const billUrl = icon.getAttribute("data-bill-url");
    const imgWidth = Math.floor($("#modaleFile").width() * 0.5);
    $("#modaleFile")
      .find(".modal-body")
      .html(
        `<div style='text-align: center;' class="bill-proof-container"><img width=${imgWidth} src=${billUrl} alt="Bill" /></div>`
      );
    $("#modaleFile").modal("show");
  };

  sortBillsDescending = (bills) => {
    bills.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    return bills;
  };

  getBills = () => {
    if (this.store) {
      return this.store
        .bills()
        .list()
        .then((snapshot) => {
          const bills = snapshot.map((doc) => {
            let formattedDate;
            let formattedStatus;
            try {
              formattedDate = formatDate(doc.date);
              formattedStatus = formatStatus(doc.date);
            } catch (e) {
              console.log(e, "for", doc);
              formattedDate = doc.date;
              formattedStatus = doc.status;
            }
            return {
              ...doc,
              formattedDate,
              formattedStatus,
            };
          });

          const sortedBills = this.sortBillsDescending(bills);

          return sortedBills.map((bill) => ({
            ...bill,
            date: bill.formattedDate,
            status: bill.formattedStatus,
          }));
        });
    }
  };
}
