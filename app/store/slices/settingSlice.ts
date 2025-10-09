import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Setting {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsReminders: boolean;
  reminderDays: number[];
  currency: string;
  dateFormat: string;
  dataSharing: boolean;
  phoneNumber: string;
}

export interface SettingState {
  setting: Setting;
  loading: boolean;
  error: string | null;
}

const initialState: SettingState = {
  setting: {
    emailNotifications: true,
    pushNotifications: false, // Default to false for push notifications
    smsReminders: false,
    reminderDays: [1, 2, 3, 7], // Default reminder days
    currency: "USD",
    dateFormat: "MM/DD/YYYY", // Default to current date format
    dataSharing: false,
    phoneNumber: "",
  },
  loading: false,
  error: null,
};

const settingSlice = createSlice({
  name: "setting",
  initialState,
  reducers: {
    updateSetting: (state, action: PayloadAction<Partial<Setting>>) => {
      state.setting = { ...state.setting, ...action.payload };
    },
    resetSetting: () => initialState,
    setSetting: (state, action: PayloadAction<Setting>) => {
      state.setting = action.payload;
    },
    toggleEmailNotifications: (state) => {
      state.setting.emailNotifications = !state.setting.emailNotifications;
    },
    togglePushNotifications: (state) => {
      state.setting.pushNotifications = !state.setting.pushNotifications;
    },
    toggleSmsReminders: (state) => {
      state.setting.smsReminders = !state.setting.smsReminders;
    },
    setReminderDays: (state, action: PayloadAction<number[]>) => {
      state.setting.reminderDays = action.payload;
    },
    setCurrency: (state, action: PayloadAction<string>) => {
      state.setting.currency = action.payload;
    },
    setDateFormat: (state, action: PayloadAction<string>) => {
      state.setting.dateFormat = action.payload;
    },
    toggleDataSharing: (state) => {
      state.setting.dataSharing = !state.setting.dataSharing;
    },
    setPhoneNumber: (state, action: PayloadAction<string>) => {
      state.setting.phoneNumber = action.payload;
    },
  },
});

export const {
  updateSetting,
  resetSetting,
  setSetting,
  toggleEmailNotifications,
  togglePushNotifications,
  toggleSmsReminders,
  setReminderDays,
  setCurrency,
  setDateFormat,
  toggleDataSharing,
  setPhoneNumber,
} = settingSlice.actions;
export default settingSlice.reducer;
