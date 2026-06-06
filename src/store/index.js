import { configureStore } from '@reduxjs/toolkit';
import infoReducer from '@/store/info/infoSlice.js';
import viewReducer from '@/store/view/viewSlice.js';

const store = configureStore({
  reducer: {
    info: infoReducer,
    view: viewReducer,
  },
});

export default store;
