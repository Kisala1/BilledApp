/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import Bills from "../containers/Bills.js";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import router from "../app/Router";

jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills page but it is loading", () => {
    test("Then, Loading page should be rendered", () => {
      document.body.innerHTML = BillsUI({ loading: true });
      expect(screen.getAllByText("Loading...")).toBeTruthy();
    });
  });
  describe("When I am on Bills page but back-end send an error message", () => {
    test("Then, Error page should be rendered", () => {
      document.body.innerHTML = BillsUI({ error: "some error message" });
      expect(screen.getAllByText("Erreur")).toBeTruthy();
    });
  });
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      expect(windowIcon.classList.contains("active-icon")).toBe(true);
    });
  });
  describe("", () => {
    test("Then bills should be ordered from earliest to latest", async () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );

      const billsInstance = new Bills({
        document: document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      });
      document.body.innerHTML = BillsUI({ data: bills });

      const sortedBills = billsInstance.sortBillsDescending(bills);
      // Vérifiez si ce n'est pas le premier élément
      const isSortedDescending = sortedBills.every((bill, index, array) => {
        if (index > 0) {
          // Comparez les dates avec les éléments précédents pour vérifier le tri descendant
          return new Date(array[index - 1].date) >= new Date(bill.date);
        }
        // Si c'est le premier élément, retournez toujours true car il est automatiquement trié correctement
        return true;
      });

      expect(isSortedDescending).toBe(true);
    });
  });

  describe("When I click on the New Bill button", () => {
    test("Then I am sent to the form", () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const bills = new Bills({
        document,
        onNavigate,
        store: null,
        localStorage: localStorageMock,
      });

      const handleClickNewBill = jest.fn(bills.handleClickNewBill);

      const btnNewBill = screen.getByTestId("btn-new-bill");
      btnNewBill.addEventListener("click", handleClickNewBill);
      userEvent.click(btnNewBill);
      expect(handleClickNewBill).toHaveBeenCalled();
      expect(screen.getByTestId(`form-new-bill`)).toBeTruthy();
    });
  });
  describe("When I click on the icon eye button", () => {
    test("Then the modal appears", () => {
      // The mocking will also avoids one to include Bootstrap for test suite
      $.fn.modal = jest.fn();

      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const billsInst = new Bills({
        document,
        onNavigate,
        store: null,
        localStorage: localStorageMock,
      });
      document.body.innerHTML = BillsUI({ data: bills });

      const handleClickIconEye = jest.fn(billsInst.handleClickIconEye);

      const iconEyes = screen.getAllByTestId("icon-eye");
      iconEyes.forEach((iconEye) => {
        iconEye.addEventListener("click", handleClickIconEye(iconEye));
      });
      userEvent.click(iconEyes[0]);
      expect(handleClickIconEye).toHaveBeenCalled();
    });
  });
});

// test d'intégration GET
describe("Given I am a user connected as Employee", () => {
  describe("When i navigate to Bills Page", () => {
    test("fetches bills from mock API GET", async () => {
      localStorage.setItem(
        "user",
        JSON.stringify({ type: "Employee", email: "a@a" })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      document.body.innerHTML = BillsUI({ data: bills });

      await waitFor(() => screen.getByText("Mes notes de frais"));
      const formButton = await screen.getByText("Nouvelle note de frais");
      expect(formButton).toBeTruthy();
      const contentType = await screen.getByText("Type");
      expect(contentType).toBeTruthy();
      const contentName = await screen.getByText("Nom");
      expect(contentName).toBeTruthy();
      const contentDate = await screen.getByText("Date");
      expect(contentDate).toBeTruthy();
      const contentAmount = await screen.getByText("Montant");
      expect(contentAmount).toBeTruthy();
      const contentStatus = await screen.getByText("Statut");
      expect(contentStatus).toBeTruthy();
      const contentActions = await screen.getByText("Actions");
      expect(contentActions).toBeTruthy();
    });
    describe("When an error occurs on API", () => {
      beforeEach(() => {
        jest.spyOn(mockStore, "bills");
        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
            email: "a@a",
          })
        );
        const root = document.createElement("div");
        root.setAttribute("id", "root");
        document.body.appendChild(root);
        router();
      });
      test("fetches bills from an API and fails with 404 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 404"));
            },
          };
        });
        window.onNavigate(ROUTES_PATH.Bills);
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 404/);
        expect(message).toBeTruthy();
      });
      test("fetches messages from an API and fails with 500 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 500"));
            },
          };
        });

        window.onNavigate(ROUTES_PATH.Bills);
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 500/);
        expect(message).toBeTruthy();
      });
    });
  });
});
