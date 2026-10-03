import { configureStore, createSlice } from '@reduxjs/toolkit'

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, token: null },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload.user
      state.token = action.payload.token
      localStorage.setItem('token', action.payload.token)
    },
    logout: (state) => {
      state.user = null
      state.token = null
      localStorage.removeItem('token')
    },
  },
})

const uiSlice = createSlice({
  name: 'ui',
  initialState: { darkMode: false, loading: false },
  reducers: {
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
  },
})

export const { setUser, logout } = authSlice.actions
export const { toggleDarkMode, setLoading } = uiSlice.actions

const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    ui: uiSlice.reducer,
  },
})

export default store
