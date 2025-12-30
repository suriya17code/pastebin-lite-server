import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { Provider } from 'react-redux'
import { store } from './store' 
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'

const theme = createTheme({
    palette: {
        mode: 'dark', // Modern, sleek
        primary: {
            main: '#90caf9',
        },
        secondary: {
            main: '#f48fb1',
        },
    },
    typography: {
        fontFamily: ['Inter', 'Roboto', 'sans-serif'].join(','),
    }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <Provider store={store}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <App />
            </ThemeProvider>
        </Provider>
    </React.StrictMode>,
)
