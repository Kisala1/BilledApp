/**
 * @jest-environment jsdom
 */

import { fireEvent, screen } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { ROUTES_PATH } from "../constants/routes";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import router from "../app/Router";

jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page and I don't attach a file to the invoice", () => {
    test("Then an error message appears when the form is submit", () => {
      document.body.innerHTML = NewBillUI();
      const newBill = new NewBill({
        document,
        onNavigate: jest.fn(),
        store: mockStore,
        localStorage: localStorageMock,
      });

      const event = {
        preventDefault: jest.fn(),
        target: {
          files: [null],
        },
      };
      expect(() => {
        newBill.handleChangeFile(event);
      }).toThrow("A file must be selected.");
    });
  });

  describe("When I am on NewBill Page and I attach a file in an incorrect format", () => {
    test("Then an error message appears when there is a change in the input file", () => {
      document.body.innerHTML = NewBillUI();
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const newBill = new NewBill({
        document,
        onNavigate: jest.fn(),
        store: mockStore,
        localStorage: localStorageMock,
      });

      const event = {
        preventDefault: jest.fn(),
        target: {
          value: "C:\\fakepath\\test.txt",
        },
      };
      const querySelectorSpy = jest
        .spyOn(document, "querySelector")
        .mockReturnValue({
          files: [{ name: "fichier.pdf" }],
        });

      expect(() => {
        newBill.handleChangeFile(event);
      }).toThrow("Supported files: .png, .jpeg, .jpg");

      querySelectorSpy.mockRestore();
    });
  });

  describe("When I'm on the Newbill page and I attach a file in the correct format", () => {
    test("Then there's no error message and I return to the Bills page", () => {
      document.body.innerHTML = NewBillUI();
      const newBill = new NewBill({
        document,
        onNavigate: jest.fn(),
        store: mockStore,
        localStorage: localStorageMock,
      });

      const event = {
        preventDefault: jest.fn(),
        target: {
          value: "C:\\fakepath\\test.png",
        },
      };

      const querySelectorSpy = jest
        .spyOn(document, "querySelector")
        .mockReturnValue({
          files: [{ name: "test.png" }],
        });

      expect(() => {
        newBill.handleChangeFile(event);
      }).not.toThrow();

      querySelectorSpy.mockRestore();
    });
  });

  test("handleSubmit should update bill and navigate to Bills page", () => {
    const newBill = new NewBill({
      document,
      onNavigate: jest.fn(),
      store: mockStore,
      localStorage: localStorageMock,
    });

    // Mock store.bills().update method
    const mockUpdate = jest.fn().mockResolvedValue({});
    newBill.store.bills().update = mockUpdate;
    const submitButton = screen.getByTestId("form-new-bill");
    fireEvent.submit(submitButton);

    expect(mockUpdate).toHaveBeenCalled();
    expect(newBill.onNavigate).toHaveBeenCalledWith(ROUTES_PATH.Bills);
  });
});

// test d'intégration POST
describe("Given I am a user connected as Employee", () => {
  describe("When I submitting a new bill form", () => {
    test("handleSubmit should send a POST request with correct data", async () => {
      localStorage.setItem(
        "user",
        JSON.stringify({ type: "Employee", email: "a@a" })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);
      document.body.innerHTML = NewBillUI();

      // Attend que l'élément <form> soit disponible dans le DOM
      const checkFormAvailable = setInterval(() => {
        const formNewBill = document.querySelector(
          `form[data-testid="form-new-bill"]`
        );
        if (formNewBill) {
          clearInterval(checkFormAvailable);

          // Remplis le formulaire
          const typeInput = screen.getByTestId("expense-type");
          const nameInput = screen.getByTestId("expense-name");
          const amountInput = screen.getByTestId("amount");
          const dateInput = screen.getByTestId("datepicker");
          const vatInput = screen.getByTestId("vat");
          const pctInput = screen.getByTestId("pct");
          const commentaryInput = screen.getByTestId("commentary");

          fireEvent.change(typeInput, { target: { value: "Food" } });
          fireEvent.change(nameInput, { target: { value: "Lunch" } });
          fireEvent.change(dateInput, { target: { value: "2024-04-24" } });
          fireEvent.change(amountInput, { target: { value: "50" } });
          fireEvent.change(vatInput, { target: { value: "10" } });
          fireEvent.change(pctInput, { target: { value: "20" } });
          fireEvent.change(commentaryInput, {
            target: { value: "Team lunch" },
          });

          // Crée un objet File simulé
          const testFile = new File([""], "test.png", { type: "image/png" });

          const querySelectorSpy = jest
            .spyOn(document, "querySelector")
            .mockReturnValueOnce({
              files: [testFile],
              dataset: { testid: "file" },
            });

          // Crée une instance de NewBill
          const newBill = new NewBill({
            document,
            onNavigate: jest.fn(),
            store: mockStore,
            localStorage: localStorageMock,
          });

          // Simule la soumission du formulaire
          const form = screen.getByTestId("form-new-bill");
          fireEvent.submit(form);

          // Vérifie les attentes après la soumission du formulaire
          expect(preventDefault).toHaveBeenCalled();
          expect(newBill.store.bills().create).toHaveBeenCalledWith({
            data: expect.any(FormData),
            headers: { noContentType: true },
          });
          expect(newBill.onNavigate).toHaveBeenCalledWith(ROUTES_PATH.Bills);

          querySelectorSpy.mockRestore();
        }
      }, 100);
    });
  });
});
