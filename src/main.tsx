import { ViteSSG } from 'vite-ssg'
import App, { routes } from './App'
import './index.css'

export const createApp = ViteSSG(App, { routes })