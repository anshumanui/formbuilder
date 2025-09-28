import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import GlobalStyle from './assets/GlobalStyle';
import FormBuilder from './pages/FormBuilder/FormBuilder';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* <Provider store={store}> */}
      <GlobalStyle />
      <FormBuilder />
    {/* </Provider> */}
  </StrictMode>,
)
