import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
import { ChakraProvider } from "@chakra-ui/react";
import { BrowserRouter } from 'react-router-dom';

//Setup GraphQL Apollo client
const URL_QUERY_GRAPHQL = "http://localhost:4000/graphql";

const client = new ApolloClient({
    uri: URL_QUERY_GRAPHQL,
    cache: new InMemoryCache(),
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <React.StrictMode>
        <ApolloProvider client={client}>
            <ChakraProvider>
                <BrowserRouter>
                    <App />
                </BrowserRouter>
            </ChakraProvider>
        </ApolloProvider>
    </React.StrictMode>
);