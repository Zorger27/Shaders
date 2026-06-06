import { createSlice } from '@reduxjs/toolkit';

const initialState = {currentView: localStorage.getItem('viewMode') || 'normal',};

const viewSlice = createSlice({
  name: 'view',
  initialState,
  reducers: {
    toggleView(state) {
      state.currentView = state.currentView === 'normal' ? 'alternative' : 'normal';
      localStorage.setItem('viewMode', state.currentView);
    },
  },
});

export const { toggleView } = viewSlice.actions;
export default viewSlice.reducer;

// Селекторы (аналог VueX getters)
import footerLogo2 from '@/assets/img/menu2/footer-logo2.svg';
import footerLogo1 from '@/assets/img/menu1/footer-logo1.svg';

import headerLogo2 from '@/assets/img/menu2/header-logo2.svg';
import headerLogo1 from '@/assets/img/menu1/header-logo1.svg';

import headerAbout2 from '@/assets/img/menu2/header-about2.svg';
import headerAbout1 from '@/assets/img/menu1/header-about1.svg';

export const selectFooterLogo = (state) =>
  state.view.currentView === 'normal' ? footerLogo2 : footerLogo1;

export const selectHeaderLogo = (state) =>
  state.view.currentView === 'normal' ? headerLogo2 : headerLogo1;

export const selectHeaderAbout = (state) =>
  state.view.currentView === 'normal' ? headerAbout2 : headerAbout1;
