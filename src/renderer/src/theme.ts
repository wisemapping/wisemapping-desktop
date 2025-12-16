import { createTheme } from '@mui/material/styles';

export const createAppTheme = (mode: 'light' | 'dark') => {
    return createTheme({
        palette: {
            mode,
            primary: {
                light: '#ffb74d',
                main: '#ffa800',
                dark: '#ffcc80',
                contrastText: '#FFFFFF',
            },
            secondary: {
                light: '#a19f9f',
                main: '#5a5a5a',
                dark: '#424242',
                contrastText: '#FFFFFF',
            },
            background: {
                default: mode === 'light' ? '#fafafa' : '#303030', // Editor uses #303030 for dark bg? Checking editor... 
                paper: mode === 'light' ? '#ffffff' : '#424242',
            },
            text: {
                primary: mode === 'light' ? '#333333' : '#ffffff',
                secondary: mode === 'light' ? '#666666' : '#b0b0b0',
            },
        },
        components: {
            MuiButton: {
                styleOverrides: {
                    root: {
                        fontSize: '15px',
                        fontWeight: 600,
                        textTransform: 'none',
                        borderRadius: '9px',
                        padding: '6px 20px',
                    },
                    containedPrimary: {
                        color: '#FFFFFF',
                    }
                },
            },
            MuiOutlinedInput: {
                styleOverrides: {
                    root: {
                        borderRadius: '9px',
                    }
                }
            },
            MuiAppBar: {
                styleOverrides: {
                    root: {
                        backgroundColor: mode === 'light' ? '#ffffff' : '#333333',
                        color: mode === 'light' ? '#333333' : '#ffffff',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                    }
                }
            },
            // Fix Card dark mode
            MuiCard: {
                styleOverrides: {
                    root: {
                        backgroundColor: mode === 'light' ? '#ffffff' : '#424242',
                    }
                }
            }
        },
        typography: {
            fontFamily: ['Figtree', 'Noto Sans JP', 'Helvetica', 'Arial', 'sans-serif'].join(','),
            h4: {
                color: '#ffa800',
                fontWeight: 600,
            },
        },
    });
};

// Default export for backward compatibility if needed, but we should switch to function
// Default export for backward compatibility if needed, but we should switch to function
// export const theme = createAppTheme('light');
