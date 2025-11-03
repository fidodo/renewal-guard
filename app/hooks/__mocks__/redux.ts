// utils/__mocks__/redux.ts
import { jest } from "@jest/globals";

export const useAppSelector = jest.fn(() => false);
export const useAppDispatch = () => jest.fn();
