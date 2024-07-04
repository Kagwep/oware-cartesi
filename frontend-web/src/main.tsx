import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'  
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
import { BrowserRouter as Router } from "react-router-dom";
import { CssBaseline, ThemeProvider } from "@mui/material";
import theme from "../src/utils/theme";


const URL_QUERY_GRAPHQL = "http://localhost:8080/graphql";

const client = new ApolloClient({
    uri: URL_QUERY_GRAPHQL,
    cache: new InMemoryCache(),
});



ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ApolloProvider client={client}>
    <ThemeProvider theme={theme}>
      <Router>
       <CssBaseline />
          <App />
        </Router>
    </ThemeProvider>
    </ApolloProvider>
  </React.StrictMode>,
)
