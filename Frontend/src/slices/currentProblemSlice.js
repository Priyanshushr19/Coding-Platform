import { createSlice } from '@reduxjs/toolkit';

const currentProblemSlice = createSlice({
  name: 'currentProblem',
  initialState: {
    problem: null,
    code: '',
    selectedLanguage: 'javascript',
    activeLeftTab: 'description', 
    activeRightTab: 'code'
  },
  reducers: {
    setCurrentProblem: (state, action) => {
      state.problem = action.payload.problem;
      state.code = action.payload.code;
    },
    updateCode: (state, action) => {
      state.code = action.payload;
    },
    setSelectedLanguage: (state, action) => {
      state.selectedLanguage = action.payload;
    },
    setActiveLeftTab: (state, action) => {
      state.activeLeftTab = action.payload;
    },
    setActiveRightTab: (state, action) => {
      state.activeRightTab = action.payload;
    },
    clearCurrentProblem: (state) => {
      state.problem = null;
      state.code = '';
      state.selectedLanguage = 'javascript';
      state.activeLeftTab = 'description';
      state.activeRightTab = 'code';
    }
  }
});

export const {
  setCurrentProblem,
  updateCode,
  setSelectedLanguage,
  setActiveLeftTab,
  setActiveRightTab,
  clearCurrentProblem
} = currentProblemSlice.actions;

export default currentProblemSlice.reducer;