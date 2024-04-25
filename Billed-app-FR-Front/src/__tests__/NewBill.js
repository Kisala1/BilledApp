/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from '@testing-library/dom';
import NewBillUI from '../views/NewBillUI.js';
import NewBill from '../containers/NewBill.js';
import { ROUTES, ROUTES_PATH } from '../constants/routes';
import { localStorageMock } from '../__mocks__/localStorage.js';
import mockStore from '../__mocks__/store';
import router from '../app/Router';

jest.mock('../app/store', () => mockStore);

describe('Given I am connected as an employee', () => {
  describe('When I am on NewBill Page', () => {
    test('Then an error message appears when the form is submit', () => {
      document.body.innerHTML = NewBillUI();
      const newBill = new NewBill({
        document,
        onNavigate: jest.fn(),
        store: mockStore,
        localStorage: localStorageMock,
      });

      expect(() => {
        newBill.handleChangeFile({ target: { files: [null] } });
      }).toThrow('A file must be selected.');
    });

    test('handleChangeFile should handle file change correctly', async () => {
      document.body.innerHTML = NewBillUI();
      window.localStorage.setItem(
        'user',
        JSON.stringify({
          type: 'Employee',
        })
      );
      const newBill = new NewBill({
        document,
        onNavigate: jest.fn(),
        store: mockStore,
        localStorage: localStorageMock,
      });
      const handleChangeFileSpy = jest.spyOn(newBill, 'handleChangeFile');

      // Mock store.bills().create method
      const mockCreate = jest.fn().mockResolvedValue({
        fileUrl: 'http://example.com/image.png',
        key: 'billId123',
      });
      newBill.store.bills().create = mockCreate;

      const testFile = new File([''], 'test.png');
      const fileInput = screen.getByTestId('file');

      fireEvent.change(fileInput, { target: { files: [testFile] } });

      await waitFor(() => {
        expect(handleChangeFileSpy).toHaveBeenCalledWith(
          expect.objectContaining({ target: { files: [testFile] } })
        );
        expect(mockCreate).toHaveBeenCalled();
        expect(newBill.fileUrl).toBe('http://example.com/image.png');
        expect(newBill.fileName).toBe('test.png');
        expect(newBill.billId).toBe('billId123');
      });
    });

    test('handleSubmit should update bill and navigate to Bills page', () => {
      const newBill = new NewBill({
        document,
        onNavigate: jest.fn(),
        store: mockStore,
        localStorage: localStorageMock,
      });

      // Fill form fields
      // ...

      // Mock store.bills().update method
      const mockUpdate = jest.fn().mockResolvedValue({});
      newBill.store.bills().update = mockUpdate;
      const submitButton = screen.getByTestId('form-new-bill');
      fireEvent.submit(submitButton);

      expect(mockUpdate).toHaveBeenCalled();
      expect(newBill.onNavigate).toHaveBeenCalledWith(ROUTES_PATH.Bills);
    });
  });

  // test d'intégration POST
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

        await waitFor(() => screen.getByText('Envoyer une note de frais'));
        const labelType = await screen.getByText('Type de dépense');
        expect(labelType).toBeTruthy();
        const labelName = await screen.getByText('Nom de la dépense');
        expect(labelName).toBeTruthy();
        const labelDate = await screen.getByText('Date');
        expect(labelDate).toBeTruthy();
        const labelTTC = await screen.getByText('Montant TTC');
        expect(labelTTC).toBeTruthy();
        const labelTVA = await screen.getByText('TVA');
        expect(labelTVA).toBeTruthy();
        const labelCmt = await screen.getByText('Commentaire');
        expect(labelCmt).toBeTruthy();
        const labelJust = await screen.getByText('Justificatif');
        expect(labelJust).toBeTruthy();

        // Fill the form
        const typeInput = screen.getByTestId('expense-type');
        const nameInput = screen.getByTestId('expense-name');
        const dateInput = screen.getByTestId('datepicker');
        const amountInput = screen.getByTestId('amount');
        const vatInput = screen.getByTestId('vat');
        const pctInput = screen.getByTestId('pct');
        const commentaryInput = screen.getByTestId('commentary');
        const fileInput = screen.getByTestId('file');

        fireEvent.change(typeInput, { target: { value: 'Food' } });
        fireEvent.change(nameInput, { target: { value: 'Lunch' } });
        fireEvent.change(dateInput, { target: { value: '2024-04-24' } });
        fireEvent.change(amountInput, { target: { value: '50' } });
        fireEvent.change(vatInput, { target: { value: '10' } });
        fireEvent.change(pctInput, { target: { value: '20' } });
        fireEvent.change(commentaryInput, { target: { value: 'Team lunch' } });

        const testFile = new File([''], 'test.png', { type: 'image/png' });
        fireEvent.change(fileInput, { target: { files: [testFile] } });

        const form = screen.getByTestId('form-new-bill');
        fireEvent.submit(form);

        // // Mock store.bills().create method
        // const mockCreate = jest.fn().mockResolvedValue({
        //   fileUrl: 'http://example.com/image.png',
        //   key: 'billId123',
        // });
        // const mockStoreInstance = {
        //   bills: jest.fn(() => ({
        //     create: mockCreate,
        //   })),
        // };

        // const newBill = new NewBill({
        //   document,
        //   onNavigate: jest.fn(),
        //   store: mockStoreInstance,
        //   localStorage: localStorageMock,
        // });

        const preventDefault = jest.fn();
        const onNavigate = jest.fn();
        const store = null;
        const newBill = new NewBill({
          document,
          store,
          localStorage,
          onNavigate,
        });
        await newBill.handleSubmit({ preventDefault });
        expect(preventDefault).toHaveBeenCalled(); // Ensure preventDefault was called
        // Verify that create method of store was called with correct data
        expect(newBill.store.bills().create).toHaveBeenCalledWith({
          data: expect.any(FormData),
          headers: { noContentType: true },
        });

        // Ensure that the POST request is sent with correct data
        // await waitFor(() => {
        //   expect(mockCreate).toHaveBeenCalledWith(
        //     expect.objectContaining({
        //       data: expect.any(FormData),
        //       headers: { noContentType: true },
        //     })
        //   );
        // });
        // Assert that the bill is updated and user is navigated to the correct route
        expect(newBill.onNavigate).toHaveBeenCalledWith(ROUTES_PATH.Bills);
      });
    });
  });
});
