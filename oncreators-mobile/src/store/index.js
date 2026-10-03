import { configureStore, createSlice } from '@reduxjs/toolkit'

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, token: null },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload.user
      state.token = action.payload.token
    },
    logout: (state) => {
      state.user = null
      state.token = null
    },
  },
})

const walletSlice = createSlice({
  name: 'wallet',
  initialState: { balance: 0 },
  reducers: {
    setBalance: (state, action) => {
      state.balance = action.payload
    },
  },
})

export const { setUser, logout } = authSlice.actions
export const { setBalance } = walletSlice.actions

const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    wallet: walletSlice.reducer,
  },
})

export default store
