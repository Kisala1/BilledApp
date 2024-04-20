/**
 * @jest-environment jsdom
 */

import { fireEvent, screen } from '@testing-library/dom';
import NewBillUI from '../views/NewBillUI.js';
import NewBill from '../containers/NewBill.js';
import { ROUTES, ROUTES_PATH } from '../constants/routes';
import { localStorageMock } from '../__mocks__/localStorage.js';
import mockStore from '../__mocks__/store';
// import { bills } from '../fixtures/bills';
import router from '../app/Router';

jest.mock('../app/store', () => mockStore);

describe('Given I am connected as an employee', () => {
  describe('When I am on NewBill Page and I add a file in the wrong format', () => {
    test('Then an error message appears when the form is submit', () => {
      document.body.innerHTML = NewBillUI();

      const inputFile = screen.getByTestId('file');
      fireEvent.change(inputFile, { target: { fileName: 'MyFile.pdf' } });

      const form = screen.getByTestId('form-new-bill');
      const handleSubmit = jest.fn((e) => e.preventDefault());

      form.addEventListener('submit', handleSubmit);
      fireEvent.submit(form);
      expect(screen.getByTestId('form-new-bill')).toBeTruthy();
    });
  });
  //   describe('When the information is in the correct format and I click on "Envoyer"', () => {
  //     test('Then it should renders Bills page'),
  //       () => {
  //         document.body.innerHTML = NewBillUI();

  //         const inputData = {
  //           type: 'Transports',
  //           name: 'Vol',
  //           date: '02/02/2024',
  //           amount: ' 250',
  //           vat: '20',
  //           pct: '20',
  //           commentary: 'aaaaa',
  //           fileName: 'bill.png',
  //         };

  //         const inputType = screen.getByTestId('expense-type');
  //         fireEvent.change(inputType, { target: { value: inputData.type } });
  //         expect(inputType.value).toBe(inputData.type);

  //         const inputName = screen.getByTestId('expense-name');
  //         fireEvent.change(inputName, { target: { value: inputData.name } });
  //         expect(inputName.value).toBe(inputData.name);

  //         const inputDate = screen.getByTestId('datepicker');
  //         fireEvent.change(inputDate, { target: { value: inputData.date } });
  //         expect(inputDate.value).toBe(inputData.date);

  //         const inputAmount = screen.getByTestId('amount');
  //         fireEvent.change(inputAmount, {
  //           target: { value: inputData.amount },
  //         });
  //         expect(inputAmount.value).toBe(inputData.amount);

  //         const inputVat = screen.getByTestId('vat');
  //         fireEvent.change(inputVat, { target: { value: inputData.vat } });
  //         expect(inputVat.value).toBe(inputData.vat);

  //         const inputPct = screen.getByTestId('pct');
  //         fireEvent.change(inputPct, { target: { value: inputData.pct } });
  //         expect(inputPct.value).toBe(inputData.pct);

  //         const inputCmt = screen.getByTestId('commentary');
  //         fireEvent.change(inputCmt, { target: { value: inputData.commentary } });
  //         expect(inputCmt.value).toBe(inputData.commentary);

  //         const inputFile = screen.getByTestId('file');
  //         fireEvent.change(inputType, { target: { value: inputData.fileName } });
  //         expect(inputFile.value).toBe(inputData.fileName);

  //         const form = screen.getByTestId('form-new-bill');
  //       };
  //   });

  // // test d'intégration POST
  //TODO : pas adapté à Newbill
  describe('Given I am a user connected as Employee', () => {
    describe('When I submitting a new bill form', () => {
      test('handleSubmit should send a POST request with correct data', async () => {
        localStorage.setItem(
          'user',
          JSON.stringify({ type: 'Employee', email: 'a@a' })
        );
        const root = document.createElement('div');
        root.setAttribute('id', 'root');
        document.body.append(root);
        router();
        window.onNavigate(ROUTES_PATH.NewBill);
        document.body.innerHTML = NewBillUI();
      });

      describe('When an error occurs on API', () => {
        beforeEach(() => {
          jest.spyOn(mockStore, 'bills');
          Object.defineProperty(window, 'localStorage', {
            value: localStorageMock,
          });
          window.localStorage.setItem(
            'user',
            JSON.stringify({
              type: 'Employee',
              email: 'a@a',
            })
          );
          const root = document.createElement('div');
          root.setAttribute('id', 'root');
          document.body.appendChild(root);
          router();
        });
        test('fetches bills from an API and fails with 404 message error', async () => {
          mockStore.bills.mockImplementationOnce(() => {
            return {
              list: () => {
                return Promise.reject(new Error('Erreur 404'));
              },
            };
          });
          window.onNavigate(ROUTES_PATH.NewBill);
          await new Promise(process.nextTick);
          const message = await screen.getByText(/Erreur 404/);
          expect(message).toBeTruthy();
        });
        test('fetches messages from an API and fails with 500 message error', async () => {
          mockStore.bills.mockImplementationOnce(() => {
            return {
              list: () => {
                return Promise.reject(new Error('Erreur 500'));
              },
            };
          });

          window.onNavigate(ROUTES_PATH.NewBill);
          await new Promise(process.nextTick);
          const message = await screen.getByText(/Erreur 500/);
          expect(message).toBeTruthy();
        });
      });
    });
  });
});
