import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
import { ChakraProvider } from "@chakra-ui/react";
import { BrowserRouter } from 'react-router-dom';
import { Web3Provider } from "./context/Web3Provider";

//Setup GraphQL Apollo client
const URL_QUERY_GRAPHQL = "http://localhost:4000/graphql";

const client = new ApolloClient({
    uri: URL_QUERY_GRAPHQL,
    cache: new InMemoryCache(),
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <React.StrictMode>
        <Web3Provider>
            <ApolloProvider client={client}>
                <ChakraProvider>
                    <BrowserRouter>
                        <App />
                    </BrowserRouter>
                </ChakraProvider>
            </ApolloProvider>
        </Web3Provider>
    </React.StrictMode>
);