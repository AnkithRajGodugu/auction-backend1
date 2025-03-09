import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    build: {
        outDir: 'dist',
    },
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:5000', // Change to your backend port
                changeOrigin: true,
                secure: false,
            },
            '/uploads': {
                target: 'http://localhost:5000', // Match above
                changeOrigin: true,
                secure: false,
            },
        },
    },
    base: '/',
});